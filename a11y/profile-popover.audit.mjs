// Contrast-audit scenario for <ProfilePopover> — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/profile-popover.audit.mjs
// Needs the dev server (:5180; AUDIT_BASE overrides). Drives the DEV-only `?settingsdemo`
// harness pre-opened on the profile: `&open=profile` (+ `&account` initial, `&avatar` a photo).
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5180/') + '?settingsdemo&open=profile'

export default {
  component: 'ProfilePopover',
  slug: 'profile-popover',
  file: 'src/ui/Settings.jsx',
  root: '[role="dialog"][aria-label="Profile"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'guest', name: 'Guest · no photo', url: BASE },
    { id: 'account', name: 'Signed in · initial', url: `${BASE}&account` },
    { id: 'photo', name: 'With photo', url: `${BASE}&avatar` },
  ],
  states: [{ name: 'open' }],
}
