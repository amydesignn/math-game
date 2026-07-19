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
- **Phase 3 — shop + asset placement** ✅ DONE 2026-07-16 (localStorage still; Supabase later per brief)
- **Phase 4 — math popup overlay** ✅ DONE 2026-07-16 (Oscar designed, Nathan lifted + wired; sparkles ARE math gems now)
- **Phase 5 — task wrappers** (station mini-quests) ✅ DONE 2026-07-17 (Oscar's Station Pack lifted; 6 skins, farewell, sparkle consumable next) · **Phase 6 — progression** (quotas/badges)

## Phase 4 (added 2026-07-16): THE MATH LOOP
- **Oscar's handoff** = `~/Downloads/math-popup-flow.html` (self-contained comp).
  Lifted 1:1 into `src/ui/MathPopup.jsx` (tokens, skin banner, keypad, ask /
  correct / recover states, flying gems) + `src/math.js` (his `buildStages`
  worked-example builder + Nathan's infinite problem generator). Adaptations
  (logged in Notion): gem PNG → house SVG (`src/ui/Gem.jsx`, shared with HUD),
  `onClose(solved)`, `onResult(correct)` seam, physical-keyboard input.
- **The loop:** walking into a sparkle (radius 1.0) opens the quest — she
  STOPS (target cleared), meow holds (audio focus mode), bgm keeps playing.
  Solve → 3 gems fly to the HUD counter, +1 awarded (cap-clamped in store),
  sparkle bursts, pet `dance` + character `emote-yes` for 4s (via
  `reactUntilRef`, checked in each one's useFrame). Wrong → step-by-step
  column-math worked example on a SIMILAR problem (matching carry profile —
  `nextProblem()` guarantees it), then "try yours again". Close unsolved →
  gem stays; it re-arms only after she walks >2.6 away (`cooling` set in
  Scene) so it can't instantly reopen underfoot. Re-approach = fresh problem
  (deliberate: kinder than trapping her on one she's dodging).
- **Topics (C1 landed 2026-07-17):** `math.js` has a typed-topic registry —
  `long-mult` (2×2-digit, the C1 frontier) + `mult-2x1`/`add-2x2` (confidence
  pool). Long-mult ladder L1→L3 graded by CARRY ANATOMY (L1 none / L2 one
  partial / L3 both+addition); similar problems LEVEL-matched. Mix = 70%
  frontier / 30% confidence. `topicProgress` is per-level:
  `{topicId: {level, byLevel:{n:{seen,correct}}, topResults(last-10 @ top
  level w/ dates), mastered}}` — mastery = Finn's 8/10-at-top-across-2-days;
  level-up after 5 correct at rung, never down. ⚠️ Everything marked
  `FINN-SPEC` in math.js is PROVISIONAL DATA awaiting Finn's C1 topic spec +
  Amy's workbook calibration problems (those become CI test fixtures —
  vitest gets added with them). The curriculum roadmap (C1–C5 + gem economy,
  all blessed) lives in the Break Room thread + the Notion brief's 📚 section.
- **ColumnMath is a ROWS model now** (`{cols, rows:[{id,cells,lead?,note?,
  style?}|{rule}], hi:['id-colIdx']}`) so partial-product rows fit; all
  builders emit it. Long division (C2) slots in as more rows.
- **Award hardening:** the gem award rides a plain setTimeout, NOT the
  requestAnimationFrame that animates the flight — rAF starves in hidden/
  throttled windows (pane QA, iOS low-power) and the award must always land.
- **Task wrappers ready:** SKINS has `feedPet` live; Phase 5 skins = one new
  entry each (Oscar's architecture note, preserved verbatim in the file).
- **QA notes:** the popup is plain DOM — testable with dispatched
  KeyboardEvents (`window` listener) and button clicks; dispatch each key in
  its OWN javascript_tool call (same-tick bursts hit a stale `entry` closure —
  humans can't type that fast, QA can). In the hidden Browser-pane window,
  rAF (and thus ALL R3F movement/anims) only ticks while a screenshot is
  being taken — interleave screenshots as the frame pump, and never diagnose
  "the character is frozen" from JS polls alone.

## 🔜 NEXT UP — Phase 5-A: the level bar + level-up popup
**Oscar's design package lands with Amy. Decisions are LOCKED — do not re-derive them.**
Full spec: Notion → "🎮 Phase 5: Level Ladder — Decisions & Specs" (child of the v1 Brief).

- **ONE accumulator — and it already exists.** The spec calls it `totalPoints`; that is
  exactly `lifetimeGems` (increments on every award, never decremented by
  spending, difficulty-weighted). **Do NOT add a second field** — two counters
  with identical semantics silently drift, and a fresh `totalPoints: 0` would
  erase her history, which is the whole thing this feature exists to prevent.
  Her record already survived the cap-retirement refund, so the bar is truthful
  from the first frame. Station completion bonuses DO count ("point equals any
  gem she collected").
- **Level rule (Amy's, canonical):** every **50 points** below Level 10, every
  **100** at 10+. The earlier quadratic `25L(L−1)` is RETIRED.
  ```
  required(L) = L <= 10 ? 50 * (L - 1) : 450 + 100 * (L - 10)
  level(P)    = P <  450 ? Math.floor(P / 50) + 1 : 10 + Math.floor((P - 450) / 100)
  ```
  Verified round-tripping to Level 40. Ivy is Level 2 today; next at 100.
- **Never resets.** On level-up the bar becomes a partially-filled "in progress"
  bar toward the next level. Totals render abbreviated above 1,000 → `1K`.
- **Retroactive popups DO fire** (Amy overruled the caution): if migration puts
  her at Level 2, she gets the Level 2 popup; if she'd earned two, she gets two.
  The popup is not a notification — it's how Oscar/Nathan/Finn send her a
  compliment. Pool of 12 + a Level-10 special, rotate randomly.
- **Difficulty labels are UI-only:** L1/L2/L3 stay in the data model; Ivy sees
  **Warm-up / Challenge / Expert**. She must never see "L1" anywhere.
- **No accuracy, ever.** Counts only — show what she's done, never grade what she
  missed (Design Principle 4).
- Phase names are **5-A** (bar + popup) / **5-B** (tap → history) / **5-C**
  (badge book, roadmap only) — "Phase 1" already means "The World".

⚖️ **Load convention (Amy, 2026-07-18):** flag load proactively, park ideas by
default, shift art/composition/pedagogy to Oscar/Finn, and **wait for design
rather than guessing** — a placeholder that gets rebuilt costs more than waiting.

## ⚰️ The 15-gem beta cap RETIRED (2026-07-18)
**The bug that retired it:** Ivy farmed to the 15-gem cap, then solved 6 more
problems. The app told her she was correct each time and paid her **nothing**.
Effort with no reward is the one thing this app must never do — and it's the
exact inversion of why the cap existed. The cap was right for the pre-math beta
(gems were free to collect; a cap made anticipation instead of an unlimited
balance that later resets — Finn's Cozy Closet lesson). The moment MATH became
the way gems are earned, the same cap started punishing correct answers.
- `addGems` no longer clamps; `GEMS.cap` is gone (config carries the reasoning).
- **Sparkle spawn** was `min(perMap, cap − gems)` → now just `perMap`. At 21 gems
  the old formula spawned ZERO sparkles, so a capped player also lost the world.
- The **"More gems coming with math! ✨" teaser is deleted** — with math live it
  had become a lie, and it was the message she saw while being paid nothing.
- **One-time refund** (`capRetiredAt` in store.js): gems the cap swallowed are
  paid back from the lifetime ledger — `rightful = lifetimeGems − spent`, and it
  only ever tops UP, never takes away. This is exactly what `lifetimeGems` was
  added for ("the cap retires with ZERO loss").
- ⚠️ `save()` now runs **once on boot** so that migration persists. Without it the
  refund re-ran every load — harmless for assets (spend is reconstructed from
  owned/placed) but a **free-gem exploit for CONSUMABLES**, since a spent sparkle
  can't be reconstructed as "spent". Verified: buy a sparkle → reload → no refund.
- The economy now self-limits by what a problem pays (ladder level) + the refresh
  cadence. An uncapped balance is also what makes the aspirational shop tier
  (50–150 gems) worth saving toward.

## Phase 5 (added 2026-07-17): STATION mini-quests (Oscar's Station Pack)
- **Oscar's handoff** = `~/Downloads/delivery — station + sparkle packs/`
  (`math-station-flow.html` + README + PNGs). Lifted per Oscar's ship order.
  Scope FENCE honored: farewell variants H/I/J + alternate ring motions live in
  `math-station-playground.html` and are RESERVED for a later "special stations"
  drop — NOT built. V1 farewell = the one universal white dissolve.
- **Shared kit (`src/ui/mathkit.jsx`)** — the reusable math atoms (T tokens,
  Sparkles, BigButton, EquationRow, ColumnMath, MultiColumnMath, Keypad,
  WorkedExample, FlyGem, useKeyInput) were EXTRACTED here so MathPopup and
  StationPopup share them, not copy them (Oscar's rule: "shared modules, not
  copies"). MathPopup slimmed to its own state machine + re-exports SKINS.
- **`src/ui/skins.js`** — the 6-skin RELEASE SET (feedPet/waterTree/bakery/
  flowers/arcade/starParty): each drives BOTH a single sparkle (tag/paw/accent/
  ask/win) AND a station quest (marker/asset/glow/questLabel/stepNoun/questAsk/
  stepWin/questWin). Adding a skin = one entry.
- **`src/ui/StationPopup.jsx`** — the quest spine around the popup: intro →
  per-problem ask → stepdone → recover (worked example) → complete (distinct
  amber bonus burst). Per-problem `gems` = ladder level; a completion `bonus`.
  Awards ride plain timers (rAF-starve hardening), only flights use rAF.
- **`src/world/Station.jsx`** — the 3D world node: skin-colored pulsing ring +
  glowing orb + drei `<Html>` marker/quest-label + oversize hitbox. FAREWELL =
  a ~1.6s universal SILVER-WHITE dissolve (orb rises/shrinks/whitens + white
  bloom + shockwave) driven in-component; App flips `farewell` for 1750ms.
- **Daily plan (`src/stations.js` + store `stations` field)** — `ensureDailyStations()`
  picks STATION.perDayMin..Max (2–3) of the 5 maps once per day, gives each a
  distinct skin + `generateStation(2)` (ONE topic/skill per station, frontier-
  weighted, current level) + a clear spot. `stationFor(mapId)` returns today's
  live (uncompleted) station. Kept OUT of the store to avoid the math.js↔store
  import loop.
- **Spawn/proximity** in Scene mirror the sparkle loop (STATION.reach opens,
  STATION.rearm re-arms after an unfinished close — resumes at the unsolved
  problem, never resets). Minimap draws a skin-colored station dot.
- **lifetimeGems** — every EARNED gem now also accrues to `state.lifetimeGems`
  in `addGems` (before the balance cap), and a retroactive seed on load
  (`gems + Σ price of owned/placed`) means the 15-gem cap can retire later with
  ZERO loss. The economy's badges will read this ledger.
- **QA hooks (dev only):** `window.__stations()` (today's plan) and
  `window.__forceStation(mapId, skinId)` (inject a station for deterministic
  testing — spawns are random across 2–3 maps/day; force + reload to mount).
- **NEXT in this delivery = the Sparkle Pack** (`handoff — sparkle pack.md`):
  a "Magic" shop category selling a 15-min consumable sparkle trail
  (buySparkle/activateSparkle/giftSparkle, sparkle bar, quiet expiry). Separate
  seams, ships as its own deploy.

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
## Phase 3 (added 2026-07-16): Gem Shop + asset placement
- **Shop** (`src/ui/Shop.jsx` + `SHOP` catalog in config.js): bottom sheet on
  the 🛍️ HUD button; 20 items from forest/market/arcade packs (emoji + name +
  price, 2–6 gems); tap tile → Buy pill → buying closes the sheet and enters
  placement. "Your things" shelf = bought-but-unplaced (a cancelled placement
  lands there, nothing is ever lost). Functional Nathan UI on house tokens —
  Oscar may reskin later (offer him the lift pattern in reverse).
- **Economy note:** the 15-gem cap limits the BALANCE, not lifetime earnings —
  spending frees room, so sparkles keep coming once she shops. This is the
  intended loop (cap → anticipation → spend → more to find).
- **Placement** (`src/world/Ghost.jsx` + Scene/App wiring): ghost = cloned GLB
  with per-mesh cloned transparent materials (NEVER mutate the shared cache) +
  pulsing iris ring; while `placing`, canvas taps position the ghost instead of
  walking (sparkle taps disabled too); ↻ rotates 45°; ✓ Place writes
  `{id, asset, pack, x, z, rot, map}` via the store; gate guard refuses spots
  <2.4 from a gate (NoteToast explains). Tap a placed asset → gold ring +
  Move/Rotate/Put-away/Done bar; ground tap deselects. Placed assets draw as
  lilac dots on the minimap; sparkles won't spawn inside them.
- **Error boundary** (`main.jsx` `<Oops>`): any render crash → friendly
  tap-to-reload card (kids never see a blank page; localStorage is untouched).
- **BUG CLASS to watch (cost this session a crash):** App.jsx computes derived
  values eagerly between hook blocks — a top-level `const` referencing a hook
  declared LOWER in the component is a temporal-dead-zone ReferenceError that
  kills every fresh mount, while already-mounted HMR'd docs keep working (so
  dev QA can look green while fresh loads are dead). `placedHere` did exactly
  this. Keep derived consts BELOW all the state they touch, and gut-check any
  "worked in HMR, blank on reload" symptom against this first.
- **Pane QA notes (cost time this session):** `window.location.reload()` from
  javascript_tool silently no-ops sometimes — use `navigate` with `force:true`
  and CHECK `performance.now()` to confirm a fresh document; the ~10s tool
  round-trip cannot catch a 4s toast (verify via MutationObserver armed
  pre-event, or dev console.log); after many three.js reloads in one tab the
  GPU context dies (blank canvas, HUD fine) — new tab or move on to live.
  Synthetic canvas taps MUST dispatch pointerdown AND pointerup with the same
  pointerId — a down without its up leaves a phantom finger in App's pointer
  map and the SECOND stray latches pinch mode, silently eating every tap.
  And an empty #root + "error in <App>" with working WebGL = YOUR crash, not
  the pane (see the TDZ bug class above) — check webgl2 availability before
  blaming the GPU.

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
