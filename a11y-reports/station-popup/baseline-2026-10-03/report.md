# Contrast audit — StationPopup

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/StationPopup.jsx` · **Run:** 2026-10-04 03:43 UTC  
**Variants:** Snack time, Water the tree, Bakery run, Flower patch, Arcade night, Star party, Division ask · **Phases:** intro → ask → recover → stepdone → complete

> **419 unique checks · 359 pass · 45 fail · 1 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest 1px ring around the control must reach 3:1 against the colours it replaces. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (45)

| Variant | Element | State | Text | Colour on surface | Ratio | Needs | Smallest fix (same ramp) | Seen in |
|---|---|---|---|---|---|---|---|---|
| Snack time |  | default | QUEST | `#FFFFFF` on `#00BBA7` | 2.42:1 | 4.50:1 | surface → `teal-700` `#00786F` (5.36:1) | intro, ask, recover, stepdone, complete |
| Snack time |  | default | SNACK TIME | `#00BBA7` on `#F2FBFA` (gradient #F2FBFA→#F7FDFC) | 2.30:1 | 4.50:1 | text → `teal-700` `#00786F` (5.10:1) | intro, ask, recover, stepdone, complete |
| Snack time |  | default | Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Snack time |  | default | · here's one just like it | `#A8A8A8` on `#FFFFFF` | 2.37:1 | 4.50:1 | text → `brand-neutral-55` `#737373` (4.74:1) | recover |
| Snack time |  | default | +1bonus! | `#D97706` on `#FEF3E2` | 2.90:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.58:1) | complete |
| Water the tree |  | default | QUEST | `#FFFFFF` on `#00A63E` | 3.21:1 | 4.50:1 | surface → `green-700` `#008236` (4.95:1) | intro, ask, recover, stepdone, complete |
| Water the tree |  | default | WATER THE TREE | `#00A63E` on `#F2FAF5` (gradient #F2FAF5→#F7FDF9) | 3.03:1 | 4.50:1 | text → `green-700` `#008236` (4.66:1) | intro, ask, recover, stepdone, complete |
| Water the tree |  | default | Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Water the tree |  | default | · here's one just like it | `#A8A8A8` on `#FFFFFF` | 2.37:1 | 4.50:1 | text → `brand-neutral-55` `#737373` (4.74:1) | recover |
| Water the tree |  | default | +1bonus! | `#D97706` on `#FEF3E2` | 2.90:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.58:1) | complete |
| Bakery run |  | default | QUEST | `#FFFFFF` on `#E17100` | 3.19:1 | 4.50:1 | surface → `amber-700` `#BB4D00` (5.03:1) | intro, ask, recover, stepdone, complete |
| Bakery run |  | default | BAKERY RUN | `#E17100` on `#FDF8F3` (gradient #FDF8F3→#FEFBF7) | 3.03:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.77:1) | intro, ask, recover, stepdone, complete |
| Bakery run |  | default | Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Bakery run |  | default | · here's one just like it | `#A8A8A8` on `#FFFFFF` | 2.37:1 | 4.50:1 | text → `brand-neutral-55` `#737373` (4.74:1) | recover |
| Bakery run |  | default | +1bonus! | `#D97706` on `#FEF3E2` | 2.90:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.58:1) | complete |
| Flower patch |  | default | QUEST | `#FFFFFF` on `#F6339A` | 3.58:1 | 4.50:1 | surface → `pink-600` `#E60076` (4.54:1) | intro, ask, recover, stepdone, complete |
| Flower patch |  | default | FLOWER PATCH | `#F6339A` on `#FFF4FA` (gradient #FFF4FA→#FFF9FC) | 3.34:1 | 4.50:1 | text → `pink-700` `#C6005C` (5.50:1) | intro, ask, recover, stepdone, complete |
| Flower patch |  | default | Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Flower patch |  | default | · here's one just like it | `#A8A8A8` on `#FFFFFF` | 2.37:1 | 4.50:1 | text → `brand-neutral-55` `#737373` (4.74:1) | recover |
| Flower patch |  | default | +1bonus! | `#D97706` on `#FEF3E2` | 2.90:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.58:1) | complete |
| Arcade night |  | default | QUEST | `#FFFFFF` on `#2B7FFF` | 3.76:1 | 4.50:1 | surface → `blue-600` `#155DFC` (5.25:1) | intro, ask, recover, stepdone, complete |
| Arcade night |  | default | ARCADE NIGHT | `#2B7FFF` on `#F4F8FF` (gradient #F4F8FF→#F9FBFF) | 3.53:1 | 4.50:1 | text → `blue-600` `#155DFC` (4.93:1) | intro, ask, recover, stepdone, complete |
| Arcade night |  | default | Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Arcade night |  | default | · here's one just like it | `#A8A8A8` on `#FFFFFF` | 2.37:1 | 4.50:1 | text → `brand-neutral-55` `#737373` (4.74:1) | recover |
| Arcade night |  | default | +1bonus! | `#D97706` on `#FEF3E2` | 2.90:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.58:1) | complete |
| Star party |  | default | QUEST | `#FFFFFF` on `#8E51FF` | 4.40:1 | 4.50:1 | surface → `violet-600` `#7F22FE` (5.89:1) | intro, ask, recover, stepdone, complete |
| Star party |  | default | STAR PARTY | `#8E51FF` on `#F9F6FF` (gradient #F9F6FF→#FCFAFF) | 4.12:1 | 4.50:1 | text → `violet-600` `#7F22FE` (5.52:1) | intro, ask, recover, stepdone, complete |
| Star party |  | default | Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Star party |  | default | · here's one just like it | `#A8A8A8` on `#FFFFFF` | 2.37:1 | 4.50:1 | text → `brand-neutral-55` `#737373` (4.74:1) | recover |
| Star party |  | default | +1bonus! | `#D97706` on `#FEF3E2` | 2.90:1 | 4.50:1 | text → `amber-700` `#BB4D00` (4.58:1) | complete |
| Division ask |  | default | QUEST | `#FFFFFF` on `#00BBA7` | 2.42:1 | 4.50:1 | surface → `teal-700` `#00786F` (5.36:1) | ask |
| Division ask |  | default | LEFT OVER | `#A3A3A3` on `#FFFFFF` | 2.52:1 | 4.50:1 | text → `neutral-500` `#737373` (4.74:1) | ask |
| Division ask |  | default | Tap her share first — then the leftover. | `#9A92AC` on `#FFFFFF` | 2.96:1 | 4.50:1 | text → `mauve-500` `#79697B` (5.10:1) | ask |
| Division ask |  | default | SNACK TIME | `#00BBA7` on `#F3FBFA` (gradient #F3FBFA→#F7FDFC) | 2.31:1 | 4.50:1 | text → `teal-700` `#00786F` (5.10:1) | ask |
| Division ask |  | default | R | `#A3A3A3` on `#FFFFFF` (gradient #FFFFFF→#FFFFFF) | 2.52:1 | 3.00:1 | text → `neutral-500` `#737373` (4.74:1) | ask |
| Snack time | Let's go ✨ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | intro |
| Snack time | check | focus |  | focus indicator | 2.37:1 | 3.00:1 | Focus ring too faint against what it replaces. | ask |
| Snack time | Show next step ▸ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | recover |
| Snack time | Next snack ▸ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | stepdone |
| Snack time | Back to your world ✨ | focus |  | focus indicator | 2.21:1 | 3.00:1 | Focus ring too faint against what it replaces. | complete |
| Division ask | BUTTON | focus |  | focus indicator | 1.32:1 | 3.00:1 | Focus ring too faint against what it replaces. | ask |
| Division ask | remainder | default | R | `#A3A3A3` on `#FFFFFF` (gradient #FFFFFF→#FFFFFF) | 2.52:1 | 3.00:1 | text → `neutral-500` `#737373` (4.74:1) | ask |
| Division ask | remainder | hover | R | `#A3A3A3` on `#FFFFFF` (gradient #FFFFFF→#FFFFFF) | 2.52:1 | 3.00:1 | text → `neutral-500` `#737373` (4.74:1) | ask |
| Division ask | remainder | pressed | R | `#A3A3A3` on `#FFFFFF` (gradient #FFFFFF→#FFFFFF) | 2.52:1 | 3.00:1 | text → `neutral-500` `#737373` (4.74:1) | ask |
| Division ask | remainder | focus | R | `#A3A3A3` on `#FFFFFF` (gradient #FFFFFF→#FFFFFF) | 2.52:1 | 3.00:1 | text → `neutral-500` `#737373` (4.74:1) | ask |

_Fixes are proposals, not changes: each keeps the colour's hue and moves along its own Datum ramp. Choosing one is a colour decision._

## Snack time

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet is extra hungry today — a whole picnic! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 snacks to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| QUEST | `#FFFFFF` on `#00BBA7` | 11.5px bold | 2.42:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| SNACK TIME | `#00BBA7` on `#F2FBFA` ᵖ | 13px bold | 2.30:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| Snack 1 of 2 — solve it to fill the bowl | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 31 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 18 × 2 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#A8A8A8` on `#FFFFFF` | 14px | 2.37:1 | 4.50:1 | ❌ | recover |
| Snack 1 of 2 — gobbled up! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 snack to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next snack ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| What a feast! Your pet is doing the happy dance. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#D97706` on `#FEF3E2` | 14.5px bold | 2.90:1 | 4.50:1 | ❌ | complete |

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
| This tree needs a big drink today! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 splashes to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| QUEST | `#FFFFFF` on `#00A63E` | 11.5px bold | 3.21:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| WATER THE TREE | `#00A63E` on `#F2FAF5` ᵖ | 13px bold | 3.03:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| Splash 1 of 2 — solve it to fill the can | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 27 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 28 × 2 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#A8A8A8` on `#FFFFFF` | 14px | 2.37:1 | 4.50:1 | ❌ | recover |
| Splash 1 of 2 — glug glug! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 splash to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next splash ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The tree is blooming! Look at it go. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#D97706` on `#FEF3E2` | 14.5px bold | 2.90:1 | 4.50:1 | ❌ | complete |

## Bakery run

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Big order at the bakery — time to bake! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 batches to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| QUEST | `#FFFFFF` on `#E17100` | 11.5px bold | 3.19:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| BAKERY RUN | `#E17100` on `#FDF8F3` ᵖ | 13px bold | 3.03:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| Batch 1 of 2 — solve it to mix the dough | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 49 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 24 × 5 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#A8A8A8` on `#FFFFFF` | 14px | 2.37:1 | 4.50:1 | ❌ | recover |
| Batch 1 of 2 — golden and warm! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 batch to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next batch ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The oven is full! It smells amazing. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#D97706` on `#FEF3E2` | 14.5px bold | 2.90:1 | 4.50:1 | ❌ | complete |

## Flower patch

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Let’s fill this whole patch with flowers! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 seeds to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| QUEST | `#FFFFFF` on `#F6339A` | 11.5px bold | 3.58:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| FLOWER PATCH | `#F6339A` on `#FFF4FA` ᵖ | 13px bold | 3.34:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| Seed 1 of 2 — solve it to plant a seed | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 30 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 33 × 6 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#A8A8A8` on `#FFFFFF` | 14px | 2.37:1 | 4.50:1 | ❌ | recover |
| Seed 1 of 2 — planted! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 seed to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next seed ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| The whole patch is blooming! | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#D97706` on `#FEF3E2` | 14.5px bold | 2.90:1 | 4.50:1 | ❌ | complete |

## Arcade night

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Arcade night — bright lights, big prizes! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 rounds to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| QUEST | `#FFFFFF` on `#2B7FFF` | 11.5px bold | 3.76:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| ARCADE NIGHT | `#2B7FFF` on `#F4F8FF` ᵖ | 13px bold | 3.53:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| Round 1 of 2 — solve it to take your shot | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 49 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 3 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 32 × 6 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#A8A8A8` on `#FFFFFF` | 14px | 2.37:1 | 4.50:1 | ❌ | recover |
| Round 1 of 2 — bullseye! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 round to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next round ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| High score! The arcade lights up for you. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#D97706` on `#FEF3E2` | 14.5px bold | 2.90:1 | 4.50:1 | ❌ | complete |

## Star party

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Star party tonight — the sky is showing off! | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | intro |
| 2 stars to go — finish them all for a bonus gem! | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | intro |
| Finish-the-quest bonus: +1 | `#6E6E6E` on `#FAFAFA` | 13.5px | 4.88:1 | 4.50:1 | ✅ | intro |
| Let's go ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | intro |
| QUEST | `#FFFFFF` on `#8E51FF` | 11.5px bold | 4.40:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| STAR PARTY | `#8E51FF` on `#F9F6FF` ᵖ | 13px bold | 4.12:1 | 4.50:1 | ❌ | intro, ask, recover, stepdone, complete |
| Star 1 of 2 — solve it to spot a star | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | ask |
| 36 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| × | `#6E6E6E` on `#FFFFFF` | 40px (large) | 5.09:1 | 3.00:1 | ✅ | ask, recover |
| 5 | `#262626` on `#FFFFFF` | 46px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask, recover |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Check | `#FFFFFF` on `#2D6DF6` | 16px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| Type your answer, then tap Check | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| Let's look at one together 💡 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | recover |
| No worries — the quest waits. Follow the steps, then try aga | `#6E6E6E` on `#FFFFFF` | 15px | 5.09:1 | 4.50:1 | ✅ | recover |
| Your problem: | `#6E6E6E` on `#FFFFFF` | 14px | 5.09:1 | 4.50:1 | ✅ | recover |
| 17 × 2 | `#262626` on `#FFFFFF` | 14px bold | 15.13:1 | 4.50:1 | ✅ | recover |
| Line up the ones, with the × underneath. | `#262626` on `#EFF4FF` | 17px | 13.73:1 | 4.50:1 | ✅ | recover |
| Show next step ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| I've got it | `#2D6DF6` on `#FFFFFF` | 17px bold | 4.53:1 | 4.50:1 | ✅ | recover |
| · here's one just like it | `#A8A8A8` on `#FFFFFF` | 14px | 2.37:1 | 4.50:1 | ❌ | recover |
| Star 1 of 2 — spotted! | `#262626` on `#FFFFFF` | 24px bold (large) | 15.13:1 | 3.00:1 | ✅ | stepdone |
| +1· 1 star to go | `#6E6E6E` on `#FFFFFF` | 15.5px | 5.09:1 | 4.50:1 | ✅ | stepdone |
| Next star ▸ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | stepdone |
| Quest complete! 🎉 | `#262626` on `#FFFFFF` | 26px bold (large) | 15.13:1 | 3.00:1 | ✅ | complete |
| A whole constellation — name it anything you like. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | complete |
| +2earned | `#262626` on `#FAFAFA` | 14.5px bold | 14.49:1 | 4.50:1 | ✅ | complete |
| Back to your world ✨ | `#FFFFFF` on `#2D6DF6` | 17px bold | 4.53:1 | 4.50:1 | ✅ | complete |
| +1bonus! | `#D97706` on `#FEF3E2` | 14.5px bold | 2.90:1 | 4.50:1 | ❌ | complete |

## Division ask

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| Your pet wants a snack! Solve it to fill the bowl. | `#6E6E6E` on `#FFFFFF` | 16px | 5.09:1 | 4.50:1 | ✅ | ask |
| 12 | `#262626` on `#FFFFFF` | 42px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| ÷ | `#6E6E6E` on `#FFFFFF` | 32px (large) | 5.09:1 | 3.00:1 | ✅ | ask |
| 8 | `#262626` on `#FFFFFF` | 42px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| EACH SHARE | `#2D6DF6` on `#FFFFFF` | 10px bold | 4.53:1 | 4.50:1 | ✅ | ask |
| 1 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 2 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 3 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 4 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 5 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 6 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 7 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 9 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| 0 | `#262626` on `#FFFFFF` | 22px bold (large) | 15.13:1 | 3.00:1 | ✅ | ask |
| Show me how 🔎 | `#6E5BC0` on `#FFFFFF` | 13.5px bold | 5.35:1 | 4.50:1 | ✅ | ask |
| QUEST | `#FFFFFF` on `#00BBA7` | 11.5px bold | 2.42:1 | 4.50:1 | ❌ | ask |
| LEFT OVER | `#A3A3A3` on `#FFFFFF` | 10px bold | 2.52:1 | 4.50:1 | ❌ | ask |
| Tap her share first — then the leftover. | `#9A92AC` on `#FFFFFF` | 12.5px | 2.96:1 | 4.50:1 | ❌ | ask |
| SNACK TIME | `#00BBA7` on `#F3FBFA` ᵖ | 13px bold | 2.31:1 | 4.50:1 | ❌ | ask |
| R | `#A3A3A3` on `#FFFFFF` ᵖ | 28px bold (large) | 2.52:1 | 3.00:1 | ❌ | ask |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.51:1 | ✅ 4.62:1 | ask |
| BUTTON | — | — | — | — | ❌ 1.32:1 | ask |
| remainder | ❌ 2.52:1 | ❌ 2.52:1 | ❌ 2.52:1 | ❌ 2.52:1 | ✅ 5.98:1 | ask |
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
