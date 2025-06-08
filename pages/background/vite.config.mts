import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: resolve(import.meta.dirname, '../../dist'),
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'background',
      fileName: 'background',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.js',
      },
    },
  },
  resolve: {
    alias: {
      '@src': resolve(import.meta.dirname, 'src'),
    },
  },
});
