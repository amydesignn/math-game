# Trail crew: Job 1 retro (in-game hint, garden use case)

Run by Clover, 2026-10-17. Branch `feat/garden-hint`, committed locally as `184d9f9` (not pushed).
Crew: Rowan (engine), Linden (UI), Fern (motion), Wren (sound), Clover (copy + QA).

## Outcome
The garden hint works end to end on the dev server. In Sunny Town, after 4 s of calm, a kid who has never planted sees an arrow on the bed and the toast "Plant your seed in the garden 🌱".
- When the bed is off-screen, an edge arrow points to it.
- Popups pause the hint.
- When the GardenBar is open, only the arrow shows.
- Planting plays the done beat and `hintDone`, and the hint retires for good.
- The hint is off in production unless the URL has `?hints`.

378 tests pass, and lint and build are clean. Water was kept OUT of scope; it's a candidate for hint #2.

## QA results (Clover)
Screenshots are in `scratchpad/guide/qa/`.

| Edge case | Result | Evidence |
|---|---|---|
| Fresh guest, first session | **FAIL, then fixed, then PASS.** The engine was never given a session on boot, so the hint was blocked forever. Rowan fixed it the same hour. | 01, 02, 04 |
| No seed | **N/A by design.** A kid who never planted always holds ≥1 seed (the store's conservation law). There's a fallback line, but nothing can reach it. | code |
| Already planted (old save, harvests > 0) | PASS: never shows | pane |
| Ivy-shaped pre-garden save (27 seeds, never planted) | PASS: shows, but only after the 9 queued level-up cards | pane |
| Dismiss ✕ | PASS: +0 oscillators, the tap doesn't walk her, quiet for 2 sessions, back on the 3rd reload | pane |
| Target off-screen | PASS: edge arrow points left and slightly up, toward the bed | 03, rm-ipad-edge, desk-edge |
| Popup mid-hint (maths) | PASS: paused, then back. *Note: it comes back ~0.5 s after the popup closes, without a fresh calm wait.* | pane |
| GardenBar open | PASS: arrow only, no toast | 05 |
| Plant → retire | PASS: done beat, hintDone +4, gone in ~570 ms, stays retired after reload | 06 |
| Reload | PASS: one session per load (StrictMode safe) | pane |
| Travel between maps | PASS (per spec): leaving town → 'left', and it doesn't come back this session | pane |
| Reduced motion | PASS: only opacity transitions, transform none, static edge arrow | rm-ipad-* |
| Desktop 1280×800 | PASS: no overlap with HUD, minimap, 🧺 or Settings | desk-* |
| Sound | PASS: hintShow +2, hintDone +4, dismiss 0, silent before the first tap, yields during the gem chime. Speaker OFF was checked in code only, not measured. | pane |

## What worked
- **Copy checked against code before anyone built.** The conservation law showed that the "no seed" branch can't be reached and that "Level up and get your first seed" was false. Rowan's retire rule came straight from it. (Clover)
- **Early API, then adopting a better shape.** Rowan took Linden's `hint + exitReason` over his own phase field, so nothing had to be rebuilt. (Rowan, Linden)
- **Tracing the real action path.** She plants FROM the GardenBar, so pausing on the bar would have killed the done beat. Going arrow-only saved it. (Rowan)
- **One sync contract in milliseconds between motion and sound.** Arrival lands at 120 ms on note 2; the done peak lands at 270 ms on E7. It matched on the first try. (Fern, Wren)
- **Deterministic headless tools.** These were Fern's frame harness (it caught 2 easing bugs), Linden's measured HUD rects (zero overlaps), and Clover's CDP script for reduced motion and desktop.
- **Wren rendered the WAVs with the same synthesis as the code,** so Amy hears what ships. The `yields` flag stops a hint sound from stacking on the gem chime, in one line.
- **Pure helpers and a fake clock.** Six deliberate code breaks each failed the suite. (Rowan)

## What didn't
- **Names didn't resolve and there was no ListAgents.** Messages went through Nathan until he handed out IDs. (everyone)
- **The fresh-save blocker reached the pane.** Every unit test called `beginSession` itself, so none of them tested the real boot path. (Rowan)
- **The world target height was picked without looking.** Aiming at flower height put the point in the toast's band, so the arrow pointed UP. It was caught headless. (Rowan, Linden)
- **Hook and motion names crossed in flight.** Linden and Fern each adopted the other's names, which cost two extra rounds.
- **Dev-server race.** It was up before anyone announced it, and HMR reloads mid-QA wiped my test hooks and bumped the session counter.
- **Sampled vs measured.** An exitMs flip-flop (1000 → 700) came from a misread number.
- **The pane screenshots at a tiny scale.** I had to switch to headless Chrome over CDP for screenshots good enough to judge.
- **Open review:** `/review-animations` is user-invoke only, so the motion sign-off is still owed.

## Change for the next hint
1. **Post agent IDs in the brief.**
2. **One owner posts the DOM contract first, and everyone acks before building.** Linden posts the hooks, then Fern posts motion against them.
3. **Add a wiring test that boots the host path the way App does:** fresh storage → begin → update.
4. **Take a "stand on the target" screenshot at all 3 sizes before calling any world target done.**
5. **Announce the dev server in the same move as starting it.** Ask "measured or sampled?" before acting on a number.
6. **Clover's QA kit is reusable:**
   - Wrap `createOscillator` to count sounds.
   - Use `__sfx('gem')`, not `__award`, for stack tests.
   - Seed saves by blocking `setItem` before a reload, so the pagehide flush can't overwrite them.
   - Use headless Chrome with `--force-prefers-reduced-motion` over CDP.

## Open for Nathan / Amy (taste calls)
1. **Resume after a popup:** it's instant (~0.5 s). Should it wait for a fresh calm period?
2. **Leaving town mid-hint uses up that session's nudge.** A kid who wanders into Rosy Garden (the decoy garden) and comes back gets no second arrow until a reload.
3. **Session = one page load,** so two reloads end a "not now". Is that the budget Amy means?
4. **The word "garden" in the toast** shares a name with the Rosy Garden map, the playtest decoy. In town the arrow resolves it. Keep it, or switch to "Plant your seed here 🌱"?
5. **Fern's bolder done beat** (`boldDone`, off by default) vs the calm one.
6. **Should `?hints` be able to turn hints on in a production build?** (Rowan's reading)
7. **Next hint candidate: water (#2).** After planting she had 3 💎 and water costs 5. That's the playtest's stuck #3. Show it when the plot is growing, gems < 5, and she's away from the bed. It needs one config entry plus a copy line, with no spend nudge.

---

## Addendum: Amy's review 1 + job 2 (dock the pill), 2026-10-17
**What changed:**
- Arrows: green by default, pink on green ground, `?arrow=iris` kept for comparison.
- The dark pill now sits in ONE bottom dock at every size: centred, bottom 136, which is 12 px above the bar band.
- The teaching card waits until a hint needs a title + body (crew poll; Amy agreed).

**Regression check (Clover):** "the top pill covers the bed" was **not a regression**. `184d9f9` shows the same thing (edge arrow at 162°, toast over the bed's back half; `qa/r184-desk-nearbed.png`).
- **Root cause:** a guessed flat top band (168/188 px plus the arrow body, up to ~252). The follow-cam projects a target just north of her into exactly that band.
- **Fix (Rowan + Linden):** the band was deleted. The arrow now avoids the real `[data-hint]` HUD rects, measured live, and the margins are just a 16 px screen gutter.

**QA after job 2** (headless at 375×812 / 768×1024 / 1024×768 / 1280×800, plus the iPad pane):

| Check | Result |
|---|---|
| Pill in the dock at all 4 sizes | PASS: same spot, centred (375 → y 628–676 · 768 → 840–888 · 1024 → 584–632 · 1280 → 616–664) |
| Just south of the bed | PASS: a DOWN arrow on the soil (world mode, 0°) at all 4 sizes. On the phone it's clear of her hat. |
| Bed below the screen | PASS: edge arrow at the bottom centre, under the pill, pointing down |
| GardenBar opens while the hint is up (iPad pane, real bed tap) | PASS: pill hides, arrow stays, bar at y 901–1004 (13 px below the dock). Plant → done, hintDone +4. |
| MoveHint vs pill | PASS: the hint waits for her first tap, and MoveHint hides while a hint shows. *Note: the Door's Resume tap seems to count as that first tap.* |
| Pink | PARTIAL: renders with the full candy motion (`?arrow=pink`, `qa/j2-pink-edge.png`). **Not seen on the real Forest Clearing**, because the only hint lives in Sunny Town. Per-map selection is unit-tested. |
| Random sparkles on the walk path | Correctly pause the hint (a maths popup). They made one headless route flaky, but that's not a bug. |

**What worked**
- Checking the old commit before "fixing" found the real cause. Without that check, the dock would have hidden an arrow bug that it didn't fix.
- Measuring real HUD rects instead of guessed bands (Linden, Rowan). Any future HUD piece marked `data-hint` is avoided for free.
- Tying sound to meaning, not to the surface. Moving the pill cost zero sound changes (Wren).
- Fern's dock motion is the panel contract, so it's already proven on real copy before the card exists.
- An honest crew poll. Four of five changed or softened their position, and Amy agreed to wait on the card.

**What didn't**
- Linden's "drop while covering" fix was built before the poll and then removed by Amy's decision. It was cheap, but it was rework.
- Shared dev-origin localStorage: someone else's session changed the pane's save between my runs. I had to reseed every time.

**Change next time**
- For any layout bug, run the old commit first (temporary worktree + its own port) before anyone fixes it.
- QA scripts must make one trusted tap before waiting for a hint: hints now wait for the first walk.
- Give headless walk routes an alternative path, because daily sparkles can sit on a route.
