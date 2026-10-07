# Contrast audit — MathPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/MathPopup.jsx` · **Run:** 2026-10-06 21:13 UTC  
**Variants:** 2-digit × 1-digit, Long multiplication, 2-digit addition, Long division · **Phases:** ask → correct → recover → step-2 → step-3 → step-4 → step-5 → step-6 → step-7 → step-8 → walkthrough

> **428 unique checks · 419 pass · 0 fail · 1 exempt (disabled) · 0 need review**

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
| 47 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 4 | `#262626` on `#F1F1FD` | 30px bold (large) | 13.50:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#F1F1FD` | 30px bold (large) | 13.50:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 7 | `#262626` on `#F1F1FD` | 30px bold (large) | 13.50:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask, correct, recover, step-2, step-3, step-4 |
| Nice work! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | correct |
| Yum! Your pet is happy. +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| Keep going ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | correct |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover, step-2, step-3, step-4 |
| No worries — follow the steps, then give it another go. | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4 |
| Your problem: | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4 |
| 19 × 2 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4 |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover, step-2, step-3 |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover, step-2, step-3 |
| 45 × 3 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-2 |
| 4 | `#BB4D00` on `#FFFFFF` | 18px bold | 5.03:1 | 4.50:1 | ✅ | step-2, step-3 |
| 2 | `#4B54DD` on `#F1F1FD` | 30px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-2, step-3, step-4 |
| Multiply the ones: 6 × 7 = 42. Write 2, carry the 4. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-2 |
| ◂ Back | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | step-2, step-3, step-4 |
| 29 × 5 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-3 |
| 8 | `#4B54DD` on `#F1F1FD` | 30px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-3, step-4 |
| Multiply the tens: 6 × 4 = 24. Add the 4 you carried: 24 + 4 | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-3 |
| 48 × 2 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-4 |
| Read it together: 282. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-4 |
| Now try yours again | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-4 |

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
| Show next step ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 57% of edge | recover, step-2, step-3 |
| I've got it | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 90% of edge | recover, step-2, step-3 |
| ◂ Back | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 89% of edge | step-2, step-3, step-4 |
| Now try yours again | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 56% of edge | step-4 |

## Long multiplication

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 31 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 13 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#F0FBFA` ᵖ | 28px bold (large) | 14.33:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover, step-7, step-8 |
| 9 | `#262626` on `#F0FBFA` ᵖ | 28px bold (large) | 14.33:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask, correct, recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| Nice work! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | correct |
| Yum! Your pet is happy. +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| Keep going ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | correct |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| No worries — follow the steps, then give it another go. | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| Your problem: | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 21 × 40 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| WHOLE | `#FFFFFF` on `#00786F` | 10.5px bold | 5.36:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 95 stays WHOLE — it's the whole team, we never split it apar | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7 |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4, step-5, step-6, step-7 |
| 20 × 31 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-2 |
| 2 | `#BB4D00` on `#FEF9C3` | 17px bold | 4.68:1 | 4.50:1 | ✅ | step-2, step-3 |
| 8 | `#737373` on `#FFFFFF` | 28px bold (large) | 4.74:1 | 3.00:1 | ✅ | step-2, step-3 |
| 5 | `#3D43BE` on `#F1F1FD` | 28px bold (large) | 6.82:1 | 3.00:1 | ✅ | step-2, step-3 |
| 5 | `#4B54DD` on `#F1F1FD` | 28px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| Ones pass: spotlight the 5. Start small: 5 × 5 = 25 — write  | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-2 |
| ◂ Back | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| 41 × 22 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-3 |
| 4 | `#4B54DD` on `#F1F1FD` | 28px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-3, step-4, step-5, step-6, step-7, step-8 |
| 7 | `#4B54DD` on `#F1F1FD` | 28px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-3, step-4, step-5, step-6, step-7, step-8 |
| Keep going: 9 × 5 = 45, plus the 2 waiting on top = 47. Row  | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-3 |
| 43 × 21 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-4 |
| 8 | `#3D43BE` on `#F1F1FD` | 28px bold (large) | 6.82:1 | 3.00:1 | ✅ | step-4, step-5, step-6 |
| 5 | `#737373` on `#FFFFFF` | 28px bold (large) | 4.74:1 | 3.00:1 | ✅ | step-4, step-5, step-6 |
| 0 | `#BB4D00` on `#F1F1FD` | 28px bold (large) | 4.48:1 | 3.00:1 | ✅ | step-4, step-5, step-6, step-7, step-8 |
| write it! | `#BB4D00` on `#FFFFFF` | 12px bold | 5.03:1 | 4.50:1 | ✅ | step-4 |
| Tens pass: spotlight the 8. It's not really 8 — it's 80! So  | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-4 |
| 34 × 22 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-5 |
| 4 | `#BB4D00` on `#FEF9C3` | 17px bold | 4.68:1 | 4.50:1 | ✅ | step-5, step-6 |
| 0 | `#4B54DD` on `#F1F1FD` | 28px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-5, step-6, step-7, step-8 |
| Same move as before: 5 × 8 = 40 — write the 0 next to the ze | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-5 |
| 23 × 33 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-6 |
| 6 | `#4B54DD` on `#F1F1FD` | 28px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-6, step-7, step-8 |
| Keep going: 9 × 8 = 72, plus the 4 on top = 76. Row 2 is 760 | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-6 |
| 12 × 41 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-7 |
| 1 | `#BB4D00` on `#FEF9C3` | 14px bold | 4.68:1 | 4.50:1 | ✅ | step-7, step-8 |
| 8 | `#4B54DD` on `#F1F1FD` | 28px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-7, step-8 |
| Both passes done! Now add the rows, one column at a time fro | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-7 |
| 21 × 23 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-8 |
| So 95 × 85 = 8075! Your turn: 21 × 23 works exactly the same | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-8 |
| Now try yours again | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-8 |

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
| Show next step ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 57% of edge | recover, step-2, step-3, step-4, step-5, step-6, step-7 |
| I've got it | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 90% of edge | recover, step-2, step-3, step-4, step-5, step-6, step-7 |
| ◂ Back | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 89% of edge | step-2, step-3, step-4, step-5, step-6, step-7, step-8 |
| Now try yours again | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 56% of edge | step-8 |

