/*
 * Grow a Garden — the data layer (ticket 3). The plot, held seeds, idempotent
 * grants, water + harvest, the migration for saves from before the garden
 * (Ivy's!), and the boot merge that must never lose a seed or a harvest.
 * Same harness as store-boot.test.js: a fresh store module per test, an
 * in-memory localStorage, and a scriptable mock backend.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GARDEN } from '../config'

const KEY = 'math_world_v1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))
const FAST = { pushDebounceMs: 5, bootReadTimeoutMs: 100, retryReadMs: 10 }

/** A save from BEFORE the garden existed — no `garden` field at all. */
const oldSave = (over = {}) => ({
  character: 'sorcerer',
  pet: 'animal-cat',
  map: 'town',
  gems: 480,
  lifetimeGems: 520,
  capRetiredAt: '2026-07-18T00:00:00.000Z',
  celebratedLevel: 11,
  levelUps: 10,
  soundOn: true,
  world: [],
  owned: [],
  nextId: 1,
  topicProgress: {},
  sparkle: null,
  stations: { window: null, byMap: {} },
  played: true,
  seenOnboarding: true,
  startedISO: '2026-07-01T00:00:00.000Z',
  lastActive: '2026-10-14T00:00:00.000Z',
  ...over,
})

// basket defaults to the harvests filed as starter blooms (the only kind before
// ticket 10); bag defaults to what migration derives: an empty bag whose `last`
// is the plot's kind, else 'starter' once anything was picked.
const garden = (over = {}) => ({
  plot: { seed: null },
  seeds: 1,
  seedsGranted: 0,
  harvests: 0,
  basket: over.harvests ? { starter: over.harvests } : {},
  bag: { left: [], last: over.plot?.seed?.kind ?? (over.harvests ? 'starter' : null) },
  ...over,
})

function mockBackend({ cloud = null } = {}) {
  let remote = cloud ? clone(cloud) : null
  const calls = { writes: [] }
  return {
    kind: 'mock',
    calls,
    get cloud() {
      return remote
    },
    async loadRemote() {
      return remote ? { state: clone(remote) } : null
    },
    async saveRemote(blob) {
      calls.writes.push(clone(blob))
      remote = clone(blob)
      return true
    },
  }
}

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

async function fresh(seed) {
  if (seed) storage.setItem(KEY, JSON.stringify(seed))
  return import('../store.js')
}
async function boot(mock) {
  const store = await import('../store.js')
  await store.initStore(mock, FAST)
  return store
}
const saved = () => JSON.parse(storage.getItem(KEY))

describe('config knobs', () => {
  it('ships the numbers from the spec (20 lifetime gems a seed, 3 × 5 💎 water)', () => {
    expect(GARDEN).toEqual({ seedEveryGems: 20, waterCost: 5, waterings: 3 })
  })
})

describe('seedsOwed (pure)', () => {
  it('one seed per seedEveryGems lifetime gems, minus those already granted', async () => {
    const { seedsOwed } = await import('../store.js')
    expect(seedsOwed(0, 0)).toBe(0)
    expect(seedsOwed(19, 0)).toBe(0)
    expect(seedsOwed(20, 0)).toBe(1)
    expect(seedsOwed(59, 0)).toBe(2)
    expect(seedsOwed(520, 0)).toBe(26)
    expect(seedsOwed(520, 26)).toBe(0) // idempotent: granted already
    expect(seedsOwed(540, 26)).toBe(1)
  })
  it('never negative, and reads the knob it is given', async () => {
    const { seedsOwed } = await import('../store.js')
    expect(seedsOwed(10, 5)).toBe(0)
    expect(seedsOwed(undefined, undefined)).toBe(0)
    expect(seedsOwed(30, 0, { seedEveryGems: 10 })).toBe(3)
  })
})

