import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { html } from './html'

type Bindings = {
  VPSAI_BUCKET: R2Bucket
  AI: any // Cloudflare AI binding
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

// Serve Frontend
app.get('/', (c) => {
  return c.html(html)
})

// Save API Key
app.put('/api/key', async (c) => {
  try {
    const body = await c.req.json()
    const apiKey = body.apiKey

    if (!apiKey) return c.json({ error: 'API Key is required' }, 400)

    await c.env.VPSAI_BUCKET.put('gemini_key.txt', apiKey)
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400)
  }
})

// Check API Key status
app.get('/api/key', async (c) => {
  const keyObj = await c.env.VPSAI_BUCKET.get('gemini_key.txt')
  return c.json({ hasKey: !!keyObj })
})

// --- History & Chat Logic ---

type HistoryEntry = {
  id: string
  title: string
  timestamp: number
}

// Helper to get history index
async function getHistoryIndex(bucket: R2Bucket): Promise<HistoryEntry[]> {
  const indexObj = await bucket.get('chat_history/index.json');
  if (!indexObj) return [];
  try {
    return await indexObj.json() as HistoryEntry[];
  } catch {
    return [];
  }
}

// Helper to save history index
async function saveHistoryIndex(bucket: R2Bucket, index: HistoryEntry[]) {
  await bucket.put('chat_history/index.json', JSON.stringify(index));
}

// --- GitHub Integration ---

// Save GitHub config
app.put('/api/github/config', async (c) => {
  try {
    const body = await c.req.json()
    const { username, token } = body
    if (!username || !token) return c.json({ error: 'Username and Token required' }, 400)

    await c.env.VPSAI_BUCKET.put('github_config.json', JSON.stringify({ username, token }))
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400)
  }
})

// Get GitHub config status
app.get('/api/github/config', async (c) => {
  const configObj = await c.env.VPSAI_BUCKET.get('github_config.json')
  return c.json({ hasConfig: !!configObj })
})

// List Repos
app.get('/api/github/repos', async (c) => {
  const configObj = await c.env.VPSAI_BUCKET.get('github_config.json')
  if (!configObj) return c.json({ error: 'GitHub not configured' }, 401)

  const { username, token } = await configObj.json() as any

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'GIMINI-CF-V3'
      }
    })

    if (!res.ok) throw new Error('Failed to fetch repos')

    const repos = await res.json() as any[]
    return c.json({ repos: repos.map(r => ({ name: r.name, full_name: r.full_name })) })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Analyze Repo
