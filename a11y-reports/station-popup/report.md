# Contrast audit — StationPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/StationPopup.jsx` · **Run:** 2026-10-04 19:32 UTC  
**Variants:** Snack time, Water the tree, Bakery run, Flower patch, Arcade night, Star party, Division ask · **Phases:** intro → ask → recover → stepdone → complete

> **419 unique checks · 398 pass · 6 fail · 1 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest 1px ring around the control must reach 3:1 against the colours it replaces. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (6)

| Variant | Element | State | Text | Colour on surface | Ratio | Needs | Smallest fix (same ramp) | Seen in |
|---|---|---|---|---|---|---|---|---|
| Snack time | Let's go ✨ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | intro |
| Snack time | check | focus |  | focus indicator | 2.37:1 | 3.00:1 | Focus ring too faint against what it replaces. | ask |
| Snack time | Show next step ▸ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | recover |
| Snack time | Next snack ▸ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | stepdone |
| Snack time | Back to your world ✨ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | complete |
| Division ask | quotient | focus |  | focus indicator | 1.32:1 | 3.00:1 | Focus ring too faint against what it replaces. | ask |

_Fixes are proposals, not changes: each keeps the colour's hue and moves along its own Datum ramp. Choosing one is a colour decision._

## Snack time

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#00786F` | 11.5px bold | 5.36:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Your pet is extra hungry today — a whole picnic! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 snacks to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| SNACK TIME | `#00786F` on `#F3FBFA` ᵖ | 13px bold | 5.10:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Snack 1 of 2 — solve it to fill the bowl | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 18 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 31 × 5 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| Snack 1 of 2 — gobbled up! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 snack to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next snack ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| What a feast! Your pet is doing the happy dance. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14.5px bold | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.62:1 | intro, ask |
| Let's go ✨ | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ❌ 2.21:1 | intro |
| 1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 2 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 3 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 4 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 5 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 6 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 7 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 8 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 9 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| delete | ✅ 5.10:1 | ✅ 5.10:1 | ✅ 5.10:1 | ✅ 5.10:1 | ✅ 5.98:1 | ask |
| 0 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| check | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ❌ 2.37:1 | ask |
| Show next step ▸ | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ❌ 2.21:1 | recover |
| I've got it | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.86:1 | recover |
| Next snack ▸ | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ❌ 2.21:1 | stepdone |
| Back to your world ✨ | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ✅ 4.53:1 | ❌ 2.21:1 | complete |

## Water the tree

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#008236` | 11.5px bold | 4.94:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| This tree needs a big drink today! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 splashes to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| WATER THE TREE | `#008236` on `#F2FAF5` ᵖ | 13px bold | 4.66:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Splash 1 of 2 — solve it to fill the can | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 35 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 32 × 6 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| Splash 1 of 2 — glug glug! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 splash to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next splash ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The tree is blooming! Look at it go. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14.5px bold | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |

## Bakery run

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#BB4D00` | 11.5px bold | 5.03:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Big order at the bakery — time to bake! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 batches to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| BAKERY RUN | `#BB4D00` on `#FDF8F2` ᵖ | 13px bold | 4.76:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Batch 1 of 2 — solve it to mix the dough | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 26 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 30 × 5 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| Batch 1 of 2 — golden and warm! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 batch to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next batch ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The oven is full! It smells amazing. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14.5px bold | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |

## Flower patch

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#C6005C` | 11.5px bold | 5.90:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Let’s fill this whole patch with flowers! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 seeds to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| FLOWER PATCH | `#C6005C` on `#FFF4FA` ᵖ | 13px bold | 5.50:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Seed 1 of 2 — solve it to plant a seed | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 31 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 35 × 2 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| Seed 1 of 2 — planted! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 seed to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next seed ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The whole patch is blooming! | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14.5px bold | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |

## Arcade night

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#1447E6` | 11.5px bold | 6.83:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Arcade night — bright lights, big prizes! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 rounds to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| ARCADE NIGHT | `#1447E6` on `#F4F8FF` ᵖ | 13px bold | 6.41:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Round 1 of 2 — solve it to take your shot | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 36 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 21 × 6 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| Round 1 of 2 — bullseye! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 round to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next round ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| High score! The arcade lights up for you. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14.5px bold | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |

## Star party

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#7008E7` | 11.5px bold | 7.29:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Star party tonight — the sky is showing off! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 stars to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| STAR PARTY | `#7008E7` on `#F9F6FF` ᵖ | 13px bold | 6.83:1 | 4.50:1 | ✅ | intro, ask, recover, stepdone, complete |
| Star 1 of 2 — solve it to spot a star | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 42 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 14 × 5 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| Star 1 of 2 — spotted! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 star to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next star ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| A whole constellation — name it anything you like. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#BB4D00` on `#FEF3E2` | 14.5px bold | 4.58:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |

## Division ask

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| QUEST | `#FFFFFF` on `#00786F` | 11.5px bold | 5.36:1 | 4.50:1 | ✅ | ask |
| Your pet wants a snack! Solve it to fill the bowl. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | ask |
| 16 | `#262626` on `#FFFFFF` | 42px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| ÷ | `#6E6E6E` on `#FFFFFF` | 32px (large) | 5.09:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 42px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| EACH SHARE | `#2D6DF6` on `#FFFFFF` | 10px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| R | `#6E6E6E` on `#FFFFFF` | 28px bold (large) | 5.09:1 | 3.00:1 | ✅ | ask |
| LEFT OVER | `#6E6E6E` on `#FFFFFF` | 10px bold | 5.09:1 | 4.50:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Tap her share first — then the leftover. | `#6E6E6E` on `#FFFFFF` | 12.5px | 5.09:1 | 4.50:1 | ✅ | ask |
| Show me how 🔎 | `#6E5BC0` on `#FFFFFF` | 13.5px bold | 5.35:1 | 4.50:1 | ✅ | ask |
| SNACK TIME | `#00786F` on `#F3FBFA` ᵖ | 13px bold | 5.10:1 | 4.50:1 | ✅ | ask |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.62:1 | ask |
| quotient | — | — | — | — | ❌ 1.32:1 | ask |
| remainder | ✅ 5.09:1 | ✅ 5.09:1 | ✅ 5.09:1 | ✅ 5.09:1 | ✅ 5.98:1 | ask |
| BUTTON | — | — | — | — | ✅ 4.86:1 | ask |
| 1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 2 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 3 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 4 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 5 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 6 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 7 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 8 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| 9 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| delete | ✅ 5.10:1 | ✅ 5.10:1 | ✅ 5.10:1 | ✅ 5.10:1 | ✅ 5.98:1 | ask |
| 0 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.98:1 | ask |
| check | ⚪ disabled 1.81:1 — exempt (WCAG 1.4.3) | | | | | ask |
| Show me how 🔎 | ✅ 5.35:1 | ✅ 5.35:1 | ✅ 5.35:1 | ✅ 5.35:1 | ✅ 5.98:1 | ask |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
