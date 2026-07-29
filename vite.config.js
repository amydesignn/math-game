import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path depends on the deploy target:
//   - GitHub Pages serves under /math-game/  → set DEPLOY_TARGET=pages (Pages workflow only)
//   - Vercel (math.lumio.land) + dev + preview serve from the root → '/'
const base = process.env.DEPLOY_TARGET === 'pages' ? '/math-game/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5180 },
})
