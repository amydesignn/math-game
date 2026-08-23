import { describe, it, expect } from 'vitest'
import { buildDivisionStages, divideSteps } from '../math'

/*
 * The C2 long-division builder (Oscar's "Let's share the candy" comp → the pure
 * divideSteps / buildDivisionStages in math.js). Locks three things:
 *   1. STANDARD long division — the first quotient digit sits above the LAST
 *      digit of the first divisible group; NO leading zero is written
 *      (15 ÷ 4 = 3, never "03"). Interior/trailing zeros are the real sneaky
 *      zeros. This is the 2026-08-23 fix — the pre-fix build wrote "03" and
 *      mis-celebrated a sneaky zero for every first-digit-<-divisor problem.
 *   2. the ARITHMETIC — quotient/remainder for every shape.
 *   3. the CAPTIONS — Oscar's teaching copy verbatim (the copy IS the teaching).
 *
 * Stage count = 2 (intro + Sharing-Table) + per STEP [DIVIDE, MULTIPLY,
 *   SUBTRACT] + [BRING_DOWN on every step but the last] + 1 (final)
 *   = 2 + (4·steps − 1) + 1 = 4·steps + 2, where steps = quotient digit count.
 */

describe('divideSteps — standard long division, never a leading zero', () => {
  const cases = [
    // [a, b, quotient, remainder, sneakyZero, steps]
    [815, 4, 203, 3, true, 3], // canonical interior sneaky zero
    [85, 4, 21, 1, false, 2],
    [84, 4, 21, 0, false, 2],
    [816, 4, 204, 0, true, 3],
    [15, 4, 3, 3, false, 1], // ← first digit < divisor: quotient is 3, NOT "03"
    [23, 5, 4, 3, false, 1],
    [17, 9, 1, 8, false, 1],
    [100, 8, 12, 4, false, 2], // ← leading 1 absorbed into "10"
    [90, 9, 10, 0, true, 2], // ← a TRAILING zero IS a sneaky zero
    [50, 5, 10, 0, true, 2],
  ]
  it.each(cases)('%i ÷ %i = %i R%i', (a, b, quotient, remainder, sneaky, nsteps) => {
    const d = divideSteps(a, b)
    expect(d.quotient).toBe(quotient)
    expect(d.remainder).toBe(remainder)
    expect(d.steps).toHaveLength(nsteps)
    expect(d.quotient * b + d.remainder).toBe(a) // reconstructs the dividend
    expect(String(d.quotient)[0]).not.toBe('0') // never a leading zero
    const sneakyFlag = d.steps.some((s, i) => i > 0 && s.qd === 0) // interior/trailing only
    expect(sneakyFlag).toBe(sneaky)
  })
})

describe('buildDivisionStages — arithmetic + the fixed "03" bug', () => {
  it('815 ÷ 4 = 203 R3 (canonical sneaky zero)', () => {
    const b = buildDivisionStages(815, 4)
    expect(b.quotientNum).toBe('203')
    expect(b.q).toEqual(['2', '0', '3'])
    expect(b.remainder).toBe(3)
    expect(b.n).toBe(3)
    expect(b.stages).toHaveLength(4 * 3 + 2) // 14 — matches the progress dots
  })

  it('15 ÷ 4 = 3 R3 — a single-digit quotient, NOT "03" (the fixed bug)', () => {
    const b = buildDivisionStages(15, 4)
    expect(b.quotientNum).toBe('3')
    expect(b.q).toEqual(['', '3']) // column 0 (the 1) is absorbed → blank
    expect(b.remainder).toBe(3)
    expect(b.stages).toHaveLength(4 * 1 + 2) // 6 — ONE division step, not two
    expect(b.stages.some((s) => s.celebrate === 'sneaky')).toBe(false) // no spurious sneaky zero
  })

  it('100 ÷ 8 = 12 R4 — the leading 1 is absorbed, intro explains the group', () => {
    const b = buildDivisionStages(100, 8)
    expect(b.quotientNum).toBe('12')
    expect(b.q).toEqual(['', '1', '2'])
    expect(b.remainder).toBe(4)
    expect(b.stages[1].caption).toContain('look at the first 2 digits together — 10')
  })

  it('85 ÷ 4 = 21 R1', () => {
    const b = buildDivisionStages(85, 4)
    expect(b.quotientNum).toBe('21')
    expect(b.q).toEqual(['2', '1'])
    expect(b.remainder).toBe(1)
    expect(b.stages).toHaveLength(4 * 2 + 2) // 10
  })

  it('the quotient always rebuilds the dividend', () => {
    for (const [a, bb] of [[815, 4], [85, 4], [84, 4], [816, 4], [15, 4], [100, 8], [90, 9]]) {
      const built = buildDivisionStages(a, bb)
      expect(Number(built.quotientNum) * bb + built.remainder).toBe(a)
    }
  })
})

describe('buildDivisionStages — the sneaky zero', () => {
  it('815 ÷ 4 flags a sneaky zero at the tens column, and only there', () => {
    const b = buildDivisionStages(815, 4)
    const sneaky = b.stages.filter((s) => s.celebrate === 'sneaky')
    expect(sneaky).toHaveLength(1)
    expect(sneaky[0].qSneaky).toEqual([false, true, false])
    expect(sneaky[0].caption).toContain('sneaky zero')
  })

  it('90 ÷ 9 = 10 — a TRAILING zero is a real sneaky zero', () => {
    const b = buildDivisionStages(90, 9)
    expect(b.quotientNum).toBe('10')
    expect(b.stages.some((s) => s.celebrate === 'sneaky')).toBe(true)
  })

  it('85 ÷ 4 and 15 ÷ 4 have no sneaky zero', () => {
    expect(buildDivisionStages(85, 4).stages.some((s) => s.celebrate === 'sneaky')).toBe(false)
    expect(buildDivisionStages(15, 4).stages.some((s) => s.celebrate === 'sneaky')).toBe(false)
  })
})

describe('buildDivisionStages — captions are Oscar verbatim', () => {
  it('opens with the fair-sharing framing', () => {
    const b = buildDivisionStages(815, 4)
    expect(b.stages[0].caption).toBe(
      "We have 815 candies to share equally among 4 friends. Let's find out how many each friend gets! 🍬",
    )
  })

  it('names the Sharing Table on the second step (first digit divides)', () => {
    const b = buildDivisionStages(815, 4)
    expect(b.stages[1].caption).toContain('This glowing box is the Sharing Table')
  })

  it('closes on the remainder with the leftover-candy line', () => {
    const b = buildDivisionStages(815, 4)
    const last = b.stages[b.stages.length - 1]
    expect(last.final).toBe(true)
    expect(last.caption).toBe('Done! Each of the 4 friends gets 203 candies, with 3 left over 🍬.')
  })

  it('an even share closes with "perfectly evenly", not a remainder', () => {
    const last = buildDivisionStages(84, 4).stages.slice(-1)[0]
    expect(last.caption).toContain('shares perfectly evenly')
    expect(last.caption).not.toContain('left over')
  })
})
