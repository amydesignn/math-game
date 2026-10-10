/*
 * metrics.test.js — play metrics (2026-10-06). Guards: the return bucket and
 * session summary are right; a whole session sends exactly the expected rows;
 * and NO row ever carries an identifier (the COPPA line — a new field that
 * could identify a child fails here first).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const ALLOWED = new Set(['event', 'came_back', 'world', 'minutes', 'problems', 'solved', 'maps', 'quests', 'player', 'app_version'])

function stubBrowser() {
  const store = new Map()
  const listeners = {}
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
  globalThis.location = { search: '?metrics' }
  globalThis.window = { addEventListener: (t, f) => ((listeners[t] ||= []).push(f)) }
  globalThis.document = { visibilityState: 'visible', addEventListener: (t, f) => ((listeners[t] ||= []).push(f)) }
  const sent = []
  globalThis.fetch = vi.fn((url, opts) => {
    sent.push(...JSON.parse(opts.body))
    return Promise.resolve({ ok: true })
  })
  const fire = (t) => (listeners[t] || []).forEach((f) => f())
  return { sent, fire, store }
}

describe('return bucket', () => {
  it('buckets days since the last play, coarsely', async () => {
    const { returnBucket } = await import('../metrics')
    expect(returnBucket(null, '2026-10-06')).toBe('new')
    expect(returnBucket('2026-10-06', '2026-10-06')).toBe('same-day')
    expect(returnBucket('2026-10-05', '2026-10-06')).toBe('1')
    expect(returnBucket('2026-10-01', '2026-10-06')).toBe('2-7')
    expect(returnBucket('2026-09-01', '2026-10-06')).toBe('8+')
    expect(returnBucket('2026-10-09', '2026-10-06')).toBe('new') // clock went backwards
  })
})

describe('session summary', () => {
  it('adds live world time, rounds to minutes and caps a forgotten tab', async () => {
    const { summarize } = await import('../metrics')
    const t = { worldMs: 5 * 60000, worldSince: 1000, problems: 4, solved: 3, maps: new Set(['market', 'town']), quests: 1 }
    expect(summarize(t, 1000 + 2 * 60000)).toEqual({ minutes: 7, problems: 4, solved: 3, maps: 2, quests: 1 })
    expect(summarize({ ...t, worldMs: 10 * 3600000 }, 1000).minutes).toBe(240)
  })
})

describe('a whole session', () => {
  beforeEach(() => vi.resetModules())

  it('sends start → world_enter → end, with only coarse, non-identifying fields', async () => {
    const { sent, fire } = stubBrowser()
    const m = await import('../metrics')
    m.startMetrics({ player: 'guest', appVersion: 'abc1234' })
    m.enteredWorld('market')
    m.answered(true)
    m.answered(false)
    m.travelled('arcade')
    m.questDone()
    fire('pagehide')

    expect(sent[0].came_back).toBe('new')
    // questDone checkpoints (problems 2, solved 1, quests 1); session_end carries the rest + maps
    expect(sent.map((r) => r.event)).toEqual(['session_start', 'world_enter', 'progress', 'session_end'])
    expect(sent[2]).toMatchObject({ problems: 2, solved: 1, quests: 1, player: 'guest', app_version: 'abc1234' })
    expect(sent[3]).toMatchObject({ problems: 0, solved: 0, quests: 0, maps: 2 })
    for (const row of sent) for (const k of Object.keys(row)) expect(ALLOWED.has(k), `unexpected field ${k}`).toBe(true)
  })

  it('a Door-only visit still ends (maps 0), and a second visit the same day reads same-day', async () => {
    const { sent, fire } = stubBrowser()
    const m = await import('../metrics')
    m.startMetrics({})
    fire('pagehide')
    expect(sent.map((r) => r.event)).toEqual(['session_start', 'session_end'])
    expect(sent[1]).toMatchObject({ minutes: 0, problems: 0, maps: 0 })
    document.visibilityState = 'visible'
    fire('visibilitychange') // back to the foreground → a fresh tally
    expect(sent.at(-1)).toMatchObject({ event: 'session_start', came_back: 'same-day' })
  })

  it('checkpoints every 5 problems, so a session killed before it ends keeps its learning data', async () => {
    const { sent } = stubBrowser()
    const m = await import('../metrics')
    m.startMetrics({})
    m.enteredWorld('market')
    for (let i = 0; i < 12; i++) m.answered(i % 3 !== 0) // 12 tried, 8 solved
    // the tab is killed here — no hide, no pagehide
    const progress = sent.filter((r) => r.event === 'progress')
    expect(progress.length).toBe(2) // at 5 and 10
    expect(progress.reduce((n, r) => n + r.problems, 0)).toBe(10)
    expect(progress.reduce((n, r) => n + r.solved, 0)).toBe(6)
  })

  it('rows are deltas — SUM over progress + session_end = the session total, nothing counted twice', async () => {
    vi.useFakeTimers({ now: 0 })
    const { sent, fire } = stubBrowser()
    const m = await import('../metrics')
    m.startMetrics({})
    m.enteredWorld('market')
    for (let i = 0; i < 7; i++) m.answered(true)
    vi.advanceTimersByTime(3 * 60000)
    m.questDone()
    vi.advanceTimersByTime(4 * 60000)
    m.leftWorld() // back to the Door → checkpoint
    m.leftWorld() // a second call sends nothing new
    fire('pagehide')
    vi.useRealTimers()
    const rows = sent.filter((r) => r.event === 'progress' || r.event === 'session_end')
    const sum = (k) => rows.reduce((n, r) => n + r[k], 0)
    expect({ minutes: sum('minutes'), problems: sum('problems'), solved: sum('solved'), quests: sum('quests') }).toEqual({ minutes: 7, problems: 7, solved: 7, quests: 1 })
    expect(sent.filter((r) => r.event === 'session_end')).toHaveLength(1)
    for (const row of sent) for (const k of Object.keys(row)) expect(ALLOWED.has(k), `unexpected field ${k}`).toBe(true)
  })

  it('stays silent in dev without ?metrics', async () => {
    const { sent } = stubBrowser()
    globalThis.location = { search: '' }
    const m = await import('../metrics')
    m.startMetrics({})
    m.enteredWorld('town')
    expect(sent).toEqual([]) // vitest runs as DEV
  })
})
