import { useEffect, useMemo, useRef, useState } from 'react'
import { buildDivisionStages } from '../math'

/*
 * DivisionWalkthrough — Oscar's C2 "Let's share the candy" comp, lifted 1:1
 * (~/Downloads/Luxi Math design_handoff_division_worked_example). An animated
 * long-division walkthrough taught as fair sharing: name the parts (Intro),
 * then step the algorithm one move at a time (Work) — DIVIDE → MULTIPLY →
 * SUBTRACT → BRING DOWN, per digit, with a moving Sharing Table spotlight, a
 * dashed→solid Answer Box for the quotient, the celebrated "sneaky zero," and a
 * final seal to the answer. This is the TEACHING walkthrough the wrong-answer
 * layer recovers into (Oscar's note); the interactive solve/input lives in the
 * math loop, not here.
 *
 * Ported from his `class Component extends DCLogic` → a React function
 * component; his `build()` is now the pure `buildDivisionStages()` in math.js.
 *
 * Adaptations (all commented at their site):
 *   · keyframes namespaced `dv*` in index.css — his comp redefined `popIn` and
 *     `cellPop` with different curves than the ones MathPopup/ColumnMath use.
 *   · his `uploads/*.png` → the staged `/worked/*.png` assets.
 *   · completion: his `window.dispatchEvent('luxi:worked-example-complete')` →
 *     the house `onDone` callback seam (the family pattern is props, not events).
 *   · renders as CONTENT for a white card parent (the house <Modal>), the way
 *     WorkedExample sits inside MathPopup — it does not draw its own scrim.
 *
 * Props (seams):
 *   problem        { a, b }  — the division to walk through
 *   showMathTerms  boolean   — show DIVIDEND/DIVISOR/QUOTIENT under friendly labels
 *   autoAdvanceMs  number    — Play-mode dwell per step (800–4000)
 *   onDone()                 — fired on "I got it!" (recovery: → try again)
 *   closeGutter    boolean   — parent floats a ✕ top-right (sparkle popup): pill clears it
 */

/* Oscar's division palette — kept local, not folded into mathkit's `T`: these
   are the lesson's SEMANTIC colours (dividend = berry, divisor = teal, Sharing
   Table = slate, quotient = the yellow Answer Box), meaningful only here. */
const P = {
  textPrimary: 'var(--color-text-primary)', textTertiary: 'var(--color-text-tertiary)', // Datum text tiers by name
  berry: '#E60076', berryInk: 'var(--pink-700)', /* berryInk = the AA text shade */
  teal: 'var(--teal-600)', tealInk: 'var(--teal-700)', tealTint: 'var(--teal-50)', /* teal = ring · tealInk = text (5.36) */
  slate: '#62748E', slate400: '#90A1B9', slateTint: 'rgba(98,116,142,.10)',
  answerFill: '#FEF9C2', answerLine: '#F0B100', answerLineSolid: '#D08700',
  goldB: '#C2410C',
}
const MOVES = [
  { key: 'DIVIDE', label: 'Divide', color: 'var(--blue-700)', tint: '#DCE9FF' },
  { key: 'MULTIPLY', label: 'Multiply', color: 'var(--orange-700)', tint: '#FFE7D6' },
  { key: 'SUBTRACT', label: 'Subtract', color: 'var(--red-700)', tint: '#FFDEDE' },
  { key: 'BRINGDOWN', label: 'Bring down', color: 'var(--green-700)', tint: '#D6F5E1' },
]
/* Diagram labels (Amy 2026-10-05): the math TERM leads (12/700 caps, the part's colour),
   the friendly explanation sits under it as secondary text (12/400). */
