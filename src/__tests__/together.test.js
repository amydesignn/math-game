/*
 * together.test.js — Phase B netcode fixtures (design: docs/together-space.md).
 *
 * Same CI treatment as the boot-gate race fixtures and Finn's threshold
 * table: the dangerous behaviours become the literal test file, and
 * `npm test` gates the deploy. Everything runs on the scriptable test
 * transport — supabase-realtime is never constructed here (the A2 CI
 * lesson), and nothing touches the store (Invariant 1 has its own fixture).
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  stepToward,
} from '../walk'
import {
  createBuddySim,
  createRoster,
  joinMeadow,
  labelFor,
  makeSessionKey,
  SNAP_DIST,
  KEYFRAME_MS,
  EMOTES,
} from '../together'
import { WORLD } from '../config'

/** The scriptable transport — the tests' network. */
function testTransport() {
  const sent = []
  const t = {
    sent,
    handlers: null,
    async join({ self, onEvent, onDown }) {
      t.self = self
      t.handlers = { onEvent, onDown }
    },
    send(event, payload) {
      sent.push({ event, payload })
    },
    track(profile) {
      sent.push({ event: 'track', payload: { ...profile } })
    },
    leave() {
      sent.push({ event: 'leave' })
    },
    // the other side of the wire
    emit(event, payload) {
      t.handlers.onEvent(event, payload)
    },
  }
  return t
}

const flush = () => new Promise((r) => setTimeout(r, 0))

afterEach(() => {
  vi.useRealTimers()
})

// ── the shared walk step ────────────────────────────────────────────────────

describe('stepToward (the ONE walk implementation)', () => {
  it('walks in a straight line at characterSpeed and never overshoots', () => {
    const pos = { x: 0, z: 0 }
    const target = { x: 3, z: 4 } // dist 5
    const r1 = stepToward(pos, target, 0.5) // 1.6 units
    expect(r1.moving).toBe(true)
    expect(Math.hypot(pos.x, pos.z)).toBeCloseTo(WORLD.characterSpeed * 0.5, 5)
    // a huge dt clamps to the target, not past it
    stepToward(pos, target, 100)
    expect(pos.x).toBeCloseTo(3, 5)
    expect(pos.z).toBeCloseTo(4, 5)
  })

  it('reports arrival exactly once at the threshold, and idles with no target', () => {
    const pos = { x: 0, z: 0 }
    expect(stepToward(pos, null, 0.016)).toEqual({ moving: false, arrived: false })
    const near = { x: WORLD.arriveThreshold / 2, z: 0 }
    expect(stepToward(pos, near, 0.016).arrived).toBe(true)
  })
})

// ── the buddy sim ───────────────────────────────────────────────────────────

describe('buddy sim (replicate taps, not positions)', () => {
  it('fixture 1 — converges on the sender: same target, same speed, same end', () => {
    // The sender taps (6,0) and starts walking immediately. The receiver
    // hears about it 300ms late. Both must end standing on the same spot.
    const sender = { x: 0, z: 0 }
    const senderTarget = { x: 6, z: 0 }
    for (let t = 0; t < 0.3; t += 0.016) stepToward(sender, senderTarget, 0.016)

    const sim = createBuddySim()
    // the message carries where the sender WAS at tap time (0,0) + the target
    sim.applyMove({ x: 0, z: 0, tx: 6, tz: 0 })
    for (let t = 0; t < 4; t += 0.016) sim.step(0.016)
    for (let t = 0.3; t < 4; t += 0.016) stepToward(sender, senderTarget, 0.016)

    expect(Math.hypot(sim.pos.x - sender.x, sim.pos.z - sender.z)).toBeLessThan(
      WORLD.arriveThreshold * 2,
    )
    expect(sim.moving).toBe(false)
    expect(sim.target).toBeNull()
  })

  it('fixture 2 — the first message snaps unconditionally (a late joiner lands right)', () => {
    const sim = createBuddySim() // starts at 0,0
    sim.applyMove({ x: 1.2, z: -0.8, tx: null, tz: null }) // small drift, but FIRST
    expect(sim.pos).toEqual({ x: 1.2, z: -0.8 })
  })

  it('fixture 3 — small drift stays smooth, big drift snaps', () => {
    const sim = createBuddySim()
    sim.applyMove({ x: 0, z: 0, tx: null, tz: null }) // started
    // keyframe reports a position within SNAP_DIST → sim keeps its own (no jitter)
    sim.pos.x = 1
    sim.applyMove({ x: 1.5, z: 0, tx: null, tz: null })
    expect(sim.pos.x).toBe(1)
    // beyond SNAP_DIST (a woken background tab) → teleport, not rubber-band
    sim.applyMove({ x: 1 + SNAP_DIST + 1, z: 0, tx: null, tz: null })
    expect(sim.pos.x).toBe(1 + SNAP_DIST + 1)
  })

  it('fixture 4 — a stop message plants the buddy (tx null clears the walk)', () => {
    const sim = createBuddySim()
    sim.applyMove({ x: 0, z: 0, tx: 10, tz: 0 })
    sim.step(0.1)
    expect(sim.moving).toBe(true)
    sim.applyMove({ x: sim.pos.x, z: sim.pos.z, tx: null, tz: null })
    expect(sim.step(0.1)).toBe(false)
    expect(sim.target).toBeNull()
  })
})

