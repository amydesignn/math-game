# Publishing to lumio.land — status & handoff

_Last updated: 2026-07-29, evening (Amy + Nathan) — apex redirect live, auth
working on the new domain, favicon shipped._

The record of taking Ivy's Math World from a sandbox build to a real public
product. Read this first if you're picking the work up in a new session.

---

## The goal

`lumio.land` is the permanent home for the family's kid apps — **one town, many
games**. Real domain, real users, traffic counted from day one. Amy bought the
domain deliberately rather than starting on a subdomain of `amyngo.ai`, so that
users, links, and traffic history never have to migrate later.

**Naming pattern:** each app gets its own subdomain of `lumio.land`.
`lumio.land` itself stays reserved for a future arcade landing page.

---

## What is DONE ✅

| Piece | Detail |
|---|---|
| Domain | **`lumio.land`** bought at **Cloudflare Registrar** (at-cost renewal, ~$32/yr, no first-year-promo trap) |
| Host | **Vercel**, team `AmyNgo` (Hobby / free), project `math-game` |
| Git link | Vercel ↔ `github.com/amydesignn/math-game` — **every push to `main` auto-deploys to production** |
| Live URL | **https://math.lumio.land** — HTTPS valid, verified 200 end-to-end |
| Analytics | `@vercel/analytics` wired in `src/main.jsx` (commit `797f07c`) |
| Apex + www | `lumio.land` / `www.lumio.land` → **302** → `math.lumio.land` (verified 2026-07-29) |
| Auth on the new domain | Supabase redirect allowlist + Site URL updated; **full magic-link round-trip verified from `math.lumio.land`** (2026-07-29 22:12 UTC) |
| Favicon | `public/favicon.svg` — Amy's gem mark, the same gem the game pays in |

### DNS records (in Cloudflare, `lumio.land` zone)

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `math` | `92baac53b29db479.vercel-dns-017.com` | **DNS only** (grey cloud) |
| AAAA | `@` | `100::` | **Proxied** (orange cloud) |
| AAAA | `www` | `100::` | **Proxied** (orange cloud) |

> ⚠️ **Grey cloud is mandatory for Vercel-pointed records.** If Cloudflare
> proxying is ON (orange cloud), Vercel cannot verify the domain or issue the
> HTTPS cert. Cloudflare's dashboard actively nags you to enable proxying —
> **ignore that banner** for Vercel-pointed records.

> ⚠️ **The apex and `www` records are the exception — they MUST be orange.**
> They exist only so a Redirect Rule has something to attach to; `100::` is the
> IPv6 discard address and nothing is ever served from it. Cloudflare can only
> run a redirect on traffic it proxies, so grey cloud there breaks the redirect.
> Do not "fix" these to grey to match the rule above.

### The apex redirect (Rules → Redirect Rules)

One rule, named `apex + www → math`, matching **both** hostnames:

```
http.host in {"lumio.land" "www.lumio.land"}
```

Then: **Static** · `https://math.lumio.land` · **302 — Temporary Redirect**.

**302, not 301, deliberately.** The apex is reserved for a future arcade landing
page. A 301 is cached by browsers for months, so returning visitors would keep
being bounced to `math.` long after the landing page exists.

> ⚠️ **Two ways to break this rule, both silent:**
> 1. **`and` instead of `or`.** Building the condition as two rows joined by
>    **And** produces `http.host in {"lumio.land"} and http.host in
>    {"www.lumio.land"}` — a hostname can never be both, so the rule matches
>    nothing while still reporting **Active**. The symptom is **HTTP 522** on the
>    apex: no redirect fires, so Cloudflare tries to reach `100::` and times out.
>    The fix is one condition with both values in the set, as above. (Hit and
>    fixed 2026-07-29.)
> 2. **A wildcard or `contains` match.** Anything matching `*lumio.land` also
>    catches `math.lumio.land` and redirects it to itself — an infinite loop that
>    takes the live app down. Exact hostnames only.

Verify from outside the dashboard, because the rule list's "Match against"
column can show stale text after an edit:

```bash
curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://lumio.land
curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://www.lumio.land
curl -sS -o /dev/null -w "math: %{http_code}\n" -L https://math.lumio.land   # must stay 200
```

### Auth on a new domain (do this for every app you add)

`src/auth.js` builds the magic-link return address from wherever the user is:
`emailRedirectTo: window.location.origin + import.meta.env.BASE_URL`. So a new
domain needs **two** Supabase changes or logins silently land on the old host:

1. **Authentication → URL Configuration → Redirect URLs** — add
   `https://<app>.lumio.land/**` (the `/**` matters). **Keep the old URL** while
   both copies are live.
2. **Site URL** → the new domain. This is the fallback when a redirect isn't
   allowlisted, and it's the reason a login *begun* on the new domain can bounce
   back to the old one.

Ground truth is the auth log, not the browser: Supabase → Logs → Auth, and check
the `referer` field on `/otp` and `/verify`. Or via the supabase MCP,
`get_logs(service:'auth')`.

> ⚠️ **The built-in SMTP is rate-limited** (`429 over_email_send_rate_limit`
> after a handful of sends in an hour). A burst of "send me the key" taps will
> lock you out for a while — that's the throttle, not a broken config. It is also
> a real argument for guest-first: the magic link must never be the front door
> for a public app.

### Build config gotcha

`vite.config.js` sets `base` from `process.env.DEPLOY_TARGET`:

- **default → `/`** — used by Vercel, dev, and preview
- **`DEPLOY_TARGET=pages` → `/math-game/`** — set only in
  `.github/workflows/deploy.yml`, so GitHub Pages keeps working