const term = (color) => ({ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.05em' })
const explain = { display: 'block', fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 1.3 }
const CANDY = '/worked/candies.png'
const FRIEND = '/worked/friend.png'

/* diagram geometry (Oscar's exact values) */
/* Label ↔ math spacing (Amy 2026-10-05): every annotation sits LABELGAP from its math —
   QUOTIENT above the Answer Box, the divisor column left of the bracket, DIVIDEND right of
   the box. COLW = the divisor column (widest label, centred); the bracket is drawn 7px
   inside GUTTER, so GUTTER = COLW + LABELGAP + 7 (measured: 16px rendered). */
const LABELGAP = 16, COLW = 68
const CELL = 44, FS = 26, ROWH = 50, TOPPAD = 52, GUTTER = COLW + LABELGAP + 7, BOTPAD = 26
const LABELW = 128 // the dividend label column: fits "all the candy to share" on one line at 12px
const RW = 37 // "R3" beside the Answer Box: 8px gap + glyphs (measured: DIVIDEND lands 16px past it)

/* Oscar's skeuomorphic pressable button (his `style-active` → a pressed state).
   Distinct from mathkit's BigButton — this is the division comp's own look. */
function PressBtn({ children, onClick, variant = 'primary' }) {
  const [down, setDown] = useState(false)
  const V = {
    primary: { bg: 'var(--brand-iris-500)' /* Luxi 3D button face (Iris 500 / 700 shadow), like every Luxi primary */, color: '#fff', border: 'none', shadow: 'var(--brand-iris-700)', pad: '13px 24px', fs: 'var(--text-base)' },
    secondary: { bg: '#fff', color: 'var(--brand-iris-700)', border: '2px solid var(--brand-lilac-200)', shadow: 'var(--brand-lilac-200)', pad: '12px 20px', fs: 'var(--text-base)' },
    back: { bg: '#fff', color: 'var(--color-text-secondary)', border: '2px solid #E5E5E5', shadow: '#E5E5E5', pad: '12px 20px', fs: 'var(--text-base)' },
  }[variant]
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, border: V.border, background: V.bg,
        color: V.color, fontWeight: 500, fontSize: V.fs, borderRadius: 14, padding: V.pad, cursor: 'pointer',
        boxShadow: down ? `0 1px 0 ${V.shadow}` : `0 4px 0 ${V.shadow}`,
        transform: down ? 'translateY(3px)' : 'none', transition: 'transform .07s, box-shadow .07s',
      }}>
      {children}
    </button>
  )
}

/* ---- the division diagram (ported from Oscar's _diagram) -------------------
   Absolutely-positioned grid inside a WxHh box; the box is scaled DOWN by
   fitScale to fit a narrow modal (never up). Everything is his notation. */
