# Nathan

- **Went well:** the process held. The open question went out first, Clover wrote one proposal, Amy decided, and only then did we build. Agreeing the file split and prop contract up front (`onboardingCopy.js` + `<Onboarding entry onClose>`) let Rowan and Linden build in parallel with zero conflicts. Building the copy from config caught a real truth problem when main changed under us.
- **Didn't go well:**
  - **I showed Amy a decision button twice instead of the notes.** She had to ask "what did the team agree?" Her brief says she doesn't want to dictate, so she needs the plain-words summary and the link first, then the question.
  - **I didn't watch main.** PR #68 (the lucky station) merged mid-job, and I only found it because Amy's clip showed a Lucky Station our branch didn't have. That made two lines of copy false ("your seed", "You start as the Sorcerer"). I should have checked `origin/main` before asking for recordings and again before the PR.
  - **The first `promoShouldShow` QA note never reached Clover** (Rowan flagged it). I'm the hub, so relaying is my job.
- **Lesson (saved):** before every Amy-facing decision, give a plain summary + a link to the notes + one question. Before recording, PR or merge, run `git log HEAD..origin/main` and re-read the copy against what's new.
