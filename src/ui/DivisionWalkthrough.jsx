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
  /* values live in index.css as --luxi-color-component-division-* (10-21, same hexes) */
  berry: 'var(--luxi-color-component-division-dividend-accent)', berryInk: 'var(--luxi-color-component-division-dividend-text)', /* berryInk = the AA text shade */
  teal: 'var(--luxi-color-component-division-divisor-ring)', tealInk: 'var(--luxi-color-component-division-divisor-text)', tealTint: 'var(--luxi-color-component-division-divisor-background)', /* teal = ring · tealInk = text (5.36) */
  slate: 'var(--luxi-color-component-division-table-tag-background)', slate400: 'var(--luxi-color-component-division-table-border)', slateTint: 'var(--luxi-color-component-division-table-background)',
  answerFill: 'var(--luxi-color-component-division-answer-background)', answerLine: 'var(--luxi-color-component-division-answer-border)', answerLineSolid: 'var(--luxi-color-component-division-answer-border-sealed)',
  goldB: 'var(--luxi-color-component-division-sneaky-zero-accent)',
  quotient: 'var(--luxi-color-component-division-quotient-text)', /* quotient = dark orange */
}
const MOVES = [
  { key: 'DIVIDE', label: 'Divide', color: 'var(--luxi-color-component-division-move-divide-accent)', tint: 'var(--luxi-color-component-division-move-divide-tint)' },
  { key: 'MULTIPLY', label: 'Multiply', color: 'var(--luxi-color-component-division-move-multiply-accent)', tint: 'var(--luxi-color-component-division-move-multiply-tint)' },
  { key: 'SUBTRACT', label: 'Subtract', color: 'var(--luxi-color-component-division-move-subtract-accent)', tint: 'var(--luxi-color-component-division-move-subtract-tint)' },
  { key: 'BRINGDOWN', label: 'Bring down', color: 'var(--luxi-color-component-division-move-bringdown-accent)', tint: 'var(--luxi-color-component-division-move-bringdown-tint)' },
]
/* Diagram labels (Amy 2026-10-05): the math TERM leads (12/700 caps, the part's colour),
   the friendly explanation sits under it as secondary text (12/400). */
