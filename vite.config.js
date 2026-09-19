import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Everything serves from the root: Vercel (math.luxi.land), dev, and preview.
// (The GitHub Pages copy under /math-game/ was removed 2026-08-02.)
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { port: 5180 },
  // Feedback's silent app_version context: the deploy's commit on Vercel,
  // 'dev' everywhere else. A word about the BUILD, never about the child.
  define: {
    __BUILD_ID__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'),
  },
})
