// Contrast-audit scenario for <FeedbackModal> — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/feedback-modal.audit.mjs
// Needs the dev server (:5180; AUDIT_BASE overrides for worktree servers).
//
// No DEV harness for this one — each state is reached through the REAL app: the Door's
// footer "Send feedback" (dismissing the first-run Welcome if it shows). The feedback
// insert is intercepted (page.route) so no row ever reaches Supabase: fulfilled 201 for
// "thanks", aborted for the gentle-fail card.
//
// There is no "sending" state: the modal is OPTIMISTIC (thanks first, insert behind —
// Oscar's seam #2), so compose → thanks is immediate.
//
// The stars are SVG (aria-hidden, currentColor) — the checker scores text + single-glyph
// icons only, so star contrast is measured separately (see the report's star section).
const BASE = process.env.AUDIT_BASE || 'http://localhost:5180/'
const ROOT = '[role="dialog"][aria-labelledby="luxiFb-title"]'
const FEED = '**/rest/v1/feedback**'

async function open(page, { settle }) {
  await page.unroute(FEED)
  await page.route(FEED, (r) => r.fulfill({ status: 201, body: '' }))
  // first-run popups (Welcome, then the seasonal one) share Onboarding's .luxiOb-close and cover the Door
  const popup = page.locator('.luxiOb-close')
  for (let i = 0; i < 4 && (await popup.first().waitFor({ timeout: 3000 }).then(() => true, () => false)); i++) {
    await popup.first().click()
    await page.waitForTimeout(300)
  }
  await page.getByRole('button', { name: 'Send feedback' }).click()
  await page.locator(ROOT).waitFor()
  await settle()
}
const rate = (page, n) => page.locator(ROOT).getByRole('button', { name: n === 1 ? '1 star' : `${n} stars`, exact: true }).click()
const fields = (page) => page.locator(ROOT).locator('textarea')

export default {
  component: 'FeedbackModal',
  slug: 'feedback-modal',
  file: 'src/ui/FeedbackModal.jsx',
  // The dialog only exists after it's opened through the UI; the checker waits for the root
  // on page load, so <body> stands in until the dialog mounts (then only the dialog matches).
  root: `:is(${ROOT}, body:not(:has(${ROOT})))`,
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [{ id: 'feedback', name: 'Feedback', url: BASE }],
  states: [
    { name: 'default', run: open },
    { name: 'rated-1', run: async (page, ctx) => { await open(page, ctx); await rate(page, 1); await ctx.settle() } },
    { name: 'rated-5', run: async (page, ctx) => { await open(page, ctx); await rate(page, 5); await ctx.settle() } },
    {
      name: 'text-entered',
      run: async (page, ctx) => {
        await open(page, ctx)
        await rate(page, 4)
        await fields(page).nth(0).fill('Building my garden and the cat!')
        await fields(page).nth(1).fill('More worlds with snow please')
        await ctx.settle()
      },
    },
    {
      // ≤ 40 characters left flips the counter to its warning colour
      name: 'near-limit',
      run: async (page, ctx) => {
        await open(page, ctx)
        await rate(page, 3)
        await fields(page).nth(0).fill('a'.repeat(470))
        await fields(page).nth(1).fill('b'.repeat(490))
        await ctx.settle()
      },
    },
    {
      name: 'thanks',
      run: async (page, ctx) => {
        await open(page, ctx)
        await rate(page, 5)
        await page.locator(ROOT).getByRole('button', { name: 'Send feedback' }).click()
        await page.getByText('Thanks for the idea!').waitFor()
        await ctx.settle()
      },
    },
    {
      name: 'fail',
      run: async (page, ctx) => {
        await open(page, ctx)
        await page.unroute(FEED)
        await page.route(FEED, (r) => r.abort())
        await rate(page, 2)
        await page.locator(ROOT).getByRole('button', { name: 'Send feedback' }).click()
        await page.getByText("We'll try again in a bit").waitFor()
        await ctx.settle()
      },
    },
  ],
}
