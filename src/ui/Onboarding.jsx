/*
 * Onboarding.jsx — the first-run About + "How to Play" card.
 *
 * LOOK: Oscar's two comps (~/Downloads/handoff — onboarding/, lifted 2026-09-19):
 * "Luxi Onboarding.dc.html" (modal frame) + "Onboarding Card.dc.html" (card).
 * Header, ✕, number badge, dots, ghost Back, the Iris CTA and the gem stage are
 * his; the CTA wears Brand Iris 500 (button3d-primary — his violet failed AA with white,
 * Amy 2026-10-04). Golden-4px values kept (2026-09-19 pass).
 *
 * REBUILT 2026-10-18 (Trail crew onboarding job — docs/onboarding/proposal.md,
 * decisions.md, round2-consensus.md). Linden owns this file + its .luxiOb-* CSS.
 *
 * CONTRACT (Rowan wires it in App):
 *   <Onboarding entry={'first'|'howto'} onClose={fn} />
 *   · 'first' — About cover (gem stage, 3 kid lines + parent small print, no dot,
 *     no Back, one Next) → steps 1–3 with 3 dots; Back from step 1 → About.
 *     Closes on the ✕ or Escape, never the scrim (Amy's decision #5: a kid's
 *     stray tap on the scrim must not dismiss it at word zero; Escape is a
 *     deliberate key, so it closes — Amy 2026-10-20, WCAG 2.4.3 pass).
 *   · 'howto' — Settings → How to Play: opens on step 1, 3 dots, no Back on
 *     step 1. The ✕, a scrim tap and Escape all close it.
 *   · The last step's "Let's play →" closes. There is no 4th card and no
 *     "What's next"/SOON branch (deleted: the game never says "coming soon").
 *   ALL words come from onboardingPages(entry) (src/onboardingCopy.js, built from
 *   config). Never hard-code copy here.
 *
 * LAYOUT RULES
 *   · ONE fixed 16:9 media box. Every page's media is mounted at once, stacked,
 *     with data-active on the current one, and decode()d on open — never swap
 *     `src` (swapping gave the playtest its stale/empty boxes). About's gem stage
 *     is just another layer. A step with media:null shows the box's own lilac
 *     as a calm placeholder; the box never collapses.
 *   · All page texts are stacked in one grid cell too, so the text block is
 *     always as tall as the tallest page: the card height is constant and Next
 *     never moves under her finger.
 *   · Phone landscape (812×375): the card caps at 100dvh − 40px; header and
 *     footer stay put and the middle scrolls, so the ✕ is always visible.
 *
 * MOTION HOOKS (Fern owns every keyframe/transition — none inline here):
 *   .luxiOb-scrim[data-state="open"|"closing"]   exit: OB_EXIT_MS, plain timer
 *   .luxiOb-card[data-entry][data-page]          the current page id
 *   .luxiOb-media[data-active="true"|"false"]    image/stage layers (crossfade)
 *   .luxiOb-media[data-prev="true"]              the layer just left (holds under the new one)
 *   .luxiOb-mediaBox[data-empty]                 no layer for this page (fade to lilac)
 *   .luxiOb-page[data-active="true"|"false"]     text layers (crossfade)
 *   .luxiOb-dot[data-state="current"|"past"|"future"]
 *   .luxiOb-gemIn > .luxiOb-gemFloat + .luxiOb-gemShadow, .luxiOb-twinkle
 *
 * Interactive states live in index.css, not inline (an inline style beats a CSS
 * :hover — the .luxiFooter / su- / dv- lesson). stopPropagation keeps every tap
 * off the R3F canvas underneath.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { GemIcon } from './hudkit'
import { onboardingPages } from '../onboardingCopy'

/** How long the card waits after a close before unmounting (Fern's exit).
 *  = the 200ms exit in index.css (scrim fade + card sinks 8px). A plain timer,
 *  never animationend (it stalls in hidden panes). Keep the two in sync. */
export const OB_EXIT_MS = 200

