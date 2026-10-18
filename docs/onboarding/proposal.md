# Proposal: the new Onboarding + How to Play

Trail crew + Kestrel, with Heron reviewing for Amy, 2026-10-18. Facilitated by Clover. **Status: proposal only.** Nothing is built until Amy decides. Inputs: `brief.md`, the Notion kickoff brief, Amy's Business Vision page (Onboarding + Notes), `src/ui/Onboarding.jsx`, `docs/hints/04-new-kid.md`, and `voices/{linden,fern,wren,rowan,kestrel,clover,heron}.md`.

## The verdict
**All seven agree with Nathan's shape:** an About cover, then **3 steps** (hero → gems + build → garden), ending on the garden step with **"Let's play →"**. The "What's next / SOON" card goes. Halloween waits until after her first world visit.

We split from Nathan in two places:
- **About's first line is the game loop, not "a gym for your brain".** Kestrel and Clover said so first. Heron goes further and takes the gym line **out of the game entirely**. It becomes a tagline for luxi.land, the competition deck and posts. The small print carries the real differentiator instead: "teaches the method".
- **"Hints will teach the details" doesn't hold.** Rowan: even with `HINTS_ON`, the hints teach only walking and planting. So **one copy, never branched on the flag**, and the 🛍️ shop is in the copy *and* in the pictures.

## The copy
Every number and name is built from config (`GARDEN.seedEveryGems`, `MAPS.town.name`, the free-hero count, and the grade range from the topics' `grade` tags) so the words can't drift from the game. Word counts don't include emoji.

**About** (header "Welcome", the gem stage, no dot)
| Line | Words |
|---|---|
| Solve math to earn gems 💎. | 5 |
| Build your world. Grow a garden 🌱. | 6 |
| Get one wrong? We show you how. | 7 |
| *Small print (parents, Heron):* × ÷ + practice for grades 4–5 · teaches the method, step by step · no account needed | 13 |

Kid total: 18 words, against ~110 before play today. "We show you how" is true for × and ÷ (a wrong answer opens the worked example on a similar problem). We didn't use "calms you down", which is unverified (Kestrel). No beta result, no streaks, no rivals named, and no "not just a score" (Heron: "comparisons belong in marketing, not the game").

- **The grade line is built, not typed.** It's the min–max of the live topics' `grade` tags: the confidence pool is 4, long-mult is 5, and `DIV_GRADE[DIV_PHASE]` is 5 today. So it reads "4–5" now and becomes "4–6" by itself when Amy flips division to Phase 2.
- **Marketing reuses the 3 kid lines** as the base for captions (Heron), so the first screen matches the post a parent saw.

**How to Play** (header "How to Play", 3 dots)
| # | Title (words) | Body (words) | Image |
|---|---|---|---|
| 1 | **Meet your hero** (3) | You start as the Sorcerer, with your cat. Swap heroes in the 🛍️ shop. 3 are free. (15) | NEW: the Sorcerer + cat, with the 🛍️ button visible |
| 2 | **Earn gems, then build** (4) | Tap a glowing gem 💎 to solve a problem. Spend gems in the 🛍️ shop to build. (15) · *optional, Amy's call:* "Pinch to see more." (+4) | KEEP `step-2.jpg` (it shows the teal gem in its ring, which is what she'll see) |
| 3 | **Grow a garden 🌱** (3) | Plant your seed in Sunny Town. Water it with gems, then pick your flowers 🧺. You earn a new seed every 20 gems. (22) | NEW: the Sunny Town bed in bloom, with the 🧺 button visible |

Why these words:
- **"You *start* as"**, not "You're". From Settings, a kid who swapped heroes or companions would otherwise read a false line (Clover).
- **"Sunny Town"** is always named, never just "the garden", because Rosy Garden is the playtest's decoy.
- **Prices left out:** the 💎50 hero price is a placeholder (Kestrel). The 5 💎 water cost is shown by the GardenBar at the bed.
- **Quest stations are left to the world:** their floating "Picnic quest!" label was the clearest call to action in the playtest.

