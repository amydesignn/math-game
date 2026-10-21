# Contrast audit — Heroes picker (Gem Shop)

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/Shop.jsx` · **Run:** 2026-10-21 00:07 UTC  
**Variants:** 60 gems · playing Sunny · Champ unlocked, 4 gems · playing the Sorcerer (every locked hero unaffordable) · **Phases:** default → unlock-asked

> **165 unique checks · 153 pass · 0 fail · 12 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## 60 gems · playing Sunny · Champ unlocked

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Sorcerer | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Play | `#4B54DD` on `#F6F4FD` | 14px bold | 5.33:1 | 4.50:1 | ✅ | default, unlock-asked |
| Bookworm | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Champ | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Bluebell | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| 🔒 💎 50 | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Boss | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Scientist | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Rocker | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Grandpa | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Officer | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Mayor | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Builder | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Gardener | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, unlock-asked |
| Unlock 💎50 | `#FFFFFF` on `#4B54DD` | 14px bold | 5.81:1 | 4.50:1 | ✅ | unlock-asked |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Sunny | ⚪ disabled 11.37:1 — exempt (WCAG 1.4.3) | | | | | default, unlock-asked |
| Sorcerer | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Bookworm | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Champ | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Bluebell, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default |
| Boss, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Scientist, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Rocker, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Grandpa, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Officer, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Mayor, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Builder, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Gardener, locked, 50 gems | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, unlock-asked |
| Unlock Bluebell for 50 gems | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 89% of edge | unlock-asked |

## 4 gems · playing the Sorcerer (every locked hero unaffordable)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Sunny | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default |
| Play | `#4B54DD` on `#F6F4FD` | 14px bold | 5.33:1 | 4.50:1 | ✅ | default |
| Bookworm | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Sunny | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default |
| Sorcerer | ⚪ disabled 8.70:1 — exempt (WCAG 1.4.3) | | | | | default |
| Bookworm | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default |
| Champ, locked, 50 gems | ⚪ disabled 10.70:1 — exempt (WCAG 1.4.3) | | | | | default |
| Bluebell, locked, 50 gems | ⚪ disabled 12.81:1 — exempt (WCAG 1.4.3) | | | | | default |
| Boss, locked, 50 gems | ⚪ disabled 13.62:1 — exempt (WCAG 1.4.3) | | | | | default |
| Scientist, locked, 50 gems | ⚪ disabled 9.68:1 — exempt (WCAG 1.4.3) | | | | | default |
| Rocker, locked, 50 gems | ⚪ disabled 11.54:1 — exempt (WCAG 1.4.3) | | | | | default |
| Grandpa, locked, 50 gems | ⚪ disabled 13.21:1 — exempt (WCAG 1.4.3) | | | | | default |
| Officer, locked, 50 gems | ⚪ disabled 11.79:1 — exempt (WCAG 1.4.3) | | | | | default |
| Mayor, locked, 50 gems | ⚪ disabled 9.57:1 — exempt (WCAG 1.4.3) | | | | | default |
| Builder, locked, 50 gems | ⚪ disabled 12.04:1 — exempt (WCAG 1.4.3) | | | | | default |
| Gardener, locked, 50 gems | ⚪ disabled 12.04:1 — exempt (WCAG 1.4.3) | | | | | default |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
