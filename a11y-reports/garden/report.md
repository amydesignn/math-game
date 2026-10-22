# Contrast audit — Garden overlays (Basket + GardenBar)

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/Basket.jsx · src/App.jsx (GardenBar/ActionBar)` · **Run:** 2026-10-22 05:06 UTC  
**Variants:** A seed to plant · basket empty, Growing, can water (12 💎) · basket full, Growing, can’t afford water (2 💎) · basket full, Bloomed · basket full, No seeds yet · basket empty · **Phases:** closed → basket-open

> **98 unique checks · 92 pass · 0 fail · 1 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## A seed to plant · basket empty

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your garden 🌱 | `#FFFFFF` on `#171717` | 14px | 17.92:1 | 4.50:1 | ✅ | closed, basket-open |
| 🌱 Plant your seed | `#FFFFFF` on `#4B54DD` | 16px bold | 5.81:1 | 4.50:1 | ✅ | closed, basket-open |
| YOUR BASKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| 0 | `#3D43BE` on `#FFFFFF` | 40px bold (large) | 7.65:1 | 3.00:1 | ✅ | basket-open |
| Empty for now. Grow flowers in Sunny Town and pick them to f | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | basket-open |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Open your basket — 0 harvested | — | — | — | — | ✅ 4.06:1 · 100% of edge | closed, basket-open |
| Plant your seed | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 87% of edge | closed, basket-open |
| Close | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 3.84:1 · 69% of edge | closed, basket-open |
| Close your basket | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 4.04:1 · 80% of edge | basket-open |

## Growing, can water (12 💎) · basket full

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 9 | `#FFFFFF` on `#4B54DD` | 12px bold | 5.81:1 | 4.50:1 | ✅ | closed, basket-open |
| Water it to help it grow 💧 | `#FFFFFF` on `#171717` | 14px | 17.92:1 | 4.50:1 | ✅ | closed, basket-open |
| 💧 Water · 5 💎 | `#FFFFFF` on `#4B54DD` | 16px bold | 5.81:1 | 4.50:1 | ✅ | closed, basket-open |
| YOUR BASKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| 9 | `#3D43BE` on `#FFFFFF` | 40px bold (large) | 7.65:1 | 3.00:1 | ✅ | basket-open |
| Red flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 4 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| Pink flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 3 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| Yellow flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 2 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Open your basket — 9 harvested | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 3.98:1 · 100% of edge | closed, basket-open |
| Water your plant | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 85% of edge | closed, basket-open |
| Close | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 3.88:1 · 70% of edge | closed, basket-open |
| Close your basket | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 4.04:1 · 80% of edge | basket-open |

## Growing, can’t afford water (2 💎) · basket full

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 9 | `#FFFFFF` on `#4B54DD` | 12px bold | 5.81:1 | 4.50:1 | ✅ | closed, basket-open |
| Water costs 5 💎 — solve a problem to earn more! | `#FFFFFF` on `#171717` | 14px | 17.92:1 | 4.50:1 | ✅ | closed, basket-open |
| YOUR BASKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| 9 | `#3D43BE` on `#FFFFFF` | 40px bold (large) | 7.65:1 | 3.00:1 | ✅ | basket-open |
| Red flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 4 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| Pink flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 3 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| Yellow flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 2 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Open your basket — 9 harvested | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 3.98:1 · 100% of edge | closed, basket-open |
| Water your plant | ⚪ disabled 2.37:1 — exempt (WCAG 1.4.3) | | | | | closed, basket-open |
| Close | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 7.98:1 | ✅ 4.19:1 · 76% of edge | closed, basket-open |
| Close your basket | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 4.04:1 · 80% of edge | basket-open |

## Bloomed · basket full

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| 9 | `#FFFFFF` on `#4B54DD` | 12px bold | 5.81:1 | 4.50:1 | ✅ | closed, basket-open |
| It bloomed! Tap your flowers to pick them 🌸 | `#FFFFFF` on `#171717` | 14px | 17.92:1 | 4.50:1 | ✅ | closed, basket-open |
| YOUR BASKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| 9 | `#3D43BE` on `#FFFFFF` | 40px bold (large) | 7.65:1 | 3.00:1 | ✅ | basket-open |
| Red flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 4 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| Pink flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 3 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| Yellow flowers | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | basket-open |
| × 2 | `#3D43BE` on `#FFFFFF` | 16px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |

## No seeds yet · basket empty

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| No seeds right now — more are on the way ✨ | `#FFFFFF` on `#171717` | 14px | 17.92:1 | 4.50:1 | ✅ | closed, basket-open |
| OK | `#FFFFFF` on `#4B54DD` | 16px bold | 5.81:1 | 4.50:1 | ✅ | closed, basket-open |
| YOUR BASKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | basket-open |
| 0 | `#3D43BE` on `#FFFFFF` | 40px bold (large) | 7.65:1 | 3.00:1 | ✅ | basket-open |
| Empty for now. Grow flowers in Sunny Town and pick them to f | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | basket-open |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