describe('the plot: plant → water ×3 → harvest', () => {
  it('a brand-new player starts with one starter seed and an empty plot', async () => {
    const store = await fresh()
    expect(store.getGarden()).toEqual(garden())
  })

  it('the whole loop, gems spent but level (lifetimeGems) untouched', async () => {
    const store = await fresh(oldSave({ gems: 20, lifetimeGems: 120 }))
    expect(store.plantSeed(() => 0)).toBe(true) // rand 0 → the first kind out of a full bag
    // 120 lifetime gems → 6 seeds owed and paid on load (ticket 4), + the starter, − the one planted
    expect(store.getGarden()).toMatchObject({ seeds: 6, plot: { seed: { kind: 'starter', stage: 0 } } })
    expect(store.harvest()).toBe(null) // not in bloom yet
    expect(store.waterPlot()).toBe(1)
    expect(store.waterPlot()).toBe(2)
    expect(store.waterPlot()).toBe(3) // bloom
    expect(store.getState().gems).toBe(20 - 3 * GARDEN.waterCost)
    expect(store.getState().lifetimeGems).toBe(120) // spending never lowers her level
    expect(store.waterPlot()).toBe(null) // already in bloom — no gem taken
    expect(store.getState().gems).toBe(5)
    expect(store.harvest()).toBe(1)
    expect(store.getGarden()).toMatchObject({ harvests: 1, plot: { seed: null } })
    expect(saved().garden).toEqual(store.getGarden()) // persisted
    expect(saved().lifetimeGems).toBe(120)
  })

  it('refusals: nothing planted, a second seed in a full plot, no seeds, too few gems', async () => {
    const store = await fresh(oldSave({ gems: 4 }))
    expect(store.waterPlot()).toBe(null) // nothing planted
    expect(store.getState().gems).toBe(4)
    expect(store.plantSeed()).toBe(true)
    expect(store.plantSeed()).toBe(false) // one plot, one seed
    expect(store.waterPlot()).toBe(null) // 4 < 5 — refused, nothing spent
    expect(store.getState().gems).toBe(4)
    expect(store.getGarden().plot.seed.stage).toBe(0)
  })

  it('with no seed held, plantSeed refuses', async () => {
    const store = await fresh(oldSave({ garden: garden({ seeds: 0, seedsGranted: 26, harvests: 27 }) }))
    expect(store.plantSeed()).toBe(false)
    expect(store.getGarden().plot.seed).toBe(null)
  })
})

describe('seed grants (ticket 4: every seedEveryGems lifetime gems)', () => {
  it('earning across a multiple of 20 hands over a seed; spending never does', async () => {
    const store = await fresh(oldSave({ gems: 18, lifetimeGems: 38, garden: garden({ seeds: 2, seedsGranted: 1 }) }))
    expect(store.getGarden().seeds).toBe(2)
    store.addGems(1) // 39
    expect(store.getGarden()).toMatchObject({ seeds: 2, seedsGranted: 1 })
    store.addGems(1) // 40 → the 2nd seed
    expect(store.getGarden()).toMatchObject({ seeds: 3, seedsGranted: 2 })
    store.addGems(-5) // a spend
    expect(store.getGarden()).toMatchObject({ seeds: 3, seedsGranted: 2 })
    store.addGems(45) // 85 → owed 4 in all, 2 more now
    expect(store.getGarden()).toMatchObject({ seeds: 5, seedsGranted: 4 })
    expect(saved().garden).toMatchObject({ seeds: 5, seedsGranted: 4 })
  })

  it('a paid-out save is never paid twice — reload grants nothing', async () => {
    await fresh(oldSave())
    expect(saved().garden).toMatchObject({ seeds: 27, seedsGranted: 26 })
    vi.resetModules()
    const again = await import('../store.js')
    expect(again.getGarden()).toMatchObject({ seeds: 27, seedsGranted: 26 })
  })
})

describe('migration (saves from before the garden — Ivy\'s)', () => {
  it('an old save with no garden fields gets the starter + EVERY seed it earned (Amy: pay them all), nothing else changes', async () => {
    const before = oldSave()
    const store = await fresh(before)
    const s = store.getState()
    expect(s.garden).toEqual(garden({ seeds: 27, seedsGranted: 26 })) // 520 lifetime / 20
    expect(s.gems).toBe(before.gems)
    expect(s.lifetimeGems).toBe(before.lifetimeGems)
    expect(s.celebratedLevel).toBe(before.celebratedLevel)
    expect(saved().garden).toEqual(garden({ seeds: 27, seedsGranted: 26 })) // the boot save writes it
  })

  it('an existing garden is kept as-is', async () => {
    const g = garden({ seeds: 25, seedsGranted: 26, harvests: 1, plot: { seed: { kind: 'starter', stage: 2 } } }) // nothing owed
    const store = await fresh(oldSave({ garden: g }))
    expect(store.getGarden()).toEqual(g)
  })

  it('a partial or edited garden is repaired field by field, never reset', async () => {
    const store = await fresh(oldSave({ garden: { harvests: 4, seeds: -2, plot: { seed: { stage: 9 } } } }))
    expect(store.getGarden()).toEqual({
      plot: { seed: { kind: 'starter', stage: GARDEN.waterings } }, // clamped to bloom
      seeds: 27, // bad count → default (1), then the 26 owed seeds paid
      seedsGranted: 26,
      harvests: 4, // kept
      basket: { starter: 4 }, // filed as starter blooms
      bag: { left: [], last: 'starter' }, // no bag yet → its last seed was the plot's
    })
  })
})