// S5 (2026-10-22): type on Datum --text-*; twinkle fills → --luxi-color-component-onboarding-twinkle-* (same values)
const TITLE = { fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-.01em' }
const BODY = { margin: '8px 0 0', fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 1.55, textWrap: 'pretty' }

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal focus (WCAG 2.4.3, Amy 2026-10-20) — shared with PromoPopup. On open,
 * focus moves onto the dialog itself (`tabIndex={-1}` on it, so the title is
 * announced and Tab starts inside); Tab / Shift+Tab wrap within it; Escape calls
 * `onEscape`; on unmount focus goes back to whatever opened it (if it's still on
 * the page — a sheet that closed behind the modal is simply skipped).
 */
export function useDialogFocus(ref, onEscape) {
  const esc = useRef(onEscape)
  esc.current = onEscape
  useEffect(() => {
    const box = ref.current
    if (!box) return
    const opener = document.activeElement
    box.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        esc.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const els = [...box.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0)
      if (!els.length) return e.preventDefault()
      const first = els[0]
      const last = els[els.length - 1]
      const at = document.activeElement
      if (!box.contains(at)) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && (at === first || at === box)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (opener?.isConnected && opener !== document.body) opener.focus?.({ preventScroll: true })
    }
  }, [ref])
}

// Three twinkles around the gem: gem cyan + the card's lilac star (% of the stage).
const TWINKLES = [
  { l: '30%', t: '24%', s: 20, d: 0, c: 'var(--luxi-color-component-onboarding-twinkle-gem)' },
  { l: '68%', t: '18%', s: 16, d: 0.6, c: 'var(--luxi-color-component-onboarding-twinkle-star)' },
  { l: '66%', t: '62%', s: 16, d: 1.2, c: 'var(--luxi-color-component-onboarding-twinkle-gem)' },
]

function GemStage({ active, prev }) {
  return (
    <div className="luxiOb-media luxiOb-stage" data-active={active} data-prev={prev} aria-hidden="true">
      <div className="luxiOb-gemIn">
        <div className="luxiOb-gemFloat">
          <GemIcon size={104} />
        </div>
        <span className="luxiOb-gemShadow" />
      </div>
      {TWINKLES.map((k, i) => (
        <svg key={i} className="luxiOb-twinkle" width={k.s} height={k.s} viewBox="0 0 24 24" style={{ position: 'absolute', left: k.l, top: k.t, animationDelay: `${0.45 + k.d}s` }}>
          <path d="M12 1.5c.6 5.4 3.6 9.6 10.5 10.5-6.9.9-9.9 5.1-10.5 10.5C11.4 17.1 8.4 12.9 1.5 12 8.4 11.1 11.4 6.9 12 1.5Z" style={{ fill: k.c }} />
        </svg>
      ))}
    </div>
  )
}

// Reduced motion = the still poster, never a moving clip (read once per mount).
const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A step's clip (Amy's in-game recordings, 2026-10-18): muted, looping, inline —
 * the only way browsers autoplay. It plays only while its page is active and
 * restarts from the top each time she arrives, so every kid sees the whole
 * action. The poster is the still `media`, painted until the first frame.
 */
function StepClip({ page, active, prev }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) {
      v.currentTime = 0
      v.play?.()?.catch?.(() => {}) // a blocked play just leaves the poster up
    } else {
      v.pause?.()
    }
  }, [active])
  return (
    <video
      ref={ref}
      className="luxiOb-media"
      data-active={active}
      data-prev={prev}
      poster={page.media}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      disablePictureInPicture
    >
      <source src={`${page.clip}.webm`} type="video/webm" />
      <source src={`${page.clip}.mp4`} type="video/mp4" />
    </video>
  )
}

