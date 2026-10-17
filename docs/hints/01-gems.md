# 01 — GEMS (gem-scout). Source: /Users/amy/projects/math-game-explore (origin/main)

## 1. Every gem source
Everything funnels through `store.addGems(n)` (store.js:622-632): `lifetimeGems += n` (n>0), `gems += n` (floor 0), `grantOwedSeeds`, `save()`. No cap (retired 2026-07-18, config.js:255-262). App wrapper `onMathAward(n)` App.jsx:183-187 (also bumps `points`=lifetimeGems for the level bar, and `syncGarden`).

| Source | Trigger | Payout | Limits |
|---|---|---|---|
| **Map sparkle** | Walk within `GEMS.collectRadius`=1.0 (Scene.jsx:258-276) or tap it (Sparkle.jsx `onPointerDown` -> `walkToSparkle`, Scene.jsx:169). Opens MathPopup (skin always `SKINS.feedPet`, App.jsx:174). Correct answer -> `onAward(problem.gems)` after 620ms (MathPopup.jsx:37,65) | `problem.gems`: long-mult = ladder level (1/2/3, math.js:147); mult-2x1, add-2x2 = 1 (math.js:162,177); long-div = `divGems` (flat 1 in DIV_PHASE 1; 2, or 3 if sneaky-zero, in phase 2; math.js:92) | `GEMS.perMap`=3 sparkles per map visit (config.js:268, Scene.jsx:37-55). Re-scatter on every map entry AND every `REFRESH.periodHours`=3h window (Scene.jsx:100-113). Effectively unlimited. Wrong answer = worked example, then retry same sparkle; closing unsolved re-arms after walking >2.6 away (`cooling`, Scene.jsx:92). Sparkle is 1 gem, not "3 gems": the 3 flying gems are visual only. |
| **Station quest** | Walk within `STATION.reach`=1.7 of glowing orb ring (Station.jsx; `onStationReached` App.jsx:230) or tap it. 2 problems (`STATION.length`) | Per-problem `gems` (same table as above) + completion bonus `STATION.bonus`=1 (config.js:245-251, StationPopup.jsx:86-100) | 2-3 of the 5 maps host one per 3h window (`STATION.perDayMin/Max`, stations.js:52-80; plan rebuilt when `currentWindow()` changes). One skill per station. Completing marks `completed` -> gone until next window (store.completeStation:829). Unfinished closes resume at `solvedCount` (store.setStationSolved:820). Together meadow never hosts. |
| **Free sparkle (not gems)** | After a *completed* station, 25% chance, no active trail (App.jsx:256-265) | Pink/blue cosmetic trail, toast "A free sparkle for you! ✨" | cosmetic only |
| **Seasonal promo** | Halloween popup over the Door, once (`claimPromo` store.js:577; PROMO.gems=3, PromoPopup.jsx:28-34) | +3 gems, paid the moment it shows | Oct 1-Nov 2 2026 only, `promos[]` dedupe. Skipped while onboarding is showing (App.jsx:141). |
| **Level-ups** | `levelOf(lifetimeGems)` (levels.js) | **No gem payout** — a message popup only (LevelUpPopup) | — |
| **Garden / harvest** | — | **Never pays gems.** Garden *spends* gems (water 5 each, GARDEN.waterCost) and *seeds come from* lifetime gems (1 per 20, `seedEveryGems`). Harvests = basket items. | — (grow-scout's slice) |
| **Streaks / daily login / badges** | **None exist** (`grep -ri streak` = only a comment "no streaks", config.js:274). | — | — |
| Migration refunds | `retireBetaCap`/`migrate` top-up (store.js:352,399-410) | one-off, silent | not player-facing |

Payout reality for a new guest: topic `currentLevel` starts at 1 -> a sparkle pays **1 gem**; a 2-problem station pays ~2 + 1 bonus = **~3 gems**. Level L needs 50 lifetime gems (levels.js:21) -> first level-up ~50 correct answers.
Sparkle mix: 70% frontier / 30% confidence (math.js `nextProblem`); station topic roll math.js:300 (35% mult, 35% div, rest mult-2x1/add-2x2).
Wrong answers pay nothing; no penalty. Sink side: water 5, shop 2-150, sparkle trail 2-4.

## 2. First 60 seconds, fresh guest
1. Boot -> **Door hub** every time (App.jsx:~37). `seenOnboarding=false` -> `<Onboarding>` auto-opens over the Door (App.jsx:81,1217). 6 steps (Onboarding.jsx:45-70 + What's next): Welcome ("Answer questions to earn gems, then spend them building a world"), 1 Pick character/map, **2 "Explore & collect gems — Visit the gem and bonus stations and answer math questions"**, 3 Build, 4 Add sparkle, What's next (Meet friends SOON...). Media = `/onboarding/step-N.jpg`. Dismiss -> `markOnboardingSeen()` runs on show (App.jsx:87), so a skipped/closed walkthrough never returns (only via gear -> How to Play).
2. Door: gem counter pill in `Hero` (Door.jsx:177), plus **"Today's Quest — Visit {World} to earn gems  +N 💎  · Refreshes in Nh"** strip (Door.jsx:205-217, built by `todaysQuest()` App.jsx:817-826). Caveat: `+N` = only `station.bonus` (=1), under-states the real ~3.
3. Tap Play -> `enterWorld(id,[0,0])` (App.jsx:789): `markPlayed()`, map name toast 2.4s, spawn at centre. Clearing/Sunny Town etc.
4. In-world HUD: **LevelBar** top (Level N · bar · lifetime points · teal 💎 wallet; tap opens ProgressPopup — aria says tap, **no visible cue**, LevelBar.jsx:108-128), minimap top-right with sparkle dots + station dot (Minimap.jsx), rail (Exit/Cart/gear). Nothing says what the minimap dots mean.
5. Only guidance: `MoveHint` pill "**Tap anywhere to walk there ✨**" (App.jsx:1553, shown until first pointerdown, `moved` App.jsx:35,900,1071). It never mentions gems.
6. World: 3 floating cyan octahedron gems with pulsing ground ring (Sparkle.jsx) >=4 units from spawn, ~5 apart, not in view necessarily; 0-1 station orb (colored ring, floating marker emoji + quest label, Station.jsx) -- station is NOT guaranteed on the map she lands in.
7. What she must *figure out*: (a) the cyan floating crystals are collectable (no label/arrow/sign; tap OR walk both work); (b) walking into one auto-opens a math card (surprise—no "tap to start"); (c) the gem count in the HUD is the wallet, bar is levels. Math itself needs ~2-digit x 2-digit multiplication, so first card is the real hurdle.
8. First correct answer: card CorrectState "+1 💎" (MathPopup.jsx:158-171, skin.win "Yum! Your pet is happy."), 3 gems fly to the HUD pill (FlyGem, mathkit.jsx:590, chime `playSfx('gem')` x3 over ~2.8s, audio.js:121), pet dances 4s (`onPetReact`), sparkle bursts; LevelBar fills.

## 3. What explains gems today / weak spots
- **Onboarding** step 2 & Welcome (Onboarding.jsx:45-52): the only text "answer math to collect gems". Weak: shown once over the Door, before any world; carousel text only; not re-surfaced; if dismissed/auto-seen on show it's gone. Doesn't say what a gem looks like in the world, that stations differ from sparkles, or what gems are *for* beyond 'assets'.
- **Door quest strip**: good teaser, understates reward, names a world not a place on the map; absent when no live station.
- **MoveHint**: movement only.
- **Gem-flight + chime + popup `+N`**: strong *post-hoc* confirmation. Station intro card says "finish them all for a bonus gem!" (StationPopup.jsx:156, "Finish-the-quest bonus: +1" :161) — the one clear pre-explain, but only after reaching a station.
- **Garden hint** (App.jsx:1478): "Water costs 5 💎 — solve a problem to earn more!" — the single in-world line that links gems to solving.
- **Missing**: no label/arrow on sparkles; no "N gems left on this map"; no pointer toward nearest sparkle/station except minimap dots; nothing explains minimap dots, level bar vs wallet, why payouts differ (1/2/3), that stations refresh every 3h, or what to spend on. Shop empty-state/"can't afford" nudge not checked here (build-scout). Level-up popup is pure praise, no "what now". No toast on first gem. Seeds earned from gems (1 per 20) are only noticed in the garden.
- Teal=gem is a consistent color language (hud/LevelBar/mathkit.jsx:53); gem icon is one component (`GemIcon`, hudkit.jsx:7; `Gem` in mathkit).

## 4. Hook points (exact names)
**Store (src/store.js):**
- `state.gems`, `state.lifetimeGems` (0 = never earned; >0 = first gem earned). `addGems(n)` (store.js:622) is the single choke point — add a `firstGemAt`-style flag / event there.
- `state.played` (set by `markPlayed()`, App.jsx:773) = has entered a world. `state.seenOnboarding` / `markOnboardingSeen()` (store.js:563).
- `state.topicProgress[topic].byLevel[n].seen/correct`, `recordAnswer(topicId, level, correct, topLevel)` (store.js:~660) — counts answers; `topicProgress` empty = never answered.
- `state.stations` {window, byMap{skinId,problems,solvedCount,completed}}; `completeStation(mapId)`, `setStationSolved` (first station opened = any `solvedCount>0` or `completed`).
- `state.celebratedLevel`, `state.levelUps`, `recordLevelUp`, `pendingLevelUps` (level-ups).
- `state.promos[]`, `hasSeenPromo(id)` / `claimPromo(id,gems)` — **a ready-made "seen once + paid" ledger keyed by id; a guide could reuse the same pattern** (or add e.g. `state.guide = {...}`).
- `state.garden.seeds / seedsGranted / harvests`; `seedsOwed()`.
**App.jsx callbacks (all in `App()`):** `onSparkleReached(sparkleId)` (:174, math card about to open), `onMathAward(n)` (:183, after correct sparkle OR station problem), `onMathClose(solved)` (:203, sparkle solved/closed), `onStationReached()` (:230), `onStationResult(problem, correct)` (:239), `onStationClose({completed, solvedCount})` (:243, completed -> bonus + free-sparkle toast), `onLevelUp(newLevel)` (:189), `closeLevelPopup` (:193), `closeOnboarding` (:89), `enterWorld(id,pos)`/`goToDoor()`/`onPlay`/`onResume` (:~760-810), `showNote(text)` toast helper (NoteToast, :1530) and `setToast` (MapToast). `moved` state (:35). Existing local UI state: `math` (card open), `station`, `shopOpen`, `progressOpen`, `gardenOpen`, `levelPopup`.
**Scene.jsx:** `collect(id)` via `collectFnRef`; `sparklesRef.current` (live uncollected sparkles {x,z}, written by Scene, read by Minimap) — a guide can point at `sparklesRef.current[0]` or `stationRef.current` {x,z,color}; `charPosRef`, `targetRef` (move target); `refreshKey` (3h window).
**metrics.js (anonymous aggregate -> Supabase `play_events`, INSERT-only, off in DEV unless `?metrics`):** `enteredWorld`, `travelled`, `leftWorld`, `answered(correct)` (every 5 problems -> `progress` row), `questDone()`, `gardenEvent('plant_first'|'replant'|'water'|'harvest')`, `startMetrics`. Events: `session_start`, `world_enter`, `progress`, `session_end`, `garden_*`. COPPA: no ids, no per-user rows, counts are deltas -> **cannot be used to drive a guide, only to measure it**; adding new events (e.g. `guide_step`) would follow `gardenEvent`'s bare-row pattern and `GARDEN_EVENTS` allow-list (metrics.js:~170).
**Audio:** `playSfx('gem')` (audio.js:121; QA `window.__sfx`), `setFocusMode`. **Dev QA:** `window.__award(n)`, `__level()`, `__stations`, `__forceStation`, `__sparkles`, `__rollRefresh`.
Also `mathBusyRef.current` = "a problem UI is up" gate—guide must respect it (App.jsx:170, Scene.jsx:258).

## 5. Seen/once flags and save/migrate pattern
- Persistence: `KEY='math_world_v1'` localStorage via `writeLocal()`, `save()` stamps `lastActive` and `scheduleCloudPush()` (store.js:451-456, 2s debounce). Cloud push guarded by `cloudLedger` (never regress lifetimeGems).
- Flat fields in `freshState()` (store.js:17-86); new fields get defaults for old saves via `{...freshState(), ...parsed}` (`migrate`, store.js:338-340). `load()` returns freshState **without** migrate for brand-new players (so `seenOnboarding:false` only for truly fresh); migrate sets `seenOnboarding=true` when `parsed.seenOnboarding===undefined` (:364) — **the pattern to copy: a new guide flag defaulting `false` in freshState would show to ALL existing players (default from merge) unless migrate seeds it `true` for old saves** (use `if (parsed.guide === undefined) merged.guide = {done:true}` or derive from `played`/`lifetimeGems`).
- Existing flags: `seenOnboarding` (+`markOnboardingSeen()`, marked on SHOW not on finish), `promos[]` (id list, `hasSeenPromo`), `played` (`markPlayed`), `celebratedLevel`/`levelUps`, `capRetiredAt`, `garden.seedsGranted` (idempotent grants). Cloud merge (store.js ~180-200, 399-410) takes max/union of ledgers — a guide flag must be merge-safe (monotonic booleans/sets = fine; mirror `promos` union).
- `metrics.js` keeps one non-state localStorage key: `luxi.lastPlayDay`; `luxi.account` for auth.

## Discoverability gaps (ranked)
1. **Sparkles carry no meaning in-world**: no label/arrow/"gem" cue; cyan crystal + ring only. A kid doesn't know to walk into it; the math card appears unannounced.
2. **Onboarding sits on the Door, before a world exists**, text-only, marked seen on show; zero in-world follow-up. Gems->build->grow is one sentence of three.
3. **No first-gem moment**: the first +1 flight is great but nothing says "this is your wallet, spend it in the 🛒 / garden" at the exact moment it lands (hook: `onMathAward` when `lifetimeGems` goes 0->1).
4. **Stations are not introduced** (a 2-3-in-5-maps, 3h, bonus-gem thing) except by the Door strip that under-reports (+1 vs ~3); the minimap dot has no key.
5. **Wallet vs level bar** conflated: points + gem pill in one bar, bar tappable with no visible affordance (LevelBar.jsx:123 comment admits press-state is the only cue).
6. **Spend path unseen after earning**: gem counter never prompts; garden seed-at-20-gems and water-at-5 only surface once she opens the garden; level-ups are praise-only with no "go build" CTA.
7. Payout variance (1/2/3, bonus) and refresh cadence never explained; "wrong answer pays nothing but teaches" is implicit.
