import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../src/index'

// Simple in-memory storage for mock R2
const storage = new Map<string, string>();

const mockBucket = {
  get: async (key: string) => {
    const val = storage.get(key);
    if (!val) return null;
    return {
      text: async () => val
    }
  },
  put: async (key: string, val: string) => {
    storage.set(key, val);
  }
} as unknown as R2Bucket;

global.fetch = vi.fn();

describe('Worker Logic', () => {
  beforeEach(() => {
    storage.clear();
    vi.resetAllMocks();
  });

  it('GET / should return HTML', async () => {
    const res = await app.request('/', {}, { VPSAI_BUCKET: mockBucket });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<!DOCTYPE html>');
  });

  it('PUT /api/key should save the key', async () => {
    const res = await app.request('/api/key', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: 'secret-123' })
    }, { VPSAI_BUCKET: mockBucket });

    expect(res.status).toBe(200);
    expect(storage.get('gemini_key.txt')).toBe('secret-123');
  });

  it('GET /api/key should return false if no key', async () => {
    const res = await app.request('/api/key', {}, { VPSAI_BUCKET: mockBucket });
    const data = await res.json();
    expect(data.hasKey).toBe(false);
  });

  it('POST /api/chat should fail without key', async () => {
    const res = await app.request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    }, { VPSAI_BUCKET: mockBucket });

    expect(res.status).toBe(401);
  });

  it('POST /api/chat should call Gemini API', async () => {
    // Setup Key
    storage.set('gemini_key.txt', 'valid-key');

    // Mock Fetch Response
    const mockGeminiResponse = {
      candidates: [{
        content: {
          parts: [{ text: 'I am AI.' }]
        }
      }]
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse
    });

    const res = await app.request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Who are you?' })
    }, { VPSAI_BUCKET: mockBucket });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.response).toBe('I am AI.');

    expect(global.fetch).toHaveBeenCalled();
  });
});
