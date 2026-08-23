import { useEffect, useRef, useState } from 'react'
import Gem from './Gem'
import { OPSYM, buildStages, buildStagesMulti } from '../math'

/*
 * mathkit — the shared visual atoms of the math surface. Oscar's handoff is
 * explicit that these are "shared modules, not copies": the sparkle popup
 * (MathPopup) and the station quest (StationPopup) both compose them, so the
 * keypad, the column-math grid, the worked example, and the gem flight look and
 * behave identically in either encounter. Everything here is Oscar's visual
 * language, generalized only where C1 needed it (the rows model + the v2
 * operand-tracking grid).
 */

/* ---- house tokens (Oscar styling reference · blue controls per Amy) ---- */
export const T = {
  blue: '#2D6DF6', blueDark: '#0A52ED', blueDarker: '#0946CA', blueSubtle: '#E0E8F8', blueTint: '#EFF4FF',
  teal: '#00BBA7', tealLt: '#46ECD5',
  ink: '#262626', ink2: '#4d4d4d', ink3: '#6e6e6e',
  line: '#E6E6E6', surface: '#FFFFFF',
  lilac: '#8570D2', lilacDeep: '#4b3f7a',
  violet: '#7F22FE', amber: '#FE9A00', amberDeep: '#D97706',
  radius: 26, radiusSm: 16,
}

export { Gem }

/* ---- THE MODAL SHELL — one frame for every popup ----------------------
 * Governed by `docs/modal-system.md` (Oscar's locked format, 2026-07-25).
 * Math, Station and Progress all wear THIS shell; the only thing that differs
 * between them is the header TINT (mint = math workflow · soft-violet =
 * progress/level). Change a value here and all three move together — that is
 * the entire point, so never re-declare these numbers in a popup.
 */
export const MODAL = {
  gutter: 20,
  radius: 28, // 4px base unit (Amy) — was 26 before the sync
  scrim: 'rgba(56,42,82,.44)', scrimBlur: 'blur(6px)',
  border: '1.5px solid rgba(74,54,110,.10)',
  shadow: '0 24px 60px rgba(50,38,80,.30), 0 4px 16px rgba(50,38,80,.13)',
  width: 'min(520px, calc(100vw - 40px))',
  // 40, not Oscar's token 36: Amy's call — a friendlier tap target on Ivy's iPad
  // (his comp rendered 40 while MODAL said 36; 40 is what the screenshots show).
  close: 40, closeBg: '#ECEAF1', closeFg: '#6E6685',
}

/* ---- LEVEL IDENTITY — the one violet -----------------------------------
 * Colour reservation across the app: teal = gems (the wallet) · amber =
 * station bonus · VIOLET = levels (permanent progress). Three celebrations,
 * three colours, so Ivy can tell them apart at a glance.
 *
 * PASTEL since 2026-07-26 (Amy: "for all the popup bar, gentle pastel /
 * lighter approach"). It replaced the saturated 5-A violet everywhere at once
 * — the HUD bar, the congratulations card and the progress record book all
 * read from HERE. Declaring it per-file is what made the bar and its own
 * popup two different purples in the first place; don't reintroduce a local
 * copy.
 */
export const LVL = {
  main: '#A78BFA',
  soft: '#F1ECFE',
  deep: '#5B44C4', // text weight — ≈6:1 on white, safe for the points readout
  softLine: '#E7DEFA',
  grad: 'linear-gradient(135deg,#C4B5FD 0%,#A78BFA 58%,#8E7BF2 100%)',
  glow: '139,123,242', // rgb triplet for the soft shadows/halos around level art

  /* The level NUMERAL wherever it sits on `grad` — medallion, reached ladder
   * nodes, the congratulations badge. violet-950 from the primitive ramp.
   *
   * It is not white, and that is a hard constraint rather than a preference:
   * white cannot meet 4.5:1 on a pastel violet at all (violet-300 = 1.86,
   * violet-400 = 2.85, and even violet-500 only reaches 4.40). Pastel field or
   * white text — you cannot have both. Amy's call (2026-07-26) was to keep the
   * pastel and deepen the numeral: this gives 4.55 on the gradient's deepest
   * corner, 5.60 mid, 8.25 on the lightest — passing everywhere.
   *
   * If anyone ever "restores" white here, the card silently drops below AA. */
  onFill: '#2F0D68',
}

