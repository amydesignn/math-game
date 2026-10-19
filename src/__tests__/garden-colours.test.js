/*
 * Grow a Garden ticket 10 — seed colours rotate (Finn's shuffle bag).
 * The pure bag (gardenBag.js): no repeats inside a bag, never the same kind
 * twice in a row (across a refill too), every kind eventually, not a fixed
 * order. Then the store: the kind is drawn at PLANT time, the bag survives a
 * reload, old saves migrate safely, the merge carries the bag with its plot,
 * and every harvest is still +1 in the basket total, filed under its colour.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { drawKind, normalizeBag } from '../gardenBag'
import { GARDEN, SEED_KINDS } from '../config'

const KINDS = ['red', 'pink', 'yellow', 'purple']

/** A small seeded PRNG (mulberry32) so "random" runs are reproducible. */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Draw n kinds in a row from an empty bag. */
function run(n, rand, kinds = KINDS, bag = { left: [], last: null }) {
  const out = []
  for (let i = 0; i < n; i++) {
    const r = drawKind(bag, kinds, rand)
    out.push(r.kind)
    bag = r.bag
  }
  return { out, bag }
}

describe('drawKind — the shuffle bag (pure)', () => {
  it('each bag deals every kind exactly once before it refills', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { out } = run(KINDS.length * 6, rng(seed))
      for (let b = 0; b < 6; b++) {
        const round = out.slice(b * KINDS.length, (b + 1) * KINDS.length)
        expect([...round].sort()).toEqual([...KINDS].sort())
      }
    }
  })

  it('never the same kind twice in a row — including across a refill', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { out } = run(60, rng(seed))
      for (let i = 1; i < out.length; i++) expect(out[i]).not.toBe(out[i - 1])
    }
  })

  it('a rand that would re-pick the kind just drawn at the refill still cannot', () => {
    // degenerate rands (always the first / last / middle slot) are where a naive
    // refill would deal the kind just drawn straight back
    for (const r of [() => 0, () => 0.999999, () => 0.5]) {
      const { out } = run(40, r)
      for (let i = 1; i < out.length; i++) expect(out[i]).not.toBe(out[i - 1])
    }
    // and the boundary case directly: a bag holding nothing but the last kind refills
    const r = drawKind({ left: ['red'], last: 'red' }, KINDS, () => 0)
    expect(r.kind).not.toBe('red')
    expect(r.bag.left).toHaveLength(KINDS.length - 1) // a fresh bag, minus the one drawn
  })

  it('every kind appears — and not in one fixed order she could learn', () => {
    const orders = new Set()
    for (let seed = 1; seed <= 40; seed++) {
      const { out } = run(KINDS.length, rng(seed))
      expect(new Set(out).size).toBe(KINDS.length)
      orders.add(out.join(','))
    }
    expect(orders.size).toBeGreaterThan(5) // many different shuffles
  })

  it('pure: the bag passed in is never mutated; the returned bag tracks left + last', () => {
    const bag = { left: ['pink', 'yellow'], last: 'red' }
    const r = drawKind(bag, KINDS, () => 0)
    expect(bag).toEqual({ left: ['pink', 'yellow'], last: 'red' })
    expect(r).toEqual({ kind: 'pink', bag: { left: ['yellow'], last: 'pink' } })
  })

  it('unknown or duplicate ids in an old bag are ignored', () => {
    const r = drawKind({ left: ['rose', 'pink', 'pink'], last: 'gone' }, KINDS, () => 0)
    expect(r).toEqual({ kind: 'pink', bag: { left: [], last: 'pink' } })
  })

  it('one kind only → it is dealt every time (a repeat cannot be avoided)', () => {
    expect(run(3, rng(1), ['red']).out).toEqual(['red', 'red', 'red'])
  })

  it('normalizeBag: known kinds only, no repeats, never the last kind; no bag → fallback last', () => {
    expect(normalizeBag({ left: ['pink', 'pink', 'rose', 'red', 3], last: 'red' }, KINDS)).toEqual({ left: ['pink'], last: 'red' })
    expect(normalizeBag(undefined, KINDS, 'red')).toEqual({ left: [], last: 'red' })
    expect(normalizeBag(null, KINDS, 'nope')).toEqual({ left: [], last: null })
    expect(normalizeBag({ left: 'x', last: 7 }, KINDS)).toEqual({ left: [], last: null })
  })
})

describe('SEED_KINDS — the colours on offer', () => {
  const kinds = Object.entries(SEED_KINDS)
  it('4–6 kinds; starter is still the red one (old saves hold it)', () => {
    expect(kinds.length).toBeGreaterThanOrEqual(4)
    expect(kinds.length).toBeLessThanOrEqual(6)
    expect(SEED_KINDS.starter.name).toBe('Red flowers')
  })
  it('each has a name, an emoji, a colormap swatch and a bud colour — all different', () => {
    for (const [, k] of kinds) {
      expect(k.name).toMatch(/flowers$/)
      expect(k.emoji).toBeTruthy()
      expect(k.petal.col).toBeGreaterThanOrEqual(0)
      expect(k.petal.col).toBeLessThan(16)
      expect([0, 1, 2]).toContain(k.petal.row)
      expect(k.bud).toMatch(/^#[0-9a-f]{6}$/)
    }
    const uniq = (f) => new Set(kinds.map(([, k]) => f(k))).size
    expect(uniq((k) => k.name)).toBe(kinds.length)
    expect(uniq((k) => k.emoji)).toBe(kinds.length)
    expect(uniq((k) => `${k.petal.col},${k.petal.row}`)).toBe(kinds.length)
    expect(uniq((k) => k.bud)).toBe(kinds.length)
  })
})

// ── the store ──────────────────────────────────────────────────────────────
const KEY = 'math_world_v1'
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
const saved = () => JSON.parse(storage.getItem(KEY))
let storage
beforeEach(() => {
  vi.resetModules()
  const m = new Map()
  storage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }
  globalThis.localStorage = storage
})
async function fresh(seed) {
  if (seed) storage.setItem(KEY, JSON.stringify(seed))
  return import('../store.js')
}

