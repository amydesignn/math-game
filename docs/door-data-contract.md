# The Door — data contract & agreed logic

_Written 2026-07-30 by Nathan, for Oscar's next draft of the Lumio Math door.
Source of truth: `src/store.js`, `src/levels.js`, `src/maps.js`._

The door is the hub screen a player lands on before entering a world. Amy's
first sketch went to Nathan rather than Oscar because most of the questions were
about plumbing. This document is the answer, so the next draft can be drawn
against what the app actually knows.

**How to read this:** anything under "What the door can know" exists today and is
free to display. Anything under "What does not exist" has to be invented, cut, or
scheduled — none of it can simply be drawn and wired up.

---

## ⚠️ The mismatch to avoid (why this doc exists)

The sketch showed **"Level 12 Explorer · 650 / 1000 XP"**. The game has no XP and
no 1000-point levels. Levels come from **`lifetimeGems`**, on Amy's canonical
rule (`src/levels.js`):

```
50 points per level below Level 10, 100 per level at 10 and above
requiredFor(L) = L <= 10 ? 50 * (L - 1) : 450 + 100 * (L - 10)
```

Amy is Level 2 at 56 points. Ivy is at 248.

If the door invents its own progression, a player sees **two different level
numbers for the same play** — which is the exact trap Finn caught earlier, when
"level" was silently doing two jobs (topic rung vs player level). One number, one
origin. The door must call `levelState()` / `levelOf()` from `src/levels.js`, the
same functions the in-game level bar uses.

This is not a nitpick about a placeholder — it's the one class of mistake that is
invisible in a mock and obvious to a child.

---

## What the door can know

Every field below is live in `store.js` today.

| What you want to show | Field | Notes |
|---|---|---|
| Player level | `levelOf(lifetimeGems)` | Never store a separate level. Derive it. |
| Progress to next level | `levelState(lifetimeGems)` → `{level, into, need}` | `into`/`need` gives the bar its fill |
| Total points earned | `lifetimeGems` | Never decremented by spending — it's her permanent record |
| Points display above 1,000 | `fmtPoints(p)` | Amy's rule: exact under 1K, then `1K`, `1.2K` |
| Spendable gems | `gems` | The wallet. Different from `lifetimeGems` — do not conflate |
| Which world to resume | `map` | One of `clearing` · `town` · `garden` · `market` · `arcade` |
| Her character | `character` | Default `character-female-a` |
| Her pet | `pet` | Default `animal-cat` |
| Things she owns | `owned` (unplaced) + `world` (placed) | Counts are safe to show |
| Active sparkle trail | `sparkle` → `{colorId, expiresAt}` or `null` | Timed consumable |
| Today's quests | `stations.byMap` | See the refresh note below |
| Topic progress | `topicProgress` | Counts only — **never accuracy**, see Principle 4 |
| Sound on/off | `soundOn` | Already has a real home in the in-game HUD |

### The five worlds (real ids and names)

| id | Name |
|---|---|
| `clearing` | Forest Clearing |
| `town` | Sunny Town |
| `garden` | Rosy Garden |
| `market` | Merry Market |
| `arcade` | Star Arcade |

Names and art are open to rework — these are just what exists now. **The ids are
what the door hands back to the game**, so a rename is a label change, not a
data change.

### ⚠️ `meadow` is not a sixth world

`meadow` ("The Meadow", `together: true`) is the **Together Space** — the shared
two-player room, entered by the 💞 button. It has no gems, no quests, no shop,
and it is deliberately never saved, so nobody can resume into a shared room. It
must not appear as a normal playable world. If the door wants a soft-grass
meadow, **that name needs to belong to one thing only** — rename one of them.

### ⚠️ "Daily Challenge" refreshes every 3 hours, not daily

`stations` rebuilds every `REFRESH.periodHours` (default **3h**), picking 2–3
worlds for themed quests. That cadence exists because Ivy exhausted a whole day's
content in one sitting. A label saying "Daily" would be untrue eight times a day
— call it *Today's quests*, *Right now*, or similar.

The good news: this means quest copy like "Visit Sunny Town to earn gems" can be
**real on day one**, not a placeholder.

---

## What does not exist

None of these can be wired up without new work. They're fine to draw as
deliberate placeholders — just not as things that will light up on lift.

