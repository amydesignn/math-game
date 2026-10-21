# Contrast audit — Onboarding

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/Onboarding.jsx` · **Run:** 2026-10-20 23:50 UTC  
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
| × ÷ + practice for grades 4–5 · teaches the method, step by  | `#6E6685` on `#FFFFFF` | 14px | 5.38:1 | 4.50:1 | ✅ | about |
| Next | `#FFFFFF` on `#6169E0` | 15px bold | 4.55:1 | 4.50:1 | ✅ | about, step-1, step-2 |
| Welcome | `#262626` on `#EEE8FB` ᵖ | 20px bold (large) | 12.66:1 | 3.00:1 | ✅ | about |
| 1 | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | step-1 |
| Meet your hero | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-1 |
| Play as your hero, with your cat. Swap heroes in the 🛍️ sho | `#5C5470` on `#FFFFFF` | 16px | 7.10:1 | 4.50:1 | ✅ | step-1 |
| Back | `#6E6685` on `#FFFFFF` | 15px | 5.38:1 | 4.50:1 | ✅ | step-1, step-2, step-3 |
| How to Play | `#262626` on `#EEE8FB` ᵖ | 20px bold (large) | 12.66:1 | 3.00:1 | ✅ | step-1, step-2, step-3 |
| 2 | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | step-2 |
| Earn gems, then build | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-2 |
| Tap a glowing gem 💎 to solve a problem. Spend gems in the � | `#5C5470` on `#FFFFFF` | 16px | 7.10:1 | 4.50:1 | ✅ | step-2 |
| 3 | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | step-3 |
| Grow a garden 🌱 | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-3 |
| Plant a seed in Sunny Town. Water it with gems, then pick yo | `#5C5470` on `#FFFFFF` | 16px | 7.10:1 | 4.50:1 | ✅ | step-3 |
| Let’s play → | `#FFFFFF` on `#6169E0` | 15px bold | 4.55:1 | 4.50:1 | ✅ | step-3 |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 4.51:1 | ✅ 4.06:1 | ✅ 4.06:1 | ✅ 4.51:1 | ✅ 3.70:1 · 70% of edge | about, step-1, step-2, step-3 |
| Next | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.73:1 · 60% of edge | about, step-1, step-2 |
| Back | ✅ 5.38:1 | ✅ 13.21:1 | ✅ 13.21:1 | ✅ 5.38:1 | ✅ 7.65:1 · 88% of edge | step-1, step-2, step-3 |
| Let’s play → | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 57% of edge | step-3 |

## Settings → How to Play

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 1 | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | step-1 |
| Meet your hero | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-1 |
| Play as your hero, with your cat. Swap heroes in the 🛍️ sho | `#5C5470` on `#FFFFFF` | 16px | 7.10:1 | 4.50:1 | ✅ | step-1 |
| Next | `#FFFFFF` on `#6169E0` | 15px bold | 4.55:1 | 4.50:1 | ✅ | step-1, step-2 |
| How to Play | `#262626` on `#EEE9FB` ᵖ | 20px bold (large) | 12.74:1 | 3.00:1 | ✅ | step-1, step-2, step-3 |
| 2 | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | step-2 |
| Earn gems, then build | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-2 |
| Tap a glowing gem 💎 to solve a problem. Spend gems in the � | `#5C5470` on `#FFFFFF` | 16px | 7.10:1 | 4.50:1 | ✅ | step-2 |
| Back | `#6E6685` on `#FFFFFF` | 15px | 5.38:1 | 4.50:1 | ✅ | step-2, step-3 |
| 3 | `#5B4B9E` on `#EDE7FC` | 20px bold (large) | 5.92:1 | 3.00:1 | ✅ | step-3 |
| Grow a garden 🌱 | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-3 |
| Plant a seed in Sunny Town. Water it with gems, then pick yo | `#5C5470` on `#FFFFFF` | 16px | 7.10:1 | 4.50:1 | ✅ | step-3 |
| Let’s play → | `#FFFFFF` on `#6169E0` | 15px bold | 4.55:1 | 4.50:1 | ✅ | step-3 |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 4.51:1 | ✅ 4.06:1 | ✅ 4.06:1 | ✅ 4.51:1 | ✅ 3.70:1 · 70% of edge | step-1, step-2, step-3 |
| Next | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.73:1 · 60% of edge | step-1, step-2 |
| Back | ✅ 5.38:1 | ✅ 13.21:1 | ✅ 13.21:1 | ✅ 5.38:1 | ✅ 7.65:1 · 88% of edge | step-2, step-3 |
| Let’s play → | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 57% of edge | step-3 |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
