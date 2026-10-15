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

const COPY = {
  ask: { title: 'Trick or treat?', body: 'Luxi Math has a little something for you. Pick one!' },
  treat: { title: 'A treat from Luxi Math!', body: 'Happy Halloween! Here are some gems to spend on your world.' },
  trick: { title: 'Trick! …just kidding.', body: 'Luxi Math would never. Here are some gems to spend on your world.' },
}

export default function PromoPopup({ promo = PROMO, onClose }) {
  const [pick, setPick] = useState(null) // null | 'trick' | 'treat'
  const [soundOn, setSoundOn] = useState(false)
  const videoRef = useRef(null)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Escape closes, like the house's other modals.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(29,23,48,.5)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="luxiOb-card"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(74,54,110,.22), inset 0 0 0 1px rgba(255,255,255,.6)' }}
      >
        {/* Header — same chrome as Onboarding: title + ✕ on the right */}
        <div style={{ padding: '16px 16px 16px 24px', background: 'linear-gradient(180deg,#E9E2FA,#F8F5FE)', borderBottom: '1px solid #E7E0F3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#262626', letterSpacing: '-.01em' }}>Happy Halloween</span>
          <button className="luxiOb-close" aria-label="Close" onClick={onClose} style={{ fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        {/* The clip — 16:9 stage, same box as Onboarding's step media */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', background: '#2A2140' }}>
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
          <div id="promo-title" style={{ fontSize: 19, fontWeight: 700, color: '#262626', letterSpacing: '-.01em' }}>{copy.title}</div>
          <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 400, color: '#5C5470', lineHeight: 1.55, textWrap: 'pretty' }}>{copy.body}</p>
          {pick && (
            <div className="luxiPromo-gift" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px 8px 12px', borderRadius: 999, background: '#F6F4FE', border: '1px solid #EEE9FB' }}>
              <GemIcon size={24} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#262626' }}>+{promo.gems} gems</span>
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
              Let&#8217;s play <span style={{ lineHeight: 0, transform: 'translateY(1px)' }}>&#8594;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SoundIcon({ on }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
