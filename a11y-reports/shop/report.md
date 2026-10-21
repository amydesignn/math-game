# Contrast audit — Shop

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/Shop.jsx` · **Run:** 2026-10-21 02:06 UTC  
**Variants:** 4 gems · your things · sparkle on, 0 gems (nothing affordable) · **Phases:** default → selected → magic-selected → big

> **490 unique checks · 462 pass · 0 fail · 26 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## 4 gems · your things · sparkle on

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Gem Shop 🛍️ | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | default, selected, magic-selected, big |
| 💎 4 | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| YOUR THINGS — TAP TO PLACE | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Tree | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| place ✥ | `#4B54DD` on `#F6F4FD` | 14px bold | 5.33:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Tent ×2 | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| ×2 | `#3D43BE` on `#F6F4FD` | 14px bold | 7.02:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 🦸 HEROES | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Sunny | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Play | `#4B54DD` on `#F6F4FD` | 14px bold | 5.33:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Sorcerer | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Bookworm | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💜 COMPANIONS | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Cat | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💎 0 | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| ✨ MAGIC — A SPARKLE TRAIL FOR 15 MIN | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Pink sparkle is on ✨ — buy again to refresh it | `#3D43BE` on `#FFFFFF` | 14px | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Pink | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💎 2 · 15m | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Blue | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Gold | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💎 3 · 15m | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Silver | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Rainbow | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💎 4 · 15m | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| HOW BIG? | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Normal | `#FFFFFF` on `#4B54DD` | 14px bold | 5.81:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Big ×2 | `#333A98` on `#EDE7FC` | 14px | 7.92:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Huge ×3 | `#333A98` on `#EDE7FC` | 14px | 7.92:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 🌲 FOREST | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💎 3 | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Tall tree | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Plant | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 💎 2 | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Grass patch | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Stones | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Fence | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Flag | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Target | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| 🛒 MARKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Fruit stand | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Bakery stand | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Cart | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Ice-cream freezer | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| 🕹️ ARCADE | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 🛹 SKATE PARK | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Platform | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Curved rail | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| High rail | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Steps | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Grind box | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Skateboard | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 🗝️ DUNGEON | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Column | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Stone stairs | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Banner | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Shield | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Barrel | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Stone wall | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| 🏰 CASTLE | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Boulder | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected |
| Castle flag | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default, selected, magic-selected, big |
| Buy 💎3 | `#FFFFFF` on `#4B54DD` | 14px bold | 5.81:1 | 4.50:1 | ✅ | selected |
| Buy 💎2 | `#FFFFFF` on `#4B54DD` | 14px bold | 5.81:1 | 4.50:1 | ✅ | magic-selected |
| Normal | `#333A98` on `#EDE7FC` | 14px | 7.92:1 | 4.50:1 | ✅ | big |
| Big ×2 | `#FFFFFF` on `#4B54DD` | 14px bold | 5.81:1 | 4.50:1 | ✅ | big |
| 2× bigger — so everything costs 2× more ✨ | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | big |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close shop | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 4.33:1 · 75% of edge | default, selected, magic-selected |
| 🌳 Tree place ✥ | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| ⛺ Tent ×2 place ✥ | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Sunny | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Sorcerer | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Bookworm | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 5.33:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Champ, locked, 50 gems | ⚪ disabled 10.70:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Bluebell, locked, 50 gems | ⚪ disabled 12.81:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Boss, locked, 50 gems | ⚪ disabled 13.62:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Scientist, locked, 50 gems | ⚪ disabled 9.68:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Rocker, locked, 50 gems | ⚪ disabled 11.54:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Grandpa, locked, 50 gems | ⚪ disabled 13.21:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Officer, locked, 50 gems | ⚪ disabled 11.79:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Mayor, locked, 50 gems | ⚪ disabled 9.57:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Builder, locked, 50 gems | ⚪ disabled 12.04:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Gardener, locked, 50 gems | ⚪ disabled 12.04:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Cat 💎 0 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Sproutling 💎 50 | ⚪ disabled 17.62:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| Pink 💎 2 · 15m | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected |
| Blue 💎 2 · 15m | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 92% of edge | default, selected, magic-selected |
| Gold 💎 3 · 15m | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Silver 💎 3 · 15m | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Rainbow 💎 4 · 15m | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Normal | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 98% of edge | default, selected, magic-selected |
| Big ×2 | ✅ 7.92:1 | ✅ 7.92:1 | ✅ 7.92:1 | ✅ 7.92:1 | ✅ 7.65:1 · 98% of edge | default, selected, magic-selected |
| Huge ×3 | ✅ 7.92:1 | ✅ 7.92:1 | ✅ 7.92:1 | ✅ 7.92:1 | ✅ 7.65:1 · 98% of edge | default, selected, magic-selected |
| 🌳 Tree 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, magic-selected |
| 🌲 Tall tree 💎 4 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🌿 Plant 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🌱 Grass patch 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🪨 Stones 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🪵 Fence 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🚩 Flag 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| ⛺ Tent 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🌉 Bridge 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🎯 Target 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🍎 Fruit stand 💎 4 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🥐 Bakery stand 💎 4 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🛒 Cart 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🍦 Ice-cream freezer 💎 4 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🕹️ Arcade machine 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🧸 Claw machine 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🎮 Pinball 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 💃 Dance machine 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🎡 Prize wheel 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🏀 Basketball hoop 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🛝 Half pipe 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🥣 Bowl 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🏗️ Platform 💎 4 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| ➰ Curved rail 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🚧 High rail 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🪜 Steps 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 📦 Grind box 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🛹 Skateboard 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 💰 Treasure chest 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| ⛩️ Dungeon gate 💎 5 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🏛️ Column 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🗿 Stone stairs 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🎌 Banner 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🛡️ Shield 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🛢️ Barrel 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🧱 Stone wall 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 94% of edge | default, selected, magic-selected |
| 🗿 Tower block 💎 8 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🏰 Castle gate 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| 🌁 Stone bridge 💎 6 | ⚪ disabled 20.12:1 — exempt (WCAG 1.4.3) | | | | | default, selected, magic-selected |
| ⛰️ Boulder 💎 3 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| 🏳️ Castle flag 💎 2 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 13.89:1 | ✅ 7.65:1 · 93% of edge | default, selected, magic-selected |
| Buy Tree for 3 gems | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 93% of edge | selected |
| Buy Pink sparkle for 2 gems | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 93% of edge | magic-selected |

