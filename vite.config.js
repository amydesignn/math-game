import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves from /math-game/ ; dev + preview use '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/math-game/' : '/',
  plugins: [react()],
  server: { port: 5180 },
}))
