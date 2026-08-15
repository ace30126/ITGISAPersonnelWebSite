import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// @types/node 를 넣지 않으려고 최소 선언만 둔다.
// 팬아웃 중에 npm install 을 다시 돌리면 다른 에이전트의 node_modules 를 흔든다.
declare const process: { env: Record<string, string | undefined> };

// GitHub Pages 서브경로 배포. 저장소 이름이 바뀌면 여기만 고친다.
const BASE = process.env.GISA_BASE ?? '/gisa-study/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '정보처리기사 필기',
        short_name: '정처기',
        description: '기출 1,243문항 · 개념 · 모의고사',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 암호화 샤드는 용량이 커서 프리캐시하지 않는다. 런타임에 받은 것만 캐시.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/enc\/.*\.enc$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gisa-shards',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: [],
  },
} as never);
