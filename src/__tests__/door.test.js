/*
 * The Math Door hub contract (Oscar → Nathan, 2026-07-31). The two store fields
 * the Door adds — `played` (the New→Guest line) and `pos` (Resume's saved spot)
 * — plus resumePoint's gate-nudge, as literal fixtures so the hub's honesty
 * (no false Resume, no drop-onto-a-gate) can't quietly regress.
 *
 * Store singleton → fresh module per test via vi.resetModules() + in-memory
 * localStorage, exactly like store-boot.test.js.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resumePoint, MAPS } from '../maps'

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

describe('resumePoint — Resume drops her where she left, clear of any gate', () => {
  it('no saved spot yet → the centre', () => {
    expect(resumePoint(MAPS.clearing, null)).toEqual([0, 0])
  })

  it('an open spot is returned unchanged', () => {
    expect(resumePoint(MAPS.clearing, { x: 6, z: -5 })).toEqual([6, -5])
  })

  it('a spot on top of a gate is eased inward, clear of the 1.7 trigger', () => {
    // clearing's east gate sits at x:16; standing right on it would instantly
    // travel out on Resume. The nudge must pull her clear of every gate.
    const gate = MAPS.clearing.gates[0].position // [16, 0, 2]
    const [x, z] = resumePoint(MAPS.clearing, { x: gate[0], z: gate[2] })
    for (const g of MAPS.clearing.gates) {
      expect(Math.hypot(x - g.position[0], z - g.position[2])).toBeGreaterThan(1.7)
    }
  })
})

describe('markPlayed — the New→Guest signal', () => {
  it('a fresh save is New (played:false) until she enters a world', async () => {
    const store = await import('../store.js')
    expect(store.getState().played).toBe(false)
    store.markPlayed()
    expect(store.getState().played).toBe(true)
    expect(saved().played).toBe(true) // persisted
  })

  it('is idempotent — a second call is a no-op (no re-save)', async () => {
    const store = await import('../store.js')
    store.markPlayed() // flips false→true, persists
    const spy = vi.spyOn(globalThis.localStorage, 'setItem')
    store.markPlayed() // already played → must not save() again
    expect(spy).not.toHaveBeenCalled()
    expect(store.getState().played).toBe(true)
  })
})

describe('setPos — the saved spot rounds and persists', () => {
  it('rounds to 2dp and stores { x, z }', async () => {
    const store = await import('../store.js')
    store.setPos(8.12345, -8.6789)
    expect(store.getState().pos).toEqual({ x: 8.12, z: -8.68 })
    expect(saved().pos).toEqual({ x: 8.12, z: -8.68 })
  })
})

describe('migrate — an existing save reads as Guest, not New', () => {
  it('seeds played:true from lifetimeGems on a pre-`played` save', async () => {
    storage.setItem(
      KEY,
      JSON.stringify({ map: 'town', gems: 5, lifetimeGems: 120, capRetiredAt: '2026-07-18T00:00:00.000Z' }),
    )
    const store = await import('../store.js')
    expect(store.getState().played).toBe(true)
  })

  it('seeds played:true from owned/placed things even at zero earnings', async () => {
    storage.setItem(
      KEY,
      JSON.stringify({
        map: 'clearing',
        gems: 0,
        lifetimeGems: 0,
        world: [{ id: 1, asset: 'tree', pack: 'forest', x: 2, z: 2, rot: 0 }],
        capRetiredAt: '2026-07-18T00:00:00.000Z',
      }),
    )
    const store = await import('../store.js')
    expect(store.getState().played).toBe(true)
  })

  it('a truly empty save stays New (played:false)', async () => {
    storage.setItem(
      KEY,
      JSON.stringify({ map: 'clearing', gems: 0, lifetimeGems: 0, capRetiredAt: '2026-07-18T00:00:00.000Z' }),
    )
    const store = await import('../store.js')
    expect(store.getState().played).toBe(false)
  })
})
