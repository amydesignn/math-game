// Contrast-audit scenario for <StationPopup> — run with Datum's checker:
//   node ~/projects/nathan-mcp-codebase-01/tooling/contrast-audit/audit.mjs a11y/station-popup.audit.mjs
// Needs the dev server (npm run dev, :5180) — it drives the DEV-only `?a11y=station`
// harness in src/main.jsx. Every skin re-tints the banner, Quest badge and slots, so
// each skin is its own variant; the shared controls (keypad, buttons, close) are
// checked state-by-state on the first skin and on the division ask.
const BASE = 'http://localhost:5180/?a11y=station'
const SKINS = [
  ['feedPet', 'Snack time'], ['waterTree', 'Water the tree'], ['bakery', 'Bakery run'],
  ['flowers', 'Flower patch'], ['arcade', 'Arcade night'], ['starParty', 'Star party'],
]

const go = (page) => page.getByRole('button', { name: /Let's go/ }).click()
const answer = async (page, n) => { await page.keyboard.type(String(n)); await page.keyboard.press('Enter') }

export default {
  component: 'StationPopup',
  slug: 'station-popup',
  file: 'src/ui/StationPopup.jsx',
  root: '[role="dialog"]',
  // ornament layers (reward sparkles) are aria-hidden — ignored while measuring
  decorative: ['[aria-hidden="true"]'],
  viewport: { width: 1280, height: 900 },
  variants: [
    ...SKINS.map(([id, name], i) => ({ id, name, url: `${BASE}&skin=${id}`, interactions: i === 0 })),
    { id: 'division', name: 'Division ask', url: `${BASE}&skin=feedPet&topic=long-div`, division: true },
  ],
  states: [
    { name: 'intro', skip: (v) => v.division },
    { name: 'ask', run: async (page) => go(page) },
    {
      name: 'recover', skip: (v) => v.division,
      run: async (page, { answers }) => {
        await go(page)
        await answer(page, answers[0] + 1)
        await page.getByText("Let's look at one together").waitFor()
      },
    },
    {
      name: 'stepdone', skip: (v) => v.division,
      run: async (page, { answers }) => {
        await go(page)
        await answer(page, answers[0])
        await page.getByRole('button', { name: /^Next/ }).waitFor()
      },
    },
    {
      name: 'complete', skip: (v) => v.division,
      run: async (page, { answers }) => {
        await go(page)
        await answer(page, answers[0])
        await page.getByRole('button', { name: /^Next/ }).click()
        await answer(page, answers[1])
        await page.getByText('Quest complete!').waitFor()
      },
    },
  ],
}
