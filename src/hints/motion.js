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
 */
export const HINT_MOTION = {
  inMs: 280, //          arrow arrival (opacity + drop + scale, ease-out)
  toastDelayMs: 120, //  toast follows the arrow: "look here", then read
  toastInMs: 280, //     toast (dock pill) arrival: rises 16 px from the dock
  outMs: 200, //         quiet retire (dismissed / left / paused), arrow + toast
  doneArrowMs: 600, //   first-plant swell: peak 270 ms, gone by 600 ms
  bobDelayMs: 700, //    bob starts after the hintShow tail; ×3 at 1.6 s, then rests
  // green edge arrow (Amy review 1): taps toward the off-screen target, then rests.
  // The host re-arms it (data-arm 1↔2) only after edgeTaps × edgeTapMs + edgeTapDelayMs.
  edgeTapDelayMs: 300, // first tap after entering edge / re-arming
  edgeTapMs: 2400, //    one tap per period (the press is the first ~30%)
  edgeTaps: 5, //        then rest (~12 s in total)
  // job 3, the paired pill: arrival = toastDelayMs + 280 ms; leave = outMs, together with the arrow.
  swapOutMs: 120, //     side switch / re-anchor: fade out in place, then move it…
  swapInMs: 200, //      …and fade in on the new side (no delay, no scale). ≈320 ms total
  swapSnapMs: 60, //     swap-out when the HELD spot turns blocked (data-snap): gone before it rides in
}
