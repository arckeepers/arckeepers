import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import * as fs from 'fs'
import * as path from 'path'

// Custom plugin to allow writing files from the dev tools UI
function devWritePlugin(): Plugin {
  return {
    name: 'dev-write-plugin',
    configureServer(server) {
      server.middlewares.use('/__dev/write-keeplists', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        for await (const chunk of req) {
          body += chunk
        }

        try {
          const { content } = JSON.parse(body)
          const filePath = path.join(process.cwd(), 'src/data/systemKeeplists.ts')
          fs.writeFileSync(filePath, content, 'utf-8')
          res.statusCode = 200
          res.end('OK')
        } catch (err) {
          res.statusCode = 500
          res.end(err instanceof Error ? err.message : 'Failed to write file')
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devWritePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['arc.svg'],
      manifest: {
        name: 'Arc Keepers',
        short_name: 'Arc Keepers',
        description: 'ARC Raiders loot tracker - track items needed for crafting, quests, and upgrades',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.metaforge\.app\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'metaforge-images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
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
