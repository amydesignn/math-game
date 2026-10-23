# Contrast audit — Onboarding

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/Onboarding.jsx` · **Run:** 2026-10-22 19:05 UTC  
**Variants:** First run (About + steps), Settings → How to Play · **Phases:** about → step-1 → step-2 → step-3

> **75 unique checks · 71 pass · 0 fail · 0 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## First run (About + steps)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Solve math to earn gems 💎. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | about |
| Build your world. Grow a garden 🌱. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | about |
| Get one wrong? We show you how. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | about |
| × ÷ + practice for grades 4–5 · teaches the method, step by  | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | about |
| Next | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | about, step-1, step-2 |
| Welcome | `#262626` on `#F0EBFD` ᵖ | 20px bold (large) | 12.98:1 | 3.00:1 | ✅ | about |
| 1 | `#3D43BE` on `#EDE7FC` | 20px bold (large) | 6.35:1 | 3.00:1 | ✅ | step-1 |
| Meet your hero | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-1 |
| Play as your hero, with your cat. Swap heroes in the 🛍️ sho | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-1 |
| Back | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-1, step-2, step-3 |
| How to Play | `#262626` on `#F0EBFD` ᵖ | 20px bold (large) | 12.98:1 | 3.00:1 | ✅ | step-1, step-2, step-3 |
| 2 | `#3D43BE` on `#EDE7FC` | 20px bold (large) | 6.35:1 | 3.00:1 | ✅ | step-2 |
| Earn gems, then build | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-2 |
| Tap a glowing gem 💎 to solve a problem. Spend gems in the � | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-2 |
| 3 | `#3D43BE` on `#EDE7FC` | 20px bold (large) | 6.35:1 | 3.00:1 | ✅ | step-3 |
| Grow a garden 🌱 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-3 |
| Plant a seed in Sunny Town. Water it with gems, then pick yo | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-3 |
| Let’s play → | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-3 |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.72:1 · 70% of edge | about, step-1, step-2, step-3 |
| Next | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 60% of edge | about, step-1, step-2 |
| Back | ✅ 7.81:1 | ✅ 12.56:1 | ✅ 12.56:1 | ✅ 7.81:1 | ✅ 7.65:1 · 88% of edge | step-1, step-2, step-3 |
| Let’s play → | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.73:1 · 57% of edge | step-3 |

## Settings → How to Play

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 1 | `#3D43BE` on `#EDE7FC` | 20px bold (large) | 6.35:1 | 3.00:1 | ✅ | step-1 |
| Meet your hero | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-1 |
| Play as your hero, with your cat. Swap heroes in the 🛍️ sho | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-1 |
| Next | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-1, step-2 |
| How to Play | `#262626` on `#F0EBFD` ᵖ | 20px bold (large) | 12.98:1 | 3.00:1 | ✅ | step-1, step-2, step-3 |
| 2 | `#3D43BE` on `#EDE7FC` | 20px bold (large) | 6.35:1 | 3.00:1 | ✅ | step-2 |
| Earn gems, then build | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-2 |
| Tap a glowing gem 💎 to solve a problem. Spend gems in the � | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-2 |
| Back | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-2, step-3 |
| 3 | `#3D43BE` on `#EDE7FC` | 20px bold (large) | 6.35:1 | 3.00:1 | ✅ | step-3 |
| Grow a garden 🌱 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-3 |
| Plant a seed in Sunny Town. Water it with gems, then pick yo | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-3 |
| Let’s play → | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-3 |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.72:1 · 70% of edge | step-1, step-2, step-3 |
| Next | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 60% of edge | step-1, step-2 |
| Back | ✅ 7.81:1 | ✅ 12.56:1 | ✅ 12.56:1 | ✅ 7.81:1 | ✅ 7.65:1 · 88% of edge | step-2, step-3 |
| Let’s play → | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.73:1 · 57% of edge | step-3 |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
