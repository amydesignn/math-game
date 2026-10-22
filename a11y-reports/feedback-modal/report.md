# Contrast audit — FeedbackModal

**Standard:** WCAG 2.2 AA · **Source:** `src/ui/FeedbackModal.jsx` · **Run:** 2026-10-22 13:00 UTC  
**Variants:** Feedback · **Phases:** default → rated-1 → rated-5 → text-entered → near-limit → thanks → fail

> **86 unique checks · 84 pass · 0 fail · 1 exempt (disabled) · 0 need review**

**Rules applied**

- **1.4.3 Text contrast:** 4.5:1 for body text · 3:1 for large text (≥ 24px, or ≥ 18.66px bold).
- **1.4.11 Non-text contrast / 2.4.7 Focus visible:** a focus indicator must be visible, and its strongest ring covering half the control’s perimeter must reach 3:1 against the colours it replaces (AA asks for a visible 3:1 change; an unbroken ring is AAA 2.4.13). Coverage = share of the edge at ≥ 3:1. Icon-only glyphs (✕, ⌫) are graphics: 3:1.
- **Disabled is exempt:** WCAG 1.4.3 exempts text in inactive UI components. Disabled controls are measured and listed for transparency, never counted as failures.
- Every interactive element is checked in **default · hover · pressed · focus**, driven with real mouse/keyboard input. Gradients and images are scored pixel by pixel (worst 5% of the background wins).

## Failures to fix (0)

None — every check passes WCAG 2.2 AA. 🎉

## Feedback

### Text

| Text | Colour on surface | Size | Ratio | Needs | Result | Seen in |
|---|---|---|---|---|---|---|
| How many stars for Luxi? | `#3D43BE` on `#FFFFFF` | 20px bold (large) | 7.65:1 | 3.00:1 | ✅ | default, rated-1, rated-5, text-entered, near-limit |
| Tap the stars! | `#6169E0` on `#FFFFFF` | 16px | 4.55:1 | 4.50:1 | ✅ | default |
| What do you love? (optional) | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | default, rated-1, rated-5, text-entered, near-limit |
| (optional) | `#737373` on `#FFFFFF` | 16px | 4.74:1 | 4.50:1 | ✅ | default, rated-1, rated-5, text-entered, near-limit |
|  | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | default, rated-1, rated-5 |
| 500 characters left | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | default, rated-1, rated-5 |
| What could be better? (optional) | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | default, rated-1, rated-5, text-entered, near-limit |
| 💎 No personal info please, just ideas. We only note which w | `#3D43BE` on `#FFFFFF` | 14px | 7.65:1 | 4.50:1 | ✅ | default, rated-1, rated-5, text-entered, near-limit |
| FEEDBACK | `#3D43BE` on `#F9F7FF` ᵖ | 12px bold | 7.20:1 | 4.50:1 | ✅ | default, rated-1, rated-5, text-entered, near-limit, thanks, fail |
| Aw — we'll do better 🙏 | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | rated-1 |
| Send feedback | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | rated-1, rated-5, text-entered, near-limit |
| You love it?! 💜 | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | rated-5 |
| Yay, thank you! 🎉 | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | text-entered |
| Building my garden and the cat! | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | text-entered |
| 469 characters left | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | text-entered |
| More worlds with snow please | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | text-entered |
| 472 characters left | `#737373` on `#FFFFFF` | 14px | 4.74:1 | 4.50:1 | ✅ | text-entered |
| Glad you're here 🙂 | `#3D43BE` on `#FFFFFF` | 16px | 7.65:1 | 4.50:1 | ✅ | near-limit |
| aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | near-limit |
| 30 characters left | `#BB4D00` on `#FFFFFF` | 14px | 5.03:1 | 4.50:1 | ✅ | near-limit |
| bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | `#262626` on `#FFFFFF` | 16px | 15.13:1 | 4.50:1 | ✅ | near-limit |
| 10 characters left | `#BB4D00` on `#FFFFFF` | 14px | 5.03:1 | 4.50:1 | ✅ | near-limit |
| Thanks for the idea! | `#3D43BE` on `#FFFFFF` | 20px bold (large) | 7.65:1 | 3.00:1 | ✅ | thanks |
| Your feedback goes straight to the team building Luxi. Keep  | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | thanks |
| Back to the game | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | thanks |
| We'll try again in a bit | `#3D43BE` on `#FFFFFF` | 20px bold (large) | 7.65:1 | 3.00:1 | ✅ | fail |
| Couldn't send just now — your idea is safe and nothing's los | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | fail |
| Try again | `#FFFFFF` on `#6169E0` | 16px | 4.55:1 | 4.50:1 | ✅ | fail |
| Not now | `#525252` on `#FFFFFF` | 16px | 7.81:1 | 4.50:1 | ✅ | fail |

### Interactive elements — every state

| Element | Default | Hover | Pressed | Focus (text) | Focus indicator | Seen in |
|---|---|---|---|---|---|---|
| Close | ✅ 3.94:1 | ✅ 3.28:1 | ✅ 3.28:1 | ✅ 3.94:1 | ✅ 3.94:1 · 70% of edge | default, rated-1, rated-5, text-entered, near-limit, thanks, fail |
| 1 star | — | — | — | — | ✅ 7.65:1 · 100% of edge | default, rated-1, rated-5, text-entered, near-limit |
| 2 stars | — | — | — | — | ✅ 7.65:1 · 100% of edge | default, rated-1, rated-5, text-entered, near-limit |
| 3 stars | — | — | — | — | ✅ 7.65:1 · 100% of edge | default, rated-1, rated-5, text-entered, near-limit |
| 4 stars | — | — | — | — | ✅ 7.65:1 · 100% of edge | default, rated-1, rated-5, text-entered, near-limit |
| 5 stars | — | — | — | — | ✅ 7.65:1 · 100% of edge | default, rated-1, rated-5, text-entered, near-limit |
| TEXTAREA | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 95% of edge | default, rated-1, rated-5 |
| Tap the stars to send | ⚪ disabled 2.37:1 — exempt (WCAG 1.4.3) | | | | | default |
| Send feedback | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 53% of edge | rated-1, rated-5, text-entered, near-limit |
| Building my garden and the cat! | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 95% of edge | text-entered |
| More worlds with snow please | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 95% of edge | text-entered |
| aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 96% of edge | near-limit |
| bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 15.13:1 | ✅ 5.81:1 · 96% of edge | near-limit |
| Back to the game | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 53% of edge | thanks |
| Try again | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 4.55:1 | ✅ 6.49:1 · 53% of edge | fail |
| Not now | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.81:1 | ✅ 7.65:1 · 99% of edge | fail |

---

ᵖ = measured by pixel sampling (gradient or image behind the text). Screenshots of every phase sit next to this report.

_Generated by Datum `tooling/contrast-audit` — axe-core engine + real-input state driving + pixel fallback._
