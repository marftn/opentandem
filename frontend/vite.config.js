import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single TTS server loads models per language on demand; language is passed in the path (/tts/<lang>).
const TTS_URL = process.env.TTS_URL || 'http://localhost:8881'

const ttsProxy = {
  '/tts': { target: TTS_URL, changeOrigin: true },
  '/health/text-to-audio': {
    target: TTS_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/health\/text-to-audio/, '/health'),
  },
}

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
