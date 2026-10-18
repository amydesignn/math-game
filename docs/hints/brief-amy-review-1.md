# Trail crew — Amy's review of job 1 (2026-10-17)

Amy played the garden hint and thanks the whole crew. She has two suggestions. Her sketches are in `docs/hints/amy/`.

> "Please consider mine as suggestion and sketch only, please dont use my sketch as UI direction. You have the visual language, I am just trying to make the experiences scalable here." · "Push back anytime and push back is healthy."

Crew IDs for SendMessage (names don't resolve): Rowan = a9b1b720bd131fe3d · Linden = a2d0525802c3a193d · Fern = a8ec70c83f5b34ff3 · Wren = a911016331f332eee · Clover = aa8b8028cf4e5ef95. Nathan relays if one fails.

## 1. The arrow: more dramatic and noticeable (BUILD a test)
Her reference, `amy/arrow-reference.png`, is a row of chunky, glossy, candy-like 3D cursor arrows in many colours. She asked: "at least create one in green for now to test".
- **Linden** builds a green arrow in this spirit, in the house visual language (not a copy of the reference): chunky, glossy, with depth/shadow, readable over the 3D world and on sand. The edge arrow is the one kids miss most, so it matters most.
- **Fern** re-tunes the motion for a bigger, bolder arrow. "More dramatic" is Amy's repeat ask for reward beats too.
- Put it on the dev server behind a switch, so Amy can compare it with the current Iris arrow, e.g. `?arrow=green`. Rowan adds the switch if one is needed.
- Things to raise:
  - **Colour.** Green is her test. Iris is our WCAG colour, and green may clash with the grassy maps. Measure contrast on sand, grass and dusk (the Spooky Arcade).
  - **Glossy vs flat.** Is the gloss an SVG gradient, or layered shapes?
  - **Size.** I recommended moving from 40×48 to 48×56. Linden decides what "noticeable" needs.

## 2. One universal, scalable teaching panel (DISCUSS → one proposal; no code yet)
Her experience goals:
- **One** teaching surface for ALL teaching: hints, first-time tips, and later "you got something new!".
- **Scalable:** it holds more text than a one-line toast, with a title + icon, a body, and actions.
- **Predictable:** always in ONE fixed position. Her sketch puts it bottom-right.
- **Reuse an existing modal** if possible: the Datum *Luxi Math · Modal* shell (`src/ui/mathkit.jsx` `Modal` + `ModalClose`; Cozy Closet's welcome popup reused it), with some customisation variants.
- Actions in her sketch: "Got it, don't show it again" and "Show me how".
- **Later, not first:** minimise to a small "?" button so kids can bring it back. She said do the panel first, then decide on the minimise.
- Colour-coding per topic (e.g. garden = green)? Amy isn't sure; the crew should give a view.

**Questions to settle together (disagree freely):**
- How do the panel and the arrow divide the job? One idea: the panel teaches, and "Show me how" summons the arrow. Or does the arrow show on its own?
- **Where it sits.** Bottom-right today holds nothing on most screens, but check iPad portrait and phone: the basket is bottom-left, the GardenBar/ActionBar and MoveHint bottom-centre, the minimap top-right. A fixed panel on a 375 px phone covers a lot of the world.
- **Modal vs non-blocking.** A "real modal" with a scrim stops play. A docked panel doesn't. Which fits teaching mid-play, given the brief's rule "never block input"?
- **"Don't show it again"** versus our quiet budget (one nudge per session, dismiss = 2 quiet sessions) and ticket 9's rules. Do we need both "Got it" and "Not now"?
- **Reading load.** A 7-year-old and more characters: how do we keep it short?
- **Reuse.** How does this serve First-time tips, the "You got something new!" toast and luxi.land, and what changes in the engine/config (title, body, icon, actions)?
- **Sound and motion.** How does the panel arrive, and does it re-use hintShow?

**Clover facilitates.** Collect positions, run the debate, and write ONE proposal with consensus + dissent to `docs/hints/proposal-panel.md`. It should hold:
- the experience and user flow;
- where it sits per screen size;
- how it relates to the arrow;
- the API change;
- what reuses the existing Modal;
- the open questions for Amy;
- each crewmate's pushback in their own words.

Keep it to 1–2 pages. Then report to Nathan.

The arrow test can proceed in parallel. Only Linden, Fern and Rowan touch code, in their own files, as in job 1. Don't commit; Nathan reviews first. Afterwards, write any new lessons to your memory.
