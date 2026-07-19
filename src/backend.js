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
