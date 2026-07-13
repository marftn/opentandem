// OpenAI-compatible chat endpoint. The proxy (vite.config.js) points this at Ollama by
// default, or an external provider when LLM_URL/LLM_API_KEY are set, injecting the token server-side.
const CHAT_API = '/v1/chat/completions';

// Streams a chat completion (OpenAI SSE format), calling onChunk with the accumulated text on each token.
export async function sendChatMessage(messages, model = 'gemma4:e2b', onChunk, reasoningEffort = 'low') {
  const response = await fetch(CHAT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true, reasoning_effort: reasoningEffort }),
  });

  if (!response.ok) throw new Error(`HTTP error ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Keep the last (possibly partial) line in the buffer until the next read.
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          onChunk?.(fullResponse);
        }
      } catch {
        // Partial or malformed chunk — skip
      }
    }
  }
  return fullResponse;
}

// Builds the Pocket TTS URL for a phrase. Feeding this straight to <audio> lets the
// browser stream the WAV and start playing on the first bytes instead of buffering it all.
export function generateSpeech(text, voice = 'rafael', lang = 'pt') {
  const params = new URLSearchParams({ text, voice_url: voice });
  return `/tts/${lang}?${params}`;
}

// Sends a recorded audio blob to the STT endpoint and returns the transcript string.
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  const response = await fetch('/stt', { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return (await response.json()).transcript;
}

// Returns true if the given health endpoint responds with a 2xx status.
async function checkServiceHealth(endpoint) {
  try {
    return (await fetch(endpoint)).ok;
  } catch {
    return false;
  }
}

export const checkTtsHealth = (lang) => checkServiceHealth(`/health/text-to-audio/${lang}`);
export const checkSttHealth = () => checkServiceHealth('/health/audio-to-text');
