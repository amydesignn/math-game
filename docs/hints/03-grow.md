# 03 — GROW (garden + progression) — grow-scout
Repo: /Users/amy/projects/math-game-explore (origin/main, read-only). Paths are under src/ unless noted.

## 1. Garden loop, end to end
**Where:** Sunny Town only (`maps.js:339` town; `gardenPlot: [-10, -2]` at maps.js:368), just inside the WEST gate that leads to Forest Clearing (gate `{to:'clearing', position:[-16,0,2]}`, maps.js:327). Not on any other map. It is in `blockers()` r=1.8 (maps.js:661) so sparkles/stations avoid it. Minimap, Door cards, Settings, ProgressPopup have NO garden mention (grep: none).
**Look:** raised wooden-edged bed, 6x3 plants all at the same stage (world/GardenPlot.jsx:55-60). Stages 0 mound, 1 sprout, 2 bud, 3 bloom; `stage=null` = empty bed (still drawn: edging+soil).
**Knobs** (config.js:282): `GARDEN = {seedEveryGems:20, waterCost:5, waterings:3}`. 3x5 = 15 gems per plant.
**Seeds:** everyone starts with 1 (`freshGarden`, store.js:110). +1 seed per 20 LIFETIME gems (`seedsOwed` store.js:743, `grantOwedSeeds` :749, called from `addGems` :629 and `migrate`). Silent: NO toast when a seed arrives (CLAUDE.md:289, backlog). Seed count is not shown anywhere except implicitly by the bar's button.
**Interaction (the only path):**
1. Tap the bed (invisible hitbox, GardenPlot.jsx:~395, `onPointerDown`) -> `Scene.walkToGarden` (world/Scene.jsx:74) walks her to `GARDEN_FRONT` 1.5 in front of the bed.
2. On arrival within `GARDEN_REACH` 2.4 -> `onGardenNear(true)` (Scene.jsx:280-290) -> App `setGardenOpen(true)` -> `<GardenBar>` (App.jsx:1462) bottom-centre ActionBar. Closes when she walks > `GARDEN_LEAVE` 4, travels, or taps X.
3. Bar states (App.jsx:1462-1482): empty+seed: hint "Your garden 🌱", btn "🌱 Plant your seed" · empty+no seed: "No seeds right now — more are on the way ✨" · growing: "Water it to help it grow 💧" + btn "💧 Water · 5 💎" (disabled + hint "Water costs 5 💎 — solve a problem to earn more!" if gems<5) · bloom: "It bloomed! Tap your flowers to pick them 🌸" (only X button).
4. Plant: `handlePlant` (App.jsx:299) -> `store.plantSeed()` (store.js:767) draws colour from shuffle bag (`gardenBag.js` drawKind; 4 kinds in config.js:301 SEED_KINDS: starter/red 🌺, pink 🌸, yellow 🌼, purple 🪻). Stage 0.
5. Water: `handleWater` (App.jsx:306) -> `store.waterPlot()` (store.js:778): spends 5 gems (balance only, never lifetimeGems/level), stage+1. Drops fall, then bed pops (~0.8s, GardenPlot `shown` trails `stage` by WATER_LAND_MS). 3 waterings: 0->1->2->3. No timer, nothing wilts.
6. Harvest: bloom bed is tapped IN THE WORLD (no button) -> flowers pop (HARVEST_MS ~0.9s) -> `onHarvest` -> App `handleHarvest` (App.jsx:321) -> `store.harvest()` (store.js:792): `harvests+1`, `basket[kind]+1`, plot emptied. Emoji flies to the 🧺 (BasketFlight.jsx, FLY_MS 760), chip ticks, toast "You picked your flowers! 🌸 They’re in your basket 🧺" (`showNote`).
7. Replant: tap bed again -> Plant (if seeds>0). Reaching bloom takes only 3 gems-spends; seeds (1 per 20 earned gems) are the pacing.
**What a harvest is worth:** NOTHING spendable yet. 🧺 Basket (ui/Basket.jsx; bottom-left, aria "Open your basket — N harvested", class `hud-basket`; card aria "Your basket") shows total + per-colour lines; empty text "Empty for now. Grow flowers in Sunny Town and pick them to fill it 🌱" (Basket.jsx:131). Exchange is parked (see 3).
**Persistence:** `store.garden = {plot:{seed:null|{kind,stage}}, seeds, seedsGranted, harvests, basket:{kind:n}, bag:{left,last}}` (store.js:104-112). Never-lose merge `mergeGarden` :210. Conservation: seeds + planted + harvests = 1 + seedsGranted.

