/*
 * The Sorcerer + her wardrobe (Ivy, 2026-10-14). She is the player character
 * for every save; the blue hat + purple staff are hers from the start; a
 * bought colour costs its price ONCE and she wears it right away; she can
 * switch between pieces she owns, or take a slot off, for free. A piece she
 * doesn't own can never be worn — not by the UI, not by an old or edited save.
 *
 * Same harness as companions.test.js: fresh store module per test.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GEAR, GEAR_SOCKETS, DEFAULT_GEAR, DEFAULT_HERO } from '../config.js'

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

describe('the Sorcerer — a free hero with a wardrobe', () => {
  it('a fresh save starts as Sunny, with the Sorcerer\'s blue hat + purple staff ready for when she picks her', async () => {
    const store = await import('../store.js')
    expect(store.getState().character).toBe(DEFAULT_HERO)
    expect(store.getState().gear).toEqual({ hat: 'hat-blue', staff: 'staff-purple' })
    expect(store.getState().ownedGear).toEqual([])
  })

  it('an old save (a locked Kenney hero, no wardrobe) falls back to Sunny, wardrobe defaulted', async () => {
    seed({ gems: 5, character: 'character-female-a' })
    const store = await import('../store.js')
    expect(store.getState().character).toBe(DEFAULT_HERO)
    expect(store.getState().gear).toEqual(DEFAULT_GEAR)
  })
})

describe('wardrobe — buy once, wear freely', () => {
  it('buying a hat spends its price once, saves, and she wears it', async () => {
    seed({ gems: 25 })
    const store = await import('../store.js')
    expect(store.buyGear('hat-green')).toBe('hat-green')
    expect(store.getState().gems).toBe(15)
    expect(store.getState().gear.hat).toBe('hat-green')
    expect(saved().ownedGear).toEqual(['hat-green'])
    // owned now → buying again is free (just wears it)
    store.setGear('hat', 'hat-blue')
    expect(store.buyGear('hat-green')).toBe('hat-green')
    expect(store.getState().gems).toBe(15)
  })

  it("can't buy what she can't afford — nothing changes", async () => {
    seed({ gems: 4 })
    const store = await import('../store.js')
    expect(store.buyGear('staff-pink')).toBe(null)
    expect(store.getState().gems).toBe(4)
    expect(store.getState().gear.staff).toBe('staff-purple')
  })

  it('switching between owned pieces and the free ones costs nothing', async () => {
    seed({ gems: 10, ownedGear: ['staff-orange'] })
    const store = await import('../store.js')
    expect(store.setGear('staff', 'staff-orange')).toBe(true)
    expect(store.setGear('staff', 'staff-purple')).toBe(true)
    expect(store.getState().gems).toBe(10)
  })

  it('a slot can be taken off (null) and put back on', async () => {
    const store = await import('../store.js')
    expect(store.setGear('hat', null)).toBe(true)
    expect(saved().gear.hat).toBe(null)
    expect(store.setGear('hat', 'hat-blue')).toBe(true)
  })

  it("setGear refuses a piece she doesn't own, or one in the wrong slot", async () => {
    const store = await import('../store.js')
    expect(store.setGear('hat', 'hat-red')).toBe(false)
    expect(store.setGear('hat', 'staff-purple')).toBe(false)
    expect(store.setGear('cape', 'hat-blue')).toBe(false)
    expect(store.getState().gear).toEqual(DEFAULT_GEAR)
  })

  it('a save wearing something unowned / unshipped falls back to the default; a bare slot stays bare', async () => {
    seed({ gear: { hat: 'hat-red', staff: null }, ownedGear: ['crown-gold'] })
    const store = await import('../store.js')
    expect(store.getState().gear).toEqual({ hat: 'hat-blue', staff: null })
    expect(store.getState().ownedGear).toEqual([])
  })
})

describe('wardrobe catalogue', () => {
  it('every slot has a free default, every piece has a socket, ids are unique', () => {
    for (const [slot, id] of Object.entries(DEFAULT_GEAR)) {
      const g = GEAR.find((x) => x.id === id)
      expect(g.slot).toBe(slot)
      expect(g.price).toBe(0)
    }
    for (const g of GEAR) expect(GEAR_SOCKETS[g.slot]).toBeTruthy()
    expect(new Set(GEAR.map((g) => g.id)).size).toBe(GEAR.length)
  })
})
