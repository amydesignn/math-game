# Onboarding QA (Clover, 2026-10-18)

**Setup:** the dev server on 5180, from the worktree's uncommitted build (Linden's card, Rowan's wiring, Fern's motion). Each run used headless Chrome (swiftshader) over CDP, with a fresh guest (localStorage cleared) and trusted CDP clicks and keys. No source was changed. Screenshots are in `qa/`, and the scripts sit beside them (`qa/*.mjs`).

**Verdict: the build passes everything it controls.** Three issues, all outside the card's code:
- **one ship blocker:** steps 1 and 3 don't show what they say yet (they're waiting on Amy's recordings);
- **one older bug:** Settings is clipped in phone landscape, so How to Play can't be reached there;
- **one kid-seat note:** only the very first sparkle is easy.

## Results
| Check | Result | Evidence |
|---|---|---|
| **First run at 375 / 768 / 1024 / 1280 / 812×375:** About → 3 steps → "Let's play →" closes | ✅ every size | `qa/{p375,p768,l1024,d1280,land812}-first-*.png` |
| **First run:** About has no dot and no Back. Steps show 3 dots. Back appears from step 1 | ✅ | the same shots |
| **How to Play from the Door's ⚙️:** opens on step 1, 3 dots, no Back, ✕ closes | ✅ at 375 / 768 / 1024 / 1280 | `qa/*-howto-0.png` |
| **How to Play in phone landscape (812×375)** | ❌ **unreachable** (issue 2) | `qa/land812-settings-sheet.png` |
| **Card size is steady:** Next never moves | ✅ The card and the Next button keep the same rect on every page, at every size. The CTA only grows leftwards for "Let's play →", and its right edge stays put. (One 1280 reading caught the entrance animation mid-flight; re-measured after it settled: 440×609 on all pages.) | |
| **Phone landscape fit** | ✅ The ✕ and Next are always visible, and the middle scrolls. ⚠️ On About, lines 2–3 sit below the fold, and a 7-year-old won't know to scroll. Minor, since landscape phone is rare. | `qa/land812-first-0-about.png` |
| **First run: a scrim tap does nothing,** two corners + Escape | ✅ It stays on About. Only the ✕ closes it | |
| **How to Play: scrim tap and Escape close it** | ✅ both | |
| **Fast Next ×3** (frame trace, every rAF) | ✅ 0 blank frames and 0 frames from two pages back. Each change is a short crossfade: the old layer holds, the new one fades in | `qa/fast-{1,2,3}.png` |
| **Fast Next while the images are held for 2.5 s** (a slow connection) | ✅ An unloaded layer shows the box's calm lilac, never an old picture | `qa/slowimg-*.png` |
| **Reload mid-first-run** (reloaded on step 3) | ✅ It never shows again ("seen on show") | `qa/reload-door-no-promo.png` |
| **How to Play opened in-world:** Next, Next, Back, then a scrim tap over the canvas | ✅ Her position is unchanged (0,0,1.94), there's no walk target, and the scrim tap closed it | `qa/inworld-howto.png` |
| **Reduced motion** | ✅ Only opacity fades on the scrim, card, gem and media. The gem doesn't bob, nothing translates or scales, and the exit is a fade. It closes on the same timer | `qa/rm-about.png` |
| **Gem bob (motion on)** | ✅ It bobs twice, then rests (iteration count 2, not infinite) | |
| **Silent** | ✅ 0 oscillators, 0 buffer sources and 0 media plays during the whole first run. During In-world How to Play: still 0 oscillators, and the bgm keeps playing (no extra play or pause) | |
| **Halloween (`?season=halloween`), on the Door before her first world visit** | ✅ Not shown, including after a reload | `qa/reload-door-no-promo.png` |
| **Halloween after her first Exit** | ✅ Shown. Treat and Trick now both say "some gems" (the old mismatch is gone) | `qa/halloween-after-first-exit.png` |
| **Brand-new guest's first sparkle** | ✅ **23 × 6** (mult-2x1) | `qa/first-sparkle.png` |
| **Brand-new guest's first-window stations** | ✅ All three maps easy: 45×2 / 13×2, 42×4 / 12×3, 17+45 / 45+56 | |

## Issues (to Nathan)
1. **Steps 1 and 3 don't show what they say yet.** This blocks shipping, not the build.
   - **What I did:** read each step as the kid, at 375 and 768.
   - **What I saw:** step 1, "Meet your hero", shows a tiny Sorcerer half-hidden behind a tree, with no 🛍️ (`qa/inworld-howto.png`). Step 3, "Grow a garden", is an empty lilac box (`qa/p375-first-3-garden.png`). That's the step the playtest needed most.
   - **What I expected:** per Amy's decision #4, every picture shows what its step says.
   - **Fix:** this is exactly Amy's recording brief, so the card shouldn't ship to players before her clips land. Step 2's still is fine: the teal gem in its ring reads, even at 375.
2. **Phone landscape: Settings is clipped, so How to Play can't be reached.** This is an older bug in `Settings.jsx`, not this build.
   - **What I did:** at 812×375, tapped ⚙️ on the Door.
   - **What I saw:** the sheet runs from y 72 to 546 in a 375-tall screen and doesn't scroll. The How to Play row sits at y 399–443, off screen (`qa/land812-settings-sheet.png`).
   - **What I expected:** every row reachable.
   - **Fix (for Linden):** `max-height: calc(100dvh - 88px); overflow:auto` on the sheet, the same move as the card's landscape fix.
3. **Kid seat: only the very first sparkle is easy.** This is a note for Finn, not a bug.
   - `startingPool()` returns to the full mix after *one* answered problem, right or wrong. So her second sparkle can jump from 23 × 6 to 32 × 20 or long division.
   - The first station window stays easy for its whole 3 hours (Rowan's note). As a kid, that doesn't bother me at all: easy quests that pay feel great.
   - The jump on sparkle #2 might, though. I'd ask Finn whether "easy until her first correct answer" (or the first 3) is the kinder rule. It's the same knob.

## Read as a 7-year-old
- **About:** "Solve math to earn gems 💎. / Build your world. Grow a garden 🌱. / Get one wrong? We show you how." These are short and clear, and I know what to do. The small print is a parent line, and I'd skip it, which is fine.
- **Step 1:** "You start as the Sorcerer, with your cat. Swap heroes in the 🛍️ shop. 3 are free." Clear. "Swap" is OK. The picture doesn't help yet (issue 1).
- **Step 2:** "Tap a glowing gem 💎 to solve a problem. Spend gems in the 🛍️ shop to build." The picture shows the gem, so I'd know what to look for. ⚠️ In the world, that gem opens as "Snack Time", so the words don't match there, but the picture does.
- **Step 3:** 22 words and 4 lines at 375, the longest read on the card. Every sentence is short, and "Sunny Town" is named. I'd keep it. The empty box is the real problem (issue 1).
- **Buttons:** "Next", "Back", "Let's play →", ✕. All fine. Header: "Welcome", then "How to Play".
