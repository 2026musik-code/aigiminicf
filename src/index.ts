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

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      return c.json({ error: `Gemini API Error: ${errorText}` }, geminiResponse.status as any)
    }

    const data: any = await geminiResponse.json()
    // Extract text from Gemini response structure
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found."

    return c.json({ response: aiText })

  } catch (err: any) {
    return c.json({ error: `Server Error: ${err.message}` }, 500)
  }
})

export default app
