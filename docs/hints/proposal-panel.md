# Proposal: one teaching panel (Amy's review #2)

Trail crew, 2026-10-17. Facilitated by Clover. **Status: proposal only, no code.** Inputs: `brief-amy-review-1.md` and `amy/teaching-panel-sketch.png`.

## In one line
Make the hint toast **one component with two densities**. A **pill** is today's one-liner. A **card** has an icon, a title, a short body and up to 2 actions. It docks **bottom-right, raised above the bar band**, is **non-blocking** (no scrim), and keeps the **arrow** pointing at the world for kids who can't read yet.

## Experience and flow (garden example)
1. She's in Sunny Town and the world is calm for 4 s. **The arrow lands on the bed first**, which says "look here". 120 ms later **the card rises** into its dock, which says "now read". One `hintShow` plays for the pair.
2. Card: 🌱 **Your garden** / "Plant your seed here." / [**Show me**] ✕.
   - **Show me**: replays or re-summons the arrow (`point`). On a phone the card first collapses back to a pill, then the arrow arrives, so only one thing moves at a time.
   - **✕ = not now**: the shared quiet budget (2 sessions), as in job 1.
3. She plants (the real act). The arrow does its done beat with `hintDone` and the card leaves. Retired for good.
- **First-time tip**: same card. Showing it *is* the retire (once per device), so ✕ is its only exit.
- **"You got something new!"** (later): same card, `reward` budget. It has no quiet period and no "don't show again" because it's news; it only waits for calm, and it closes itself after a few seconds. Never over maths or the level card.

