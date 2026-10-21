// Contrast-audit scenario for the WHOLE Door screen — header app-nav + "What's new" carousel
// included, with interactions (focus rings). door.audit.mjs covers .doorWrap only.
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/door-full.audit.mjs
// Needs the dev server (:5180, or AUDIT_BASE = a worktree's dev server).
const URL = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?season=none'
const seed = async (page, { settle }) => {
  await page.goto(URL)
  await page.evaluate(() => localStorage.setItem('math_world_v1', JSON.stringify({ lifetimeGems: 71, gems: 4, map: 'town', promos: ['halloween-2026'] })))
  await page.reload()
  await page.waitForSelector('.doorScreen')
  await settle()
}

export default {
  component: 'Door', slug: 'door-full', file: 'src/ui/Door.jsx',
  root: '.doorScreen',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [{ id: 'returning', name: 'Returning player', url: URL, interactions: true }],
  states: [{ name: 'idle', run: seed }],
}
