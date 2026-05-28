import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      '/v1/audio': {
        target: process.env.KOKORO_URL || 'http://localhost:8880',
        changeOrigin: true
      },
      '/stt': {
        target: process.env.STT_URL || 'http://localhost:8000',
        changeOrigin: true
      },
      '/health/text-to-audio': {
        target: process.env.KOKORO_URL || 'http://localhost:8880',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health\/text-to-audio/, '/health')
      },
      '/health/audio-to-text': {
        target: process.env.STT_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health\/audio-to-text/, '/health')
      }
    }
  }
})
