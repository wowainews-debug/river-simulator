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
      '/api': 'http://127.0.0.1:8000',  // → 量化運算核心 (Port 8000) 🔧 強制 IPv4 避免 localhost 解析到 ::1 導致逾時
    },
  },
});
