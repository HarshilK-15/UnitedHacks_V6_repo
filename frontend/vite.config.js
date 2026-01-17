import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Parallel - Decision Making Social Platform',
        short_name: 'Parallel',
        description: 'Post binary choices, vote on decisions, compete on leaderboards',
        theme_color: '#FF6B6B',
        background_color: '#000000',
        display: 'standalone'
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
