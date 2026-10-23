// Contrast-audit scenario for the in-game hint layer (src/hints — S9 governance lane):
// the docked pill, the arrow + paired pill ("sign on a post"), the edge arrow, the lucky
// (gold) tone, and the three arrow skins. Run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/hints.audit.mjs
// Drives the DEV-only `?a11y=hints` harness in src/main.jsx over Sunny Town's capture.
// The arrow glyph is aria-hidden (the live region carries the words); its contrast lives in
// its silhouette (green-900 / pink-900 outline), checked by eye on the sheet.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=hints'

const tabToDismiss = async (page) => { await page.keyboard.press('Tab') }

export default {
  component: 'In-game hints (HintLayer)',
  slug: 'hints',
  file: 'src/hints/HintLayer.jsx · hints.css · motion.css',
  root: '[data-audit-root]',
  // NOT '[aria-hidden]': the pill's visible words are aria-hidden (the polite live region
  // speaks them), so hiding aria-hidden would skip the very text kids read. Only the
  // invisible measuring twin is left out.
  decorative: ['.luxiHint-measure'],
  viewport: { width: 1024, height: 768 },
  variants: [
    { id: 'dock', name: 'Docked pill (no target)', url: `${BASE}&mode=dock` },
    { id: 'pair-green', name: 'Green arrow + paired pill', url: `${BASE}&mode=pair&arrow=green` },
    { id: 'pair-pink', name: 'Pink arrow + paired pill', url: `${BASE}&mode=pair&arrow=pink` },
    { id: 'pair-iris', name: 'Iris arrow + paired pill', url: `${BASE}&mode=pair&arrow=iris` },
    { id: 'edge', name: 'Edge arrow (target off-screen)', url: `${BASE}&mode=edge` },
    { id: 'lucky', name: 'Lucky (gold) pill', url: `${BASE}&mode=pair&tone=lucky` },
    { id: 'nodismiss', name: 'Pill without ✕', url: `${BASE}&mode=dock&nodismiss`, interactions: false },
  ],
  states: [
    { name: 'rest' },
    { name: 'focus-dismiss', run: tabToDismiss },
  ],
}
