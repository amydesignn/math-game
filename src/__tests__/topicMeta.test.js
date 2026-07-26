/*
 * topicMeta.test.js — the progress popup's display map (Phase 5-B).
 *
 * WHY THESE EXIST: the first lift of Oscar's comp keyed topic cards by SUBJECT
 * NAME (`multiplication`) while the store keys `topicProgress` by TOPIC ID
 * (`long-mult`). Nothing crashed — the popup simply rendered "Start playing to
 * fill this in." to a kid with a week of real work behind her. A silent,
 * total failure of the one feature whose whole job is to show her record.
 *
 * So the mapping is a fixture, exactly like Finn's threshold table and the C1
 * calibration set: the dangerous behaviour becomes the test file, and `npm
 * test` gates the deploy. The load-bearing one is "every topic is claimed" —
 * when C2 long division lands, forgetting this map fails CI instead of quietly
 * hiding her division work.
 */
import { describe, it, expect } from 'vitest'
import { TOPIC_META, TOPIC_ORDER, stageCounts, topicTotal, startedTopics } from '../topicMeta'
import { TOPICS } from '../math'
import { STAGE_LABELS } from '../levels'

describe('topic display map (data model → what Ivy reads)', () => {
  it('fixture 1 — EVERY real topic is claimed by exactly one card', () => {
    // The guard against the original bug, and against C2/C3/C4 landing without
    // a home: an unclaimed topic is invisible work.
    const claimed = Object.values(TOPIC_META).flatMap((m) => m.topics)
    for (const id of Object.keys(TOPICS)) {
      expect(claimed.filter((c) => c === id)).toHaveLength(1)
    }
  })

  it('fixture 2 — every claimed id is a REAL topic (no typos, no ghosts)', () => {
    for (const [key, meta] of Object.entries(TOPIC_META)) {
      for (const id of meta.topics) {
        expect(TOPICS[id], `${key} claims unknown topic "${id}"`).toBeTruthy()
      }
    }
  })

  it('fixture 3 — a card\'s stage count matches its topics\' real ladder', () => {
    // If Finn raises long-mult to 4 rungs, this fails until the card grows a
    // row — otherwise her hardest work would be summed into nothing.
    for (const [key, meta] of Object.entries(TOPIC_META)) {
      if (!meta.topics.length) continue
      const top = Math.max(...meta.topics.map((id) => TOPICS[id].topLevel))
      expect(meta.stages, `${key} shows ${meta.stages} stages, topics have ${top}`).toBe(top)
    }
  })

  it('fixture 4 — every card is in TOPIC_ORDER and every entry is a real card', () => {
    expect([...TOPIC_ORDER].sort()).toEqual(Object.keys(TOPIC_META).sort())
  })

  it('fixture 5 — stages never exceed the labels Ivy can be shown', () => {
    // She must never see "L4" or a blank label; STAGE_LABELS is the UI source.
    for (const meta of Object.values(TOPIC_META)) {
      for (let n = 1; n <= meta.stages; n++) expect(STAGE_LABELS[n]).toBeTruthy()
    }
  })
})

describe('counting what she solved', () => {
  const progress = {
    'long-mult': { byLevel: { 1: { seen: 30, correct: 22 }, 2: { seen: 14, correct: 11 }, 3: { seen: 8, correct: 5 } } },
    'mult-2x1': { byLevel: { 1: { seen: 9, correct: 7 } } },
    'add-2x2': { byLevel: { 1: { seen: 5, correct: 4 } } },
  }

  it('fixture 6 — THE bug: a real save renders topics, not an empty card', () => {
    // Ivy's actual shape after a week. If this ever returns [] again, the
    // record book is lying to her.
    const started = startedTopics(progress)
    expect(started).toContain('multiplication')
    expect(started).toContain('addition')
    expect(started.length).toBeGreaterThan(0)
  })

  it('fixture 7 — the two multiplication topics merge, warm-up sums both', () => {
    // mult-2x1 only ever has rung 1, and rung 1 IS "Warm-up" — merging is
    // honest, not a fudge.
    const counts = stageCounts(progress, TOPIC_META.multiplication)
    expect(counts[1]).toBe(22 + 7)
    expect(counts[2]).toBe(11)
    expect(counts[3]).toBe(5)
    expect(topicTotal(progress, TOPIC_META.multiplication)).toBe(45)
  })

  it('fixture 8 — counts are CORRECT only: nothing can imply accuracy', () => {
    // Design Principle 4. `seen` is deliberately never read — a count that
    // used it could be turned into a percentage by a later change.
    const counts = stageCounts(progress, TOPIC_META.multiplication)
    const seenTotals = [30, 14, 8, 9]
    for (const s of seenTotals) expect(Object.values(counts)).not.toContain(s)
    expect(topicTotal(progress, TOPIC_META.multiplication)).toBeLessThan(30 + 14 + 8 + 9)
  })

  it('fixture 9 — a topic with no work simply does not render', () => {
    expect(startedTopics({})).toEqual([])
    expect(startedTopics({ 'long-mult': { byLevel: { 1: { seen: 4, correct: 0 } } } })).toEqual([])
    // …and the roadmap subjects stay invisible until they exist
    expect(startedTopics(progress)).not.toContain('division')
  })

  it('fixture 10 — missing/partial data never throws (old saves, fresh saves)', () => {
    expect(() => startedTopics(undefined)).not.toThrow()
    expect(topicTotal({ 'long-mult': {} }, TOPIC_META.multiplication)).toBe(0)
    expect(topicTotal({ 'long-mult': { byLevel: { 2: {} } } }, TOPIC_META.multiplication)).toBe(0)
  })

  it('fixture 11 — display order puts her frontier first, support last', () => {
    const started = startedTopics(progress)
    expect(started.indexOf('multiplication')).toBeLessThan(started.indexOf('addition'))
  })
})
