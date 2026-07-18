import { describe, it, expect } from 'vitest'
import { solve, buildStagesMulti, buildStages, TOPICS, levelOfLongMult } from '../math'

/*
 * THE CALIBRATION SET — Finn's C1 Topic Spec, transcribed from Amy's photos of
 * Ivy's Complete Canadian Curriculum G5, Unit 4, pp.18–19. These are REAL
 * problems from her workbook, levelled by Finn.
 *
 * Finn's rule for this file: "The 10 problems below become the literal test
 * file — CI fails if the generator drifts. Curate to calibrate, generate to
 * sustain." So this is not a synthetic unit test: it is the curriculum holding
 * the generator accountable.
 *
 * It has already earned its keep. On the day it was written it caught two real
 * mis-gradings in the provisional ladder (see the notes on #2 and #10).
 */

/** @type {{n:number,a:number,b:number,level:1|2|3,answer:number,note?:string}[]} */
export const CALIBRATION = [
  { n: 1, a: 13, b: 12, level: 1, answer: 156, note: "p.18 — the book's own worked model; no carries anywhere" },
  { n: 2, a: 34, b: 22, level: 1, answer: 748, note: 'p.19 #6 — partials clean, ONE CARRY IN THE FINAL ADD and still L1' },
  { n: 3, a: 34, b: 28, level: 2, answer: 952, note: 'p.18 #1 — one carry (8×4)' },
  { n: 4, a: 42, b: 16, level: 2, answer: 672, note: 'p.19 #9 — one carry (6×2)' },
  { n: 5, a: 27, b: 14, level: 2, answer: 378, note: 'p.19 #3 — Ivy attempted, MARKED WRONG in red' },
  { n: 6, a: 52, b: 19, level: 2, answer: 988, note: 'p.19 #15 — ones-partial carries' },
  { n: 7, a: 47, b: 39, level: 3, answer: 1833, note: 'p.19 #5 — full carries, both partials' },
  { n: 8, a: 68, b: 45, level: 3, answer: 3060, note: 'p.19 #8 — full carries, both partials' },
  { n: 9, a: 38, b: 29, level: 3, answer: 1102, note: 'p.19 #4 — Ivy attempted, MARKED WRONG in red' },
  { n: 10, a: 53, b: 32, level: 3, answer: 1696, note: 'p.19 #7 — carries only at the TENS step of each partial' },
]

describe('calibration set — the curriculum is the source of truth', () => {
  it('has the spread Finn specced: 2×L1, 4×L2, 4×L3', () => {
    const byLevel = (l) => CALIBRATION.filter((p) => p.level === l).length
    expect(CALIBRATION).toHaveLength(10)
    expect([byLevel(1), byLevel(2), byLevel(3)]).toEqual([2, 4, 4])
  })

  it.each(CALIBRATION)('#$n  $a × $b  =  $answer', ({ a, b, answer }) => {
    expect(solve('×', a, b)).toBe(answer)
  })

  // ── The drift guard. This is the assertion Finn asked for. ──
  it.each(CALIBRATION)('#$n  $a × $b  is level $level  ($note)', ({ a, b, level }) => {
    expect(levelOfLongMult(a, b)).toBe(level)
  })

  /*
   * REGRESSION LOCKS — the two the calibration set caught on 2026-07-18:
   *
   *  #2  34 × 22 — the partials are clean; the only carry is in the FINAL
   *      ADDITION. The old ladder disqualified L1 for any carry at all and
   *      graded it L2. Finn's L1 is about partial-product carries; a final-add
   *      carry is allowed, because L1's lesson is the SHAPE of the algorithm.
   *
   *  #10 53 × 32 — neither partial carries at the ones digit (2×3=6, 3×3=9),
   *      but both carry at the TENS step (2×5=10, 3×5=15). The old check only
   *      looked at the ones digit, so it graded a genuine L3 as L1 — the
   *      EASIEST level. Ivy would have been handed a hard problem labelled easy,
   *      and paid 1 gem for it instead of 3.
   */
  it('#2 — a carry in the final addition alone does NOT lift a problem out of L1', () => {
    expect(levelOfLongMult(34, 22)).toBe(1)
  })
  it('#10 — a carry at the TENS step of a partial still counts (53×32 is L3, not L1)', () => {
    expect(levelOfLongMult(53, 32)).toBe(3)
  })
})