describe('mergeGarden (pure)', () => {
  it('never loses a harvest, a grant, or a growing plant; seeds re-derived', async () => {
    const { mergeGarden } = await import('../store.js')
    const a = garden({ seedsGranted: 2, seeds: 2, harvests: 1 }) // 1 + 2 = 2 held + 1 harvested
    const b = garden({ seedsGranted: 1, seeds: 0, harvests: 0, plot: { seed: { kind: 'starter', stage: 2 } } })
    // a is ahead on harvests → a's (empty) plot; seeds from the law: 1 + 2 − 1 − 0
    expect(mergeGarden(a, b)).toEqual(garden({ seedsGranted: 2, seeds: 2, harvests: 1 }))
    expect(mergeGarden(b, a)).toEqual(mergeGarden(a, b)) // order doesn't matter
  })
  it('tie on harvests → the further-grown plot wins', async () => {
    const { mergeGarden } = await import('../store.js')
    const empty = garden()
    const growing = garden({ seeds: 0, plot: { seed: { kind: 'starter', stage: 1 } } })
    expect(mergeGarden(empty, growing)).toEqual(growing)
    expect(mergeGarden(growing, empty)).toEqual(growing)
  })
})

describe('boot merge with the cloud (the ledger still picks the winner)', () => {
  it('cloud wins on the ledger, but a plant only this device grew is kept — and pushed up', async () => {
    // This iPad watered twice (gems spent, ledger unchanged); the cloud is ahead on the ledger.
    storage.setItem(
      KEY,
      JSON.stringify(oldSave({ gems: 10, lifetimeGems: 100, garden: garden({ seeds: 0, plot: { seed: { kind: 'starter', stage: 2 } } }) })),
    )
    const mock = mockBackend({ cloud: oldSave({ gems: 30, lifetimeGems: 110 }) })
    const store = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(110) // the winner's ledger
    expect(store.getState().gems).toBe(30)
    // both copies were owed 5 seeds (100 and 110 lifetime) → granted 5; the law: 1 + 5 − 1 planted
    expect(store.getGarden()).toEqual(garden({ seeds: 5, seedsGranted: 5, plot: { seed: { kind: 'starter', stage: 2 } } }))
    expect(saved().garden.plot.seed.stage).toBe(2)
    await sleep(25)
    expect(mock.calls.writes.length).toBe(1) // the cloud lacked the plant
    expect(mock.cloud.garden.plot.seed.stage).toBe(2)
    expect(mock.cloud.lifetimeGems).toBe(110)
  })

  it('local wins on the ledger, but a harvest only the cloud has is kept', async () => {
    storage.setItem(KEY, JSON.stringify(oldSave({ lifetimeGems: 200 })))
    const mock = mockBackend({ cloud: oldSave({ lifetimeGems: 150, garden: garden({ seeds: 0, harvests: 1 }) }) })
    const store = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(200)
    expect(store.getGarden()).toEqual(garden({ seeds: 10, seedsGranted: 10, harvests: 1 })) // 200 / 20 granted
    await sleep(25)
    expect(mock.cloud.garden.harvests).toBe(1)
    expect(mock.cloud.lifetimeGems).toBe(200)
  })

  it('cloud wins and the gardens agree → no push (fixture 4 unchanged)', async () => {
    storage.setItem(KEY, JSON.stringify(oldSave({ lifetimeGems: 100 })))
    const mock = mockBackend({ cloud: oldSave({ lifetimeGems: 110 }) })
    const store = await boot(mock)
    expect(store.getGarden()).toEqual(garden({ seeds: 6, seedsGranted: 5 }))
    await sleep(25)
    expect(mock.calls.writes.length).toBe(0)
  })

  it('a pre-garden cloud save adopted on a fresh device gets the starter garden', async () => {
    const mock = mockBackend({ cloud: oldSave() })
    const store = await boot(mock)
    expect(store.getGarden()).toEqual(garden({ seeds: 27, seedsGranted: 26 }))
    expect(store.getState().lifetimeGems).toBe(520)
    await sleep(25)
    expect(mock.calls.writes.length).toBe(0)
  })
})

