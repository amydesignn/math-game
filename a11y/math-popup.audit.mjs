// Contrast-audit scenario for <MathPopup> (the single-sparkle popup) — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/math-popup.audit.mjs
// Needs the dev server (:5180) — drives the DEV-only `?a11y=math` harness in src/main.jsx.
// The game always shows this popup in the Snack time skin, so variants = problem types.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=math' // AUDIT_BASE = a worktree's dev server
const answer = async (page, n) => { await page.keyboard.type(String(n)); await page.keyboard.press('Enter') }

export default {
  component: 'MathPopup',
  slug: 'math-popup',
  file: 'src/ui/MathPopup.jsx',
  root: '[role="dialog"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'mult-2x1', name: '2-digit × 1-digit', url: `${BASE}&topic=mult-2x1` },
    { id: 'long-mult', name: 'Long multiplication', url: `${BASE}&topic=long-mult` },
    { id: 'add-2x2', name: '2-digit addition', url: `${BASE}&topic=add-2x2`, interactions: false },
    { id: 'long-div', name: 'Long division', url: `${BASE}&topic=long-div`, division: true },
  ],
  states: [
    { name: 'ask' },
    {
      name: 'correct', skip: (v) => v.division,
      run: async (page, { answers }) => {
        await answer(page, answers[0])
        await page.getByText('Nice work!').waitFor()
      },
    },
    {
      name: 'recover', skip: (v) => v.division,
      run: async (page, { answers }) => {
        await answer(page, answers[0] + 1)
        await page.waitForTimeout(600)
      },
    },
    {
      // division recovers into Oscar's candy walkthrough — open it from the ask
      name: 'walkthrough', skip: (v) => !v.division,
      run: async (page) => {
        await page.getByRole('button', { name: /Show me how/ }).click()
        // the walkthrough reveals its parts on a timer — wait until the CTA has faded in
        await page.waitForFunction(() => [...document.querySelectorAll('button')]
          .some((b) => /discover/.test(b.textContent) && getComputedStyle(b.parentElement).opacity === '1'), null, { timeout: 15000 })
      },
    },
  ],
}
