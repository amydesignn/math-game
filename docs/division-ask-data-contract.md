# The Division Ask — data contract & agreed logic

_Written 2026-08-22 by Nathan, for Oscar's draft of the long-division
calculation screen (C2). Source of truth: `src/math.js`, `src/ui/MathPopup.jsx`,
`src/ui/mathkit.jsx`._

This is the screen where Ivy **enters her answer to a division problem**. It is
the one piece of C2 that was never designed — Finn's C2 spec lists "UI ✅ live,"
but that refers to (a) the multiplication ask screen and (b) Oscar's already-built
long-division **recovery walkthrough** ("Let's share the candy"). Neither lets her
type a division answer. This doc is the answer, so the draft can be drawn against
what the app actually produces and expects.

**How to read this:** anything under "What the screen receives" is data the
generator (Nathan, in progress) will hand the component. Anything under "The open
design question" is genuinely undecided and is what this draft is for.

---

## ⚠️ The mismatch to avoid (why this doc exists)

Every other problem in the game has a **single-number answer** — `48 × 7 = 336`.
The ask screen is one equation row and one number keypad, and correctness is
`Number(entry) === answer`.

**A division answer is two numbers: a quotient AND a remainder.** `85 ÷ 4 = 21 R 1`.
`solve()` in `math.js` deliberately does not handle `÷` for exactly this reason.
So the existing single-entry ask screen **cannot represent a division answer** —
this screen needs its own input model, and that is the whole design task.

If the draft reuses the single-number entry, half of every division answer (the
remainder) has nowhere to go.

---

## What the screen receives

The generator emits a `long-div` problem shaped like this (Nathan is building it
now, to Finn's C2 spec):

```js
{
  type: 'long-div',
  op: '÷',
  a: 85,            // dividend  (Phase 1: 2-digit 10–99 · Phase 2: 3-digit 100–999)
  b: 4,             // divisor   (1-digit, 2–9)
  quotient: 21,     // the expected quotient
  remainder: 1,     // the expected remainder (0 when it divides evenly)
  sneakyZero: false,// true if the quotient has a 0 in a non-leading place (e.g. 815÷4=203)
  grade: 5,         // 5 = Phase 1 · 6 = Phase 2 (data-model tag, not shown to Ivy)
  gems: 1,          // payout — Phase 1: 1 · Phase 2: 2, or 3 if sneakyZero
  similar: { a: 78, b: 4, quotient: 19, remainder: 2, sneakyZero: false },
}
```

- **`quotient` + `remainder` are the answer.** Correctness is
  `Number(q) === problem.quotient && Number(r) === problem.remainder`.
- **`remainder` is `0` about half the time** (Finn's ~50/50 mix). How a "0
  remainder" is entered is the key pedagogy question below.
- **Widths flex by phase:** Phase 1 quotients are 1–2 digits; Phase 2 quotients
  are up to 3 digits. The entry must not need a redesign when Phase 2 rolls in.
- `similar` feeds the recovery walkthrough — the draft doesn't touch it.

---

## What the screen must emit (the seams Nathan wires)

The component lives inside the existing `MathPopup` shell (`src/ui/MathPopup.jsx`,
the `ask` phase for `op === '÷'`). It must expose:

| Seam | Meaning |
|---|---|
| `problem` (prop in) | the object above |
| `skin` (prop in) | the scenario skin — **the banner stays** (see constraints) |
| an answer submit | fires with `(quotient, remainder)` — NOT one number |
| correct → | hands off to the **existing** `CorrectState` + gem-award flight (unchanged) |
| wrong → | hands off to the **existing** `DivisionWalkthrough` recovery (already built) |

Nathan owns the state machine and the wiring. What Oscar owns is the **layout and
interaction of the entry itself** — how the two numbers are captured on an iPad.

---

## The open design question (this is the draft)

**How does Ivy type a quotient + remainder on a tap-only iPad?** Three shapes,
all viable — Oscar's eye, Finn's pedagogy:

- **(a) Two fields** — `85 ÷ 4 = [ 21 ] R [ 1 ]`. One keypad, a tappable
  active field (quotient first, then R). Clearest mapping to the answer's two
  parts.
- **(b) Inline "R" key** — she types `21`, taps an **R** key, types `1`. One
  continuous string, closest to how it reads left-to-right. Adds a mode key to
  the keypad.
- **(c) Conditional remainder** — quotient field always; the R field only
  appears when the problem has a remainder. Gentlest, but it hides the idea that
  "no remainder" is still an answer.

**The pedagogy sub-question for Finn:** when a problem divides evenly, does Ivy
type **`R 0`** (remainder is always part of the answer — my lean, it teaches that
"nothing left over" is a real result she states, and it matches Oscar's
walkthrough which always names the remainder), or is the remainder **hidden/
optional** on clean problems (less friction on ~50% of them)? This determines
whether the layout is (a)/(b) with an always-present R, or (c).

**One more for Oscar's eye:** should the ask **echo the long-division bracket**
Ivy sees in the recovery walkthrough — so the screen she answers on and the
screen she learns on rhyme — or stay a simple horizontal `a ÷ b = [ ] R [ ]`?
The bracket is more faithful to paper; the horizontal is lighter. Either is fine
to wire.

---

## Nathan's recommendation (non-binding — the draft can overrule)

**(a) two fields with an always-present `R`**, quotient auto-focused, tapping R
(or filling the quotient) moves focus to the remainder. Reasons: it maps 1:1 to
the two-part answer, needs no mode key on the keypad, teaches that `R 0` is a real
answer, and stays honest to Oscar's walkthrough. The cost is a touch more friction
on clean problems — which is Finn's call to accept or reject.

---

## Constraints (all real, none negotiable)

- **iPad-first, tap-only.** The on-screen `Keypad` (`mathkit.jsx`) is the input —
  do not assume a physical keyboard (kids don't have one). Reuse it.
- **Reuse the shared atoms, don't copy them** (Oscar's own rule): `Keypad`, `T`
  tokens, `BigButton`, `Gem`, `useKeyInput`, the `Modal` shell all live in
  `src/ui/mathkit.jsx` and are shared with the station popup.
- **The skin banner stays on this screen** (Amy, 2026-08-22): the "🐾 Snack time"
  scenario header belongs on the *calculation* modal, and is hidden only on the
  recovery walkthrough (which has its own "Let's share the candy 🍬" title). So
  this screen wears the banner; the walkthrough does not.
- **Fits Phase 1 and Phase 2 without redesign** — quotient entry must flex from
  1 up to 3 digits.
- **No difficulty label, no accuracy** — Ivy never sees "L1/Grade 5/%". This
  screen shows the problem and takes her answer; that's all (Design Principle 4).

---

## What already exists (so the draft knows its edges)

- **Recovery walkthrough** — `src/ui/DivisionWalkthrough.jsx` (built, tested).
  Wrong answer routes here. The draft does **not** redraw it.
- **Correct + award** — `CorrectState` in `MathPopup.jsx` + the gem flight to the
  HUD. Unchanged; a correct division answer reuses it as-is.
- **The Modal shell + ✕ close** — `mathkit.jsx`. The new entry mounts inside it.

So the draft is exactly one thing: **the entry between "here's the problem" and
"correct / let's look at one together."** Everything on either side is wired.

---

_Draft target: a self-contained `.html` comp (React + inline styles), same handoff
as the Door and the math popup — Nathan lifts it 1:1 into the `ask` phase._
