# Amy's review of job 2: the arrow and the pill belong together (open question)

Amy played job 2 and changed her mind. That's welcome here; this is exploration. Her words:
> "Looking at the arrow, I think the main problem here is: the arrow should be close to the pill itself. In another word, if we are designing this way, they should be in pair. The arrow and the pill should always be together. In both ways we did they are not. Could we rethink again, and then decide the pill somewhere relevant to the arrow. I dont think we need to change the arrow positions."

Her screenshots: `amy/pair-review-job2.png` (today's dock: phone + iPad) and `amy/pair-review-job1.png` (job 1's top toast). In both, the arrow says "here" and the pill says "what", far apart.

**Fixed:** the arrow positions stay as they are (world arrow on the target, edge arrow clamped, the real-HUD avoidance from job 2).

**Open, for the crew to think through honestly** (disagree with each other, with Nathan, and with Amy):
1. Where does the pill sit relative to the arrow, so they read as ONE thing? Beside it, above it like a label, attached like a speech tail? Is it the same rule for the world arrow and the edge arrow?
2. The edge arrow pinned at x≈16 on a 375 px phone: does a ~330 px pill fit beside it? Clamp or flip rules?
3. Collisions: the pill now moves with the arrow, so it can land on the HUD, the character or the bed itself. Reuse Rowan's measured HUD rects. Never cover the target.
4. Hints with NO arrow (future First-time tips, rewards, ticket 9): where do they live? Is the bottom dock still their home?
5. The garden bar is open (arrow on the soil, pill hidden today): does the pill stay with the arrow?
6. Motion: arrival as a pair (Fern), and following the arrow without jitter (hysteresis).
7. Does this make Amy's "predictable position" better or worse? (The anchor is now the arrow, not the screen.)

Nathan's view, one voice: Amy's right. Pairing is the proximity principle, and it fixes the "two things to connect" problem in both builds. My worries are #2 (the phone's edge arrow) and #4 (where arrow-less hints live). I'd lean towards "the pill hugs the arrow's tail side, flips when it would leave the screen; arrow-less hints use the dock".

**Clover facilitates.** Collect each crewmate's view (3–6 lines, in their own words, including any changes of mind), then write a short proposal with consensus and dissent to `docs/hints/proposal-pair.md`, plus a quick mock or headless screenshot of the leading option at 375 and 768 if Linden can do one cheaply. **No real build until Amy decides.**

IDs: Rowan a9b1b720bd131fe3d · Linden a2d0525802c3a193d · Fern a8ec70c83f5b34ff3 · Wren a911016331f332eee · Clover aa8b8028cf4e5ef95.
