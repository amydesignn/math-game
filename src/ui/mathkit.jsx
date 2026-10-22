import { useEffect, useRef, useState } from 'react'
import Gem from './Gem'
import { OPSYM, buildStages, buildStagesMulti } from '../math'
import { playSfx } from '../audio'

/*
 * mathkit — the shared visual atoms of the math surface. Oscar's handoff is
 * explicit that these are "shared modules, not copies": the sparkle popup
 * (MathPopup) and the station quest (StationPopup) both compose them, so the
 * keypad, the column-math grid, the worked example, and the gem flight look and
 * behave identically in either encounter. Everything here is Oscar's visual
 * language, generalized only where C1 needed it (the rows model + the v2
 * operand-tracking grid).
 */

/* ---- house tokens (Oscar styling reference · Iris controls per Amy) ---- */
export const T = {
  // Brand Iris — actions + focus: 600 face · 700 deep (shadow + text) · 100 soft · 50 tint.
  // Replaced the off-brand blue #2D6DF6 (Amy 2026-10-04). Luxi tokens since 10-21 (index.css, same values).
  irisFace: 'var(--luxi-color-component-button3d-primary-background)', // Iris 500 — 3D primary button face only (softer; 700 shadow = 2-step edge). Amy 2026-10-04
  iris: 'var(--luxi-color-component-math-accent)', irisDeep: 'var(--color-text-brand)', irisSoft: 'var(--luxi-color-component-math-accent-soft)', irisTint: 'var(--luxi-color-component-math-accent-tint)', // Iris 600 · 700 · 100 · 50
  teal: 'var(--luxi-color-component-column-math-row-ring)', tealLt: 'var(--luxi-color-component-sparkle-teal)', tealInk: 'var(--luxi-color-component-column-math-row-tag-background)', // teal 500 · 300 · 700 (tealInk = AA under white text)
  textPrimary: 'var(--color-text-primary)', textSecondary: 'var(--color-text-secondary)', textTertiary: 'var(--color-text-tertiary)', // Datum text tiers by name
  line: 'var(--color-border-default)', surface: 'var(--color-background-base)', // was #E6E6E6 (one off neutral-200) / #FFFFFF
  lilac: 'var(--luxi-color-component-math-lilac)', lilacDeep: 'var(--luxi-color-component-math-lilac-deep)', // Lilac 600 / 900
  violet: 'var(--luxi-color-component-math-violet)', amber: 'var(--luxi-color-component-math-amber)', amberDeep: 'var(--luxi-color-component-button3d-amber-shadow)',
  amberInk: 'var(--luxi-color-component-column-math-carry-text)', // amber as TEXT (carries, the written zero): amber-500 is 2.1 on white → Datum amber-700, 5.0
  radius: 24, radiusSm: 16, // 26 → 24, the top of Datum's radius ladder (S2 10-21)
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
  // 24 = the top of Datum's radius ladder (0·4·6·8·10·12·16·20·24). Was 28 (26 before the
  // 4px sync) — 28 is on the grid but not a ladder step; S1 2026-10-21. Same as the onboarding card.
  radius: 24,
  scrim: 'var(--luxi-color-component-popup-scrim)', scrimBlur: 'blur(6px)',
  // 1.6 = --border-stroke-1_6, the lighter stroke on Datum's ladder (was 1.5px — a 2× screen draws both as 1.5)
  border: 'var(--border-stroke-1_6) solid var(--luxi-color-component-popup-border)',
  shadow: 'var(--luxi-shadow-popup)',
  width: 'min(520px, calc(100vw - 40px))',
  // 40, not Oscar's token 36: Amy's call — a friendlier tap target on Ivy's iPad
  // (his comp rendered 40 while MODAL said 36; 40 is what the screenshots show).
  close: 40, closeBg: 'var(--color-background-brand-subtle)', closeFg: 'var(--color-icon-secondary)', // was #ECEAF1 / #6E6685 (off-palette) → lilac-100 + neutral-600, like the Door gear
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
/* Brand Lilac steps since 2026-10-04 (Amy: Iris = actions, Lilac = highlight +
 * supporting). main 400 · soft 100 · softLine 200 · deep 800 · ink 700 ·
 * grad 300→400→500 · onFill = Iris 950 (every value on a brand ramp). */
export const LVL = {
  /* Level identity = IRIS since 2026-10-06 (Amy: the record book read off-brand
   * in Lilac while the game leans Iris). It now wears the Luxi primary button:
   * Iris 500 face + white numeral (4.56) — the same pair every Luxi primary
   * button uses — and Iris 700 (Datum text-brand) for level text. Lilac stays
   * where it belongs: decoration (the header wash, confetti, stage pips).
   * One declaration, read by the HUD bar, the congratulations card AND the
   * record book — never copy it per file (that's how they drifted before). */
  main: 'var(--luxi-color-component-level-fill)', // the fill identity (Iris 500)
  ink: 'var(--color-text-brand)', // Iris 700 — coloured accent TEXT (7.7 on white)
  soft: 'var(--luxi-color-component-level-track)', // light Iris surface (Iris 100) (topic icons, the bar's track)
  deep: 'var(--color-text-brand)', // Iris 700 — counts, labels, the total
  softLine: 'var(--luxi-color-component-level-track)',
  grad: 'var(--luxi-color-component-level-fill)', // flat, like the button face (was a Lilac gradient)
  glow: '97,105,224', // Iris 500 as an rgb triplet for the soft shadows/halos

  /* The level NUMERAL on `grad` — medallion, reached ladder nodes, the
   * congratulations badge. WHITE on Iris 500 = 4.56, so even the 16px ladder
   * nodes (normal text, 4.5 bar) pass. (On the old pastel Lilac white could
   * never pass, which is why this used to be Iris 950.) */
  onFill: 'var(--color-text-on-brand)',
}

/** The close ✕. One implementation so the tap target can never drift again. */
export function ModalClose({ onClick, style }) {
  return (
    <button onClick={onClick} aria-label="Close"
      style={{ border: 'none', background: MODAL.closeBg, color: MODAL.closeFg,
        width: MODAL.close, height: MODAL.close, borderRadius: '50%', cursor: 'pointer',
        fontSize: 'var(--text-base)', fontWeight: 500, lineHeight: 1, flex: 'none', /* 15/600 → 16/500 */
        display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>✕</button>
  )
}

/* The popup open: 300ms (Datum's modal ceiling) on --ease-out. Was .34s on an overshoot
   curve — no raw cubic-bezier on the governance layer, so the card settles instead of bouncing (S2 10-21). */
export const POP_IN = `popIn 300ms var(--ease-out) both`

/**
 * The shell: fixed wrapper + scrim + card.
 *   onScrim  — omit to make the popup undismissable by tapping outside
 *   overlay  — rendered ABOVE the scrim but OUTSIDE the card, because the gem
 *              flights have to cross the whole screen, not the card
 *   cardStyle — per-popup layout only (padding, scroll model). Never colour,
 *              radius, border or shadow: those belong to every popup equally.
 */
export function Modal({ children, onScrim, cardRef, cardClass, cardStyle, overlay, label,
  animation = POP_IN, zIndex = 40 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: MODAL.gutter }}>
      <div onClick={onScrim}
        style={{ position: 'absolute', inset: 0, background: MODAL.scrim, backdropFilter: MODAL.scrimBlur,
          WebkitBackdropFilter: MODAL.scrimBlur, animation: 'scrimIn 200ms var(--ease-out) both' }} />
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
export function Sparkles({ colors = ['var(--luxi-color-component-reward-sparkle-1)', T.tealLt, T.irisSoft], n = 14 }) {
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
    // decorative only — hidden from screen readers (and from the contrast audit)
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((s, i) => (
        <svg key={i} viewBox="0 0 24 24" width={s.sz} height={s.sz}
          style={{ position: 'absolute', left: s.left, top: s.top, transform: 'translate(-50%,-50%)',
            animation: `sparkTwinkle 500ms ${s.delay}ms var(--ease-out) both`, filter: 'var(--luxi-shadow-sparkle)' }}>
          <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" style={{ fill: s.c }} /* style, not the attribute: var() only resolves in CSS */ />
        </svg>
      ))}
    </div>
  )
}

/* ---- chunky house button (3D bottom shadow, presses down on tap) ---- */
export function BigButton({ children, onClick, tone = 'primary', style }) {
  const [down, setDown] = useState(false)
  const tones = {
    // one button3d family (index.css) drives this AND the onboarding/promo CTA
    primary: { bg: 'var(--luxi-color-component-button3d-primary-background)', fg: 'var(--luxi-color-component-button3d-primary-text)', sh: 'var(--luxi-color-component-button3d-primary-shadow)' },
    ghost: { bg: 'var(--luxi-color-component-button3d-ghost-background)', fg: 'var(--luxi-color-component-button3d-ghost-text)', sh: 'var(--luxi-color-component-button3d-ghost-shadow)', line: 'var(--luxi-color-component-button3d-ghost-border)' },
    amber: { bg: 'var(--luxi-color-component-button3d-amber-background)', fg: 'var(--luxi-color-component-button3d-amber-text)', sh: 'var(--luxi-color-component-button3d-amber-shadow)' },
  }
  const c = tones[tone]
  return (
    <button onClick={onClick}
      onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      style={{ border: c.line ? `2px solid ${c.line}` : 'none', background: c.bg, color: c.fg,
        fontWeight: 500, fontSize: 'var(--text-base)', /* Datum button 16/500 (was 17/700) */ borderRadius: 16, padding: '16px 24px', cursor: 'pointer', minHeight: 56, /* was 15/26 · 54 */
        boxShadow: down ? `0 0 0 ${c.sh}` : `0 4px 0 ${c.sh}`, transform: down ? 'translateY(4px)' : 'none', /* the house press: 4px down onto its edge */
        transition: `transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out)`, ...style }}>
      {children}
    </button>
  )
}

/* ---- the equation row: A op B = [entry] (shared by both ask states) ---- */
export function EquationRow({ a, op, b, entry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 0 0',
      fontVariantNumeric: 'tabular-nums' }}>
      {/* game display sizes on Datum's full scale: numbers 46→48 (5xl), operators 40 (--text-40) */}
      <span style={{ fontSize: 'var(--text-5xl)', fontWeight: 700, color: T.textPrimary }}>{a}</span>
      <span style={{ fontSize: 'var(--text-40)', fontWeight: 500, color: T.textTertiary }}>{OPSYM[op]}</span>
      <span style={{ fontSize: 'var(--text-5xl)', fontWeight: 700, color: T.textPrimary }}>{b}</span>
      <span style={{ fontSize: 'var(--text-40)', fontWeight: 500, color: T.textTertiary }}>=</span>
      {/* the answer box = DivisionAsk's box: 64 tall, radius 16, stroke-2 (was 66 / 14 / 2.5px) */}
      <span style={{ minWidth: 96, height: 64, borderRadius: 16, border: `var(--border-stroke-2) solid ${entry ? T.iris : T.irisSoft}`,
        background: entry ? T.irisTint : 'var(--color-background-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'var(--text-40)', fontWeight: 700, color: 'var(--color-text-brand)', transition: `border-color 150ms var(--ease-out), background 150ms var(--ease-out)` }}>{entry || ''}</span>
    </div>
  )
}

/* ---- column-math grid (rows model — partial-product rows fit) ---- */
export function ColumnMath({ snap, big = false }) {
  // on the grid + the type scale: cells 52/44 (was 54/44), digits 30/24 (was 30/26), lead 36/32 (was cell × 0.7)
  const cell = big ? 52 : 44, fs = big ? 'var(--text-3xl)' : 'var(--text-2xl)', leadW = big ? 36 : 32
  const cellStyle = (key, val, isRes) => {
    const hot = snap.hi.includes(key)
    return { width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      color: isRes ? T.iris : T.textPrimary,
      background: hot ? T.irisTint : 'transparent', borderRadius: 12,
      boxShadow: hot ? `inset 0 0 0 2px ${T.iris}` : 'none',
      animation: hot && val !== '' ? 'cellPop 300ms var(--ease-out) both' : 'none',
      transition: 'background 200ms var(--ease-out), box-shadow 200ms var(--ease-out)' }
  }
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch',
      background: 'var(--color-background-base)', border: `var(--border-stroke-1_6) solid ${T.line}`, borderRadius: 16, padding: '12px 16px 16px' }}>
      {snap.rows.map((r, ri) => {
        if (r.rule) return <div key={ri} style={{ height: 0, borderTop: `var(--border-stroke-2) solid ${T.textPrimary}`, margin: '8px 0' }} /> /* was 3px · 6px */
        if (r.style === 'carry')
          return (
            <div key={ri} style={{ display: 'flex', alignItems: 'center', height: big ? 28 : 24 }}>
              <div style={{ width: leadW }}></div>
              {r.cells.map((c, i) => (
                <div key={i} style={{ width: cell, textAlign: 'center', fontSize: big ? 'var(--text-lg)' : 'var(--text-sm)', fontWeight: 700,
                  color: T.amberInk, animation: c ? 'cellPop 300ms var(--ease-out) both' : 'none' }}>{c}</div>
              ))}
            </div>
          )
        return (
          <div key={ri} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: leadW, textAlign: 'center', fontSize: fs, fontWeight: 700, color: T.textTertiary }}>{r.lead || ''}</div>
            {r.cells.map((c, i) => (
              <div key={i} style={cellStyle(`${r.id}-${i}`, c, r.id === 'res')}>{c}</div>
            ))}
            {r.note && <div style={{ marginLeft: 8, fontSize: 'var(--text-sm)', fontWeight: 500, color: T.textTertiary, whiteSpace: 'nowrap' }}>{r.note}</div>}
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
  const cell = 48, fs = 'var(--text-3xl)', leadW = 36 // was 50 · 28 · cell × 0.7 — on the grid + the type scale
  const cols = [0, 1, 2, 3]
  const numCell = (val, { hot, color = T.textPrimary, key }) => (
    <div key={key} style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1, color,
      background: hot ? T.irisTint : 'transparent', borderRadius: 12,
      boxShadow: hot ? `inset 0 0 0 2px ${T.iris}` : 'none',
      animation: hot && val !== '' ? 'cellPop 300ms var(--ease-out) both' : 'none',
      transition: 'background 200ms var(--ease-out), box-shadow 200ms var(--ease-out)' }}>{val}</div>
  )
  const lead = (sym) => <div style={{ width: leadW, textAlign: 'center', fontSize: fs, fontWeight: 700, color: T.textTertiary }}>{sym || ''}</div>

  const bDigit = (d, which) => {
    const active = snap.spot === which, dim = snap.spot && !active
    return (
      <div key={which} style={{ width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: cell - 8, height: cell - 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          color: active ? T.irisDeep : dim ? T.textTertiary : T.textPrimary, /* dim = Datum tertiary (4.7), not opacity .28 (1.7) */
          border: active ? `var(--border-stroke-2) dashed ${T.iris}` : 'var(--border-stroke-2) dashed transparent',
          background: active ? T.irisTint : 'transparent',
          animation: active ? 'spotIn 300ms var(--ease-out) both' : 'none',
          transition: 'color 200ms var(--ease-out)' }}>{d}</div>
      </div>
    )
  }

  const rowEl = (arr, hot, anim) => (
    <div style={{ display: 'flex', alignItems: 'center', animation: anim || 'none' }}>
      {lead('')}
      {cols.map((i) => numCell(arr[i], { hot: hot && arr[i] !== '', color: T.iris, key: i }))}
    </div>
  )

  const hasCarry = snap.carry.some((x) => x !== '')
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', background: 'var(--color-background-base)',
      border: `var(--border-stroke-1_6) solid ${T.line}`, borderRadius: 16, padding: 16 /* was 1.5px · 18 · 14/18/16 */ }}>
      {hasCarry && (
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 32, marginBottom: 16 }}>
          {lead('')}
          {cols.map((i) => (
            <div key={i} style={{ width: cell, display: 'flex', justifyContent: 'center' }}>
              {snap.carry[i] !== '' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-lg)', fontWeight: 700, color: T.amberInk, background: 'var(--luxi-color-component-column-math-carry-background)', border: `2px solid ${T.amber}`,
                  animation: snap.carryHot ? 'spotIn 300ms var(--ease-out) both' : 'none' /* no .75 fade on a used carry — it took the digit under AA */ }}>{snap.carry[i]}</div>
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
                <div style={{ position: 'absolute', inset: -4, borderRadius: 16, border: `var(--border-stroke-2) solid ${T.teal}`,
                  background: 'var(--luxi-color-component-column-math-whole-background)', pointerEvents: 'none' }} />
                {/* caps eyebrow = 12 (was 10.5). padding 2px = the exception: the tag straddles the capsule's border */}
                <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: 'var(--text-xs)', lineHeight: 1 /* 16 tall, centred on the border at -4 — clear of the digits */, fontWeight: 700,
                  letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-inverse)', background: T.tealInk, borderRadius: 8,
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
      <div style={{ height: 0, borderTop: `var(--border-stroke-2) solid ${T.textPrimary}`, margin: '8px 0' }} />
      {/* the final addition's carries — their own small row right above the rows
          being added, so they never mix with the multiplication carries up top */}
      {snap.addCarry?.some((x) => x !== '') && (
        <div style={{ display: 'flex', alignItems: 'center', height: 24, marginBottom: 4 }}>
          {lead('')}
          {cols.map((i) => (
            <div key={i} style={{ width: cell, display: 'flex', justifyContent: 'center' }}>
              {snap.addCarry[i] !== '' && (
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: T.amberInk, background: 'var(--luxi-color-component-column-math-carry-background)', border: `2px solid ${T.amber}`,
                  animation: snap.hiRow === 'sum' ? 'spotIn 300ms var(--ease-out) both' : 'none' }}>{snap.addCarry[i]}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', minHeight: cell }}>
        {lead('')}
        {cols.map((i) => numCell(snap.row1[i], { hot: snap.hiRow === 'row1' && snap.row1[i] !== '', color: T.iris, key: i }))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: cell, animation: snap.shifted && snap.hiRow === 'row2' ? 'shiftNudge 300ms var(--ease-out) both' : 'none' }}>
        {lead(snap.sum.some((x) => x !== '') ? '+' : '')}
        {cols.map((i) => {
          const isZero = i === 3 && snap.row2[3] === '0'
          return (
            <div key={i} style={{ position: 'relative' }}>
              {numCell(snap.row2[i], { hot: (snap.hiRow === 'row2' && snap.row2[i] !== '') || (isZero && snap.zeroHot),
                color: isZero ? T.amberInk : T.iris, key: i })}
              {isZero && snap.zeroHot && (
                <span style={{ position: 'absolute', left: '50%', bottom: -16, transform: 'translateX(-50%)',
                  fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', /* 12 = caps eyebrow only */
                  color: T.amberInk, whiteSpace: 'nowrap' }}>write it!</span>
              )}
            </div>
          )
        })}
      </div>
      {snap.sum.some((x) => x !== '') && (
        <>
          <div style={{ height: 0, borderTop: `var(--border-stroke-2) solid ${T.textPrimary}`, margin: '8px 0' }} />
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%', maxWidth: 320, margin: '0 auto' }}>
      {keys.map((k) => (
        <KeypadKey key={k} k={k} isOk={k === 'ok'} isDel={k === 'del'} onKey={onKey} disabled={k === 'ok' && okDisabled} />
      ))}
    </div>
  )
}
const KEY_BG = 'var(--color-background-interactive-default)', KEY_EDGE = 'var(--luxi-color-component-keypad-key-shadow)' // neutral-300 (was #d9d9d9, off-palette)
function KeypadKey({ k, isOk, isDel, onKey, disabled = false }) {
  const [down, setDown] = useState(false)
  const base = { height: 56, borderRadius: 12, border: 'none', /* was 58 · 14 */ fontWeight: 700, fontSize: 'var(--text-2xl)', /* 22→24 (Datum 2xl) */ cursor: disabled ? 'default' : 'pointer',
    fontVariantNumeric: 'tabular-nums', transition: `transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out)` }
  let sty
  if (isOk && disabled) sty = { ...base, background: 'var(--color-background-interactive-disabled)', color: 'var(--color-text-disabled)', boxShadow: '0 4px 0 var(--color-border-disabled)', fontSize: 'var(--text-base)', fontWeight: 500 } // Datum disabled (was Oscar's #EDEBF2/#b5aec4/#dcd8e4)
  else if (isOk) sty = { ...base, background: 'var(--luxi-color-component-button3d-primary-background)', color: 'var(--luxi-color-component-button3d-primary-text)', boxShadow: down ? '0 0 0 var(--luxi-color-component-button3d-primary-shadow)' : '0 4px 0 var(--luxi-color-component-button3d-primary-shadow)', fontSize: 'var(--text-base)', fontWeight: 500 } // Datum button: 16 / 500
  else if (isDel) sty = { ...base, background: KEY_BG, color: 'var(--color-icon-tertiary)', boxShadow: down ? `0 0 0 ${KEY_EDGE}` : `0 4px 0 ${KEY_EDGE}` }
  else sty = { ...base, background: KEY_BG, color: T.textPrimary, boxShadow: down ? `0 0 0 ${KEY_EDGE}` : `0 4px 0 ${KEY_EDGE}` }
  return (
    <button onPointerDown={() => !disabled && setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      onClick={() => !disabled && onKey(k)} disabled={disabled}
      style={{ ...sty, transform: down && !disabled ? 'translateY(4px)' : 'none' }} /* the house press: 4px onto its edge */
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

/* ---- C2 division ask: two-part entry (quotient + remainder) ----
 * Oscar's comp (design_handoff_division_ask_screen), rebuilt on the real shared
 * atoms. A division answer is TWO numbers, so this replaces the single-entry
 * AskState for op === '÷'. Correctness = Number(q)===quotient && Number(r)===
 * remainder — solve() is never used. Decisions (Finn/Oscar/Amy): R is always
 * present (type R 0 on a clean share); Check lives in the keypad, disabled until
 * BOTH fields have a value; NO digit-count auto-advance (it would leak the
 * quotient's length) — the R label lights once the quotient has a digit, focus
 * jumps only at the 3-digit cap; a remainder-only FIRST miss gets one gentle
 * nudge, not the whole walkthrough; "Show me how" opens the walkthrough with no
 * wrong answer recorded. Scenario copy = the existing skin (Amy: don't change the
 * station copy). No berry accent — the banner keeps the skin's accent (Amy).
 *
 * SHARED (2026-09-25): lifted here from MathPopup so the STATION quest renders
 * division identically to a sparkle. Before this, StationPopup used the single-
 * answer field + solve() (which returns a−b for ÷) and wrong-marked the real
 * quotient, then recovered into buildMult2x1 (a multiplication lesson). Both
 * encounters now compose this one atom — Oscar's "shared modules, not copies". */
const Q_CAP = 3
const R_CAP = 2

export function DivisionAsk({ problem, skin, onSolved, onResult, onWalkthrough }) {
  const [q, setQ] = useState('')
  const [r, setR] = useState('')
  const [active, setActive] = useState('q')
  const [nudge, setNudge] = useState(false)
  const [misses, setMisses] = useState(0)
  const [shakeR, setShakeR] = useState(false)

  const check = () => {
    if (q === '' || r === '') return
    const qOk = Number(q) === problem.quotient
    const rOk = Number(r) === problem.remainder
    onResult?.(qOk && rOk) // record every submit, same as multiplication (Amy)
    if (qOk && rOk) return onSolved()
    if (qOk && misses === 0) {
      // remainder-only first miss → keep her share, one warm nudge, refocus R
      setNudge(true); setMisses(1); setR(''); setActive('r')
      setShakeR(true); setTimeout(() => setShakeR(false), 300)
      return
    }
    onWalkthrough() // wrong quotient, or a second miss → the full walkthrough
  }

  const onKey = (k) => {
    if (k === 'del') {
      if (active === 'r') {
        if (r === '') return setActive('q') // empty R → step focus back to the share
        return setR((v) => v.slice(0, -1))
      }
      return setQ((v) => v.slice(0, -1))
    }
    if (k === 'ok') return check()
    if (active === 'q') {
      if (q.length >= Q_CAP) return
      const nq = (q + k).replace(/^0+(?=\d)/, '')
      setQ(nq)
      if (nq.length >= Q_CAP) setActive('r') // jump only AT the cap, never at the answer's length
    } else {
      if (r.length >= R_CAP) return
      setR((v) => (v + k).replace(/^0+(?=\d)/, '')) // a lone 0 survives → "R 0" is typable
    }
  }
  useKeyInput(onKey)

  const ready = q !== '' && r !== ''
  const hint = q === ''
    ? 'Tap each share first — then the leftover.' // was "her share" — public copy stays ungendered (2026-08-29 rule)
    : r === ''
      ? 'Now the leftover. Tap R, then type it — R 0 if none is left.'
      : 'Tap Check when you’re ready.'
  const caretStyle = { display: 'inline-block', width: 2, height: 36, background: T.iris, /* 2px = stroke-2 (was 3, radius 2) */ animation: 'dvCaret 1.1s steps(1) infinite' }
  const box = (f, val) => ({
    height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer',
    fontSize: 'var(--text-40)', fontWeight: 700, color: T.iris, fontVariantNumeric: 'tabular-nums', borderStyle: 'solid', borderWidth: 'var(--border-stroke-2)',
    borderColor: val !== '' || active === f ? T.iris : T.irisSoft,
    background: val !== '' ? T.irisTint : active === f ? 'var(--color-background-base)' : 'var(--color-background-subtle)',
    boxShadow: active === f ? `0 0 0 4px ${T.irisSoft}` : 'none', // was rgba of the retired blue #2D6DF6
    transition: `border-color 150ms var(--ease-out), background 150ms var(--ease-out), box-shadow 150ms var(--ease-out)`,
  })
  const cap = (on) => ({ lineHeight: 'var(--text-xs--line-height)', fontSize: 'var(--text-xs)', /* unitless (was 16px) */ fontWeight: 700, letterSpacing: '.05em', color: on ? T.iris : T.textTertiary }) // 10/800 -> 12/700 (Datum floor is 11)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 400, color: T.textPrimary }}>{skin.ask}</div>

      {/* a ÷ b = [q] R [r] — two nowrap groups, so a narrow modal drops the answer to its own line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}> {/* = EquationRow's gap */}
          {/* 42 -> 40 (--text-40), operators 32 (--text-32) */}
          <span style={{ fontSize: 'var(--text-40)', fontWeight: 700, color: T.textPrimary }}>{problem.a}</span>
          <span style={{ fontSize: 'var(--text-32)', fontWeight: 500, color: T.textTertiary }}>÷</span>
          <span style={{ fontSize: 'var(--text-40)', fontWeight: 700, color: T.textPrimary }}>{problem.b}</span>
          <span style={{ fontSize: 'var(--text-32)', fontWeight: 500, color: T.textTertiary }}>=</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setActive('q')} aria-label="quotient" style={{ ...box('q', q), minWidth: 112, padding: '0 12px' }}>
              {q}{active === 'q' && <span style={caretStyle} />}
            </button>
            <span style={cap(active === 'q')}>EACH SHARE</span>
          </div>
          {/* R label — a real tap target that lights + pulses once the quotient has a digit */}
          {/* a duplicate pointer target for the remainder box — skipped by keyboard + screen readers */}
          <button onClick={() => setActive('r')} tabIndex={-1} aria-hidden="true"
            style={{ height: 64, padding: '0 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-32)', fontWeight: 700, lineHeight: 1, borderRadius: 12, // 28/800 -> 32/700
              color: active === 'r' || r !== '' ? T.iris : T.textTertiary, animation: q !== '' && r === '' && active === 'q' ? 'dvTapMe 1.6s ease-in-out infinite' : 'none' }}>R</button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setActive('r')} aria-label="remainder" style={{ ...box('r', r), width: 72, animation: shakeR ? 'dvShakeCell 300ms var(--ease-in-out) both' : 'none' }}>
              {r}{active === 'r' && <span style={caretStyle} />}
            </button>
            <span style={cap(active === 'r')}>LEFT OVER</span>
          </div>
        </div>
      </div>

      {nudge && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--luxi-color-component-division-ask-nudge-background)', border: '1px solid var(--luxi-color-component-division-ask-nudge-border)', borderRadius: 12, padding: '12px 16px', animation: 'dvFadeSlide 300ms var(--ease-out) both' }}>
          <span style={{ fontSize: 'var(--text-base)', lineHeight: 1.5 }}>🍬</span>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--luxi-color-component-division-ask-nudge-text)', lineHeight: 1.5 }}>The share is right! Now look again at what&apos;s <strong style={{ fontWeight: 700 }}>left over</strong>.</span>
        </div>
      )}

      <Keypad onKey={onKey} okDisabled={!ready} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8 }}>
        {/* same hint role as the ask screen: 14/400 secondary, 24 above */}
        <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: T.textSecondary, fontWeight: 400 }}>{hint}</div>
        <button onClick={onWalkthrough}
          style={{ border: 'none', background: 'transparent', color: 'var(--luxi-color-component-division-ask-link-text)', fontWeight: 500, fontSize: 'var(--text-sm)', cursor: 'pointer', /* was Lilac 700 text — Lilac is decoration only; text = Iris (Datum link) */ padding: '4px 12px', borderRadius: 10, textDecoration: 'underline', textUnderlineOffset: 4 }}>Show me how 🔎</button>
      </div>
    </div>
  )
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
    useV2 ? buildStagesMulti(sim.a, sim.b, problem) : buildStages({ ...problem, a: sim.a, b: sim.b })
  ).current
  const [i, setI] = useState(0)
  const last = i >= stages.length - 1
  const st = stages[i]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
        color: T.textPrimary, fontSize: 'var(--text-base)', fontWeight: 400 }}> {/* main content: 16 primary (Amy 2026-10-05) */}
        <span>Your problem:</span>
        <span style={{ color: T.textPrimary, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {problem.a} {OPSYM[problem.op]} {problem.b}
        </span>
        <span>· here's one just like it</span>
      </div>
      <div key={i} style={{ animation: 'stepIn 300ms var(--ease-out) both' }}>
        {useV2 ? <MultiColumnMath snap={st.snap} /> : <ColumnMath snap={st.snap} big />}
      </div>
      <div style={{ minHeight: 56, maxWidth: 400, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 400, color: T.textPrimary, // content 16/400 (was 17/500)
        lineHeight: 1.5, background: T.irisTint, borderRadius: 12, padding: '12px 16px' /* was 58 · 14 · 18 */ }}>{st.caption}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {stages.map((_, k) => (
          <span key={k} style={{ width: k === i ? 24 : 8, height: 8, borderRadius: 4,
            background: k === i ? T.iris : k < i ? T.irisSoft : 'var(--color-border-default)', transition: 'width 200ms var(--ease-out), background 200ms var(--ease-out)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {i > 0 && <BigButton tone="ghost" onClick={() => setI(i - 1)}>◂ Back</BigButton>}
        {!last && <BigButton tone="primary" onClick={() => setI(i + 1)}>Show next step ▸</BigButton>}
        {last && <BigButton tone="primary" onClick={onBack}>Now try yours again</BigButton>}
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
    const land = setTimeout(() => playSfx('gem'), 30 + delay + 460) // the chime starts as the first gem reaches the wallet
    return () => { clearTimeout(t); clearTimeout(land) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const size = bonus ? 48 : 32 // was 46 / 34
  return (
    <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 60, transform: 'translate(-50%,-50%)',
      // 500ms on --ease-in-out: lift off gently, land gently (was .6s on a raw curve)
      transition: `left 500ms var(--ease-in-out) ${delay}ms, top 500ms var(--ease-in-out) ${delay}ms, opacity 500ms var(--ease-in-out) ${delay + 200}ms`,
      opacity: pos === to ? 0.2 : 1, pointerEvents: 'none',
      filter: bonus ? 'var(--luxi-shadow-fly-gem-bonus)' : 'var(--luxi-shadow-fly-gem)' }}>
      <Gem size={size} />
    </div>
  )
}

/* ---- The lucky station's welcome gift — the win card (2026-10-18). Shared by
   MathPopup (lucky station + sparkles) and App's after-a-quest card, so the gift
   reads the same wherever her first answer lands. Three beats, one idea each
   (Clover): the title, what she got, where the seed goes. A slow pastel rainbow
   turns behind the gem; the seed pops in after the gems (Fern). Motion is CSS
   (`lk*` keyframes in index.css), switched off under reduced motion. ---- */
export function GiftWin({ copy, gems, onNext }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      padding: '8px 0 0', animation: POP_IN }}>
      <Sparkles colors={GIFT_SPARKLES} n={22} />
      <div style={{ position: 'relative', width: 144, height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div aria-hidden className="lkHalo" />
        <Gem size={64} style={{ position: 'relative', animation: 'gemSpin 500ms var(--ease-out) both', filter: 'var(--luxi-shadow-reward-gem)' }} />
        <span aria-hidden className="lkSeed" style={{ position: 'relative', fontSize: 'var(--text-5xl)', lineHeight: 1 /* gem was 68, seed 52 */ }}>🌱</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: T.textPrimary }}>{copy.title}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <span style={giftChip}>+{gems} <Gem size={16} /></span>
          <span className="lkSeedChip" style={giftChip}>+1 🌱</span>
        </div>
        <div style={{ fontSize: 'var(--text-base)', color: T.textPrimary, marginTop: 12 }}>{copy.got}</div>
        <div style={{ fontSize: 'var(--text-base)', color: T.textSecondary, marginTop: 4 }}>{copy.next}</div>
      </div>
      <BigButton tone="primary" onClick={onNext} style={{ marginTop: 4, minWidth: 180 }}>{copy.ok}</BigButton>
    </div>
  )
}
// white + the pastel rainbow (index.css reward-sparkle-1..6, same values as before)
const GIFT_SPARKLES = [
  'var(--luxi-color-component-reward-sparkle-1)', 'var(--luxi-color-component-reward-sparkle-2)', 'var(--luxi-color-component-reward-sparkle-3)',
  'var(--luxi-color-component-reward-sparkle-4)', 'var(--luxi-color-component-reward-sparkle-5)', 'var(--luxi-color-component-reward-sparkle-6)',
]
const giftChip = {
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20,
  // amber 50/200/800 (the values of Datum's "new" badge) — gold = reward, 7:1 text
  background: 'var(--luxi-color-component-gift-chip-background)', border: 'var(--border-stroke-1_6) solid var(--luxi-color-component-gift-chip-border)',
  fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--luxi-color-component-gift-chip-text)',
}
