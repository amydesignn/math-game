/**
 * Hint motion timings: Fern's beats, one source for HintLayer's plain timers.
 * motion.css mirrors these numbers. If you change one, change both.
 *
 * State changes ride setTimeout, never rAF or animationend (the rAF-starve lesson:
 * hidden tabs / iOS low-power stop frames, and the hint must still retire).
 *
 * Sound sync (Wren, src/audio.js): hintShow note 2 lands at 120 ms, which is the
 * arrow's visual landing. hintDone note 4 sits at 270 ms, which is the done-swell
 * peak. The bob waits for hintShow's tail (~700 ms) so it never pulses against it.
 *
 * Every number is on Datum's motion-v2 ladder since S9 (2026-10-23); the old value is noted.
 */
export const HINT_MOTION = {
  inMs: 300, //          arrow arrival (opacity + drop + scale, ease-out) · was 280
  toastDelayMs: 100, //  toast follows the arrow: "look here", then read · was 120
  toastInMs: 300, //     toast (dock pill) arrival: rises 16 px from the dock · was 280
  outMs: 200, //         quiet retire (dismissed / left / paused), arrow + toast
  doneArrowMs: 500, //   first-plant swell: peak 270 ms, gone by 500 ms · was 600
  bobDelayMs: 800, //    bob starts after the hintShow tail; ×3 at 1.8 s, then rests · was 700 (1.6 s)
  // green edge arrow (Amy review 1): taps toward the off-screen target, then rests.
  // The host re-arms it (data-arm 1↔2) only after edgeTaps × edgeTapMs + edgeTapDelayMs.
  edgeTapDelayMs: 300, // first tap after entering edge / re-arming
  edgeTapMs: 2800, //    one tap per period (the press is the first ~26%) · was 2400
  edgeTaps: 5, //        then rest (~14 s in total)
  // job 3, the paired pill: arrival = toastDelayMs + 300 ms; leave = outMs, together with the arrow.
  swapOutMs: 100, //     side switch / re-anchor: fade out in place, then move it… · was 120
  swapInMs: 200, //      …and fade in on the new side (no delay, no scale). ≈300 ms total
  swapSnapMs: 0, //      swap-out when the HELD spot turns blocked (data-snap): a cut, gone before it rides in · was 60
}
