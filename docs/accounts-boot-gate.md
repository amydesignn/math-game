# Phase A — Accounts & the async boot gate (design)

*Nathan, 2026-07-19. Design only — the build lands in sessions A1–A3 below.
Companion to the Notion roadmap page "👥 Accounts & Playing Together".
This is the heavy-thinking piece of Phase A: the store goes from synchronous
localStorage to cloud-backed **without a single consumer changing**, and without
ever being able to lose Ivy's save.*

---

## Invariants (the design is whatever satisfies these)

1. **The store's public API stays synchronous.** Six consumers (`App`, `math`,
   `stations`, `LevelBar`, `MathPopup`, scene code) call `getState()` and the
   mutators mid-frame and mid-event. Async lives only at the *edges* — boot and
   background persistence. The middle never changes.
2. **Ivy's save can never be silently lost or regressed.** The one catastrophic
   failure in this whole phase: booting with fresh/stale state and pushing it
   over the cloud save. Everything else is recoverable; this is not.
3. **Offline play always works.** iPad in the car. localStorage remains the
   device's source of truth; the cloud is sync + backup, not a gate to play.
4. **Zero observable change until Supabase actually wires in.** Everything is
   built behind a backend interface; the `local` backend reproduces today's
   behaviour exactly, so A1 deploys risk-free and soaks in production.

## Architecture

```
main.jsx   <Boot> gate — Loading → SignIn → <App>          (new, small)
store.js   sync API over in-memory `state` — UNCHANGED surface
           + initStore(): Promise   (hydrate, pick winner, migrate)
           + save(): sync localStorage write + debounced cloud push
backend.js { kind, loadRemote(), saveRemote(blob) }         (new)
           local: no-ops → today's app, byte-for-byte
           supabase: the real one (A2)
           mock (tests only): scriptable latency / failure / conflict
auth.js    session, magic-link flow (supabase-js)           (new, A2)
```

`store.js` module-init (`let state = load(); save()`) moves inside
`initStore()`. **Every exported function stays byte-identical** — which also
means near-zero merge friction with 5-B landing in parallel.

## Boot sequence

1. `<Boot>` mounts (inside `<Oops>`) → `initStore()`.
2. Read localStorage synchronously → candidate `local`. (Corrupt JSON no longer
   silently resets to fresh — with a cloud copy available, corrupt-local falls
   back to cloud first, fresh only if both are gone.)
3. **local backend:** hydrate from `local` (or fresh), run migrations, ready.
   Today's path, just relocated. Resolves in ~0ms — no visible loading state.
4. **supabase backend:** check session (supabase-js caches it in localStorage
   with auto-refresh — offline relaunch keeps a valid session).
   - No session → SignIn screen (see UX below).
   - Session → fetch cloud save, **~4s timeout**.
     - Fetch OK → pick winner (merge rule) → hydrate → `cloudSynced = true` →
       migrate → if local won, push it → ready.
     - Fetch fails/times out → hydrate from `local`, `cloudSynced = false`,
       ready (playable offline). **Cloud pushes stay disabled until a
       successful read happens** (background retry). This kills the
       empty-state-clobber race *by construction*: no session can ever write
       to the cloud without first having read it.

## The merge rule — which save wins

Single blob, last-write-wins is the accepted scope limit (one kid, one iPad).
But the winner is picked by the **monotonic ledger, not the clock**:

- `lifetimeGems` never decreases in legal play → **higher `lifetimeGems` wins**.
- Tie → later `lastActive` wins (skew is irrelevant when the ledgers tie).
- Why not the clock as primary? An iPad that lost its battery can carry a
  stale save with a future timestamp. The ledger is causal; the clock is not.

**Push guard:** any cloud push where `outgoing.lifetimeGems <
lastRead.lifetimeGems` is refused and logged loudly (dev). One legal
exception: `resetAll()` — it stamps `resetAt` and pushes with an explicit
force flag. Family scope; a DB-side guard can come with public launch.

## Write path

- `save()` stays synchronous: stamp `lastActive`, write localStorage —
  unchanged — plus one new line: `scheduleCloudPush()`.
- Push = trailing debounce **~2s**, flushed on `visibilitychange → hidden` and
  `pagehide` via **`fetch(…, { keepalive: true })`** (survives the iPad
  home-button moment; `sendBeacon` can't carry the auth header; keepalive's
  64KB body cap is plenty — the state blob is a few KB).
- Push failure → dirty flag, retry with backoff on next save / `online` /
  `visibilitychange → visible`. localStorage always holds truth, so a lost
  push costs nothing until the next successful one.

## Kid-facing UX states

- **Loading:** lilac cover matching the app, gem shimmer. Bounded by the 4s
  fetch timeout; typically sub-500ms.
