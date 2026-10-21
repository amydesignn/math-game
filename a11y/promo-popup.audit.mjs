// Contrast-audit scenario for <PromoPopup> (the Halloween trick-or-treat popup) — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/promo-popup.audit.mjs
// Needs the dev server (:5180; AUDIT_BASE overrides for worktree servers). Drives the
// DEV-only `?a11y=promo` harness in src/main.jsx (mounts the popup; never claims the promo).
//
// The checker runs with prefers-reduced-motion, and reduced-motion players get the
// video's native controls INSTEAD of the corner sound button. So the 'sound' variant
// switches motion back on and reloads, to measure the sound button (off + on) over
// the clip. It is listed LAST: the media emulation sticks for the rest of the run.
// The treat burst + chip gems/sparks are aria-hidden ornament.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=promo'
const ROOT = '[role="dialog"][aria-labelledby="promo-title"]'
const pick = (name) => async (page, { settle }) => {
  await page.getByRole('button', { name }).click()
  await page.getByRole('button', { name: /Let.s play/ }).waitFor()
  await page.waitForTimeout(2200) // the count ticks to its full number (timers, not CSS)
  await settle()
}
const motionOn = async (page, { settle }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.luxiPromo-sound').waitFor()
  await settle()
}

export default {
  component: 'PromoPopup',
  slug: 'promo-popup',
  file: 'src/ui/PromoPopup.jsx',
  root: ROOT,
  decorative: ['.luxiBurst', '.luxiPromo-gift > span:first-child', 'button > span[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'reduced', name: 'Reduced motion (poster + controls)', url: BASE },
    { id: 'sound', name: 'Motion on (sound button)', url: BASE },
  ],
  states: [
    { name: 'pick', skip: (v) => v.id !== 'reduced' },
    { name: 'trick', skip: (v) => v.id !== 'reduced', run: pick(/Trick/) },
    { name: 'treat', skip: (v) => v.id !== 'reduced', run: pick(/Treat/) },
    { name: 'sound-off', skip: (v) => v.id !== 'sound', run: motionOn },
    {
      name: 'sound-on', skip: (v) => v.id !== 'sound',
      run: async (page, ctx) => {
        await motionOn(page, ctx)
        await page.locator('.luxiPromo-sound').click()
        await ctx.settle()
      },
    },
    {
      name: 'after-pick', skip: (v) => v.id !== 'sound',
      run: async (page, ctx) => { await motionOn(page, ctx); await pick(/Treat/)(page, ctx) },
    },
  ],
}
