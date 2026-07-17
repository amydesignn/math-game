# Ivy's Math World — build state & handoff

## Status (as of 2026-07-16)
**Stage A shipped locally + verified, then extended same-day on Amy's feedback.**
A tappable 3D clearing: Ivy's character walks (tap-to-move, animated) with a cube
pet trailing her, a follow camera, soft blob shadows, and scattered forest
scenery. HUD shows a gem counter (0 for now), a fading move hint, and a **live
minimap** (top-right: scenery dots + Ivy/pet dots; the rounded square IS the
playable map). The world has a real **boundary** (walks clamp to ±`WORLD.bounds`;
outside land renders muted so "the end of the map" is visible in-world), plus
**pinch-to-zoom** (iPad) / wheel (desktop). Zero console errors; `npm run build`
+ `oxlint` both clean.

**🎉 LIVE since 2026-07-16: https://amydesignn.github.io/math-game/** — public
repo `amydesignn/math-game`, auto-deploys on push to `main` via
`.github/workflows/deploy.yml` (same rails as ivy-planner). Verified live:
page + models 200, world renders, minimap tracks. Note: localStorage saves are
per-browser-per-device, so Amy playing on her own Mac gets her own world
automatically; shared iPad = shared save until the Supabase account layer.

This is V1 of a math game for Ivy (family project: Finn briefs → Oscar designs →
Nathan builds). Concept: character + pet wander a space; Ivy solves math problems
to earn gems; gems buy assets she places to build a small world.

**Staged plan** — now aligned to Finn's phased brief in Notion ("Ivy's Math World — v1 Brief", under 🛠️ Our Workshop):
- **Phase 1 — the world** (5 maps + teleport ring) ✅ DONE
- **Phase 2 — music + gem collection** (bgm/meow + sparkle-tap gems, 15 cap) ✅ DONE 2026-07-16
- **Phase 3 — shop + asset placement** (localStorage still; Supabase later per brief)
- **Phase 4 — math popup overlay** (Oscar designs the React overlay; sparkles become math gems)
- **Phase 5 — task wrappers** (water-a-tree skins) · **Phase 6 — progression** (quotas/badges)

