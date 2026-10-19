# Heron, round 2: zoom + Q4

## Zoom
- **What it is:** when a new kid enters a world, the camera starts close to her hero. She sees grass and trees, but no gem and no quest station. Everything to do is just off screen. You only see more by pinching (iPad) or scrolling (desktop), and nothing tells you that.
- **Why it matters:** in the cold playtest the kid was stuck for about 1.5 minutes before she found zoom-out by accident. That is the worst first minute we could have: "I'm in, and there's nothing here." A parent watching sees the same thing.
- **Options:** (A) add "Pinch to see more" to How to Play. (B) Leave it to a future in-world hint. (C) Start the camera a bit wider (`camOffset` / the default zoom in config.js), so at least one gem or station is on screen at spawn and nobody has to learn zoom first.
- **I recommend C, as a trial.** Every word we can drop from How to Play is a win. "Pinch" is also wrong on desktop and means nothing to a kid who hasn't touched the world yet. Fixing what she sees beats teaching her to fix it. Zoom stays in the game for kids who find it.
- **Concern:** a wider camera makes the hero smaller, and the steep 3/4 angle that keeps the pet from blocking her has to survive the change. Check at 375 and in iPad portrait, then re-run Clover's cold playtest: is a gem on screen at spawn, and how long until her first tap on one? If she's still stuck, add B later. I'd only add A if C can't be done without hurting the look.

## Q4: should About ask anything?
- **What it is:** the About screen could ask a question, like "What grade are you in?" or "Pick your hero", instead of only explaining.
- **Why it matters:** a question signals "this game adapts to you". But today nothing changes by grade, and heroes already live in the Gem Shop.
- **Options:** (A) explain only. (B) Ask for her grade. (C) Pick a hero on About.
- **I recommend A, explain only.** B asks a question we can't act on, which is a promise the game doesn't keep. That's a truth-rule problem, not just a scope one. C repeats the shop, and it puts a choice before her first gem, when the goal is to get her into a world fast. Step 1 already shows she can swap heroes in 🛍️.
- **Pushback, for later:** when the grade data contract lands, ask for the grade. "Starts at your level" is a strong, true selling point for parents and for the competition, but only once the code does it. Until then, Marketing doesn't use it either.
