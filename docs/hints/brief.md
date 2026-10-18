# Trail crew — Job 1 brief: the in-game hint, garden use case

Lead: Nathan (reviews, tests by measurement, approves). Owner: Amy (taste calls; reachable via Nathan).
Crew: **Rowan** (engineer) · **Linden** (UI) · **Fern** (motion) · **Wren** (sound) · **Clover** (kid advocate + QA).
Worktree: `~/projects/math-game-hints` on branch `feat/garden-hint` (from origin/main 84a0cd7).
Dev server: launch config **`math-game-hints`**, port **5188**. **Do not ship**: no push, no PR, no merge. Local commits are fine. Amy tests on the dev server first.

## Why
New kids can't discover what Luxi Math can do. Evidence is in `docs/hints/01–04-*.md`: four scout reports, including a cold playtest. Today we build the **in-game hint**, a contextual "look here" sign. It is a repeatable component, proven on ONE use case. More hints come later as new config entries, not new code. How to Play / Onboarding is OUT of scope, so don't touch `Onboarding.jsx`.

## The use case (Amy's words)
> When the kid is within a scene where they can grow a garden, an arrow is triggered on the garden. A toast message if the kid hasn't grown any crop.

- **When:** she is in Sunny Town (`mapId === 'town'`, where the one garden bed lives, `maps.js`), she has never grown a crop, and the world is calm (no problem, popup, shop, settings, placing, or fade).
- **Show:** an **arrow on the garden bed**, a 3D world target. When the bed is off-screen, the arrow clamps to the screen edge and points toward it. A **toast** appears with one line.
- **Retire:** after her first planting, the hint never shows again on this save. Existing players who have already planted never see it. Derive that from garden state, and check `store.js` to see what "ever planted" really looks like.
- **Copy must be TRUE.** Every kid starts with 1 free seed, plus 1 per 20 lifetime gems. Seeds do NOT come from levelling up. Clover writes the copy. Starting points:
  - has a seed: "Plant your seed in the garden 🌱"
  - no seed: "Solve problems to earn a seed 💎"

  Each line is 8 words or fewer.
- Whether the **water** step ("Earn 5 💎 to water it") belongs in this use case is the crew's call. Debate it and keep the scope honest.

## Rules that bind the component
1. **Reusable, app-agnostic.** The module lives in `src/hints/` and has **zero imports from outside its folder**. A test must enforce that. It must also go to luxi.land later, which is a plain React page with no 3D. Hints are **config entries**: `{ id, when(ctx), target, say(ctx), retire(ctx) }` or better; Rowan decides. Targets are DOM (`data-hint="…"`) or world (a host-supplied `getScreenPos(key)`). Game-specific config lives outside the module, e.g. `src/gameHints.js`.
2. **Quiet budget, shared with ticket 9** (the planned garden popup; spec in 03-grow.md). The rules:
   - at most one hint on screen;
   - natural pauses only, never mid-problem (`mathBusyRef` / `worldBusy`);
   - shown at most once per session;
   - "✕ / not now" means quiet for the next 2 sessions;
   - understated; no clocks, streaks or spend pressure;
   - never promise what the basket will do.
3. **Flag.** Hints are ON in dev (`import.meta.env.DEV`) and with `?hints` in the URL, and OFF in production builds. This is because of ticket 9's baseline: Amy decides when it goes live.
4. **Kids' app / COPPA.** No new personal data. No new metrics this job.
5. **Never block input.** Pointer events pass through the arrow. The toast must not cover the GardenBar, ActionBar, MoveHint, NoteToast or the minimap.
6. **a11y.** The toast is a polite live region. The arrow is `aria-hidden`. Focus is never stolen. `prefers-reduced-motion` gets a calm, static version. Text meets WCAG AA. Use Datum tokens and the existing NoteToast look rather than a new visual language.
7. **Sound** goes through `playSfx()` in `src/audio.js`, as Web Audio recipes in code with no files. It must respect the speaker toggle and first-tap unlock. It's calm, quieter than the music, and 1 s or less. The module stays sound-agnostic: it exposes `onShow` / `onDone` callbacks and the host plays the sound.
8. **Golden 4px:** spacing and radius snap to 4px as the final touch.

## Who owns what (disjoint files; no one edits another's file — message them)
| Crew | Owns |
|---|---|
| **Rowan** | `src/hints/engine.js` (+ any pure helpers like `position.js`), `src/hints/index.js`, `src/gameHints.js`, all **shared files**: `App.jsx`, `store.js`, `world/Scene.jsx` (3D→screen projection), `config.js` (flag), and `data-hint` attrs anywhere. Tests: `src/__tests__/hints-*.test.js`. Rowan sets the API first and posts it to the crew. |
| **Linden** | `src/hints/HintLayer.jsx` (arrow + toast + edge arrow), `src/hints/hints.css` (layout, look, a11y). |
| **Fern** | `src/hints/motion.css` (keyframes, timing, reduced motion) + any motion hooks agreed with Linden: arrival, bob, edge-pointing, retire, and a small "you did it" beat when she plants. The motion skills `animate` / `review-animations` are available. Calm over busy. |
| **Wren** | the new hint recipes in `src/audio.js` (e.g. `hintShow`, `hintDone`; don't change existing recipes) + WAV renders of each for Amy to hear (Python render → `/private/tmp/claude-501/-Users-amy/84d94cf5-7772-4947-a5ab-0d28f5cf622e/scratchpad/guide/sound/`). It must sit well with the existing gem chime E6→G#6→B6. |
| **Clover** | `src/gameHintsCopy.js` (all hint strings). Owns the **built-in browser pane**: plays the dev server as a 7-year-old on desktop and iPad sizes, hunts edge cases (no seed, dismiss, off-screen bed, popup mid-hint, old save that already planted), files issues to the owner by message, and runs the **retro** at the end. |

Coordination: find teammates with `ListAgents` and talk with `SendMessage`. Debate freely, disagree, and settle it among yourselves. If you're truly stuck, or it's a taste call (how a sound feels, how much drama), send it to Nathan, who takes it to Amy. Only one person runs the dev server at a time; Rowan starts it with `preview_start {name:"math-game-hints"}`. Everyone else verifies with tests or headless Chrome, and the pane belongs to Clover. Dev QA helpers: `window.__award(n)`, `window.__level()`.

## Done means
- The garden hint works end to end on the dev server: arrow on the bed, edge arrow when off-screen, the right toast for has-seed / no-seed, retires on first plant, respects the quiet budget and pauses, and stays off in a production build.
- Polished: arrival / bob / retire motion and gentle sound, both reviewed.
- `npm test`, `npm run lint` and `npm run build` are clean.
- Each of you reports to Nathan what you built, what you're unsure of, and what broke along the way. **This is an exploratory first build: misses are expected, report them plainly.**
- Retro (Clover runs it): what worked, what didn't, what to change for the next hint. Each of you writes your lessons to your own memory.