app.post('/api/github/analyze', async (c) => {
  const configObj = await c.env.VPSAI_BUCKET.get('github_config.json')
  if (!configObj) return c.json({ error: 'GitHub not configured' }, 401)
  const { token } = await configObj.json() as any
  const geminiKeyObj = await c.env.VPSAI_BUCKET.get('gemini_key.txt')
  if (!geminiKeyObj) return c.json({ error: 'Gemini Key not configured' }, 401)
  const apiKey = await geminiKeyObj.text()

  const body = await c.req.json() as any
  const { repoName } = body
  let sessionId = body.sessionId

  if (!repoName) return c.json({ error: 'Repo name required' }, 400)

  try {
    // 1. Get Repo Details to find default branch
    const repoDetailsRes = await fetch(`https://api.github.com/repos/${repoName}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
    });

    if (!repoDetailsRes.ok) {
        throw new Error(`Failed to fetch repo details: ${repoDetailsRes.statusText}`);
    }

    const repoDetails: any = await repoDetailsRes.json();
    const defaultBranch = repoDetails.default_branch || 'main';

    // 2. Fetch File Tree (recursive) using detected branch
    const treeRes = await fetch(`https://api.github.com/repos/${repoName}/git/trees/${defaultBranch}?recursive=1`, {
        headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
    });

    if (!treeRes.ok) {
        throw new Error(`Failed to fetch repo tree for branch '${defaultBranch}'`);
    }

    const treeData: any = await treeRes.json();

    // 3. Filter and Fetch Content
    // Limit to text files, ignore lock files, images, etc.
    const files = treeData.tree.filter((f: any) =>
        f.type === 'blob' &&
        !f.path.includes('package-lock.json') &&
        !f.path.includes('yarn.lock') &&
        !f.path.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|ttf|eot)$/) &&
        f.size < 50000 // Skip large files > 50KB to save context
    ).slice(0, 10); // Limit to top 10 relevant files to prevent timeout/context overflow for now

    let codeDump = '';
    for (const file of files) {
        const fileRes = await fetch(file.url, {
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
        });
        const fileData: any = await fileRes.json();
        // Content is base64 encoded
        const content = atob(fileData.content.replace(/\n/g, ''));
        codeDump += `\n--- FILE: ${file.path} ---\n${content}\n`;
    }

    // 4. Send to Gemini
    const prompt = `Analyze the following code from repository ${repoName}. Identify bugs, security issues, and suggest improvements. Provide the output in a structured markdown format. If you identify a specific fix, suggest it.\n\nCode Content:${codeDump}`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`
    const geminiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const aiData: any = await geminiRes.json();
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis failed.";

    // 5. Save to History (CRITICAL FIX)
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Load existing history if any
    let historyMessages: any[] = [];
    const chatObj = await c.env.VPSAI_BUCKET.get(`chat_history/${sessionId}.json`);
    if (chatObj) {
      try {
        historyMessages = await chatObj.json();
      } catch {}
    }

    const userMsgObj = { role: 'user', content: prompt };
    const modelMsgObj = { role: 'model', content: responseText };
    const newMessages = [...historyMessages, userMsgObj, modelMsgObj];

    await c.env.VPSAI_BUCKET.put(`chat_history/${sessionId}.json`, JSON.stringify(newMessages));

    // Update Index
    const index = await getHistoryIndex(c.env.VPSAI_BUCKET);
    const existingEntryIndex = index.findIndex((i) => i.id === sessionId);

    if (existingEntryIndex >= 0) {
        index[existingEntryIndex].timestamp = Date.now();
    } else {
        const title = `Repo Analysis: ${repoName}`;
        const entry = {
            id: sessionId,
            title: title.substring(0, 30) + (title.length > 30 ? '...' : ''),
            timestamp: Date.now()
        };
        index.push(entry);
    }
    await saveHistoryIndex(c.env.VPSAI_BUCKET, index);

    return c.json({ response: responseText, sessionId });

  } catch (e: any) {
    return c.json({ error: `Analysis failed: ${e.message}` }, 500)
  }
})

// Create Pull Request
app.post('/api/github/pr', async (c) => {
    const configObj = await c.env.VPSAI_BUCKET.get('github_config.json')
    if (!configObj) return c.json({ error: 'GitHub not configured' }, 401)
    const { token } = await configObj.json() as any

    const body = await c.req.json() as any
    const { repoName, filePath, content, commitMessage, prTitle, prBody } = body;
    const targetBranch = 'ai-work'; // Always use single persistent branch

    if (!repoName || !filePath || !content || !commitMessage) {
        return c.json({ error: 'Missing required PR fields' }, 400);
    }

    try {
        // 1. Get default branch SHA
        const repoRes = await fetch(`https://api.github.com/repos/${repoName}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
        });
        const repoData: any = await repoRes.json();
        const defaultBranch = repoData.default_branch;

        const refRes = await fetch(`https://api.github.com/repos/${repoName}/git/ref/heads/${defaultBranch}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
        });
        const refData: any = await refRes.json();
        const sha = refData.object.sha;

        // 2. Check or Create 'ai-work' branch
        const checkBranchRes = await fetch(`https://api.github.com/repos/${repoName}/git/ref/heads/${targetBranch}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
        });

        if (checkBranchRes.status === 404) {
             // Create it
            const createBranchRes = await fetch(`https://api.github.com/repos/${repoName}/git/refs`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ref: `refs/heads/${targetBranch}`,
                    sha: sha
                })
            });
            if (!createBranchRes.ok) throw new Error('Failed to create ai-work branch');
        }

        // 3. Get File SHA (if exists) from 'ai-work' branch for update
        let fileSha = undefined;
        const fileCheckRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${filePath}?ref=${targetBranch}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
        });
        if (fileCheckRes.ok) {
            const fileData: any = await fileCheckRes.json();
            fileSha = fileData.sha;
        }

        // 4. Update File Content (Commit)
        const updateRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${filePath}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: commitMessage,
                content: btoa(content), // Base64 encode
                branch: targetBranch,
                sha: fileSha
            })
        });

        if (!updateRes.ok) {
             const err = await updateRes.text();
             throw new Error(`Failed to commit file: ${err}`);
        }

        // 5. Check if PR already exists
        const owner = repoName.split('/')[0];
        const checkPrRes = await fetch(`https://api.github.com/repos/${repoName}/pulls?head=${owner}:${targetBranch}&base=${defaultBranch}&state=open`, {
             headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3' }
        });
        const existingPrs: any = await checkPrRes.json();

        if (existingPrs.length > 0) {
            return c.json({ success: true, prUrl: existingPrs[0].html_url, message: 'Updated existing PR' });
        }

        // 6. Create PR (if not exists)
        const prRes = await fetch(`https://api.github.com/repos/${repoName}/pulls`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'GIMINI-CF-V3', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: prTitle || commitMessage,
                body: prBody || 'Automated fix suggested by AI.',
                head: targetBranch,
                base: defaultBranch
            })
        });

        if (!prRes.ok) {
             const err = await prRes.text();
             throw new Error(`Failed to create PR: ${err}`);
        }

        const prData: any = await prRes.json();
        return c.json({ success: true, prUrl: prData.html_url });

    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Get list of chats
