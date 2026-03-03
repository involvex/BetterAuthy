import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'vite';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';
// @ts-ignore
import { RuntimeCaching } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

const KEY = join(__dirname, '/.cert/privkey.pem');
const CERT = join(__dirname, '/.cert/cert.pem');

let https;
if (existsSync(KEY) && existsSync(CERT)) {
  https = {
    key: readFileSync('.cert/privkey.pem'),
    cert: readFileSync('.cert/cert.pem'),
  };
}

const manifest: Partial<ManifestOptions> = {
  theme_color: '#2c2155',
  background_color: '#051524',
  display: 'standalone',
  start_url: '/betterauthy/',
  id: 'com.involvex.betterauthy',
  name: 'BetterAuthy',
  short_name: 'BetterAuthy',
  description: 'BetterAuthy is a 2FA app built using React and Firebase. Data is stored offline and encrypted at rest.',
  orientation: 'any',
  icons: [
    {
      src: './logos/logo.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
    {
      src: './logos/logo-rounded.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: './logos/logo-monochrome.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'monochrome',
    },
  ],
  screenshots: [
    {
      src: './screenshots/screenshot-tall-1.png',
      sizes: '1059x2235',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Lock Screen',
    },
    {
      src: './screenshots/screenshot-tall-2.png',
      sizes: '1059x2235',
      type: 'image/png',
      form_factor: 'narrow',
      label: '2FA Codes',
    },
    {
      src: './screenshots/screenshot-wide-1.png',
      sizes: '2360x1640',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Lock Screen',
    },
    {
      src: './screenshots/screenshot-wide-2.png',
      sizes: '2360x1640',
      type: 'image/png',
      form_factor: 'wide',
      label: '2FA Codes',
    },
  ],
};

// Configuration to cache google fonts
const runtimeCaching: RuntimeCaching[] = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'gstatic-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
];

export default defineConfig({
  base: '/betterauthy/',
  build: {
    modulePreload: {
      resolveDependencies: (url, deps, context) => {
        return [];
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/')) {
            if (id.includes('@firebase')) return 'firebase';
            if (id.includes('@metamask') || id.includes('lodash')) return 'metamask';
            if (id.includes('@yudiel/react-qr-scanner')) return 'qr-scanner';
            if (id.includes('simple-icons')) return 'simple-icons';
            return 'vendor';
          }

          return 'index';
        },
      },
    },
    sourcemap: true,
  },
  define: {
    __BUILD_TIME__: new Date(),
  },
  server: {
    host: true,
    https,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      workbox: {
        // cache all imports
        globPatterns: ['**/*'],
        maximumFileSizeToCacheInBytes: 10 * 1000 * 1000, // 10mb
        runtimeCaching,
      },
      // cache static assets in the public folder
      includeAssets: ['**/*'],
      // add web manifest
      manifest,
      devOptions: {
        // Enable to have service worker/manifest in dev mode
        // enabled: true,
      },
    }),
  ],
});