// Ticket 8: harvests are counted and KEPT. `garden.harvests` (ticket 3) is the
// one counter — no second field. Like the ledger, it can only ever go up.
describe('harvests: counted and kept (ticket 8)', () => {
  const bloom = { kind: 'starter', stage: GARDEN.waterings }

  it('each pick adds one, and the count survives a reload', async () => {
    const store = await fresh(oldSave({ garden: garden({ seeds: 24, seedsGranted: 26, harvests: 2, plot: { seed: bloom } }) }))
    expect(store.harvest()).toBe(3)
    expect(saved().garden.harvests).toBe(3)
    vi.resetModules()
    const again = await import('../store.js')
    expect(again.getGarden().harvests).toBe(3)
  })

  it('cloud wins on the ledger but holds FEWER harvests → hers are kept and pushed up', async () => {
    // This iPad picked 3 blooms (gems spent on water, ledger unchanged); the cloud is ahead on the ledger.
    storage.setItem(KEY, JSON.stringify(oldSave({ lifetimeGems: 100, garden: garden({ seeds: 2, seedsGranted: 5, harvests: 3 }) })))
    const mock = mockBackend({ cloud: oldSave({ lifetimeGems: 110, garden: garden({ seeds: 5, seedsGranted: 5, harvests: 1 }) }) })
    const store = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(110)
    expect(store.getGarden().harvests).toBe(3)
    await sleep(25)
    expect(mock.cloud.garden.harvests).toBe(3)
  })

  it('mergeGarden never lowers the count, whatever the two copies hold', async () => {
    const { mergeGarden } = await import('../store.js')
    const plots = [null, { kind: 'starter', stage: 0 }, bloom]
    for (const ha of [0, 1, 7]) for (const hb of [0, 2, 7]) for (const pa of plots) for (const pb of plots) {
      const a = garden({ harvests: ha, seedsGranted: 9, plot: { seed: pa } })
      const b = garden({ harvests: hb, seedsGranted: 9, plot: { seed: pb } })
      const m = mergeGarden(a, b)
      expect(m.harvests).toBe(Math.max(ha, hb))
      expect(mergeGarden(m, a).harvests).toBe(m.harvests) // merging again is a no-op
    }
  })
})

describe('the basket: harvests by kind (ticket 8)', () => {
  it('a pick files the bloom under its seed kind, and the breakdown adds up to the total', async () => {
    const store = await fresh(oldSave({ garden: garden({ seeds: 25, seedsGranted: 26, plot: { seed: { kind: 'starter', stage: GARDEN.waterings } } }) }))
    store.harvest()
    expect(store.getGarden()).toMatchObject({ harvests: 1, basket: { starter: 1 } })
    expect(saved().garden.basket).toEqual({ starter: 1 })
  })

  it('a save from before the basket files its old harvests as starter blooms', async () => {
    const store = await fresh(oldSave({ garden: { plot: { seed: null }, seeds: 22, seedsGranted: 26, harvests: 5 } }))
    expect(store.getGarden()).toMatchObject({ harvests: 5, basket: { starter: 5 } })
  })

  it('bad basket entries are dropped; the total is never below the basket', async () => {
    const store = await fresh(oldSave({ garden: garden({ seeds: 22, seedsGranted: 26, harvests: 1, basket: { starter: 2, rose: 2, bad: -1, worse: 'x' } }) }))
    expect(store.getGarden()).toMatchObject({ harvests: 4, basket: { starter: 2, rose: 2 } })
  })

  it('merge keeps the higher count per kind, and a kind only one copy has', async () => {
    const { mergeGarden } = await import('../store.js')
    const a = garden({ seedsGranted: 9, harvests: 3, basket: { starter: 3 } })
    const b = garden({ seedsGranted: 9, harvests: 3, basket: { starter: 1, rose: 2 } })
    const m = mergeGarden(a, b)
    expect(m.basket).toEqual({ starter: 3, rose: 2 })
    expect(m.harvests).toBe(5)
    expect(mergeGarden(b, a)).toEqual(m)
  })
})
