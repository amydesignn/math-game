/*
 * Companion shop contract (Ivy, 2026-10-14). The cat is always hers; a bought
 * companion costs its price ONCE, becomes her companion right away, and she can
 * switch between the ones she owns for free. A pet she doesn't own can never be
 * set — not by the UI, not by an old or hand-edited save.
 *
 * Store singleton → fresh module per test via vi.resetModules() + in-memory
 * localStorage, exactly like onboarding.test.js / door.test.js.
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
const seed = (s) => storage.setItem(KEY, JSON.stringify({ seenOnboarding: true, capRetiredAt: 'x', ...s }))

describe('companions — buy once, switch freely', () => {
  it('a fresh save owns the cat and has it as her companion', async () => {
    const store = await import('../store.js')
    expect(store.getState().pet).toBe('animal-cat')
    expect(store.getState().ownedPets).toEqual(['animal-cat'])
  })

  it('buying the sprout costs 50 once, makes it hers, and persists', async () => {
    seed({ gems: 60, lifetimeGems: 60 })
    const store = await import('../store.js')
    expect(store.buyPet('sprout')).toBe('sprout')
    expect(store.getState().gems).toBe(10)
    expect(store.getState().pet).toBe('sprout')
    expect(saved().ownedPets).toEqual(['animal-cat', 'sprout'])
    // switching back and forth is free
    expect(store.setPet('animal-cat')).toBe(true)
    expect(store.buyPet('sprout')).toBe('sprout')
    expect(store.getState().gems).toBe(10)
  })

  it("can't buy what she can't afford — nothing changes", async () => {
    seed({ gems: 49, lifetimeGems: 49 })
    const store = await import('../store.js')
    expect(store.buyPet('sprout')).toBe(null)
    expect(store.getState().gems).toBe(49)
    expect(store.getState().pet).toBe('animal-cat')
    expect(store.getState().ownedPets).toEqual(['animal-cat'])
  })

  it("setPet refuses a companion she doesn't own", async () => {
    const store = await import('../store.js')
    expect(store.setPet('sprout')).toBe(false)
    expect(store.getState().pet).toBe('animal-cat')
  })

  it('an old save (no ownedPets) migrates to owning the cat', async () => {
    seed({ gems: 5, pet: 'animal-cat' })
    const store = await import('../store.js')
    expect(store.getState().ownedPets).toEqual(['animal-cat'])
  })

  it("a save whose pet she doesn't own (or we don't ship) falls back to the cat", async () => {
    seed({ pet: 'sprout', ownedPets: ['animal-cat', 'dragon'] })
    const store = await import('../store.js')
    expect(store.getState().pet).toBe('animal-cat')
    expect(store.getState().ownedPets).toEqual(['animal-cat'])
  })
})
