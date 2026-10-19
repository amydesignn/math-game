/*
 * Decision #7 (Amy, 2026-10-18): a brand-new player's very first problem comes
 * from the easy (confidence) pool — never a 32 × 20. Built as the starting-level
 * seam (math.js startingPool), and checked on BOTH encounters: the sparkle
 * (nextProblem) and the station quest (generateStation). Brand-new = no checked
 * answer recorded in any topic.
 *
 * Store singleton → fresh module per test, so the default path (no argument,
 * reading the real save) is what's tested, the way the game calls it.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

function fakeStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }
}

beforeEach(() => {
  vi.resetModules()
  globalThis.localStorage = fakeStorage()
})

const EASY = ['mult-2x1', 'add-2x2']
const N = 300

describe('startingPool — who counts as brand-new', () => {
  it('an empty record is brand-new → easy', async () => {
    const { startingPool } = await import('../math.js')
    expect(startingPool({})).toBe('easy')
    expect(startingPool(undefined)).toBe('easy')
  })

  it('a topic touched but never answered is still brand-new', async () => {
    const { startingPool } = await import('../math.js')
    expect(startingPool({ 'long-mult': { level: 1, byLevel: {} } })).toBe('easy')
    expect(startingPool({ 'long-mult': { level: 1, byLevel: { 1: { seen: 0, correct: 0 } } } })).toBe('easy')
  })

  it('one recorded answer anywhere (right OR wrong) → the normal mix', async () => {
    const { startingPool } = await import('../math.js')
    expect(startingPool({ 'add-2x2': { byLevel: { 1: { seen: 1, correct: 0 } } } })).toBe(null)
    // an old v1 record keyed by op still counts as having played maths
    expect(startingPool({ '×': { byLevel: { 1: { seen: 4, correct: 3 } } } })).toBe(null)
  })
})

describe('the first problem, on both encounters, from a fresh save', () => {
  it('sparkle: nextProblem() is always from the easy pool', async () => {
    const { nextProblem } = await import('../math.js')
    for (let i = 0; i < N; i++) expect(EASY).toContain(nextProblem().type)
  })

  it('station: generateStation() is always one easy topic', async () => {
    const { generateStation } = await import('../math.js')
    for (let i = 0; i < N; i++) {
      const ps = generateStation(2)
      expect(ps).toHaveLength(2)
      for (const p of ps) expect(EASY).toContain(p.type)
      expect(new Set(ps.map((p) => p.type)).size).toBe(1) // still one skill per station
    }
  })

  it('the daily station plan built on a fresh save is easy too (the host path)', async () => {
    const { ensureStations } = await import('../stations.js')
    const byMap = ensureStations()
    const ps = Object.values(byMap).flatMap((st) => st.problems)
    expect(ps.length).toBeGreaterThan(0)
    for (const p of ps) expect(EASY).toContain(p.type)
  })

  it('after her first recorded answer, the frontier mix comes back', async () => {
    const store = await import('../store.js')
    const { nextProblem, generateStation } = await import('../math.js')
    store.recordAnswer('add-2x2', 1, true, 1)
    const sparkle = new Set(Array.from({ length: N }, () => nextProblem().type))
    const station = new Set(Array.from({ length: N }, () => generateStation(2)[0].type))
    for (const types of [sparkle, station]) {
      expect(types.has('long-mult')).toBe(true)
      expect(types.has('long-div')).toBe(true)
    }
  })

  it('an explicit start overrides the save (the future grade setting uses this)', async () => {
    const { nextProblem } = await import('../math.js')
    const types = new Set(Array.from({ length: N }, () => nextProblem(null).type))
    expect(types.has('long-mult')).toBe(true)
  })
})
