import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { html } from './html'

type Bindings = {
  VPSAI_BUCKET: R2Bucket
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

// Get list of chats
app.get('/api/history', async (c) => {
  const history = await getHistoryIndex(c.env.VPSAI_BUCKET);
  // Sort by timestamp desc
  history.sort((a, b) => b.timestamp - a.timestamp);
  return c.json({ history });
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
  const model = body.model || 'gemini-1.5-flash'
  let sessionId = body.sessionId;
  let historyMessages: any[] = []; // Explicitly typed array

  // If sessionId exists, load history first
  if (sessionId) {
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

  // Construct Gemini request with context
  // Gemini expects: contents: [{ role: 'user', parts: [...] }, { role: 'model', parts: [...] }]
  const contents = historyMessages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add current message to context sent to AI
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      return c.json({ error: `Gemini API Error: ${errorText}` }, geminiResponse.status as any)
    }

    const data: any = await geminiResponse.json()
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found."

    // 2. Save to History
    let isNew = false;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      isNew = true;
    }

    // Update messages array to save to R2
    const newMessages = [...historyMessages, { role: 'user', content: message }, { role: 'model', content: aiText }];

    // Save conversation to R2
    await c.env.VPSAI_BUCKET.put(`chat_history/${sessionId}.json`, JSON.stringify(newMessages));

    // Update Index if new or just to update timestamp
    const index = await getHistoryIndex(c.env.VPSAI_BUCKET);
    const existingEntryIndex = index.findIndex((i) => i.id === sessionId);

    if (existingEntryIndex >= 0) {
        // Update timestamp
        index[existingEntryIndex].timestamp = Date.now();
    } else {
        // Create new entry
        const entry = {
          id: sessionId,
          title: message.substring(0, 30) + (message.length > 30 ? '...' : ''), // Simple title
          timestamp: Date.now()
        };
        index.push(entry);
    }

    await saveHistoryIndex(c.env.VPSAI_BUCKET, index);

    return c.json({ response: aiText, sessionId })

  } catch (err: any) {
    return c.json({ error: `Server Error: ${err.message}` }, 500)
  }
})

export default app