/** The close ✕. One implementation so the tap target can never drift again. */
export function ModalClose({ onClick, style }) {
  return (
    <button onClick={onClick} aria-label="Close"
      style={{ border: 'none', background: MODAL.closeBg, color: MODAL.closeFg,
        width: MODAL.close, height: MODAL.close, borderRadius: '50%', cursor: 'pointer',
        fontSize: 15, fontWeight: 600, lineHeight: 1, flex: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>✕</button>
  )
}

/**
 * The shell: fixed wrapper + scrim + card.
 *   onScrim  — omit to make the popup undismissable by tapping outside
 *   overlay  — rendered ABOVE the scrim but OUTSIDE the card, because the gem
 *              flights have to cross the whole screen, not the card
 *   cardStyle — per-popup layout only (padding, scroll model). Never colour,
 *              radius, border or shadow: those belong to every popup equally.
 */
export function Modal({ children, onScrim, cardRef, cardClass, cardStyle, overlay, label,
  animation = 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both', zIndex = 40 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: MODAL.gutter }}>
      <div onClick={onScrim}
        style={{ position: 'absolute', inset: 0, background: MODAL.scrim, backdropFilter: MODAL.scrimBlur,
          WebkitBackdropFilter: MODAL.scrimBlur, animation: 'scrimIn .25s ease-out both' }} />
      {overlay}
      <div ref={cardRef} className={cardClass} role="dialog" aria-label={label}
        style={{ position: 'relative', width: MODAL.width, maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto', background: T.surface, borderRadius: MODAL.radius,
          border: MODAL.border, boxShadow: MODAL.shadow, animation, ...cardStyle }}>
        {children}
      </div>
    </div>
  )
}

/* ---- a scatter of twinkling stars (reward moments) ---- */
export function Sparkles({ colors = ['#fff', T.tealLt, T.blueSubtle], n = 14 }) {
  const items = useRef(
    [...Array(n)].map((_, i) => ({
      left: 8 + Math.random() * 84 + '%',
      top: 6 + Math.random() * 84 + '%',
      sz: 7 + Math.random() * 16,
      delay: i * 30 + Math.random() * 120,
      c: colors[i % colors.length],
    }))
  ).current
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((s, i) => (
        <svg key={i} viewBox="0 0 24 24" width={s.sz} height={s.sz}
          style={{ position: 'absolute', left: s.left, top: s.top, transform: 'translate(-50%,-50%)',
            animation: `sparkTwinkle .8s ${s.delay}ms ease-out both`, filter: 'drop-shadow(0 0 4px rgba(255,255,255,.9))' }}>
          <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" fill={s.c} />
        </svg>
      ))}
    </div>
  )
}

/* ---- chunky house button (3D bottom shadow, presses down on tap) ---- */
export function BigButton({ children, onClick, tone = 'blue', style }) {
  const [down, setDown] = useState(false)
  const tones = {
    blue: { bg: T.blue, fg: '#fff', sh: T.blueDarker },
    ghost: { bg: '#fff', fg: T.blue, sh: '#c9d6f5' },
    amber: { bg: T.amber, fg: '#fff', sh: T.amberDeep },
  }
  const c = tones[tone]
  return (
    <button onClick={onClick}
      onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      style={{ border: tone === 'ghost' ? `2px solid ${T.blueSubtle}` : 'none', background: c.bg, color: c.fg,
        fontWeight: 700, fontSize: 17, borderRadius: 16, padding: '15px 26px', cursor: 'pointer', minHeight: 54,
        boxShadow: down ? `0 1px 0 ${c.sh}` : `0 4px 0 ${c.sh}`, transform: down ? 'translateY(3px)' : 'none',
        transition: 'transform .07s, box-shadow .07s', ...style }}>
      {children}
    </button>
  )
}

/* ---- the equation row: A op B = [entry] (shared by both ask states) ---- */
export function EquationRow({ a, op, b, entry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '6px 0 2px',
      fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ fontSize: 46, fontWeight: 700, color: T.ink }}>{a}</span>
      <span style={{ fontSize: 40, fontWeight: 600, color: T.ink3 }}>{OPSYM[op]}</span>
      <span style={{ fontSize: 46, fontWeight: 700, color: T.ink }}>{b}</span>
      <span style={{ fontSize: 40, fontWeight: 600, color: T.ink3 }}>=</span>
      <span style={{ minWidth: 96, height: 66, borderRadius: 14, border: `2.5px solid ${entry ? T.blue : T.blueSubtle}`,
        background: entry ? T.blueTint : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, fontWeight: 700, color: T.blue, transition: 'all .15s' }}>{entry || ''}</span>
    </div>
  )
}