## Phase 2 (added 2026-07-16): music + gem collection
- **Audio** (`src/audio.js`): bgm loop (Ivy's pick, `public/audio/bgm.mp3`, vol .38) +
  occasional ambient meow (`meow-cat.mp3`, every 45–100s, keyed off pet id via
  `PET_SOUNDS` — non-cat pets stay silent until they get a file). Browsers block
  autoplay ⇒ `unlockAudio()` on first pointerdown (Cozy Closet pattern). Speaker
  toggle in HUD (top-left, under gem counter); `soundOn` persists via store.
  ⚠️ Licensing (Finn's flag): Pixabay/Uppbeat tracks are fine for private beta;
  before PUBLIC launch verify game-use coverage or swap to Kenney audio (CC0).
- **Gem sparkles** (`src/world/Sparkle.jsx` + spawn/collect in `Scene.jsx`):
  up to `GEMS.perMap` (3) per map visit, positions random but kept ≥4.5 from
  gates, ≥1.8 from decor, ≥4 from spawn, ≥5 apart. Tap a sparkle = walk to it;
  walking within `GEMS.collectRadius` (1.0) collects — this proximity trigger is
  exactly what Phase 4 swaps math problems into. Burst animation, gem-counter
  pop (`gempop` keyframe), cyan dots on the minimap.
- **15-gem beta cap** (`GEMS.cap`, Finn's Cozy-Closet lesson): spawn count =
  `min(perMap, cap − gems)`, so the cap is unreachable to exceed; hitting it (or
  loading a capped save) shows the gold teaser toast "More gems coming with
  math! ✨". Do NOT raise the cap — anticipation, not a future reset.
- **Travel hardening**: `Scene` only latches its one-travel-per-visit flag if
  `App.travel()` returns true (accepted). Refusals (mid-fade) retry next frame —
  a scene can no longer lock itself out of traveling (was reachable via dev-HMR
  interrupting the fade timers).
- **Dev-only QA hooks** (stripped from prod by `import.meta.env.DEV` DCE):
  `window.__sparkles` / `__walk(x,z)` / `__dbg()` (Scene) and `__meow()` /
  `__audio()` (audio.js). Drive walks + inspect state from the console when the
  pane's phantom taps make manual QA flaky.
- **Pane QA notes (cost time this session):** `window.location.reload()` from
  javascript_tool silently no-ops sometimes — use `navigate` with `force:true`
  and CHECK `performance.now()` to confirm a fresh document; the ~10s tool
  round-trip cannot catch a 4s toast (verify via MutationObserver armed
  pre-event, or dev console.log); after many three.js reloads in one tab the
  GPU context dies (blank canvas, HUD fine) — new tab or move on to live.

## Maps (added 2026-07-16)
The world is now **5 maps in a RING** Ivy discovers by walking into **gates**
(two columns + a pulsing glow ring; the glow is the color of the map it leads
to — color IS the signpost, no text): **Forest Clearing** (teal-green) ↔
**Sunny Town** (orange sand, building-kit houses/pavilion/market) ↔ **Rosy
Garden** (pink, ruined colonnade + flower beds) ↔ **Merry Market** (yellow,
mini-market stalls/shelves/freezers/carts) ↔ **Star Arcade** (violet,
mini-arcade cabinets/claw/dance/pinball/prize corner) ↔ back to the Clearing.
Each map has exactly 2 gates (west=back, east=onward), so "forward" always
finds somewhere new and eventually leads home. Everything else is shared: same
character, same pet, same camera/minimap/bounds. **Scale lesson:** mini-family
packs (mini-market/mini-arcade/mini-forest) are designed 1:1 with the mini
characters — place at scale 1, do NOT "correct" toward real-world proportions
(1.3 made the bottle-return tower over her). The non-mini building-kit is the
exception (0.8). Left out on purpose: the arcade pack's `gambling-machine`
(slot machine ≠ kids app). More packs live in
`~/Downloads/Math game - Other 3D assets maps/` (castle, coaster, space [no GLB
— GLTF only], dungeon, skate, train, toy-car… — Amy: pick freely for future maps).
- `src/maps.js` = the whole registry: per-map ground/outside/sky colors,
  `gateColor`, decor list (props from ANY pack via a `pack` field), gates, plus
  `house()`/`pavilion()` composers for building-kit structures (BS=0.8 scale —
  full-size kit walls tower 3× over the mini characters).
- Travel: proximity check in `Scene` (radius 1.7 — forgiving because tap-walks
  stop at the ring's edge; 1.15 was too tight, real fix from QA), white fade in
  App, arrival just inside the reciprocal gate (`arrivalPoint`, pulled 2.4
  inward so it doesn't re-trigger), map-name toast, camera SNAP on scene mount
  (the fade hides it — without it the follow-cam swooshes across the new map).
- `store.js` persists `map` — she resumes where she left. Old saves merge to
  'clearing'.
- Minimap redraws per map (its own ground color + decor dots + gate dots in
  destination colors).
- `public/models/building/` = kenney_building-kit subset (12 pieces), own
  `Textures/` (texture-collision rule). Source pack in `~/Downloads/Math game/New map/`.
- Preload: current map at once, all maps after 3.5s idle — gate travel never
  pops in raw.
- **Reusable skill exists:** `~/.claude/skills/wander-world/SKILL.md` — how to
  add a map or spin up a whole new wander-world app from this template.

## Stack & layout
- **Stack:** React 19 + Vite 8 + Tailwind 3 + **react-three-fiber 9 / drei 10 / three 0.185** (matches the Ivy Planner baseline; R3F chosen so the 2D UI stays inside the house design system and Oscar can design it — Babylon would wall off the UI layer).
- **Run:** `npm run dev` (port 5180) · **Build:** `npm run build` · **Lint:** `npm run lint` (oxlint)
- **Key dirs:**
  - `src/store.js` — **the single persistence boundary.** localStorage today; swap its internals for Supabase in Stage B, screens/scene untouched. (Same pattern as the Planner.)
  - `src/config.js` — asset registry (CHARACTERS/PETS/PROPS) + WORLD tuning (speeds, camera offset, scales).
  - `src/world/` — `Scene` (ground/lights/camera/tap-marker), `Character` (tap-to-move + anim crossfade), `Pet` (follow), `Prop` + `DECOR` (static scenery), `BlobShadow`.
  - `public/models/{characters,pets,forest}/` — Kenney GLBs, **each pack keeps its own `Textures/`** (see gotcha).

## Conventions
- **Design tokens:** house iris/lilac system (subset in `src/index.css`, from `nathan-mcp-codebase-01/docs/oscar-styling-reference.md`). Gem currency = `--gem-cyan`; reward gold reserved for Stage B. HUD styling stays tokenized.
- **Assets:** Kenney Mini Characters / Cube Pets / Mini Forest — all **CC0** (commercial OK, credit optional; we credit Kenney anyway). Characters have 32 anims incl. `walk`/`idle`/`emote-yes`/`emote-no`; pets have `walk`/`run`/`idle`/`dance`/`gesture-positive`/`gesture-negative` — Stage B's correct-answer feedback is already animated (character `emote-yes` + pet `dance`).
- **Device:** iPad-first (couch game) — tap-to-move is the only verb, no keyboard. `touch-action:none` on canvas, `viewport-fit=cover` + safe-area insets on HUD.

## Critical gotchas
- **Texture-collision trap:** every GLB references its texture as the *relative* path `Textures/colormap.png`, but the three packs ship *different* colormaps under that *same* name. Keep each pack in its own folder with its own `Textures/` — flatten them together and models grab the wrong texture (a cat wearing tree bark). This is why `public/models/` has three subfolders.
- **Skinned clones:** load once, clone per instance with `SkeletonUtils.clone` (three-stdlib) and target `useAnimations` at the clone, or the shared cached scene fights itself under StrictMode / multiple instances.
- **Follow-cam + trailing pet:** a camera directly behind the character puts a trailing pet between camera and character (it looms/blocks). Fixed by a steeper 3/4 top-down `camOffset` (`[0,9,6.5]`) — keep it steep if you retune.
- **Browser-pane QA:** the preview harness injects phantom taps on load (character wanders on its own during automated QA) and letterboxes screenshots at non-tablet sizes. Neither is an app bug — verify DOM sizes via `javascript_tool` and QA at the tablet (768×1024) preset.
- **Bundle size:** ~1.15MB (319KB gz) — that's three+drei, expected. Don't chase the Vite chunk-size warning for Stage A.

## Notes
- **Supabase:** Amy chose to stage it (build the boundary now, wire before Stage B). The account architecture (parent-held magic-link auth) is decided *before* Stage B and becomes the family's account layer for the Planner + Cozy Closet too — so it's a deliberate decision, not a quick add. `store.js` is the only file that changes.
- **Math content:** times tables / mental arithmetic first (infinite to generate, tight loop, best fit for gems-in-the-world pacing), then extend to her Year 5/6 curriculum topics — `store.js` already has a `topicProgress` field for it.
- **DECIDED (Amy, 2026-07-16): gems are EMBEDDED IN THE WORLD** — Ivy walks to a glinting gem, that opens the problem, solving it collects the gem + the pet dances. Stage B = world-node architecture (gem spawner + proximity trigger + problem sheet), not a quiz modal. Amy: "it is interactive!"
- **Pinch/tap interplay:** the first finger of a pinch can trigger a walk before the second lands; the pinch handler clears `targetRef` on pinch-start so she stops. `gestureRef.pinching` also suppresses taps during + 80ms after a pinch. Keep this if touching gesture code.
- **Deploy target (planned):** GitHub Pages like the other two apps (`vite.config.js` base already set to `/math-game/` for builds). Repo not created yet.
- **Parked (Stage A scaffold, real art later):** ground is a flat uniform green — reads fine with props but Oscar's art pass will replace it; scenery positions are hand-placed placeholders.
- **Parked for-fun ideas (Amy, 2026-07-16 — "later, not now"):** (1) light background music (Cozy Closet pattern: loop + volume ~.45 + start on first pointerdown since browsers block autoplay + speaker toggle); (2) the pet sometimes says "meow" 😂 — note the cube pets already have idle/gesture anims to pair a sound with, and pet ≠ always a cat, so sound should key off the pet id.
