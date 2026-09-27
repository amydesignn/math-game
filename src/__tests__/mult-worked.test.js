import { describe, it, expect } from 'vitest'
import { buildStagesMulti, similarLongMult, levelOfLongMult, TOPICS } from '../math'

/*
 * The long-multiplication worked example (v2) — Amy + Finn's 2026-09-27 report
 * from the Luxi Math video recording:
 *   1. the walkthrough must END by adding the rows and handing her back to HER
 *      problem (and show every carry, not only the ones-pass carry);
 *   2. "one just like it" must share her problem's STRUCTURE — 32 × 31 got
 *      40 × 21, whose 0 made the ones pass trivial.
 */

const digits = (n) => [Math.floor(n / 10), n % 10]
const partialCarries = (a, d) => digits(a).some((x) => x * d > 9)

describe('similarLongMult — the example is shaped like her problem', () => {
  it('32 × 31 never gets a zero, keeps the ×1, and stays carry-free', () => {
    for (let i = 0; i < 100; i++) {
      const s = similarLongMult(32, 31, 1)
      expect([...digits(s.a), ...digits(s.b)]).not.toContain(0)
      expect(s.b % 10).toBe(1)
      expect(levelOfLongMult(s.a, s.b)).toBe(1)
      expect(`${s.a}×${s.b}`).not.toBe('32×31')
      expect(`${s.a}×${s.b}`).not.toBe('31×32')
    }
  })

  it('a zero in her problem gets a zero in the same place (33 × 30)', () => {
    for (let i = 0; i < 50; i++) {
      const s = similarLongMult(33, 30, levelOfLongMult(33, 30))
      expect(s.b % 10).toBe(0)
      expect([Math.floor(s.a / 10), s.a % 10, Math.floor(s.b / 10)]).not.toContain(0)
    }
  })

  it.each([1, 2, 3])('generated L%i siblings carry in exactly the same passes', (level) => {
    for (let i = 0; i < 150; i++) {
      const p = TOPICS['long-mult'].generate(level)
      const { a, b, similar: s } = p
      expect(partialCarries(s.a, s.b % 10)).toBe(partialCarries(a, b % 10))
      expect(partialCarries(s.a, Math.floor(s.b / 10))).toBe(partialCarries(a, Math.floor(b / 10)))
      const zeroMask = (x, y) => [...digits(x), ...digits(y)].map((d) => d === 0).join()
      expect(zeroMask(s.a, s.b)).toBe(zeroMask(a, b))
    }
  })
})

describe('buildStagesMulti — the walkthrough finishes the problem', () => {
  const sumOf = (st) => st.snap.sum.join('')

  it('ends with the added rows, then hands her back to her own problem', () => {
    const { stages, answer } = buildStagesMulti(42, 21, { a: 32, b: 31 })
    const [addStep, handoff] = stages.slice(-2)
    expect(answer).toBe(882)
    expect(sumOf(addStep)).toBe('882')
    expect(addStep.caption).toMatch(/add the rows/)
    expect(sumOf(handoff)).toBe('882')
    expect(handoff.caption).toMatch(/Your turn: 32 × 31/)
  })

  it('shows the tens-pass placeholder zero before the tens row is written', () => {
    const { stages } = buildStagesMulti(42, 21)
    const zero = stages.find((st) => st.snap.zeroHot)
    expect(zero.snap.row2).toEqual(['', '', '', '0'])
  })

  it('a carrying tens pass gets its own carry beat (36 × 42: 6 × 4 = 24)', () => {
    const { stages } = buildStagesMulti(36, 42)
    const tensCarry = stages.find((st) => st.snap.spot === 'T' && st.snap.carryHot)
    expect(tensCarry).toBeTruthy()
    expect(tensCarry.snap.carry[2]).toBe('2') // over the top's tens digit — the one multiplied next
    expect(tensCarry.snap.row2).toEqual(['', '', '4', '0'])
  })

  it('a carrying final addition shows the carry (34 × 22: 68 + 680)', () => {
    const { stages } = buildStagesMulti(34, 22)
    const add = stages[stages.length - 2]
    expect(sumOf(add)).toBe('748')
    expect(add.snap.addCarry[1]).toBe('1') // 6 + 8 = 14 → the 1 sits over the hundreds
    expect(add.snap.carry.every((c) => c === '')).toBe(true) // never mixed into the × carries
    expect(add.caption).toMatch(/carry the 1/)
  })

  it('names every carry when the addition carries more than once (47 × 43: 141 + 1880)', () => {
    const add = buildStagesMulti(47, 43).stages.at(-2)
    expect(add.snap.addCarry).toEqual(['1', '1', '', ''])
    expect(add.caption).toMatch(/\(12, 10\)/)
  })

  it('every snapshot rows add up to the true product', () => {
    for (const [a, b] of [[32, 31], [36, 42], [89, 89], [34, 22], [53, 32]]) {
      const { stages, answer } = buildStagesMulti(a, b)
      expect(Number(sumOf(stages[stages.length - 1]))).toBe(a * b)
      expect(answer).toBe(a * b)
    }
  })
})
