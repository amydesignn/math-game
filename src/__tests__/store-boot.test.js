/*
 * The Phase A race fixtures (docs/accounts-boot-gate.md §Test plan) — the
 * dangerous boot/sync interleavings as a literal test file, same treatment
 * as the C1 calibration set and Finn's threshold table: `npm test` gates
 * the deploy, so none of these can quietly regress.
 *
 * The store is a module singleton, so every test gets a FRESH module via
 * vi.resetModules() + dynamic import, a fresh in-memory localStorage, and a
 * scriptable mock backend (latency / failures / seeded cloud state).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SHOP } from '../config'

const KEY = 'math_world_v1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))

// Tight timings so the whole suite runs in milliseconds. Debounce is real —
// just short.
const FAST = { pushDebounceMs: 5, bootReadTimeoutMs: 100, retryReadMs: 10 }

/** A complete, already-migrated save (capRetiredAt set, ledger consistent)
 *  so fixtures control exactly which migration — if any — should run. */
const mkSave = (over = {}) => ({
  character: 'character-female-a',
  pet: 'animal-cat',
  map: 'clearing',
  gems: 0,
  lifetimeGems: 0,
  capRetiredAt: '2026-07-18T00:00:00.000Z',
  celebratedLevel: 1,
  levelUps: 0,
  soundOn: true,
  world: [],
  owned: [],
  nextId: 1,
  topicProgress: {},
  sparkle: null,
  stations: { window: null, byMap: {} },
  startedISO: '2026-07-01T00:00:00.000Z',
  lastActive: '2026-07-10T00:00:00.000Z',
  ...over,
})

/** Scriptable backend: `cloud` = the seeded remote save (null = empty cloud),
 *  `readDelay` = network latency, `failReads` = how many reads throw first. */
function mockBackend({ cloud = null, readDelay = 0, failReads = 0 } = {}) {
  let remote = cloud ? clone(cloud) : null
  const calls = { reads: 0, writes: [] }
  return {
    kind: 'mock',
    calls,
    get cloud() {
      return remote
    },
    async loadRemote() {
      calls.reads += 1
      if (failReads > 0) {
        failReads -= 1
        throw new Error('net down')
      }
      if (readDelay) await sleep(readDelay)
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

/** Fresh store module + booted against `mock`. Seed localStorage FIRST. */
async function boot(mock, { awaitInit = true } = {}) {
  const store = await import('../store.js')
  const init = store.initStore(mock, FAST)
  if (awaitInit) await init
  return { store, init }
}

const localLedger = () => JSON.parse(storage.getItem(KEY)).lifetimeGems

describe('boot winner-pick (the ledger merge rule)', () => {
  it('1 · fresh device + cloud save → cloud wins, zero pushes', async () => {
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 40, gems: 12 }) })
    const { store } = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(40)
    expect(store.getState().gems).toBe(12)
    expect(localLedger()).toBe(40) // localStorage replaced by the winner
    await sleep(25)
    expect(mock.calls.writes.length).toBe(0) // nothing of ours to upload
  })

  it('2 · cloud empty + local save → local wins, pushed exactly once', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 12, gems: 3 })))
    const mock = mockBackend({ cloud: null })
    const { store } = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(12)
    await sleep(25)
    expect(mock.calls.writes.length).toBe(1)
    expect(mock.cloud.lifetimeGems).toBe(12)
  })

  it('3 · both exist, local ahead (a push failed last session) → local wins', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 30 })))
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 20 }) })
    const { store } = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(30)
    await sleep(25)
    expect(mock.cloud.lifetimeGems).toBe(30) // cloud caught up
  })

  it('4 · both exist, cloud ahead (new iPad) → cloud wins, local replaced, no push', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 30 })))
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 50 }) })
    const { store } = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(50)
    expect(localLedger()).toBe(50)
    await sleep(25)
    expect(mock.calls.writes.length).toBe(0)
  })
})

