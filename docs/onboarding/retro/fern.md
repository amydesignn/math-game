# Fern (motion)

- **Went well:** Linden posted the hooks before I wrote any motion (`data-state`, `data-active`, `OB_EXIT_MS`), so this time our work didn't cross and there was no extra round. The rule "one fixed box, every picture already loaded" made the calm crossfade possible. Motion couldn't have fixed the stale frames alone.
- **Went well:** measuring caught a real bug before Clover or Ivy saw it. On a fast Next into the garden step, which has no picture, the old About gem showed through. Only the page just left stays visible now, and the text no longer crossfades, because two half-faded texts on top of each other read as a smudge.
- **What I'd do differently:** I wrote the crossfade first and measured it after. I had thought it through for pictures, but not for the step with no picture. I also lost time on headless Chrome dropping frames before I slowed the animations down with a 10× slow-motion setting.
- **Honest note to the team:** my voice doc spoke in jargon (curve numbers, "rAF") to a reader who wanted plain words. That's part of why Amy had to ask us to explain things again. And the Halloween popup still has its overshoot and a built-in ease. Nobody owns that yet; it should be a small follow-up, not something we forget.
- **My lesson:** build the slow-motion sampler first, then write the motion, and test the odd page (empty, last, Back) before the happy path.
