import { useEffect, useRef, useState } from 'react'
import Gem from './Gem'
import { OPSYM, solve, buildStages, buildStagesMulti } from '../math'

/*
 * MathPopup — Oscar's Phase 4 handoff, lifted 1:1 (his comp:
 * ~/Downloads/math-popup-flow.html). The React overlay that turns a gem
 * sparkle into a math quest: ask → correct (gems fly to the HUD, pet reacts)
 * or ask → recover (step-by-step worked example on a SIMILAR problem — Ivy's
 * make-or-break feature) → try again.
 *
 * Seams (wired by App):
 *   onAward(n)        -> add gems (store caps at the beta limit)
 *   onPetReact()      -> pet dances + character emote-yes in-world
 *   onClose(solved)   -> dismiss; solved=true collects the sparkle   [adapted]
 *   onResult(correct) -> topicProgress bookkeeping for Phase 6       [adapted]
 *   hudGemRef         -> the HUD counter, target of the gem flight
 *
 * Nathan's adaptations from the comp (noted in the build log): gem PNG → the
 * house SVG gem; onClose carries `solved`; onResult seam added; physical
 * keyboard input for desktop play (Amy's Mac) — the keypad stays the primary
 * interface on iPad.
 *
 * ARCHITECTURE NOTE — task wrappers (Oscar's): a problem ({op,a,b}) is
 * separate from its SKIN. The popup composes skin + problem, so the SAME math
 * renders under any skin. Adding a Phase 5 skin = one entry in SKINS.
 */

/* ---- house tokens (Oscar styling reference · blue controls per Amy) ---- */
const T = {
  blue: '#2D6DF6', blueDark: '#0A52ED', blueDarker: '#0946CA', blueSubtle: '#E0E8F8', blueTint: '#EFF4FF',
  teal: '#00BBA7', tealLt: '#46ECD5',
  ink: '#262626', ink2: '#4d4d4d', ink3: '#6e6e6e',
  line: '#E6E6E6', surface: '#FFFFFF',
  lilac: '#8570D2', lilacDeep: '#4b3f7a',
  violet: '#7F22FE', amber: '#FE9A00',
  radius: 26, radiusSm: 16,
}

// Task-wrapper skins. Each wraps naked math in a nurturing world action
// (positive motivation only — a gift to the world, never a rescue).
export const SKINS = {
  feedPet: {
    id: 'feedPet',
    tag: 'Snack time',
    paw: '🐾',
    ask: 'Your pet wants a snack! Solve it to fill the bowl.',
    win: 'Yum! You fed your pet.',
    accent: T.teal,
  },
  // To add a skin later, drop one entry here — nothing else changes:
  // waterTree:{ id:'waterTree', tag:'Garden', paw:'🌱', ask:'Water the tree to grow an apple.', win:'An apple grew!', accent:'#7CCF00' },
  // buildBridge:{ id:'buildBridge', tag:'Build', paw:'🧱', ask:'Lay the planks to finish the bridge.', win:'The bridge is done!', accent:T.amber },
}

/* ============================ SMALL UI =============================== */

