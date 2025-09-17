import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Use GitHub Pages base path only when building for production
  const base = mode === 'production' ? '/incident-response-app/' : '/';
  
  return {
    plugins: [react()],
    base: base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