## 2. Progression
- **Level = derived from `lifetimeGems`** (never stored, never decreases, spending doesn't lower it). `levels.js`: `requiredFor(L)`=50*(L-1) up to L10, then +100/level (:18). `levelState(points)` -> {level, into, need} (:25). `levelOf`.
- **Gems per correct answer: 1-3** (by ladder level), +1 per finished station quest (spec).
- **What a level-up gives: ONLY a celebration + team message.** `LevelUpPopup` (ui/LevelBar.jsx), messages `pickLevelMessage` (levels.js:~120): family build gets signed Finn/Oscar/Nathan rotation, guests/public get unsigned PUBLIC_MESSAGES; L10 special line. Nothing is unlocked by level: no level gate anywhere (grep for minLevel/unlock: none; Notion spec confirms "Level-ups currently give only a team message", "level system as a whole" is parked).
- **Seeds are tied to lifetime gems, not levels** — but the kid isn't told. 20 gems = 1 seed, 50 gems = 1 level: no UI links them.
- **Topics/stages "unlock" invisibly:** `maybeLevelUp(topicId)` (math.js:~327, called App.jsx:241,1146) raises the problem difficulty rung after 5 correct at the rung (never down). Rungs shown as Warm-up/Challenge/Expert only inside ProgressPopup (`STAGE_LABELS`, levels.js:44). Topics: multiplication (3 rungs), division (flat), addition (flat), fractions/decimals placeholders hidden until they have counts (topicMeta.js:51-60 `TOPIC_META`, `startedTopics`).
- **How a kid sees progress:** top-right pill `LevelBar` (App.jsx:1051, class `lvlbar-pill`, role=button, aria "Level N, x of y points. Tap to see your progress."): "Level N" + 72px track + lifetime points + gem wallet; +N floater, shine, "so close" shimmer at >=90%, level-up theatre (surge/star burst/roll ~1.35s) then popup. Tapping opens `ProgressPopup` (record book: level circle, ladder to next level, per-topic solved counts; counts only, never accuracy). No tap icon by design (LevelBar.jsx comment: press-state is the only affordance) -> discoverability gap.
- **Seasons** (`season.js`): date windows, only `halloween` Oct 1-Nov 2 (:13); decoration + Halloween popup (PromoPopup, over Door after onboarding). Nothing to do with progression. `currentSeason()` honours `?season=`.

## 3. Ticket 9 (garden popup) — UNBUILT. Spec (Notion "Luxi Math — Grow a Garden (Spec + Tickets)", 3fafda87-fbe8-818f-924d-d46580b03e6c; repo has nothing beyond CLAUDE.md:223-395)
"Suggestion popup (after the test baseline)" — points at ACTING not spending:
- Copy examples: "Your plot is empty — plant something 🌱" / "Your plant is ready — harvest it?"
- **When:** natural pauses only (after a quest ends, plant ready to harvest). NEVER mid-problem, NEVER on app open.
- **Frequency:** at most ONCE per session. **Dismissed -> quiet for the next 2-3 sessions** ("a dismissal is an answer").
- **Shape:** one action, one button.
- Gated on: a few clean baseline sessions of `garden_*` events in `play_events` BEFORE any nudging (measurement question: "once a kid plants, does she solve more problems?"; replant rate is the real signal). Measure = % plant_first, % harvest, % replant, problems/session before vs after.
- Spec principles that bind our guide too: math is the ONLY fuel; no clock/daily-return pulls (no streaks, no timers, no "welcome-back gift"); nothing wilts; wrong answers cost nothing; Luxi is "a tool not a world" (parents fear addiction); understated tone; COPPA aggregate-only metrics.
- **Clash risks for our guide:** (a) a guide that nudges "plant/harvest" contaminates ticket 9's baseline — any garden-pointing nudge shipped now changes plant/replant rates; flag to Nathan/Amy, ideally keep the guide's garden hint behind a switch or count it separately; (b) same frequency budget: two nudges in one session would breach "at most once per session"; share one nudge budget/dismissal memory; (c) same slot (natural pauses after quest end) — coordinate; (d) don't point at spending 🧺 (exchange unbuilt; 10-17 note: exchange will live in a Basket "Exchange tab", house = first prize "Home from the Garden", parked page 3fcfda87...). Also parked: more plots as level reward, seed "differences".
- Also backlog (not built): "you got a new seed!" toast (CLAUDE.md:289-290). A guide could cover this but it's Amy's backlog item; check before duplicating.

## 4. What explains growing today (onboarding / hints / labels)
- **Onboarding** (ui/Onboarding.jsx): shown once over the Door (`seenOnboarding`, App.jsx:81), re-openable from Settings > How to Play. Steps: INTRO "What is Luxi Math?" (earn gems, build a world) -> 1 Pick character & map -> 2 Explore & collect gems -> 3 Build your world -> 4 Add some sparkle -> "What's next" (Meet friends SOON, Lots more SOON). **ZERO mention of garden, seeds, levels, basket, or growing.** Garden shipped after it.
- **MoveHint** "Tap anywhere to walk there ✨" (App.jsx:1570) fades after first move; nothing on map-level goals.
- **Map arrival toast** names the map only (`MapToast`, 2.4s).
- **GardenBar hints** (above) are the ONLY garden copy, and appear only AFTER she has already walked to the bed.
- **Basket empty-state** is the single message that points a kid at Sunny Town ("Grow flowers in Sunny Town") — but only if she opens a button with no label/explanation.
- **Door**: world cards, blurbs (Door.jsx:62) — no garden card/badge.
- Level-up messages: celebratory only, mention nothing about what to do next.

## 5. Hook points (exact names)
No pub/sub in store.js (grep subscribe: none). State is read synchronously and mirrored into App React state. Hooks a guide can use:
- **Store reads** (store.js): `getState()` :459 (`.gems`, `.lifetimeGems`, `.celebratedLevel`, `.levelUps`, `.seenOnboarding`, `.garden`, `.topicProgress`, `.map`, `.played`), `getGarden()` :760, `getLevelUps()` :658, `pendingLevelUps(level)` :642. Derived: `levelOf(lifetimeGems)`, `levelState(...)`, `seedsOwed(...)`.
- **Store actions:** `plantSeed()`, `waterPlot()`, `harvest()`, `addGems(n)`, `recordLevelUp(level)`, `markOnboardingSeen()`, `recordAnswer(type, level, correct, top)`, `maybeLevelUp(topicId)`.
- **App.jsx seams:** state `garden` {stage, kind, seeds, harvests, basket, watering}; `gardenOpen`; handlers `handlePlant` :299, `handleWater` :306, `handleHarvest(from)` :321, `syncGarden(watered)` :295, `onMathAward(n)` :182 (every award -> may earn a seed; best place to detect "seed just arrived": compare `getGarden().seeds` before/after), `onLevelUp(newLevel)` :190, `closeLevelPopup` :194, `levelQueue`/`levelPopup`, `worldBusy` (App ~:553, gating for popups: don't show during math/station/placing/shop), `showNote(text)` (NoteToast), `mapId`, `showOnboarding`, `progressOpen`/`setProgressOpen`, `settingsOpen`. App already queues popups behind `worldBusy`; a guide should reuse that gate.
- **Scene seams:** props `garden`, `gardenOpen`, `onGardenNear`, `onHarvest`; constants GARDEN_FRONT 1.5 / REACH 2.4 / LEAVE 4 / PICK_Y 1.1.
- **metrics** (metrics.js:174-180): `metrics.gardenEvent(kind)` kinds `plant_first | replant | water | harvest` -> `play_events.event = garden_plant_first | garden_replant | garden_water | garden_harvest` (bare rows; whitelist enforced by metrics.test.js). Other play_events: `session_start`, `progress`, `session_end`. Any NEW guide telemetry needs a migration widening the event check + a whitelist test update.
- **Dev/QA:** `window.__award(n)` (adds gems via onMathAward), `window.__level()`, `window.__gardenSlow = n` (dev only). `?season=`.
- **No DOM events / CustomEvents** to listen to.

## 6. Pointable targets
- **3D garden bed:** world pos `[-10, 0, -2]` in Sunny Town (`town.gardenPlot`); stand-spot `[-10, 0, -0.5]` (z + 1.5). Bed footprint `BED` ~ 3.0 x 1.54 world units (GardenPlot.jsx:60), hitbox `w+0.4 x 0.8 x d+0.4` at y 0.4. A screen-space pointer can use `worldToScreen([gx, y, gz], camera, rect)` (BasketFlight.jsx; Scene already projects `[gx, 1.1, gz]` at harvest). In-world arrow/ring would be a new child of the `<group position>` in GardenPlot (or Scene), or reuse the walk-target `marker` ring (Scene.jsx:~80 `marker.current`).
- **HUD (all DOM, all absolutely positioned):** level pill `.lvlbar-pill` inside `.hud-stats` (top-right, left of minimap; ≤600px compacts to "Level · 💎"); gear button aria "Open Settings" (same row); 🧺 `.hud-basket` bottom-left (aria "Open your basket — N harvested"; steps aside <600px while garden bar is open: class `hud-basket--bar`); `GardenBar`/`ActionBar` bottom-centre (no class/id; buttons aria "Plant your seed" / "Water your plant"/ "Close"); `MoveHint` bottom-centre; `NoteToast` top-centre (top ~104-120px); Minimap top-right (no garden marker; Minimap.jsx has none); gem chip is `hudGemRef` target. Add `data-guide` attributes to these if the guide needs stable selectors.
- Note: ActionBar and MoveHint share bottom-centre; a guide card there will collide when the bar opens.

## 7. Discoverability gaps
1. **Garden is invisible to a new kid:** onboarding never mentions it; it only exists in Sunny Town (not the start map; kid must travel through gates, and the bed is on the far-west edge by the Clearing gate); nothing on Door, minimap, or HUD says "a garden is here".
2. **Seed arrival is silent** (no toast), so "gain gems -> seed -> plant" is unexplained; the 20-gem rule is not shown. The only seed signal is the GardenBar once she's already there. No seed counter anywhere.
3. **Gems -> grow link is hidden:** water costs gems but nothing teaches "gems you earn from math feed the garden". The "Water costs 5 💎 — solve a problem to earn more!" hint is the only place, and only if short.
4. **Harvest is a different gesture** (tap the flowers in-world, no button) than plant/water (bar buttons); the bar says so only at bloom. Easy to miss on phone (tiny flowers, bar only has an X).
5. **Basket is unlabelled and its purpose is open-ended** (nothing to spend on yet) — guide must not promise a payoff (exchange/house is parked).
6. **Levels do nothing visible**: no unlock, no "next at level N", no link between level, gems and seeds. Level bar has no tap affordance by design; ProgressPopup (record book) is undiscovered. Topic rungs (Warm-up/Challenge/Expert) are only visible inside that popup; no one tells her harder problems = more gems per answer (1-3).
7. **No "what to do next" after level-up** (messages are pure celebration).
8. **Tone/spec constraints** (limit what a guide may say): no urgency, no streaks/clock, no "don't lose", math-first, understated.
