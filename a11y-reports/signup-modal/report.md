# Contrast audit — SignupModal

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/SignupModal.jsx` · **Run:** 2026-10-17 18:32 UTC  
**Variants:** Form, Sending, Error, Check your inbox, Guest popup, Saved toast · **Phases:** empty → filled → sending → error → check → guest → toast

> **168 unique checks · 158 pass · 0 fail · 4 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## Form

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Save your progress | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | empty, filled |
| Enter a parent’s email and we’ll send a sign-in link — no pa | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | empty, filled |
|  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | empty, filled |
| Not now | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | empty, filled |
| We only use a parent’s email to save the game. Privacy Polic | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | empty, filled |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | empty, filled |
| SAVE PROGRESS | `#3D43BE` on `#F9F7FF` ᵖ | 12px bold | 7.20:1 | 4.50:1 | ✅ | empty, filled |
| Send the link | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | filled |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.94:1 · 70% of edge | empty, filled |
| Parent's email | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 94% of edge | empty, filled |
| Send the link | ⚪ disabled 2.37:1 — exempt (WCAG 1.4.3) | | | | | empty, filled |
| Not now | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.65:1 · 99% of edge | empty, filled |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 97% of edge | empty, filled |

## Sending

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Save your progress | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | sending |
| Enter a parent’s email and we’ll send a sign-in link — no pa | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | sending |
| Sending… | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | sending |
| Not now | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | sending |
| We only use a parent’s email to save the game. Privacy Polic | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | sending |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | sending |
| SAVE PROGRESS | `#3D43BE` on `#F9F7FF` ᵖ | 12px bold | 7.20:1 | 4.50:1 | ✅ | sending |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.94:1 · 70% of edge | sending |
| Parent's email | ⚪ disabled 13.88:1 — exempt (WCAG 1.4.3) | | | | | sending |
| Sending… | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 53% of edge | sending |
| Not now | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.65:1 · 99% of edge | sending |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 97% of edge | sending |

## Error

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Save your progress | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | error |
| Enter a parent’s email and we’ll send a sign-in link — no pa | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | error |
| That didn’t send — check the email and try again. | `#973C00` on `#FFFBEB` | 14px | 6.83:1 | 4.50:1 | ✅ | error |
|  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | error |
| Send the link | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | error |
| Not now | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | error |
| We only use a parent’s email to save the game. Privacy Polic | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | error |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | error |
| SAVE PROGRESS | `#3D43BE` on `#F9F7FF` ᵖ | 12px bold | 7.20:1 | 4.50:1 | ✅ | error |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.94:1 · 70% of edge | error |
| Parent's email | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 94% of edge | error |
| Send the link | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 53% of edge | error |
| Not now | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.65:1 · 99% of edge | error |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 97% of edge | error |

## Check your inbox

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Check your inbox | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | check |
| We sent a link to parent@example.com. Open it to save this g | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | check |
| parent@example.com | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | check |
| Didn’t get the email? | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | check |
| SAVE PROGRESS | `#3D43BE` on `#F9F7FF` ᵖ | 12px bold | 7.20:1 | 4.50:1 | ✅ | check |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.94:1 · 70% of edge | check |
| Resend in 30s | ⚪ disabled 7.81:1 — exempt (WCAG 1.4.3) | | | | | check |

## Guest popup

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Save your progress | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | guest |
| Ask a parent to make a free account, so your gems and the wo | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | guest |
| Save my progress | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | guest |
| Not now | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | guest |
| We only use a parent’s email to save the game. Privacy Polic | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | guest |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | guest |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 4.04:1 · 80% of edge | guest |
| Save my progress | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 54% of edge | guest |
| Not now | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.65:1 · 99% of edge | guest |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 97% of edge | guest |

## Saved toast

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Save your progress | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | toast |
| Enter a parent’s email and we’ll send a sign-in link — no pa | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | toast |
|  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | toast |
| Not now | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | toast |
| We only use a parent’s email to save the game. Privacy Polic | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | toast |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | toast |
| You’re all set — your progress is saved 💎 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | toast |
| SAVE PROGRESS | `#3D43BE` on `#F9F7FF` ᵖ | 12px bold | 7.20:1 | 4.50:1 | ✅ | toast |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.94:1 · 70% of edge | toast |
| Parent's email | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 94% of edge | toast |
| Send the link | ⚪ disabled 2.37:1 — exempt (WCAG 1.4.3) | | | | | toast |
| Not now | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.65:1 · 99% of edge | toast |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 97% of edge | toast |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
