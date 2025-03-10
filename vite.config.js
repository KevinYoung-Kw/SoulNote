import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Add specific aliases for asset folders to ensure proper resolution
      'assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    open: true,
    // 添加允许的主机配置
    host: '0.0.0.0',  // 允许局域网/公网 IP 访问
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'soulnote.kevinyoung0210.me'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild', // Change from 'terser' to 'esbuild' which is included in Vite
    // Remove terserOptions since we're not using Terser anymore
  }
});