// ── the roster ──────────────────────────────────────────────────────────────

describe('roster (one code path for presence and dev hellos)', () => {
  it('fixture 5 — joins once, updates silently, filters self', () => {
    const roster = createRoster('me')
    expect(roster.hello({ k: 'me', label: 'Echo' }).joined).toBeNull() // own echo
    expect(roster.list()).toEqual([])
    const first = roster.hello({ k: 'amy1', label: 'Mum', sparkle: null })
    expect(first.joined?.label).toBe('Mum')
    // the same key again = a profile refresh (sparkle bought), NOT a re-join toast
    const again = roster.hello({ k: 'amy1', label: 'Mum', sparkle: 'gold' })
    expect(again.joined).toBeNull()
    expect(roster.list()[0].sparkle).toBe('gold')
  })

  it('fixture 6 — bye returns who left; an unknown bye is a quiet no-op', () => {
    const roster = createRoster('me')
    roster.hello({ k: 'amy1', label: 'Mum' })
    expect(roster.bye('ghost').left).toBeNull()
    expect(roster.bye('amy1').left?.label).toBe('Mum')
    expect(roster.list()).toEqual([])
  })
})

// ── the session ─────────────────────────────────────────────────────────────

describe('joinMeadow (transport + roster + sims composed)', () => {
  async function joined(extra = {}) {
    const transport = testTransport()
    const events = { joins: [], leaves: [], emotes: [], buddies: [] }
    const session = await joinMeadow({
      mode: transport,
      profile: { label: 'Ivy', character: 'character-female-a', pet: 'animal-cat', sparkle: null },
      getSelf: () => ({ x: 1, z: 2, tx: null, tz: null }),
      onBuddies: (l) => events.buddies.push(l),
      onJoin: (p) => events.joins.push(p),
      onLeave: (p) => events.leaves.push(p),
      onEmote: (k, kind) => events.emotes.push({ k, kind }),
      ...extra,
    })
    return { transport, events, session }
  }

  it('fixture 7 — a hello creates a buddy with a live sim; bye removes it', async () => {
    const { transport, events, session } = await joined()
    transport.emit('hello', { k: 'amy1', label: 'Mum', character: 'character-female-b', pet: 'animal-fox' })
    expect(events.joins.map((p) => p.label)).toEqual(['Mum'])
    const list = events.buddies.at(-1)
    expect(list).toHaveLength(1)
    expect(list[0].sim).toBeTruthy()
    transport.emit('bye', { k: 'amy1' })
    expect(events.leaves.map((p) => p.label)).toEqual(['Mum'])
    expect(events.buddies.at(-1)).toEqual([])
    session.leave()
  })

  it('fixture 8 — THE race: a move that beats its hello is held, then applied', async () => {
    // Supabase broadcast can outrun presence sync — the buddy must not be
    // dropped OR rendered profileless; the move waits for its hello.
    const { transport, events, session } = await joined()
    transport.emit('move', { k: 'amy1', x: 4, z: -3, tx: 8, tz: 0 })
    expect(events.buddies).toEqual([]) // nothing renderable yet, nothing crashed
    transport.emit('hello', { k: 'amy1', label: 'Mum', character: 'c', pet: 'p' })
    const list = events.buddies.at(-1)
    expect(list[0].sim.pos).toEqual({ x: 4, z: -3 }) // the held move landed
    expect(list[0].sim.target).toEqual({ x: 8, z: 0 })
    session.leave()
  })

  it('fixture 9 — our own echoes are ignored everywhere', async () => {
    const { transport, events, session } = await joined()
    const me = session.key
    transport.emit('hello', { k: me, label: 'Echo' })
    transport.emit('move', { k: me, x: 9, z: 9, tx: null, tz: null })
    transport.emit('emote', { k: me, kind: 'wave' })
    expect(events.joins).toEqual([])
    expect(events.emotes).toEqual([])
    session.leave()
  })

  it('fixture 10 — emotes only surface for known buddies (no ghost bubbles)', async () => {
    const { transport, events, session } = await joined()
    transport.emit('emote', { k: 'stranger', kind: 'wave' })
    expect(events.emotes).toEqual([])
    transport.emit('hello', { k: 'amy1', label: 'Mum' })
    transport.emit('emote', { k: 'amy1', kind: 'heart' })
    expect(events.emotes).toEqual([{ k: 'amy1', kind: 'heart' }])
    session.leave()
  })

  it('fixture 11 — keyframes beat while joined, stop dead after leave', async () => {
    vi.useFakeTimers()
    const transport = testTransport()
    const session = await joinMeadow({
      mode: transport,
      profile: { label: 'Ivy' },
      getSelf: () => ({ x: 1, z: 2, tx: null, tz: null }),
    })
    const movesNow = () => transport.sent.filter((m) => m.event === 'move').length
    expect(movesNow()).toBe(1) // the immediate keyframe (late-joiner catch-up)
    vi.advanceTimersByTime(KEYFRAME_MS * 3 + 50)
    expect(movesNow()).toBe(4)
    session.leave()
    vi.advanceTimersByTime(KEYFRAME_MS * 5)
    expect(movesNow()).toBe(4) // silence — no timer leak after leaving
    expect(transport.sent.at(-1)).toEqual({ event: 'leave' })
  })

  it('fixture 12 — getSelf returning null skips the keyframe (not yet arrived)', async () => {
    vi.useFakeTimers()
    const transport = testTransport()
    const session = await joinMeadow({
      mode: transport,
      profile: { label: 'Ivy' },
      getSelf: () => null,
    })
    vi.advanceTimersByTime(KEYFRAME_MS * 2 + 50)
    expect(transport.sent.filter((m) => m.event === 'move')).toEqual([])
    session.leave()
  })

  it('fixture 13 — sendMove/sendEmote stamp our session key', async () => {
    const { transport, session } = await joined()
    session.sendMove({ x: 1, z: 2, tx: 3, tz: 4 })
    session.sendEmote('wave')
    const move = transport.sent.find((m) => m.event === 'move' && m.payload.tx === 3)
    expect(move.payload.k).toBe(session.key)
    const emote = transport.sent.find((m) => m.event === 'emote')
    expect(emote.payload).toEqual({ k: session.key, kind: 'wave' })
    session.leave()
  })

  it('fixture 14 — updateProfile re-tracks with the patch (sparkle shown to Mum)', async () => {
    const { transport, session } = await joined()
    session.updateProfile({ sparkle: 'rainbow' })
    const tracked = transport.sent.filter((m) => m.event === 'track').at(-1)
    expect(tracked.payload.sparkle).toBe('rainbow')
    expect(tracked.payload.k).toBe(session.key)
    session.leave()
  })

  it('fixture 15 — events after leave are dead (no zombie toasts)', async () => {
    const { transport, events, session } = await joined()
    session.leave()
    transport.emit('hello', { k: 'amy1', label: 'Mum' })
    expect(events.joins).toEqual([])
    await flush()
  })
})

