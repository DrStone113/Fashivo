// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
dotenv.config()

import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // Rule này sẽ bắt các request bắt đầu bằng /api
      '/api': {
        target: process.env.VITE_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // LOẠI BỎ DÒNG REWRITE NẾU BACKEND CỦA BẠN ĐÃ CÓ '/api' TRONG BASE PATH
        // Ví dụ: nếu backend có app.use("/api/v1/product", ...) thì không rewrite /api
        // rewrite: (path) => path.replace(/^\/api/, ''), // Dòng này có thể gây lỗi nếu backend mong đợi /api
      },
      // Rule này sẽ bắt các request đến /public (ví dụ ảnh)
      '/public': {
        target: process.env.VITE_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/public/, ''), // Tương tự, nếu backend có /public thì không rewrite
      }
    },
  },
})