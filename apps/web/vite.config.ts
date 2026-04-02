import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3005',
            changeOrigin: true,
            secure: false,
          },
          '/socket.io': {
            target: 'http://localhost:3005',
            changeOrigin: true,
            secure: false,
            ws: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@dayla/types': path.resolve(__dirname, '../../packages/types/src'),
          '@dayla/config': path.resolve(__dirname, '../../packages/config/src'),
          '@dayla/auth': path.resolve(__dirname, '../../packages/auth/src'),
          '@dayla/api': path.resolve(__dirname, '../../packages/api/src'),
          '@dayla/socket': path.resolve(__dirname, '../../packages/socket/src'),
          '@dayla/utils': path.resolve(__dirname, '../../packages/utils/src'),
        }
      }
    };
});