- **Signed out:** *not an error tone* — "Ask Mum to open your world 💜" +
  a button that sends the magic link (to Amy's inbox; parent-held). This is
  the accidental-logout screen too (cleared site data, iOS storage reclaim).
- **Check your email:** after sending.
- Link expiry (~1h, single-use) needs no handling internally — the *session*
  persists and auto-refreshes for months once redeemed.

## ⚑ Guest mode — DECIDED (Amy, 2026-07-19): not building it

Unlike the Planner and Cozy Closet, math-game has never been shared beyond
the family — so there is no public demo to preserve. **Hard sign-in wall,
exactly two accounts, cloud sync is the whole point.** The `local` backend
still exists underneath (dev + tests run on it), so if the game is ever
shared later, guest mode is a one-line flip on the SignIn screen — recorded
here so it isn't re-derived, and deliberately not built now.

## ✅ Supabase setup DONE 2026-07-19 (Amy + Nathan via the supabase MCP)

Project **Math-app** `lqcgagruudakeddkbeuj` (us-west-2, free tier).
- **URL:** `https://lqcgagruudakeddkbeuj.supabase.co`
- **Publishable key** (client-side, public-by-design; prefer over legacy anon):
  `sb_publishable_QMEUCZ1wx1Hqff3ZC8aP_g_30HErHSa`
- **Users** (both confirmed): Amy `amyngo2k2@gmail.com`, Ivy `ivydesign2026@gmail.com`
- **`saves` table + RLS** created via migration `create_saves_table_with_rls`
  (select/insert/update own-row only, **no delete policy**).
- Migration `lock_down_rls_auto_enable_helper` sealed the dashboard's
  auto-RLS helper function (was API-callable — security advisor catch).
- Auth URL config: site = the Pages URL, `http://localhost:5180` in redirects.
- The **supabase MCP** is connected in Nathan's sessions — schema, SQL,
  logs and advisors are directly reachable; re-run `get_advisors` after
  any DDL. ⚠️ Remaining to verify in dashboard: **signups OFF**
  (Auth → Sign In / Providers) — MCP can't read that setting.

## The original setup checklist (kept for reference)

1. Create a free-tier project (closest region).
2. Auth → email provider ON, **"Allow new users to sign up" OFF** — the
   allowlist by construction. Create the two users (Amy + Ivy's emails, both
   Amy's inboxes) manually in the dashboard.
3. `saves` table: `user_id uuid primary key references auth.users`,
   `state jsonb`, `updated_at timestamptz`. RLS on: `auth.uid() = user_id`
   for select/insert/update.
4. Auth → Redirect URLs: add `https://amydesignn.github.io/math-game/`.
5. Hand Nathan the project URL + anon key (both public-by-design values —
   RLS is the security boundary; fine in a public repo).

## Test plan — race fixtures (vitest + mock backend)

Same CI treatment as the C1 calibration set and Finn's threshold table:
the dangerous interleavings become the literal test file, `npm test` gates
the deploy.

1. Fresh device + cloud save exists → cloud wins, zero pushes.
2. Cloud empty + local save → local wins, pushed exactly once.
3. Both exist, local ahead (a push failed last session) → local wins.
4. Both exist, cloud ahead (new iPad) → cloud wins, localStorage replaced.
5. Fetch fails → local hydrate, pushes disabled; the background retry
   succeeds → compare-then-push. **5b.** Read slower than the boot timeout →
   treated exactly as a failed read.
6. **The clobber attempt:** fresh state + a storm of `save()` calls before the
   fetch resolves → assert **zero** cloud writes until a read has succeeded.
7. Regression guard: push with lower `lifetimeGems` refused + logged.
8. `resetAll()` → the one allowed regression (force flag), and the guard
   baseline resets so future pushes flow again.
9. Migrations (cap refund, ledger seed) run once on the *winning* state —
   adopted cloud saves migrate through the same path as local ones.
10. Rapid saves coalesce into one debounced push.

*Built as `src/__tests__/store-boot.test.js` (11 tests). Failure-mode proof:
the suite was run against sabotaged code — removing ONE invariant gate
changes nothing (the read-before-write invariant is enforced at both
`scheduleCloudPush` and `flushCloudNow`, deliberate defense in depth);
removing BOTH fails fixtures 5/5b/6. The tests genuinely guard the design.*

After implementation: an adversarial verification workflow — parallel agents
each trying to construct a data-loss interleaving against the real code.

## Sequencing

| Session | What | Needs Amy? |
|---|---|---|
| **A1** | backend interface + `initStore` + `<Boot>` + local backend + mock + all 10 race fixtures. Deploy (zero visible change — the risky code soaks in prod). | No |
| **A2** | Supabase project + `supabase` backend + auth screens + magic link, verified end-to-end with a test account first. | Yes — the 5-min setup + guest-mode call |
| **A3** | Real-iPad QA: pagehide flush, offline boot, accidental-logout UX, then the family's two real accounts. | Ivy's iPad for an afternoon |

## Later, explicitly out of scope here

Two-device conflict resolution beyond the blob (needs per-field merge),
public signups (expiry UX, rate limits, moderation), and Phase B's realtime
channel — which reuses this auth but shares **no** state machinery, since the
shared space deliberately has no shared mutable state.
