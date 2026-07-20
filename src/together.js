/*
 * together.js — Phase B: the Together Space netcode (design:
 * docs/together-space.md — read it before touching this).
 *
 * The load-bearing idea: REPLICATE TAPS, NOT POSITIONS. Tap-to-move is
 * deterministic (straight line, constant speed, the shared stepToward in
 * walk.js), so the channel carries intentions — "I'm at (x,z), walking to
 * (tx,tz)" — and each side runs the same walk sim on the other's character.
 * Both sims converge on the same target, so latency errors self-heal; a
 * handful of messages a minute replaces a 10–20Hz position stream.
 *
 * Invariant 1 (the big one): NOTHING in this file — or reachable from it —
 * writes game state. The meadow never touches the store, so no netcode bug
 * can ever touch Ivy's save. Keep it that way: no store imports, ever.
 *
 * Transports (the backend.js pattern):
 *   supabase — private Realtime channel, prod + `?cloud` dev. Lazy auth
 *              import (the A2 CI lesson: supabase-realtime must never load
 *              in the test import graph).
 *   dev      — BroadcastChannel between same-origin tabs: two-tab pane QA
 *              with no accounts, full protocol exercised.
 *   test     — a scriptable transport object passed straight in.
 */
import { stepToward } from './walk'

export const MEADOW_TOPIC = 'family-meadow'

/* Buddy sim correction: within this distance of a reported position, trust
 * the sim (smooth); beyond it, snap — a real disruption (a woken background
 * tab) reads better as a teleport than a long rubber-band glide. */
export const SNAP_DIST = 2.5

/* Keyframe cadence — drift correction + late-joiner catch-up. Background-tab
 * timer throttling stretches this to ~60s; presence handles liveness, so a
 * slow keyframe only delays correction, never correctness. */
export const KEYFRAME_MS = 3000

/** The whole vocabulary of the meadow — emotes, no free text (design rule). */
export const EMOTES = [
  { kind: 'wave', emoji: '👋' },
  { kind: 'heart', emoji: '💜' },
  { kind: 'party', emoji: '🎉' },
  { kind: 'laugh', emoji: '😄' },
]

/* The family mapping — the one place an email becomes a name. Public-release
 * seam: any other account simply reads "Friend". */
const LABELS = {
  'amyngo2k2@gmail.com': 'Mum',
  'ivydesign2026@gmail.com': 'Ivy',
}
export function labelFor(email) {
  return LABELS[(email || '').toLowerCase().trim()] || 'Friend'
}

/** Random per-TAB session key — the wire address of ONE browser tab. Distinct
 *  from a player's IDENTITY (their account uid): a player carries one identity
 *  across every tab/device, and presence collapses by identity so two Ivy tabs
 *  render as one Ivy (see createRoster). With no identity (dev two-tab QA), the
 *  identity falls back to this key, so each tab is its own player — QA still
 *  sees two buddies. */
export function makeSessionKey() {
  return Math.random().toString(36).slice(2, 10)
}

// ── The buddy walk sim ──────────────────────────────────────────────────────

/**
 * One remote player's movement state. `applyMove` ingests a protocol message
 * ({x,z,tx,tz}); `step(dt)` advances the walk exactly like the local
 * Character does (same stepToward). Read `pos`/`moving` each frame.
 */
export function createBuddySim() {
  const sim = {
    pos: { x: 0, z: 0 },
    target: null,
    moving: false,
    started: false, // first message snaps position unconditionally
    applyMove({ x, z, tx, tz }) {
      const drift = Math.hypot(sim.pos.x - x, sim.pos.z - z)
      if (!sim.started || drift > SNAP_DIST) {
        sim.pos.x = x
        sim.pos.z = z
      }
      sim.started = true
      sim.target = tx == null ? null : { x: tx, z: tz }
    },
    step(dt) {
      const { moving } = stepToward(sim.pos, sim.target, dt)
      if (!moving) sim.target = null
      sim.moving = moving
      return moving
    },
  }
  return sim
}

// ── The roster ──────────────────────────────────────────────────────────────

