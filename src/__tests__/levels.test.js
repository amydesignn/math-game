import { describe, it, expect } from 'vitest'
import { requiredFor, levelState, levelOf, fmtPoints, pickLevelMessage, MESSAGE_PACKS, TEAM } from '../levels'

/*
 * The level ladder is Amy's rule and Finn's table — so the table itself is the
 * fixture, exactly like the C1 calibration set. If someone "simplifies" the
 * formula later, these fail before Ivy ever sees a wrong level.
 */

// Finn's published table (Notion: Phase 5 — Level Ladder, Decisions & Specs)
const TABLE = [
  [1, 0], [2, 50], [3, 100], [4, 150], [5, 200], [6, 250],
  [7, 300], [8, 350], [9, 400], [10, 450], [11, 550], [12, 650],
  [15, 950], [20, 1450],
]

describe('level thresholds', () => {
  it('matches every row of the published table', () => {
    for (const [level, points] of TABLE) expect(requiredFor(level)).toBe(points)
  })

  it('round-trips level → points → level, to Level 40', () => {
    for (let l = 1; l <= 40; l++) expect(levelOf(requiredFor(l))).toBe(l)
  })

  it('never skips or repeats a level as points climb', () => {
    let expected = 1
    for (let p = 0; p <= 4000; p++) {
      const l = levelOf(p)
      expect(l === expected || l === expected + 1).toBe(true)
      expected = l
    }
  })

  it('changes rate at Level 10, not before', () => {
    // +50 a level up to 10, +100 after — the one seam in the ladder
    for (let l = 2; l <= 10; l++) expect(requiredFor(l) - requiredFor(l - 1)).toBe(50)
    for (let l = 11; l <= 20; l++) expect(requiredFor(l) - requiredFor(l - 1)).toBe(100)
  })

  it('reports progress within the level, and it always fits', () => {
    for (let p = 0; p <= 2000; p++) {
      const { level, into, need } = levelState(p)
      expect(into).toBeGreaterThanOrEqual(0)
      expect(into).toBeLessThan(need)
      expect(requiredFor(level) + into).toBe(p) // the bar is truthful
    }
  })

  it('never goes negative, whatever it is handed', () => {
    expect(levelOf(-99)).toBe(1)
    expect(levelState(0)).toEqual({ level: 1, into: 0, need: 50 })
  })
})

describe('points display', () => {
  it('is exact under 1,000 and compact above (Amy rule)', () => {
    expect(fmtPoints(0)).toBe('0')
    expect(fmtPoints(999)).toBe('999')
    expect(fmtPoints(1000)).toBe('1K')
    expect(fmtPoints(1180)).toBe('1.1K')
    expect(fmtPoints(12500)).toBe('12.5K')
  })
})

describe('level-up messages', () => {
  it('gives every teammate five', () => {
    for (const who of TEAM) expect(MESSAGE_PACKS[who]).toHaveLength(5)
  })

  it('rotates the voice — never the same teammate twice in a row', () => {
    let prev = null
    for (let n = 0; n < 30; n++) {
      const { from } = pickLevelMessage(3, n)
      expect(from).not.toBe(prev)
      prev = from
    }
  })

  it('shows all fifteen before repeating any of them', () => {
    const seen = new Set()
    for (let n = 0; n < 15; n++) seen.add(pickLevelMessage(3, n).text)
    expect(seen.size).toBe(15)
  })

  it('signs the Level 10 special from Finn, and keeps its own wording', () => {
    const m = pickLevelMessage(10, 7)
    expect(m.from).toBe('finn')
    expect(m.text).toContain('Double digits')
  })

  it('puts the real level into the message', () => {
    for (let n = 0; n < 15; n++) {
      const { text } = pickLevelMessage(7, n)
      expect(text).toContain('Level 7!')
      expect(text).not.toContain('[X]')
    }
  })
})
