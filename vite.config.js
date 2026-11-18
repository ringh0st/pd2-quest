import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { ownerTags } from './scripts/ownerTags.mjs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));
// Name, address and wording live in site.json (one place to rename the app or move it to a new domain)
const site = JSON.parse(readFileSync('./site.json', 'utf8'));
const SITE_URL = site.url.endsWith('/') ? site.url : `${site.url}/`;

/** Fills the page head: name, canonical address, link previews and structured data for search engines. */
function siteHead() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: SITE_URL, description: site.tagline },
    { '@context': 'https://schema.org', '@type': 'Organization', name: site.studio, url: SITE_URL, logo: `${SITE_URL}icon-512.png` },
  ];
  const tags = [
    `<link rel="canonical" href="${SITE_URL}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${site.name}" />`,
    `<meta property="og:title" content="${site.name}: ${site.tagline}" />`,
    `<meta property="og:description" content="Free, bite-size lessons, key terms explained simply, practice questions with explanations and mock exams for Salesforce certification exams. No account." />`,
    `<meta property="og:url" content="${SITE_URL}" />`,
    `<meta property="og:image" content="${SITE_URL}og.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`),
    ...ownerTags(site),
  ].join('\n    ');
  return {
    name: 'site-head',
    transformIndexHtml: (html) => html
      .replace('<!--seo-head-->', tags)
      .replaceAll('%SITE_NAME%', site.name).replaceAll('%SITE_TAGLINE%', site.tagline)
      .replace('%WORDMARK_A%', site.wordmark[0]).replace('%WORDMARK_B%', site.wordmark[1]),
  };
}

// Relative base so the build works on GitHub Pages under /<repo>/.
export default defineConfig({
  base: './',
  // es2022: the content loader waits for the chosen exam's files at the top level (src/data/index.js)
  build: { chunkSizeWarningLimit: 1000, target: 'es2022' },
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(version) },
  plugins: [
    react(),
    siteHead(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // registered in src/lib/updates.js (update during the splash, else a banner)
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: `${site.name}: Salesforce certification prep`,
        short_name: site.name,
        description: `${site.tagline}.`,
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
        // The study site (scripts/build-site.mjs) is plain pages next to the app: let them load, don't show the app instead
        navigateFallbackDenylist: [/\/(guides|about|privacy|terms)\//, /\/(sitemap\.xml|robots\.txt|og\.png)$/],
      },
    }),
  ],
});