function PageText({ page, stepNum }) {
  if (page.kind === 'about') {
    return (
      <div>
        <ul className="luxiOb-lines">
          {page.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="luxiOb-small">{page.small}</p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div className="luxiOb-num" aria-hidden="true">{stepNum}</div>
      <div>
        <div style={TITLE}>{page.title}</div>
        <p style={BODY}>{page.body}</p>
      </div>
    </div>
  )
}

/**
 * The card. Owns its own page cursor. `onClose` = the ✕, Escape and the last CTA.
 */
export function OnboardingCard({ entry = 'first', onClose }) {
  const pages = useMemo(() => onboardingPages(entry), [entry])
  // `prev` = the page just left: its media layer holds under the incoming one
  // for the crossfade (Fern). Every older layer drops at once, so a fast Next
  // never shows a picture from two pages ago.
  const [{ i, prev }, setNav] = useState({ i: 0, prev: -1 })
  const page = pages[i]
  const steps = pages.filter((p) => p.kind === 'step')
  const stepIdx = steps.indexOf(page) // -1 on About
  const isLast = i === pages.length - 1
  const titleId = `luxiOb-title-${entry}`
  const [still] = useState(prefersReducedMotion)
  const cardRef = useRef(null)
  useDialogFocus(cardRef, onClose)

  // Preload + decode every step image the moment the card opens (~50KB, during
  // the seconds she spends on the first page), so a fast Next never paints a
  // half-decoded frame. The <img>s below are mounted too; this just warms them.
  useEffect(() => {
    for (const p of pages) {
      if (!p.media) continue
      const img = new Image()
      img.src = p.media
      img.decode?.().catch(() => {})
    }
  }, [pages])

  const go = (d) => setNav((s) => {
    const n = Math.min(Math.max(s.i + d, 0), pages.length - 1)
    return n === s.i ? s : { i: n, prev: s.i }
  })
  const next = () => go(1)
  const back = () => go(-1)

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      className="luxiOb-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-entry={entry}
      data-page={page.id}
    >
      {/* Header — title + ✕ (the house header idiom; the ✕ is always visible). */}
      <div className="luxiOb-head">
        <span id={titleId} style={TITLE}>
          {page.kind === 'about' ? page.title : 'How to Play'}
        </span>
        <button className="luxiOb-close" aria-label="Close" onClick={onClose} style={{ fontSize: 'var(--text-base)', lineHeight: 1 }}>
          ✕
        </button>
      </div>

      {/* Middle — scrolls only when the viewport is shorter than the card. */}
      <div className="luxiOb-scroll">
        <div style={{ padding: '16px 16px 0' }}>
          <div className="luxiOb-mediaBox" data-empty={page.kind !== 'about' && !page.media}>
            {pages.map((p, n) =>
              p.kind === 'about' ? (
                <GemStage key={p.id} active={p === page} prev={n === prev} />
              ) : p.clip && !still ? (
                <StepClip key={p.id} page={p} active={p === page} prev={n === prev} />
              ) : p.media ? (
                <img key={p.id} className="luxiOb-media" data-active={p === page} data-prev={n === prev} src={p.media} alt="" decoding="async" draggable={false} />
              ) : null,
            )}
          </div>
        </div>

        {/* Every page's text in one grid cell: constant height, crossfade-ready. */}
        <div className="luxiOb-pages">
          {pages.map((p) => (
            <div key={p.id} className="luxiOb-page" data-active={p === page} aria-hidden={p !== page}>
              <PageText page={p} stepNum={steps.indexOf(p) + 1} />
            </div>
          ))}
        </div>

        {/* Steps only: 3 dots (About is a cover, it gets none). The slot keeps
            its height on About so nothing below it moves. */}
        <div className="luxiOb-dots" aria-hidden="true">
          {stepIdx >= 0 &&
            steps.map((s, n) => (
              <span key={s.id} className="luxiOb-dot" data-state={n === stepIdx ? 'current' : n < stepIdx ? 'past' : 'future'} />
            ))}
        </div>
        <span className="sr-only" aria-live="polite">
          {stepIdx >= 0 ? `Step ${stepIdx + 1} of ${steps.length}` : ''}
        </span>
      </div>

      {/* Footer — Back (never on the first page) · Next / Let's play. */}
      <div className="luxiOb-foot">
        {i === 0 ? <span /> : (
          <button className="luxiOb-back" onClick={back}>Back</button>
        )}
        {!isLast ? (
          <button className="luxiOb-cta" onClick={next}>Next</button>
        ) : (
          <button className="luxiOb-cta" onClick={onClose}>
            Let’s play <span aria-hidden="true" style={{ lineHeight: 0, transform: 'translateY(1px)' }}>→</span>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * The modal: scrim + centred card. The ✕ and Escape always close it (the card's
 * useDialogFocus); the scrim closes only on 'howto' (Amy's decision #5).
 */
export function Onboarding({ entry = 'first', onClose }) {
  const [state, setState] = useState('open')
  const closing = useRef(false)
  const timer = useRef(0)

  const close = () => {
    if (closing.current) return
    closing.current = true
    setState('closing')
    timer.current = setTimeout(() => onClose?.(), OB_EXIT_MS)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  const dismissable = entry === 'howto'

  return (
    <div
      className="luxiOb-scrim"
      data-state={state}
      data-entry={entry}
      // never let a tap fall through to the R3F canvas and walk her.
      // DECIDED SILENCE (Wren, 2026-10-18): this also keeps first-run taps from
      // reaching unlockAudio(), so the music starts on her first tap AFTER the
      // card, never under the About page. The card has no cue of its own. Keep
      // it that way unless the crew decides otherwise (docs/onboarding/retro).
      onPointerDown={(e) => e.stopPropagation()}
      onClick={dismissable ? close : undefined}
    >
      {/* clicks INSIDE the card must not bubble to the scrim */}
      <div className="luxiOb-frame" onClick={(e) => e.stopPropagation()}>
        <OnboardingCard entry={entry} onClose={close} />
      </div>
    </div>
  )
}

export default Onboarding
