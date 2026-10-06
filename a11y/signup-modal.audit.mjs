// Contrast-audit scenario for <SignupModal> + <SavedToast> — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/signup-modal.audit.mjs
// Needs the dev server (:5180; AUDIT_BASE overrides for worktree servers). Drives the
// DEV-only `?signupdemo` harness in src/main.jsx: &entry=guest · &fail · &hang · &toast.
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?signupdemo'
const EMAIL = 'parent@example.com'
const type = async (page) => {
  await page.locator('input[type="email"]').fill(EMAIL)
}
const send = async (page, { settle }) => {
  await type(page)
  await page.getByRole('button', { name: /Send the link/ }).click()
  await settle()
}

export default {
  component: 'SignupModal',
  slug: 'signup-modal',
  file: 'src/ui/SignupModal.jsx',
  root: '[data-audit-root]',
  decorative: ['[aria-hidden="true"]', '[data-demo]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'form', name: 'Form', url: BASE, flow: 'form' },
    { id: 'sending', name: 'Sending', url: `${BASE}&hang`, flow: 'sending' },
    { id: 'error', name: 'Error', url: `${BASE}&fail`, flow: 'error' },
    { id: 'check', name: 'Check your inbox', url: BASE, flow: 'check' },
    { id: 'guest', name: 'Guest popup', url: `${BASE}&entry=guest`, flow: 'guest' },
    { id: 'toast', name: 'Saved toast', url: `${BASE}&toast`, flow: 'toast' },
  ],
  states: [
    { name: 'empty', skip: (v) => v.flow !== 'form' },
    { name: 'filled', skip: (v) => v.flow !== 'form', run: async (page, { settle }) => { await type(page); await settle() } },
    { name: 'sending', skip: (v) => v.flow !== 'sending', run: send },
    { name: 'error', skip: (v) => v.flow !== 'error', run: async (page, ctx) => { await send(page, ctx); await page.getByRole('alert').waitFor(); await ctx.settle() } },
    { name: 'check', skip: (v) => v.flow !== 'check', run: async (page, ctx) => { await send(page, ctx); await page.getByText('Check your inbox').waitFor(); await ctx.settle() } },
    { name: 'guest', skip: (v) => v.flow !== 'guest' },
    { name: 'toast', skip: (v) => v.flow !== 'toast' },
  ],
}
