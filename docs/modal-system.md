# The modal system — one shell for every popup

*Nathan, 2026-07-26 · from Oscar's locked format (`handoff - progress popup.md`,
2026-07-25) + the three comps. Oscar keeps a fuller `guidelines/modal-system.spec.md`
on his side; this is the repo's copy of the contract — reconcile them, don't fork them.*

## The rule

**Every popup in Ivy's Math World wears the same frame.** Math quest, station
quest, progress record book — one shell. The only thing that differs between
them is the header **tint**:

| popup | tint | meaning |
|---|---|---|
| `MathPopup` | skin accent (mint on Snack Time, etc.) | the math workflow |
| `StationPopup` | skin accent + a QUEST badge | the bigger encounter |
| `ProgressPopup` | soft violet `#E9E2FA → #F8F5FE` | progress / level |

Nothing else — not radius, not scrim, not shadow, not the close button — is
allowed to vary. Amy asked for this sync explicitly: three popups that read as
one family. If you find yourself typing a border-radius inside a popup file,
you are about to break it.

## Where it lives

`src/ui/mathkit.jsx` — `MODAL` (tokens), `<Modal>` (the shell), `<ModalClose>`.

Change a value there and all three popups move together. That is the entire
point of the file.

```jsx
<Modal
  onScrim={dismissable ? close : undefined}  // omit ⇒ can't dismiss by tapping out
  cardRef={cardRef}                          // for the shake animation
  cardClass={shake ? 'shakeit' : ''}
  cardStyle={{ padding: '0 0 26px' }}        // LAYOUT ONLY — never colour/radius/shadow
  overlay={flyGems.map(...)}                 // above the scrim, OUTSIDE the card
  label="Snack time">
  …
</Modal>
```

`overlay` exists for one reason: the gem flights have to cross the whole
screen. If they render inside the card they get clipped.

## The locked values

| token | value | note |
|---|---|---|
| `radius` | **28** | 4px base unit (Amy). Was 26 pre-sync. |
| `scrim` | `rgba(56,42,82,.44)` + `blur(6px)` | doubles as focus mode — the world recedes |
| `border` | `1.5px solid rgba(74,54,110,.10)` | lifts the card off a same-colour world |
| `shadow` | `0 24px 60px rgba(50,38,80,.30), 0 4px 16px rgba(50,38,80,.13)` | two layers: float + contact |
| `width` | `min(520px, calc(100vw - 40px))` | |
| `gutter` | 20 | |
| `close` | **40px**, bg `#ECEAF1`, glyph `#6E6685` | Amy's call — friendlier tap on Ivy's iPad. Oscar's comp said 36 in tokens but rendered 40; 40 wins. |

## The family header

Every popup opens with a tinted header that ends in a **1px stroke divider**:

```
background: linear-gradient(180deg, <tint>, #fff)
borderBottom: 1px solid <line>
```

The station popup established this and the progress popup mirrors it. The
progress card goes one step further — its climb band sits under a **second**
divider, so the tint stays isolated to the celebration panel and the record
below it reads as white paper.

## Type and contrast

- **Emphasis by weight, not colour.** Labels, "total points earned!",
  "…to Level N" and stage rows are *regular*. Only the level numeral, the word
  LEVEL, topic names and counts are bold.
- **All active grey text meets WCAG AA**: `#5C5470` body (≈7:1 on white),
  `#6E6685` muted (≈6:1). The one exception is the upcoming-level ladder node
  at `#A79FB4` — an inactive indicator, SC 1.4.3 exempt. **Keep it light**;
  darkening it would make an unreached level look reached.

## Colour reservation (holds across the whole app)

**teal = gems · amber = station bonus · violet = levels.**

Three celebrations, three colours, so Ivy can tell them apart at a glance.
Don't spend these on decoration.

## Open taste call

The progress popup uses a **pastel** violet; the shipped level bar still wears
the saturated 5-A violet. Oscar flagged that the pastel could be mirrored into
the bar — that's Amy's call, and a one-line change in `LevelBar.jsx` (`LVL`).
Until she says so, they differ deliberately.
