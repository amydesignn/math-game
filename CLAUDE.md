# Ivy's Math World — build state & handoff

## Status (as of 2026-07-16)
**Stage A shipped locally + verified.** A tappable 3D clearing: Ivy's character
walks (tap-to-move, animated) with a cube pet trailing her, a follow camera, soft
blob shadows, and scattered forest scenery. HUD shows a gem counter (0 for now)
and a fading move hint. Zero console errors; `npm run build` + `oxlint` both clean.
**Not deployed yet** (no repo/remote created) — awaiting Amy's taste pass.

This is V1 of a math game for Ivy (family project: Finn briefs → Oscar designs →
Nathan builds). Concept: character + pet wander a space; Ivy solves math problems
to earn gems; gems buy assets she places to build a small world.

**Staged plan** (Finn's ask split by real size):
- **A — playground** (character + pet moving, assets loaded) ✅ DONE
- **B — math loop** (problems → gems; times tables first, then Y5/6 curriculum) — next
- **C — shop + placement** (buy assets, drag onto the map) — the hard part (3D drag/raycast/snap/persist)

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
- **Open design fork for Amy (raised, not yet decided):** gems as a *quiz reward* (answer N → get gems) vs gems *embedded in the world* (walk to a glinting gem → that opens the problem → solve → pet dances). Nathan leans embedded — makes the walking purposeful and the math exploratory. Changes Stage B architecture (world nodes vs quiz modal), so settle before scaffolding B.
- **Deploy target (planned):** GitHub Pages like the other two apps (`vite.config.js` base already set to `/math-game/` for builds). Repo not created yet.
- **Parked (Stage A scaffold, real art later):** ground is a flat uniform green — reads fine with props but Oscar's art pass will replace it; scenery positions are hand-placed placeholders.
