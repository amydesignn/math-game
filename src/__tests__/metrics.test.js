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
    const t = { worldMs: 5 * 60000, worldSince: 1000, problems: 4, solved: 3, maps: new Set(['market', 'town']), quests: 1, played: true }
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

    expect(sent.map((r) => r.event)).toEqual(['session_start', 'world_enter', 'session_end'])
    expect(sent[0].came_back).toBe('new')
    expect(sent[2]).toMatchObject({ problems: 2, solved: 1, maps: 2, quests: 1, player: 'guest', app_version: 'abc1234' })
    for (const row of sent) for (const k of Object.keys(row)) expect(ALLOWED.has(k), `unexpected field ${k}`).toBe(true)
  })

  it('a Door-only visit sends no session_end, and a second visit the same day reads same-day', async () => {
    const { sent, fire } = stubBrowser()
    const m = await import('../metrics')
    m.startMetrics({})
    fire('pagehide')
    expect(sent.map((r) => r.event)).toEqual(['session_start'])
    document.visibilityState = 'visible'
    fire('visibilitychange') // back to the foreground → a fresh tally
    expect(sent.at(-1)).toMatchObject({ event: 'session_start', came_back: 'same-day' })
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
