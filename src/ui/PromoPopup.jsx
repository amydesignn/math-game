/*
 * PromoPopup.jsx — a seasonal one-time popup over the Door (Amy 2026-10-15).
 * First one: Halloween 2026 — the Sorcerer's Halloween clip + a trick-or-treat
 * pick. EITHER choice pays the same 3 gems; the pick is just the fun of it.
 *
 * Once and gone: App claims the promo (store.claimPromo) the moment this shows,
 * which marks it seen AND pays the gems in one save. The pick only REVEALS the
 * treat, so closing early, reloading or leaving never loses it or doubles it.
 *
 * Chrome reuses Onboarding's classes (.luxiOb-scrim / -card / -close / -cta /
 * -back) so it reads as the same family of modal; nothing new to govern there.
 *
 * Video: muted autoplay (browsers only autoplay muted), looping, playsInline for
 * iOS; a corner button turns the sound on. Reduced-motion players get the
 * poster still and a play control instead of autoplay.
 *
 * Tone (Luxi): understated — a small treat from the game, not a world event.
 */
import { useEffect, useRef, useState } from 'react'
import { GemIcon } from './hudkit'
import { useDialogFocus } from './Onboarding'
import { currentSeason } from '../season'
import { holdMusic } from '../audio'

// The live promo. Its window is the SAME season as the Spooky Arcade
// (season.js: Oct 1 → Nov 2, ?season= override for QA) + this year only, so the
// popup and the pumpkins come and go together. To run the next one: new id
// (never reuse — the id is the "already seen" key), new media, season + year.
export const PROMO = {
  id: 'halloween-2026',
  season: 'halloween',
  year: 2026,
  gems: 3,
  video: { webm: '/promo/halloween-2026.webm', mp4: '/promo/halloween-2026.mp4', poster: '/promo/halloween-2026.jpg' },
}

/** Is the promo running today (device-local date)? */
export function promoActive(promo = PROMO, now = new Date()) {
  return now.getFullYear() === promo.year && currentSeason(now) === promo.season
}

/**
 * May the popup show right now? (Onboarding decision #6, Amy 2026-10-18.)
 * Over the Door only, never on top of the onboarding card, and only AFTER her
 * first world visit (`played` flips in enterWorld) — a brand-new player meets
 * the game first, then the treat lands on her first Exit or her next boot.
 * Old saves already have played: true, so nothing changes for them.
 */
export function promoShouldShow({ promoOpen, played, view, onboardingOpen }) {
  return !!promoOpen && !!played && view === 'door' && !onboardingOpen
}

const COPY = {
  ask: { title: 'Trick or treat?', body: 'Luxi Math has a little something for you. Pick one!' },
  treat: { title: 'A treat from Luxi Math!', body: 'Happy Halloween! Here are some gems to spend on your world.' },
  trick: { title: 'Trick! …just kidding.', body: 'Luxi Math would never. Here are some gems to spend on your world.' },
}

// Choreography (ms from the pick). The burst owns 0 → ~1000; the chip's gems
// start dropping as the big ones leave, one every CHIP_STAGGER; each "lands" at
// 55% of its 500ms drop — that's when the count ticks. (S5: the drop 520 → 500ms
// on Datum's ladder, so the land moved 290 → 275.)
const BURST_MS = 1700
const CHIP_START = 950
const CHIP_STAGGER = 200
const chipDelay = (i) => CHIP_START + i * CHIP_STAGGER
const GEM_LAND = (i) => chipDelay(i) + 275

// Sparkles flung out from the burst (36, 14–31px) — fixed (not random per render), spread
// round the full circle by the golden angle so they never clump.
// gem cyan · gold · lilac star · orange · white → --luxi-color-component-promo-spark-* (same values, S5)
const SPARK_COLORS = ['gem', 'gold', 'star', 'orange', 'white'].map((k) => `var(--luxi-color-component-promo-spark-${k})`)
const SPARKS = Array.from({ length: 36 }, (_, i) => {
  const a = i * 2.39996 // golden angle, radians
  const r = 140 + ((i * 53) % 150) // 140–290px out
  return { dx: Math.round(Math.cos(a) * r), dy: Math.round(Math.sin(a) * r), size: 14 + ((i * 7) % 18), delay: (i * 37) % 260, color: SPARK_COLORS[i % SPARK_COLORS.length], gem: i % 4 === 0 }
})

