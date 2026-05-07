import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ghost-api': {
        target: 'https://staging.escapecollective.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ghost-api/, '/ghost/api/admin'),
        secure: false,
      },
      '/ghost-image': {
        target: 'https://staging.escapecollective.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ghost-image/, ''),
        secure: false,
      },
    },
  },
});
