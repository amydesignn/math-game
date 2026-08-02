import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Everything serves from the root: Vercel (math.luxi.land), dev, and preview.
// (The GitHub Pages copy under /math-game/ was removed 2026-08-02.)
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { port: 5180 },
})