function renderDiagram(snap, built, showTerms, fitScale, W, Hh) {
  const { n, steps, remainder, digits, b } = built
  const textPrimary = P.textPrimary, textTertiary = P.textTertiary
  const xL = (c) => GUTTER + c * CELL
  const yT = (r) => TOPPAD + r * ROWH
  const totemL = Math.round((COLW - 46) / 2)
  const els = []

  // Sharing Table spotlight (neutral slate) — slides + pulses between columns
  if (snap.table) {
    const cs = snap.table.cols[0], ce = snap.table.cols[1], r = snap.table.row
    els.push(
      <div key="table" style={{
        position: 'absolute', left: xL(cs) - 7, top: yT(r) - 6, width: (ce - cs + 1) * CELL + 14, height: ROWH + 4,
        border: `2.5px solid ${P.slate400}`, background: P.slateTint, borderRadius: 14, zIndex: 1,
        animation: 'dvTablePulse 2.3s ease-in-out infinite',
        transition: 'left .45s cubic-bezier(.3,.8,.3,1),top .45s cubic-bezier(.3,.8,.3,1),width .45s',
      }}>
        <span style={{
          position: 'absolute', bottom: -13, left: 11, fontSize: 'var(--text-xs)' /* bottom edge: on top it hid under the Answer Box in round 1 */, lineHeight: 1.2, fontWeight: 700, letterSpacing: '.05em',
          textTransform: 'uppercase', color: '#fff', background: P.slate, borderRadius: 7, padding: '2px 7px', whiteSpace: 'nowrap',
        }}>Sharing Table</span>
      </div>,
    )
  }

  // Answer Box (quotient) — dashed yellow while working, seals solid on final
  const sealed = snap.final
  els.push(
    <div key="ansbox" style={{
      position: 'absolute', left: xL(0) - 7, top: yT(0) + 1, width: n * CELL + 14, height: ROWH - 4, borderRadius: 12,
      background: P.answerFill, border: sealed ? `2.5px solid ${P.answerLineSolid}` : `2.5px dashed ${P.answerLine}`,
      zIndex: 1, animation: sealed ? 'dvAnswerSeal .55s ease-out both' : 'none', transition: 'border-color .3s',
    }} />,
  )
  els.push(
    <div key="ql" style={{ position: 'absolute', left: xL(0) - 7, top: yT(0) - 48, /* text ends LABELGAP above the Answer Box */ width: n * CELL + 14, textAlign: 'center', zIndex: 2 }}>
      {showTerms && <span style={term('var(--amber-700)')}>Quotient</span>}
      <span style={{ ...explain, whiteSpace: 'nowrap' }}>Each friend&apos;s share</span>
    </div>,
  )
  if (!snap.qShown.some(Boolean)) {
    els.push(
      <div key="qmark" style={{
        position: 'absolute', left: xL(0) - 7, top: yT(0) + 1, width: n * CELL + 14, height: ROWH - 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: FS, fontWeight: 800, color: 'var(--amber-700)', zIndex: 2,
      }}>?</div>,
    )
  }

  // The Friends totem (divisor): friend image + teal-ringed number + label
  els.push(<img key="fimg" src={FRIEND} alt="friend" style={{ position: 'absolute', left: totemL - 1, top: yT(1) - 52, width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 7px rgba(90,60,120,.22)', zIndex: 2 }} />)
  els.push(
    <div key="dv" style={{
      position: 'absolute', left: totemL, top: yT(1) + (ROWH - 46) / 2, width: 46, height: 46, borderRadius: '50%',
      border: `2.5px solid ${P.teal}`, background: P.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 24, fontWeight: 800, color: P.tealInk, zIndex: 2, /* divisor = dark teal */
    }}>{String(b)}</div>,
  )
  els.push(
    <div key="dvl" style={{ position: 'absolute', left: 0, top: yT(1) + 60, /* 12px under the divisor circle */ width: COLW, textAlign: 'center', zIndex: 2 }}>
      {showTerms && <span style={term(P.tealInk)}>Divisor</span>}
      <span style={explain}>The friends</span>
    </div>,
  )

  // Division bracket (hand-drawn path)
  const brW = n * CELL + 18, brH = ROWH + 6
  els.push(
    <svg key="br" width={brW} height={brH} viewBox={`0 0 ${brW} ${brH}`} style={{ position: 'absolute', left: GUTTER - 16, top: yT(1) - 3, zIndex: 2, overflow: 'visible' }}>
      <path d={`M16 3 H ${brW - 2} M16 3 Q 3 ${brH * 0.5} 10 ${brH - 2}`} fill="none" style={{ stroke: textPrimary }} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  )

  // The Candy Bag totem (dividend): bag image + berry label
  els.push(
    <div key="cbag" style={{
      /* LABELGAP right of the Answer Box; on the final step it slides aside for "R3" */
      position: 'absolute', left: xL(0) + n * CELL + 7 + LABELGAP + (snap.final && remainder > 0 ? RW : 0), transition: 'left .4s ease', top: yT(0) - 10, width: LABELW, display: 'flex', flexDirection: 'column', gap: 5, zIndex: 2 }}>
      <img src={CANDY} alt="candy bag" style={{ width: 54, height: 54, objectFit: 'contain', alignSelf: 'flex-start', filter: 'drop-shadow(0 3px 6px rgba(90,60,120,.18))' }} />
      <div>
        {showTerms && <span style={term(P.berryInk)}>Dividend</span>}
        <span style={{ ...explain, whiteSpace: 'nowrap' }}>all the candy to share</span>{/* one line, like the other two (Amy: the picture already says "candy bag") */}
      </div>
    </div>,
  )

  // Quotient digits (calm grey; the yellow box does the highlighting)
  for (let c = 0; c < n; c++) {
    if (!snap.qShown[c]) continue
    const sneaky = snap.qSneaky[c], hot = snap.hot.q === c
    els.push(
      <div key={'q' + c} style={{
        position: 'absolute', left: xL(c), top: yT(0), width: CELL, height: ROWH, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: FS, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--amber-700)', zIndex: 3, /* quotient = dark orange */
        animation: hot ? (sneaky ? 'dvShimmer .6s ease-out both' : 'dvQuoUp .5s cubic-bezier(.2,.8,.3,1.2) both') : 'none',
      }}>{String(built.q[c])}</div>,
    )
    if (sneaky && hot) {
      els.push(
        <span key={'qz' + c} style={{
          position: 'absolute', left: xL(0) + n * CELL + 15, top: yT(0) + ROWH / 2 - 11, fontSize: 'var(--text-xs)' /* beside the Answer Box: at 12px it covered QUOTIENT */, lineHeight: 1.2, fontWeight: 700, letterSpacing: '.02em',
          color: '#fff', background: P.goldB, borderRadius: 6, padding: '2px 6px', whiteSpace: 'nowrap', zIndex: 4,
          animation: 'dvFadeSlide .5s .15s both', boxShadow: '0 2px 5px rgba(0,0,0,.12)',
        }}>keeps the line!</span>,
      )
    }
  }
  // Dividend digits (grey, faded when waiting their turn)
  for (let c = 0; c < n; c++) {
    els.push(
      <div key={'d' + c} style={{
        position: 'absolute', left: xL(c), top: yT(1), width: CELL, height: ROWH, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: FS, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: snap.dim[c] ? P.textTertiary : P.berryInk, zIndex: 3, /* dividend = pink; waiting digits stay tertiary */ /* faded = tertiary (4.74), Amy 2026-10-05 */
        transition: 'color .4s',
      }}>{String(digits[c])}</div>,
    )
  }

  // helper: right-align a number's digits into columns ending at endCol
  const placeNum = (val, endCol, rowIdx, anim, kp) => {
    const s = String(val)
    for (let j = 0; j < s.length; j++) {
      const c = endCol - (s.length - 1 - j)
      if (c < 0) continue
      els.push(
        <div key={kp + '_' + j} style={{
          position: 'absolute', left: xL(c), top: yT(rowIdx), width: CELL, height: ROWH, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: FS, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: textPrimary, zIndex: 3,
          animation: anim || 'none',
        }}>{s[j]}</div>,
      )
    }
  }

  for (let si = 0; si < steps.length; si++) {
    const s = steps[si]
    const col = s.col
    const multRow = 2 + 2 * si, subRow = 3 + 2 * si
    // subtraction bar spans the group being divided: the leading group for the
    // first step, else the leftover + the brought-down digit (two columns)
    const barCols = si === 0 ? [0, built.startCol] : [col - 1, col]
    if (snap.multShown[si]) placeNum(s.prod, col, multRow, snap.hot.mult === si ? 'dvCellPop .34s ease-out both' : null, 'm' + si)
    if (snap.subShown[si]) {
      els.push(
        <div key={'bar' + si} style={{ position: 'absolute', left: xL(barCols[0]) + 4, top: yT(subRow) - 3, width: (barCols[1] - barCols[0] + 1) * CELL - 8, height: 0, borderTop: `2.5px solid ${textPrimary}`, zIndex: 2 }} />,
      )
      const isRem = si === steps.length - 1
      placeNum(s.sub, col, subRow, snap.hot.sub === si ? 'dvCellPop .34s ease-out both' : null, 's' + si)
      if (isRem && remainder > 0) {
        els.push(
          <span key="rt" style={{ position: 'absolute', left: xL(col) - 8, top: yT(subRow) + ROWH + 2, width: CELL + 16, textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: P.goldB }}>leftover</span>,
        )
      }
    }
    if (snap.bdShown[si]) {
      const nextCol = steps[si + 1].col
      const dist = (subRow - 1) * ROWH
      if (snap.hot.bd === si) {
        els.push(
          <svg key={'bda' + si} width={CELL + 8} height={dist} viewBox={`0 0 ${CELL + 8} ${dist}`} style={{ position: 'absolute', left: xL(nextCol) - 4, top: yT(1), zIndex: 2, overflow: 'visible', animation: 'dvArrowInOut 1s ease-out both' }}>
            <path d={`M ${(CELL + 8) / 2} 10 C ${(CELL + 8) / 2 + 11} ${dist * 0.42}, ${(CELL + 8) / 2 - 7} ${dist * 0.72}, ${(CELL + 8) / 2} ${dist - 14}`} fill="none" stroke="#A1A1A1" strokeWidth={2.5} strokeLinecap="round" />
            <path d={`M ${(CELL + 8) / 2 - 6} ${dist - 20} L ${(CELL + 8) / 2} ${dist - 9} L ${(CELL + 8) / 2 + 6} ${dist - 20}`} fill="none" stroke="#A1A1A1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>,
        )
        els.push(
          <div key={'bd' + si} style={{
            position: 'absolute', left: xL(nextCol), top: yT(subRow), width: CELL, height: ROWH, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: FS, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: textPrimary, zIndex: 3,
            '--ay': -dist + 'px', '--ax': '9px', animation: 'dvBringArc .62s cubic-bezier(.3,.7,.3,1.15) both',
          }}>{String(digits[nextCol])}</div>,
        )
      } else {
        placeNum(digits[nextCol], nextCol, subRow, null, 'bd' + si)
      }
    }
  }

  if (snap.final && remainder > 0) {
    const boxR = xL(0) - 7 + n * CELL + 14
    els.push(
      <div key="Rtop" style={{ position: 'absolute', left: boxR + 8, top: yT(0) + 1, height: ROWH - 4, display: 'flex', alignItems: 'center', fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: textPrimary, zIndex: 3, animation: 'dvCellPop .4s .15s both' }}>{'R' + remainder}</div>,
    )
  }
  if (snap.celebrate) {
    const cc = snap.celebrate === 'sneaky' ? P.goldB : snap.celebrate === 'final' ? P.teal : P.slate400
    els.push(
      <div key={'burst' + snap.celebrate + snap.round} style={{ position: 'absolute', left: xL(0) + (n * CELL) / 2 - 22, top: yT(0) + 2, width: 44, height: 44, borderRadius: '50%', border: `3px solid ${cc}`, zIndex: 1, animation: 'dvBurst .75s ease-out both', pointerEvents: 'none' }} />,
    )
  }
  if (snap.final) {
    const cols = ['#E60076', '#009689', '#F0B100', '#8570D2', '#2D6DF6']
    for (let j = 0; j < 15; j++) {
      els.push(
        <div key={'cf' + j} style={{ position: 'absolute', left: W * 0.5 + Math.sin(j * 1.8) * W * 0.4, top: 0, width: 8, height: 12, borderRadius: 2, background: cols[j % cols.length], zIndex: 5, opacity: 0, animation: `dvConfetti ${1.7 + (j % 5) * 0.25}s ${0.05 * j}s ease-in both` }} />,
      )
    }
  }

  const k1 = Math.min(1, fitScale || 1)
  return (
    <div style={{ width: '100%', height: Hh * k1, position: 'relative', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: `translateX(-50%) scale(${k1})`, transformOrigin: 'top center', width: W, height: Hh }}>{els}</div>
    </div>
  )
}

export default function DivisionWalkthrough({ problem, showMathTerms = true, autoAdvanceMs = 2200, onDone, closeGutter = false }) {
  const { a, b } = problem
  const built = useMemo(() => buildDivisionStages(a, b), [a, b])
  const stages = built.stages
  const n = built.n
  const W = GUTTER + n * CELL + 7 + LABELGAP + (built.remainder > 0 ? RW : 0) + LABELW // room for the dividend label incl. its final slide past "R3"
  const Hh = TOPPAD + (2 + 2 * built.steps.length) * ROWH + BOTPAD

  const [phase, setPhase] = useState('intro') // 'intro' | 'work'
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reveal, setReveal] = useState(0) // 0–4, intro card/CTA stagger
  const [done, setDone] = useState(false)
  const [fitScale, setFitScale] = useState(1)
  const [introNonce, setIntroNonce] = useState(0) // bump = re-run the intro stagger
  const stageHostRef = useRef(null)

  // fresh problem → restart at the intro with the reveal sequence
  useEffect(() => {
    setPhase('intro'); setI(0); setPlaying(false); setDone(false); setIntroNonce((k) => k + 1)
  }, [a, b])

  // intro card/CTA staggered entrance: first at 350ms, then every 1300ms to 4
  useEffect(() => {
    if (phase !== 'intro') return
    setReveal(0)
    let iv
    const t1 = setTimeout(() => {
      setReveal(1)
      let r = 1
      iv = setInterval(() => {
        r += 1
        if (r >= 4) { setReveal(4); clearInterval(iv) } else setReveal(r)
      }, 1300)
    }, 350)
    return () => { clearTimeout(t1); if (iv) clearInterval(iv) }
  }, [introNonce, phase])

  // Play-mode auto-advance (dwell = autoAdvanceMs, floor 700), stops at the last
  useEffect(() => {
    if (!playing || phase !== 'work') return
    const ms = Math.max(700, +autoAdvanceMs || 2200)
    const t = setInterval(() => {
      setI((s) => { if (s >= stages.length - 1) { setPlaying(false); return s } return s + 1 })
    }, ms)
    return () => clearInterval(t)
  }, [playing, phase, autoAdvanceMs, stages.length])

  // ResizeObserver: scale the diagram DOWN to fit a narrow modal, never up
  useEffect(() => {
    const el = stageHostRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const avail = el.clientWidth || el.getBoundingClientRect().width
      if (!avail) return
      const k = Math.min(1, avail / W)
      setFitScale((prev) => (Math.abs(k - prev) > 0.008 ? k : prev))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [W])

  const idx = Math.max(0, Math.min(i, stages.length - 1))
  const snap = stages[idx]
  const isLast = idx >= stages.length - 1
  const roundLabel = snap.final ? null /* Amy 2026-10-05: no "All shared!" pill — less noise */ : snap.round == null ? "Let's begin" : 'Round ' + (snap.round + 1) + ' of ' + built.steps.length
  // keep intro and work the same height so switching phases doesn't jump (Oscar)
  const stageMinH = 250 + Math.max(300, 8 + Hh * (fitScale || 1))

  const discover = () => { setPhase('work'); setI(0); setPlaying(false); setDone(false) }
  const back = () => {
    setPlaying(false)
    if (idx <= 0) { setPhase('intro'); setReveal(4) } // cards already revealed — no re-stagger
    else setI((s) => Math.max(s - 1, 0))
  }
  const next = () => { setPlaying(false); setI((s) => Math.min(s + 1, stages.length - 1)) }
  const restart = () => { setPhase('intro'); setI(0); setPlaying(false); setDone(false); setReveal(0); setIntroNonce((k) => k + 1) }
  const gotIt = () => {
    // house seam — Oscar's comp fired window 'luxi:worked-example-complete';
    // the family pattern is a callback prop, so the shell decides what's next
    // (recovery → try the real problem again; a standalone lesson → close).
    onDone?.()
    setDone(true)
  }

  const activeMoveIdx = snap.move ? MOVES.findIndex((m) => m.key === snap.move) : -1

  // intro concept-card style (staggered reveal at index `idx`)
  const cardStyle = (n2) => ({
    display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', minHeight: 157,
    background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 16,
    opacity: reveal >= n2 ? 1 : 0, transform: reveal >= n2 ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity .55s ease, transform .55s cubic-bezier(.2,.8,.3,1.2)',
  })
  const totemCol = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 116, flexShrink: 0 }
  const copyStyle = { fontSize: 'var(--text-base)', fontWeight: 400, color: P.textPrimary, lineHeight: 1.45, textWrap: 'pretty' }
  const badge = (color, bg) => ({ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.05em', color, background: bg, borderRadius: 999, padding: '3px 10px' })

  return (
    // renders as content inside a white card parent (the house <Modal>); the
    // `20px 24px 24px` padding matches Oscar's modal inner padding
    <div ref={stageHostRef} style={{ display: 'flex', flexDirection: 'column', minHeight: Math.round(stageMinH), padding: '20px 24px 24px', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: P.textPrimary, letterSpacing: '-.01em' }}>Let&apos;s share the candy 🍬</div>
        {phase === 'work' && roundLabel && (
          // closeGutter: only the sparkle popup floats its ✕ (40px at right:14) in this
          // corner, so only there does the pill reserve 44px (Amy 2026-08-31). Everywhere
          // else it aligns with the bubble's right edge (Amy 2026-10-05).
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', background: '#F5F5F5', borderRadius: 999, padding: '6px 13px', whiteSpace: 'nowrap', marginRight: closeGutter ? 44 : 0 }}>{roundLabel}</span>
        )}
      </div>

      {phase === 'intro' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <div style={{ width: 128, height: 128, borderRadius: '50%', background: 'radial-gradient(circle at 50% 44%, #FCECF4 0%, #F5E6FA 64%, #F0E8FD 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(120,80,150,.15)' }}>
              <img src={CANDY} alt="candy bag" style={{ width: 92, height: 92, objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(90,60,120,.24))' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Card 1 — Candy Bag / DIVIDEND */}
            <div style={cardStyle(1)}>
              <div style={{ ...totemCol, gap: 5 }}>
                <img src={CANDY} alt="candy bag" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(90,60,120,.20))' }} />
                <div style={{ fontSize: 40, fontWeight: 800, color: P.berryInk, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{a}</div>
                {showMathTerms && <span style={badge(P.berryInk, '#FDF2F8')}>DIVIDEND</span>}
              </div>
              <div style={copyStyle}>You have {a} candies to share.</div>
            </div>
            {/* Card 2 — The Friends / DIVISOR */}
            <div style={cardStyle(2)}>
              <div style={{ ...totemCol, gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,26px)', gap: 4, justifyContent: 'center' }}>
                  {[0, 1, 2, 3].map((k) => <img key={k} src={FRIEND} alt="friend" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />)}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2.5px solid ${P.teal}`, background: P.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: P.tealInk }}>{b}</div>
                {showMathTerms && <span style={badge(P.tealInk, P.tealTint)}>DIVISOR</span>}
              </div>
              <div style={copyStyle}>You share them with {b} friends.</div>
            </div>
            {/* Card 3 — Quotient / QUOTIENT */}
            <div style={cardStyle(3)}>
              <div style={{ ...totemCol, gap: 5 }}>
                <div style={{ width: 62, height: 50, border: '2.5px dashed #F0B100', background: '#FEF9C2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: 'var(--amber-700)' }}>?</div>
                {showMathTerms && <span style={badge('var(--amber-700)', '#FEF9C2')}>QUOTIENT</span>}
              </div>
              <div style={copyStyle}>How many does each friend get?</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 'auto', paddingTop: 18, opacity: reveal >= 4 ? 1 : 0, transform: reveal >= 4 ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity .5s ease, transform .5s ease', pointerEvents: reveal >= 4 ? 'auto' : 'none' }}>
            <PressBtn variant="primary" onClick={discover}>Let&apos;s discover it! ▸</PressBtn>
          </div>
        </div>
      ) : (
        <>
          {/* speech-bubble caption card with a 45° tail bottom-left */}
          <div style={{ position: 'relative', minHeight: 72, background: '#fff', border: '1px solid #EBEBEB', borderRadius: 16, boxShadow: '0 5px 16px rgba(40,30,70,.07)', padding: '14px 18px', margin: '14px 0', display: 'flex', alignItems: 'center', fontSize: 16, lineHeight: 1.5, color: P.textPrimary, fontWeight: 500, textWrap: 'pretty' }}>
            {snap.caption}
            <span style={{ content: '""', position: 'absolute', left: 38, bottom: -9, width: 17, height: 17, background: '#fff', borderRight: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB', transform: 'rotate(45deg)' }} />
          </div>

          {/* four move chips — active lights to its move colour */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: '2px 0 4px' }}>
            {MOVES.map((m, mi) => {
              const on = mi === activeMoveIdx
              return (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', flexShrink: 0, background: on ? m.color : '#fff', border: on ? `2px solid ${m.color}` : '2px solid #D4D4D4', boxShadow: on ? `0 0 0 3px ${m.tint}` : 'none', transition: 'all .25s' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: on ? 700 : 500, color: on ? m.color : P.textTertiary, whiteSpace: 'nowrap', transition: 'color .25s' }}>{m.label}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '6px 0 2px', minHeight: 300, overflow: 'visible' }}>
            {renderDiagram(snap, built, showMathTerms, fitScale, W, Hh)}
          </div>

          {/* progress dots (active = wide pill) */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', margin: '8px 0 12px', flexWrap: 'wrap' }}>
            {stages.map((_, j) => (
              <span key={j} style={{ width: j === idx ? 18 : 7, height: 7, borderRadius: 5, background: j === idx ? '#262626' : j < idx ? '#B3B3B3' : '#E6E6E6', transition: 'all .2s' }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {!isLast && <PressBtn variant="secondary" onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚ Pause' : '▶ Play'}</PressBtn>}
            {isLast && <PressBtn variant="secondary" onClick={restart}>↺ Watch again</PressBtn>}
            <PressBtn variant="back" onClick={back}>◂ Back</PressBtn>
            {!isLast && <PressBtn variant="primary" onClick={next}>Next step ▸</PressBtn>}
            {isLast && <PressBtn variant="primary" onClick={gotIt}>{done ? 'Yay! ✓' : 'I got it! 🎉'}</PressBtn>}
          </div>
        </>
      )}
    </div>
  )
}
