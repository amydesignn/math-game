// Contrast-audit scenario for the <Door> screen — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/door.audit.mjs
// Needs the dev server (:5180). Seeds a returning guest (71 lifetime points, last map = town)
// into localStorage, then reloads so the hero shows Level / points / "Saved on this device".
const URL = process.env.AUDIT_BASE || 'http://localhost:5180/' // AUDIT_BASE = a worktree's dev server
const seed = async (page, { settle }) => {
  await page.goto(URL)
  await page.evaluate(() => localStorage.setItem('math_world_v1', JSON.stringify({ lifetimeGems: 71, gems: 4, map: 'town' })))
  await page.reload()
  await page.waitForSelector('.doorScreen')
  await settle()
}

export default {
  component: 'Door',
  slug: 'door',
  file: 'src/ui/Door.jsx',
  root: '.doorWrap', // header + footer are out of scope for this pass (Amy, 10-05)
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [{ id: 'returning', name: 'Returning player', url: URL, interactions: false }],
  states: [{ name: 'idle', run: seed }],
}
