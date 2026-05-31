const OLLAMA_API = '/api/chat';
const KOKORO_API = '/v1/audio/speech';

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

export async function generateSpeech(text, voice = 'pf_dora', langCode = 'p') {
  const response = await fetch(KOKORO_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'kokoro', input: text, voice, lang_code: langCode, response_format: 'mp3' }),
  });
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return URL.createObjectURL(await response.blob());
}

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  const response = await fetch('/stt', { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return (await response.json()).transcript;
}

async function checkServiceHealth(endpoint) {
  try {
    return (await fetch(endpoint)).ok;
  } catch {
    return false;
  }
}

export const checkKokoroHealth = () => checkServiceHealth('/health/text-to-audio');
export const checkSttHealth    = () => checkServiceHealth('/health/audio-to-text');
