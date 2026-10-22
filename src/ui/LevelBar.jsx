import { useEffect, useRef, useState } from 'react'
import { T, LVL } from './mathkit'
import { GemIcon } from './hudkit'
import { levelState, fmtPoints, SIGNATURES } from '../levels'

/*
 * LevelBar + LevelUpPopup — lifted from Oscar's `math-level-bar-flow.html`
 * (Phase 5-A handoff). His visual language verbatim; the adaptations are
 * listed at each site.
 *
 * Level-up identity is VIOLET, and that's deliberate: teal = gems (the wallet),
 * amber = station completion bonus, violet = levels (permanent progress).
 * Three celebrations, three colors, so she can tell them apart at a glance.
 */

/* LVL (the level violet) lives in mathkit — see the note there. It went PASTEL
 * on 2026-07-26 and the bar, this file's congratulations card and the progress
 * popup all moved together, because they're one identity. */

/* ============================== THE BAR ================================= */
/* White house pill in the top-right HUD, left of the minimap.
   "Level N" · track+fill · lifetime points · gem wallet. The gem was its own
   top-left counter until 2026-07-31 (Amy) — folded in here so the stats live in
   ONE place, mirroring the Door card. The gem chip is the flying-gem target now
   (App passes hudGemRef as gemRef), so a solved problem's gems land right on it. */

const barStyles = {
  // S4 (10-22): gap 10 → 8 · every type step on --text-* · weights 800 → 700 · shadows/colours by name
  pill: { position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: T.surface, borderRadius: 999, padding: '0 16px', height: 44, boxShadow: 'var(--luxi-shadow-hud-chip)', userSelect: 'none' },
  div: { width: 0, height: 20, borderLeft: '1px solid var(--luxi-color-component-level-pill-divider)', flex: 'none' }, // hair rule between points and the gem wallet (a 1px stroke)
  gem: { display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--luxi-color-component-level-pill-gem-text)', flex: 'none' }, // teal = the gem wallet
  label: { display: 'flex', alignItems: 'baseline', gap: 4, fontWeight: 700, fontSize: 'var(--text-base)', color: T.textPrimary, whiteSpace: 'nowrap' },
  lvlWrap: { position: 'relative', display: 'inline-block', overflow: 'hidden', height: 20, minWidth: '2ch', textAlign: 'center' },
  track: { position: 'relative', width: 72, height: 12, borderRadius: 999, background: LVL.soft, overflow: 'hidden', flex: 'none' }, // 96→72: shortened to make room for the top-right gear (Amy 2026-08-30)
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, background: LVL.grad, transition: 'width 500ms var(--ease-out)' },
  shine: { position: 'absolute', top: 0, bottom: 0, width: '34%', background: 'linear-gradient(90deg,transparent 0%,var(--luxi-color-component-level-fill-shine) 50%,transparent 100%)', animation: 'shineSweep 500ms var(--ease-out) 1' },
  pts: { fontWeight: 700, fontSize: 'var(--text-sm)', color: LVL.deep, whiteSpace: 'nowrap', minWidth: 24, textAlign: 'right' },
  floater: { position: 'absolute', top: -8, right: 12, fontWeight: 700, fontSize: 'var(--text-sm)', color: LVL.ink, animation: 'floatUp 800ms var(--ease-out) forwards', pointerEvents: 'none' },
  star: { position: 'absolute', left: '50%', top: '50%', fontSize: 'var(--text-sm)', animation: 'barStar 800ms var(--ease-out) forwards', pointerEvents: 'none' },
}

/**
 * `points` is the permanent accumulator (store.lifetimeGems). The bar owns the
 * level-up theatre and only then calls onLevelUp — so the popup is pure
 * applause, arriving after the bar has already told the story.
 */
