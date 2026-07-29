# Publishing to lumio.land — status & handoff

_Last updated: 2026-07-29 (Amy + Nathan)_

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

### DNS record (in Cloudflare, `lumio.land` zone)

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `math` | `92baac53b29db479.vercel-dns-017.com` | **DNS only** (grey cloud) |

> ⚠️ **The grey cloud is mandatory.** If Cloudflare proxying is ON (orange
> cloud), Vercel cannot verify the domain or issue the HTTPS cert. Cloudflare's
> dashboard actively nags you to enable proxying — **ignore that banner** for
> Vercel-pointed records.

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

### 2. Turn Analytics on in the dashboard

The package now ships in the bundle, but the project toggle still needs
flipping: **Vercel → project `math-game` → Analytics → Enable**.
(Both halves are required — package *and* toggle.)

### 3. Retire the GitHub Pages copy

`amydesignn.github.io/math-game/` is **still live and still auto-deploying** in
parallel. Two live copies split traffic numbers and confuse search engines.
Once `math.lumio.land` has been stable a while, retire the Pages workflow so
there is one true home. Not urgent; do it as a deliberate step.

### 4. Later / when there's demand

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
