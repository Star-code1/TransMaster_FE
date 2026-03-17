import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Không cần server proxy nếu đã dùng baseURL ở bước 3
})