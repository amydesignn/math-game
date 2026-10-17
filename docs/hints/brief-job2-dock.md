# Trail crew: decisions from Amy's poll + job 2 (dock the pill)

**Amy's thanks first:** "Send our lovely team my big thankssss", and on the arrows: "those are lovely, thank you to you and the team! 🙏" She also agreed with the crew's pushback: "my first suggestion for the card build could be a worse one. Lets test this out."

## Decided
1. **Arrows: approved.** Green is the default everywhere; pink on green ground (the Forest Clearing via Rowan's per-map wiring); `?arrow=iris` stays reachable as the dev comparison.
2. **The card waits.** Build it when the first hint actually needs a title + body (First-time tips / ticket 9). proposal-panel.md stays the plan for that day.
3. **The dark pill gets ONE consistent position at every size, desktop AND mobile** (Amy: "lets try with one consistent position for now"): the **bottom dock**, raised just above the bar band, the same spot always, never jumping when a bar opens. This replaces Linden's "drop only while it covers the target" rule; that code goes.

## Job 2: dock the pill (test it on the dev server; nothing ships)
- **Clover first:** the regression check. Is "the top pill covers the bed" worse at HEAD than at `184d9f9`? Report the cause, so the dock fixes the real thing and doesn't hide a regression.
- **Linden:** the pill lives in the bottom dock at all widths (centred or right-aligned is your call with Fern; pick whichever is most predictable and clear of the basket bottom-left). It sits above the bar band, so it never moves when the GardenBar/ActionBar opens. Measure 375×812, 768×1024, 1024×768, 1280×800. **The phone is the hard one:** MoveHint, the ActionBar/GardenBar and the 🧺 basket share the bottom.
- **Rowan:** the dock rect becomes an inset for the edge arrow (the arrow never hides behind the pill). MoveHint is redundant while a hint is up: hide it then (App.jsx), so one message speaks at a time. Pink must still show on the Clearing.
- **Fern:** the pill now rises 16 px from the dock (280 ms in / 200 ms out, your panel contract), not drops from the top. Extend the green arrow motion to pink. Reduced motion: fades.
- **Wren:** no change expected. Confirm hintShow still lands right with the pill rising.
- **Clover:** QA every size, including the spot just south of the bed, a bar opening while the hint is up, phone collisions, and pink on the real Clearing if you can get a hint there. Then a short retro addendum in `retro-job1.md`.

IDs: Rowan a9b1b720bd131fe3d · Linden a2d0525802c3a193d · Fern a8ec70c83f5b34ff3 · Wren a911016331f332eee · Clover aa8b8028cf4e5ef95. Agree names before building. Don't commit; Nathan reviews.
