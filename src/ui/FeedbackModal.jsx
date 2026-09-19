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

const IRIS = '#4B54DD',
  IRISD = '#3D43BE'
const EMPTY = '#E6DEF5'
// each star a fixed happy hue, warming across the row and paying off on brand violet. (Oscar)
const STARCOLORS = ['#FF8E72', '#FFA94D', '#FFC53D', '#FFD93D', '#8E7BF2']
const STARGLOW = ['rgba(255,142,114,.4)', 'rgba(255,169,77,.4)', 'rgba(255,197,61,.4)', 'rgba(255,217,61,.4)', 'rgba(142,123,242,.4)']
// caption per rating — playful, kid-voiced. index 0 = no rating yet. (Oscar, verbatim)
const CAPTIONS = ['Tap the stars!', "Aw — we'll do better 🙏", 'Noted, thank you', "Glad you're here 🙂", 'Yay, thank you! 🎉', 'You love it?! 💜']

function Star() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.4l2.7 5.9 6.4.6c.5.05.7.66.3 1l-4.9 4.3 1.5 6.3c.12.5-.42.9-.86.62L12 17.9l-5.64 3.12c-.44.28-.98-.12-.86-.62l1.5-6.3-4.9-4.3c-.4-.34-.2-.95.3-1l6.4-.6z" />
    </svg>
  )
}

const primaryBtn = {
  width: '100%',
  height: 48,
  borderRadius: 12,
  border: 'none',
  fontSize: 16,
  fontWeight: 700,
  background: IRIS,
  color: '#fff',
  boxShadow: '0 4px 0 ' + IRISD,
  cursor: 'pointer',
}
const fieldLabel = { fontSize: 15, fontWeight: 700, color: '#262626' }
const optionalTag = { fontWeight: 600, color: '#9a92ac' }

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
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(47,38,83,.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'scrimIn .25s ease-out both' }} />

      <div style={{ position: 'relative', width: 'min(400px, calc(100vw - 32px))', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', background: '#fff', border: '1.5px solid rgba(74,54,110,.10)', borderRadius: 24, boxShadow: '0 24px 60px rgba(50,38,80,.32), 0 4px 16px rgba(50,38,80,.14)', animation: 'fbPopIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px', background: 'linear-gradient(180deg, rgba(110,91,192,.09), #fff)', borderBottom: '1px solid #EDE7FC' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>💬</span>
          <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: '#6E5BC0' }}>Feedback</span>
          <div style={{ flex: 1 }} />
          <button aria-label="Close" onClick={close} className="luxiFb-close" style={{ border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', color: '#6e6e6e', fontSize: 16, lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* ── COMPOSE ── */}
        {phase === 'compose' && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#262626', lineHeight: 1.2, textWrap: 'pretty' }}>How many stars for Luxi?</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= shown
                  return (
                    <button
                      key={n}
                      aria-label={n + (n === 1 ? ' star' : ' stars')}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      className="luxiFb-star"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: on ? 'scale(1.1)' : 'scale(1)', transition: 'transform .18s cubic-bezier(.2,.9,.3,1.7)' }}
                    >
                      <span style={{ display: 'flex', color: on ? STARCOLORS[n - 1] : EMPTY, filter: on ? 'drop-shadow(0 3px 6px ' + STARGLOW[n - 1] + ')' : 'none' }}>
                        <Star />
                      </span>
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: shown > 0 ? '#5B44C4' : '#9a92ac', minHeight: 20, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{CAPTIONS[shown] || CAPTIONS[0]}</div>
            </div>

            <div style={{ height: 1, background: '#F1ECF8' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={fieldLabel}>
                What do you love? <span style={optionalTag}>(optional)</span>
              </div>
              <textarea placeholder="My favorite thing is…" value={liked} onChange={(e) => setLiked(e.target.value.slice(0, 500))} maxLength={500} rows={2} className="luxiFb-ta" style={{ width: '100%', resize: 'none', borderRadius: 12, padding: '12px 16px', fontSize: 15, color: '#262626', background: '#fff', lineHeight: 1.45, fontFamily: 'inherit' }} />
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: likedLeft <= 40 ? '#B45309' : '#b5aec4' }}>{likedLeft} characters left</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={fieldLabel}>
                What could be better? <span style={optionalTag}>(optional)</span>
              </div>
              <textarea placeholder="I wish Luxi…" value={improve} onChange={(e) => setImprove(e.target.value.slice(0, 500))} maxLength={500} rows={2} className="luxiFb-ta" style={{ width: '100%', resize: 'none', borderRadius: 12, padding: '12px 16px', fontSize: 15, color: '#262626', background: '#fff', lineHeight: 1.45, fontFamily: 'inherit' }} />
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: improveLeft <= 40 ? '#B45309' : '#b5aec4' }}>{improveLeft} characters left</div>
            </div>

            {/* no-PII guardrail (LOCKED copy — baked into the contract) */}
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#8A7FB8', lineHeight: 1.5, textAlign: 'center', textWrap: 'pretty' }}>💎 No personal info please, just ideas. We only note which world you're in — never who you are.</div>

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
                background: canSend ? IRIS : '#EDEBF2',
                color: canSend ? '#fff' : '#b5aec4',
                boxShadow: canSend ? '0 4px 0 ' + IRISD : '0 4px 0 #dcd8e4',
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
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(160deg, #EDE7FC, #E4E5FA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, animation: 'fbPop .5s cubic-bezier(.2,.9,.3,1.3) both' }}>💎</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#262626', lineHeight: 1.2 }}>Thanks for the idea!</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#6e6e6e', lineHeight: 1.5, textWrap: 'pretty' }}>Your feedback goes straight to the team building Luxi. Keep exploring! ✨</div>
            </div>
            <button onClick={close} className="luxiFb-press" style={{ ...primaryBtn, marginTop: 4 }}>
              Back to the game
            </button>
          </div>
        )}

        {/* ── GENTLE FAILURE — never blocks play, never loses text ── */}
        {phase === 'fail' && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🌙</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#262626', lineHeight: 1.2 }}>We'll try again in a bit</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#6e6e6e', lineHeight: 1.5, textWrap: 'pretty' }}>Couldn't send just now — your idea is safe and nothing's lost. You can keep playing.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              <button onClick={submit} className="luxiFb-press" style={primaryBtn}>
                Try again
              </button>
              <button onClick={close} className="luxiFb-notnow" style={{ width: '100%', height: 44, border: 'none', background: 'transparent', color: '#6e6e6e', fontWeight: 600, fontSize: 15, cursor: 'pointer', borderRadius: 8 }}>
                Not now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
