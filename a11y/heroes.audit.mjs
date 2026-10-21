// Contrast-audit scenario for the Heroes picker — the 🦸 shelf at the top of the Gem Shop
// (3 free heroes + 10 locked at 💎50). Run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/heroes.audit.mjs
// Drives the DEV-only `?a11y=shop` harness in src/main.jsx with `&character` (who she's playing)
// and `&heroes` (locked ones she has unlocked). Locked + unaffordable = exempt (inactive) but
// must still read as locked: the 🔒 + price stay, and the tile's border/surface go neutral.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=shop'

export default {
  component: 'Heroes picker (Gem Shop)',
  slug: 'heroes',
  file: 'src/ui/Shop.jsx',
  root: '[role="group"][aria-label="Heroes"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 2400 },
  variants: [
    { id: 'rich', name: '60 gems · playing Sunny · Champ unlocked', url: `${BASE}&gems=60&character=character-female-b&heroes=character-female-a` },
    { id: 'broke', name: '4 gems · playing the Sorcerer (every locked hero unaffordable)', url: `${BASE}&gems=4&character=sorcerer` },
  ],
  states: [
    { name: 'default' },
    {
      name: 'unlock-asked', skip: (v) => v.id === 'broke',
      run: async (page) => { await page.getByRole('button', { name: /^Bluebell/ }).click() },
    },
  ],
}
