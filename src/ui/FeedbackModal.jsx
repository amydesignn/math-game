/*
 * FeedbackModal.jsx — the kid-facing Feedback card, lifted 1:1 from Oscar's
 * "Luxi Feedback Flow.dc.html" (2026-08-31, pass-2 golden-4px governed;
 * handoff: ~/Downloads/delivery/Feedback Flow - Handoff for Nathan.md).
 *
 * THE SHAPE (Amy's 2026-08-31 contract): rating 1–5 stars REQUIRED — rating
 * alone is a complete submission; "What do you love?" + "What could be
 * better?" both optional ≤500, both always shown to everyone, never gated by
 * the rating (gating would lead the answer). ZERO PII — the no-personal-info
 * guardrail copy is locked, verbatim from the comp.
 *
 * STATES: compose → thanks → (gentle fail). Adaptations vs the comp, each
 * deliberate:
 *  · The MENU state is not lifted — in the shipped app the entry is the
 *    Settings gear's "Send Feedback" row (Oscar's own trigger note); the
 *    standalone menu was for Amy to see the entry either way.
 *  · The SENDING state is not routed — Oscar's seam #2 says the real wiring
 *    is OPTIMISTIC: thanks immediately, insert behind, so a slow network
 *    never makes a kid wait. Fail surfaces only if the insert truly fails
 *    WHILE the card is still open (payload retained — "Try again" needs no
 *    retyping); if the kid already left, App quietly retries once instead
 *    (feedback.js) — a modal must never re-open over gameplay.
 *  · Hover/focus/active styles live in index.css (.luxiFb*), not inline —
 *    the standing inline-beats-:hover lesson (luxiFooter, luxiOb, su-, dv-).
 *  · Press depth governed translateY(3)→(4) + shadow 1→0, matching the
 *    onboarding's 09-19 golden-4px press snap (final-touch governance).
 *  · Demo chrome (faux backdrop, seam cards, state chips) — not shipped.
 */
import { useRef, useState } from 'react'

// Datum tokens by name (Amy's map: Iris = text + anything WCAG; Lilac = supporting detail)
const IRIS = 'var(--brand-iris-500)', // Luxi 3D button face (was iris-600 — the one primary off the Iris 500 spec; aligned 2026-10-05, Amy)
  IRISD = 'var(--brand-iris-700)'
const EMPTY = 'var(--color-border-interactive-default)' // neutral-500, 4.74:1 — an unselected star is a
// RESTING control: a hollow outline in the same token as the textarea border (Amy, 2026-10-04).
// each star a fixed happy hue, warming across the row and paying off on brand violet. (Oscar)
// Darkened to Datum steps that reach WCAG non-text 3:1 on white — the stars are the
// rating CONTROL, not decoration (Amy, 2026-10-04, option B: no brown yellow).
// Star 5 moved Lilac → Iris so a 5-star rating never matches the empty star.
const STARCOLORS = ['var(--red-500)', 'var(--orange-600)', 'var(--amber-600)', 'var(--amber-700)', 'var(--brand-iris-500)'] // 3.8 · 3.6 · 3.2 · 5.0 · 4.6
const STARGLOW = STARCOLORS.map((c) => 'color-mix(in srgb, ' + c + ' 40%, transparent)')
// caption per rating — playful, kid-voiced. index 0 = no rating yet. (Oscar, verbatim)
const CAPTIONS = ['Tap the stars!', "Aw — we'll do better 🙏", 'Noted, thank you', "Glad you're here 🙂", 'Yay, thank you! 🎉', 'You love it?! 💜']

// hollow = unselected: outline only (WCAG 1.4.11's own passing star pattern — the
// state reads by SHAPE, ☆ vs ★, not just colour). Selected stars stay solid.
function Star({ hollow = false }) {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill={hollow ? 'none' : 'currentColor'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.4l2.7 5.9 6.4.6c.5.05.7.66.3 1l-4.9 4.3 1.5 6.3c.12.5-.42.9-.86.62L12 17.9l-5.64 3.12c-.44.28-.98-.12-.86-.62l1.5-6.3-4.9-4.3c-.4-.34-.2-.95.3-1l6.4-.6z" />
    </svg>
  )
}

