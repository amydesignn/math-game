# Contrast audit — SettingsSheet

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/Settings.jsx` · **Run:** 2026-10-05 04:38 UTC  
**Variants:** Guest · sound on, Guest · sound off, Signed in · **Phases:** open

> **160 unique checks · 157 pass · 0 fail · 0 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## Guest · sound on

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Settings | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | open |
| Save your progress | `#262626` on `#F6F2FF` | 16px | 13.73:1 | 4.50:1 | ✅ | open |
| Sign up or sign in | `#525252` on `#F6F2FF` | 14px | 7.09:1 | 4.50:1 | ✅ | open |
| PREFERENCES | `#525252` on `#FFFFFF` | 11px | 7.81:1 | 4.50:1 | ✅ | open |
| Sound | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Music | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Island | `#FFFFFF` on `#4B54DD` | 14px | 5.81:1 | 4.50:1 | ✅ | open |
| Soft Focus | `#5B4B9E` on `#EDE7FC` | 14px | 5.92:1 | 4.50:1 | ✅ | open |
| HELP | `#525252` on `#FFFFFF` | 11px | 7.81:1 | 4.50:1 | ✅ | open |
| How to Play | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Send Feedback | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | open |
| Luxi Math | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | open |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 4.33:1 · 75% of edge | open |
| Save your progress Sign up or sign in | ✅ 7.09:1 | ✅ 7.09:1 | ✅ 7.09:1 | ✅ 7.09:1 | ✅ 7.65:1 · 96% of edge | open |
| Sound | — | — | — | — | ✅ 4.99:1 · 87% of edge | open |
| Island | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.61:1 · 85% of edge | open |
| Soft Focus | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 6.35:1 · 89% of edge | open |
| How to Play | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 7.65:1 · 98% of edge | open |
| Send Feedback | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 7.65:1 · 98% of edge | open |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 98% of edge | open |

## Guest · sound off

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Settings | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | open |
| Save your progress | `#262626` on `#F6F2FF` | 16px | 13.73:1 | 4.50:1 | ✅ | open |
| Sign up or sign in | `#525252` on `#F6F2FF` | 14px | 7.09:1 | 4.50:1 | ✅ | open |
| PREFERENCES | `#525252` on `#FFFFFF` | 11px | 7.81:1 | 4.50:1 | ✅ | open |
| Sound | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Music | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Island | `#FFFFFF` on `#4B54DD` | 14px | 5.81:1 | 4.50:1 | ✅ | open |
| Soft Focus | `#5B4B9E` on `#EDE7FC` | 14px | 5.92:1 | 4.50:1 | ✅ | open |
| HELP | `#525252` on `#FFFFFF` | 11px | 7.81:1 | 4.50:1 | ✅ | open |
| How to Play | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Send Feedback | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | open |
| Luxi Math | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | open |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 4.33:1 · 75% of edge | open |
| Save your progress Sign up or sign in | ✅ 7.09:1 | ✅ 7.09:1 | ✅ 7.09:1 | ✅ 7.09:1 | ✅ 7.65:1 · 96% of edge | open |
| Sound | — | — | — | — | ✅ 4.99:1 · 87% of edge | open |
| Island | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.61:1 · 85% of edge | open |
| Soft Focus | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 6.35:1 · 89% of edge | open |
| How to Play | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 7.65:1 · 98% of edge | open |
| Send Feedback | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 7.65:1 · 98% of edge | open |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 98% of edge | open |

## Signed in

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Settings | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | open |
| Signed in | `#262626` on `#F6F2FF` | 16px | 13.73:1 | 4.50:1 | ✅ | open |
| ivy@email.com | `#525252` on `#F6F2FF` | 14px | 7.09:1 | 4.50:1 | ✅ | open |
| Sign out | `#4B54DD` on `#F6F2FF` | 14px | 5.27:1 | 4.50:1 | ✅ | open |
| PREFERENCES | `#525252` on `#FFFFFF` | 11px | 7.81:1 | 4.50:1 | ✅ | open |
| Sound | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Music | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Island | `#FFFFFF` on `#4B54DD` | 14px | 5.81:1 | 4.50:1 | ✅ | open |
| Soft Focus | `#5B4B9E` on `#EDE7FC` | 14px | 5.92:1 | 4.50:1 | ✅ | open |
| HELP | `#525252` on `#FFFFFF` | 11px | 7.81:1 | 4.50:1 | ✅ | open |
| How to Play | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Send Feedback | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | open |
| Privacy Policy | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | open |
| Luxi Math | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | open |
| I | `#FFFFFF` on `#6856B6` ᵖ | 16px bold | 5.84:1 | 4.50:1 | ✅ | open |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 3.94:1 | ✅ 4.33:1 · 75% of edge | open |
| Sign out | ✅ 5.27:1 | ✅ 4.82:1 | ✅ 6.06:1 | ✅ 5.27:1 | ✅ 6.95:1 · 98% of edge | open |
| Sound | — | — | — | — | ✅ 4.99:1 · 87% of edge | open |
| Island | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.61:1 · 85% of edge | open |
| Soft Focus | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 5.92:1 | ✅ 6.35:1 · 89% of edge | open |
| How to Play | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 7.65:1 · 98% of edge | open |
| Send Feedback | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 7.65:1 · 98% of edge | open |
| Privacy Policy | ✅ 5.81:1 | ✅ 6.35:1 | ✅ 6.60:1 | ✅ 5.81:1 | ✅ 9.55:1 · 98% of edge | open |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
