import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/Hushallskampen/' : '/'
  const withBase = (path: string) => `${base}${path.replace(/^\/+/, '')}`

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        manifest: {
          name: 'Hushållskampen',
          short_name: 'Hushållskampen',
          start_url: `${base}login`,
          scope: base,
          display: 'standalone',
          background_color: '#f7f1ee',
          theme_color: '#f7f1ee',
          icons: [
            { src: withBase('PWA/transparent/icon-72x72.png'), sizes: '72x72', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-96x96.png'), sizes: '96x96', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-128x128.png'), sizes: '128x128', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-144x144.png'), sizes: '144x144', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-152x152.png'), sizes: '152x152', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-180x180.png'), sizes: '180x180', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-192x192.png'), sizes: '192x192', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-256x256.png'), sizes: '256x256', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-384x384.png'), sizes: '384x384', type: 'image/png' },
            { src: withBase('PWA/transparent/icon-512x512.png'), sizes: '512x512', type: 'image/png' },
            { src: withBase('PWA/maskable/icon-maskable-192x192.png'), sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: withBase('PWA/maskable/icon-maskable-512x512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
  }
})
