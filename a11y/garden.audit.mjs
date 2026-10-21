// Contrast-audit scenario for Grow a Garden's DOM overlays — the 🧺 Basket (HUD button +
// card) and the plot's GardenBar (Plant · Water · bloomed · no seeds). Run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/garden.audit.mjs
// Drives the DEV-only `?a11y=garden` harness in src/main.jsx (AUDIT_BASE = a worktree's dev server).
// The 3D plot itself is exempt (world scene); only the HTML overlays are measured.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=garden'

const openBasket = async (page) => { await page.getByRole('button', { name: /^Open your basket/ }).click() }

export default {
  component: 'Garden overlays (Basket + GardenBar)',
  slug: 'garden',
  file: 'src/ui/Basket.jsx · src/App.jsx (GardenBar/ActionBar)',
  root: '[data-audit-root]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1024, height: 768 },
  variants: [
    { id: 'plant-empty', name: 'A seed to plant · basket empty', url: `${BASE}&stage=plant` },
    { id: 'water-full', name: 'Growing, can water (12 💎) · basket full', url: `${BASE}&stage=grow&gems=12&full` },
    { id: 'water-broke', name: 'Growing, can’t afford water (2 💎) · basket full', url: `${BASE}&stage=grow&gems=2&full` },
    { id: 'bloom', name: 'Bloomed · basket full', url: `${BASE}&stage=bloom&full`, interactions: false },
    { id: 'noseed', name: 'No seeds yet · basket empty', url: `${BASE}&stage=noseed`, interactions: false },
  ],
  states: [
    { name: 'closed' },
    { name: 'basket-open', run: openBasket },
  ],
}