/* ---- column-math grid (rows model — partial-product rows fit) ---- */
export function ColumnMath({ snap, big = false }) {
  const cell = big ? 54 : 44, fs = big ? 30 : 26
  const cellStyle = (key, val, isRes) => {
    const hot = snap.hi.includes(key)
    return { width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      color: isRes ? T.blue : T.ink,
      background: hot ? T.blueTint : 'transparent', borderRadius: 12,
      boxShadow: hot ? `inset 0 0 0 2px ${T.blue}` : 'none',
      animation: hot && val !== '' ? 'cellPop .32s ease-out both' : 'none',
      transition: 'background .2s, box-shadow .2s' }
  }
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch',
      background: '#fff', border: `1.5px solid ${T.line}`, borderRadius: 18, padding: '12px 16px 14px' }}>
      {snap.rows.map((r, ri) => {
        if (r.rule) return <div key={ri} style={{ height: 0, borderTop: `3px solid ${T.ink}`, margin: '6px 0' }} />
        if (r.style === 'carry')
          return (
            <div key={ri} style={{ display: 'flex', alignItems: 'center', height: big ? 26 : 22 }}>
              <div style={{ width: cell * 0.7 }}></div>
              {r.cells.map((c, i) => (
                <div key={i} style={{ width: cell, textAlign: 'center', fontSize: big ? 18 : 15, fontWeight: 700,
                  color: T.amber, animation: c ? 'cellPop .3s ease-out both' : 'none' }}>{c}</div>
              ))}
            </div>
          )
        return (
          <div key={ri} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: cell * 0.7, textAlign: 'center', fontSize: fs, fontWeight: 700, color: T.ink3 }}>{r.lead || ''}</div>
            {r.cells.map((c, i) => (
              <div key={i} style={cellStyle(`${r.id}-${i}`, c, r.id === 'res')}>{c}</div>
            ))}
            {r.note && <div style={{ marginLeft: 10, fontSize: 13, fontWeight: 600, color: T.ink3, whiteSpace: 'nowrap' }}>{r.note}</div>}
          </div>
        )
      })}
    </div>
  )
}

/* ---- v2 multi-pass grid: WHOLE-anchor capsule + dashed active-digit
   spotlight + written zero placeholder + school yellow carry. The operand-
   tracking visual Finn's diagnosis called for. Renders buildStagesMulti's snap. */
