/*
 * stations.test.js — the station plan vs the Together meadow (Phase B).
 *
 * Adversarial-verify catch (2026-07-19): ensureStations() picked from ALL of
 * MAPS, and Phase B added the meadow — so ~40% of refresh windows would have
 * assigned one of the day's 2–3 quests to a map whose Scene never mounts
 * stations, silently eating the quest AND persisting 'meadow' into the save
 * and the cloud (breaking "nothing about the meadow persists"). The filter
 * in ensureStations is the fix; this fixture keeps it fixed.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

function freshLocalStorage() {
  const data = new Map()
  globalThis.localStorage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
  }
}

describe('station plan vs the meadow', () => {
  beforeEach(() => {
    vi.resetModules()
    freshLocalStorage()
  })

  it('never assigns a quest to a together map, across many rebuilds', async () => {
    const { MAPS } = await import('../maps')
    const togetherIds = Object.keys(MAPS).filter((id) => MAPS[id].together)
    expect(togetherIds).toContain('meadow') // the fixture's premise stays true

    const stations = await import('../stations')
    const store = await import('../store')
    // 50 rebuilds: without the filter the meadow is picked with p≈1 overall
    // (2–3 of 6 per window); with it, a pick is impossible, not just unlucky.
    for (let i = 0; i < 50; i++) {
      const plan = store.getStations()
      store.setStations({ window: null, byMap: plan.byMap }) // force a rebuild
      const byMap = stations.ensureStations()
      for (const id of togetherIds) expect(byMap[id]).toBeUndefined()
    }
    // and nothing meadow-keyed ever reached the persisted save
    const saved = JSON.parse(globalThis.localStorage.getItem('math_world_v1'))
    for (const id of togetherIds) expect(saved.stations.byMap[id]).toBeUndefined()
  })
})
