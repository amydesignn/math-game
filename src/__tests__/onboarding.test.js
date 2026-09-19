/*
 * First-run onboarding contract (Oscar's walkthrough → Nathan, 2026-09-19). The
 * store field `seenOnboarding` decides who sees the "How to Play" walkthrough on
 * first play: a brand-new player once, a returning player never. Literal
 * fixtures so that honesty can't quietly regress.
 *
 * Store singleton → fresh module per test via vi.resetModules() + in-memory
 * localStorage, exactly like door.test.js / store-boot.test.js.
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

describe('seenOnboarding — first-run walkthrough gate', () => {
  it('a brand-new save (no prior storage) starts false → the player sees it once', async () => {
    const store = await import('../store.js')
    expect(store.getState().seenOnboarding).toBe(false)
  })

  it('markOnboardingSeen flips false→true and persists', async () => {
    const store = await import('../store.js')
    expect(store.getState().seenOnboarding).toBe(false)
    store.markOnboardingSeen()
    expect(store.getState().seenOnboarding).toBe(true)
    expect(saved().seenOnboarding).toBe(true) // persisted, so it never auto-shows again
  })

  it('is idempotent — a second call is a no-op (no re-save)', async () => {
    const store = await import('../store.js')
    store.markOnboardingSeen() // false→true, persists
    const spy = vi.spyOn(globalThis.localStorage, 'setItem')
    store.markOnboardingSeen() // already seen → must not save() again
    expect(spy).not.toHaveBeenCalled()
    expect(store.getState().seenOnboarding).toBe(true)
  })
})

describe('migrate — a returning player is never re-onboarded', () => {
  it('a save from before the feature (no seenOnboarding field) seeds true', async () => {
    storage.setItem(
      KEY,
      JSON.stringify({ map: 'town', gems: 5, lifetimeGems: 120, played: true, capRetiredAt: '2026-07-18T00:00:00.000Z' }),
    )
    const store = await import('../store.js')
    expect(store.getState().seenOnboarding).toBe(true)
  })

  it('a new player who reloaded before dismissing keeps false (explicit false is respected)', async () => {
    storage.setItem(
      KEY,
      JSON.stringify({ map: 'clearing', gems: 0, lifetimeGems: 0, seenOnboarding: false, capRetiredAt: '2026-07-18T00:00:00.000Z' }),
    )
    const store = await import('../store.js')
    expect(store.getState().seenOnboarding).toBe(false)
  })
})
