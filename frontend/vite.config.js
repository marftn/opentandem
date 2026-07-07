import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pocket TTS runs one server per language (no per-request language switching), so each
// language gets its own proxy target, reached via /tts/<lang> and /health/text-to-audio/<lang>.
const TTS_URLS = {
  pt: process.env.TTS_PT_URL || 'http://localhost:8881',
  es: process.env.TTS_ES_URL || 'http://localhost:8882',
  it: process.env.TTS_IT_URL || 'http://localhost:8883',
}

const ttsProxy = Object.fromEntries(
  Object.entries(TTS_URLS).flatMap(([lang, target]) => [
    [`/tts/${lang}`, { target, changeOrigin: true, rewrite: (path) => path.replace(`/tts/${lang}`, '/tts') }],
    [`/health/text-to-audio/${lang}`, { target, changeOrigin: true, rewrite: (path) => path.replace(`/health/text-to-audio/${lang}`, '/health') }],
  ])
)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.HOST || '127.0.0.1',
    proxy: {
      '/api/chat': {
        target: process.env.OLLAMA_URL || 'http://localhost:11434',
        changeOrigin: true
      },
      ...ttsProxy,
      '/stt': {
        target: process.env.STT_URL || 'http://localhost:8000',
        changeOrigin: true
      },
      '/health/audio-to-text': {
        target: process.env.STT_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health\/audio-to-text/, '/health')
      }
    }
  }
})
