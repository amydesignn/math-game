# The Feedback flow — data contract & agreed logic

_Written 2026-08-02 by Nathan, for Oscar's draft of the Luxi Math feedback popup.
Sources: the 2026-08-01 planning session, Finn's copy notes (2026-08-02), and the
guest-first / zero-PII posture in `docs/door-data-contract.md`._

Amy's second pre-publish gate: **understand real users before she networks and
posts to social.** This is the in-game, kid-facing feedback button — anonymous,
one-tap-friendly, COPPA-clean. It is a *different product* from the parent-survey
Airtable base ("Lumio User Feedback"), which is set aside, not deleted.

**How to read this:** everything under "The shape" is agreed and free to draw and
wire. Everything under "⚠️ Open / needs a decision" must be answered before it
ships — flagged inline where it bites.

---

## The one line that governs everything: zero PII

This is a children's app. The feedback flow **collects no name, no email, no age,
no account id** — the same line that keeps guest-first play clear of nearly the
whole COPPA / GDPR-K surface (`door-data-contract.md`, decision 1). A kid can tap
a mood and leave; anything they type is their choice, and the prompt copy tells
them *not* to type personal info. If a field would identify a child, it does not
go in this contract.

---

## The trigger — a "?" menu with THREE items

Finn's call (2026-08-02), and it settles the earlier 2-vs-3 question: **three**,
because Help and Feedback point in opposite directions and merging them starves
the data this feature exists to collect.

| Menu item | Kid-facing intent | What it does | Collects data? |
|---|---|---|---|
| **How to Play** | "I want to learn" | Static panel — how the game works | **No** |
| **Help** | "Something's broken or I'm stuck" | Static self-service panel — can't log in / stuck / what to do | **No** ⚠️ see below |
| **Feedback** | "I have ideas and feelings" | The feedback flow → one row in Supabase | **Yes — the only writer** |

**Only Feedback writes to the database.** How to Play and Help are static content.

### ✅ Help vs Feedback overlap (flag #2 — resolved)

"Help — something's broken" and the Feedback category "something's not working"
are two doors to the same feeling. Cleanest split, which this contract assumes:

- **Help = self-service.** A static panel that helps a stuck kid *right now*
  (sign-in trouble, how to get unstuck). Collects nothing.
- **Feedback → "something's not working" = a report** we store and act on.

**Resolved (Amy, 2026-08-02): Help is static, no capture** — Feedback stays the
only writer. (If that ever changes, Help becomes a second writer and the contract
grows a `source` field.)

The "?" affordance's placement (its own corner, or joining the top-left actions
zone) is Oscar's design call — the two-zone HUD is in `CLAUDE.md`.

---

## The shape — one Feedback submission

Three things a kid can give, in increasing effort. **Mood alone is a complete,
valid submission** (Finn: "one tap, no commitment").

| Part | Required? | Kid sees | Stored as |
|---|---|---|---|
| **Mood** | **Yes** (enables submit) | A 4-point one-tap scale | `mood` — smallint `1..4` |
| **Category** | No | One of four chips | `category` — stable id or null |
| **Message** | No | Free text, guarded prompt | `message` — text or null |

### Mood — keep exactly as is (Finn ✅)

One tap, four points. Four gives enough signal to chart without overwhelming.
**Store a stable rank `1..4`** (1 = most negative → 4 = most positive) so it
charts directly; the emoji/faces are Oscar's art, and the art can change without
breaking the data. The 1..4 mapping is the contract; the pictures are not.

### Category — the copy is Finn's, the ids are stable

Kids know when something's broken but "bug" is developer vocabulary. Finn's
kid-voiced labels, mapped to stable ids the client never shows:

| Stored id | Kid-facing label (Finn) |
|---|---|
| `not_working` | "something's not working" |
| `idea` | "I have an idea" |
| `confusing` | "something's confusing" |
| `love` | "I just love it" |

Single-select, optional. **Store the id, not the label** — so re-wording the copy
never orphans past rows.

### Message — free text is ON, with a guardrail (Finn)

Free text is enabled, but the prompt itself carries the no-PII guardrail.

**Chosen (Amy, 2026-08-02):** 💎 **"Tell us your dream feature! *No personal info please, just ideas.*"** — the most kid-shaped of Finn's three. (Not chosen: 🌟 "…even better?", 🎮 "…wish list?".)

**Message is length-capped** (≤ 500 chars, enforced client-side and by a DB check
constraint) — a cap keeps the store sane and blunts paste-floods.

### Silent auto-context — attached, never asked

Makes feedback *actionable* without asking the child anything. None of it
identifies a person.

| Field | Value | Why |
|---|---|---|
| `map` | world id (`clearing`/`town`/…/`door`) or null | "confusing" in which world? |
| `screen` | where opened (`world` / `door`) | context for the report |
| `mode` | `guest` or `account` | segment feedback; **NOT** the account id |
| `app_version` | build/commit string | which version was this |
| `created_at` | server `now()` | **server-authoritative** — never trust a client clock |

⚠️ **Decision baked in — `mode`, not `user_id`.** Even in account mode we store
only the string `"account"`, never the uid. The uid is a soft identifier and the
whole point is de-identified feedback. Flip only with a deliberate reason.

---

## The database — Supabase `feedback`, anon insert-only

