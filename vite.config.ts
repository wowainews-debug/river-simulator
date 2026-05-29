import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    hmr: {
      port: 24679,  // 避開預設 24678 與殘留程序衝突
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',  // → 量化運算核心 (Port 8000)
        timeout: 30_000,      // 代理等待後端回應的最大毫秒數
        proxyTimeout: 30_000, // 代理本身的逾時
      },
    },
  },
});
