import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: './',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist'
  }
});
