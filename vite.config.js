import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/myfirstproject/', // أضف هذا السطر بالضبط (اسم المستودع بين سلاشين)
})