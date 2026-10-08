/*
 * metrics.js — how much did people PLAY? (2026-10-06, Amy: "I hope engagement
 * and session time eventually increase" — and page views can't say: Luxi Math
 * is one page, so Vercel only ever sees "the app loaded".)
 *
 * PRIVACY FIRST (COPPA): no id, no name, no device fingerprint, no cross-
 * session linking. The device keeps a tally of THIS session and sends coarse
 * counts — a few checkpoints while she plays, the rest when she leaves:
 * minutes in a world, problems
 * tried/solved, maps visited, quests done, and a coarse "came back after N
 * days" bucket. The last-played DAY lives only in this device's localStorage
 * and is never sent — only the bucket is. Same transport + INSERT-only RLS as
 * feedback.js (`public.play_events`, no read policy; reading is dashboard/MCP).
 *
 * Rows:
 *   session_start — on boot (bucket: new | same-day | 1 | 2-7 | 8+)
 *   world_enter   — Play/Resume into a world (which world)
 *   progress      — a checkpoint while she plays: every few problems, after a
 *                   quest, on the way back to the Door (2026-10-08, Finn: a
 *                   session the browser kills without a clean hide still keeps
 *                   its learning data)
 *   session_end   — when the page hides (the rest + maps). EVERY session_start
 *                   gets one, Door-only visits too (maps 0), so starts − ends =
 *                   sessions genuinely lost.
 * minutes/problems/solved/quests are DELTAS since the session's last row — no
 * id links rows, so the honest total is SUM(...) over progress + session_end.
 * A session that comes back to the foreground starts a fresh tally.
 *
 * Off in dev (pane QA would pollute the numbers) unless `?metrics` is in the URL.
 */
import { SUPABASE_URL, SUPABASE_KEY, sessionCache } from './auth'

const LAST_DAY_KEY = 'luxi.lastPlayDay'
const MAX_MINUTES = 240 // a forgotten open tab shouldn't read as a 9-hour session
const CHECKPOINT_EVERY = 5 // problems between progress rows
const COUNTS = ['minutes', 'problems', 'solved', 'quests']

let ctx = { player: 'guest', appVersion: 'dev' }
let tally = null
let inWorld = null // the world she's standing in right now (survives a hide/show)
let enabled = false

const freshTally = () => ({ worldMs: 0, worldSince: null, problems: 0, solved: 0, maps: new Set(), quests: 0, sent: { minutes: 0, problems: 0, solved: 0, quests: 0 } })

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

/** A tally's running totals (cumulative, this session). Pure — unit-tested. */
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

/** What hasn't been sent yet: totals − already sent. Pure — unit-tested. */
export function delta(totals, sent) {
  const d = {}
  for (const k of COUNTS) d[k] = Math.max(0, totals[k] - sent[k])
  return d
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

/** Send what's new since the last row. `progress` skips an empty checkpoint. */
function flush(event) {
  const t = tally
  if (!t) return
  const totals = summarize(t, Date.now())
  const d = delta(totals, t.sent)
  if (event === 'progress' && !COUNTS.some((k) => d[k] > 0)) return
  for (const k of COUNTS) t.sent[k] = totals[k]
  send(event === 'session_end' ? { event, ...d, maps: totals.maps } : { event, ...d })
}

function end() {
  if (!tally) return
  flush('session_end')
  tally = null
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
  flush('progress') // back at the Door — a natural checkpoint
}

export function answered(correct) {
  if (!tally) return
  tally.problems++
  if (correct) tally.solved++
  if (tally.problems % CHECKPOINT_EVERY === 0) flush('progress')
}

export function questDone() {
  if (!tally) return
  tally.quests++
  flush('progress')
}