// ── the guardrails ──────────────────────────────────────────────────────────

describe('meadow guardrails', () => {
  it('labels: the family mapping + the public-release seam', () => {
    expect(labelFor('amyngo2k2@gmail.com')).toBe('Mum')
    expect(labelFor('  AmyNgo2K2@gmail.com ')).toBe('Mum')
    expect(labelFor('ivydesign2026@gmail.com')).toBe('Ivy')
    expect(labelFor('someone@else.com')).toBe('Friend')
    expect(labelFor(null)).toBe('Friend')
  })

  it('session keys are per-call (same account, two tabs, no collision)', () => {
    expect(makeSessionKey()).not.toBe(makeSessionKey())
  })

  it('the emote vocabulary is closed — four emotes, no free text', () => {
    expect(EMOTES).toHaveLength(4)
    for (const e of EMOTES) expect(Object.keys(e).sort()).toEqual(['emoji', 'kind'])
  })

  it('INVARIANT 1 — the netcode can never touch the store', async () => {
    // together.js (and walk.js under it) must have no import path to
    // store.js: no store, no save, no cloud push — a netcode bug cannot
    // reach Ivy's save. Checked structurally, so a future import fails CI.
    const fs = await import('node:fs')
    for (const file of ['src/together.js', 'src/walk.js']) {
      const src = fs.readFileSync(file, 'utf8')
      expect(src).not.toMatch(/from ['.]+\/?store/)
    }
  })
})
