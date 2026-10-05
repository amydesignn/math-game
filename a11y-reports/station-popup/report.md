# Contrast audit — StationPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/StationPopup.jsx` · **Run:** 2026-10-05 13:11 UTC  
**Variants:** Snack time, Water the tree, Bakery run, Flower patch, Arcade night, Star party, Division ask · **Phases:** intro → ask → recover → stepdone → complete

> **413 unique checks · 398 pass · 0 fail · 1 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## Snack time

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#00786F` | 12px bold | 5.36:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Your pet is extra hungry today — a whole picnic! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 snacks to go — finish them all for a bonus gem! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#525252` on `#FAFAFA` | 14px | 7.48:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| SNACK TIME | `#00786F` on `#F2FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Snack 1 of 2 — solve it to fill the bowl | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 28 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 45 × 4 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |
| Snack 1 of 2 — gobbled up! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 snack to go | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | stepdone |
| Next snack ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| What a feast! Your pet is doing the happy dance. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14px | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14px | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | complete |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.95:1 · 72% of edge | intro, ask |
| Let's go ✨ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 56% of edge | intro |
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
| Show next step ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 57% of edge | recover |
| I've got it | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.81:1 | ✅ 5.18:1 · 90% of edge | recover |
| Next snack ▸ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 56% of edge | stepdone |
| Back to your world ✨ | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 5.18:1 · 55% of edge | complete |

## Water the tree

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#008236` | 12px bold | 4.94:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| This tree needs a big drink today! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 splashes to go — finish them all for a bonus gem! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#525252` on `#FAFAFA` | 14px | 7.48:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| WATER THE TREE | `#008236` on `#F2FAF5` ᵖ | 12px bold | 4.66:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Splash 1 of 2 — solve it to fill the can | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 19 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 48 × 2 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |
| Splash 1 of 2 — glug glug! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 splash to go | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | stepdone |
| Next splash ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The tree is blooming! Look at it go. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14px | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14px | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | complete |

## Bakery run

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#BB4D00` | 12px bold | 5.03:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Big order at the bakery — time to bake! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 batches to go — finish them all for a bonus gem! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#525252` on `#FAFAFA` | 14px | 7.48:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| BAKERY RUN | `#BB4D00` on `#FDF8F2` ᵖ | 12px bold | 4.76:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Batch 1 of 2 — solve it to mix the dough | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 49 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 39 × 5 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |
| Batch 1 of 2 — golden and warm! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 batch to go | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | stepdone |
| Next batch ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The oven is full! It smells amazing. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14px | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14px | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | complete |

## Flower patch

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#C6005C` | 12px bold | 5.90:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Let’s fill this whole patch with flowers! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 seeds to go — finish them all for a bonus gem! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#525252` on `#FAFAFA` | 14px | 7.48:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| FLOWER PATCH | `#C6005C` on `#FEF5FA` ᵖ | 12px bold | 5.53:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Seed 1 of 2 — solve it to plant a seed | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 47 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 37 × 2 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |
| Seed 1 of 2 — planted! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 seed to go | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | stepdone |
| Next seed ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The whole patch is blooming! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14px | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14px | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | complete |

## Arcade night

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#1447E6` | 12px bold | 6.83:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Arcade night — bright lights, big prizes! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 rounds to go — finish them all for a bonus gem! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#525252` on `#FAFAFA` | 14px | 7.48:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| ARCADE NIGHT | `#1447E6` on `#F4F8FF` ᵖ | 12px bold | 6.41:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Round 1 of 2 — solve it to take your shot | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 40 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 30 × 4 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |
| Round 1 of 2 — bullseye! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 round to go | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | stepdone |
| Next round ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| High score! The arcade lights up for you. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14px | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14px | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | complete |

## Star party

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#7008E7` | 12px bold | 7.29:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Star party tonight — the sky is showing off! | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 stars to go — finish them all for a bonus gem! | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#525252` on `#FAFAFA` | 14px | 7.48:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | intro |
| STAR PARTY | `#7008E7` on `#F9F6FF` ᵖ | 12px bold | 6.83:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Star 1 of 2 — solve it to spot a star | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 48 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#737373` on `#FFFFFF` | 40px (large) | 4.74:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 48px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 20px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| 37 × 3 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#F1F1FD` | 16px | 13.50:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | recover |
| I've got it | `#4B54DD` on `#FFFFFF` | 16px | 5.81:1 | 4.50:1 | ✅ | recover |
| Star 1 of 2 — spotted! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 star to go | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | stepdone |
| Next star ▸ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| A whole constellation — name it anything you like. | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14px | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14px | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | complete |

## Division ask

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#00786F` | 12px bold | 5.36:1 | 4.50:1 | ✅ | ask |
| Your pet wants a snack! Solve it to fill the bowl. | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | ask |
| 40 | `#262626` on `#FFFFFF` | 40px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| ÷ | `#737373` on `#FFFFFF` | 32px (large) | 4.74:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 40px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| EACH SHARE | `#4B54DD` on `#FFFFFF` | 12px bold | 5.81:1 | 4.50:1 | ✅ | ask |
| LEFT OVER | `#737373` on `#FFFFFF` | 12px bold | 4.74:1 | 4.50:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Tap each share first — then the leftover. | `#525252` on `#FFFFFF` | 14px | 7.81:1 | 4.50:1 | ✅ | ask |
| Show me how 🔎 | `#4B54DD` on `#FFFFFF` | 14px | 5.81:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F3FBFA` ᵖ | 12px bold | 5.10:1 | 4.50:1 | ✅ | ask |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 6.49:1 | ✅ 3.95:1 · 72% of edge | ask |
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

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