| In the sketch | Reality |
|---|---|
| **XP / 1000-point levels** | No such system. Use `lifetimeGems`. See above. |
| **"Explorer" / level titles** | No title system. New if we want it — must not collide with `STAGE_LABELS` (Warm-up/Challenge/Expert), which is *difficulty* and which the player never sees. |
| **Player name** | No display name field anywhere. |
| **Profile picture / avatar** | No avatar system. (Her `character` is a 3D model, not a portrait.) |
| **"Welcome back, player!"** | Fine as copy, but there is no name to personalise it with. |
| **Settings panel** | Nothing behind it. Agreed: leave the *space*, don't paint a dead button. |
| **Worlds shown in sketch** | Number Reef, Crystal Caves, Frost Peak, Mushroom Hollow don't exist. Building one is a whole map (there's a `wander-world` skill for it). |
| **"Unlock at Level 15"** | No unlock system. New if we want it. |
| **Occupancy count ("Full 20/20")** | You currently only learn who's in the meadow *by joining it*. Showing a count from outside needs its own lightweight channel. Roadmap. |

---

## The three states

Agreed with Amy 2026-07-30. **Same experience for everyone — Continue is purely
additive.**

| State | Stats? | Name? | The door shows |
|---|---|---|---|
| **New** | no | no | "Player" · no stats · **Play** on the world cards. No Continue — there's nothing to continue. |
| **Returning guest** | **yes** (localStorage) | no | stats · "Player" · **Continue** + the same Play buttons |
| **Returning account** | yes (cloud) | yes | stats · real name · **Continue** · Meadow available |

**Continue** resumes `map` — the world she was last in. This already works:
`store.map` is persisted on every gate travel, and boot reads it back, falling
back to Forest Clearing if it's unrecognised.

**Play on a world card** jumps straight there. This also already works —
`travel(id)` accepts any world, not just adjacent ones, and lands the player at
the connecting gate or at the map centre when there isn't one. **No new logic
needed**, and the jump becomes her new saved world.

---

## Agreed decisions (2026-07-30)

1. **Guest-first.** Default straight into play, progress in localStorage, nothing
   collected. This is what keeps a children's app clear of nearly the whole
   COPPA / GDPR-K surface.
2. **No public accounts at launch.** Account creation is disabled server-side
   (`shouldCreateUser: false`) and the allowlist is two family inboxes. Offering
   sign-up publicly means collecting children's email addresses — the exact
   surface guest-first avoids. Pocketed, rolled out later as its own chapter.
3. **But don't be silent about saving.** A player who can't find a way to keep
   their world will assume they missed something. One quiet honest line —
   *"Your world is saved on this device"* — answers the question without
   collecting anything. That line is where the account offer naturally goes later.
4. **The Meadow stays family-only for now**, released later as a gift rather than
   opened by default. Reasons, in order of how hard they are to change: it is
   literally **one hardcoded room** (`MEADOW_TOPIC = 'family-meadow'`, no
   sharding); it is `private: true` with RLS restricted to authenticated users,
   so guests structurally cannot join; and a public shared space is a different
   duty of care from a single-player maths game. The door should show it as
   locked — mirroring the boundary the database already enforces, rather than
   inventing new access control.
5. **Meadow capacity, when it ships:** cap around **20** (Amy's call — a busy
   meadow is fun, and kids like a bit of chaos). The engineering answer is to
   decouple *present* from *fully animated* — render the nearest handful as full
   characters and the rest much more cheaply, so the room reads as full without
   20 skinned meshes and animation mixers running on an iPad. Make the cap
   **soft**, not hard: a hard limit needs a server-side arbiter that doesn't
   exist, and nobody is harmed by 22 kids in a field.
6. **Settings:** keep the layout slot, don't ship a dead control.
7. **Guest progress must stay adoptable.** When accounts do arrive, signing in
   has to *adopt* a guest's world, not replace it. The boot gate's merge rule
   already does this — higher `lifetimeGems` wins — so this is a seam to protect,
   not build.

## The three open questions — answered (Amy, 2026-07-30)

1. **A way back to the door: yes.** Oscar decides the control; not urgent.
2. **The name is "Lumio Math"** — Ivy picked it herself.
3. **The five existing worlds keep their names.** The sketch's world names were
   vibe, not a rename. Their real names, palettes and contents are in
   **`docs/worlds-reference.md`** — that's the sheet for the world cards.
