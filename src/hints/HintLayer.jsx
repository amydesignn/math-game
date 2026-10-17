/**
 * HintLayer: the contextual "look here" sign (Trail crew, job 1).
 *
 * An arrow on a target (a 3D world point or a DOM element), an edge arrow when
 * the target is off-screen, and one toast line. The same toast works on its own
 * (no target), for later first-time tips and "you got something new!" toasts.
 *
 * App-agnostic: props in, nothing imported from outside src/hints/. It works over
 * a 3D canvas or on a plain page.
 *
 *   <HintLayer
 *     hint={null | { id, text, target }}  // target: { world: key } | { dom: name } | undefined
 *     exitReason={null | 'done' | 'dismissed' | 'left' | 'paused'}
 *     getTargetPos={(target) => ({ x, y } | null)}  // world targets, px in this layer
 *     insets={{ top, right, bottom, left }}         // optional edge-arrow safe rect
 *     dismissLabel="Not now" dismissText="✕" onDismiss={(id) => …}
 *     boldDone={false}  // Amy's taste call: Fern's ground-ripple "you did it"
 *     arrowStyle="green"  // 'green' (default, Amy) | 'pink' (green ground) | 'iris' (the original)
 *   />
 *
 * Mount it ALWAYS (hint may be null). The polite live region has to exist before
 * the text arrives, or screen readers skip it. Motion belongs to Fern
 * (motion.css + motion.js) and edge maths to Rowan (position.js). This file only
 * moves the arrow and steps data-state on plain timers. It never uses
 * animationend, which stalls in hidden or throttled windows.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { placeArrow, domTargetPos, movedEnough, EDGE_HYSTERESIS } from './position.js'
import { HINT_MOTION } from './motion.js'
import './hints.css'
import './motion.css'

const IN_MS = 16 // "in" → "shown" on the next tick, so the arrival transition runs
const OUT_MS = HINT_MOTION?.outMs ?? 200
const DONE_ARROW_MS = HINT_MOTION?.doneArrowMs ?? 700
const EDGE_REST_MS = (HINT_MOTION?.edgeTapDelayMs ?? 300) + (HINT_MOTION?.edgeTaps ?? 5) * (HINT_MOTION?.edgeTapMs ?? 2400) // a tap run, then rest
const POLL_MS = 250 // fallback beside rAF: the arrow never freezes in a throttled pane

/** Screen gutter only: the HUD itself is avoided rect by rect (hudRects). */
const GUTTER = { top: 16, right: 16, bottom: 16, left: 16 }

/** Layer-relative rects of every visible HUD piece marked [data-hint] (the
 *  host's convention), except the hint's own DOM target. Layout rects for the
 *  pill (offset*), so Fern's rise/sink transform never moves the avoid zone. */
function hudRects(layer, target) {
  const lr = layer.getBoundingClientRect()
  const out = []
  for (const el of document.querySelectorAll('[data-hint]')) {
    if (target?.dom != null && el.dataset.hint === String(target.dom)) continue
    if (layer.contains(el)) {
      if (el.offsetHeight > 0) out.push({ left: el.offsetLeft, top: el.offsetTop, right: el.offsetLeft + el.offsetWidth, bottom: el.offsetTop + el.offsetHeight })
      continue
    }
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) out.push({ left: r.left - lr.left, top: r.top - lr.top, right: r.right - lr.left, bottom: r.bottom - lr.top })
  }
  return out
}

const targetKey = (t) => (t ? (t.world != null ? `w:${t.world}` : t.dom != null ? `d:${t.dom}` : '') : '')

