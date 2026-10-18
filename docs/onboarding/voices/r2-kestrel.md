# Kestrel, round 2

## Zoom
- **What it is:** when you enter a world, the camera starts close behind your hero. On iPad portrait the hero and cat fill the screen, and no gem or station is in view. You can pinch (iPad) or scroll (desktop) to pull the camera back, but nothing tells you that.
- **Why it matters:** in both cold runs (Clover's and mine) the first gem only appeared after zooming out. Clover was stuck about 1.5 min and found zoom by accident, and her first gem took about 3 min. Kids who see nothing to do in the first minute leave. The Atlas station shot also has to *start* zoomed out, or the ring isn't in frame.
- **Options:** (A) a How to Play line, "Pinch to see more" (my round-1 idea). (B) Start the camera wider: the default zoom in `config.js` WORLD (today `camOffset [0,7,8]`, pinch range 0.55–2.2), so a gem is in view at spawn and no one needs teaching. (C) Leave it to a future in-world hint, or to the parked guided-first-station arrow.
- **Recommend B, and I'm changing my mind against A.** A slide line is read once and forgotten by the time she's in the world, and "pinch" means nothing until you're looking at the problem. Fixing the cause beats teaching a workaround. Run it as a trial: measure time-to-first-gem before and after.
- **Concern:** wider means a smaller hero, and the camera was made steep on purpose so the cat doesn't block her. Nathan should check the start view at 375 and 768 before locking it. If B can't land in this job, ship How to Play with no zoom line rather than A, and let the hint or guided station pick it up.

## Q4: should About ask anything?
- **What it is:** the first screen could ask a question (your grade, or pick a hero) instead of only explaining the game.
- **Why it matters:** a question tells the kid "your answer changes something". Problems don't change by grade yet, and heroes already live in the Gem Shop, which Amy decided keeps one home. Asking would be a promise the game doesn't keep, and that's the same truth rule as "no coming soon".
- **Options:** (A) explain only. (B) ask a grade now and store it locally, unused. (C) a hero pick on About, which duplicates the shop.
- **Recommend A.** Bring the grade question back, on its own, once the grade data contract makes problems actually change. A grade kept on the device isn't personal data, so COPPA isn't the blocker; truth is.
- **Pushback:** if we ever add the grade question, it should be skippable and come with a parent note. A kid guessing "Grade 6" would be served too-hard problems, the same cold-open problem as the 32 × 20 first sparkle.
