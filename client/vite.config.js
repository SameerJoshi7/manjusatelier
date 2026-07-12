import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            injectRegister: 'auto',
            includeAssets: ['favicon.png', 'favicon.svg', 'logo-256.png'],
            manifest: {
                name: "Manju's Atelier — Handmade Crafts",
                short_name: "Manju's Atelier",
                description: 'Premium handmade crafts — resin art, wall decor and personalised gifts. Handcrafted with love, made to last.',
                theme_color: '#8B5E3C',
                background_color: '#FFF8F2',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                categories: ['shopping', 'lifestyle'],
                icons: [
                    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    {
                        src: '/maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                // Never let the SW serve/cache API calls or the dev server.
                navigateFallbackDenylist: [/^\/api/],
                runtimeCaching: [
                    {
                        // App shell / navigations: network-first so new deploys show quickly.
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.mode === 'navigate';
                        },
                        handler: 'NetworkFirst',
                        options: { cacheName: 'pages', networkTimeoutSeconds: 3 },
                    },
                    {
                        // Product & placeholder images from our API — cache for offline.
                        urlPattern: function (_a) {
                            var url = _a.url;
                            return url.pathname.startsWith('/api/placeholder');
                        },
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'placeholder-images',
                            expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                    {
                        // Google Fonts.
                        urlPattern: function (_a) {
                            var url = _a.url;
                            return url.origin === 'https://fonts.googleapis.com' ||
                                url.origin === 'https://fonts.gstatic.com';
                        },
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    // `vite preview` serves the production build (with the PWA service worker).
    preview: {
        port: 4173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    build: {
        target: 'es2020',
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    motion: ['framer-motion'],
                },
            },
        },
    },
});
