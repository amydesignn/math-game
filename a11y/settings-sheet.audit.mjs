// Contrast-audit scenario for <SettingsSheet> — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/settings-sheet.audit.mjs
// Needs the dev server (:5180) — drives the DEV-only `?settingsdemo` harness in src/main.jsx,
// pre-opened via `&open=settings` (+ `&account` signed in, `&soundoff` toggle off).
const BASE = 'http://localhost:5180/?settingsdemo&open=settings'

export default {
  component: 'SettingsSheet',
  slug: 'settings-sheet',
  file: 'src/ui/Settings.jsx',
  root: '[role="dialog"][aria-label="Settings"]',
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    { id: 'guest-sound-on', name: 'Guest · sound on', url: BASE },
    { id: 'guest-sound-off', name: 'Guest · sound off', url: `${BASE}&soundoff` },
    { id: 'account', name: 'Signed in', url: `${BASE}&account` },
  ],
  states: [{ name: 'open' }],
}
