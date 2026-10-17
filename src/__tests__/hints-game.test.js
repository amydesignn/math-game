/*
 * In-game hints — Luxi's side: the garden hint config (gameHints.js), the
 * device memory + session boot in store.js, and the dev/prod flag.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GAME_HINTS, GARDEN_HINT_ID, hintCtx, everPlanted } from '../gameHints'
import { HINT_COPY } from '../gameHintsCopy'
import { hintsEnabled, hintArrowVariant } from '../config'
import { createHintController, beginSession } from '../hints/engine.js'

const hint = GAME_HINTS.find((h) => h.id === GARDEN_HINT_ID)
const g = (over = {}) => ({ plot: { seed: null }, seeds: 1, seedsGranted: 0, harvests: 0, basket: {}, ...over })
const ctx = (over = {}, garden = g()) => hintCtx({ mapId: 'town', hasPlot: true, garden, calm: true, gardenOpen: false, ...over })

describe('everPlanted — derived from garden state', () => {
  it('fresh save: never planted', () => expect(everPlanted(g())).toBe(false))
  it('a growing plot = planted', () => expect(everPlanted(g({ plot: { seed: { kind: 'pink', stage: 1 } }, seeds: 0 }))).toBe(true))
  it('harvested before (empty plot now) = planted', () => expect(everPlanted(g({ harvests: 3, seeds: 2 }))).toBe(true))
  it('Ivy-shaped pre-garden save: many seeds, never planted → still a newcomer', () =>
    expect(everPlanted(g({ seeds: 27, seedsGranted: 26 }))).toBe(false))
  it('no garden at all → false', () => expect(everPlanted(undefined)).toBe(false))
})

describe('the garden hint entry', () => {
  it('only in Sunny Town, only where the plot is', () => {
    expect(hint.when(ctx())).toBe(true)
    expect(hint.when(ctx({ mapId: 'clearing' }))).toBe(false)
    expect(hint.when(ctx({ hasPlot: false }))).toBe(false)
  })
  it('points at the bed (a world target)', () => expect(hint.target).toEqual({ world: 'garden-bed' }))
  it('says the true line; arrow-only at the bed', () => {
    expect(hint.say(ctx())).toBe(HINT_COPY.garden.plant)
    expect(hint.say(ctx({}, g({ seeds: 0 })))).toBe(HINT_COPY.garden.noSeed)
    expect(hint.say(ctx({ gardenOpen: true }))).toBe('')
  })
  it('retires on the first plant; old savers who planted never see it', () => {
    expect(hint.retire(ctx())).toBe(false)
    expect(hint.retire(ctx({}, g({ harvests: 1 })))).toBe(true)
    expect(hint.retire(ctx({}, g({ plot: { seed: { kind: 'starter', stage: 0 } }, seeds: 0 })))).toBe(true)
  })
  it('every line obeys the copy rule (≤ 8 words)', () => {
    for (const s of [HINT_COPY.garden.plant, HINT_COPY.garden.noSeed]) expect(s.trim().split(/\s+/).length).toBeLessThanOrEqual(8)
  })
  it('end to end through the engine: arrives after its calm delay, done on plant', () => {
    let t = 0
    let mem = beginSession({})
    const done = []
    const c = createHintController({ hints: GAME_HINTS, memory: { load: () => mem, save: (m) => (mem = m) }, onDone: (h, r) => done.push(r), now: () => t, tickMs: false })
    c.update(ctx())
    t += hint.delayMs
    c.update(ctx())
    expect(c.view.hint).toMatchObject({ id: GARDEN_HINT_ID, text: HINT_COPY.garden.plant })
    c.update(ctx({ gardenOpen: true })) // walks up, bar opens: arrow stays, toast goes
    expect(c.view.hint.text).toBe('')
    c.update(ctx({ gardenOpen: true }, g({ plot: { seed: { kind: 'pink', stage: 0 } }, seeds: 0 })))
    expect(done).toEqual(['done'])
    c.destroy()
  })
})

describe('flag: ON in dev, OFF in prod, ?hints overrides', () => {
  it('dev on, prod off', () => {
    expect(hintsEnabled(true, '')).toBe(true)
    expect(hintsEnabled(false, '')).toBe(false)
  })
  it('?hints turns it on in prod; ?hints=0 turns it off in dev', () => {
    expect(hintsEnabled(false, '?hints')).toBe(true)
    expect(hintsEnabled(false, '?x=1&hints=1')).toBe(true)
    expect(hintsEnabled(true, '?hints=0')).toBe(false)
    expect(hintsEnabled(true, '?hints=off')).toBe(false)
  })
})

describe('store: device memory + one session per boot', () => {
  let storage
  beforeEach(() => {
    vi.resetModules()
    const m = new Map()
    storage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }
    globalThis.localStorage = storage
  })
  it('a boot counts ONE session even if begun twice (StrictMode)', async () => {
    const store = await import('../store')
    store.beginHintSession(beginSession)
    store.beginHintSession(beginSession)
    expect(store.getHintMemory().session).toBe(1)
    expect(JSON.parse(storage.getItem('luxi.hints')).session).toBe(1)
  })
  it('the next page load is the next session; memory lives outside the game save', async () => {
    let store = await import('../store')
    store.beginHintSession(beginSession)
    vi.resetModules()
    store = await import('../store')
    store.beginHintSession(beginSession)
    expect(store.getHintMemory().session).toBe(2)
    expect(JSON.stringify(store.getState())).not.toContain('lastNudgeSession') // never in a cloud push
  })
  it('broken storage never throws', async () => {
    globalThis.localStorage = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('full') } }
    const store = await import('../store')
    expect(() => store.beginHintSession(beginSession)).not.toThrow()
    expect(store.getHintMemory().session).toBe(1)
  })
})

describe('arrow look switch (?arrow=green, Amy review 1)', () => {
  it('defaults to iris; green only when asked; junk falls back', () => {
    expect(hintArrowVariant('')).toBe('iris')
    expect(hintArrowVariant('?arrow=green')).toBe('green')
    expect(hintArrowVariant('?hints&arrow=green')).toBe('green')
    expect(hintArrowVariant('?arrow=<script>')).toBe('iris')
  })
})
