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
  pill: { position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: T.surface, borderRadius: 999, padding: '0 16px', height: 44, boxShadow: '0 4px 14px rgba(43,32,90,0.16)', userSelect: 'none' },
  div: { width: 1, height: 20, background: '#ECE7F5', flex: 'none' }, // hair rule between points and the gem wallet
  gem: { display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 14, color: '#0E7490', flex: 'none' }, // teal = the gem wallet
  label: { display: 'flex', alignItems: 'baseline', gap: 4, fontWeight: 800, fontSize: 15, color: T.ink, whiteSpace: 'nowrap' },
  lvlWrap: { position: 'relative', display: 'inline-block', overflow: 'hidden', height: 20, minWidth: '2ch', textAlign: 'center' },
  track: { position: 'relative', width: 96, height: 12, borderRadius: 999, background: LVL.soft, overflow: 'hidden', flex: 'none' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, background: LVL.grad, transition: 'width .45s cubic-bezier(.22,1.2,.36,1)' },
  shine: { position: 'absolute', top: 0, bottom: 0, width: '34%', background: 'linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.75) 50%,rgba(255,255,255,0) 100%)', animation: 'shineSweep .7s ease-out 1' },
  pts: { fontWeight: 700, fontSize: 14, color: LVL.deep, whiteSpace: 'nowrap', minWidth: 26, textAlign: 'right' },
  floater: { position: 'absolute', top: -6, right: 10, fontWeight: 800, fontSize: 13, color: LVL.main, animation: 'floatUp .9s ease-out forwards', pointerEvents: 'none' },
  star: { position: 'absolute', left: '50%', top: '50%', fontSize: 13, animation: 'barStar .8s ease-out forwards', pointerEvents: 'none' },
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
      style={{ ...barStyles.pill,
        cursor: tappable ? 'pointer' : 'default',
        // No icon by design (Amy) — it's words plus press feedback, discovered
        // by tapping. The press state is therefore the ONLY affordance; keep it.
        transform: pressed ? 'translateY(1px) scale(.99)' : 'none',
        boxShadow: pressed ? '0 1px 5px rgba(43,32,90,0.2)' : barStyles.pill.boxShadow,
        transition: 'transform .09s ease, box-shadow .09s ease',
        animation: phase !== 'idle' ? 'surgeGlow 1.3s ease-out 1' : 'none' }}
      aria-label={`Level ${st.level}, ${st.into} of ${st.need} points${onOpen ? '. Tap to see your progress.' : ''}`}
    >
      <span style={barStyles.label}>
        Level
        <span style={barStyles.lvlWrap}>
          {rolling ? (
            <span key="roll" style={{ position: 'relative', display: 'block' }}>
              <span style={{ display: 'block', animation: 'rollOut .32s ease-in forwards' }}>{rolling.from}</span>
              <span style={{ position: 'absolute', left: 0, top: 0, right: 0, animation: 'rollIn .32s .22s ease-out both' }}>{rolling.to}</span>
            </span>
          ) : (
            <span style={{ display: 'block' }}>{st.level}</span>
          )}
        </span>
      </span>
      <span style={barStyles.track}>
        <span style={{ ...barStyles.fill, width: pct + '%', animation: near ? 'nearShimmer 1.6s ease-in-out infinite' : 'none' }} />
        {shine > 0 && <span key={shine} style={barStyles.shine} />}
      </span>
      <span key={points} style={{ ...barStyles.pts, animation: 'tickPop .4s ease-out 1' }}>{fmtPoints(points)}</span>
      {gems != null && (
        <>
          <span style={barStyles.div} />
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
  scrim: { position: 'fixed', inset: 0, background: 'rgba(38,30,60,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scrimIn .25s ease-out', zIndex: 60 },
  card: { position: 'relative', width: 'min(400px, calc(100vw - 48px))', background: T.surface, borderRadius: T.radius, padding: '34px 28px 24px', textAlign: 'center', boxShadow: '0 24px 70px rgba(38,20,80,.35)', animation: 'lvlPopIn .45s cubic-bezier(.22,1.3,.36,1) both', overflow: 'hidden' },
  kicker: { fontSize: 13, fontWeight: 800, letterSpacing: '.14em', color: LVL.main, textTransform: 'uppercase' },
  badgeWrap: { position: 'relative', width: 112, height: 112, margin: '18px auto 14px' },
  halo: { position: 'absolute', inset: -10, borderRadius: '50%', border: '3px solid ' + LVL.main, opacity: 0.4, animation: 'haloPulse 1.4s ease-out .3s 2' },
  // the inset lip softened with the palette (was -5px/.14 under the saturated
  // violet — too heavy a shadow for a pastel badge, it read as a dark rim)
  badge: { position: 'absolute', inset: 0, borderRadius: '50%', background: LVL.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 26px rgba(${LVL.glow},.42), inset 0 -4px 0 rgba(0,0,0,.10)`, animation: 'badgeBounce .55s cubic-bezier(.22,1.4,.36,1) .1s both' },
  // numeral = LVL.onFill (violet-950), not white — see the note in mathkit.
  // The drop shadow goes with it: it existed to lift white off the saturated
  // violet, and under a deep numeral it just muddies the pastel.
  badgeNum: { position: 'relative', overflow: 'hidden', height: 56, width: '100%', textAlign: 'center', color: LVL.onFill, fontWeight: 800, fontSize: 46, lineHeight: '56px' },
  msg: { fontSize: 19, lineHeight: 1.45, fontWeight: 700, color: T.ink, textWrap: 'pretty', padding: '0 6px' },
  // The signature (Amy's ask): right-aligned like a signed note, because that
  // is the visual grammar for "a person wrote this to you" — which is the
  // entire job of this line. Conditional: no `from`, no signature, so a public
  // build with unsigned copy needs no change here.
  sign: { marginTop: 12, paddingRight: 6, textAlign: 'right', fontSize: 15, fontWeight: 700, color: LVL.main },
  btn: { marginTop: 18, width: '100%', height: 54, border: 'none', borderRadius: 16, background: T.blue, color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer', boxShadow: '0 5px 0 ' + T.blueDarker, transition: 'transform .08s ease, box-shadow .08s ease' },
  piece: { position: 'absolute', top: -8, width: 9, height: 14, borderRadius: 3, animation: 'confettiFall var(--dur) ease-in var(--delay) forwards', pointerEvents: 'none' },
}
// pastel confetti to match the softened level identity (was T.violet/#9810FA —
// the two saturated purples popped out of the card once it went pastel)
const CONFETTI = [LVL.main, '#C4B5FD', '#9FE0D2', '#FBCE7E', '#A9C5F5', '#F5B8D0']

export function LevelUpPopup({ level, message, from, onClose }) {
  const [pieces] = useState(() =>
    [...Array(26)].map((_, i) => ({
      left: 4 + Math.random() * 92,
      dx: Math.random() * 60 - 30 + 'px',
      dy: 140 + Math.random() * 160 + 'px',
      rot: Math.random() * 520 - 260 + 'deg',
      dur: 1.1 + Math.random() * 0.9 + 's',
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
            style={{ ...popStyles.piece, left: p.left + '%', background: p.color, borderRadius: p.round ? '50%' : 3, width: p.round ? 8 : 9, height: p.round ? 8 : 14, '--dx': p.dx, '--dy': p.dy, '--rot': p.rot, '--dur': p.dur, '--delay': p.delay }}
          />
        ))}
        <div style={popStyles.kicker}>Level up!</div>
        <div style={popStyles.badgeWrap}>
          <span style={popStyles.halo} />
          <div style={popStyles.badge}>
            <span style={popStyles.badgeNum}>
              <span style={{ display: 'block', animation: 'rollOut .34s .5s ease-in forwards' }}>{level - 1}</span>
              <span style={{ position: 'absolute', left: 0, top: 0, right: 0, animation: 'rollIn .34s .76s ease-out both' }}>{level}</span>
            </span>
          </div>
        </div>
        <div style={popStyles.msg}>{message}</div>
        {signature && <div style={popStyles.sign}>— {signature}</div>}
        <button
          style={popStyles.btn}
          onClick={onClose}
          onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 2px 0 ' + T.blueDarker }}
          onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 ' + T.blueDarker }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 ' + T.blueDarker }}
        >
          Keep going! ✨
        </button>
      </div>
    </div>
  )
}
