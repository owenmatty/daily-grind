import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/daily-grind/',
  plugins: [vue()],
  test: { environment: 'node' },
})
