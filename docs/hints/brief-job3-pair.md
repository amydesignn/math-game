# Trail crew job 3: pair the pill with the arrow ("sign on a post")

Amy approved the crew's proposal (`proposal-pair.md`) with all three recommendations:
1. **The rule:** the pill sits on the arrow's TAIL side, 8 px past it. Above a down arrow on the target, beside an edge arrow. Fallbacks: tail side → right → left. Never covers the HUD (data-hint rects), the arrow, the target (bed) or the CHARACTER. If nothing fits, it uses the bottom dock. Arrow-less hints use the dock. The pill is hidden while the GardenBar is open (the arrow stays). No speech tail. Text never rotates.
2. **Following (Clover's middle):** the pill is LOCKED rigidly to the arrow (no lag, never drifts apart), but it switches SIDES only when she has stopped walking, unless its current side becomes blocked. Use a 24 px buffer on any side switch. A side switch is a crossfade (~320 ms), never a slide across the arrow.
3. **Copy:** keep "Plant your seed in the garden 🌱". Two lines are allowed on phones.

Arrow positions do NOT change. The dock stays for arrow-less hints.

## Who does what
- **Rowan:** a `placePill(arrow, pillSize, viewport, avoidRects, prevSide, {buffer})` helper in position.js, pure and tested (sides, fallbacks, buffer, dock fallback, never intersects avoid rects; sabotage-check it). Character screen rect: project her position via Scene's projection (like the bed) and pass it as an avoid rect. Pass a "she's walking" flag for the side-switch rule.
- **Linden:** HintLayer uses placePill and drops the dock for arrow hints. Clamp to the screen. Measure at 375/768/1024/1280: at the bed, the edge arrow, the bed below, and walking. Zero overlaps with the HUD, bed or character.
- **Fern:** the pair arrival (arrow lands, pill unfolds from the arrow side 120 ms later, scale .96→1 + fade 280 ms), the side-switch crossfade, leaving together, reduced motion = fades. The dock motion is kept for arrow-less hints.
- **Wren:** confirm the timings still land; no new sounds. The follow and flip are silent.
- **Clover:** QA every size, including walking past the bed (does the pill hop sides mid-walk? it must not), the phone edge arrow (does it cover the character? it must not), the GardenBar open, planting, reduced motion. Then a retro addendum for job 3.

IDs: Rowan a9b1b720bd131fe3d · Linden a2d0525802c3a193d · Fern a8ec70c83f5b34ff3 · Wren a911016331f332eee · Clover aa8b8028cf4e5ef95. Agree names before building. Push back any time. Don't commit; Nathan reviews.
