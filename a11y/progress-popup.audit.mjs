// Contrast-audit scenario for <ProgressPopup> (tap the level bar → her record book) — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/progress-popup.audit.mjs
// Drives the DEV-only `?a11y=progress` harness in src/main.jsx (AUDIT_BASE = a worktree's dev server).
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=progress'

export default {
  component: 'ProgressPopup',
  slug: 'progress-popup',
  file: 'src/ui/ProgressPopup.jsx',
  root: '[role="dialog"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 1000 },
  variants: [
    { id: 'record', name: 'Record (Level 2, three subjects)', url: BASE },
    { id: 'empty', name: 'Empty (new player)', url: `${BASE}&empty` },
  ],
  // the counts tick up from 0 — wait until they land on the real numbers
  states: [{ name: 'default', run: async (page) => { await page.waitForTimeout(1400) } }],
}
