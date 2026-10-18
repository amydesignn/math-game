# Round 2: zoom + Q4 (team consensus)

Kestrel, Linden, Rowan, Heron and Clover, 2026-10-18. Facilitated by Clover. **Both items are unanimous.** Nobody is dictating here; it's five voices that landed in the same place.

## 1. Zoom

**What it is.** When she enters a world, the camera starts close behind her hero. She can pull it back by pinching (iPad) or scrolling (desktop), but nothing tells her that.

**Why it came up.** In the cold playtest, a new kid entered a world and saw her hero, the cat and some trees, and nothing to do. She was stuck about 1.5 minutes, found zoom-out by accident, and only then saw a gem. Her first gem took about 3 minutes. Kestrel's own run was the same.

**Why it happens (Linden's maths, checked against the code).** The camera keeps a fixed *height* of view, so a tall, narrow screen loses the *sides*. Side to side at her feet she sees:
- about ±1.9 units on a 375 phone;
- ±3 on an iPad in portrait;
- ±6.5 on a desktop.

Gems spawn at least 4 units away. **So on phone and iPad portrait, the first gem is almost always just off screen.** It's a camera problem, not a teaching problem.

**Options**
- **A. A How to Play line, "Pinch to see more".** It costs nothing. But it's read once before she's seen the world, and on desktop it's the wrong gesture (scroll, not pinch).
- **B. ✅ Team pick: start the camera wider on tall screens.** Use one config knob, or a small `startZoom(screen shape)` with a test. Desktop stays as it is. No words, it works with hints off, and pinch stays as a bonus.
- **C. Teach zoom in the world.** Either a hint that appears only if no gem has been on screen for a while, or the parked "guided first station" arrow. This is the backup if B isn't enough.

**Concerns and dissent**
- **Kestrel changed their mind:** "Recommend B, and I'm changing my mind against A. A slide line is read once and forgotten by the time she's in the world." Clover drops her round-1 support for A too.
- **She gets smaller.**
  - **Linden:** "about 40% of the iPad's height today, maybe 25% after."
  - **Rowan:** "Amy picked the Sorcerer's size on 10-14, so Amy should look."
  - **Heron:** the steep angle "that keeps the pet from blocking her has to survive the change". Rowan says it does: zoom only scales the distance, and the angle doesn't change.
- **Wider isn't a guarantee.** Rowan: "sparkles spawn anywhere in ±18… If even 1.8× is often empty, the parked guided first station is the real fix, and B only helps."
- **Phone headroom (Clover).** Linden's 375 number (2.2) is already the pinch-out max, so B likely means raising `zoomMax` slightly. All of job 3's hint measurements were taken at 1×, so they need a re-run.
- **If B can't land, ship no zoom line at all.** Kestrel: "ship How to Play with no zoom line rather than A." Heron: "I'd only add A if C can't be done without hurting the look."

**Still to measure, before any number is picked**
1. **Rowan's "how often":** across seeded spawns on every map, at 375 / 768 portrait / 1024, what share show a gem or station at 1×, 1.4× and 1.8×? Clover can run this headless, with no source change.
2. **Linden's look check:** real screenshots at 375 first, then 768. Is she easy to see? Does the cat clear her? Does the HUD cover anything new?
3. **After:** a cold playtest, measuring time to first gem tap, before vs after.

**Scope.** The *measuring* fits this job. The *camera change* is small (one knob plus a test), but it touches every world and the hero size Amy chose, so we propose it as a **separate small follow-up**. It can ship alongside, once Amy has seen the screenshots. Either way, **How to Play has no zoom line.**

**➜ Lock:** Take zoom out of How to Play, and approve a wider start camera on tall screens as a measured trial (in-world help stays the backup)?

## 2. Q4: should About ask anything?

**What it is.** The first screen could *ask* her something, like "What grade are you in?" or "Pick your hero", instead of only explaining the game.

**Why it matters.** A question tells a kid "your answer changes something". Today it wouldn't:
- Problems don't change by grade. The generator ignores the grade tags.
- Heroes live in the Gem Shop, which you just kept as their one home.
Asking would be a promise the game doesn't keep, which is the same truth rule that removed "coming soon".

**Options**
- **A. ✅ Team pick: explain only, for now.**
- **B. Ask her grade later,** once the grade data contract makes problems actually adapt (Finn's spec, and backlog item #5). It would be its own screen after About.
- **C. A hero pick on About.** It works in code today, but it duplicates the shop and puts a choice before her first gem.

**Concerns and dissent**
- **Truth, not COPPA, is the blocker.** Kestrel: "A grade kept on the device isn't personal data, so COPPA isn't the blocker; truth is."
- **A guessed grade hurts.** Kestrel: "A kid guessing 'Grade 6' would be served too-hard problems." When the grade question comes, it should be skippable, with a parent note.
- **UI weight.** Linden: "a question turns a read-and-tap card into a form… the heaviest thing we could put in the very first 10 seconds." Later, it should be a single tap with a skip, and it goes back to Amy first.
- **One knob, not two (Rowan).** Decision #7 (an easy first problem) should be built as a "starting level" setting in the generator, so a future grade question just sets that same setting.
- **For later (Heron):** "'Starts at your level' is a strong, true selling point… but only once the code does it. Until then, Marketing doesn't use it either."

**➜ Lock:** About explains only and asks nothing, and the grade question comes back once problems really change by grade?