/**
 * Who's in the meadow (besides us). Fed by hello/bye events — the supabase
 * transport synthesizes those from presence join/leave, the dev transport
 * sends them itself, so there is ONE roster code path. Returns diffs so the
 * UI can toast arrivals and goodbyes.
 *
 * Keyed by IDENTITY (a player's account), not by session key: two tabs of the
 * same identity collapse to ONE buddy, reference-counted by their session keys.
 * A buddy joins on the FIRST session of its identity and only leaves when its
 * LAST session goes — so closing one of Ivy's two tabs never yanks her out of
 * Mum's meadow. One session per identity is the `primary`; the session routes
 * movement through it so a second, idle tab can't jitter the buddy.
 */
export function createRoster(selfId) {
  const members = new Map() // id → { profile, keys:Set<k>, primary:k }

  const findByKey = (k) => {
    for (const m of members.values()) if (m.keys.has(k)) return m
    return null
  }

  return {
    hello(profile) {
      if (!profile || !profile.k) return { joined: null, isNew: false, id: null }
      const id = profile.id ?? profile.k // no identity (dev) → the tab IS the player
      if (id === selfId) return { joined: null, isNew: false, id } // our own, any tab
      const m = members.get(id)
      if (m) {
        m.keys.add(profile.k)
        // refresh visuals (sparkle/character can change) — keep the render key stable
        m.profile = { ...profile, id, k: m.primary }
        return { joined: null, isNew: false, id }
      }
      const entry = { ...profile, id, k: profile.k }
      members.set(id, { profile: entry, keys: new Set([profile.k]), primary: profile.k })
      return { joined: entry, isNew: true, id }
    },
    bye(k) {
      const m = findByKey(k)
      if (!m) return { left: null, gone: false, id: null, promoted: null }
      const id = m.profile.id
      m.keys.delete(k)
      if (m.keys.size === 0) {
        members.delete(id)
        return { left: m.profile, gone: true, id, promoted: null }
      }
      // another tab of this identity is still here — the buddy stays. If the tab
      // that left was driving movement, promote a survivor to take the wheel.
      let promoted = null
      if (m.primary === k) {
        promoted = m.keys.values().next().value
        m.primary = promoted
        m.profile = { ...m.profile, k: promoted }
      }
      return { left: null, gone: false, id, promoted }
    },
    idOf(k) {
      const m = findByKey(k)
      return m ? m.profile.id : null
    },
    primaryOf(id) {
      const m = members.get(id)
      return m ? m.primary : null
    },
    list() {
      return [...members.values()].map((m) => m.profile)
    },
    has(id) {
      return members.has(id)
    },
  }
}

// ── The session (transport + roster + sims, one object for the App) ─────────

/**
 * Join the meadow. Resolves once connected (or throws — the App shows a
 * friendly note and stays home; never an error screen).
 *
 *   session = await joinMeadow({
 *     mode: 'supabase' | 'dev' | <transport object>,
 *     profile: { label, character, pet, sparkle },   // k is added here
 *     getSelf: () => ({ x, z, tx, tz }),             // keyframe source
 *     onBuddies(list),   // [{ k, profile, sim }] — render these
 *     onJoin(profile), onLeave(profile),             // toasts
 *     onEmote(k, kind),                              // bubble on that buddy
 *     onDown(),                                      // connection lost
 *   })
 *   session.sendMove({ x, z, tx, tz })   // call on every tap + arrival
 *   session.sendEmote(kind)
 *   session.updateProfile(patch)         // e.g. sparkle change
 *   session.leave()
 */
