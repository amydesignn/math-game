// Contrast-audit scenario for <Onboarding> (first-run About + How to Play) — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/onboarding.audit.mjs
// Needs the dev server (:5180; AUDIT_BASE overrides for worktree servers). Drives the
// DEV-only `?a11y=onboarding[&entry=howto]` harness in src/main.jsx.
//
// Every page of both entries: 'first' = About cover → steps 1–3 (Back on every page
// after the cover), 'howto' = steps 1–3 (no Back on step 1). The checker drives each
// control (✕ · Back · Next / Let's play) through default · hover · pressed · focus.
// Inactive pages are aria-hidden + opacity 0, so `decorative` keeps them out of the
// readings; the step-number badge is aria-hidden too, so it's measured on its own
// (see the report notes) rather than by the text pass.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?a11y=onboarding'
const ROOT = '.luxiOb-card[role="dialog"]'
const next = (n) => async (page, { settle }) => {
  for (let i = 0; i < n; i++) {
    await page.locator(`${ROOT} .luxiOb-cta`).click()
    await page.waitForTimeout(60)
  }
  await settle()
}

export default {
  component: 'Onboarding',
  slug: 'onboarding',
  file: 'src/ui/Onboarding.jsx',
  root: ROOT,
  decorative: ['.luxiOb-page[aria-hidden="true"]', '.luxiOb-media', '.luxiOb-dots'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'first', name: 'First run (About + steps)', url: BASE },
    { id: 'howto', name: 'Settings → How to Play', url: `${BASE}&entry=howto` },
  ],
  states: [
    { name: 'about', skip: (v) => v.id !== 'first' },
    { name: 'step-1', run: (page, ctx) => next(ctx.variant.id === 'first' ? 1 : 0)(page, ctx) },
    { name: 'step-2', run: (page, ctx) => next(ctx.variant.id === 'first' ? 2 : 1)(page, ctx) },
    { name: 'step-3', run: (page, ctx) => next(ctx.variant.id === 'first' ? 3 : 2)(page, ctx) },
  ],
}