describe('the read-before-write invariant', () => {
  it('5 · failed read → local play, pushes DISABLED; background retry re-enables', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 12 })))
    const mock = mockBackend({ cloud: null, failReads: 1 })
    const { store } = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(12) // fully playable
    store.setSoundOn(false)
    await sleep(8)
    expect(mock.calls.writes.length).toBe(0) // no read yet → no writes, period
    await sleep(30) // retryReadMs elapses, second read succeeds
    expect(mock.calls.reads).toBeGreaterThanOrEqual(2)
    await sleep(15)
    expect(mock.calls.writes.length).toBeGreaterThanOrEqual(1) // now it syncs
    expect(mock.cloud.soundOn).toBe(false)
  })

  it('5b · boot read slower than the timeout → same as a failed read', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 7 })))
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 99 }), readDelay: 300 })
    const { store } = await boot(mock)
    expect(store.getState().lifetimeGems).toBe(7) // played local, didn't wait
    store.addGems(1)
    await sleep(10)
    expect(mock.calls.writes.length).toBe(0) // and never wrote blind
  })

  it('6 · THE CLOBBER ATTEMPT: save storm while the boot read is in flight → zero writes, cloud still wins', async () => {
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 100, gems: 100 }), readDelay: 40 })
    const { store, init } = await boot(mock, { awaitInit: false })
    // A storm of mutations against the fresh pre-boot state (the real app
    // can't do this — <Boot> gates <App> — but the invariant must hold anyway).
    store.addGems(1)
    store.addGems(1)
    store.addGems(1)
    await sleep(10)
    expect(mock.calls.writes.length).toBe(0) // ← the entire point of Phase A
    await init
    expect(store.getState().lifetimeGems).toBe(100) // cloud won on the ledger
    await sleep(25)
    expect(mock.calls.writes.length).toBe(0) // adoption cleared the dirty flag
  })
})

describe('the push guard (ledger is monotonic)', () => {
  it('7 · a buggy ledger regression is refused', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 60 })))
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 50 }) })
    const { store } = await boot(mock)
    await sleep(25)
    expect(mock.cloud.lifetimeGems).toBe(60) // local won + synced
    // Simulate a corrupting bug: the ledger walks backwards.
    store.getState().lifetimeGems = 10
    store.setSoundOn(false)
    const pushed = await store.flushCloudNow()
    expect(pushed).toBe(false)
    expect(mock.cloud.lifetimeGems).toBe(60) // cloud copy protected
  })

  it('8 · resetAll is the ONE allowed regression, and re-arms future pushes', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 50, gems: 20 })))
    const mock = mockBackend({ cloud: mkSave({ lifetimeGems: 50, gems: 20 }) })
    const { store } = await boot(mock)
    store.resetAll()
    await sleep(25)
    expect(mock.cloud.lifetimeGems).toBe(0) // forced through the guard
    store.addGems(2)
    await sleep(25)
    expect(mock.cloud.lifetimeGems).toBe(2) // guard baseline reset — life goes on
  })
})

describe('migrations + write path', () => {
  it('9 · a pre-refund cloud save is migrated ON ADOPTION, exactly once', async () => {
    const item = SHOP[0]
    const preRefund = mkSave({
      gems: 5,
      lifetimeGems: 20,
      capRetiredAt: null, // ← the refund has never run on this save
      owned: [{ id: 1, asset: item.asset, pack: item.pack }],
    })
    const rightful = 20 - item.price
    const mock = mockBackend({ cloud: preRefund })
    const { store } = await boot(mock)
    expect(store.getState().gems).toBe(rightful) // refund ran
    expect(store.getState().capRetiredAt).toBeTruthy()
    // Second boot on the migrated local copy: the refund must NOT re-run.
    vi.resetModules()
    const again = await import('../store.js')
    await again.initStore(mockBackend({ cloud: preRefund }), FAST)
    expect(again.getState().gems).toBe(rightful)
  })

  it('10 · rapid saves coalesce into one debounced push', async () => {
    storage.setItem(KEY, JSON.stringify(mkSave({ lifetimeGems: 10 })))
    const mock = mockBackend({ cloud: null })
    const { store } = await boot(mock)
    await sleep(25)
    const after = mock.calls.writes.length // the boot sync
    store.addGems(1)
    store.addGems(1)
    store.addGems(1)
    await sleep(30)
    expect(mock.calls.writes.length).toBe(after + 1) // one write, not three
    expect(mock.cloud.lifetimeGems).toBe(13)
  })
})