export default function HintLayer({
  hint = null,
  exitReason = null,
  getTargetPos,
  insets,
  dismissLabel = 'Not now',
  dismissText = '✕',
  onDismiss,
  boldDone = false,
  arrowStyle = 'green',
}) {
  const variant = ARROW[arrowStyle] ? arrowStyle : 'green'
  const arrowH = ARROW[variant].h
  const arrowHRef = useRef(arrowH)
  arrowHRef.current = arrowH
  const variantRef = useRef(variant)
  variantRef.current = variant
  // What's on screen. It outlives `hint` by the exit duration.
  const [shown, setShown] = useState(null) // { id, text, target, arrow: state, toast: state }
  const timers = useRef([])
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)) }

  const lastExit = useRef(null) // { id, reason }: a 'paused' hint coming back re-enters softly
  const id = hint?.id ?? null
  const text = hint?.text ?? ''
  const tKey = targetKey(hint?.target)

  // State changes are computed from a ref (not inside setState updaters, which
  // StrictMode runs twice) and stepped on plain timers.
  const shownRef = useRef(null)
  const show = (next) => { shownRef.current = next; setShown(next) }

  useEffect(() => {
    const cur = shownRef.current
    if (hint) {
      const nextText = hint.text ?? ''
      // Same id: resume (back mid-fade from 'paused') or a text change. Never a
      // second arrival. Text '' = arrow only (e.g. the GardenBar is open and
      // already says it): the toast leaves quietly and the arrow stays.
      if (cur && cur.id === hint.id) {
        clearTimers()
        if (nextText) {
          const needIn = !cur.toastText // toast was hidden (arrow-only) → it arrives
          show({ ...cur, text: nextText, toastText: nextText, target: hint.target, arrow: 'shown', toast: needIn ? 'in' : 'shown' })
          if (needIn) later(() => { const c = shownRef.current; if (c && c.id === hint.id && c.toast === 'in') show({ ...c, toast: 'shown' }) }, IN_MS)
        } else {
          show({ ...cur, text: '', target: hint.target, arrow: 'shown', toast: cur.toastText ? 'out' : cur.toast })
          if (cur.toastText) later(() => { const c = shownRef.current; if (c && c.id === hint.id && !c.text) show({ ...c, toastText: '' }) }, OUT_MS)
        }
        return
      }
      clearTimers()
      const soft = lastExit.current?.id === hint.id && lastExit.current?.reason === 'paused'
      show({ id: hint.id, text: nextText, toastText: nextText, target: hint.target, arrow: 'in', toast: 'in', soft })
      later(() => {
        const c = shownRef.current
        if (c && c.id === hint.id && c.arrow === 'in') show({ ...c, arrow: 'shown', toast: c.toastText ? 'shown' : c.toast })
      }, IN_MS)
      return
    }
    // hint went null → play the exit, then unmount.
    if (!cur || cur.arrow === 'out' || cur.arrow === 'done') return
    clearTimers()
    const done = exitReason === 'done'
    lastExit.current = { id: cur.id, reason: exitReason }
    show({ ...cur, text: '', arrow: done ? 'done' : 'out', toast: 'out' })
    // Done: the arrow swells (DONE_ARROW_MS) while the toast leaves quietly (OUT_MS).
    later(() => show(null), done && cur.target ? Math.max(DONE_ARROW_MS, OUT_MS) : OUT_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, text, tKey, exitReason])

  useEffect(() => clearTimers, [])

  // ── per-frame arrow placement (refs only, no React renders) ──
  const layerRef = useRef(null)
  const arrowRef = useRef(null)
  const motionRef = useRef(null)
  const toastRef = useRef(null)
  const hasArrow = !!(shown && shown.target)
  const getPosRef = useRef(getTargetPos)
  const insetsRef = useRef(insets)
  const targetRef = useRef(null)
  const armRef = useRef({ timer: 0, resting: false, at: null }) // edge tap run → rest → re-arm
  useLayoutEffect(() => {
    getPosRef.current = getTargetPos
    insetsRef.current = insets
    targetRef.current = shown?.target ?? null
  })

  useLayoutEffect(() => {
    if (!hasArrow) return
    let raf = 0
    let alive = true
    const tick = () => {
      const layer = layerRef.current
      const el = arrowRef.current
      const t = targetRef.current
      if (!layer || !el || !t) return
      const w = layer.clientWidth
      const h = layer.clientHeight
      const pt = resolveTarget(t, layer, getPosRef.current)
      if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
        el.style.visibility = 'hidden'
        return
      }
      const ins = { ...GUTTER, ...insetsRef.current }
      const AH = arrowHRef.current
      const m = motionRef.current
      const wasEdge = m?.dataset.mode === 'edge'
      // Avoid the REAL HUD, not guessed bands (Clover's root cause, job 2): every
      // visible [data-hint] piece, the docked pill included, is a rect the arrow
      // box must never touch. World arrows hang (body below) to clear one; edge
      // arrows slide along their edge. Hysteresis: entering edge is immediate,
      // leaving it waits until the point is EDGE_HYSTERESIS px clear inside.
      const avoid = hudRects(layer, t)
      const p = placeArrow(pt, { w, h }, { ...ins, top: ins.top + AH }, { wasEdge, hysteresis: EDGE_HYSTERESIS, avoid, arrow: ARROW[variantRef.current] })
      const edge = !!p.edge
      const mode = edge ? 'edge' : 'world'
      el.style.visibility = ''
      el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) rotate(${p.angle}deg)`
      if (el.dataset.mode !== mode) el.dataset.mode = mode // mirrored for Fern (no :has())
      if (m && m.dataset.mode !== mode) m.dataset.mode = mode
      // Edge re-arm: a tap run, then rest; once rested, a camera move (the
      // clamped placement moved) starts a fresh run by flipping data-arm 1↔2.
      const arm = armRef.current
      if (!edge) {
        if (arm.timer) clearTimeout(arm.timer)
        arm.timer = 0; arm.resting = false; arm.at = null
      } else if (!arm.at) {
        armStart(p, false)
      } else if (arm.resting && movedEnough(arm.at, p)) {
        armStart(p, true)
      }
    }
    const armStart = (p, flip) => {
      const arm = armRef.current
      const m = motionRef.current
      if (flip && m) m.dataset.arm = m.dataset.arm === '1' ? '2' : '1'
      arm.at = { x: p.x, y: p.y, angle: p.angle }
      arm.resting = false
      if (arm.timer) clearTimeout(arm.timer)
      arm.timer = setTimeout(() => { arm.resting = true; arm.timer = 0 }, EDGE_REST_MS)
    }
    const loop = () => { if (!alive) return; tick(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    const poll = setInterval(tick, POLL_MS)
    tick()
    return () => {
      alive = false; cancelAnimationFrame(raf); clearInterval(poll)
      const arm = armRef.current
      if (arm.timer) clearTimeout(arm.timer)
      armRef.current = { timer: 0, resting: false, at: null }
    }
  }, [hasArrow])

  const leaving = shown?.toast === 'out'
  const liveText = shown?.text ?? ''
  const canDismiss = typeof onDismiss === 'function'

  return (
    <div className="luxiHint-layer" ref={layerRef} data-arrow={variant}>
      {/* Always mounted, always the same node: the polite announcement. The visible
          toast text below is aria-hidden so it isn't read twice. */}
      <div className="luxiHint-live" role="status" aria-live="polite" aria-atomic="true">
        {liveText}
      </div>

      {hasArrow && (
        <div
          className="luxiHint-arrow"
          ref={arrowRef}
          aria-hidden="true"
          data-motion={boldDone ? 'bold' : undefined}
          data-arrow={variant}
          data-candy={ARROW[variant].candy ? '' : undefined}
          data-state={shown.arrow}
          style={{ visibility: 'hidden' }}
        >
          {/* Ground shadow: OUTSIDE the motion box so it stays on the ground while
              the arrow drops in and lifts (Fern animates it against the bob).
              Candy arrows only; it mirrors the arrow's state. */}
          {ARROW[variant].candy && <div className="luxiHint-arrowShadow" data-state={shown.arrow} />}
          <div
            className="luxiHint-arrowMotion"
            ref={motionRef}
            data-state={shown.arrow}
            data-mode="world"
            data-arm="1"
            data-soft={shown.soft ? '' : undefined}
          >
            <div className="luxiHint-arrowBob">
              {ARROW[variant].candy ? <CandyArrowGlyph /> : <ArrowGlyph />}
            </div>
          </div>
        </div>
      )}

      {shown && shown.toastText && (
        <div
          className="luxiHint-toast"
          ref={toastRef}
          data-state={shown.toast}
          data-soft={shown.soft ? '' : undefined}
          data-hint="hint-dock"
          data-dismissable={canDismiss ? 'true' : 'false'}
        >
          <span className="luxiHint-toastText" aria-hidden="true">{shown.toastText}</span>
          {canDismiss && (
            <button
              type="button"
              className="luxiHint-dismiss"
              aria-label={dismissLabel}
              disabled={leaving}
              onPointerDown={(e) => e.stopPropagation() /* never a walk-tap underneath */}
              onClick={() => onDismiss(shown.id)}
            >
              <span aria-hidden="true">{dismissText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Glyph sizes (tip at the bottom-centre = the .luxiHint-arrow origin). */
const ARROW = { iris: { w: 40, h: 48 }, green: { w: 56, h: 64, candy: true }, pink: { w: 56, h: 64, candy: true } }

/** World targets come from the host; DOM targets via Rowan's domTargetPos
 *  (top-centre of [data-hint="name"], in this layer's coordinates). */
function resolveTarget(t, layer, getPos) {
  if (t.dom != null) return domTargetPos(t.dom, layer.getBoundingClientRect())
  return typeof getPos === 'function' ? getPos(t) : null
}

/** Points DOWN, with the tip at the bottom-centre (20, 48), which is the
 *  .luxiHint-arrow origin. Iris body and a white keyline, so it reads on sand,
 *  grass and snow alike. */
function ArrowGlyph() {
  return (
    <svg className="luxiHint-glyph" width="40" height="48" viewBox="0 0 40 48" focusable="false">
      <path
        d="M14 4 h12 a2 2 0 0 1 2 2 v16 h7 a1.6 1.6 0 0 1 1.2 2.7 L21.2 44.4 a1.6 1.6 0 0 1 -2.4 0 L3.8 24.7 A1.6 1.6 0 0 1 5 22 h7 V6 a2 2 0 0 1 2 -2 z"
        fill="var(--luxiHint-arrow-fill)"
        stroke="var(--luxiHint-arrow-keyline)"
        strokeWidth="3"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
    </svg>
  )
}

/** The candy arrow (green = default, pink = on green ground; colours come from
 *  CSS vars per data-arrow, the shape is shared). Amy's review #1: a chunky, glossy "candy" arrow in the house 3D-button
 *  language (a lit face over a darker extrusion, like the Iris 500 face / 700
 *  shadow buttons). Layered shapes, one soft gradient, no images.
 *  Contrast comes from the silhouette, not the face: green 400/500 is only
 *  ~1.3-1.9:1 on every Luxi ground, so a green-900 outline (3.95-7.9:1 on all
 *  grounds) and a white rim (4.3:1 on the bed's soil) carry it.
 *  56 × 64, points DOWN, extruded tip at (28, 62). */
function CandyArrowGlyph() {
  const gid = useId().replace(/:/g, '')
  const face = 'M22 6h12a4 4 0 0 1 4 4v18h10a3 3 0 0 1 2.2 5L30.2 56a3 3 0 0 1-4.4 0L5.8 33A3 3 0 0 1 8 28h10V10a4 4 0 0 1 4-4z'
  return (
    <svg className="luxiHint-glyph luxiHint-glyph--candy" width="56" height="64" viewBox="0 0 56 64" focusable="false">
      <defs>
        <linearGradient id={`${gid}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--luxiHint-candy-top)" />
          <stop offset="1" stopColor="var(--luxiHint-candy-face)" />
        </linearGradient>
      </defs>
      {/* depth: the extrusion, 4px under the face, inside one dark outline */}
      <path d={face} transform="translate(0 4)" fill="var(--luxiHint-candy-depth)" stroke="var(--luxiHint-candy-outline)" strokeWidth="6" strokeLinejoin="round" paintOrder="stroke" />
      <path d={face} fill="none" stroke="var(--luxiHint-candy-outline)" strokeWidth="6" strokeLinejoin="round" />
      {/* face + white rim */}
      <path d={face} fill={`url(#${gid}f)`} stroke="var(--luxiHint-candy-rim)" strokeWidth="2" strokeLinejoin="round" />
      {/* gloss: a soft sheen down the shaft and across the head, plus one glint */}
      <g className="luxiHint-gloss" fill="var(--luxiHint-candy-rim)">
        <rect x="21" y="9" width="5" height="17" rx="2.5" opacity="0.55" />
        <path d="M10 31.5h10.5a2 2 0 0 1 0 4H14a2 2 0 0 1-1.6-.8l-2.4-3.2z" opacity="0.45" />
        <circle cx="23.5" cy="11.5" r="1.6" opacity="0.95" />
      </g>
    </svg>
  )
}