// Datum type tokens by name (Step 3, Amy 2026-10-04): size + line-height travel together;
// body copy = normal (400), button labels = medium (500), headings/labels = bold (700).
const TYPE = {
  xs: { fontSize: 'var(--text-xs)', lineHeight: 'var(--text-xs--line-height)' },
  sm: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)' },
  base: { fontSize: 'var(--text-base)', lineHeight: 'var(--text-base--line-height)' },
  xl: { fontSize: 'var(--text-xl)', lineHeight: 'var(--text-xl--line-height)' },
}
const W = { normal: 'var(--font-weight-normal)', medium: 'var(--font-weight-medium)', bold: 'var(--font-weight-bold)' }
const heading = { ...TYPE.xl, fontWeight: W.bold, color: 'var(--color-text-brand)' } // one branded heading style across every popup state (Amy)

const primaryBtn = {
  width: '100%',
  height: 48,
  borderRadius: 12,
  border: 'none',
  ...TYPE.base,
  fontWeight: W.medium, // button labels = medium (Amy's weight rule)
  background: IRIS,
  color: 'var(--brand-neutral-00)',
  boxShadow: '0 4px 0 ' + IRISD,
  cursor: 'pointer',
}
const fieldLabel = { ...TYPE.base, fontWeight: W.medium, color: 'var(--color-text-brand)' } // the question leads (Amy)
const optionalTag = { fontWeight: W.medium, color: 'var(--color-text-tertiary)' } // the hint steps back

/**
 * onSubmit(payload) → Promise (resolve = row written, reject = truly failed).
 * onLostSubmit(payload) — insert failed after the card closed (quiet retry).
 * onClose() — ✕ / tap-outside / Not now / Back to the game. Non-destructive:
 * the game was never paused; nothing else to restore.
 */
