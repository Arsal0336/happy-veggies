import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@hv/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@hv/api-types': path.resolve(__dirname, '../../packages/api-types/src'),
      '@hv/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