function Sparkles({ colors = ['#fff', T.tealLt, T.blueSubtle], n = 14 }) {
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

// chunky house button (3D bottom shadow, presses down on tap)
function BigButton({ children, onClick, tone = 'blue', style }) {
  const [down, setDown] = useState(false)
  const tones = {
    blue: { bg: T.blue, fg: '#fff', sh: T.blueDarker },
    ghost: { bg: '#fff', fg: T.blue, sh: '#c9d6f5' },
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

/* ---- column-math grid (the concrete visual for the worked example) ----
   Generalized to a rows model for C1: builders emit
   { cols, rows: [{id, cells, lead?, note?, style?} | {rule:true}], hi }
   so partial-product rows (long multiplication) fit. Cell styling, highlight
   ring, and amber carries are Oscar's visual language, untouched. */
function ColumnMath({ snap, big = false }) {
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

/* ---- v2 multi-pass grid (Oscar's comp, lifted): WHOLE-anchor capsule +
   dashed active-digit spotlight + explicit written zero placeholder + school
   yellow carry. Renders buildStagesMulti's snap model. This is the operand-
   tracking visual Finn's diagnosis called for. ---- */
function MultiColumnMath({ snap }) {
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

  // multiplier digits with Amy's dashed spotlight
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
      {/* school carry — the yellow number on top, remembered for the addition */}
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
      {/* top number — WHOLE, anchored in a capsule */}
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
      {/* multiplier row w/ spotlight digits */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
        {lead('×')}
        {numCell('', { key: 'sp0' })}{numCell('', { key: 'sp1' })}
        {bDigit(snap.bT, 'T')}
        {bDigit(snap.bO, 'O')}
      </div>
      <div style={{ height: 0, borderTop: `3px solid ${T.ink}`, margin: '8px 0' }} />
      {/* pass rows */}
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

/* ---- numeric keypad (touch-friendly, no OS keyboard needed) ---- */
function Keypad({ onKey }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%', maxWidth: 320, margin: '0 auto' }}>
      {keys.map((k) => (
        <KeypadKey key={k} k={k} isOk={k === 'ok'} isDel={k === 'del'} onKey={onKey} />
      ))}
    </div>
  )
}
function KeypadKey({ k, isOk, isDel, onKey }) {
  const [down, setDown] = useState(false)
  const base = { height: 58, borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 22, cursor: 'pointer',
    fontVariantNumeric: 'tabular-nums', transition: 'transform .06s, box-shadow .06s' }
  let sty
  if (isOk) sty = { ...base, background: T.blue, color: '#fff', boxShadow: down ? `0 1px 0 ${T.blueDarker}` : `0 4px 0 ${T.blueDarker}`, fontSize: 16 }
  else if (isDel) sty = { ...base, background: '#fff', color: T.ink3, boxShadow: down ? '0 1px 0 #d9d9d9' : '0 4px 0 #d9d9d9' }
  else sty = { ...base, background: '#fff', color: T.ink, boxShadow: down ? '0 1px 0 #d9d9d9' : '0 4px 0 #d9d9d9' }
  return (
    <button onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      onClick={() => onKey(k)} style={{ ...sty, transform: down ? 'translateY(3px)' : 'none' }}
      aria-label={isDel ? 'delete' : isOk ? 'check' : k}>
      {isDel ? '⌫' : isOk ? 'Check' : k}
    </button>
  )
}

/* ============================ WORKED EXAMPLE ========================= */
function WorkedExample({ problem, onBack }) {
  const sim = problem.similar
  // v2 (Oscar): a multi-digit multiplier gets the whole-anchor + active-digit
  // spotlight + written-zero-placeholder treatment — the operand-tracking
  // visual. Routing per Oscar's handoff: multiplication with b ≥ 10.
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

/* ============================ MATH POPUP ============================= */
export default function MathPopup({ problem, skin, onAward, onPetReact, onClose, onResult, hudGemRef }) {
  const [phase, setPhase] = useState('ask') // ask | correct | recover
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const [flyGems, setFlyGems] = useState([])
  const cardRef = useRef(null)
  const answer = solve(problem.op, problem.a, problem.b)

  const onKey = (k) => {
    if (phase !== 'ask') return
    if (k === 'del') { setEntry((e) => e.slice(0, -1)); return }
    if (k === 'ok') { check(); return }
    if (entry.length >= 4) return
    setEntry((e) => (e + k).replace(/^0+(?=\d)/, ''))
  }
  const check = () => {
    if (entry === '') return
    const correct = Number(entry) === answer
    onResult?.(correct)
    if (correct) win()
    else {
      setShake(true)
      setTimeout(() => setShake(false), 420)
      setTimeout(() => setPhase('recover'), 260)
    }
  }
  const win = () => {
    setPhase('correct')
    onPetReact?.()
    // The AWARD rides a plain timer so it can never be lost — rAF starves in
    // hidden/throttled windows (iOS low-power, background tabs), and the gem
    // must land even if the flight animation doesn't get a frame.
    setTimeout(() => onAward?.(1), 620)
    // the visual: fly gems from the card to the HUD counter
    requestAnimationFrame(() => {
      const card = cardRef.current, hud = hudGemRef && hudGemRef.current
      if (!card || !hud) return
      const c = card.getBoundingClientRect(), h = hud.getBoundingClientRect()
      const from = { x: c.left + c.width / 2, y: c.top + c.height * 0.42 }
      const to = { x: h.left + h.width / 2, y: h.top + h.height / 2 }
      setFlyGems([0, 1, 2].map((i) => ({ id: Date.now() + i, from, to, delay: i * 90 })))
      setTimeout(() => setFlyGems([]), 1200)
    })
  }
  const backToAsk = () => { setEntry(''); setPhase('ask') }

  // physical keyboard (desktop play) — the keypad stays primary on iPad
  useEffect(() => {
    const onDown = (e) => {
      if (/^\d$/.test(e.key)) onKey(e.key)
      else if (e.key === 'Backspace') onKey('del')
      else if (e.key === 'Enter') onKey('ok')
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* scrim — the world (and companions) softly recede into focus mode */}
      <div onClick={phase === 'ask' ? () => onClose(false) : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(50,42,80,.44)', backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)', animation: 'scrimIn .25s ease-out both' }} />
      {/* flying gems */}
      {flyGems.map((g) => <FlyGem key={g.id} {...g} />)}

      <div ref={cardRef} className={shake ? 'shakeit' : ''}
        style={{ position: 'relative', width: 'min(520px,100%)', maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto', background: '#fff', borderRadius: T.radius,
          boxShadow: '0 24px 60px rgba(40,30,70,.28)', padding: '0 0 26px',
          animation: phase === 'correct' ? '' : 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>

        {/* skin banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px',
          background: `linear-gradient(180deg,${skin.accent}14,#fff)`, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{skin.paw}</span>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: skin.accent }}>{skin.tag}</span>
          <div style={{ flex: 1 }} />
          {phase === 'ask' && (
            <button onClick={() => onClose(false)} aria-label="close"
              style={{ border: 'none', background: '#f2f2f2', width: 32, height: 32, borderRadius: '50%',
                cursor: 'pointer', color: T.ink3, fontSize: 16, lineHeight: 1 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '22px 26px 4px' }}>
          {phase === 'ask' && <AskState skin={skin} problem={problem} entry={entry} onKey={onKey} />}
          {phase === 'correct' && <CorrectState skin={skin} onNext={() => onClose(true)} />}
          {phase === 'recover' && (
            <div style={{ paddingBottom: 6 }}>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.ink }}>Let's look at one together 💡</div>
                <div style={{ fontSize: 15, color: T.ink3, marginTop: 4 }}>No worries — follow the steps, then give it another go.</div>
              </div>
              <WorkedExample problem={problem} onBack={backToAsk} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AskState({ skin, problem, entry, onKey }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500, color: T.ink3 }}>{skin.ask}</div>
      {/* the equation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '6px 0 2px',
        fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ fontSize: 46, fontWeight: 700, color: T.ink }}>{problem.a}</span>
        <span style={{ fontSize: 40, fontWeight: 600, color: T.ink3 }}>{OPSYM[problem.op]}</span>
        <span style={{ fontSize: 46, fontWeight: 700, color: T.ink }}>{problem.b}</span>
        <span style={{ fontSize: 40, fontWeight: 600, color: T.ink3 }}>=</span>
        <span style={{ minWidth: 96, height: 66, borderRadius: 14, border: `2.5px solid ${entry ? T.blue : T.blueSubtle}`,
          background: entry ? T.blueTint : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, fontWeight: 700, color: T.blue, transition: 'all .15s' }}>{entry || ''}</span>
      </div>
      <Keypad onKey={onKey} />
      <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9a92ac', fontWeight: 500, marginTop: 2 }}>
        Type your answer, then tap Check
      </div>
    </div>
  )
}

function CorrectState({ skin, onNext }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      padding: '8px 0 2px', animation: 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
      <Sparkles colors={['#fff', skin.accent, T.blueSubtle, T.tealLt]} n={16} />
      <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `${skin.accent}22`,
          animation: 'ringpulse 1.4s ease-out infinite' }} />
        <Gem size={72} style={{ animation: 'gemSpin .5s ease-out both', filter: 'drop-shadow(0 6px 14px rgba(46,197,197,.4))' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: T.ink }}>Nice work!</div>
        <div style={{ fontSize: 16, color: T.ink3, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          {skin.win} <span>+1</span> <Gem size={18} />
        </div>
      </div>
      <BigButton tone="blue" onClick={onNext} style={{ marginTop: 6, minWidth: 180 }}>Keep going ✨</BigButton>
    </div>
  )
}

function FlyGem({ from, to, delay }) {
  const [pos, setPos] = useState(from)
  useEffect(() => {
    const t = setTimeout(() => setPos(to), 30 + delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 60, transform: 'translate(-50%,-50%)',
      transition: `left .6s cubic-bezier(.5,0,.4,1) ${delay}ms, top .6s cubic-bezier(.5,0,.4,1) ${delay}ms, opacity .6s ${delay + 200}ms`,
      opacity: pos === to ? 0.2 : 1, pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(46,197,197,.5))' }}>
      <Gem size={34} />
    </div>
  )
}