app.get('/api/history', async (c) => {
  const history = await getHistoryIndex(c.env.VPSAI_BUCKET);
  history.sort((a, b) => b.timestamp - a.timestamp);
  return c.json({ history });
})

// Delete a chat session
app.delete('/api/history/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.VPSAI_BUCKET.delete(`chat_history/${id}.json`);
  const index = await getHistoryIndex(c.env.VPSAI_BUCKET);
  const newIndex = index.filter(item => item.id !== id);
  await saveHistoryIndex(c.env.VPSAI_BUCKET, newIndex);
  return c.json({ success: true });
})

// Get specific chat messages
app.get('/api/history/:id', async (c) => {
  const id = c.req.param('id');
  const chatObj = await c.env.VPSAI_BUCKET.get(`chat_history/${id}.json`);
  if (!chatObj) return c.json({ messages: [] });
  try {
    const messages = await chatObj.json();
    return c.json({ messages });
  } catch {
    return c.json({ messages: [] });
  }
})

// Helper to run image generation
async function generateImage(ai: any, prompt: string): Promise<string | null> {
    try {
        const inputs = { prompt };
        const response = await ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);

        // Response is a ReadableStream or ArrayBuffer usually
        // Convert to base64
        const arrayBuffer = await new Response(response).arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    } catch (e) {
        console.error("Image gen error:", e);
        return null;
    }
}

