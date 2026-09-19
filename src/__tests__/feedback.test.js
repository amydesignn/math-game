/*
 * feedback.test.js — the Feedback Flow's row shape (Oscar's comp 2026-08-31,
 * lifted 2026-09-19; contract = Amy's revisions in the handoff).
 * buildFeedbackRow is pure — no network, no store.
 */
import { describe, it, expect } from 'vitest'
import { buildFeedbackRow, FEEDBACK_MAX } from '../feedback'

const CTX = { world: 'clearing', screen: 'world', player: 'guest', appVersion: 'abc1234' }

describe('buildFeedbackRow', () => {
  it('rating alone is a complete, valid submission', () => {
    const row = buildFeedbackRow({ rating: 4 }, CTX)
    expect(row).toMatchObject({ rating: 4, player: 'guest', world: 'clearing', screen: 'world', app_version: 'abc1234' })
    expect(row.liked).toBeUndefined()
    expect(row.improve).toBeUndefined()
  })

  it('rating is REQUIRED and 1–5 — anything else is no row at all', () => {
    for (const bad of [0, 6, -1, null, undefined, NaN, 'yes']) {
      expect(buildFeedbackRow({ rating: bad, liked: 'text survives nothing' }, CTX)).toBeNull()
    }
  })

  it('texts are trimmed, clamped to 500, and OMITTED when empty', () => {
    const row = buildFeedbackRow({ rating: 5, liked: '  the gems!  ', improve: 'x'.repeat(700) }, CTX)
    expect(row.liked).toBe('the gems!')
    expect(row.improve).toHaveLength(FEEDBACK_MAX)
    expect(buildFeedbackRow({ rating: 5, liked: '   ' }, CTX).liked).toBeUndefined()
  })

  it('player is a WORD and defaults safe to guest', () => {
    expect(buildFeedbackRow({ rating: 3 }, { player: 'account' }).player).toBe('account')
    expect(buildFeedbackRow({ rating: 3 }, { player: 'uid-123' }).player).toBe('guest')
    expect(buildFeedbackRow({ rating: 3 }, {}).player).toBe('guest')
  })

  it('NO-PII whitelist: a row can only ever carry the contract columns', () => {
    // COPPA guard — if someone adds an email/name/uid field it fails HERE first.
    const row = buildFeedbackRow({ rating: 2, liked: 'a', improve: 'b', email: 'kid@x.com', name: 'Ivy' }, { ...CTX, uid: 'u1' })
    const allowed = ['rating', 'liked', 'improve', 'world', 'screen', 'player', 'app_version']
    expect(Object.keys(row).every((k) => allowed.includes(k))).toBe(true)
  })

  it('context words are clamped to 40 chars and optional', () => {
    const row = buildFeedbackRow({ rating: 1 }, { world: 'w'.repeat(80) })
    expect(row.world).toHaveLength(40)
    expect(row.screen).toBeUndefined()
    expect(row.app_version).toBeUndefined()
  })
})
