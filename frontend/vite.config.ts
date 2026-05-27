/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: '/Campus-Buddy/', // Ensures assets load correctly on GitHub Pages
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    // ✅ OPTIMIZED: Split d3 (~500KB) into its own vendor chunk.
    // Browsers can cache d3 independently; only app code changes on each deploy.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/d3')) {
            return 'd3-vendor';
          }
        },
      },
    },
  },
});

