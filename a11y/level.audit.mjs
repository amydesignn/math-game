// Contrast-audit scenario for the level identity outside the record book — the HUD
// level pill + the congratulations card (<LevelBar>, <LevelUpPopup>). Run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/level.audit.mjs
// Drives the DEV-only `?a11y=level` harness in src/main.jsx (AUDIT_BASE = a worktree's dev server).
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=level'

export default {
  component: 'LevelBar + LevelUpPopup',
  slug: 'level',
  file: 'src/ui/LevelBar.jsx',
  root: 'body',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'pill', name: 'HUD pill · Level 2', url: BASE },
    // the card's scrim covers the pill (unreachable by keyboard while it's up), so the card is its own view
    { id: 'card', name: 'Congratulations card', url: `${BASE}&card` },
  ],
  // the card's numeral rolls in — let the theatre finish
  states: [{ name: 'default', run: async (page) => { await page.waitForTimeout(2500) } }],
}