export default function LevelBar({ points, gems, gemRef, onLevelUp, onOpen }) {
  const [shown, setShown] = useState(points) // the points the bar renders (lags during theatre)
  const [phase, setPhase] = useState('idle') // idle | surge | flip | regrow
  const [burst, setBurst] = useState(null)
  const [floater, setFloater] = useState(null) // the "+N" tick
  const [shine, setShine] = useState(0)
  const [rolling, setRolling] = useState(null) // { from, to } — the label roll
  const [pressed, setPressed] = useState(false) // 5-B: the tap affordance
  const prevRef = useRef(points) // seeded from the boot value ⇒ no theatre on mount
  const timers = useRef([])
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const prev = prevRef.current
    if (points === prev) return
    prevRef.current = points
    const from = levelState(prev)
    const to = levelState(points)
    if (points > prev) {
      setFloater({ n: points - prev, key: performance.now() })
      setShine((s) => s + 1)
    }
    if (to.level > from.level) {
      // THE THEATRE: surge to full → star burst → label rolls → fill regrows
      // to the new remainder → onLevelUp fires once, at the final level.
      //
      // ADAPTATION (bug fix vs the comp): `shown` is NOT pushed to the level
      // boundary during the surge. Oscar's version set it to exactly
      // `from.level * 50`, but that value already reads as the NEXT level at
      // 0% — so the "Level N" label flipped instantly, 450ms before the roll
      // animation that is supposed to reveal it. Holding `shown` at prev and
      // forcing the width from the phase keeps the old number on screen until
      // the roll, which is the whole point of the roll.
      setPhase('surge')
      later(() => { setBurst(performance.now()); setRolling({ from: from.level, to: to.level }); setPhase('flip') }, 480)
      later(() => { setShown(points); setPhase('regrow') }, 900)
      later(() => { setPhase('idle'); setRolling(null); onLevelUp?.(to.level) }, 1350)
    } else {
      setShown(points)
    }
  }, [points, onLevelUp])

  const st = levelState(shown)
  // full while the bar is surging AND while the label rolls — otherwise the
  // fill snaps back down mid-roll (same root cause as the fix above).
  const full = phase === 'surge' || phase === 'flip'
  const pct = full ? 100 : Math.min(100, Math.round((st.into / st.need) * 100))
  const near = phase === 'idle' && st.into / st.need >= 0.9 // "so close" shimmer
  const stars = burst
    ? [...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <span key={burst + '-' + i} style={{ ...barStyles.star, '--dx': Math.cos(a) * 46 + 'px', '--dy': Math.sin(a) * 30 - 14 + 'px', '--rot': (i % 2 ? 60 : -50) + 'deg' }}>
            {i % 2 ? '✦' : '⭐'}
          </span>
        )
      })
    : null

  // Tappable only while idle: mid-theatre the bar is telling her something, and
  // opening the record book over its own animation would talk across it.
  const tappable = !!onOpen && phase === 'idle'

  return (
    <div
      onClick={tappable ? onOpen : undefined}
      onPointerDown={tappable ? () => setPressed(true) : undefined}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onKeyDown={onOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } } : undefined}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      data-hint="level-pill"
      className="lvlbar-pill"
      style={{ ...barStyles.pill,
        cursor: tappable ? 'pointer' : 'default',
        // No icon by design (Amy) — it's words plus press feedback, discovered
        // by tapping. The press state is therefore the ONLY affordance; keep it.
        transform: pressed ? 'translateY(1px) scale(.99)' : 'none',
        boxShadow: pressed ? 'var(--luxi-shadow-hud-chip-pressed)' : barStyles.pill.boxShadow,
        transition: 'transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out)',
        animation: phase !== 'idle' ? 'surgeGlow 1000ms var(--ease-out) 1' : 'none' }}
      aria-label={`Level ${st.level}, ${st.into} of ${st.need} points${onOpen ? '. Tap to see your progress.' : ''}`}
    >
      <span style={barStyles.label}>
        Level
        <span style={barStyles.lvlWrap}>
          {rolling ? (
            <span key="roll" style={{ position: 'relative', display: 'block' }}>
              <span style={{ display: 'block', animation: 'rollOut 300ms var(--ease-out) forwards' }}>{rolling.from}</span>
              <span style={{ position: 'absolute', left: 0, top: 0, right: 0, animation: 'rollIn 300ms 200ms var(--ease-out) both' }}>{rolling.to}</span>
            </span>
          ) : (
            <span style={{ display: 'block' }}>{st.level}</span>
          )}
        </span>
      </span>
      <span className="lvlbar-track" style={barStyles.track}>
        <span style={{ ...barStyles.fill, width: pct + '%', animation: near ? 'nearShimmer 1.6s ease-in-out infinite' : 'none' }} />
        {shine > 0 && <span key={shine} style={barStyles.shine} />}
      </span>
      <span className="lvlbar-pts" key={points} style={{ ...barStyles.pts, animation: 'tickPop 300ms var(--ease-out) 1' }}>{fmtPoints(points)}</span>
      {gems != null && (
        <>
          <span className="lvlbar-div" style={barStyles.div} />
          {/* the gem wallet — ref'd so solved-problem gems fly here (App's hudGemRef) */}
          <span ref={gemRef} style={barStyles.gem}><GemIcon size={16} />{gems}</span>
        </>
      )}
      {floater && <span key={floater.key} style={barStyles.floater}>+{floater.n}</span>}
      {stars}
    </div>
  )
}

/* ============================= THE POPUP ================================ */
/* Pure applause — the bar already told the story. One joyful exit, no ✕. */

