import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chat': {
        target: process.env.OLLAMA_URL || 'http://localhost:11434',
        changeOrigin: true
      },
      '/v1/audio': {
        target: process.env.KOKORO_URL || 'http://localhost:8880',
        changeOrigin: true
      }
    }
  }
})
