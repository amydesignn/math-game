/*
 * The lucky station's welcome gift (2026-10-18, Amy). A NEW player's first
 * correct answer anywhere pays WELCOME.gems + her first seed — once, instead of
 * that answer's usual pay. Older saves (Ivy, Amy, any guest who has played)
 * never get it and keep their free starter seed. Same harness as garden.test.js.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WELCOME, GARDEN } from '../config'

const KEY = 'math_world_v1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))
const FAST = { pushDebounceMs: 5, bootReadTimeoutMs: 100, retryReadMs: 10 }

function fakeStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  }
}
function mockBackend(cloud = null) {
  let remote = cloud ? clone(cloud) : null
  return {
    kind: 'mock',
    get cloud() {
      return remote
    },
    async loadRemote() {
      return remote ? { state: clone(remote) } : null
    },
    async saveRemote(blob) {
      remote = clone(blob)
      return true
    },
  }
}

let storage
beforeEach(() => {
  vi.resetModules()
  storage = fakeStorage()
  globalThis.localStorage = storage
})
const load = async (seed) => {
  if (seed) storage.setItem(KEY, JSON.stringify(seed))
  return import('../store.js')
}
const saved = () => JSON.parse(storage.getItem(KEY))

/** A save from before the welcome gift shipped: no `welcomeGift`, no `starter`. */
const oldSave = (over = {}) => ({
  character: 'sorcerer',
  map: 'clearing',
  gems: 4,
  lifetimeGems: 4,
  capRetiredAt: '2026-07-18T00:00:00.000Z',
  world: [],
  owned: [],
  topicProgress: {},
  played: true,
  seenOnboarding: true,
  garden: { plot: { seed: null }, seeds: 1, seedsGranted: 0, harvests: 0 },
  ...over,
})

describe('who gets it', () => {
  it('a brand-new player: owed, 0 seeds, 0 gems', async () => {
    const store = await load()
    expect(store.welcomeGiftOwed()).toBe(true)
    expect(store.getGarden()).toMatchObject({ seeds: 0, starter: 0 })
    expect(store.getState().gems).toBe(0)
  })

  it('still owed after a reload (the fresh save is written on boot, then migrated)', async () => {
    await load()
    vi.resetModules()
    const store = await import('../store.js')
    expect(store.welcomeGiftOwed()).toBe(true)
    expect(store.getGarden()).toMatchObject({ seeds: 0, starter: 0 })
  })

  it('an old save (Ivy, Amy, a guest who played) is NOT owed and keeps its free seed', async () => {
    const store = await load(oldSave())
    expect(store.welcomeGiftOwed()).toBe(false)
    expect(store.getGarden()).toMatchObject({ seeds: 1, starter: 1 })
    expect(store.claimWelcomeGift()).toBe(null)
    expect(store.getState().gems).toBe(4)
  })

  it('a save from before the garden keeps its free seed too', async () => {
    const { garden: _g, ...noGarden } = oldSave()
    const store = await load(noGarden)
    expect(store.getGarden()).toMatchObject({ seeds: 1, starter: 1 })
  })
})

describe('the gift', () => {
  it('pays WELCOME.gems + 1 seed once, on the ledger too, and persists', async () => {
    const store = await load()
    expect(store.claimWelcomeGift()).toEqual({ gems: WELCOME.gems, seeds: 1 })
    expect(store.getState()).toMatchObject({ gems: 3, lifetimeGems: 3, welcomeGift: true })
    expect(store.getGarden()).toMatchObject({ seeds: 1, starter: 1 })
    expect(saved()).toMatchObject({ gems: 3, welcomeGift: true, garden: { seeds: 1, starter: 1 } })
  })

  it('never pays twice — a second call, or after a reload', async () => {
    const store = await load()
    store.claimWelcomeGift()
    expect(store.claimWelcomeGift()).toBe(null)
    expect(store.getState().gems).toBe(3)
    vi.resetModules()
    const again = await import('../store.js')
    expect(again.claimWelcomeGift()).toBe(null)
    expect(again.getState().gems).toBe(3)
  })

  it('the 20-gem seed still arrives after it (the gift seed is not a lifetime-gem grant)', async () => {
    const store = await load()
    store.claimWelcomeGift()
    store.addGems(GARDEN.seedEveryGems - WELCOME.gems) // lifetime → exactly 20
    expect(store.getGarden()).toMatchObject({ seeds: 2, starter: 1, seedsGranted: 1 })
  })

  it('her first seed can be planted', async () => {
    const store = await load()
    expect(store.plantSeed()).toBe(false) // nothing to plant before the gift
    store.claimWelcomeGift()
    expect(store.plantSeed()).toBe(true)
  })
})

describe('the conservation law with a starter of 0 or 1', () => {
  it('mergeGarden: 0 + 1 → 1, and seeds are re-derived from it', async () => {
    const { mergeGarden } = await import('../store.js')
    const g = (over) => ({ plot: { seed: null }, seeds: 0, starter: 0, seedsGranted: 0, harvests: 0, basket: {}, bag: { left: [], last: null }, ...over })
    expect(mergeGarden(g(), g())).toMatchObject({ seeds: 0, starter: 0 })
    expect(mergeGarden(g(), g({ seeds: 1, starter: 1 }))).toMatchObject({ seeds: 1, starter: 1 })
    expect(mergeGarden(g({ starter: 1, plot: { seed: { kind: 'pink', stage: 1 } } }), g())).toMatchObject({ seeds: 0, starter: 1 })
  })
})

