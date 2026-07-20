# Phase B — The Together Space (design)

*Nathan, 2026-07-19. Design + build in one session (Amy: "we can start Phase B").
Companion to `docs/accounts-boot-gate.md` (Phase A) and the Notion roadmap page
"👥 Accounts & Playing Together". Phase B reuses Phase A's auth and shares
**none** of its state machinery — that separation is a safety property, not an
accident (see Invariant 1).*

---

## Amy's framing IS the architecture

Recorded 2026-07-19 on the roadmap page, load-bearing here:

- **The shared space is entered by mutual agreement only — never a room you
  sit in waiting.** The agreement happens in the living room ("want to play
  together?"), not in the app. So there is no invite handshake, no lobby, no
  who's-online surface, no presence indicator anywhere in the solo game.
- **The session IS the room.** Nothing about the meadow persists — not in the
  store, not in the cloud. Close the app in the meadow and you reopen at home.
- **Solo is the normal state.** "Ivy needs to learn both company and be okay
  on her own. That is a skill, that is not teaching dependency." The meadow is
  a place you visit together, not a place the game nudges you toward.
- **No build, no shop, no math, no earning** in the shared space ("Mum took my
  gem" is a bad afternoon). **Emotes only, no free text** (free text is a
  moderation surface and the hardest thing to remove before a public release).

## Invariants (the design is whatever satisfies these)

1. **The Together Space never writes game state.** No store mutation is
   reachable from the meadow: no gems, no placement, no map persistence, no
   topicProgress. Corollary: *no netcode bug can ever touch Ivy's save.* The
   cloud-save machinery (Phase A) and the realtime channel (Phase B) share
   auth and nothing else.
2. **Private by construction.** The repo is public and the publishable key is
   in it — so the channel must refuse any client that is not one of the two
   signed-in family accounts. A child's live play presence is not broadcast to
   the internet. (Live-verifiable: a bare-publishable-key subscribe must fail.)
3. **A vanished buddy is a quiet event, not an error.** Networks drop, iPads
   sleep, tabs get backgrounded. The buddy fades out with a friendly toast;
   the world never breaks, blocks, or shows an error tone.
4. **The solo game is byte-identical when the meadow is closed.** No realtime
   connection exists outside the meadow. Entering is the only thing that
   connects; leaving disconnects. (Also: supabase-realtime never loads in the
   test import graph — the A2 CI lesson stands.)

## The core design: replicate taps, not positions

Movement here is tap-to-move: a straight line toward a target at constant
`WORLD.characterSpeed`, identical math on both clients (`stepToward`, extracted
from Character.jsx's walk). That makes movement **deterministic given the
target** — so the channel carries *intentions*, not telemetry:

- On every tap: `move { x, z, tx, tz }` (where I am, where I'm headed).
- On arrival/stop: the same message with `tx == null`.
- Every ~3s while in the meadow: the same message as a **keyframe** (drift
  correction + late-joiner catch-up).

The receiving side runs the same walk sim on the buddy. Both sims converge on
the same target regardless of transient latency, so errors are self-healing:
worst-case divergence is `latency × speed` (~0.3–1 units), then gone on
arrival. Correction rule: on any message, if the sim is within `SNAP_DIST`
(2.5 units) of the reported position, keep the sim (smooth); beyond that,
snap (teleport beats rubber-banding — and it only happens after a real
disruption, e.g. a backgrounded tab waking up).

**The pet is never synced.** It follows its owner's character with the local
follow logic, exactly like the player's own pet. Two characters, two pets,
one message stream per player, a few messages a minute.

Message volume: taps + emotes + a 3s keyframe ≈ 25 msg/min/player. A daily
half-hour meadow ≈ 50k msg/month — free tier allows 2M. Not a constraint.

## Protocol (broadcast events on topic `family-meadow`)

Every payload carries `k` (session key — random per tab, NOT the uid: the
same account in two tabs must not collide) and is ignored if `k` is our own.

| event | payload | meaning |
|---|---|---|
| `move` | `{ k, x, z, tx, tz }` | position + current walk target (`tx:null` = standing) |
| `emote` | `{ k, kind }` | one of the emote set — bubble + emote-yes anim |

**Roster = Supabase presence** (join/leave for free). Each client `track()`s
its profile: `{ k, label, character, pet, sparkle }`.
- `label` is derived from the session's own email → `Mum` / `Ivy` (baked-in
  family mapping, public-release seam: unknown email → `Friend`).
- `sparkle` = active sparkle colorId or null — cosmetics are FOR showing Mum,
  so the trail renders on the buddy too. Refreshed by re-track on change; the
  buddy's expiry is cosmetic-only (no store write — Invariant 1).
- Presence join → toast "💜 Mum is here!"; leave → "👋 Mum went home". The
  buddy renders for every roster entry that isn't our own session key (robust
  to the same-account-two-devices case: you'd just see two buddies).

## Transports (the backend.js pattern, again)

`src/together.js` exports `meadowTransport()`:

- **supabase** (prod, and dev with `?cloud`): private broadcast channel via
  the lazily-created auth client. `config: { private: true }` — server
  refuses without RLS authorization (see Security).
- **dev** (default in dev): a `BroadcastChannel('meadow-dev')` between tabs
  of the same origin — two-tab pane QA with no accounts, and it exercises
  the full protocol + sim + UI. Presence is emulated with hello/bye messages.
- **test**: scriptable in-memory transport, lives with the tests.

The store never imports together.js; together.js touches auth only inside the
supabase transport factory (lazy — the CI Node-WebSocket lesson, A2).

## Security

RLS policies on `realtime.messages` (migration via the supabase MCP):
authenticated role may SELECT (receive) and INSERT (send) where
`realtime.topic() = 'family-meadow'` and extension in (broadcast, presence).
No anon policy → a publishable-key-only client gets CHANNEL_ERROR on
subscribe. Only our two accounts exist (signups OFF), so "authenticated" ==
the family. `setAuth` is called before subscribe so the socket carries the
user JWT, and on auth refresh.

**Verified live 2026-07-19:** anon private join refused — realtime log reads
"Unauthorized: You do not have permissions to read from this Channel topic:
family-meadow". **And Amy disabled "Allow public access" in Realtime
Settings same evening** (screenshot-confirmed), so only private channels
exist project-wide: the `private:false` public-plane bypass is sealed at the
server. (First probe also surfaced a cold-start "MissingPartition" transient
while the realtime tenant initialized — it self-heals; a friendly retry
covers it in the unlikely event a family join ever hits a cold tenant.)

## UX

- **HUD button 💞** (bottom-left, opposite the shop): enters the meadow.
  In the meadow it becomes **🏡 Home** — same spot, same size. That's the
  whole surface area in the solo game: one button, no status, no badge.
- **The Meadow**: a new map (`together: true`) OUTSIDE the ring — lavender
  ground, light forest decor, no gates, no sparkles, no stations, no shop
  button, no placement. Spawns: host-side deterministic small offsets so the
  two never spawn inside each other.
- **Emotes**: a 4-button bar, bottom-center, meadow-only: 👋 💜 🎉 😄.
  Tap → bubble above your character + `emote-yes`, broadcast to the buddy.
  No text anywhere.
- **Entering alone is fine** (someone is always first): the meadow is a
  pleasant small place, not a waiting room — no spinner, no "waiting for…",
  you just are there, and can leave any time. When the buddy arrives, the
  toast + the appearance are the event.
- **Buddy name tag**: small soft label ("Mum 💜") above the buddy only —
  the one place a word appears in the world, because two players may have
  identical characters.
- Minimap: buddy drawn as a warm pink dot.
- Level popups: can't trigger in the meadow (no earning); the retroactive
  queue simply waits (worldBusy includes the meadow) so a signed card is
  never half-read mid-visit.

## Failure modes (decided, not discovered)

| failure | behaviour |
|---|---|
| buddy tab backgrounded | keyframes stop; buddy idles at last target; presence timeout eventually fires leave → quiet goodbye toast |
| own network drops | buddy fades with goodbye toast when presence errors; the meadow itself keeps working locally; leaving is always possible (it's local) |
| subscribe fails (offline / refused) | friendly note "The meadow isn't reachable right now 💜", stay home; never an error screen |
| same account, two tabs | two session keys → both render as buddies; harmless by design |
| message before hello/roster | buffer-free: a `move` for an unknown `k` is held as pending-first-keyframe; presence sync fills the profile |
| app closed in meadow | nothing persisted → next boot at home map (session IS the room) |

## QA plan

1. **Unit fixtures** (`src/__tests__/together.test.js`): sim convergence
   under latency, the snap rule, roster reducer (join/leave/rejoin, self
   filtered, duplicate keys), emote pass-through, label mapping. Same CI
   treatment as the race fixtures — `npm test` gates the deploy.
2. **Two-tab pane QA** on the dev transport: join/leave toasts, replicated
   walks, emotes, minimap dot.
3. **Live security check**: bare publishable-key subscribe to
   `family-meadow` must be refused (verifiable without an account).
4. **Adversarial verification workflow** (the A-doc's promise): parallel
   agents attacking the join/leave/rejoin races, the two-tab case, hidden-tab
   throttling, and Invariant 1 (grep-proof: no store writes reachable from
   meadow code).
5. The real thing: Amy + Ivy, two devices, one meadow. 💜

## Explicitly out of scope (parked, recorded so it isn't re-derived)

- **Phase C visiting** (walk in each other's worlds, read-only) — builds on
  this channel + `ownerId` on placed objects; only if Ivy asks.
- Shared building & the build-ownership rules (Amy's: whoever builds first,
  the other cannot remove; owner can move/put away their OWN).
- More than two players, spectating, voice, text chat (never, pre-public).
- Meadow decoration/upgrades (would create shared mutable state).
