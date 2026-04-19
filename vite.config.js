import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/generate-excuses': 'http://localhost:3001',
      '/generate-story': 'http://localhost:3001',
    }
  }
})
