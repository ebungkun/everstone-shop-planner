// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 👇 이 부분을 추가하세요
  base: '/everstone-shop-planner/', // '/<리포지토리명>/' 형식으로 입력합니다.
  plugins: [
    react(),
    tailwindcss(),
  ],
})
