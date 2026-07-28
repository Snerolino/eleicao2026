import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Portal Transparência Eleitoral RS',
        short_name: 'Eleições RS',
        description: 'Dossiês de candidatos às eleições 2026 no Rio Grande do Sul — com transparência de fontes.',
        theme_color: '#2B4C3F',
        background_color: '#F5F6F1',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: '/offline.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\/rest\/v1\/candidates/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-candidates',
            },
          },
          {
            urlPattern: /\/rest\/v1\/claims/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-claims',
              expiration: { maxAgeSeconds: 300 },
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    if (!response.ok) return null;
                    const cloned = response.clone();
                    const data = await cloned.json();
                    return new Response(JSON.stringify({
                      ...data,
                      _sw_cached_at: Date.now()
                    }), {
                      headers: response.headers
                    });
                  }
                }
              ],
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});