// Contrast-audit scenario for the Door FOOTER (Luxi Land footer, Footer.jsx).
// door-full.audit.mjs reaches the footer too, but it sits below that scenario's 900px
// viewport, so its focus rings can't be photographed ("review — none visible" = a ghost,
// the carousel lesson). This one scrolls the footer into view first.
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/footer.audit.mjs
// Needs the dev server (:5180, or AUDIT_BASE = a worktree's dev server).
const URL = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?season=none'
const seed = async (page, { settle }) => {
  await page.goto(URL)
  await page.evaluate(() => localStorage.setItem('math_world_v1', JSON.stringify({ lifetimeGems: 71, gems: 4, map: 'town', promos: ['halloween-2026'] })))
  await page.reload()
  await page.waitForSelector('.luxiFooter')
  await page.evaluate(() => document.querySelector('.luxiFooter').scrollIntoView({ block: 'end' }))
  await settle()
}

export default {
  component: 'Footer', slug: 'footer', file: 'src/ui/Footer.jsx',
  root: '.luxiFooter',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [{ id: 'door', name: 'Door footer', url: URL, interactions: true }],
  states: [{ name: 'idle', run: seed }],
}
