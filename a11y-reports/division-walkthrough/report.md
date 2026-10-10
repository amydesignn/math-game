# Contrast audit — DivisionWalkthrough

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/DivisionWalkthrough.jsx` · **Run:** 2026-10-06 03:09 UTC  
**Variants:** 815 ÷ 4 (sneaky zero), 85 ÷ 4 · **Phases:** intro → step-0 → step-1 → step-2 → step-3 → step-4 → step-5 → step-6 → step-7 → step-8 → step-9 → step-10 → step-11 → step-12 → step-13 → step-14 → step-15

> **134 unique checks · 134 pass · 0 fail · 0 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## 815 ÷ 4 (sneaky zero)

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Let's share the candy 🍬 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 815 | `#C6005C` on `#FAFAFA` | 40px bold (large) | 5.65:1 | 3.00:1 | ✅ | intro |
| DIVIDEND | `#C6005C` on `#FDF2F8` | 12px bold | 5.40:1 | 4.50:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| You have 815 candies to share. | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | intro |
| 4 | `#00786F` on `#F0FDFA` | 22px bold (large) | 5.14:1 | 3.00:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| DIVISOR | `#00786F` on `#F0FDFA` | 12px bold | 5.14:1 | 4.50:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| You share them with 4 friends. | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | intro |
| QUOTIENT | `#BB4D00` on `#FEF9C2` | 12px bold | 4.68:1 | 4.50:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| How many does each friend get? | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | intro |
| Let's discover it! ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| Let's begin | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-0, step-1 |
| We have 815 candies to share equally among 4 friends. Let's  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-0 |
| Divide | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-3, step-4, step-5, step-7, step-8, step-9, step-11, step-12, step-13, step-14, step-15 |
| Multiply | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-4, step-5, step-6, step-8, step-9, step-10, step-12, step-13, step-14, step-15 |
| Subtract | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-5, step-6, step-7, step-9, step-10, step-11, step-13, step-14, step-15 |
| Bring down | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-6, step-7, step-8, step-10, step-11, step-12, step-13, step-14, step-15 |
| Each friend's share | `#525252` on `#FFFFFF` | 12px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| The friends | `#525252` on `#FFFFFF` | 12px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| all the candy to share | `#525252` on `#FFFFFF` | 12px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| ▶ Play | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12 |
| ◂ Back | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12 |
| 8 | `#C6005C` on `#EFF1F3` ᵖ | 26px bold (large) | 5.22:1 | 3.00:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 1 | `#C6005C` on `#FFFFFF` ᵖ | 26px bold (large) | 5.91:1 | 3.00:1 | ✅ | step-0, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 5 | `#C6005C` on `#FFFFFF` ᵖ | 26px bold (large) | 5.91:1 | 3.00:1 | ✅ | step-0, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| We only look at a little at a time. This glowing box is the  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-1 |
| SHARING TABLE | `#FFFFFF` on `#62748E` ᵖ | 12px bold | 4.76:1 | 4.50:1 | ✅ | step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12 |
| 1 | `#737373` on `#FFFFFF` ᵖ | 26px bold (large) | 4.74:1 | 3.00:1 | ✅ | step-1, step-2, step-3, step-4 |
| 5 | `#737373` on `#FFFFFF` ᵖ | 26px bold (large) | 4.74:1 | 3.00:1 | ✅ | step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| Round 1 of 3 | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-2, step-3, step-4 |
| How many times does 4 fit into 8? 2! Each friend gets 2 so f | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-2 |
| Divide | `#1447E6` on `#FFFFFF` | 14px bold | 6.83:1 | 4.50:1 | ✅ | step-2, step-6, step-10 |
| 2 | `#BB4D00` on `#FEF9C2` | 26px bold (large) | 4.68:1 | 3.00:1 | ✅ | step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Now count what we handed out: 2 for each of the 4 friends =  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-3 |
| Multiply | `#CA3500` on `#FFFFFF` | 14px bold | 5.22:1 | 4.50:1 | ✅ | step-3, step-7, step-11 |
| 8 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 8 − 8 = 0. Nothing left in this group! ✨ | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-4 |
| Subtract | `#C10007` on `#FFFFFF` | 14px bold | 6.42:1 | 4.50:1 | ✅ | step-4, step-8, step-12 |
| 0 | `#262626` on `#EFF1F4` | 26px bold (large) | 13.37:1 | 3.00:1 | ✅ | step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Round 2 of 3 | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-5, step-6, step-7, step-8 |
| Invite the next candy down! Bring the 1 down to join the lef | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-5 |
| Bring down | `#008236` on `#FFFFFF` | 14px bold | 4.94:1 | 4.50:1 | ✅ | step-5, step-9 |
| 1 | `#262626` on `#EFF1F4` | 26px bold (large) | 13.37:1 | 3.00:1 | ✅ | step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| How many times does 4 fit into 01? It can't — not even once! | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-6 |
| 0 | `#BB4D00` on `#FEF9C2` | 26px bold (large) | 4.68:1 | 3.00:1 | ✅ | step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| keeps the line! | `#FFFFFF` on `#C2410C` | 12px bold | 5.17:1 | 4.50:1 | ✅ | step-6 |
| Now count what we handed out: 0 for each of the 4 friends =  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-7 |
| 01 − 0 = 1. 1 candy still waiting to be shared. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-8 |
| Round 3 of 3 | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-9, step-10, step-11, step-12 |
| Invite the last candy down! Bring the 5 down to join the lef | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-9 |
| 5 | `#262626` on `#EFF1F4` | 26px bold (large) | 13.37:1 | 3.00:1 | ✅ | step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| How many times does 4 fit into 15? 3! Each friend gets 3 so  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-10 |
| 3 | `#BB4D00` on `#FEF9C2` | 26px bold (large) | 4.68:1 | 3.00:1 | ✅ | step-10, step-11, step-12, step-13, step-14, step-15 |
| Now count what we handed out: 3 for each of the 4 friends =  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-11 |
| 2 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-11, step-12, step-13, step-14, step-15 |
| 15 − 12 = 3. That's the remainder — 3 leftover candies! 🍬 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-12 |
| 3 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-12, step-13, step-14, step-15 |
| LEFTOVER | `#C2410C` on `#FFFFFF` | 12px bold | 5.17:1 | 4.50:1 | ✅ | step-12, step-13, step-14, step-15 |
| Done! Each of the 4 friends gets 203 candies, with 3 left ov | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-13, step-14, step-15 |
| R3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-13, step-14, step-15 |
| ↺ Watch again | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | step-13, step-14, step-15 |
| I got it! 🎉 | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-13, step-14, step-15 |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Let's discover it! ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.99:1 · 57% of edge | intro |
| ▶ Play | ✅ 7.65:1 | ✅ 7.65:1 | ✅ 7.65:1 | ✅ 7.65:1 | ✅ 5.30:1 · 92% of edge | step-0 |
| ◂ Back | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 6.07:1 · 91% of edge | step-0 |
| Next step ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.99:1 · 59% of edge | step-0 |