/** The treat burst: three big gems pop up over the card, a shockwave ring,
 *  and sparkles (+ a few mini gems) flung out across the screen. Pure CSS
 *  keyframes (index.css .luxiBurst-*), pointer-events none. */
function TreatBurst({ gems }) {
  return (
    <div className="luxiBurst" aria-hidden="true">
      <span className="luxiBurst-ring" />
      <span className="luxiBurst-ring luxiBurst-ring2" />
      {SPARKS.map((k, i) => (
        <span key={i} className="luxiBurst-spark" style={{ '--dx': `${k.dx}px`, '--dy': `${k.dy}px`, animationDelay: `${k.delay}ms` }}>
          {k.gem ? (
            <GemIcon size={k.size + 6} />
          ) : (
            <svg width={k.size} height={k.size} viewBox="0 0 24 24">
              <path d="M12 1.5c.6 5.4 3.6 9.6 10.5 10.5-6.9.9-9.9 5.1-10.5 10.5C11.4 17.1 8.4 12.9 1.5 12 8.4 11.1 11.4 6.9 12 1.5Z" style={{ fill: k.color }} />
            </svg>
          )}
        </span>
      ))}
      <div className="luxiBurst-gems">
        {Array.from({ length: gems }, (_, i) => (
          <span key={i} className="luxiBurst-gem" style={{ animationDelay: `${i * 110}ms`, '--tilt': `${(i - (gems - 1) / 2) * 14}deg` }}>
            <GemIcon size={80} />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function PromoPopup({ promo = PROMO, onClose }) {
  const [pick, setPick] = useState(null) // null | 'trick' | 'treat'
  const [soundOn, setSoundOn] = useState(false)
  const [counted, setCounted] = useState(0) // the chip's number, ticking up as each gem lands
  const [burst, setBurst] = useState(false) // the big treat burst layer (unmounted once it's played)
  const videoRef = useRef(null)
  const cardRef = useRef(null)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // The pick → the treat lands. The burst plays over the card, then the chip's
  // gems drop in one by one and the count ticks +1 per gem in step with them
  // (GEM_LAND below). Reduced motion: no burst, the full count at once.
  useEffect(() => {
    if (!pick) return
    if (reduceMotion) {
      setCounted(promo.gems)
      return
    }
    setBurst(true)
    const timers = Array.from({ length: promo.gems }, (_, i) => setTimeout(() => setCounted(i + 1), GEM_LAND(i)))
    timers.push(setTimeout(() => setBurst(false), BURST_MS))
    return () => timers.forEach(clearTimeout)
  }, [pick, reduceMotion, promo.gems])

  // Focus moves in on open, Tab stays inside, Escape closes, focus returns to
  // the opener on close (WCAG 2.4.3 — Onboarding's shared hook).
  useDialogFocus(cardRef, onClose)

  // The game's music steps aside while the clip has sound, and returns on close.
  useEffect(() => {
    holdMusic(soundOn)
  }, [soundOn])
  useEffect(() => () => holdMusic(false), [])

  function toggleSound() {
    const v = videoRef.current
    if (!v) return
    v.muted = soundOn
    if (!soundOn) {
      v.currentTime = 0 // turning sound on restarts the clip so she hears it from the top
      v.play().catch(() => {})
    }
    setSoundOn(!soundOn)
  }

  const copy = COPY[pick || 'ask']

  return (
    <div
      className="luxiOb-scrim"
      onPointerDown={(e) => e.stopPropagation()} // never fall through to the R3F canvas
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--luxi-color-component-modal-scrim)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="luxiOb-card"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", width: '100%', maxWidth: 440, background: 'var(--color-background-base)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--luxi-shadow-door-modal-card)' }}
      >
        {/* Header — same chrome as Onboarding: title + ✕ on the right */}
        <div style={{ padding: '16px 16px 16px 24px', background: 'linear-gradient(180deg,var(--luxi-color-component-modal-header-background-start),var(--luxi-color-component-modal-header-background-end))', borderBottom: '1px solid var(--luxi-color-component-modal-header-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-.01em' }}>Happy Halloween</span>
          <button className="luxiOb-close" aria-label="Close" onClick={onClose} style={{ fontSize: 'var(--text-base)', lineHeight: 1 }}>✕</button>
        </div>

        {/* The clip — 16:9 stage, same box as Onboarding's step media */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', background: 'var(--luxi-color-component-video-letterbox)' }}>
            <video
              ref={videoRef}
              autoPlay={!reduceMotion}
              controls={reduceMotion}
              muted
              loop
              playsInline
              preload="auto"
              poster={promo.video.poster}
              aria-label="The Luxi Math sorcerer waves hello in a Halloween arcade"
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={promo.video.webm} type="video/webm" />
              <source src={promo.video.mp4} type="video/mp4" />
            </video>
            {!reduceMotion && (
              <button
                className="luxiPromo-sound"
                onClick={toggleSound}
                aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
                aria-pressed={soundOn}
              >
                <SoundIcon on={soundOn} />
              </button>
            )}
          </div>
        </div>

        {/* Copy — swaps from the question to the reveal */}
        <div style={{ padding: '24px 24px 8px' }} aria-live="polite">
          <div id="promo-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-.01em' }}>{copy.title}</div>
          <p style={{ margin: '8px 0 0', fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 1.55, textWrap: 'pretty' }}>{copy.body}</p>
          {pick && (
            // The chip the burst lands in: one gem per gem earned drops in,
            // tumbles and settles (staggered) with a twinkle; the number ticks
            // up +1 as each lands and pops. Motion: index.css .luxiPromo-*.
            <div className="luxiPromo-gift" style={{ animationDelay: reduceMotion ? '0ms' : `${CHIP_START - 150}ms`, marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 20px 8px 12px', borderRadius: 999, background: 'var(--luxi-color-component-reward-chip-background)', border: '1px solid var(--luxi-color-component-reward-chip-border)' }}>
              <span style={{ display: 'inline-flex', gap: 4 }} aria-hidden="true">
                {Array.from({ length: promo.gems }, (_, i) => (
                  <span key={i} className="luxiPromo-gem" style={{ animationDelay: `${chipDelay(i)}ms` }}>
                    <GemIcon size={32} />
                    <svg className="luxiPromo-spark" width="16" height="16" viewBox="0 0 24 24" style={{ animationDelay: `${GEM_LAND(i)}ms` }}>
                      <path d="M12 1.5c.6 5.4 3.6 9.6 10.5 10.5-6.9.9-9.9 5.1-10.5 10.5C11.4 17.1 8.4 12.9 1.5 12 8.4 11.1 11.4 6.9 12 1.5Z" style={{ fill: 'var(--luxi-color-component-promo-spark-gem)' }} />
                    </svg>
                  </span>
                ))}
              </span>
              <span aria-hidden="true" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                <span key={counted} className={counted ? 'luxiPromo-tick' : undefined} style={{ display: 'inline-block' }}>+{counted}</span> gems
              </span>
              <span className="sr-only">You got {promo.gems} gems</span>
            </div>
          )}
        </div>

        {/* Footer — the pick, then Let's play */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: pick ? 'flex-end' : 'space-between', gap: 12 }}>
          {!pick ? (
            <>
              <button className="luxiPromo-pick" onClick={() => setPick('trick')}>
                <span aria-hidden="true">🎃</span> Trick
              </button>
              <button className="luxiOb-cta luxiPromo-treat" style={{ padding: '12px 24px' }} onClick={() => setPick('treat')}>
                <span aria-hidden="true">🍬</span> Treat
              </button>
            </>
          ) : (
            <button className="luxiOb-cta" style={{ padding: '12px 24px' }} onClick={onClose} autoFocus>
              Let’s play <span style={{ lineHeight: 0, transform: 'translateY(1px)' }}>→</span>
            </button>
          )}
        </div>
      </div>
      {burst && <TreatBurst gems={promo.gems} />}
    </div>
  )
}

// paths are drawing; the stroke is the named 1.6px, non-scaling via .luxiPromo-soundIcon path (was 2 viewBox units at 20/24 = 1.67px)
function SoundIcon({ on }) {
  return (
    <svg className="luxiPromo-soundIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ strokeWidth: 'var(--border-stroke-1_6)' }}>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <path d="m16 9 5 6" />
          <path d="m21 9-5 6" />
        </>
      )}
    </svg>
  )
}
