/*
 * metrics.js — how much did people PLAY? (2026-10-06, Amy: "I hope engagement
 * and session time eventually increase" — and page views can't say: Luxi Math
 * is one page, so Vercel only ever sees "the app loaded".)
 *
 * PRIVACY FIRST (COPPA): no id, no name, no device fingerprint, no cross-
 * session linking. The device keeps a tally of THIS session and, when the
 * player leaves, sends ONE row of coarse counts: minutes in a world, problems
 * tried/solved, maps visited, quests done, and a coarse "came back after N
 * days" bucket. The last-played DAY lives only in this device's localStorage
 * and is never sent — only the bucket is. Same transport + INSERT-only RLS as
 * feedback.js (`public.play_events`, no read policy; reading is dashboard/MCP).
 *
 * Rows:
 *   session_start — on boot (bucket: new | same-day | 1 | 2-7 | 8+)
 *   world_enter   — Play/Resume into a world (which world)
 *   session_end   — when the page hides (minutes, problems, solved, maps, quests)
 * A session that comes back to the foreground starts a fresh tally.
 *
 * Off in dev (pane QA would pollute the numbers) unless `?metrics` is in the URL.
 */
import { SUPABASE_URL, SUPABASE_KEY, sessionCache } from './auth'

const LAST_DAY_KEY = 'luxi.lastPlayDay'
const MAX_MINUTES = 240 // a forgotten open tab shouldn't read as a 9-hour session

let ctx = { player: 'guest', appVersion: 'dev' }
let tally = null
let inWorld = null // the world she's standing in right now (survives a hide/show)
let enabled = false

const freshTally = () => ({ worldMs: 0, worldSince: null, problems: 0, solved: 0, maps: new Set(), quests: 0, played: false })

/** Days between two local YYYY-MM-DD strings → the coarse bucket. Pure. */
export function returnBucket(lastDay, today) {
  if (!lastDay) return 'new'
  const d = Math.round((Date.parse(today) - Date.parse(lastDay)) / 864e5)
  if (!Number.isFinite(d) || d < 0) return 'new'
  if (d === 0) return 'same-day'
  if (d === 1) return '1'
  if (d <= 7) return '2-7'
  return '8+'
}

/** The session_end row's counts from a tally. Pure — unit-tested. */
export function summarize(t, now) {
  const live = t.worldSince != null ? now - t.worldSince : 0
  return {
    minutes: Math.min(MAX_MINUTES, Math.round((t.worldMs + live) / 60000)),
    problems: t.problems,
    solved: t.solved,
    maps: t.maps.size,
    quests: t.quests,
  }
}

const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function send(row) {
  if (!enabled) return
  const { token } = sessionCache()
  try {
    fetch(`${SUPABASE_URL}/rest/v1/play_events`, {
      method: 'POST',
      keepalive: true, // the pagehide row must survive the iPad home button
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token || SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([{ ...row, player: ctx.player, app_version: ctx.appVersion }]),
    }).catch(() => {}) // best effort — metrics never get in the way of play
  } catch {
    // no network / no fetch — fine, play goes on
  }
}

function begin() {
  tally = freshTally()
  let last = null
  try {
    last = localStorage.getItem(LAST_DAY_KEY)
    localStorage.setItem(LAST_DAY_KEY, localDay())
  } catch {
    // private mode — every session reads as 'new', which is honest enough
  }
  send({ event: 'session_start', came_back: returnBucket(last, localDay()) })
  if (inWorld) enteredWorld(inWorld) // came back to the foreground mid-world
}

function end() {
  if (!tally) return
  const t = tally
  tally = null
  if (!t.played) return // a Door-only visit already shows as a session_start without a world_enter
  send({ event: 'session_end', ...summarize(t, Date.now()) })
}

/** Call once at boot. `player` = 'guest' | 'account'. */
export function startMetrics({ player, appVersion } = {}) {
  enabled = !import.meta.env.DEV || new URLSearchParams(location.search).has('metrics')
  ctx = { player: player === 'account' ? 'account' : 'guest', appVersion: appVersion || 'dev' }
  if (tally) return // StrictMode double-mount
  begin()
  window.addEventListener('pagehide', end)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') end()
    else if (!tally) begin()
  })
}

export function enteredWorld(world) {
  inWorld = world
  if (!tally) return
  tally.played = true
  tally.maps.add(world)
  if (tally.worldSince == null) tally.worldSince = Date.now()
  send({ event: 'world_enter', world })
}

export function travelled(world) {
  inWorld = world
  tally?.maps.add(world)
}

export function leftWorld() {
  inWorld = null
  if (!tally || tally.worldSince == null) return
  tally.worldMs += Date.now() - tally.worldSince
  tally.worldSince = null
}

export function answered(correct) {
  if (!tally) return
  tally.problems++
  if (correct) tally.solved++
}

export function questDone() {
  if (tally) tally.quests++
}
