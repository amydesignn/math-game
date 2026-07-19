/*
 * backend.js — the transport layer under the store (Phase A, design in
 * docs/accounts-boot-gate.md).
 *
 * A backend is `{ kind, loadRemote(), saveRemote(blob) }`:
 *   loadRemote() → Promise<{ state } | null>   null = "cloud is empty" —
 *     a SUCCESSFUL read of nothing. A failed/offline read THROWS; the store
 *     treats those two cases very differently (an empty cloud can be written
 *     to, an unread cloud never can).
 *   saveRemote(blob) → Promise<true>, throws on failure. `blob` is a plain
 *     snapshot object, already cloned by the store.
 *
 * Two real backends ever exist:
 *   local    — this file. No cloud at all: reads resolve "empty", writes
 *              no-op. Today's app, byte-for-byte — AND the full scheduler
 *              machinery (debounce, guards, flush-on-hide) runs against it
 *              in production, so the risky code soaks before Supabase lands.
 *   supabase — session A2. Same shape, real transport (keepalive fetch on
 *              pagehide — sendBeacon can't carry the auth header).
 *
 * The scriptable mock lives with the tests (src/__tests__/store-boot.test.js),
 * not here — it never belongs in the app bundle.
 */
import { supabase, sessionCache, SUPABASE_URL, SUPABASE_KEY } from './auth'

export function localBackend() {
  return {
    kind: 'local',
    // "Successfully read an empty cloud" — so the store's read-before-write
    // invariant is satisfied and the write path runs (as no-ops).
    async loadRemote() {
      return null
    },
    async saveRemote() {
      return true
    },
  }
}

/*
 * The real one (A2). Requires a signed-in session — the Boot gate guarantees
 * that before initStore(supabaseBackend()) ever runs.
 *
 * loadRemote goes through supabase-js (boot-time, no urgency). saveRemote
 * deliberately does NOT: it's a raw fetch with `keepalive: true` so the
 * pagehide flush survives the iPad home-button moment, built synchronously
 * from the cached token (an async token lookup inside a dying page is a race).
 * RLS scopes every request to the session's own row.
 */
export function supabaseBackend() {
  return {
    kind: 'supabase',
    async loadRemote() {
      const { data, error } = await supabase.from('saves').select('state').maybeSingle()
      if (error) throw error // failed read ≠ empty read — the store must know
      return data ? { state: data.state } : null
    },
    async saveRemote(blob) {
      const { token, uid } = sessionCache()
      if (!token || !uid) throw new Error('no-session')
      const res = await fetch(`${SUPABASE_URL}/rest/v1/saves?on_conflict=user_id`, {
        method: 'POST',
        keepalive: true, // the state blob is a few KB — well under keepalive's 64KB cap
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal', // upsert
        },
        body: JSON.stringify([{ user_id: uid, state: blob, updated_at: new Date().toISOString() }]),
      })
      if (!res.ok) throw new Error(`cloud push failed: ${res.status}`)
      return true
    },
  }
}