describe('cloud: claimed on either copy = claimed', () => {
  it('claimed here, but an OWED cloud copy wins on the ledger → still claimed (the fold)', async () => {
    const store = await load()
    store.claimWelcomeGift() // local: claimed, lifetime 3
    const cloud = { ...saved(), welcomeGift: false, lifetimeGems: 5, gems: 5, garden: { plot: { seed: null }, seeds: 0, starter: 0, seedsGranted: 0, harvests: 0, basket: {}, bag: { left: [], last: null } } }
    await store.initStore(mockBackend(cloud), FAST)
    expect(store.getState().lifetimeGems).toBe(5) // the cloud copy won
    expect(store.welcomeGiftOwed()).toBe(false) // …but the gift stays claimed
    expect(store.getGarden()).toMatchObject({ starter: 1, seeds: 1 }) // and her seed is kept
  })

  it('a new guest who claimed it, then adopts an older account save, does not get it again', async () => {
    const store = await load()
    store.claimWelcomeGift()
    await store.initStore(mockBackend(oldSave({ lifetimeGems: 300, gems: 300 })), FAST)
    expect(store.welcomeGiftOwed()).toBe(false)
  })

  it('an owed local copy adopting a claimed cloud copy stays claimed', async () => {
    const store = await load()
    const cloud = { ...saved(), welcomeGift: true, lifetimeGems: 9, gems: 9, garden: { plot: { seed: null }, seeds: 1, starter: 1, seedsGranted: 0, harvests: 0, basket: {}, bag: { left: [], last: null } } }
    await store.initStore(mockBackend(cloud), FAST)
    await sleep(10)
    expect(store.welcomeGiftOwed()).toBe(false)
    expect(store.getGarden()).toMatchObject({ starter: 1 })
  })
})

describe('the lucky question pool', () => {
  it('addition only, no carrying, answers ≤ 20, never +0/+1', async () => {
    const { LUCKY_POOL } = await import('../math.js')
    expect(LUCKY_POOL.length).toBeGreaterThanOrEqual(10)
    for (const [a, b] of LUCKY_POOL) {
      expect(a + b).toBeLessThanOrEqual(20)
      expect((a % 10) + (b % 10)).toBeLessThan(10) // no carry
      expect(b).toBeGreaterThan(1)
    }
  })
  it('luckyProblem: a pool item, a DIFFERENT pool item as its worked example, not a topic id', async () => {
    const { LUCKY_POOL, luckyProblem, TOPICS } = await import('../math.js')
    const key = ([a, b]) => `${a}+${b}`
    const pool = new Set(LUCKY_POOL.map(key))
    for (let i = 0; i < 200; i++) {
      const p = luckyProblem()
      expect(p.op).toBe('+')
      expect(pool.has(key([p.a, p.b]))).toBe(true)
      expect(pool.has(key([p.similar.a, p.similar.b]))).toBe(true)
      expect(key([p.a, p.b])).not.toBe(key([p.similar.a, p.similar.b]))
      expect(TOPICS[p.type]).toBeUndefined()
    }
  })
})

describe('where the lucky station stands', () => {
  it('in front of where she enters, clear of gates + scenery, in bounds, past the open + re-arm distance', async () => {
    const { MAPS, luckySpot, blockers } = await import('../maps.js')
    const { WORLD, STATION } = await import('../config.js')
    for (const map of Object.values(MAPS)) {
      if (map.together) continue
      const spawns = [[0, 0], ...map.gates.map((g) => [g.position[0] * 0.85, g.position[2] * 0.85])]
      for (const sp of spawns) {
        const [x, z] = luckySpot(map, sp)
        expect(Math.abs(x)).toBeLessThanOrEqual(WORLD.bounds - 2)
        expect(Math.abs(z)).toBeLessThanOrEqual(WORLD.bounds - 2)
        expect(Math.hypot(x - sp[0], z - sp[1])).toBeGreaterThan(STATION.rearm)
        for (const g of map.gates) expect(Math.hypot(x - g.position[0], z - g.position[2])).toBeGreaterThanOrEqual(4)
        for (const [bx, bz, r] of blockers(map)) expect(Math.hypot(x - bx, z - bz)).toBeGreaterThanOrEqual(1.4 + r)
      }
    }
  })
  it('on open ground: beside her, a little up the screen, to the right', async () => {
    const { luckySpot } = await import('../maps.js')
    const open = { gates: [], decor: [] }
    expect(luckySpot(open, [0, 0])).toEqual([3.38, -1.23]) // 70° round from straight up
  })
})

describe('hints: the lucky station beats the garden, and the garden waits for a seed', () => {
  it('config', async () => {
    const { GAME_HINTS, LUCKY_HINT_ID, GARDEN_HINT_ID } = await import('../gameHints.js')
    expect(GAME_HINTS[0].id).toBe(LUCKY_HINT_ID)
    expect(GAME_HINTS[0].live).toBe(true) // ships while HINTS_ON is off
    const garden = GAME_HINTS.find((h) => h.id === GARDEN_HINT_ID)
    expect(garden.live).toBeFalsy()
    const town = { mapId: 'town', hasPlot: true }
    expect(garden.when({ ...town, seeds: 0, luckyHere: false })).toBe(false)
    expect(garden.when({ ...town, seeds: 1, luckyHere: true })).toBe(false)
    expect(garden.when({ ...town, seeds: 1, luckyHere: false })).toBe(true)
  })
})
