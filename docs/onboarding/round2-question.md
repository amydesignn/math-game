# Round 2: lock down two items (Amy, 2026-10-18)

Amy's decisions on the rest are in `decisions.md`. She asked the team for a consensus on two items she doesn't want to dictate:

> "the Zoom, I honestly dont get it yet. Why do we need zoom in the How to play?"
> "Parked Q4: should About only explain for now and ask nothing?"
> "Could our team give a consensus about: What it is? Why we do it? 2-3 options — including one recommended by the team consensus? … Any feedback, concern? I dont wanna be the one who dictate the thinking here please"

For EACH item, write 3–6 lines in your own words to `docs/onboarding/voices/r2-<name>.md` covering:
- what it is, in plain words (Amy hasn't seen the playtest);
- why it matters (the evidence);
- your pick of 2–3 options and which one you recommend;
- any concern or pushback, including against the proposal or Amy.

Facts for zoom:
- Playtest (`docs/hints/04-new-kid.md`): at spawn the camera is close. No gem or station is on screen, especially on iPad portrait. The kid was stuck ~1.5 min until finding scroll/pinch zoom-out by accident.
- Kestrel proposed "Pinch to see more" in How to Play.
- Alternatives: a future in-world hint, or widening the default camera (`WORLD` camOffset / zoom in config.js) so no zoom teaching is needed.
- The parked "first station, guided" backlog item (an arrow leads her to the nearest station) would also solve "can't see a gem".

Facts for Q4: the About screen could ASK something (a grade, a hero pick) instead of only explaining.
- The backlog's onboarding item #5 says "later, once the grade data contract is ready".
- Grade selection doesn't exist yet: problems don't change by grade.
- Heroes live in the Gem Shop.
- COPPA: no new personal data. A grade stored locally isn't PII, but asking a question we can't act on yet is a promise the game doesn't keep.
