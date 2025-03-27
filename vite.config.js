import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [vue(), topLevelAwait()],
  base: './',
  server: { port: 7000 }
})