export function MultiColumnMath({ snap }) {
  const cell = 50, fs = 28
  const cols = [0, 1, 2, 3]
  const numCell = (val, { hot, color = T.ink, key }) => (
    <div key={key} style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1, color,
      background: hot ? T.blueTint : 'transparent', borderRadius: 12,
      boxShadow: hot ? `inset 0 0 0 2px ${T.blue}` : 'none',
      animation: hot && val !== '' ? 'cellPop .32s ease-out both' : 'none',
      transition: 'background .2s, box-shadow .2s' }}>{val}</div>
  )
  const lead = (sym) => <div style={{ width: cell * 0.7, textAlign: 'center', fontSize: fs, fontWeight: 700, color: T.ink3 }}>{sym || ''}</div>

  const bDigit = (d, which) => {
    const active = snap.spot === which, dim = snap.spot && !active
    return (
      <div key={which} style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: cell - 8, height: cell - 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          color: active ? T.blueDark : T.ink, opacity: dim ? 0.28 : 1,
          border: active ? `2.5px dashed ${T.blue}` : '2.5px dashed transparent',
          background: active ? T.blueTint : 'transparent',
          animation: active ? 'spotIn .35s ease-out both' : 'none',
          transition: 'opacity .25s' }}>{d}</div>
      </div>
    )
  }

  const rowEl = (arr, hot, anim) => (
    <div style={{ display: 'flex', alignItems: 'center', animation: anim || 'none' }}>
      {lead('')}
      {cols.map((i) => numCell(arr[i], { hot: hot && arr[i] !== '', color: T.blue, key: i }))}
    </div>
  )

  const hasCarry = snap.carry.some((x) => x !== '')
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', background: '#fff',
      border: `1.5px solid ${T.line}`, borderRadius: 18, padding: '14px 18px 16px' }}>
      {hasCarry && (
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 34, marginBottom: 16 }}>
          {lead('')}
          {cols.map((i) => (
            <div key={i} style={{ width: cell, display: 'flex', justifyContent: 'center' }}>
              {snap.carry[i] !== '' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 700, color: '#B45309', background: '#FEF9C3', border: `2px solid ${T.amber}`,
                  animation: snap.carryHot ? 'spotIn .35s ease-out both' : 'none', opacity: snap.carryHot ? 1 : 0.75 }}>{snap.carry[i]}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {lead('')}
        {(() => {
          const firstIdx = snap.top.findIndex((x) => x !== '')
          return (
            <>
              {cols.slice(0, firstIdx).map((i) => numCell('', { hot: false, key: 'pad' + i }))}
              <div style={{ position: 'relative', display: 'flex' }}>
                <div style={{ position: 'absolute', inset: -3, borderRadius: 16, border: `2.5px solid ${T.teal}`,
                  background: 'rgba(0,187,167,.06)', pointerEvents: 'none' }} />
                <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', fontSize: 10.5, fontWeight: 700,
                  letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: T.teal, borderRadius: 8,
                  padding: '2px 8px', whiteSpace: 'nowrap' }}>whole</span>
                {cols.slice(firstIdx).map((i) => numCell(snap.top[i], { hot: false, key: i }))}
              </div>
            </>
          )
        })()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
        {lead('×')}
        {numCell('', { key: 'sp0' })}{numCell('', { key: 'sp1' })}
        {bDigit(snap.bT, 'T')}
        {bDigit(snap.bO, 'O')}
      </div>
      <div style={{ height: 0, borderTop: `3px solid ${T.ink}`, margin: '8px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', minHeight: cell }}>
        {lead('')}
        {cols.map((i) => numCell(snap.row1[i], { hot: snap.hiRow === 'row1' && snap.row1[i] !== '', color: T.blue, key: i }))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: cell, animation: snap.shifted && snap.hiRow === 'row2' ? 'shiftNudge .4s ease-out both' : 'none' }}>
        {lead(snap.sum.some((x) => x !== '') ? '+' : '')}
        {cols.map((i) => {
          const isZero = i === 3 && snap.row2[3] === '0'
          return (
            <div key={i} style={{ position: 'relative' }}>
              {numCell(snap.row2[i], { hot: (snap.hiRow === 'row2' && snap.row2[i] !== '') || (isZero && snap.zeroHot),
                color: isZero ? T.amber : T.blue, key: i })}
              {isZero && snap.zeroHot && (
                <span style={{ position: 'absolute', left: '50%', bottom: -16, transform: 'translateX(-50%)',
                  fontSize: 10.5, fontWeight: 700, color: T.amber, whiteSpace: 'nowrap' }}>write it!</span>
              )}
            </div>
          )
        })}
      </div>
      {snap.sum.some((x) => x !== '') && (
        <>
          <div style={{ height: 0, borderTop: `3px solid ${T.ink}`, margin: '8px 0' }} />
          {rowEl(snap.sum, snap.hiRow === 'sum')}
        </>
      )}
    </div>
  )
}

/* ---- numeric keypad (touch-friendly, no OS keyboard needed) ----
 * `okDisabled` greys out the Check key (division uses it — Check waits until both
 * the quotient AND remainder fields have a value). Additive + defaulted, so the
 * single-answer screens (× / +) that never pass it render byte-identical. */