// Chat Endpoint
app.post('/api/chat', async (c) => {
  const keyObj = await c.env.VPSAI_BUCKET.get('gemini_key.txt')
  if (!keyObj) {
    return c.json({ error: 'API Key not set. Please configure it in settings.' }, 401)
  }

  const apiKey = await keyObj.text()
  let body;
  try {
    body = await c.req.json()
  } catch(e) {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const message = body.message
  const image = body.image
  const model = body.model || 'gemini-3-flash-preview'
  const saveHistory = body.saveHistory !== false; // Default true
  let sessionId = body.sessionId;
  let historyMessages: any[] = [];

  if (sessionId && saveHistory) {
    const chatObj = await c.env.VPSAI_BUCKET.get(`chat_history/${sessionId}.json`);
    if (chatObj) {
      try {
        historyMessages = await chatObj.json();
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }

  // 1. Generate AI Response
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const contents = historyMessages.map((msg: any) => {
    const parts: any[] = [{ text: msg.content }];
    if (msg.image) {
        parts.push({
            inline_data: {
                mime_type: msg.image.mimeType,
                data: msg.image.data
            }
        });
    }
    return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: parts
    };
  });

  const currentParts: any[] = [{ text: message }];
  if (image) {
      currentParts.push({
          inline_data: {
              mime_type: image.mimeType,
              data: image.data
          }
      });
  }

  contents.push({ role: 'user', parts: currentParts });

  try {
    const requestBody: any = { contents };
    // Enhanced System Instruction for "Jules-like" behavior
    const systemPrompt = `You are an autonomous senior software engineer AI (like Jules). You operate in TWO strict modes:

**MODE 1: DISCUSSION (DEFAULT)**
- Deeply analyze requests, discuss solutions, and provide code snippets in markdown.
- **Do NOT** generate \`github_pr\` JSON actions.
- If the user wants to apply changes, ask: "Should I enter Execution Mode to apply this?"

**MODE 2: EXECUTION**
- Activated ONLY by explicit command (e.g., "Masuk ke mode eksekusi", "Apply changes").
- **Step 1: Plan & Preview**: Explain the plan and show the code. Ask for explicit confirmation (e.g., "Please confirm: 'Ya, terapkan'").
- **Step 2: Action**: ONLY after explicit confirmation ("Ya, terapkan"), generate the \`github_pr\` JSON action.

**WORKFLOW (When in Execution Mode):**
1. **DEEP ANALYSIS**: Analyze the request and code context. Identify bugs/features.
2. **SELF-CORRECTION**: Reflect on the plan. "Did I miss anything? Is this secure?"
3. **EXECUTION**: Write the complete, corrected code.
4. **RESPONSE FORMAT**:
    - A detailed "Log Perubahan" (Change Log) in Markdown explaining EXACTLY what you fixed and why.
    - A "Review Image" action: Trigger a visual summary using \`dalle.text2im\` (e.g., "A futuristic dashboard showing successful code deployment").
    - The Code Fix action: Use \`github_pr\` to propose the changes (ONLY IF CONFIRMED).

**JSON ACTION FORMATS (Use EXACTLY):**

To generate an image:
\`\`\`json
{"action": "dalle.text2im", "action_input": "<creative_prompt_for_visual_review>"}
\`\`\`

To propose a code fix (Pull Request):
\`\`\`json
{"action": "github_pr", "action_input": { "repoName": "<owner/repo>", "filePath": "<path/to/file>", "content": "<FULL_FILE_CONTENT>", "commitMessage": "<descriptive_message>", "prTitle": "<title>", "prBody": "<description>" } }
\`\`\`

**IMPORTANT**: You can output MULTIPLE JSON blocks in one response. For example, output the text log first, then the image JSON, then the PR JSON. Ensure the 'content' in github_pr is the FULL file content, not a diff.`;

    requestBody.system_instruction = {
        parts: [{ text: systemPrompt }]
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      return c.json({ error: `Gemini API Error: ${errorText}` }, geminiResponse.status as any)
    }

    const data: any = await geminiResponse.json()
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found."

    // --- Enhanced Parsing for Multiple Actions ---

    let generatedImageData = null;
    let finalResponseText = aiText;

    // Regex to capture all JSON blocks
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    let match;
    const actions = [];

    // Extract all JSON blocks
    while ((match = jsonRegex.exec(aiText)) !== null) {
        try {
            const parsed = JSON.parse(match[1]);
            actions.push(parsed);
        } catch (e) {
            // Ignore invalid JSON blocks
        }
    }

    // Also attempt raw JSON if no blocks found but text looks like JSON (legacy fallback)
    if (actions.length === 0) {
        try {
             if (aiText.trim().startsWith('{')) {
                 actions.push(JSON.parse(aiText));
             }
        } catch {}
    }

    // Process Actions
    for (const action of actions) {
        // 1. Image Generation
        if (action.action === 'dalle.text2im') {
            let prompt = '';
            if (typeof action.action_input === 'string') {
                try {
                    const inputObj = JSON.parse(action.action_input);
                    prompt = inputObj.prompt;
                } catch {
                    prompt = action.action_input;
                }
            } else if (action.action_input?.prompt) {
                prompt = action.action_input.prompt;
            } else {
                prompt = String(action.action_input);
            }

            if (prompt) {
                const base64Img = await generateImage(c.env.AI, prompt);
                if (base64Img) {
                    generatedImageData = {
                        mimeType: 'image/png',
                        data: base64Img
                    };
                }
            }
        }
        // 2. PR Proposal - processed by frontend, but we need to ensure the text passed to frontend
        // keeps the JSON or handles it. The frontend `processModelMessage` extracts `github_pr` from content.
        // So we keep `finalResponseText` as `aiText`.
    }

    // 2. Save to History
    if (saveHistory) {
        if (!sessionId) {
          sessionId = crypto.randomUUID();
        }

        const userMsgObj: any = { role: 'user', content: message };
        if (image) {
            userMsgObj.image = image;
        }

        const modelMsgObj: any = { role: 'model', content: finalResponseText };
        if (generatedImageData) {
            modelMsgObj.image = generatedImageData;
        }

        const newMessages = [...historyMessages, userMsgObj, modelMsgObj];

        await c.env.VPSAI_BUCKET.put(`chat_history/${sessionId}.json`, JSON.stringify(newMessages));

        const index = await getHistoryIndex(c.env.VPSAI_BUCKET);
        const existingEntryIndex = index.findIndex((i) => i.id === sessionId);

        if (existingEntryIndex >= 0) {
            index[existingEntryIndex].timestamp = Date.now();
        } else {
            const entry = {
                id: sessionId,
                title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
                timestamp: Date.now()
            };
            index.push(entry);
        }

        await saveHistoryIndex(c.env.VPSAI_BUCKET, index);
    }

    return c.json({
        response: finalResponseText,
        sessionId,
        generatedImage: generatedImageData
    })

  } catch (err: any) {
    return c.json({ error: `Server Error: ${err.message}` }, 500)
  }
})

export default app