export async function joinMeadow({ mode, profile, identity, getSelf, onBuddies, onJoin, onLeave, onEmote, onDown }) {
  const key = makeSessionKey()
  // IDENTITY (the account) is stable across a player's tabs/devices; the session
  // key is per-tab. Presence collapses by identity, so two tabs of one account
  // are one buddy. No identity (dev two-tab QA) → the identity is the tab's own
  // key, so each tab is its own player and QA still sees two buddies.
  const selfId = identity ?? key
  const self = { ...profile, k: key, id: selfId }
  const roster = createRoster(selfId)
  const sims = new Map() // identity id → buddy sim (one per player, not per tab)
  const pendingMoves = new Map() // k → move that beat its hello (broadcast races presence)
  const selfKeys = new Set([key]) // every tab of OUR OWN identity — never rendered as a buddy
  let live = true

  const buddies = () =>
    roster.list().map((p) => ({ k: p.id, profile: p, sim: sims.get(p.id) }))

  function handle(event, payload) {
    if (!live || !payload || selfKeys.has(payload.k)) return
    if (event === 'hello') {
      const { joined, isNew, id } = roster.hello(payload)
      if (id === selfId) {
        // our own identity in another tab — track its key so its moves/emotes
        // are dropped, never rendered (and never leak into pendingMoves)
        selfKeys.add(payload.k)
        pendingMoves.delete(payload.k)
        return
      }
      if (isNew && !sims.has(id)) sims.set(id, createBuddySim())
      const pend = pendingMoves.get(payload.k)
      if (pend) {
        if (roster.primaryOf(id) === payload.k) sims.get(id)?.applyMove(pend)
        pendingMoves.delete(payload.k) // a non-primary tab's early move is discarded
      }
      if (joined) onJoin?.(joined)
      onBuddies?.(buddies())
    } else if (event === 'bye') {
      const { left, gone, id, promoted } = roster.bye(payload.k)
      pendingMoves.delete(payload.k)
      if (gone && id != null) sims.delete(id)
      else if (promoted != null && id != null) {
        // a different tab now drives this buddy — let its next keyframe snap in
        // cleanly rather than gliding from the departed tab's stale position
        const sim = sims.get(id)
        if (sim) sim.started = false
      }
      if (left) onLeave?.(left)
      onBuddies?.(buddies())
    } else if (event === 'move') {
      const id = roster.idOf(payload.k)
      if (id == null) {
        pendingMoves.set(payload.k, payload) // held until the hello lands
        return
      }
      // only the primary tab of a buddy drives its sim — an idle second tab's
      // stale keyframes would otherwise snap the buddy back and forth (jitter)
      if (roster.primaryOf(id) === payload.k) sims.get(id)?.applyMove(payload)
    } else if (event === 'emote') {
      const id = roster.idOf(payload.k)
      if (id != null) onEmote?.(id, payload.kind)
    }
  }

  const transport =
    typeof mode === 'object'
      ? mode
      : mode === 'supabase'
        ? await supabaseTransport()
        : devTransport()
  await transport.join({ self, onEvent: handle, onDown: () => live && onDown?.() })

  // Keyframes: our current position+target, every few seconds. Also the
  // late-joiner catch-up — a new buddy knows where we stand within one beat.
  const keyframe = () => {
    const s = getSelf?.()
    if (s) transport.send('move', { ...s, k: key })
  }
  const keyTimer = setInterval(keyframe, KEYFRAME_MS)
  keyframe()

  return {
    key,
    sims, // exposed for QA/debug
    sendMove(m) {
      transport.send('move', { ...m, k: key })
    },
    sendEmote(kind) {
      transport.send('emote', { k: key, kind })
    },
    updateProfile(patch) {
      Object.assign(self, patch)
      transport.track(self)
    },
    leave() {
      live = false
      clearInterval(keyTimer)
      transport.leave()
    },
  }
}

// ── Transports ──────────────────────────────────────────────────────────────

/*
 * Dev: BroadcastChannel between tabs of the same origin. Presence is
 * emulated: hello on join (and a reply-hello whenever we meet an unknown
 * key, so late tabs converge), bye on leave. A killed tab never sends bye —
 * acceptable for QA; the supabase transport gets real presence timeouts.
 */
