/*
 * Onboarding.jsx — the first-run "How to Play" walkthrough.
 * Lifted 1:1 from Oscar's two comps (~/Downloads/handoff — onboarding/, 2026-09-19):
 *   · "Onboarding Card.dc.html"  → <OnboardingCard> (the 5-step carousel)
 *   · "Luxi Onboarding.dc.html"  → the modal-overlay frame around it
 * Oscar's newer design-code (.dc) export — inline styles + style-hover/active
 * attributes, same format as the Door footer. Lifted verbatim; adaptations are
 * commented at their site.
 *
 * TWO ENTRY POINTS, ONE COMPONENT (App wires both):
 *   1. FIRST RUN — shows once over the Door the first time someone plays, then
 *      never again (store.seenOnboarding; migration seeds existing saves true so
 *      Ivy/Amy are never re-onboarded). "Once and gone."
 *   2. SETTINGS → How to Play — the gear row opens this same modal; it REPLACES
 *      the old in-sheet 3-step text list (Settings.jsx).
 *
 * We only ever use Oscar's MODAL chrome. His INLINE chrome (an eyebrow + a 16:9
 * image-slot, for a marketing webpage) is intentionally NOT lifted — the app has
 * no media to show there and never renders the card inline.
 *
 * Colours are Oscar's exact comp values (his onboarding primary is #7C6CE8, a
 * touch lighter than the app IRIS #4B54DD — his design intent for this card).
 * Hover/active + the entrance animation live in index.css (.luxiOb-*): an inline
 * style overrides a CSS :hover, so interactive states can't be inline (same
 * lesson as .luxiFooter / su* / dv*).
 */
import { useState } from 'react'

// Oscar's four core steps + a fifth "What's next" step (verbatim copy).
//
// `media` is an optional per-step image — the illustration / screenshot / GIF
// slot from Oscar's INLINE variant, brought into the modal (Amy's ask). It is
// baked in as an asset like the world-card art, NOT a runtime upload: drop a
// file in public/onboarding/ and set its path here. A step with media:null just
// shows text and the image box collapses, so images can be added one at a time.
const CORE = [
  { num: 1, title: 'Pick your character & map', body: 'Choose your character and a companion, then pick a map to explore.', media: '/onboarding/step-1.jpg' },
  { num: 2, title: 'Explore & collect gems', body: 'Guide your character across the map. Visit the gem and bonus stations and answer math questions to collect gems.', media: '/onboarding/step-2.jpg' },
  { num: 3, title: 'Build your world', body: 'Spend your gems on assets to build a world that’s entirely your own.', media: '/onboarding/step-3.jpg' },
  { num: 4, title: 'Add some sparkle', body: 'Treat your character to a sparkle trail and other playful extras.', media: '/onboarding/step-4.jpg' },
]

function BackChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

/**
 * The 5-step carousel. Owns its own step cursor (like Oscar's comp).
 * onClose = the header back-control (dismiss). onFinish = the final CTA.
 */