const popStyles = {
  // S4 (10-22): the card's overshoot lives in lvlPopIn's stops, so the curve is the house ease-out
  scrim: { position: 'fixed', inset: 0, background: 'var(--luxi-color-component-level-popup-scrim)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scrimIn 200ms var(--ease-out)', zIndex: 60 },
  card: { position: 'relative', width: 'min(400px, calc(100vw - 48px))', background: T.surface, borderRadius: T.radius, padding: '32px 28px 24px', textAlign: 'center', boxShadow: 'var(--luxi-shadow-level-popup)', animation: 'lvlPopIn 500ms var(--ease-out) both', overflow: 'hidden' },
  kicker: { fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.14em', color: LVL.ink, textTransform: 'uppercase' }, // the house 12 caps eyebrow
  badgeWrap: { position: 'relative', width: 112, height: 112, margin: '16px auto 16px' },
  halo: { position: 'absolute', inset: -8, borderRadius: '50%', border: 'var(--border-stroke-2) solid ' + LVL.main, opacity: 0.4, animation: 'haloPulse 1000ms var(--ease-out) 300ms 2' },
  // the inset lip softened with the palette (was -5px/.14 under the saturated
  // violet — too heavy a shadow for a pastel badge, it read as a dark rim)
  badge: { position: 'absolute', inset: 0, borderRadius: '50%', background: LVL.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--luxi-shadow-level-badge)', animation: 'badgeBounce 500ms var(--ease-out) 100ms both' }, // overshoot in badgeBounce's stops
  // numeral = LVL.onFill (white on Iris 500) — see the note in mathkit.
  // The drop shadow goes with it: it existed to lift white off the saturated
  // violet, and under a deep numeral it just muddies the pastel.
  badgeNum: { position: 'relative', overflow: 'hidden', height: 60, width: '100%', textAlign: 'center', color: LVL.onFill, fontWeight: 700, fontSize: 'var(--text-5xl)', lineHeight: 'var(--text-5xl--line-height)' }, // 48 × 1.25 = the 60px window the numeral rolls through
  msg: { fontSize: 'var(--text-xl)', lineHeight: 'var(--text-xl--line-height)', fontWeight: 700, color: T.textPrimary, textWrap: 'pretty', padding: '0 8px' },
  // The signature (Amy's ask): right-aligned like a signed note, because that
  // is the visual grammar for "a person wrote this to you" — which is the
  // entire job of this line. Conditional: no `from`, no signature, so a public
  // build with unsigned copy needs no change here.
  sign: { marginTop: 12, paddingRight: 8, textAlign: 'right', fontSize: 'var(--text-base)', fontWeight: 700, color: LVL.ink },
  // the house 3D press (mathkit BigButton): a 4px edge, pressed 4px down onto it
  btn: { marginTop: 20, width: '100%', height: 56, border: 'none', borderRadius: 16, background: T.irisFace, color: 'var(--color-text-on-brand)', fontSize: 'var(--text-lg)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 0 ' + T.irisDeep, transition: 'transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out)' },
  // Oscar's ease-in gravity is baked into confettiFall's stops (ease-in is removed from Datum), so the timing is linear
  piece: { position: 'absolute', top: -8, width: 8, height: 12, borderRadius: 4, animation: 'confettiFall var(--dur) var(--delay) linear forwards', pointerEvents: 'none' },
}
// pastel confetti to match the softened level identity (was T.violet/#9810FA —
// the two saturated purples popped out of the card once it went pastel)
const CONFETTI = [LVL.main, ...['lilac', 'mint', 'butter', 'sky', 'blush'].map((c) => `var(--luxi-color-component-level-confetti-${c})`)]

export function LevelUpPopup({ level, message, from, onClose }) {
  const [pieces] = useState(() =>
    [...Array(26)].map((_, i) => ({
      left: 4 + Math.random() * 92,
      dx: Math.random() * 60 - 30 + 'px',
      dy: 140 + Math.random() * 160 + 'px',
      rot: Math.random() * 520 - 260 + 'deg',
      dur: `var(--duration-${i % 2 ? 2800 : 1800})`, // Datum's celebration tier (was a random 1.1–2.0s)
      delay: Math.random() * 0.45 + 's',
      color: CONFETTI[i % CONFETTI.length],
      round: Math.random() > 0.6,
    }))
  )
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const signature = from && SIGNATURES[from]

  return (
    <div style={popStyles.scrim} onPointerDown={(e) => e.stopPropagation()}>
      <div style={popStyles.card} role="dialog" aria-label={`Level up! Level ${level}`}>
        {pieces.map((p, i) => (
          <span
            key={i}
            style={{ ...popStyles.piece, left: p.left + '%', background: p.color, borderRadius: p.round ? '50%' : 4, width: 8, height: p.round ? 8 : 12, '--dx': p.dx, '--dy': p.dy, '--rot': p.rot, '--dur': p.dur, '--delay': p.delay }}
          />
        ))}
        <div style={popStyles.kicker}>Level up!</div>
        <div style={popStyles.badgeWrap}>
          <span style={popStyles.halo} />
          <div style={popStyles.badge}>
            <span style={popStyles.badgeNum}>
              <span style={{ display: 'block', animation: 'rollOut 300ms 500ms var(--ease-out) forwards' }}>{level - 1}</span>
              <span style={{ position: 'absolute', left: 0, top: 0, right: 0, animation: 'rollIn 300ms 800ms var(--ease-out) both' }}>{level}</span>
            </span>
          </div>
        </div>
        <div style={popStyles.msg}>{message}</div>
        {signature && <div style={popStyles.sign}>— {signature}</div>}
        <button
          style={popStyles.btn}
          onClick={onClose}
          onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0 0 ' + T.irisDeep }}
          onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 ' + T.irisDeep }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 ' + T.irisDeep }}
        >
          Keep going! ✨
        </button>
      </div>
    </div>
  )
}