## The ending
There's no 4th card. The **"Let's play →"** on step 3 closes the card (Linden, Fern, Rowan, Nathan). The SOON branch and its extra dot are deleted. **No "coming soon" anywhere in the component**, and a test enforces that.

## Images
- **A truth catch:** the four files aren't Oscar's art. They're in-game captures: steps 1–2 are Nathan's HUD-free canvas grabs, and steps 3–4 are Amy's shots. Oscar designed the card. We still ask Amy before swapping them.
- **Keep:** About's gem stage and `step-2.jpg`.
- **Drop:** `step-3.jpg` (Merry Market, not her world) and `step-4.jpg` (the sparkle trail, a 15-minute extra).
- **New:** step 1 (today's image hides her behind a tree) and step 3 (the Atlas "bed in bloom" frame).
- The new captures need the **real HUD icons** (Linden: "a kid who can't read yet matches the icon on the slide to the icon on the HUD"). The canvas-grab trick can't capture DOM, so take full-page shots instead.
- Export at **900×506** (step 4's 900×488 crops).
- **Preload (Linden + Fern + Rowan):** mount every image in **one** fixed 16:9 box at once, show the current one with `data-active`, and `decode()` them all on open. That's ~50 KB, loaded during the seconds she spends on About. Never swap `src`, which caused the stale and empty boxes. A box that isn't ready stays the card's lilac, so it looks calm, not broken.

## Two entries, dots and Back
- **First run:** About → 1 → 2 → 3. About has no dot, no Back, and one "Next". Steps 1–3 show **3 dots**. Back from step 1 returns to About.
- **Settings → How to Play:** opens on step 1, with **the same 3 dots** and **no Back** on step 1.
- Rowan's wiring: `onboarding: null | 'first' | 'howto'` plus a pure `onboardingSteps(entry)`. "Seen" is still marked on show, for `'first'` only.
- **No About row in Settings** (Linden, Rowan). Parents get "what is this" from luxi.land and the footer.
- **Phone landscape (Linden):** the card is ~550 px tall in a 375 px viewport, so the ✕ gets cut off. Fix it with `max-height: calc(100dvh - 40px)` and an inner scroll.

## Halloween
**Everyone says hold it until after the first world visit.** Rowan: it's one term, `promoShowing = promoOpen && played && view==='door' && !onboarding`, pulled out as a pure, tested `promoShouldShow()`.
- The treat lands on her first Exit to the Door, or on her next boot. Old saves (Ivy) are unchanged.
- **The cost:** a guest who plays one session and never returns before Nov 2 misses 3 gems. We call that fair.
- **If Amy keeps it on the Door:** Fern asks for at least ~600 ms after the onboarding's exit, so it doesn't read as a stutter.
- **Truth fix to log separately:** in the playtest, "Treat" says "some gems" while "Trick" says "+3". The two branches should match.

## Motion and sound
- **Fern:**
  - **Step change:** no carousel. A ~160 ms opacity crossfade in a box that never changes size, so Next never moves under her finger.
  - **Dots:** the width change on cubic-bezier(0.23,1,0.32,1).
  - **About gem:** rises, bobs twice, then **rests** (today it bobs forever, against Amy's "no infinite motion").
  - **Exit:** 200 ms (sink 8 px + fade), on a plain timer.
  - **Reduced motion:** opacity only, with a static gem.
- **Wren:** **silent**. No Next tick and no "Let's play" chime. Today taps on the card never reach `unlockAudio()`. That's the right result, but it happened by accident, so we write it down as a choice. From Settings, the music keeps playing under the card, not ducked.

## Tests
- **Rowan:** `onboarding-copy.test.js`. Check the rendered strings contain "20 gems", "Sunny Town" and "3 free", and that they match config. Check the grade range equals the min–max of the live topics' `grade` tags, and that a sabotage test (flipping `DIV_PHASE` to 2) turns it into "4–6". Ban "gym" in the game. Ban `/soon/i`. Cap the words per body (≤ 22). Check every `media` file exists in `public/`. Check `onboardingSteps('howto')` has no About. Then `promoShouldShow()` cases: new before the first world, new after, an old save, onboarding open. Sabotage-check each one.
- **Clover's pane QA:**
  - both entries at 375 / 768 / 812×375 landscape;
  - a fast Next ×3 (no stale or empty box);
  - a reload mid-first-run;
  - How to Play opened in-world (no walk-through, hints paused);
  - reduced motion;
  - 0 oscillators on both entries;
  - Halloween only after the first world exit.

## Dissent, in their own words
1. **The About headline.**
   - **Nathan:** "Math is a gym for your brain 💪".
   - **Kestrel:** "a parent metaphor, and a kid can't picture what it means for them. Fine as a small title if Amy loves it, but not as the main line."
   - **Heron:** "for a parent or a DA EdTech judge it's a slogan, not the reason we're different… The gym line goes where adults read a tagline: luxi.land, the competition deck, posts. It isn't lost, it just moves out of the game."
   - **Clover** first put it in the small print. She now concedes to Heron: "teaches the method" is the line that is both true and different.
   - **Heron on length:** "12–13 words of small print is the most a parent will read on a kid's screen. One tagline in there is plenty." Clover's note: "teaches the method, step by step" echoes the kid line "We show you how". Keep it anyway, because the kid and the parent read different lines.
   - **One story or two:**
     - **Kestrel:** "Amy should pick one story."
     - **Heron:** "I don't see a conflict. The 7-year-old rule is a *reading floor*… The grade line names the *math level*, for the parent. Keep both."
2. **Zoom.**
   - **Kestrel:** "zoom-out is the real blocker… I'd add a 4-word line to step 1, 'Pinch to see more', rather than a shop line."
   - **Nathan:** "Leave zoom and gates to the hints."
   - **Rowan:** "Nothing teaches the 🛍️ shop, gates, zoom, watering or the basket."
   - **Clover** backs adding it to step 2, next to the gem it helps her find. On desktop it's a scroll, so the line would be per device, or Amy's alternative: a wider default camera on iPad, which needs no words at all.
3. **The shop as words vs pictures.**
   - **Linden:** "I'd rather *show* the 🛍️ and 🧺 icons in the images and the copy than add another line."
   - **Rowan:** "I back Nathan's one 🛍️ line."
   - The proposal does both: the icon is in the line *and* in the picture.
4. **Scrim-dismiss on first run (Clover vs Amy's 2026-09-19 call).**
   - **Clover:** "one tap on the blurry Door behind the card dismisses the whole onboarding at word zero." Keep the ✕, and let the scrim close the card only from Settings.
   - Amy's reason still stands: players felt trapped. Clover thinks the ✕ already fixed that.
5. **A welcome sound.**
   - **Wren:** "'Let's play' is a door, not a reward." He votes none. If Amy wants one, it reuses an existing recipe on "Let's play" only.
   - **Fern:** "If Wren adds one, it lands on 'Let's play' in time with the exit."

## Open for Amy
1. **Grades:** OK to build the line from the code's grade tags, so it reads "4–5" today (Kestrel, Heron) and turns "4–6" by itself after the division Phase 2 flip? And one story or two? Kestrel: pick one, a 7-year-old reader or grade 4–5 players. Heron: keep both, a reading floor plus a math level.
2. **Zoom:** add "Pinch to see more" (scroll on desktop) to step 2, leave it to a future hint, or widen the iPad default camera?
3. **The gym line:** OK to move "a gym for your brain" out of the game (luxi.land, the deck, posts) and use Heron's small print, "× ÷ + practice for grades 4–5 · teaches the method, step by step · no account needed"? The crew and Heron say yes. Nathan's original put it in the game as the headline.
4. **Images:** OK to replace steps 1 and 3 with new HUD-visible captures and drop the market and sparkle shots?
5. **Scrim tap on first run:** close, or ✕-only?
6. **Halloween:** hold until after the first world visit (everyone says yes)?
7. **Parked Q1 (easier first problem):** yes. A brand-new guest's first problem should come from the confidence pool, not 32 × 20. That's Finn's rung check.
8. **Parked Q2 (build shelves above Heroes):** yes. Step 2 says "spend gems in the 🛍️ shop to build", so the shop should open on build.
9. **Parked Q4 (should About ask anything):** explain only for now. Ask nothing until the grade data contract exists.
