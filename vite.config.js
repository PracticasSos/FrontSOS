import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mediapipe/face_mesh']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          mediapipe: ['@mediapipe/face_mesh', '@mediapipe/drawing_utils', '@mediapipe/camera_utils']
        }
      }
    }
  }
})