## Where it sits (Linden's measurements, job 1 rects)
| Width | Placement | Why |
|---|---|---|
| 1280×800 | card at right 16, bottom 20 → x 944–1264 | clear of the widest bar (≈x 840) by 100 px |
| 1024×768 · 768×1024 (Ivy's iPad) | card at right 16, **bottom 136** (above the bar band) | at bottom 20 it hits the centred GardenBar/ActionBar |
| ≥600 rule | **one rule: right edge, bottom 136**, so it never jumps when a bar opens | predictability is Amy's goal |
| 375×812 phone | **open, see dissent**: a pill in the top slot that expands on tap (Linden), or a full-width sheet above the bar (Fern) | a 320-wide card there *is* the full width, ~20% of the world |
- Max 320 wide, ~188 tall. Title 1 line (16 bold). Body ≤2 lines (16). One row of 2 actions (44+ tall).
- The dock rect becomes an **inset for the edge arrow**, so the arrow never hides behind the card.
- **Found in QA today:** the top-centre toast can sit **on top of the bed** at 1280 and 375 when she stands just south of it (`qa/g-desk-nearbed.png`, `qa/g-phone-nearbed.png`). Moving teaching text into a bottom dock fixes this on ≥600. On phones it argues *against* keeping the pill at the top.

## The panel and the arrow
- **Consensus:** the arrow still appears **on its own** for world/DOM targets, because pre-readers can't read the card. The card explains; the arrow points. "Show me" re-summons or replays the arrow. It is not the only way to get one.
- **Motion (Fern):** the card rises 16 px plus a fade from its corner, 280 ms in and 200 ms out, the same for every topic. "More dramatic" goes on the **arrow** and reward beats, never on text a 7-year-old is reading. Reduced motion is fades only.
- **Sound (Wren):** **no new recipes**. One `hintShow` per teaching moment, played by whichever surface arrives first. Every tap (Show me, Got it, ✕, ?) is silent. `hintDone` plays only on the real act. A reward gets its own cue later (`hintDoneBloom` is the candidate).

## API change (Rowan): additive, so the garden entry keeps working
- `say(ctx, event)` returns a string (treated as `{ body }`) **or** `{ title, body, icon }`. The view becomes `{ id, title, body, icon, target, actions, pointing }`.
- `actions: [{ id, label, effect }]`, where effect is `retire` (gone for good on this device), `quiet` (today's ✕), `point` (summon/replay the arrow), or `host` (the host's `onAction`, e.g. "take me to the garden"). With no actions, the card shows ✕ only, which is exactly today.
- `notify(name, payload)`, so a reward can say "3 new seeds!".
- Memory: a new `retired: [ids]` list. Retire is **derived** from game state (she planted) **or chosen by the user** (`retire`); either one ends the hint.
- **Ticket 9's popup becomes a panel entry** with a `nudge` budget. It shares one-per-session and the quiet period, and stays behind the flag.
- **luxi.land fits:** the engine has no 3D, it uses DOM targets or none, and its own storage key.

## What reuses the Datum Modal, and what doesn't
- **Not reused: the `Modal` wrapper** (fixed, centred, scrim, popIn). It blocks input, steals attention, and `src/hints/` may not import `mathkit` (the boundary that lets it go to luxi.land).
- **Reused: the LOOK.**
  - MODAL border, shadow, radius (snapped 28 → 24 at this size), white surface.
  - The 40 px `ModalClose` look.
  - Datum Button styles (Iris primary, lilac secondary).
  - Type: body 16, supporting 14.
- **How:** lift MODAL's tokens into CSS custom properties in `index.css` (`--luxi-modal-radius/-border/-shadow/-close-bg`). Then `mathkit` and `hints.css` read one source without an import, and luxi.land sets its own.
- The pill stays dark glass because it floats over the world. The card is white because it's a reading surface.
- a11y: `role="region"` with a polite live region (title + body read once). Not a dialog. Focus is never stolen.

## Consensus
These points have consensus, with no dissent unless noted:
- One component (pill and card), replacing the toast.
- Docked and non-blocking.
- At ≥600: right edge, raised above the bar band.
- The arrow stands on its own for world targets.
- One `hintShow` per moment; all taps silent.
- **No colour per topic.** Use a per-topic icon in a lilac chip on the Iris frame. Green chrome fights "Iris = WCAG", and colour isn't a signal kids learn.
- Copy: title ≤4 words, body ≤10 words, one idea.
- Minimise-to-"?" comes **later**. The engine treats it as a cheap `minimised` state.

## Open questions for Amy
1. **Phone layout:** a top pill that expands on tap (Linden), or a bottom sheet across the width (Fern)? (Clover leans bottom, because the top pill can cover the target.)
2. **"Got it, don't show it again":** keep an explicit forever button (supported as `retire`), or rely on ✕ plus one action (the crew default)?
3. **Minimise to "?":** wanted at all? If so, Fern's "shrinks into the ?" motion is how kids learn where it went.
4. **Card colour:** white reading card vs dark glass like today's toast?
5. **Green arrow (#1):** keep it, or keep Iris? QA: it is much louder on sand, especially the edge arrow (`qa/g-ipad-edge.png`). Grass is not yet checked in-world.

## Pushback in each crewmate's own words
- **Rowan:** "Two exits that both make it go away but mean different futures are a distinction a 7-year-old can't see. I'd keep ✕ = not now as the only close, and for tips drop 'Got it' entirely… If Amy wants the explicit forever button, the engine supports it as effect 'retire', so this is a taste call, not an engineering one."
- **Linden:** "A docked card that's always open on a 375 phone covers too much world." And: "Two teaching surfaces on screen at once breaks 'at most one hint' and doubles the collision work."
- **Fern:** "The Datum Modal's popIn… says 'stop, read this', which is wrong for mid-play teaching. Reuse the Modal's LOOK… Don't reuse its entrance." And: "The '?' must NOT pulse or bob forever."
- **Wren:** "One more sound per surface is the easy mistake here. Amy's 'more dramatic' is a motion ask, so I'd rather Fern carry it than raise gains." And: "A reward sound on 'Got it' would teach her that closing the panel is the achievement."
- **Clover:** I conceded "Got it = retire" to Rowan for the default. My pushback on the sketch: "Got it, don't show it again" is 6 words on a button for a 7-year-old. If Amy keeps it, the label should be "Got it ✓". I also flag "?" as one more icon-only button, which the cold playtest found confusing.
