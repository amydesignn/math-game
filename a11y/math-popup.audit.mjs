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
    // `sim` pins the worked example to a worst case (carries, longest walk), so
    // every later step is audited, not just step 1. `steps` = its stage count.
    { id: 'mult-2x1', name: '2-digit × 1-digit', url: `${BASE}&topic=mult-2x1&sim=47x6`, steps: 4 },
    { id: 'long-mult', name: 'Long multiplication', url: `${BASE}&topic=long-mult&sim=95x85`, steps: 8 },
    { id: 'add-2x2', name: '2-digit addition', url: `${BASE}&topic=add-2x2&sim=58x57`, steps: 4, interactions: false },
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
    // the worked example's later steps — recover lands on step 1; walk forward
    ...[2, 3, 4, 5, 6, 7, 8].map((n) => ({
      name: `step-${n}`, skip: (v) => v.division || n > v.steps,
      run: async (page, { answers }) => {
        await answer(page, answers[0] + 1)
        const next = page.getByRole('button', { name: /Show next step/ })
        for (let k = 1; k < n; k++) { await next.click(); await page.waitForTimeout(350) }
      },
    })),
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