export function Keypad({ onKey, okDisabled = false }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%', maxWidth: 320, margin: '0 auto' }}>
      {keys.map((k) => (
        <KeypadKey key={k} k={k} isOk={k === 'ok'} isDel={k === 'del'} onKey={onKey} disabled={k === 'ok' && okDisabled} />
      ))}
    </div>
  )
}
function KeypadKey({ k, isOk, isDel, onKey, disabled = false }) {
  const [down, setDown] = useState(false)
  const base = { height: 58, borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 22, cursor: disabled ? 'default' : 'pointer',
    fontVariantNumeric: 'tabular-nums', transition: 'transform .06s, box-shadow .06s' }
  let sty
  if (isOk && disabled) sty = { ...base, background: '#EDEBF2', color: '#b5aec4', boxShadow: '0 4px 0 #dcd8e4', fontSize: 16 } // Oscar's disabled Check
  else if (isOk) sty = { ...base, background: T.blue, color: '#fff', boxShadow: down ? `0 1px 0 ${T.blueDarker}` : `0 4px 0 ${T.blueDarker}`, fontSize: 16 }
  else if (isDel) sty = { ...base, background: '#fff', color: T.ink3, boxShadow: down ? '0 1px 0 #d9d9d9' : '0 4px 0 #d9d9d9' }
  else sty = { ...base, background: '#fff', color: T.ink, boxShadow: down ? '0 1px 0 #d9d9d9' : '0 4px 0 #d9d9d9' }
  return (
    <button onPointerDown={() => !disabled && setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      onClick={() => !disabled && onKey(k)} disabled={disabled}
      style={{ ...sty, transform: down && !disabled ? 'translateY(3px)' : 'none' }}
      aria-label={isDel ? 'delete' : isOk ? 'check' : k}>
      {isDel ? '⌫' : isOk ? 'Check' : k}
    </button>
  )
}

/* ---- the physical-keyboard hook (desktop play; keypad stays primary) ---- */
export function useKeyInput(onKey, active = true) {
  useEffect(() => {
    if (!active) return
    const onDown = (e) => {
      if (/^\d$/.test(e.key)) onKey(e.key)
      else if (e.key === 'Backspace') onKey('del')
      else if (e.key === 'Enter') onKey('ok')
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  })
}

/* ============================ WORKED EXAMPLE =========================
   The make-or-break feature (Ivy quits without it). A multi-digit multiplier
   gets the v2 operand-tracking treatment (whole-anchor + active-digit
   spotlight + written zero); everything else uses the rows model. Routing per
   Oscar's handoff: multiplication with b ≥ 10 → v2. */
export function WorkedExample({ problem, onBack }) {
  const sim = problem.similar
  const useV2 = problem.op === '×' && sim.b >= 10
  const { stages } = useRef(
    useV2 ? buildStagesMulti(sim.a, sim.b) : buildStages({ ...problem, a: sim.a, b: sim.b })
  ).current
  const [i, setI] = useState(0)
  const last = i >= stages.length - 1
  const st = stages[i]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
        color: T.ink3, fontSize: 14, fontWeight: 600 }}>
        <span>Your problem:</span>
        <span style={{ color: T.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {problem.a} {OPSYM[problem.op]} {problem.b}
        </span>
        <span style={{ opacity: 0.6 }}>· here's one just like it</span>
      </div>
      <div key={i} style={{ animation: 'stepIn .3s ease-out both' }}>
        {useV2 ? <MultiColumnMath snap={st.snap} /> : <ColumnMath snap={st.snap} big />}
      </div>
      <div style={{ minHeight: 58, maxWidth: 400, textAlign: 'center', fontSize: 17, fontWeight: 500, color: T.ink,
        lineHeight: 1.5, background: T.blueTint, borderRadius: 14, padding: '12px 18px' }}>{st.caption}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {stages.map((_, k) => (
          <span key={k} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 5,
            background: k === i ? T.blue : k < i ? T.blueSubtle : '#E6E6E6', transition: 'all .2s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {i > 0 && <BigButton tone="ghost" onClick={() => setI(i - 1)}>◂ Back</BigButton>}
        {!last && <BigButton tone="blue" onClick={() => setI(i + 1)}>Show next step ▸</BigButton>}
        {last && <BigButton tone="blue" onClick={onBack}>Now try yours again</BigButton>}
        {!last && <BigButton tone="ghost" onClick={onBack}>I've got it</BigButton>}
      </div>
    </div>
  )
}

/* ---- a gem flying from the card to the HUD counter. `bonus` = the amber,
   bigger completion gem (visibly not an ordinary payout). ---- */
export function FlyGem({ from, to, delay, bonus }) {
  const [pos, setPos] = useState(from)
  useEffect(() => {
    const t = setTimeout(() => setPos(to), 30 + delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const size = bonus ? 46 : 34
  return (
    <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 60, transform: 'translate(-50%,-50%)',
      transition: `left .6s cubic-bezier(.5,0,.4,1) ${delay}ms, top .6s cubic-bezier(.5,0,.4,1) ${delay}ms, opacity .6s ${delay + 200}ms`,
      opacity: pos === to ? 0.2 : 1, pointerEvents: 'none',
      filter: bonus ? `drop-shadow(0 0 12px ${T.amber}) drop-shadow(0 4px 10px rgba(217,119,6,.55))` : 'drop-shadow(0 4px 8px rgba(46,197,197,.5))' }}>
      <Gem size={size} />
    </div>
  )
}