Same project as the saves (`Math-app`, `lqcgagruudakeddkbeuj`). One table.

```sql
create table public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  mood        smallint not null check (mood between 1 and 4),
  category    text check (category in ('not_working','idea','confusing','love')),
  message     text check (message is null or char_length(message) <= 500),
  map         text,
  screen      text,
  mode        text check (mode in ('guest','account')),
  app_version text
);

alter table public.feedback enable row level security;

-- anon may INSERT only. No select/update/delete policy exists, so the client
-- can never read, edit, or delete anyone's feedback — including its own.
create policy "anon can submit feedback"
  on public.feedback for insert to anon
  with check (true);
```

**The write path = a raw `fetch` PostgREST insert with the publishable key** —
the exact pattern as `saveRemote` in `src/backend.js`. **No Vercel function, no
Airtable token in the browser.**

```
POST {SUPABASE_URL}/rest/v1/feedback
  apikey: <publishable key>            // public by design; RLS is the boundary
  Authorization: Bearer <publishable key>
  Content-Type: application/json
  Prefer: return=minimal
  body: { mood, category?, message?, map, screen, mode, app_version }
```

- **Both guest and account can submit** — the anon key inserts for everyone; no
  session needed. This is why a guest-first public app can still collect feedback.
- **On success:** show the thank-you. **On failure:** fail gently (a quiet "couldn't
  send — try again later"); do not block play, do not lose her place. First scope
  = best-effort, no offline retry queue (can add later if drops are real).

### ⚠️ The no-server tradeoff: an open insert surface

Anon insert-only means a hostile client could flood the table (there is no server
to gate it). Accepted for a low-traffic kids' game pre-launch; light mitigations,
in order of value:
- the `≤ 500` char cap (above),
- a **client-side throttle** (one submit per ~10s, and a one-tap-mood can't be
  spammed by holding),
- revisit a server-side rate-limit / captcha only if the weekly scan ever shows
  real spam. Not built v1 — flagged so it's a decision, not a surprise.

---

## The weekly scan → Airtable (curated triage, not a mirror)

Amy does **not** want Airtable mirroring the raw feed. Instead:

1. A **scheduled routine** (weekly) reads new `feedback` rows **via the service
   role** (server-side — never the anon client, which can't read).
2. It posts a **digest as a TABLE in the Break Room** (Amy, 2026-08-02) for all
   four of us — Amy, Nathan, Oscar, Finn — to review together: mood spread,
   category counts, notable messages, anything flagged.
3. From that table, **we feed the noticeable items into the Airtable `Triage`
   board by hand** (Amy: "then we will feed in Airtable easier") — human-driven
   promotion, sortable + prioritizable, not a mirror of the raw feed.

⚠️ **GUARD (Amy's ask):** the scan's hard dependency is now the **Break Room**
(Notion), not a live Airtable connector — feeding Airtable is a manual human step.
Still, if the scan can't post its digest (e.g. Notion unauthed in a headless run),
**flag Amy and reschedule — never fail silently** (connector-expiry aware — see
the memory note on Nathan's Space + connectors).

### ✅ Promotion target — the `Triage` table (built 2026-08-02)

A **`Triage` table** (`tbl4CSFe5siNG0otW`) now lives in the feedback base
(`appyP8DOihCQxN6lg`), fields mapped to this contract: Summary · Mood 1–4 ·
Category · Message · World · Mode · App version · Submitted At · Status ·
Priority · Assignee · Notes. The parent-survey table stays beside it. **Renaming
the base to "Luxi …" is still Amy's to do** — the table id is stable regardless.

### ✅ Digest delivery — a Break Room table (Amy, 2026-08-02)

The weekly digest is a **table posted in the Break Room**. The one wrinkle to pin
when we build the scan: headless/cron Notion auth (the connector isn't always
authed in a scheduled run) — hence the guard above.

---

## Agreed decisions (2026-08-01 → 08-02)

1. **Zero PII.** No name, email, age, or account id. The COPPA line.
2. **Three-item "?" menu** (Finn): How to Play · Help · Feedback. Only Feedback
   writes data.
3. **Two data tiers:** raw → Supabase `feedback` (anon insert-only); curated →
   Airtable via a weekly human-reviewed scan.
4. **Direct Supabase insert**, raw `fetch` + publishable key. No Vercel function,
   no Airtable token in the browser. (Replaced the earlier Express-server idea.)
5. **Mood is a valid submission on its own** (Finn). Category + message optional.
6. **Free text is ON** with a no-PII guardrail in the prompt (Finn).
7. **Store stable ids, not display copy** (mood rank, category id) — the words can
   change without orphaning data.
8. **The parent-survey base is set aside, not deleted** — Amy's to repurpose.

## Open questions (status)

1. ✅ **Free-text prompt** — 💎 "Tell us your dream feature!" (Amy, 08-02).
2. ✅ **Help = static** self-service, no capture (Amy, 08-02).
3. ✅ **Promotion target** — `Triage` table built in the feedback base (Amy, 08-02).
4. ✅ **Digest channel** — a table in the Break Room (Amy, 08-02).
5. ⏳ **Finn:** moderation pass on stored free text beyond the guardrail — Amy to
   ask; leaning fine so far.

**Nothing blocking Oscar's design lift.** Still Amy's, not a blocker: renaming the
feedback base to Luxi.
