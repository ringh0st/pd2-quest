import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

// Relative base so the build works on GitHub Pages under /<repo>/.
export default defineConfig({
  base: './',
  // es2022: the content loader waits for the chosen exam's files at the top level (src/data/index.js)
  build: { chunkSizeWarningLimit: 1000, target: 'es2022' },
  worker: { format: 'es' }, // the natural-voice worker (lib/tts/kokoroWorker.js) is a module worker
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // registered in src/lib/updates.js (update during the splash, else a banner)
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Dev Quest: Salesforce certification prep',
        short_name: 'Dev Quest',
        description: 'Bite-sized, ADHD-friendly prep for Salesforce certification exams.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#161412',
        theme_color: '#161412',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The natural voice's engine is big and optional: not installed with the app, but kept once it's used.
        globIgnores: ['**/kokoroWorker-*.js', '**/*.wasm'],
        runtimeCaching: [{
          urlPattern: /\/assets\/(kokoroWorker-.*\.js|ort-wasm.*\.(mjs|wasm))$/,
          handler: 'CacheFirst',
          options: { cacheName: 'natural-voice-engine', expiration: { maxEntries: 6 } },
        }],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
