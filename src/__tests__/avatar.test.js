/*
 * The on-device profile photo (Amy 2026-09-20). Two halves:
 *   1. avatar.js — the input guard that keeps non-images out. (The decode+canvas
 *      path needs a real DOM, so it's verified live in the pane, not here.)
 *   2. store.js — setAvatar / clearAvatar / the migrate default, the same way
 *      the photo actually persists on the device. It is NEVER uploaded, so the
 *      whole contract is: it lives in localStorage and nowhere else.
 *
 * Store singleton → fresh module per test via vi.resetModules() + in-memory
 * localStorage, exactly like door.test.js / store-boot.test.js.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isImageFile, fileToAvatar } from '../avatar.js'

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

describe('avatar.js — isImageFile keeps non-photos out before any decoding', () => {
  it('accepts an image File', () => {
    expect(isImageFile({ type: 'image/jpeg' })).toBe(true)
    expect(isImageFile({ type: 'image/png' })).toBe(true)
  })

  it('rejects non-images, null, and a typeless blob', () => {
    expect(isImageFile({ type: 'application/pdf' })).toBe(false)
    expect(isImageFile({ type: 'text/plain' })).toBe(false)
    expect(isImageFile(null)).toBe(false)
    expect(isImageFile({})).toBe(false)
  })

  it('fileToAvatar rejects a non-image before it ever touches a canvas', async () => {
    await expect(fileToAvatar({ type: 'application/pdf' })).rejects.toThrow('not-an-image')
    await expect(fileToAvatar(null)).rejects.toThrow('not-an-image')
  })
})

describe('store — the photo persists on the device and nowhere else', () => {
  it('a fresh save has no avatar', async () => {
    const store = await import('../store.js')
    expect(store.getState().avatar).toBe(null)
  })

  it('setAvatar stores the data URL and persists it to localStorage', async () => {
    const store = await import('../store.js')
    const url = 'data:image/jpeg;base64,abc123'
    store.setAvatar(url)
    expect(store.getState().avatar).toBe(url)
    expect(saved().avatar).toBe(url) // it lives in localStorage — never uploaded
  })

  it('setAvatar with a non-string clears (defensive against a bad value)', async () => {
    const store = await import('../store.js')
    store.setAvatar('data:image/jpeg;base64,abc')
    store.setAvatar(undefined)
    expect(store.getState().avatar).toBe(null)
  })

  it('clearAvatar removes the photo and persists the removal', async () => {
    const store = await import('../store.js')
    store.setAvatar('data:image/jpeg;base64,abc')
    store.clearAvatar()
    expect(store.getState().avatar).toBe(null)
    expect(saved().avatar).toBe(null)
  })

  it('clearAvatar is a no-op when there is no photo (no needless save)', async () => {
    const store = await import('../store.js')
    const spy = vi.spyOn(globalThis.localStorage, 'setItem')
    store.clearAvatar()
    expect(spy).not.toHaveBeenCalled()
    expect(store.getState().avatar).toBe(null)
  })
})

describe('migrate — an existing save gains avatar:null, and keeps a set photo', () => {
  it('a pre-avatar save reads as null, not undefined', async () => {
    storage.setItem(KEY, JSON.stringify({ map: 'town', gems: 5, lifetimeGems: 120, capRetiredAt: '2026-07-18T00:00:00.000Z' }))
    const store = await import('../store.js')
    expect(store.getState().avatar).toBe(null)
  })

  it('a save that already has a photo keeps it through migrate', async () => {
    const url = 'data:image/jpeg;base64,kept'
    storage.setItem(KEY, JSON.stringify({ map: 'town', avatar: url, capRetiredAt: '2026-07-18T00:00:00.000Z' }))
    const store = await import('../store.js')
    expect(store.getState().avatar).toBe(url)
  })
})
