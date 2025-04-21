import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 'api' プレフィックスで始まるリクエストをバックエンドに転送
      // 例: /api/entries -> http://localhost:8000/entries
      '/entries': {
        target: 'http://localhost:8000', // バックエンドサーバーのアドレス
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 必要に応じてパスを書き換え
      },
    }
  }
}) 