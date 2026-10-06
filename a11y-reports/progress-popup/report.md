# Contrast audit — ProgressPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/ProgressPopup.jsx` · **Run:** 2026-10-06 21:26 UTC  
**Variants:** Record (Level 2, three subjects), Empty (new player) · **Phases:** default

> **44 unique checks · 37 pass · 0 fail · 5 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## Record (Level 2, three subjects)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 22 points to Level 3 → | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | default |
| WHAT YOU'VE SOLVED | `#525252` on `#FFFFFF` | 12px bold | 7.81:1 | 4.50:1 | ✅ | default |
| × | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | default |
| Multiplication | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | default |
| Warm-up problems solved | `#525252` on `#FFFFFF` | 15px | 7.81:1 | 4.50:1 | ✅ | default |
| 11 | `#5B4B9E` on `#FFFFFF` | 20px bold (large) | 7.13:1 | 3.00:1 | ✅ | default |
| Challenge problems solved | `#525252` on `#FFFFFF` | 15px | 7.81:1 | 4.50:1 | ✅ | default |
| 5 | `#5B4B9E` on `#FFFFFF` | 20px bold (large) | 7.13:1 | 3.00:1 | ✅ | default |
| Expert problems solved | `#525252` on `#FFFFFF` | 15px | 7.81:1 | 4.50:1 | ✅ | default |
| ÷ | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | default |
| Division | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | default |
| Problems solved | `#525252` on `#FFFFFF` | 15px | 7.81:1 | 4.50:1 | ✅ | default |
| 3 | `#5B4B9E` on `#FFFFFF` | 20px bold (large) | 7.13:1 | 3.00:1 | ✅ | default |
| Addition | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | default |
| 8 | `#5B4B9E` on `#FFFFFF` | 20px bold (large) | 7.13:1 | 3.00:1 | ✅ | default |
| LEVEL | `#5B4B9E` on `#EBE5FA` ᵖ | 14px bold | 5.81:1 | 4.50:1 | ✅ | default |
| 2 | `#1D2050` on `#AF98E9` ᵖ | 34px bold (large) | 6.18:1 | 3.00:1 | ✅ | default |
| 78 total points earned! | `#525252` on `#F1EDFD` ᵖ | 17px | 6.80:1 | 4.50:1 | ✅ | default |
| 78 | `#5B4B9E` on `#F5F1FD` ᵖ | 17px bold | 6.41:1 | 4.50:1 | ✅ | default |
| 1 | `#1D2050` on `#B19AEA` ᵖ | 16px bold | 6.31:1 | 4.50:1 | ✅ | default |
| 3 | `#A79FB4` on `#EFEDF2` ᵖ | 16px bold | 2.19:1 | — | ⚪ exempt Part of a disabled control — exempt (WCAG 1.4.3, inactive UI component). | default |
| 4 | `#A79FB4` on `#EFEDF2` ᵖ | 16px bold | 2.19:1 | — | ⚪ exempt Part of a disabled control — exempt (WCAG 1.4.3, inactive UI component). | default |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.57:1 · 70% of edge | default |

## Empty (new player)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 50 points to Level 2 → | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | default |
| WHAT YOU'VE SOLVED | `#525252` on `#FFFFFF` | 12px bold | 7.81:1 | 4.50:1 | ✅ | default |
| Start playing to fill this in. | `#525252` on `#FFFFFF` | 15px | 7.81:1 | 4.50:1 | ✅ | default |
| LEVEL | `#5B4B9E` on `#EBE5FA` ᵖ | 14px bold | 5.81:1 | 4.50:1 | ✅ | default |
| 1 | `#1D2050` on `#B099E9` ᵖ | 34px bold (large) | 6.24:1 | 3.00:1 | ✅ | default |
| 0 total points earned! | `#525252` on `#F1EDFC` ᵖ | 17px | 6.79:1 | 4.50:1 | ✅ | default |
| 0 | `#5B4B9E` on `#F5F1FD` ᵖ | 17px bold | 6.41:1 | 4.50:1 | ✅ | default |
| 2 | `#A79FB4` on `#EFEDF2` ᵖ | 16px bold | 2.19:1 | — | ⚪ exempt Part of a disabled control — exempt (WCAG 1.4.3, inactive UI component). | default |
| 3 | `#A79FB4` on `#EFEDF2` ᵖ | 16px bold | 2.19:1 | — | ⚪ exempt Part of a disabled control — exempt (WCAG 1.4.3, inactive UI component). | default |
| 4 | `#A79FB4` on `#EFEDF2` ᵖ | 16px bold | 2.19:1 | — | ⚪ exempt Part of a disabled control — exempt (WCAG 1.4.3, inactive UI component). | default |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.57:1 · 70% of edge | default |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