/** plant → water ×3 → harvest; returns the kind that grew. */
function cycle(store, rand) {
  expect(store.plantSeed(rand)).toBe(true)
  const kind = store.getGarden().plot.seed.kind
  for (let i = 0; i < GARDEN.waterings; i++) store.waterPlot()
  expect(store.harvest()).not.toBe(null)
  return kind
}

describe('the store deals colours at plant time (ticket 10)', () => {
  it('a run of plant → water → harvest cycles: colours rotate, every pick is +1, each colour its own basket line', async () => {
    const store = await fresh(oldSave({ gems: 1000 }))
    const n = Object.keys(SEED_KINDS).length
    const rand = rng(7)
    const grown = []
    for (let i = 0; i < n * 3; i++) grown.push(cycle(store, rand))
    for (let i = 1; i < grown.length; i++) expect(grown[i]).not.toBe(grown[i - 1])
    for (let b = 0; b < 3; b++) expect(new Set(grown.slice(b * n, (b + 1) * n)).size).toBe(n)
    const g = store.getGarden()
    expect(g.harvests).toBe(n * 3) // colour is visual only: one unit per harvest
    for (const k of Object.keys(SEED_KINDS)) expect(g.basket[k]).toBe(3)
  })

  it('the colour is fixed the moment the seed goes in — a reload mid-grow keeps it, and the bag carries on', async () => {
    const store = await fresh(oldSave())
    store.plantSeed(() => 0.6)
    const kind = store.getGarden().plot.seed.kind
    const bag = store.getGarden().bag
    expect(bag.last).toBe(kind)
    expect(saved().garden.bag).toEqual(bag)
    vi.resetModules()
    const again = await import('../store.js')
    expect(again.getGarden().plot.seed.kind).toBe(kind)
    expect(again.getGarden().bag).toEqual(bag)
    for (let i = 0; i < GARDEN.waterings; i++) again.waterPlot()
    again.harvest()
    again.plantSeed(() => 0)
    expect(again.getGarden().plot.seed.kind).not.toBe(kind)
    expect(bag.left).toContain(again.getGarden().plot.seed.kind) // dealt from the same bag
  })

  it("Ivy's save (before ticket 10): her red bloom stays red, and the next seed isn't red again", async () => {
    // growing a starter, no bag
    const s1 = await fresh(oldSave({ garden: { plot: { seed: { kind: 'starter', stage: 2 } }, seeds: 22, seedsGranted: 26, harvests: 3 } }))
    expect(s1.getGarden().plot.seed.kind).toBe('starter')
    expect(s1.getGarden().bag).toEqual({ left: [], last: 'starter' })
    // an empty plot after picking starters: rand 0 would pick 'starter' first from a full bag — it mustn't
    vi.resetModules()
    storage.clear()
    const s2 = await fresh(oldSave({ garden: { plot: { seed: null }, seeds: 23, seedsGranted: 26, harvests: 3, basket: { starter: 3 } } }))
    s2.plantSeed(() => 0)
    expect(s2.getGarden().plot.seed.kind).not.toBe('starter')
    expect(s2.getGarden().basket).toEqual({ starter: 3 }) // old harvests untouched
  })

  it('a brand-new player: an empty bag, and their first seed can be any colour', async () => {
    const store = await fresh()
    expect(store.getGarden().bag).toEqual({ left: [], last: null })
    store.claimWelcomeGift() // a new player's first seed is the welcome gift
    store.plantSeed(() => 0)
    expect(store.getGarden().plot.seed.kind).toBe(Object.keys(SEED_KINDS)[0])
  })

  it('a seed kind that no longer exists still blooms and is counted (never lost)', async () => {
    const store = await fresh(oldSave({ garden: { plot: { seed: { kind: 'retired', stage: GARDEN.waterings } }, seeds: 25, seedsGranted: 26, harvests: 0, bag: { left: ['retired', 'pink'], last: 'retired' } } }))
    expect(store.getGarden().bag).toEqual({ left: ['pink'], last: 'retired' })
    expect(store.harvest()).toBe(1)
    expect(store.getGarden().basket).toEqual({ retired: 1 })
  })

  it('mergeGarden: the bag travels with the plot that wins', async () => {
    const { mergeGarden } = await import('../store.js')
    const base = { seeds: 0, seedsGranted: 9, basket: {} }
    const a = { ...base, harvests: 2, basket: { pink: 2 }, plot: { seed: null }, bag: { left: ['yellow'], last: 'pink' } }
    const b = { ...base, harvests: 1, basket: { pink: 1 }, plot: { seed: { kind: 'purple', stage: 1 } }, bag: { left: [], last: 'purple' } }
    expect(mergeGarden(a, b).bag).toEqual(a.bag) // ahead on harvests → a's plot + bag
    expect(mergeGarden(b, a).bag).toEqual(a.bag)
    const m = mergeGarden(a, b)
    m.bag.left.push('x')
    expect(a.bag.left).toEqual(['yellow']) // a copy, not shared
  })
})