export function FeedbackModal({ onSubmit, onLostSubmit, onClose }) {
  const [phase, setPhase] = useState('compose') // compose | thanks | fail
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [liked, setLiked] = useState('')
  const [improve, setImprove] = useState('')
  const openRef = useRef(true) // still mounted? decides fail-card vs quiet retry
  openRef.current = true

  const close = () => {
    openRef.current = false
    onClose?.()
  }

  // OPTIMISTIC (Oscar's seam #2): thanks first, insert behind.
  const submit = () => {
    if (rating === 0) return
    const payload = { rating, liked, improve }
    setPhase('thanks')
    Promise.resolve()
      .then(() => onSubmit?.(payload))
      .catch(() => {
        if (openRef.current) setPhase('fail') // payload retained — Try again re-submits, no retyping
        else onLostSubmit?.(payload)
      })
  }

  const shown = hover || rating // hover previews, tap commits (Oscar)
  const canSend = rating > 0
  const likedLeft = 500 - liked.length
  const improveLeft = 500 - improve.length

  return (
    <div
      // stopPropagation so a tap on the overlay never falls through to the R3F
      // canvas and walks the character (the standing overlay-over-canvas rule).
      onPointerDown={(e) => e.stopPropagation()}
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--brand-lilac-950) 50%, transparent)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'scrimIn .25s ease-out both' }} />

      <div role="dialog" aria-modal="true" aria-labelledby="luxiFb-title" style={{ position: 'relative', width: 'min(400px, calc(100vw - 32px))', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', background: 'var(--brand-neutral-00)', border: '1.5px solid color-mix(in srgb, var(--brand-lilac-950) 10%, transparent)', borderRadius: 24, boxShadow: '0 24px 60px rgba(50,38,80,.32), 0 4px 16px rgba(50,38,80,.14)', animation: 'fbPopIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px', background: 'linear-gradient(180deg, var(--brand-lilac-50), var(--brand-neutral-00))', borderBottom: '1px solid var(--brand-lilac-100)' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>💬</span>
          <span id="luxiFb-title" style={{ ...TYPE.xs, fontWeight: W.bold, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--color-text-brand)' }}>Feedback</span>
          <div style={{ flex: 1 }} />
          <button aria-label="Close" onClick={close} className="luxiFb-close" style={{ border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', color: 'var(--neutral-500)', fontSize: 16, lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* ── COMPOSE ── */}
        {phase === 'compose' && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
              <div style={{ ...heading, textWrap: 'pretty' }}>How many stars for Luxi?</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= shown
                  return (
                    <button
                      key={n}
                      aria-label={n + (n === 1 ? ' star' : ' stars')}
                      aria-pressed={rating === n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      className="luxiFb-star"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: on ? 'scale(1.1)' : 'scale(1)', transition: 'transform .18s cubic-bezier(.2,.9,.3,1.7)' }}
                    >
                      <span style={{ display: 'flex', color: on ? STARCOLORS[n - 1] : EMPTY, filter: on ? 'drop-shadow(0 3px 6px ' + STARGLOW[n - 1] + ')' : 'none' }}>
                        <Star hollow={!on} />
                      </span>
                    </button>
                  )
                })}
              </div>
              <div style={{ ...TYPE.base, fontWeight: W.medium, color: shown > 0 ? 'var(--color-text-brand)' : 'var(--brand-iris-500)', minHeight: 20, whiteSpace: 'nowrap' }}>{CAPTIONS[shown] || CAPTIONS[0]}</div>
            </div>

            <div style={{ height: 1, background: 'var(--brand-lilac-100)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={fieldLabel}>
                What do you love? <span style={optionalTag}>(optional)</span>
              </div>
              <textarea placeholder="My favorite thing is…" value={liked} onChange={(e) => setLiked(e.target.value.slice(0, 500))} maxLength={500} rows={2} className="luxiFb-ta" style={{ width: '100%', resize: 'none', borderRadius: 12, padding: '12px 16px', ...TYPE.base, fontWeight: W.normal, color: 'var(--neutral-800)', background: 'var(--brand-neutral-00)', fontFamily: 'inherit' }} />
              <div style={{ textAlign: 'right', ...TYPE.sm, fontWeight: W.medium, color: likedLeft <= 40 ? 'var(--amber-700)' : 'var(--color-text-tertiary)' }}>{likedLeft} characters left</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={fieldLabel}>
                What could be better? <span style={optionalTag}>(optional)</span>
              </div>
              <textarea placeholder="I wish Luxi…" value={improve} onChange={(e) => setImprove(e.target.value.slice(0, 500))} maxLength={500} rows={2} className="luxiFb-ta" style={{ width: '100%', resize: 'none', borderRadius: 12, padding: '12px 16px', ...TYPE.base, fontWeight: W.normal, color: 'var(--neutral-800)', background: 'var(--brand-neutral-00)', fontFamily: 'inherit' }} />
              <div style={{ textAlign: 'right', ...TYPE.sm, fontWeight: W.medium, color: improveLeft <= 40 ? 'var(--amber-700)' : 'var(--color-text-tertiary)' }}>{improveLeft} characters left</div>
            </div>

            {/* no-PII guardrail (LOCKED copy — baked into the contract) */}
            <div style={{ ...TYPE.sm, fontWeight: W.normal, color: 'var(--color-text-brand)', textAlign: 'center', textWrap: 'pretty' }}>💎 No personal info please, just ideas. We only note which world you're in — never who you are.</div>

            <button
              onClick={submit}
              disabled={!canSend}
              className="luxiFb-press"
              style={{
                ...primaryBtn,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                // disabled = a RESTING control → neutral (Amy's rule). The label is an instruction, so it
                // stays readable: text-secondary on bg-interactive-disabled = 7.17:1.
                background: canSend ? IRIS : 'var(--color-background-interactive-disabled)',
                color: canSend ? 'var(--brand-neutral-00)' : 'var(--color-text-disabled)',
                boxShadow: canSend ? '0 4px 0 ' + IRISD : '0 4px 0 var(--color-border-disabled)',
                cursor: canSend ? 'pointer' : 'default',
              }}
            >
              <span>{canSend ? 'Send feedback' : 'Tap the stars to send'}</span>
            </button>
          </div>
        )}

        {/* ── THANK YOU ── */}
        {phase === 'thanks' && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(160deg, var(--brand-lilac-100), var(--brand-lilac-200))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, animation: 'fbPop .5s cubic-bezier(.2,.9,.3,1.3) both' }}>💎</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={heading}>Thanks for the idea!</div>
              <div style={{ ...TYPE.base, fontWeight: W.normal, color: 'var(--color-text-secondary)', textWrap: 'pretty' }}>Your feedback goes straight to the team building Luxi. Keep exploring! ✨</div>
            </div>
            <button onClick={close} className="luxiFb-press" style={{ ...primaryBtn, marginTop: 4 }}>
              Back to the game
            </button>
          </div>
        )}

        {/* ── GENTLE FAILURE — never blocks play, never loses text ── */}
        {phase === 'fail' && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--orange-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🌙</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={heading}>We'll try again in a bit</div>
              <div style={{ ...TYPE.base, fontWeight: W.normal, color: 'var(--color-text-secondary)', textWrap: 'pretty' }}>Couldn't send just now — your idea is safe and nothing's lost. You can keep playing.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              <button onClick={submit} className="luxiFb-press" style={primaryBtn}>
                Try again
              </button>
              <button onClick={close} className="luxiFb-notnow" style={{ width: '100%', height: 44, border: 'none', background: 'transparent', color: 'var(--color-text-secondary)', ...TYPE.base, fontWeight: W.medium, cursor: 'pointer', borderRadius: 8 }}>
                Not now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
