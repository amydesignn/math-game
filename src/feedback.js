/*
 * feedback.js — the Feedback Flow's one seam to the outside world.
 * Oscar's comp: ~/Downloads/delivery/Luxi Feedback Flow.dc.html (2026-08-31,
 * lifted 2026-09-19); contract = the handoff's row shape. One row per
 * submission; RATING ALONE is complete.
 *
 * ZERO PII (COPPA): the table has no name/email/age/uid column — nothing the
 * child is, only what they said. Silent context is coarse WORDS the app
 * attaches (world, screen, guest-vs-account word, build id) — never asked of
 * the child, never identifying.
 *
 * Transport is a RAW PostgREST fetch (the saveRemote pattern, backend.js):
 * guests are the default player and have no session, so this must work on the
 * publishable key alone (anon role; the table's RLS is INSERT-only — no
 * client can ever read feedback back). keepalive so a submit fired just
 * before the iPad home button still lands. supabase-js is never constructed
 * here (the CI WebSocket lesson — auth.js explains).
 */
import { SUPABASE_URL, SUPABASE_KEY, sessionCache } from './auth'

export const FEEDBACK_MAX = 500

/**
 * Validate + shape one submission row. Returns null if the rating is missing
 * or out of range (rating is the ONE required field). Empty optional texts
 * are OMITTED (no empty-string columns in the report). Pure — unit-testable.
 */
export function buildFeedbackRow({ rating, liked, improve } = {}, ctx = {}) {
  const r = Math.round(Number(rating))
  if (!Number.isFinite(r) || r < 1 || r > 5) return null
  const text = (s) => {
    const t = (s ?? '').toString().trim().slice(0, FEEDBACK_MAX)
    return t || undefined
  }
  const word = (s) => (s ? String(s).slice(0, 40) : undefined)
  return {
    rating: r,
    liked: text(liked),
    improve: text(improve),
    world: word(ctx.world),
    screen: word(ctx.screen),
    player: ctx.player === 'account' ? 'account' : 'guest',
    app_version: word(ctx.appVersion),
  }
}

/** Insert one row. Throws on failure — the modal decides what the kid sees. */
export async function submitFeedback(row) {
  const { token } = sessionCache() // null for guests — anon insert is the RLS-blessed path
  const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([row]),
  })
  if (!res.ok) throw new Error(`feedback insert failed: ${res.status}`)
  return true
}

/**
 * The optimistic submit's safety net: if the insert fails AFTER the kid has
 * already closed the thank-you (nobody left to show the gentle-fail card to),
 * we quietly retry once and then let it go — never re-open a modal over
 * gameplay ("never blocks play", Oscar's seam #3).
 */
export function retryFeedbackOnce(row, delayMs = 4000) {
  setTimeout(() => {
    submitFeedback(row).catch(() => {}) // best effort; the kid has moved on
  }, delayMs)
}