If assets ever 404 on the live domain, this is the first thing to check.

---

## What is NEXT ⬜

### 1. Guest-first door (the big one)

**The problem:** `math.lumio.land` currently opens on the **"Ask Mum to open
your world"** magic-link wall. Any visiting kid hits an email gate before they
can play.

**The decision Amy made:** **one app, two doors.**
- **Default = guest**, boots straight into play, no gate, progress saved locally
- **"Log in / Save my world"** sits off to the side and opens the existing
  magic-key flow for cross-device saving

**Why it matters beyond UX:** guest-first keeps the public app collecting **no
personal data**, which sidesteps almost the entire COPPA / GDPR-K surface for a
children's app. This is the same pattern minefun.io uses (verified 2026-07-29):
anonymous auto-guest, play instantly, optional account *linking* to avoid losing
progress. Their heavy consent machinery exists because of **ads + tracking**,
not because of kids.

**⚠️ Read before starting:** `src/main.jsx` carries a prior decision —
_"production is the hard sign-in wall — exactly two accounts, cloud sync is the
whole point (DECIDED: no guest mode; the one-line flip lives on the SignIn
screen if that ever changes)"_ — and `docs/accounts-boot-gate.md` has the
Phase A2 reasoning. **That decision was made when this was a family-only app.**
Going public changes the premise, so the reversal is intentional, not a mistake.
Keep the signed-in path fully intact — Ivy's own cloud save must not regress.

### 2. Turn Analytics on in the dashboard — ✅ DONE 2026-08-01

Amy flipped **Vercel → project `math-game` → Analytics → Enable**. The package
(`@vercel/analytics`, `<Analytics/>` in `src/main.jsx`) was already live from
2026-07-29, so both halves are now in place and data collects on the next
visits. Note: the "Get Started" placeholder panel shows until Vercel receives
its first event — it is NOT a sign anything is missing. Caveat: an ad/content
blocker in your OWN browser can block the beacon, so your own visit may not
register (real visitors without blockers still count); test in a private window
for a clean self-check.

### 3. Retire the GitHub Pages copy — ✅ DONE 2026-08-01 (as a redirect)

`amydesignn.github.io/math-game/` was live and auto-deploying a SECOND copy of
the game in parallel — splitting traffic numbers and confusing search. Retired
2026-08-01 (commit `d76bdbd`): the Pages workflow (`.github/workflows/deploy.yml`)
no longer builds the app — it now publishes a tiny **redirect** to
`https://math.lumio.land/` (canonical tag + `robots noindex` so search
consolidates; no-JS `<meta refresh>` fallback + JS `location.replace` that
carries `?query`/`#hash`). Verified live: the old URL serves the redirect,
`math.lumio.land` still serves the app. To FULLY un-publish instead (if ever
wanted): repo Settings → Pages → disable.

**Why redirect, not takedown:** the original worry below was a *dead bookmark*.
A redirect eliminates that failure mode entirely — an old bookmark now bounces
cleanly to the real home instead of 404ing.

**⚠️ RESIDUAL, still true — the save, not the bookmark (flag for Amy):** saves
are localStorage-per-origin and the public app defaults to **guest** (account is
behind `?account`). Ivy's real progress lives in her Supabase cloud row (written
from `github.io`); the cloud is the source of truth, so **nothing is lost**. But
until she signs in on the NEW domain, her old bookmark now lands her on a
`math.lumio.land` **guest world (0 gems)**, not her real one. The one-time fix:
open **`math.lumio.land/?account`** on Ivy's iPad and sign her in — the cloud row
loads and her gems are there. This migration step is unchanged by the redirect;
the redirect just made the pre-migration state "guest world" instead of "dead
link."

Sign-in status: **Amy ✅** on `math.lumio.land` (auth log, cloud write 2026-07-29
22:15 UTC). **Ivy — confirm** (last recorded cloud write was from `github.io`;
verify she's since signed in on the new domain, else do the `?account` step above
on her iPad).

### 4. iPad home-screen icon (small, needs an asset)

`public/favicon.svg` covers browser tabs and bookmarks. The **home-screen** icon
needs `apple-touch-icon` pointing at a **180×180 PNG** — iOS will not accept an
SVG. Until it exists, "Add to Home Screen" on Ivy's iPad shows a *screenshot of
the page* instead of the gem, and the iPad is how she actually plays. There is no
SVG→PNG converter installed on Amy's machine, so this needs a 180×180 export from
the design tool; wiring it up afterwards is one `<link>` tag.

### 5. Later / when there's demand

- Arcade landing page at `lumio.land` itself
- `planner.lumio.land` for Ivy's Planner (same recipe as this doc)
- Real accounts for public users → **get a proper legal read first** (kids'
  data). Staying guest-only + ad-free avoids nearly all of it.

---

## Recipe: adding the next app to lumio.land

1. Make sure the app's Vite `base` is `/` for the Vercel build
2. Vercel → **Add New → Project → Import** the GitHub repo (preset auto-detects)
3. Project → **Settings → Domains** (the sidebar 🌐 item — *not* the `+` search
   popup, which is Vercel's domain **shop** and won't find domains you already
   own) → add `<app>.lumio.land`
4. Copy the CNAME it gives you into Cloudflare, **grey cloud**
5. Verify independently, don't just trust the dashboard:
   ```bash
   dig +short CNAME <app>.lumio.land @1.1.1.1
   curl -sS -o /dev/null -w "%{http_code}\n" -L https://<app>.lumio.land
   ```
