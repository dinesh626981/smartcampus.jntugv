import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',           // Must be '/' for Vercel — './' breaks sub-route asset loading
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  build: {
    sourcemap: false,  // Keep bundle small in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  }
})
