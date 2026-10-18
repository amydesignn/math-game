# Proposal: the arrow and the pill as one pair (Amy's review of job 2)

Trail crew, 2026-10-17. Facilitated by Clover. **Status: proposal only.** No real build until Amy decides. Inputs: `poll-pair.md`, `amy/pair-review-job1.png`, `amy/pair-review-job2.png`, and Linden's throwaway mock (below).

## The verdict
**All five agree with Amy.** Four of us changed our minds out loud. Rowan: "the dock was the right fix for the wrong problem". Linden: "I argued for one fixed spot twice, and the mock convinced me". Wren: "I was partly wrong". Clover: so was I. Both earlier builds fixed *where* the words sat. Neither fixed the words and the pointer being **two things to connect**. Proximity fixes that.

## The rule: a sign on a post
- **The pill rides the arrow on its TAIL side,** along the arrow's body, 8 px past its end. The tip stays free to touch the target.
  - World arrow pointing down at the bed → the pill sits **above** it, like a label.
  - Arrow hanging below a target → the pill goes **below**.
  - Edge arrow at the left edge → the pill goes **to its right**, inside the screen.
  - Edge arrow at the bottom → the pill goes **above** it.
- **Fallbacks, in order:** tail side, then right of the arrow body, then left. A side is valid only if it is inside the screen gutter and clear of every measured HUD rect (job 2's `[data-hint]` list), the arrow's own box, the target box (**never cover the bed**) and **the character** (new avoid rect; see the mock).
- **Safety valve:** if no side is valid, the pill falls back to the bottom dock. The worst case is today's build, and nothing ever overlaps.
- **No speech tail or connector** (Linden): "the arrow already IS the pointer, and a tail would be a second pointer."
- **Text never rotates** with the arrow. It's laid out per side, not spun.
- **Arrow positions are unchanged,** as Amy asked.

## The cases
| Case | Rule |
|---|---|
| Hint with an arrow | the pill rides the arrow (above) |
| Hint with **no** arrow (future tips, rewards, ticket 9) | **bottom dock**, as job 2. "With an arrow it rides the arrow, without one it's in the dock" (Rowan) |
| GardenBar open at the bed | **pill hidden, arrow stays,** as today. The bar is the "what" there (everyone) |
| Plant | the arrow does its done beat; no done text |

## Linden's mock (headless overlay on the real game, no source change)
`scratchpad/linden/pair-{phone,ipad}-{onBed,edge,bedBelow}.png`
- **iPad, on the bed:** the pill sits above the down-arrow and reads as ONE thing at once.
- **Phone, south of the bed:** the label above would land on Exit/🛍️/minimap. The fallback puts it right of the arrow (146–359 × 162–218), clear of the HUD and the bed. It wraps to 2 lines.
- **Phone, edge arrow:** it fits (pill x 87–359, 2 lines) but **covers her and a quest station.** This is why the character must be an avoid rect. With that rect, the fallback moves it above or below the arrow, or to the dock.
- **Bed below the screen:** arrow at the bottom edge with the pill above it. Reads fine at both sizes.

## Motion and sound
- **Fern:**
  - Arrival: the arrow lands first (~120 ms, on hintShow's 2nd note), then the pill unfolds **from the arrow's side** at +120 ms. That's a fade + scale .96 → 1 over 280 ms, with the origin on the arrow-facing edge, so "look here" comes before "read this".
  - Follow: **rigid**. The pill sits inside the arrow's translate box, but outside the rotate and the bob, with no smoothing.
  - Edge taps: only the glyph taps; the pill holds still.
  - Side flip: a crossfade (120 out / 200 in), never a slide across the arrow.
  - Leaving: both go together in 200 ms.
  - Reduced motion: fades only.
- **Wren:** no new recipe. **One hintShow per pair, on arrival only.** Following, re-anchoring and flipping are silent. Dock hints get the same hintShow.
- **Rowan:** a pure helper next to placeArrow in `position.js`, tested the same way:
  - Signature: `placePill(arrowPlacement, pillSize, size, { avoid, target, keep }) → { x, y, side, docked }`.
  - A sticky side; a `player` key on `getTargetPos` so the character can be avoided.
  - **No engine change.**
  - The pill's max width becomes min(320, room), allowing 2 lines. On a 375 phone the room beside an edge arrow is ≈ 279 px.

## Dissent (unresolved; Amy or Nathan to call)
1. **Rigid follow vs words that settle.**
   - **Fern:** "ONE anchor, no lag… if only the pill is smoothed, it trails the arrow and the pair breaks."
   - **Wren:** "words that MOVE are harder to read… it re-anchors only when she stops walking… never jumps sides mid-sentence."
   - **Clover's middle:** keep the *position* rigid (the camera already moves smoothly, so the pair glides with her). Defer *side flips* until she stops walking, unless the current side becomes invalid (it would cover the HUD, the target or her). Then 24 px hysteresis on top.
2. **Copy, short or full.**
   - **Clover (first) and Linden:** paired, the arrow carries "where", so "Plant your seed 🌱" is enough, and it fits one line beside a phone edge arrow.
   - **Rowan:** "I'd KEEP 'in the garden'. When the arrow is at the screen edge, the garden is off-screen… the pill naming the place is the only clue she gets."
   - **Clover now concedes to Rowan:** keep the full line and accept 2 lines on phones. Switching text by arrow mode would make the words change while she reads.
   - Linden still prefers short.
3. **Predictability.**
   - **Linden:** the anchor is "where her eyes already are… MORE predictable for a kid than a fixed screen spot."
   - **Nathan's worry stands for the phone:** the fallback order means the pill *can* sit on different sides on different walks.
   - Everyone agrees strong hysteresis is what keeps that tolerable.

## Open for Amy
1. Do you approve the "sign on a post" rule (pill on the arrow's tail side, falls back to the dock)?
2. Rigid follow, settle-when-stopped, or Clover's middle?
3. Short "Plant your seed 🌱" or the full line on 2 lines?
4. Should the character be an avoid rect? (The crew says yes. The phone mock covers her without it.)
