/*
 * Seasonal promo contract (Halloween 2026, Amy 2026-10-15). The popup shows once
 * and its gift pays once — claimPromo marks seen + pays in one save, so a reload
 * can neither re-pay nor lose it. And it only runs inside its season + year.
 *
 * Store singleton → fresh module per test, exactly like onboarding.test.js.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const KEY = 'math_world_v1'

function fakeStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  }
}

let storage
beforeEach(() => {
  vi.resetModules()
  storage = fakeStorage()
  globalThis.localStorage = storage
})

const saved = () => JSON.parse(storage.getItem(KEY))

describe('claimPromo — once and gone', () => {
  it('pays the gems once, marks it seen, and persists both', async () => {
    const store = await import('../store.js')
    const before = store.getState().gems
    expect(store.hasSeenPromo('halloween-2026')).toBe(false)
    expect(store.claimPromo('halloween-2026', 3)).toBe(before + 3)
    expect(store.hasSeenPromo('halloween-2026')).toBe(true)
    expect(saved().promos).toContain('halloween-2026')
    expect(saved().gems).toBe(before + 3)
  })

  it('a second claim pays nothing — even after a reload', async () => {
    let store = await import('../store.js')
    store.claimPromo('halloween-2026', 3)
    const g = store.getState().gems
    expect(store.claimPromo('halloween-2026', 3)).toBeNull()
    vi.resetModules()
    store = await import('../store.js')
    expect(store.claimPromo('halloween-2026', 3)).toBeNull()
    expect(store.getState().gems).toBe(g)
  })

  it('counts toward lifetimeGems (the level bar ledger)', async () => {
    const store = await import('../store.js')
    const life = store.getState().lifetimeGems
    store.claimPromo('halloween-2026', 3)
    expect(store.getState().lifetimeGems).toBe(life + 3)
  })

  it('a returning player (save from before promos) still gets it', async () => {
    storage.setItem(KEY, JSON.stringify({ seenOnboarding: true, capRetiredAt: 'x', played: true, gems: 40, lifetimeGems: 120 }))
    const store = await import('../store.js')
    expect(store.hasSeenPromo('halloween-2026')).toBe(false)
    expect(store.claimPromo('halloween-2026', 3)).toBe(43)
  })
})

describe('promoActive — season + year', () => {
  it('runs in Halloween 2026 only', async () => {
    const { promoActive } = await import('../ui/PromoPopup.jsx')
    expect(promoActive(undefined, new Date(2026, 9, 15))).toBe(true) // Oct 15
    expect(promoActive(undefined, new Date(2026, 9, 1))).toBe(true) // Oct 1
    expect(promoActive(undefined, new Date(2026, 10, 2))).toBe(true) // Nov 2
    expect(promoActive(undefined, new Date(2026, 10, 3))).toBe(false) // Nov 3
    expect(promoActive(undefined, new Date(2026, 8, 30))).toBe(false) // Sep 30
    expect(promoActive(undefined, new Date(2027, 9, 15))).toBe(false) // next year's Halloween = a new promo
  })
})
