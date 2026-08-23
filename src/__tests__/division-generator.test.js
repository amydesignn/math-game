import { describe, it, expect } from 'vitest'
import { TOPICS, DIV_PHASE, divGems, generateStation, nextProblem } from '../math'

/*
 * The long-div GENERATOR (Finn's C2 Phase-1 spec): 2-digit dividend (10–99),
 * 1-digit divisor 2–9 (never ÷1), ~50/50 remainder, flat 1 gem, Grade 5.
 * The generator is registered but NOT yet in the sparkle/station rotation —
 * it goes live only once the answer path is verified.
 */

const gen = () => TOPICS['long-div'].generate()

describe('long-div generator — Finn C2 Phase 1', () => {
  it('is registered flat: topLevel 1, grade 5, phase 1', () => {
    expect(DIV_PHASE).toBe(1)
    expect(TOPICS['long-div'].topLevel).toBe(1)
    expect(TOPICS['long-div'].grade).toBe(5)
  })

  it('every problem is a well-formed Phase-1 division that pays 1 gem', () => {
    for (let i = 0; i < 500; i++) {
      const p = gen()
      expect(p.type).toBe('long-div')
      expect(p.op).toBe('÷')
      expect(p.a).toBeGreaterThanOrEqual(10)
      expect(p.a).toBeLessThanOrEqual(99)
      expect(p.b).toBeGreaterThanOrEqual(2)
      expect(p.b).toBeLessThanOrEqual(9) // never divide by 1
      // the stored answer is correct + self-consistent
      expect(p.quotient).toBe(Math.floor(p.a / p.b))
      expect(p.remainder).toBe(p.a % p.b)
      expect(p.quotient * p.b + p.remainder).toBe(p.a)
      // sneakyZero = an interior/trailing 0 in the quotient (never a leading one)
      const expectedSneaky = String(p.quotient).length > 1 && String(p.quotient).slice(1).includes('0')
      expect(p.sneakyZero).toBe(expectedSneaky)
      // Phase 1: flat 1 gem, tagged Grade 5
      expect(p.gems).toBe(1)
      expect(p.grade).toBe(5)
      // similar is a real, different division for the worked example
      expect(p.similar.a).not.toBe(p.a)
      expect(p.similar.quotient * p.similar.b + p.similar.remainder).toBe(p.similar.a)
    }
  })

  it('produces both remainder and no-remainder problems (~50/50)', () => {
    let withRem = 0
    const N = 600
    for (let i = 0; i < N; i++) if (gen().remainder > 0) withRem++
    expect(withRem).toBeGreaterThan(N * 0.3)
    expect(withRem).toBeLessThan(N * 0.7)
  })

  it('the worked-example twin matches the difficulty anatomy (overwhelmingly)', () => {
    let mismatch = 0
    const N = 300
    for (let i = 0; i < N; i++) {
      const p = gen()
      if (p.similar.sneakyZero !== p.sneakyZero || (p.similar.remainder > 0) !== (p.remainder > 0)) mismatch++
    }
    // the guard occasionally can't find a rare sneaky-zero twin — that's a safe
    // graceful fallback, not a failure; the match holds for the vast majority.
    expect(mismatch).toBeLessThan(N * 0.05)
  })
})

describe('divGems — Finn C2 payout, both phases (Phase 2 tested before it ships)', () => {
  it('Phase 1 pays a flat gem, even for a sneaky zero', () => {
    expect(divGems(false, 1)).toBe(1)
    expect(divGems(true, 1)).toBe(1)
  })
  it('Phase 2 pays 2, and 3 for the sneaky zero (Ivy\'s hard case)', () => {
    expect(divGems(false, 2)).toBe(2)
    expect(divGems(true, 2)).toBe(3)
  })
})

describe('rotation — division is a live frontier topic now', () => {
  it('nextProblem serves long-div alongside multiplication + the confidence pool', () => {
    const seen = new Set()
    for (let i = 0; i < 500; i++) seen.add(nextProblem().type)
    expect(seen.has('long-div')).toBe(true)
    expect(seen.has('long-mult')).toBe(true)
  })

  it('stations serve division AND never flatten any topic\'s payout', () => {
    // The `p.gems = p.level` trap: a station must pay exactly what the generator
    // set — long-mult by level, long-div by Finn's phase rule, others flat 1.
    const expectedGems = (p) =>
      p.type === 'long-mult' ? p.level : p.type === 'long-div' ? divGems(p.sneakyZero) : 1
    let sawDiv = false
    for (let i = 0; i < 500; i++) {
      for (const p of generateStation(2)) {
        expect(p.gems).toBe(expectedGems(p))
        if (p.type === 'long-div') sawDiv = true
      }
    }
    expect(sawDiv).toBe(true)
  })
})
