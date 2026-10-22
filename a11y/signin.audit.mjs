// Contrast-audit scenario for the account sign-in wall (<SignIn> in src/main.jsx) — the screen
// a family device sees under ?account with no session. Run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/signin.audit.mjs
// Drives the DEV-only `?a11y=signin` harness (add `&state=sent|error`) — no Supabase session needed.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=signin'

export default {
  component: 'SignIn',
  slug: 'signin',
  file: 'src/main.jsx',
  root: 'body',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'idle', name: 'Enter your email', url: BASE },
    { id: 'error', name: "That didn't send", url: `${BASE}&state=error` },
    { id: 'sent', name: 'Check your inbox', url: `${BASE}&state=sent` },
  ],
  states: [{ name: 'default', run: async (page) => { await page.waitForTimeout(500) } }],
}