const term = (color) => ({ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.05em' })
const explain = { display: 'block', fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 'var(--text-xs--line-height)' } // 18 — an on-grid line box (was 1.3 = 15.6)
const CANDY = '/worked/candies.png'
const FRIEND = '/worked/friend.png'

/* diagram geometry (Oscar's exact values) */
/* Label ↔ math spacing (Amy 2026-10-05): every annotation sits LABELGAP from its math —
   QUOTIENT above the Answer Box, the divisor column left of the bracket, DIVIDEND right of
   the box. COLW = the divisor column (widest label, centred); the Answer Box and the
   Sharing Table overhang their cells by PAD, so GUTTER = COLW + LABELGAP + PAD.
   S3 govern (10-21): Oscar's 7 · 46 · 50 · 26 · 68 → 8 · 48 · 48 · 24 · 72, every
   offset on the 4px grid (COLW 72 centres the 48 divisor circle at 12). */
const LABELGAP = 16, COLW = 72, PAD = 8
const CELL = 44, FS = 'var(--text-2xl)', ROWH = 48, TOPPAD = 52, GUTTER = COLW + LABELGAP + PAD, BOTPAD = 24
const LABELW = 128 // the dividend label column: fits "all the candy to share" on one line at 12px
const RW = 40 // "R3" beside the Answer Box: 8px gap + glyphs (measured: DIVIDEND lands LABELGAP past it)
const QLH = 36 // the QUOTIENT label block: two 18px lines (term + explain)
const BOX_TOP = 4, BOX_H = ROWH - 8 // the Answer Box inside the quotient row: centred, 4px clear of the bracket
/* Motion (S3): chrome ≤ 300ms; on-screen moves 500; the moves that TEACH use Datum's
   expressive tier (800 · 1000, styling-v0.36) so a kid can follow them. Overshoot lives in
   the dv- keyframes, never in the curve. */
const SLIDE = '500ms var(--ease-in-out)' // the Sharing Table sliding to the next digits
const TEACH = '800ms var(--ease-in-out)' // expressive: the digit brought down (was .62s)
const POP = '300ms var(--ease-out)' // a digit landing

/* Oscar's skeuomorphic pressable button (his `style-active` → a pressed state).
   Distinct from mathkit's BigButton — this is the division comp's own look. */
function PressBtn({ children, onClick, variant = 'primary' }) {
  const [down, setDown] = useState(false)
  const V = {
    /* S3: primary carries a transparent stroke so all three share one height (was 13px pad, no border) */
    primary: { bg: 'var(--luxi-color-component-division-button-primary-background)' /* Iris 500 / 700 shadow, like every Luxi primary */, color: 'var(--luxi-color-component-division-button-primary-text)', border: 'var(--border-stroke-2) solid transparent', shadow: 'var(--luxi-color-component-division-button-primary-shadow)', pad: '12px 24px', fs: 'var(--text-base)' },
    secondary: { bg: 'var(--color-background-base)', color: 'var(--luxi-color-component-division-button-secondary-text)', border: 'var(--border-stroke-2) solid var(--luxi-color-component-division-button-secondary-border)', shadow: 'var(--luxi-color-component-division-button-secondary-shadow)', pad: '12px 20px', fs: 'var(--text-base)' },
    back: { bg: 'var(--color-background-base)', color: 'var(--color-text-secondary)', border: 'var(--border-stroke-2) solid var(--color-border-default)', shadow: 'var(--luxi-color-component-division-button-back-shadow)', pad: '12px 20px', fs: 'var(--text-base)' },
  }[variant]
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, border: V.border, background: V.bg,
        color: V.color, fontWeight: 500, fontSize: V.fs, borderRadius: 16, /* was 14 — BigButton's 16 */ padding: V.pad, cursor: 'pointer',
        boxShadow: down ? `0 0 0 ${V.shadow}` : `0 4px 0 ${V.shadow}`, /* the 4px house press (was 3px → 1px) */
        transform: down ? 'translateY(4px)' : 'none', transition: 'transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out)',
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
  const textPrimary = P.textPrimary
  const xL = (c) => GUTTER + c * CELL
  const yT = (r) => TOPPAD + r * ROWH
  const totemL = (COLW - 48) / 2 // 12
  const els = []

  // Sharing Table spotlight (neutral slate) — slides + pulses between columns
  if (snap.table) {
    const cs = snap.table.cols[0], ce = snap.table.cols[1], r = snap.table.row
    els.push(
      <div key="table" style={{
        position: 'absolute', left: xL(cs) - PAD, top: yT(r) - 4, width: (ce - cs + 1) * CELL + 2 * PAD, height: ROWH + 4,
        border: `var(--border-stroke-2) solid ${P.slate400}`, background: P.slateTint, borderRadius: 12, /* was 14 — the Answer Box's 12 */ zIndex: 1,
        animation: 'dvTablePulse 2.3s ease-in-out infinite', /* infinite loop — exempt */
        transition: `left ${SLIDE}, top ${SLIDE}, width ${SLIDE}`,
      }}>
        <span style={{
          position: 'absolute', bottom: -12, left: 12, fontSize: 'var(--text-xs)' /* bottom edge: on top it hid under the Answer Box in round 1 */, lineHeight: 1, fontWeight: 700, letterSpacing: '.05em',
          textTransform: 'uppercase', color: 'var(--color-text-inverse)', background: P.slate, borderRadius: 8, padding: '4px 8px', /* 20 tall (was 18.4) */ whiteSpace: 'nowrap',
        }}>Sharing Table</span>
      </div>,
    )
  }

  // Answer Box (quotient) — dashed yellow while working, seals solid on final
  const sealed = snap.final
  els.push(
    <div key="ansbox" style={{
      position: 'absolute', left: xL(0) - PAD, top: yT(0) + BOX_TOP, width: n * CELL + 2 * PAD, height: BOX_H, borderRadius: 12,
      background: P.answerFill, border: sealed ? `var(--border-stroke-2) solid ${P.answerLineSolid}` : `var(--border-stroke-2) dashed ${P.answerLine}`,
      zIndex: 1, animation: sealed ? 'dvAnswerSeal 500ms var(--ease-out) both' : 'none', transition: 'border-color 300ms var(--ease-out)',
    }} />,
  )
  els.push(
    <div key="ql" style={{ position: 'absolute', left: xL(0) - PAD, top: yT(0) + BOX_TOP - LABELGAP - QLH, /* text ends LABELGAP above the Answer Box */ width: n * CELL + 2 * PAD, textAlign: 'center', zIndex: 2 }}>
      {showTerms && <span style={term(P.quotient)}>Quotient</span>}
      <span style={{ ...explain, whiteSpace: 'nowrap' }}>Each friend&apos;s share</span>
    </div>,
  )
  if (!snap.qShown.some(Boolean)) {
    els.push(
      <div key="qmark" style={{
        position: 'absolute', left: xL(0) - PAD, top: yT(0) + BOX_TOP, width: n * CELL + 2 * PAD, height: BOX_H,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: FS, fontWeight: 700, color: P.quotient, zIndex: 2,
      }}>?</div>,
    )
  }

  // The Friends totem (divisor): friend image + teal-ringed number + label
  els.push(<img key="fimg" src={FRIEND} alt="friend" style={{ position: 'absolute', left: totemL, top: yT(1) - 52, /* 4px above the circle */ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--luxi-shadow-division-friend)', zIndex: 2 }} />)
  els.push(
    <div key="dv" style={{
      position: 'absolute', left: totemL, top: yT(1), width: 48, height: 48, /* fills the row (was 46) */ borderRadius: '50%',
      border: `var(--border-stroke-2) solid ${P.teal}`, background: P.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 'var(--text-2xl)', fontWeight: 700, color: P.tealInk, zIndex: 2, /* divisor = dark teal */
    }}>{String(b)}</div>,
  )
  els.push(
    <div key="dvl" style={{ position: 'absolute', left: 0, top: yT(1) + 60, /* 12px under the 48 circle */ width: COLW, textAlign: 'center', zIndex: 2 }}>
      {showTerms && <span style={term(P.tealInk)}>Divisor</span>}
      <span style={explain}>The friends</span>
    </div>,
  )

  // Division bracket (hand-drawn path)
  // the path is DRAWING (coordinates + the 3px pen are artwork, not layout); the box is on the grid
  const brW = n * CELL + 20, brH = ROWH + 8
  els.push(
    <svg key="br" width={brW} height={brH} viewBox={`0 0 ${brW} ${brH}`} style={{ position: 'absolute', left: GUTTER - 16, top: yT(1) - 4, zIndex: 2, overflow: 'visible' }}>
      <path d={`M16 4 H ${brW - 4} M16 4 Q 3 ${brH * 0.5} 10 ${brH - 2}`} fill="none" style={{ stroke: textPrimary }} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  )

  // The Candy Bag totem (dividend): bag image + berry label
  els.push(
    <div key="cbag" style={{
      /* LABELGAP right of the Answer Box; on the final step it slides aside for "R3" */
      position: 'absolute', left: xL(0) + n * CELL + PAD + LABELGAP + (snap.final && remainder > 0 ? RW : 0), transition: 'left 300ms var(--ease-in-out)', top: yT(0) - 12, width: LABELW, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
      <img src={CANDY} alt="candy bag" style={{ width: 56, height: 56, objectFit: 'contain', alignSelf: 'flex-start', filter: 'var(--luxi-shadow-division-candy)' }} />
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
        justifyContent: 'center', fontSize: FS, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: P.quotient, zIndex: 3,
        animation: hot ? (sneaky ? 'dvShimmer 500ms var(--ease-out) both' : 'dvQuoUp 500ms var(--ease-out) both') : 'none',
      }}>{String(built.q[c])}</div>,
    )
    if (sneaky && hot) {
      els.push(
        <span key={'qz' + c} style={{
          position: 'absolute', left: xL(0) + n * CELL + PAD + 8, top: yT(0) + 12, /* 20 tall, on the box's middle */ fontSize: 'var(--text-xs)' /* beside the Answer Box: at 12px it covered QUOTIENT */, lineHeight: 1, fontWeight: 700, letterSpacing: '.02em',
          color: 'var(--color-text-inverse)', background: P.goldB, borderRadius: 8, padding: '4px 8px', whiteSpace: 'nowrap', zIndex: 4,
          animation: 'dvFadeSlide 300ms 150ms var(--ease-out) both', boxShadow: 'var(--luxi-shadow-division-sneaky-zero-tag)',
        }}>keeps the line!</span>,
      )
    }
  }
  // Dividend digits (grey, faded when waiting their turn)
  for (let c = 0; c < n; c++) {
    els.push(
      <div key={'d' + c} style={{
        position: 'absolute', left: xL(c), top: yT(1), width: CELL, height: ROWH, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: FS, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: snap.dim[c] ? P.textTertiary : P.berryInk, zIndex: 3, /* dividend = pink; waiting digits stay tertiary */ /* faded = tertiary (4.74), Amy 2026-10-05 */
        transition: 'color 300ms var(--ease-out)',
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
          justifyContent: 'center', fontSize: FS, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: textPrimary, zIndex: 3,
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
    if (snap.multShown[si]) placeNum(s.prod, col, multRow, snap.hot.mult === si ? `dvCellPop ${POP} both` : null, 'm' + si)
    if (snap.subShown[si]) {
      els.push(
        <div key={'bar' + si} style={{ position: 'absolute', left: xL(barCols[0]) + 4, top: yT(subRow) - 4, width: (barCols[1] - barCols[0] + 1) * CELL - 8, height: 0, borderTop: `var(--border-stroke-2) solid ${textPrimary}`, zIndex: 2 }} />,
      )
      const isRem = si === steps.length - 1
      placeNum(s.sub, col, subRow, snap.hot.sub === si ? `dvCellPop ${POP} both` : null, 's' + si)
      if (isRem && remainder > 0) {
        els.push(
          <span key="rt" style={{ position: 'absolute', left: xL(col) - 8, top: yT(subRow) + ROWH + 4, width: CELL + 16, textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: P.goldB }}>leftover</span>,
        )
      }
    }
    if (snap.bdShown[si]) {
      const nextCol = steps[si + 1].col
      const dist = (subRow - 1) * ROWH
      if (snap.hot.bd === si) {
        els.push(
          <svg key={'bda' + si} width={CELL + 8} height={dist} viewBox={`0 0 ${CELL + 8} ${dist}`} style={{ position: 'absolute', left: xL(nextCol) - 4, top: yT(1), zIndex: 2, overflow: 'visible', animation: 'dvArrowInOut 1000ms var(--ease-out) both' /* expressive: the path shows, holds over the arc, fades (was 1s) */ }}>{/* the arrow's path + pen are drawing */}
            <path d={`M ${(CELL + 8) / 2} 10 C ${(CELL + 8) / 2 + 11} ${dist * 0.42}, ${(CELL + 8) / 2 - 7} ${dist * 0.72}, ${(CELL + 8) / 2} ${dist - 14}`} fill="none" style={{ stroke: 'var(--luxi-color-component-division-bring-down-arrow)' }} /* style: var() never resolves in an SVG attribute */ strokeWidth={2.5} strokeLinecap="round" />
            <path d={`M ${(CELL + 8) / 2 - 6} ${dist - 20} L ${(CELL + 8) / 2} ${dist - 9} L ${(CELL + 8) / 2 + 6} ${dist - 20}`} fill="none" style={{ stroke: 'var(--luxi-color-component-division-bring-down-arrow)' }} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>,
        )
        els.push(
          <div key={'bd' + si} style={{
            position: 'absolute', left: xL(nextCol), top: yT(subRow), width: CELL, height: ROWH, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: FS, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: textPrimary, zIndex: 3,
            '--ay': -dist + 'px', '--ax': '8px', animation: `dvBringArc ${TEACH} both`,
          }}>{String(digits[nextCol])}</div>,
        )
      } else {
        placeNum(digits[nextCol], nextCol, subRow, null, 'bd' + si)
      }
    }
  }

  if (snap.final && remainder > 0) {
    const boxR = xL(0) + n * CELL + PAD
    els.push(
      <div key="Rtop" style={{ position: 'absolute', left: boxR + 8, top: yT(0) + BOX_TOP, height: BOX_H, display: 'flex', alignItems: 'center', fontSize: 'var(--text-2xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: textPrimary, zIndex: 3, animation: `dvCellPop ${POP} 150ms both` }}>{'R' + remainder}</div>,
    )
  }
  if (snap.celebrate) {
    const cc = snap.celebrate === 'sneaky' ? P.goldB : snap.celebrate === 'final' ? P.teal : P.slate400
    els.push(
      <div key={'burst' + snap.celebrate + snap.round} style={{ position: 'absolute', left: xL(0) + (n * CELL) / 2 - 24, /* centred on the Answer Box */ top: yT(0), width: 48, height: 48, borderRadius: '50%', border: `var(--border-stroke-2) solid ${cc}`, zIndex: 1, animation: 'dvBurst 800ms var(--ease-out) both' /* expressive (was .75s) */, pointerEvents: 'none' }} />,
    )
  }
  if (snap.final) {
    const cols = [P.berry, P.teal, P.answerLine, 'var(--luxi-color-component-division-confetti-lilac)', 'var(--luxi-color-component-division-confetti-iris)']
    for (let j = 0; j < 15; j++) {
      els.push(
        // confetti: the scatter is decoration (sin spread); each piece falls 1000 (expressive), staggered 50ms → ~1.7s of rain (was 1.7–2.7s)
        <div key={'cf' + j} style={{ position: 'absolute', left: W * 0.5 + Math.sin(j * 1.8) * W * 0.4, top: 0, width: 8, height: 12, borderRadius: 4, background: cols[j % cols.length], zIndex: 5, opacity: 0, animation: `dvConfetti 1000ms ${50 * j}ms var(--ease-in-out) both` }} />,
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
  const W = GUTTER + n * CELL + PAD + LABELGAP + (built.remainder > 0 ? RW : 0) + LABELW // room for the dividend label incl. its final slide past "R3"
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
  const stageMinH = 252 + Math.max(300, 8 + Hh * (fitScale || 1))

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
    display: 'flex', alignItems: 'center', gap: 16, padding: 16, minHeight: 156, /* was 14 · 15/16 · 157 */
    background: 'var(--color-background-subtle)', border: '1px solid var(--luxi-color-component-division-intro-card-border)', borderRadius: 16,
    opacity: reveal >= n2 ? 1 : 0, transform: reveal >= n2 ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 300ms var(--ease-out), transform 300ms var(--ease-out)', /* was .55s on an overshoot */
  })
  const totemCol = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 116, flexShrink: 0 }
  const copyStyle = { fontSize: 'var(--text-base)', fontWeight: 400, color: P.textPrimary, lineHeight: 1.45, textWrap: 'pretty' }
  const badge = (color, bg) => ({ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.05em', color, background: bg, borderRadius: 999, padding: '4px 12px' })

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
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', background: 'var(--luxi-color-component-division-round-pill-background)', borderRadius: 999, padding: '4px 12px', /* was 6/13 — 29 tall, the title's line */ whiteSpace: 'nowrap', marginRight: closeGutter ? 44 : 0 }}>{roundLabel}</span>
        )}
      </div>

      {phase === 'intro' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <div style={{ width: 128, height: 128, borderRadius: '50%', background: 'radial-gradient(circle at 50% 44%, var(--luxi-color-component-division-intro-candy-start) 0%, var(--luxi-color-component-division-intro-candy-mid) 64%, var(--luxi-color-component-division-intro-candy-end) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--luxi-shadow-division-intro-candy-halo)' }}>
              <img src={CANDY} alt="candy bag" style={{ width: 92, height: 92, objectFit: 'contain', filter: 'var(--luxi-shadow-division-intro-candy)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Card 1 — Candy Bag / DIVIDEND */}
            <div style={cardStyle(1)}>
              <div style={{ ...totemCol, gap: 4 }}>
                <img src={CANDY} alt="candy bag" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'var(--luxi-shadow-division-card-candy)' }} />
                <div style={{ fontSize: 'var(--text-40)', fontWeight: 700, color: P.berryInk, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{a}</div>
                {showMathTerms && <span style={badge(P.berryInk, 'var(--luxi-color-component-division-dividend-background)')}>DIVIDEND</span>}
              </div>
              <div style={copyStyle}>You have {a} candies to share.</div>
            </div>
            {/* Card 2 — The Friends / DIVISOR */}
            <div style={cardStyle(2)}>
              <div style={{ ...totemCol, gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,24px)', gap: 4, justifyContent: 'center' }}>
                  {[0, 1, 2, 3].map((k) => <img key={k} src={FRIEND} alt="friend" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />)}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `var(--border-stroke-2) solid ${P.teal}`, background: P.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-2xl)', fontWeight: 700, color: P.tealInk }}>{b}</div>
                {showMathTerms && <span style={badge(P.tealInk, P.tealTint)}>DIVISOR</span>}
              </div>
              <div style={copyStyle}>You share them with {b} friends.</div>
            </div>
            {/* Card 3 — Quotient / QUOTIENT */}
            <div style={cardStyle(3)}>
              <div style={{ ...totemCol, gap: 4 }}>
                <div style={{ width: 64, height: 48, border: `var(--border-stroke-2) dashed ${P.answerLine}`, background: P.answerFill, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-3xl)', fontWeight: 700, color: P.quotient }}>?</div>
                {showMathTerms && <span style={badge(P.quotient, P.answerFill)}>QUOTIENT</span>}
              </div>
              <div style={copyStyle}>How many does each friend get?</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 'auto', paddingTop: 16, opacity: reveal >= 4 ? 1 : 0, transform: reveal >= 4 ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 300ms var(--ease-out), transform 300ms var(--ease-out)', pointerEvents: reveal >= 4 ? 'auto' : 'none' }}>
            <PressBtn variant="primary" onClick={discover}>Let&apos;s discover it! ▸</PressBtn>
          </div>
        </div>
      ) : (
        <>
          {/* speech-bubble caption card with a 45° tail bottom-left */}
          <div style={{ position: 'relative', minHeight: 72, background: 'var(--color-background-base)', border: '1px solid var(--luxi-color-component-division-caption-border)', borderRadius: 16, boxShadow: 'var(--luxi-shadow-division-caption)', padding: '16px 20px', margin: '16px 0', /* was 14/18 · 14 */ display: 'flex', alignItems: 'center', fontSize: 'var(--text-base)', lineHeight: 1.5, color: P.textPrimary, fontWeight: 500, textWrap: 'pretty' }}>
            {snap.caption}
            <span style={{ content: '""', position: 'absolute', left: 40, bottom: -8, width: 16, height: 16, background: 'var(--color-background-base)', borderRight: '1px solid var(--luxi-color-component-division-caption-border)', borderBottom: '1px solid var(--luxi-color-component-division-caption-border)', transform: 'rotate(45deg)' }} />
          </div>

          {/* four move chips — active lights to its move colour */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: '0 0 4px' }}>
            {MOVES.map((m, mi) => {
              const on = mi === activeMoveIdx
              return (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: on ? m.color : 'var(--color-background-base)', border: on ? `var(--border-stroke-2) solid ${m.color}` : 'var(--border-stroke-2) solid var(--luxi-color-component-division-move-dot-border)', boxShadow: on ? `0 0 0 3px ${m.tint}` /* halo — a shadow, value unchanged */ : 'none', transition: 'background-color 200ms var(--ease-out), border-color 200ms var(--ease-out), box-shadow 200ms var(--ease-out)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: on ? 700 : 500, color: on ? m.color : P.textTertiary, whiteSpace: 'nowrap', transition: 'color 200ms var(--ease-out)' }}>{m.label}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '4px 0', minHeight: 300, overflow: 'visible' }}>
            {renderDiagram(snap, built, showMathTerms, fitScale, W, Hh)}
          </div>

          {/* progress dots (active = wide pill) */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', margin: '8px 0 12px', flexWrap: 'wrap' }}>
            {stages.map((_, j) => (
              <span key={j} style={{ width: j === idx ? 20 : 8, height: 8, borderRadius: 4, /* was 18/7 · 5 */ background: j === idx ? 'var(--luxi-color-component-division-progress-dot-current)' : j < idx ? 'var(--luxi-color-component-division-progress-dot-done)' : 'var(--luxi-color-component-division-progress-dot-upcoming)', transition: 'width 200ms var(--ease-out), background-color 200ms var(--ease-out)' }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
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
