const OLLAMA_API = '/api/chat';

// Streams a chat completion from Ollama, calling onChunk with the accumulated text on each token.
export async function sendChatMessage(messages, model = 'gemma4:e2b', onChunk) {
  const response = await fetch(OLLAMA_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!response.ok) throw new Error(`HTTP error ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split('\n').filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          fullResponse += parsed.message.content;
          onChunk?.(fullResponse);
        }
      } catch {
        // Partial or malformed chunk — skip
      }
    }
  }
  return fullResponse;
}

// Synthesizes speech via Pocket TTS (one server per language) and returns a blob URL ready for playback.
export async function generateSpeech(text, voice = 'rafael', lang = 'pt') {
  const body = new FormData();
  body.append('text', text);
  body.append('voice_url', voice);
  const response = await fetch(`/tts/${lang}`, { method: 'POST', body });
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return URL.createObjectURL(await response.blob());
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
