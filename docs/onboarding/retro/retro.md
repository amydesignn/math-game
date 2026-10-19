# Retro: Onboarding + How to Play

**We shipped a shorter, truer welcome that teaches the game, and we learned to talk to you in plain words first.**

Trail crew + Kestrel + Heron + Nathan, 2026-10-19. Facilitated by Clover. Shipped as PR #69.

## In their own words
- **Linden (UI):** "Checking 812×375 in round 1, a size nobody had asked for, caught the clipped ✕ before the build." And honestly: "I guessed her on-screen size at '~40%', and the measured figure was 22%."
- **Fern (motion):** "Measuring caught a real bug before Clover or Ivy saw it… the old About gem showed through." Fern's lesson: "test the odd page (empty, last, Back) before the happy path."
- **Wren (sound):** "The team let silence be a real decision instead of a gap." And: "A silence nobody wrote down is just an accident."
- **Rowan (engine):** "All 10 sabotage breaks failed as they should." And: "I broke two older rotation tests… I should have grepped every caller's tests first."
- **Kestrel (Explorer):** "I proposed 'Pinch to see more', then argued against it in round 2." Kestrel's lesson: check whether the thing is "even on screen… before writing words to teach it."
- **Heron (Marketing):** "Build owned what's true, Marketing owned how it's said, and neither re-did the other's work." And: "Amy putting Marketing in charge of wording, in one line, saved a whole round."
- **Nathan (lead):** "I showed Amy a decision button twice instead of the notes." And: "I didn't watch main."
- **Clover (kid seat, QA):** "Measuring instead of arguing." And: "I QA'd the copy against our branch only."

## What went well
- **The process held.** Open question → one proposal → Amy decides → build. Everyone's disagreement reached you in their own words.
- **Clean seams.** The file split and props were agreed up front, so Rowan, Linden and Fern built in parallel with zero conflicts.
- **Truth built in.** The copy comes from the game's own settings. "Grades 4–5" turns into "4–6" by itself when division's Phase 2 goes live.
- **Changing minds in the open.** Kestrel dropped their own idea, I conceded the gym line to Heron, and the camera numbers changed everyone's view.

## Themes that repeat
1. **We wrote jargon to you.** Six of eight voices say it themselves: "±units", "camOffset", "rAF", "oscillators". You had to ask what zoom even was, and then "what did the team agree?" From now on, plain words come first and the numbers come under them.
2. **Measure before recommending.**
   - Linden's 40% guess was really 22%.
   - Heron recommended a wider camera before the numbers existed.
   - Kestrel proposed words for what was really a camera problem.
   - My camera run showed a wider camera helps the iPad a lot but can't fix the phone.
3. **Main moved under us.** The lucky station (PR #68) made two lines false ("your seed", "You start as the Sorcerer"). Nathan caught them by hand. Nobody checked the copy against the newest main before recording or QA.
4. **Notes that didn't arrive.** Rowan's first-window note never reached Clover. Heron learned the wording change from the commit, not from a message.

## Small follow-ups found
- **Wren's silence comment.** Add the reason next to the code line that causes the silence, plus a QA row that measures it, so music can't sneak under slide 1 later. Owner: Wren or Rowan.
- **The Halloween popup's overshoot.** It still uses an overshoot curve and a built-in ease. Fern flagged it; nobody owns it yet. Owner: Fern.
- **"Easy until her first correct answer."** Today only the very first sparkle is easy, so the second can jump to 32 × 20. Finn should decide the kinder rule. It's the same setting either way.
- **Marketing wording sync.** Heron: never "you start as the Sorcerer" or "a free seed to start". Build pings Marketing when shipped wording changes.
- **Smaller:**
  - a copy test against the live game, not just config (Rowan);
  - About lines below the fold on a phone held sideways (Linden: shrink the picture on short screens).

## What we'll do differently next job
1. **Every note to you opens with one plain sentence,** then the evidence. The decision comes as a short summary + a link + one question, never a button alone.
2. **Measure first,** and label every number MEASURED or ESTIMATED.
3. **Check `origin/main`** before recording, before QA, and before the PR. Re-read the copy against it.
4. **Test the odd page first** (empty, last, Back), and grep every caller before changing a shared default.
5. **Write the decision down where it lives:** silence, wording, and handoffs to Marketing.

Thank you for trusting us with the welcome. Every crewmate has saved their own lesson to memory.