## 85 ÷ 4

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Let's share the candy 🍬 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 85 | `#C6005C` on `#FAFAFA` | 40px bold (large) | 5.65:1 | 3.00:1 | ✅ | intro |
| DIVIDEND | `#C6005C` on `#FDF2F8` | 12px bold | 5.40:1 | 4.50:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| You have 85 candies to share. | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | intro |
| 4 | `#00786F` on `#F0FDFA` | 22px bold (large) | 5.14:1 | 3.00:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| DIVISOR | `#00786F` on `#F0FDFA` | 12px bold | 5.14:1 | 4.50:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| You share them with 4 friends. | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | intro |
| QUOTIENT | `#BB4D00` on `#FEF9C2` | 12px bold | 4.68:1 | 4.50:1 | ✅ | intro, step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| How many does each friend get? | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | intro |
| Let's discover it! ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| Let's begin | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-0, step-1 |
| We have 85 candies to share equally among 4 friends. Let's f | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-0 |
| Divide | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-3, step-4, step-5, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Multiply | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-4, step-5, step-6, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Subtract | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-5, step-6, step-7, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Bring down | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Each friend's share | `#525252` on `#FFFFFF` | 12px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| The friends | `#525252` on `#FFFFFF` | 12px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| all the candy to share | `#525252` on `#FFFFFF` | 12px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| ▶ Play | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| ◂ Back | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 8 | `#C6005C` on `#EFF1F3` ᵖ | 26px bold (large) | 5.22:1 | 3.00:1 | ✅ | step-0, step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 5 | `#C6005C` on `#FFFFFF` ᵖ | 26px bold (large) | 5.91:1 | 3.00:1 | ✅ | step-0, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| We only look at a little at a time. This glowing box is the  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-1 |
| SHARING TABLE | `#FFFFFF` on `#62748E` ᵖ | 12px bold | 4.76:1 | 4.50:1 | ✅ | step-1, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 5 | `#737373` on `#FFFFFF` ᵖ | 26px bold (large) | 4.74:1 | 3.00:1 | ✅ | step-1, step-2, step-3, step-4 |
| Round 1 of 2 | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-2, step-3, step-4 |
| How many times does 4 fit into 8? 2! Each friend gets 2 so f | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-2 |
| Divide | `#1447E6` on `#FFFFFF` | 14px bold | 6.83:1 | 4.50:1 | ✅ | step-2, step-6 |
| 2 | `#BB4D00` on `#FEF9C2` | 26px bold (large) | 4.68:1 | 3.00:1 | ✅ | step-2, step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Now count what we handed out: 2 for each of the 4 friends =  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-3 |
| Multiply | `#CA3500` on `#FFFFFF` | 14px bold | 5.22:1 | 4.50:1 | ✅ | step-3, step-7 |
| 8 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-3, step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 8 − 8 = 0. Nothing left in this group! ✨ | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-4 |
| Subtract | `#C10007` on `#FFFFFF` | 14px bold | 6.42:1 | 4.50:1 | ✅ | step-4, step-8 |
| 0 | `#262626` on `#EFF1F4` | 26px bold (large) | 13.37:1 | 3.00:1 | ✅ | step-4, step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Round 2 of 2 | `#525252` on `#F5F5F5` | 14px | 7.16:1 | 4.50:1 | ✅ | step-5, step-6, step-7, step-8 |
| Invite the last candy down! Bring the 5 down to join the lef | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-5 |
| Bring down | `#008236` on `#FFFFFF` | 14px bold | 4.94:1 | 4.50:1 | ✅ | step-5 |
| 5 | `#262626` on `#EFF1F4` | 26px bold (large) | 13.37:1 | 3.00:1 | ✅ | step-5, step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| How many times does 4 fit into 05? 1! Each friend gets 1 so  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-6 |
| 1 | `#BB4D00` on `#FEF9C2` | 26px bold (large) | 4.68:1 | 3.00:1 | ✅ | step-6, step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Now count what we handed out: 1 for each of the 4 friends =  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-7 |
| 4 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-7, step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| 05 − 4 = 1. That's the remainder — 1 leftover candy! 🍬 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-8 |
| 1 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| LEFTOVER | `#C2410C` on `#FFFFFF` | 12px bold | 5.17:1 | 4.50:1 | ✅ | step-8, step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| Done! Each of the 4 friends gets 21 candies, with 1 left ove | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| R1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| ↺ Watch again | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | step-9, step-10, step-11, step-12, step-13, step-14, step-15 |
| I got it! 🎉 | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-9, step-10, step-11, step-12, step-13, step-14, step-15 |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
