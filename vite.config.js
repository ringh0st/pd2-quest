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
        // The natural voice's clips (audio/, recorded ahead by scripts/make-voice-audio.mjs) aren't installed
        // with the app: each streams when its button is tapped. Its list of clips is kept up to date.
        runtimeCaching: [{
          urlPattern: /\/audio\/index\.json$/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'natural-voice-list' },
        }],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
