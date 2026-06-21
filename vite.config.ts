import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://54.160.228.203',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api/v1'),
      },
      '/api/products': {
        target: 'http://54.160.228.203:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/products/, '/api/v1'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          http: ['axios'],
        },
      },
    },
  },
})
