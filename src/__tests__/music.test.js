/*
 * The Settings music picker (2026-10-04): Island is the default for everyone,
 * Soft Focus stays one tap away, and a bad id can never leave a
 * save without music.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MUSIC_TRACKS, DEFAULT_MUSIC } from '../config'

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

const oldSave = (over = {}) => ({ pet: 'animal-cat', gems: 3, lifetimeGems: 3, capRetiredAt: '2026-07-18T00:00:00.000Z', soundOn: true, ...over })
const saved = () => JSON.parse(storage.getItem(KEY)).musicTrack

describe('music picker', () => {
  it('ships exactly the two tracks, Island first and default', () => {
    expect(MUSIC_TRACKS.map((t) => t.id)).toEqual(['island', 'soft-focus'])
    expect(DEFAULT_MUSIC).toBe('island')
  })

  it('a brand-new player gets Island', async () => {
    const store = await import('../store.js')
    expect(store.getState().musicTrack).toBe('island')
  })

  it('a save pointing at the retired July track gets Island', async () => {
    storage.setItem(KEY, JSON.stringify(oldSave({ musicTrack: 'classic' })))
    const store = await import('../store.js')
    expect(store.getState().musicTrack).toBe('island')
  })

  it('a save from before the picker gets Island (the new default)', async () => {
    storage.setItem(KEY, JSON.stringify(oldSave()))
    const store = await import('../store.js')
    expect(store.getState().musicTrack).toBe('island')
    expect(saved()).toBe('island')
  })

  it('a save that chose Soft Focus keeps it', async () => {
    storage.setItem(KEY, JSON.stringify(oldSave({ musicTrack: 'soft-focus' })))
    const store = await import('../store.js')
    expect(store.getState().musicTrack).toBe('soft-focus')
  })

  it('an unknown track id falls back to Island', async () => {
    storage.setItem(KEY, JSON.stringify(oldSave({ musicTrack: 'retired-track' })))
    const store = await import('../store.js')
    expect(store.getState().musicTrack).toBe('island')
  })

  it('setMusicTrack persists a real choice and ignores junk', async () => {
    const store = await import('../store.js')
    store.setMusicTrack('soft-focus')
    expect(saved()).toBe('soft-focus')
    store.setMusicTrack('nope')
    expect(store.getState().musicTrack).toBe('soft-focus')
  })
})