export function OnboardingCard({ onClose, onFinish }) {
  const [step, setStep] = useState(0)
  const total = CORE.length + 1 // + the "What's next" step
  const isWhatsNext = step === CORE.length
  const cur = isWhatsNext ? null : CORE[step]

  // Progress dots: one per core step + one for "What's next" (Oscar's rule —
  // current = pill, already-passed = faded lilac, future = light).
  const dots = []
  for (let i = 0; i < CORE.length; i++) {
    dots.push({ w: i === step ? 22 : 8, bg: i === step ? '#7C6CE8' : i < step ? '#C6BEEC' : '#E6E1F3' })
  }
  dots.push({ w: isWhatsNext ? 22 : 8, bg: isWhatsNext ? '#7C6CE8' : '#E6E1F3' })

  const next = () => setStep((s) => Math.min(s + 1, total - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div
      className="luxiOb-card"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        width: '100%',
        background: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(74,54,110,.22), inset 0 0 0 1px rgba(255,255,255,.6)',
      }}
    >
      {/* Header — modal chrome: back-control + title */}
      <div style={{ padding: '20px 22px', background: 'linear-gradient(180deg,#E9E2FA,#F8F5FE)', borderBottom: '1px solid #E7E0F3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Oscar's aria-label was "Back to menu"; here the control simply closes
              the walkthrough (first-run dismiss / return from Settings) → "Close". */}
          <button className="luxiOb-close" aria-label="Close" onClick={onClose}>
            <BackChevron />
          </button>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#262626', letterSpacing: '-.01em' }}>How to Play</span>
        </div>
      </div>

      {/* Per-step media (Oscar's inline image-slot styling, brought into the
          modal). Renders only when the current step has media, so a step without
          an image simply shows text — the box collapses, no empty placeholder. */}
      {cur?.media && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(150deg,#EDE7FB,#E3DBF7)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5)' }}>
            <img src={cur.media} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      )}

      {/* Step content */}
      <div style={{ padding: '22px 24px 8px', minHeight: 150 }}>
        {!isWhatsNext ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#EEEAFE', color: '#5B44C4', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{cur.num}</div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#262626', letterSpacing: '-.01em' }}>{cur.title}</div>
              <p style={{ margin: '7px 0 0', fontSize: 16, fontWeight: 400, color: '#5C5470', lineHeight: 1.55, textWrap: 'pretty' }}>{cur.body}</p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#262626', letterSpacing: '-.01em' }}>What&#8217;s next</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#F6F4FE', border: '1px solid #EEE9FB', borderRadius: 16, padding: 15 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EAF9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0092B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="3.2" /><path d="M3.6 19c.7-3 3-4.6 5.4-4.6s4.7 1.6 5.4 4.6" /><circle cx="17.6" cy="8" r="2.2" /><path d="M16.2 13.7c2.1.1 3.7 1.5 4.3 3.8" /></svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#262626' }}>Meet friends</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', color: '#5B44C4', background: '#EEEAFE', padding: '3px 8px', borderRadius: 999 }}>SOON</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 14.5, fontWeight: 400, color: '#5C5470', lineHeight: 1.5 }}>A shared space for signed-in players. No chat &#8212; just wave and send a few emoji.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#F6F4FE', border: '1px solid #EEE9FB', borderRadius: 16, padding: 15 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F3ECFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7C6CE8" aria-hidden="true"><path d="M12 2.6l2.5 5.5 6 .5-4.5 3.9 1.4 5.9L12 21l-5.4 2.9 1.4-5.9-4.5-3.9 6-.5z" /></svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#262626' }}>Lots more</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', color: '#5B44C4', background: '#EEEAFE', padding: '3px 8px', borderRadius: 999 }}>SOON</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 14.5, fontWeight: 400, color: '#5C5470', lineHeight: 1.5 }}>Many more features are on the way.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div style={{ padding: '14px 24px 0', display: 'flex', gap: 7, alignItems: 'center', justifyContent: 'center' }}>
        {dots.map((d, i) => (
          <span key={i} style={{ height: 8, borderRadius: 99, transition: 'width .2s ease, background .2s ease', width: d.w, background: d.bg }} />
        ))}
      </div>

      {/* Footer nav: Back (hidden on first step) · Next / final CTA */}
      <div style={{ padding: '16px 22px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {step === 0 ? <span /> : (
          <button className="luxiOb-back" onClick={back}>Back</button>
        )}
        {!isWhatsNext ? (
          <button className="luxiOb-cta" style={{ padding: '13px 24px' }} onClick={next}>Next</button>
        ) : (
          // ADAPTATION: Oscar's last-step CTA is a marketing <a href="math.luxi.land">
          // "Play now — it's free →". In the app she is already here, so it CLOSES
          // the walkthrough instead, relabelled "Let's play →" (no "it's free").
          <button className="luxiOb-cta" style={{ padding: '13px 22px' }} onClick={onFinish}>
            Let&#8217;s play <span style={{ lineHeight: 0, transform: 'translateY(1px)' }}>&#8594;</span>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * The full-screen modal: scrim + centered card. `onClose` dismisses (and, for
 * first-run, marks it seen — App owns that). Tapping the scrim does NOT close
 * (Oscar's design — a child can't dismiss it by accident); only the header
 * control / final CTA close it.
 */
export function Onboarding({ onClose }) {
  return (
    <div
      className="luxiOb-scrim"
      // stopPropagation so a tap on the overlay never falls through to the R3F
      // canvas underneath and walks the character (the lift-skill rule).
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(29,23,48,.5)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <OnboardingCard onClose={onClose} onFinish={onClose} />
      </div>
    </div>
  )
}

export default Onboarding
