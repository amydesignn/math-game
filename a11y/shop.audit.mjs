// Contrast-audit scenario for <Shop> (the Gem Shop bottom sheet) — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/shop.audit.mjs
// Drives the DEV-only `?a11y=shop` harness in src/main.jsx (AUDIT_BASE = a worktree's dev server).
// `gems` decides which tiles are affordable — 4 gives a real mix, 0 = nothing yet.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=shop'

export default {
  component: 'Shop',
  slug: 'shop',
  file: 'src/ui/Shop.jsx',
  root: '[role="dialog"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 2400 }, // tall enough that the sheet (72%) shows every shelf without scrolling — focus checks photograph the element
  variants: [
    { id: 'mixed', name: '4 gems · your things · sparkle on', url: `${BASE}&gems=4&owned&sparkle` },
    { id: 'broke', name: '0 gems (nothing affordable)', url: `${BASE}&gems=0`, interactions: false },
  ],
  states: [
    { name: 'default' },
    {
      name: 'selected', skip: (v) => v.id === 'broke',
      run: async (page) => { await page.getByRole('button', { name: /^🌳\s*Tree/ }).last().click() },
    },
    {
      name: 'big', skip: (v) => v.id === 'broke', interactions: false,
      run: async (page) => { await page.getByRole('button', { name: /Big ×2/ }).click() },
    },
  ],
}
