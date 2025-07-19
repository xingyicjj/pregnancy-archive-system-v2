import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 启用网络访问
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