## 2-digit addition

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 20 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 37 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#F1F1FD` | 30px bold (large) | 13.50:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#F1F1FD` | 30px bold (large) | 13.50:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 8 | `#262626` on `#F1F1FD` | 30px bold (large) | 13.50:1 | 3.00:1 | ✅ | ask, recover, step-2, step-3, step-4 |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask, correct, recover, step-2, step-3, step-4 |
| Nice work! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | correct |
| Yum! Your pet is happy. +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| +1 | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | correct |
| Keep going ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | correct |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover, step-2, step-3, step-4 |
| No worries — follow the steps, then give it another go. | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4 |
| Your problem: | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4 |
| 52 + 58 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | recover, step-2, step-3, step-4 |
| Stack them so the ones line up under the ones. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover, step-2, step-3 |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover, step-2, step-3 |
| 15 + 48 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-2 |
| 1 | `#BB4D00` on `#FFFFFF` | 18px bold | 5.03:1 | 4.50:1 | ✅ | step-2, step-3, step-4 |
| 5 | `#4B54DD` on `#F1F1FD` | 30px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-2, step-3, step-4 |
| Add the ones: 8 + 7 = 15. That's more than 9 — write 5 and c | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-2 |
| ◂ Back | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | step-2, step-3, step-4 |
| 50 + 23 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-3 |
| 1 | `#4B54DD` on `#F1F1FD` | 30px bold (large) | 5.18:1 | 3.00:1 | ✅ | step-3, step-4 |
| Add the tens: 5 + 5 + 1 = 11. Write 11. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-3 |
| 22 + 45 | `#262626` on `#FFFFFF` | 16px bold | 15.13:1 | 4.50:1 | ✅ | step-4 |
| Put it together: 115. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | step-4 |
| Now try yours again | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | step-4 |

## Long division

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 99 | `#262626` on `#FFFFFF` | 40px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| ÷ | `#737373` on `#FFFFFF` | 32px (large) | 4.74:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 40px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| EACH SHARE | `#4B54DD` on `#FFFFFF` | 12px bold | 5.81:1 | 4.50:1 | ✅ | ask |
| LEFT OVER | `#737373` on `#FFFFFF` | 12px bold | 4.74:1 | 4.50:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Tap each share first — then the leftover. | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Show me how 🔎 | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F3FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask |
| Let's share the candy 🍬 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | walkthrough |
| 50 | `#C6005C` on `#FAFAFA` | 40px bold (large) | 5.65:1 | 3.00:1 | ✅ | walkthrough |
| DIVIDEND | `#C6005C` on `#FDF2F8` | 12px bold | 5.40:1 | 4.50:1 | ✅ | walkthrough |
| You have 50 candies to share. | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | walkthrough |
| 5 | `#00786F` on `#F0FDFA` | 22px bold (large) | 5.14:1 | 3.00:1 | ✅ | walkthrough |
| DIVISOR | `#00786F` on `#F0FDFA` | 12px bold | 5.14:1 | 4.50:1 | ✅ | walkthrough |
| You share them with 5 friends. | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | walkthrough |
| QUOTIENT | `#BB4D00` on `#FEF9C2` | 12px bold | 4.68:1 | 4.50:1 | ✅ | walkthrough |
| How many does each friend get? | `#262626` on `#FAFAFA` | 16px | 14.49:1 | 4.50:1 | ✅ | walkthrough |
| Let's discover it! ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | walkthrough |

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
| Let's discover it! ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.99:1 · 57% of edge | walkthrough |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
