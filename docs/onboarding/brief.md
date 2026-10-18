# Onboarding + How to Play: the open question (job 1)

Trail crew + Kestrel, 2026-10-18. Nathan writes the question, Clover facilitates. **Proposal only. Nothing gets built until Amy decides.**

## Read first
- The kickoff brief (Notion): "🧭 Onboarding + How to Play — kickoff brief (Oct 18, 2026)", https://app.notion.com/p/3fdfda87fbe88191aae2c56f6c0a9841
- The source of truth for the copy: Amy's "Business Vision | Business Goals & Needs" page, https://app.notion.com/p/3fdfda87fbe880fb9601faebff520f31. Use the **Onboarding** section (Opening / Teaching mode / How to play 0–2) and the **Notes** at the bottom.
- Today's code: `src/ui/Onboarding.jsx`. The images are in `public/onboarding/step-1..4.jpg`. App wiring is in `src/App.jsx`: `showOnboarding`, `promoShowing`, and Settings `onOpenHowTo`.
- The evidence: `docs/hints/04-new-kid.md` (the cold playtest), `01–03` (gem / build / grow facts), `proposal-panel.md` (the parked teaching card).

## Definitions (Amy, fixed)
- **Onboarding** = the "About Luxi Math" screen + How to Play. It shows **once** on the first run.
- **How to Play** = Onboarding without the About screen. It opens any time from Settings → How to Play.
- Main is the onboarding we're **changing**, so today's code won't match the target. That's expected.

## Truth rules (fixed)
- Every line must match the game today:
  - Seeds come from gems: 1 free, then 1 per 20 lifetime gems (`GARDEN.seedEveryGems`), never from levels.
  - The garden is in **Sunny Town**. Watering costs 5 💎, and it takes 3 waterings to bloom.
  - Picked flowers go to the 🧺 basket.
  - Heroes live in the Gem Shop. 3 are free, and the rest unlock with gems.
- **No "coming soon" in the game.** The house and harvest trading are marketing only. That means today's "What's next / SOON" card goes away, or becomes something true.
- COPPA: no new personal data. The beta result ("I ace it!") is never shown in-game.
- Reading load: a 7-year-old. Short lines, and the images do the work.
- In-game hints (PR #67) will teach the details in the world once Amy turns `HINTS_ON` on. So How to Play can stay short.

## The open question
**What should the new Onboarding be?** Think it through honestly. Disagree with each other, with Nathan, and with Amy. Amy's page is input, not orders.

1. **About screen.** What does it say, in a 7-year-old's words? Amy's page has "a gym for your brain", "teaches the method, not just a score", "cozy, not fighting", grades 4–6, × ÷ +. Which of these belong in a kid's first screen, and which only matter to a parent? (Kestrel: does it match the selling points in the Feature Atlas?)
2. **How to Play steps.** Amy's page has 3: hero + cat; gems → build (with "it teaches you if you struggle"); seed → garden in Sunny Town → water → basket. Are 3 right? Is anything missing that the playtest says kids can't find, such as zoom, gates between worlds, or the 🛍️ shop? Or should those be left to the hints? Title + body per step, with word counts.
3. **The ending.** What replaces "What's next / SOON"? Nothing, or a true last step, or just the "Let's play" button on step 3?
4. **Images.** Do Oscar's 4 images still fit the new steps? Which need new captures? (We ask Amy before replacing Oscar's art.) Preload them so a fast Next never shows a stale or empty box.
5. **The same component, two entries.** On the first run it starts at About. From Settings it starts at How to Play (no About). Do the dots and the Back button change? Does Settings get a way to reach About at all?
6. **Parked Q3: the Halloween popup** stacks right after the first-run onboarding, before any play. Should it wait until after her first world visit? The promo ends Nov 2. (Rowan: what does the gating cost?)
7. **Parked Q4:** should the About screen ask anything (a grade, picking a hero)? Or only explain? The backlog says "later, once the data contract is ready".
8. **Parked Q1 / Q2** (easier first problems for a new guest; build shelves above Heroes in the shop) sit outside this component. Give a one-line view only if you have one. Amy decides those separately.
9. **Motion and sound.** Does anything change? (Fern: step transitions, image fade-in. Wren: a cue or none?)

Nathan's view (one voice): keep it to About + 3 steps, ending on the garden step with "Let's play". About for a kid is two short lines: "Math is a gym for your brain 💪" and "Get stuck? We show you how, step by step." The grades and × ÷ + are for parents, so they go in small print or nowhere. Leave zoom and gates to the hints. Hold Halloween until after the first world visit. My worry: if the hints stay OFF, 3 slides really are the only teaching, so maybe one line about the 🛍️ shop.

## Output
- Each crewmate writes **3–8 lines in your own words** to `docs/onboarding/voices/<name>.md`. Include any change of mind.
- Clover then writes **ONE proposal** to `docs/onboarding/proposal.md`. It covers consensus, the concrete copy (About + each step, with word counts), dissent in each voice's own words, and a numbered "Open for Amy" list.
- Don't edit source. Don't commit.
