// src/services/api.js

const OLLAMA_API = "/api/chat";
const KOKORO_API = "/v1/audio/speech";

/**
 * Send a message array to Ollama API.
 * Uses the default streaming approach if read directly or parses standard JSON if not streaming.
 */
export async function sendChatMessage(messages, model = "gemma4:e2b", onChunk) {
  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        // think: false, // Better results when thinking is activated (default).
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            fullResponse += parsed.message.content;
            if (onChunk) {
              onChunk(fullResponse);
            }
          }
        } catch (e) {
          console.warn("Error parsing JSON chunk from Ollama", line);
        }
      }
    }
    return fullResponse;
  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    throw error;
  }
}

/**
 * Generate audio from text using Kokoro API
 * Returns an audio blob URL.
 */
export async function generateSpeech(text, voice = "pf_dora", lang_code = "p") {
  try {
    const response = await fetch(KOKORO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kokoro",
        input: text,
        voice: voice,
        lang_code: lang_code,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error("Error communicating with Kokoro API:", error);
    throw error;
  }
}

/**
 * Transcribe audio using STT API
 * Returns text transcript.
 */
export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const response = await fetch("/stt", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error("Error communicating with STT API:", error);
    throw error;
  }
}

/**
 * Check if the Kokoro TTS service is healthy
 */
export async function checkKokoroHealth() {
  try {
    const response = await fetch("/health/text-to-audio", { method: "GET" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Check if the STT service is healthy
 */
export async function checkSttHealth() {
  try {
    const response = await fetch("/health/audio-to-text", { method: "GET" });
    return response.ok;
  } catch (error) {
    return false;
  }
}
