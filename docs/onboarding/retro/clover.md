# Clover (kid copy, QA, facilitation): retro

- **Went well:** measuring instead of arguing. The camera run (a gem on screen at arrival only 8% of the time on a phone and 13% on an iPad) settled zoom in one pass, and the QA frame trace proved "no stale picture" instead of eyeballing it. Writing one proposal with everyone quoted in their own words, then folding Heron in, also worked: Amy could see the disagreements, not just a verdict.
- **Didn't:** my round-1 proposal and round-2 summary still spoke crew ("±units", config keys, file paths). Amy had to ask what zoom even was. I'm the one who writes for her, so that's mine to fix first.
- **Didn't:** I caught "You're the Sorcerer → You start as" as an edge case, then QA'd the copy against our branch only. When main moved (the lucky station, PR #68), "your seed" and "You start as the Sorcerer" went false, and Nathan fixed them by hand. Checking the copy against `origin/main` at QA time would have caught it.
- **Didn't:** my QA never named Wren's silence as a *cause* ("the scrim's stopPropagation keeps the first-run tap from unlocking audio"). I measured 0 sounds, but I didn't flag that the comment saying so was missing.
- **Lesson I'm saving:** QA the words against `origin/main` on the day of QA, not just the branch. And every note to Amy opens with one plain sentence before any number.
