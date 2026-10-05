# Contrast audit — MathPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/MathPopup.jsx` · **Run:** 2026-10-05 13:19 UTC  
**Variants:** 2-digit × 1-digit, Long multiplication, 2-digit addition, Long division · **Phases:** ask → correct → recover → walkthrough

> **353 unique checks · 344 pass · 0 fail · 1 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## 2-digit × 1-digit

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 30 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask, correct, recover |
| Nice work! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | correct |
| Yum! Your pet is happy. +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| Keep going ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | correct |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — follow the steps, then give it another go. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 41 × 5 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.95:1 · 72% of edge | ask |
| 1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 2 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 3 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 4 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 5 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 6 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 7 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 8 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 9 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| delete | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 5.16:1 · 92% of edge | ask |
| 0 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| check | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.99:1 · 63% of edge | ask |
| Keep going ✨ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 56% of edge | correct |
| Show next step ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 57% of edge | recover |
| I've got it | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 90% of edge | recover |

## Long multiplication

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 13 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#F0FBFA` ᵖ | 28px bold (large) | 14.33:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#F0FBFA` ᵖ | 28px bold (large) | 14.33:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask, correct, recover |
| Nice work! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | correct |
| Yum! Your pet is happy. +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| Keep going ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | correct |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — follow the steps, then give it another go. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 12 × 13 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| WHOLE | `#FFFFFF` on `#00786F` | 10.5px bold | 5.36:1 | 4.50:1 | ✅ | recover |
| 21 stays WHOLE — it's the whole team, we never split it apar | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.95:1 · 72% of edge | ask |
| 1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 2 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 3 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 4 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 5 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 6 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 7 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 8 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 9 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| delete | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 5.16:1 · 92% of edge | ask |
| 0 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| check | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.99:1 · 63% of edge | ask |
| Keep going ✨ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 56% of edge | correct |
| Show next step ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 57% of edge | recover |
| I've got it | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 90% of edge | recover |

## 2-digit addition

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 44 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 41 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask, correct, recover |
| Nice work! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | correct |
| Yum! Your pet is happy. +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| Keep going ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | correct |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — follow the steps, then give it another go. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 26 + 17 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Stack them so the ones line up under the ones. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |

## Long division

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 57 | `#262626` on `#FFFFFF` | 40px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| ÷ | `#737373` on `#FFFFFF` | 32px (large) | 4.74:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 40px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| EACH SHARE | `#4B54DD` on `#FFFFFF` | 12px bold | 5.81:1 | 4.50:1 | ✅ | ask |
| LEFT OVER | `#737373` on `#FFFFFF` | 12px bold | 4.74:1 | 4.50:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FAFAFA` | 22px bold (large) | 14.49:1 | 3.00:1 | ✅ | ask, walkthrough |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Tap each share first — then the leftover. | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Show me how 🔎 | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F3FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask |
| Let's share the candy 🍬 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | walkthrough |
| 42 | `#262626` on `#FAFAFA` | 40px bold (large) | 14.49:1 | 3.00:1 | ✅ | walkthrough |
| DIVIDEND | `#C6005C` on `#FDF2F8` | 10px bold | 5.40:1 | 4.50:1 | ✅ | walkthrough |
| You have 42 candies to share. | `#262626` on `#FAFAFA` | 16.5px | 14.49:1 | 4.50:1 | ✅ | walkthrough |
| DIVISOR | `#000000` on `#FAFAFA` | 10px bold | 20.11:1 | 4.50:1 | ✅ | walkthrough |
| You share them with 8 friends. | `#262626` on `#FAFAFA` | 16.5px | 14.49:1 | 4.50:1 | ✅ | walkthrough |
| QUOTIENT | `#8A6D00` on `#FEF9C2` | 10px bold | 4.57:1 | 4.50:1 | ✅ | walkthrough |
| How many does each friend get? | `#262626` on `#FAFAFA` | 16.5px | 14.49:1 | 4.50:1 | ✅ | walkthrough |
| Let's discover it! ▸ | `#FFFFFF` on `#6169E0` | 16px bold | 4.55:1 | 4.50:1 | ✅ | walkthrough |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.95:1 · 72% of edge | ask, walkthrough |
| quotient | — | — | — | — | ✅ 6.15:1 · 89% of edge | ask |
| remainder | — | — | — | — | ✅ 7.65:1 · 88% of edge | ask |
| 1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 2 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 3 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 4 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 5 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 6 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 7 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 8 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| 9 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| delete | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 4.74:1 | ✅ 5.16:1 · 92% of edge | ask |
| 0 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.16:1 · 92% of edge | ask |
| check | ⚪ disabled 2.37:1 — exempt (WCAG 1.4.3) | | | | | ask |
| Show me how 🔎 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 7.65:1 · 96% of edge | ask |
| Let's discover it! ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.93:1 · 56% of edge | walkthrough |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
