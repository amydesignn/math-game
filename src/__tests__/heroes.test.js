/*
 * Heroes (2026-10-15) — who she plays as, swapped in the Gem Shop. Three are
 * free (the Sorcerer + two Kenney minis); the rest unlock with gems ONCE and
 * she plays as them right away. A hero she doesn't own can never be played —
 * not by the UI, not by an old or edited save.
 *
 * Same harness as wardrobe.test.js: fresh store module per test.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { HEROES, PLAYER, CHARACTERS } from '../config.js'

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
const FREE = HEROES.filter((h) => h.price === 0)
const LOCKED = HEROES.filter((h) => h.price > 0)

describe('heroes catalogue', () => {
  it('three free heroes, the Sorcerer first; the rest locked', () => {
    expect(FREE.map((h) => h.id)).toHaveLength(3)
    expect(HEROES[0].id).toBe(PLAYER)
    expect(LOCKED.length).toBeGreaterThan(0)
  })

  it('every hero is a model we ship, with a thumb on disk; ids unique', () => {
    for (const h of HEROES) {
      expect(h.id === PLAYER || CHARACTERS.includes(h.id)).toBe(true)
      expect(existsSync(`public/models/characters/${h.id}.glb`)).toBe(true)
      expect(existsSync(`public/${h.thumb}`)).toBe(true)
    }
    expect(new Set(HEROES.map((h) => h.id)).size).toBe(HEROES.length)
  })
})

describe('swapping heroes', () => {
  it('a fresh save plays the Sorcerer and owns no locked heroes', async () => {
    const store = await import('../store.js')
    expect(store.getState().character).toBe(PLAYER)
    expect(store.getState().ownedHeroes).toEqual([])
  })

  it('she can swap to any free hero, and it saves', async () => {
    const store = await import('../store.js')
    expect(store.setCharacter(FREE[1].id)).toBe(true)
    expect(saved().character).toBe(FREE[1].id)
  })

  it('a locked hero cannot be played without unlocking', async () => {
    seed({ gems: 999 })
    const store = await import('../store.js')
    expect(store.setCharacter(LOCKED[0].id)).toBe(false)
    expect(store.getState().character).toBe(PLAYER)
    expect(store.getState().gems).toBe(999) // a swap never spends
  })

  it('an unknown id is refused', async () => {
    const store = await import('../store.js')
    expect(store.setCharacter('character-dragon')).toBe(false)
    expect(store.buyHero('character-dragon')).toBe(null)
  })
})

describe('unlocking — pay once, play freely', () => {
  it('unlocking spends the price once, saves, and she plays as them', async () => {
    const h = LOCKED[0]
    seed({ gems: h.price + 5 })
    const store = await import('../store.js')
    expect(store.buyHero(h.id)).toBe(h.id)
    expect(store.getState().gems).toBe(5)
    expect(store.getState().character).toBe(h.id)
    expect(saved().ownedHeroes).toEqual([h.id])
    // swap away and back — never charged again
    store.setCharacter(PLAYER)
    expect(store.buyHero(h.id)).toBe(h.id)
    expect(store.setCharacter(h.id)).toBe(true)
    expect(store.getState().gems).toBe(5)
    expect(store.getState().ownedHeroes).toEqual([h.id])
  })

  it("she can't unlock what she can't afford — nothing changes", async () => {
    const h = LOCKED[0]
    seed({ gems: h.price - 1 })
    const store = await import('../store.js')
    expect(store.buyHero(h.id)).toBe(null)
    expect(store.getState().gems).toBe(h.price - 1)
    expect(store.getState().character).toBe(PLAYER)
    expect(store.getState().ownedHeroes).toEqual([])
  })

  it('choosing a free hero via buyHero costs nothing', async () => {
    seed({ gems: 3 })
    const store = await import('../store.js')
    expect(store.buyHero(FREE[2].id)).toBe(FREE[2].id)
    expect(store.getState().gems).toBe(3)
    expect(store.getState().ownedHeroes).toEqual([])
  })
})

describe('migration', () => {
  it('an unlocked hero survives a reload', async () => {
    const h = LOCKED[1]
    seed({ character: h.id, ownedHeroes: [h.id] })
    const store = await import('../store.js')
    expect(store.getState().character).toBe(h.id)
  })

  it('a save playing an unowned / unshipped hero falls back to the Sorcerer; unknown owned ids drop', async () => {
    seed({ character: LOCKED[0].id, ownedHeroes: ['character-dragon'] })
    const store = await import('../store.js')
    expect(store.getState().character).toBe(PLAYER)
    expect(store.getState().ownedHeroes).toEqual([])
  })

  it('a save from before heroes (no ownedHeroes) keeps a free hero', async () => {
    seed({ character: FREE[1].id })
    const store = await import('../store.js')
    expect(store.getState().character).toBe(FREE[1].id)
    expect(store.getState().ownedHeroes).toEqual([])
  })
})