describe('worked example — the feature Ivy quits without', () => {
  it.each(CALIBRATION)('#$n builds a correct v2 walkthrough for $a × $b', ({ a, b, answer }) => {
    const { stages, answer: got } = buildStagesMulti(a, b)
    expect(got).toBe(answer)
    expect(stages.length).toBeGreaterThanOrEqual(5) // 5 clean, 6 when the ones pass carries
    // every stage must carry a caption she can read — a silent step teaches nothing
    for (const s of stages) expect(s.caption.trim().length).toBeGreaterThan(0)
  })

  it('always WRITES the tens-pass zero placeholder (the "where does it land" fix)', () => {
    for (const { a, b } of CALIBRATION) {
      const { stages } = buildStagesMulti(a, b)
      const zeroStage = stages.find((s) => s.snap.zeroHot)
      expect(zeroStage, `${a}×${b} must have an explicit zero-placeholder stage`).toBeTruthy()
      expect(zeroStage.snap.row2[3]).toBe('0')
    }
  })

  it('keeps the multiplicand WHOLE and spotlights one multiplier digit at a time', () => {
    const { stages } = buildStagesMulti(27, 14) // Ivy's red-marked #5
    // the top number is the same in every stage — it never fragments
    const tops = stages.map((s) => s.snap.top.join(''))
    expect(new Set(tops).size).toBe(1)
    // and the spotlight marches ones → tens
    const spots = stages.map((s) => s.snap.spot).filter(Boolean)
    expect(spots[0]).toBe('O')
    expect(spots[spots.length - 1]).toBe('T')
  })

  it('routes a single-digit multiplier to the v1 rows model', () => {
    const { answer } = buildStages({ type: 'mult-2x1', op: '×', a: 34, b: 6 })
    expect(answer).toBe(204)
  })
})

describe('generator — must stay inside the calibration band', () => {
  it.each([1, 2, 3])('every problem generated at level %i classifies at that level', (level) => {
    for (let i = 0; i < 200; i++) {
      const p = TOPICS['long-mult'].generate(level)
      expect(levelOfLongMult(p.a, p.b), `${p.a}×${p.b} generated for L${level}`).toBe(level)
      expect(p.level).toBe(level)
    }
  })

  it.each([1, 2, 3])('the worked-example sibling is LEVEL-matched at level %i', (level) => {
    for (let i = 0; i < 200; i++) {
      const p = TOPICS['long-mult'].generate(level)
      expect(levelOfLongMult(p.similar.a, p.similar.b)).toBe(level)
      // never her own problem — she must follow the method, not copy the answer
      expect(`${p.similar.a}×${p.similar.b}`).not.toBe(`${p.a}×${p.b}`)
    }
  })

  it.each([1, 2, 3])('pays Finn\'s rate at level %i (L1=1 · L2=2 · L3=3)', (level) => {
    const p = TOPICS['long-mult'].generate(level)
    expect(p.gems).toBe(level)
  })

  it('confidence topics always pay 1', () => {
    expect(TOPICS['mult-2x1'].generate().gems).toBe(1)
    expect(TOPICS['add-2x2'].generate().gems).toBe(1)
  })

  it('generates both operands in the 12–99 shape Finn specced', () => {
    for (let i = 0; i < 200; i++) {
      const p = TOPICS['long-mult'].generate(((i % 3) + 1))
      for (const v of [p.a, p.b, p.similar.a, p.similar.b]) {
        expect(v).toBeGreaterThanOrEqual(12)
        expect(v).toBeLessThanOrEqual(99)
      }
    }
  })
})
