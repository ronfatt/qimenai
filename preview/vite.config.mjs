import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom', 'lucide-react'] },
  // The shared UI uses plain CSS; do not load the Sites PostCSS config.
  css: { postcss: { plugins: [] } },
  build: { outDir: 'dist', emptyOutDir: true },
});