function devTransport() {
  let ch = null
  let self = null
  let emit = null
  return {
    async join({ self: me, onEvent }) {
      self = me
      emit = onEvent
      ch = new BroadcastChannel('meadow-dev')
      ch.onmessage = ({ data }) => {
        if (!data || data.k === self.k) return
        if (data.t === 'hello') {
          const known = data.known?.includes(self.k)
          emit('hello', data.profile)
          // reply so the newcomer learns about us (idempotent; loop-guarded
          // by `known` — we only reply if they haven't seen us yet)
          if (!known) ch.postMessage({ t: 'hello', k: self.k, profile: self, known: [data.k] })
        } else if (data.t === 'bye') emit('bye', { k: data.k })
        else if (data.t === 'msg') emit(data.event, data.payload)
      }
      ch.postMessage({ t: 'hello', k: self.k, profile: self, known: [] })
    },
    send(event, payload) {
      ch?.postMessage({ t: 'msg', k: self.k, event, payload })
    },
    track(profile) {
      self = profile
      ch?.postMessage({ t: 'hello', k: self.k, profile: self, known: ['*'] }) // profile refresh, no reply needed
    },
    leave() {
      ch?.postMessage({ t: 'bye', k: self.k })
      ch?.close()
      ch = null
    },
  }
}

/*
 * Supabase: the real thing — a PRIVATE broadcast channel (config.private +
 * RLS on realtime.messages; an unauthenticated client is refused at
 * subscribe). Auth is imported lazily INSIDE this factory: the store's test
 * suite must never pull supabase-realtime into its import graph (CI lesson,
 * A2 — run 29703622528).
 */
async function supabaseTransport() {
  const { client } = await import('./auth')
  const supa = client()
  let ch = null
  return {
    async join({ self, onEvent, onDown }) {
      const { data } = await supa.auth.getSession()
      if (!data.session) throw new Error('no-session')
      // The realtime socket must carry the USER's JWT (not the publishable
      // key) or the private-channel RLS check has nothing to authorize.
      // No-arg setAuth() pulls the current session token — the documented
      // pre-subscribe step for private channels; supabase-js forwards
      // refreshed tokens to the socket automatically after that.
      await supa.realtime.setAuth()
      ch = supa.channel(MEADOW_TOPIC, {
        config: {
          private: true,
          broadcast: { self: false },
          presence: { key: self.k },
        },
      })
      ch.on('broadcast', { event: 'move' }, ({ payload }) => onEvent('move', payload))
      ch.on('broadcast', { event: 'emote' }, ({ payload }) => onEvent('emote', payload))
      // presence → the roster's one code path: joins become hellos, leaves byes
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState()
        Object.values(state).forEach((metas) => metas.forEach((p) => p.k && onEvent('hello', p)))
      })
      ch.on('presence', { event: 'join' }, ({ newPresences }) =>
        newPresences.forEach((p) => p.k && onEvent('hello', p)),
      )
      ch.on('presence', { event: 'leave' }, ({ leftPresences }) =>
        leftPresences.forEach((p) => p.k && onEvent('bye', { k: p.k })),
      )
      await new Promise((resolve, reject) => {
        let settled = false
        // (status, err) — an unauthorized join surfaces here as CHANNEL_ERROR
        // ("Unauthorized"), never as a thrown exception.
        ch.subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            ch.track(self) // presence track is only legal AFTER SUBSCRIBED
            if (!settled) {
              settled = true
              resolve()
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            if (import.meta.env.DEV) console.warn('[meadow]', status, err?.message)
            if (!settled) {
              settled = true
              // A refused/failed JOIN must not leave an auto-retrying channel
              // behind (realtime retries CHANNEL_ERROR joins — a later silent
              // success would be a ghost session nobody can leave()). After a
              // successful subscribe we deliberately DON'T remove on transient
              // errors — the client may recover; onDown tells the App.
              const c = ch
              ch = null
              if (c) supa.removeChannel(c)
              reject(new Error('meadow-' + status.toLowerCase()))
            } else onDown?.()
          } else if (status === 'CLOSED' && settled) {
            onDown?.()
          }
        })
      })
    },
    send(event, payload) {
      ch?.send({ type: 'broadcast', event, payload })
    },
    track(profile) {
      ch?.track(profile)
    },
    leave() {
      const c = ch
      ch = null
      if (c) supa.removeChannel(c)
    },
  }
}
