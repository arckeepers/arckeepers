import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for assets so the build works on GitHub Pages and local file:// testing
  base: './',
  server: {
    proxy: {
      // Proxy API requests to MetaForge to avoid CORS issues in development
      '/api/metaforge': {
        target: 'https://metaforge.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/metaforge/, '/api'),
      },
    },
  },
})
