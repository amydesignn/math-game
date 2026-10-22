# Contrast audit — PromoPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/PromoPopup.jsx` · **Run:** 2026-10-22 05:08 UTC  
**Variants:** Reduced motion (poster + controls), Motion on (sound button) · **Phases:** pick → trick → treat → sound-off → sound-on → after-pick

> **68 unique checks · 64 pass · 0 fail · 0 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## Reduced motion (poster + controls)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Trick or treat? | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | pick |
| Luxi Math has a little something for you. Pick one! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | pick |
| Trick | `#262626` on `#EDE7FC` | 16px | 12.56:1 | 4.50:1 | ✅ | pick |
| Treat | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | pick |
| Happy Halloween | `#262626` on `#F0EBFD` ᵖ | 20px bold (large) | 12.98:1 | 3.00:1 | ✅ | pick, trick, treat |
| Trick! …just kidding. | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | trick |
| Luxi Math would never. Here are some gems to spend on your w | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | trick |
| +3 gems | `#262626` on `#F6F2FF` | 20px bold (large) | 13.73:1 | 3.00:1 | ✅ | trick, treat |
| +3 | `#262626` on `#F6F2FF` | 20px bold (large) | 13.73:1 | 3.00:1 | ✅ | trick, treat |
| Let’s play → | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | trick, treat |
| A treat from Luxi Math! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | treat |
| Happy Halloween! Here are some gems to spend on your world. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | treat |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.72:1 · 70% of edge | pick, trick, treat |
| Trick | ✅ 12.56:1 | ✅ 10.47:1 | ✅ 10.47:1 | ✅ 12.56:1 | ✅ 6.49:1 · 92% of edge | pick |
| Treat | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 55% of edge | pick |
| Let’s play → | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.73:1 · 57% of edge | trick, treat |

## Motion on (sound button)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Trick or treat? | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | sound-off, sound-on |
| Luxi Math has a little something for you. Pick one! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | sound-off, sound-on |
| Trick | `#262626` on `#EDE7FC` | 16px | 12.56:1 | 4.50:1 | ✅ | sound-off, sound-on |
| Treat | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | sound-off, sound-on |
| Happy Halloween | `#262626` on `#F0EBFD` ᵖ | 20px bold (large) | 12.98:1 | 3.00:1 | ✅ | sound-off, sound-on, after-pick |
| A treat from Luxi Math! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | after-pick |
| Happy Halloween! Here are some gems to spend on your world. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | after-pick |
| +3 gems | `#262626` on `#F6F2FF` | 20px bold (large) | 13.73:1 | 3.00:1 | ✅ | after-pick |
| +3 | `#262626` on `#F6F2FF` | 20px bold (large) | 13.73:1 | 3.00:1 | ✅ | after-pick |
| Let’s play → | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | after-pick |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 5.41:1 | ✅ 5.41:1 | ✅ 6.49:1 | ✅ 3.72:1 · 70% of edge | sound-off, sound-on, after-pick |
| Turn sound on | — | — | — | — | ✅ 3.26:1 · 82% of edge | sound-off, after-pick |
| Trick | ✅ 12.56:1 | ✅ 10.47:1 | ✅ 10.47:1 | ✅ 12.56:1 | ✅ 6.49:1 · 92% of edge | sound-off, sound-on |
| Treat | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 55% of edge | sound-off, sound-on |
| Turn sound off | — | — | — | — | ✅ 3.22:1 · 59% of edge | sound-on |
| Let’s play → | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.73:1 · 57% of edge | after-pick |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
