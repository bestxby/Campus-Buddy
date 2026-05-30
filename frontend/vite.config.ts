/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    base: '/Campus-Buddy/', // Ensures assets load correctly on GitHub Pages
    esbuild: mode === 'production' ? {
      drop: ['console', 'debugger'],
    } : undefined,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
      dedupe: ['vue', 'pinia'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [resolve(__dirname, 'src/test/setup.ts')],
      pool: 'threads',
      threads: {
        singleThread: true,
      },
    },
    build: {
      // ✅ OPTIMIZED: Split d3 (~500KB) into its own vendor chunk.
      // Browsers can cache d3 independently; only app code changes on each deploy.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          preview: resolve(__dirname, 'loader-preview.html'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/d3')) {
              return 'd3-vendor';
            }
            if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/@vue')) {
              return 'vue-vendor';
            }
          },
        },
      },
    },
  };
});

