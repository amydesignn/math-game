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
  toastInMs: 260, //     toast arrival
  outMs: 200, //         quiet retire (dismissed / left / paused), arrow + toast
  doneArrowMs: 600, //   first-plant swell: peak 270 ms, gone by 600 ms
  bobDelayMs: 700, //    bob starts after the hintShow tail; ×3 at 1.6 s, then rests
}
