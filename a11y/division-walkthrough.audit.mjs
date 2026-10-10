// Contrast-audit scenario for <DivisionWalkthrough> ("Let's share the candy") — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/division-walkthrough.audit.mjs
// Needs the dev server (:5180, or AUDIT_BASE for a worktree's) — drives the DEV-only `/?divdemo`
// harness in src/main.jsx (the walkthrough inside the house <Modal>, the frame it wears in the game).
// 815 ÷ 4 = 203 R3 covers every move + the sneaky zero; 85 ÷ 4 = 21 R1 is the short path.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?divdemo'
const STEPS = 16 // more than the longest walkthrough; extra steps just re-measure the last stage

const discover = async (page) => {
  await page.getByRole('button', { name: /discover it/ }).click({ timeout: 8000 })
  await page.waitForTimeout(700)
}
const toStep = (k) => async (page) => {
  await discover(page)
  for (let n = 0; n < k; n++) {
    const next = page.getByRole('button', { name: /Next step/ })
    if (!(await next.count())) break
    await next.click()
    await page.waitForTimeout(450)
  }
  await page.waitForTimeout(900)
}

export default {
  component: 'DivisionWalkthrough',
  slug: 'division-walkthrough',
  file: 'src/ui/DivisionWalkthrough.jsx',
  root: '[role="dialog"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  settleMs: 1800, // the intro cards stagger in
  variants: [
    { id: 'div-815', name: '815 ÷ 4 (sneaky zero)', url: BASE },
    { id: 'div-85', name: '85 ÷ 4', url: `${BASE}&ex=85`, interactions: false },
  ],
  states: [
    { name: 'intro', run: async (page) => { await page.getByRole('button', { name: /discover it/ }).waitFor(); await page.waitForTimeout(2500) } }, // the CTA fades in last
    ...Array.from({ length: STEPS }, (_, k) => ({ name: `step-${k}`, run: toStep(k), interactions: k === 0 ? undefined : false })),
  ],
}
