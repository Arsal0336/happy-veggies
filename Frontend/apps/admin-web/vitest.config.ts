import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  define: {
    // Ensure fixture mode in unit tests regardless of .env (live defaults).
    'import.meta.env.VITE_USE_FIXTURES': JSON.stringify('true'),
  },
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: true,
    env: {
      VITE_USE_FIXTURES: 'true',
    },
  },
});