## 0 gems (nothing affordable)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Gem Shop 🛍️ | `#262626` on `#FFFFFF` | 19px bold (large) | 15.13:1 | 3.00:1 | ✅ | default |
| 💎 0 | `#262626` on `#F6F4FD` | 14px bold | 13.89:1 | 4.50:1 | ✅ | default |
| 🦸 HEROES | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| Sunny | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default |
| Play | `#4B54DD` on `#F6F4FD` | 14px bold | 5.33:1 | 4.50:1 | ✅ | default |
| Sorcerer | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default |
| Bookworm | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default |
| 💜 COMPANIONS | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| Cat | `#262626` on `#F6F4FD` | 14px | 13.89:1 | 4.50:1 | ✅ | default |
| ✨ MAGIC — A SPARKLE TRAIL FOR 15 MIN | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| HOW BIG? | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| Normal | `#FFFFFF` on `#4B54DD` | 14px bold | 5.81:1 | 4.50:1 | ✅ | default |
| Big ×2 | `#333A98` on `#EDE7FC` | 14px | 7.92:1 | 4.50:1 | ✅ | default |
| Huge ×3 | `#333A98` on `#EDE7FC` | 14px | 7.92:1 | 4.50:1 | ✅ | default |
| 🌲 FOREST | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| 🛒 MARKET | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| 🕹️ ARCADE | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| 🛹 SKATE PARK | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| 🗝️ DUNGEON | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |
| 🏰 CASTLE | `#3D43BE` on `#FFFFFF` | 12px bold | 7.65:1 | 4.50:1 | ✅ | default |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
