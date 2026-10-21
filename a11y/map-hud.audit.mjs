// Contrast-audit scenario for the in-world HUD: Exit pill + map label (+ the rest of the HUD chrome).
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/map-hud.audit.mjs
// Needs the dev server (:5180, or AUDIT_BASE = a worktree's dev server).
const URL = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?season=none'
const seed = async (page, { settle }) => {
  await page.goto(URL)
  await page.evaluate(() => localStorage.setItem('math_world_v1', JSON.stringify({ lifetimeGems: 71, gems: 4, map: 'town', promos: ['halloween-2026'], welcomeGift: true, celebratedLevel: 2, levelUps: 1 })))
  await page.reload()
  await page.waitForSelector('.doorScreen')
  await page.getByRole('button', { name: /Resume/ }).first().click()
  await page.waitForSelector('.hud-exit', { timeout: 20000 })
  await page.waitForTimeout(3000)
  await settle()
}
export default {
  component: 'Map HUD (Exit + MapLabel)', slug: 'map-hud', file: 'src/App.jsx',
  root: 'body',
  decorative: ['[aria-hidden="true"]', 'canvas'],
  viewport: { width: 1024, height: 768 },
  variants: [{ id: 'world', name: 'In world · Sunny Town', url: URL, interactions: true }],
  states: [{ name: 'idle', run: seed }],
}
