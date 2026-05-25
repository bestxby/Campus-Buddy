import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './', // Ensures assets are loaded correctly on GitHub Pages
});
