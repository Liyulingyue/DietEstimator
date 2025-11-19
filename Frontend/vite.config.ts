import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5176
  },
  define: {
    // 禁用rollup原生二进制文件以避免依赖问题
    'process.env.ROLLUP_SKIP_NATIVE': 'true'
  }
})
