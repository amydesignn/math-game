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
 *   />
 *
 * Mount it ALWAYS (hint may be null). The polite live region has to exist before
 * the text arrives, or screen readers skip it. Motion belongs to Fern
 * (motion.css + motion.js) and edge maths to Rowan (position.js). This file only
 * moves the arrow and steps data-state on plain timers. It never uses
 * animationend, which stalls in hidden or throttled windows.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { placeArrow, domTargetPos } from './position.js'
import { HINT_MOTION } from './motion.js'
import './hints.css'
import './motion.css'

const IN_MS = 16 // "in" → "shown" on the next tick, so the arrival transition runs
const OUT_MS = HINT_MOTION?.outMs ?? 200
const DONE_ARROW_MS = HINT_MOTION?.doneArrowMs ?? 700
const POLL_MS = 250 // fallback beside rAF: the arrow never freezes in a throttled pane

/** Safe rect for the edge arrow, measured against the Luxi HUD (2026-10-17).
 *  top: below the level row, minimap (ends 120) and map label (ends ~150).
 *  ≤600px: Exit + 🛍️ drop to y 72–178. bottom: above GardenBar/ActionBar
 *  (bottom 20 + ~98) and MoveHint. A host on another page passes its own. */
function defaultInsets(w) {
  return { top: w <= 600 ? 188 : 168, right: 16, bottom: 132, left: 16 }
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
}) {
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
      const ins = { ...defaultInsets(w), ...insetsRef.current }
      // While a toast is up, keep the arrow body (48px above its tip) clear of it.
      const toast = toastRef.current
      if (toast) {
        const lr = layer.getBoundingClientRect()
        const tr = toast.getBoundingClientRect()
        if (tr.height > 0) ins.top = Math.max(ins.top, tr.bottom - lr.top + 8)
      }
      // The tip sits ON the point and the 48px body rises above it, so the safe
      // rect's top moves down by the body height. placeArrow then counts a point
      // inside a HUD band as edge too, which clamps it and points toward it.
      let p = placeArrow(pt, { w, h }, { ...ins, top: ins.top + ARROW_H })
      // A target just under the top band (no room for the body above it): keep
      // the tip ON it and hang the body below, pointing up. Otherwise the edge
      // clamp would park the arrow below the target, pointing "away" at the HUD.
      if (p.edge && pt.y >= ins.top && pt.y < ins.top + ARROW_H && pt.x >= ins.left && pt.x <= w - ins.right) {
        p = { x: pt.x, y: pt.y, angle: 180, edge: false }
      }
      const edge = !!p.edge
      el.style.visibility = ''
      el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) rotate(${p.angle}deg)`
      const m = motionRef.current
      if (m && m.dataset.mode !== (edge ? 'edge' : 'world')) m.dataset.mode = edge ? 'edge' : 'world'
    }
    const loop = () => { if (!alive) return; tick(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    const poll = setInterval(tick, POLL_MS)
    tick()
    return () => { alive = false; cancelAnimationFrame(raf); clearInterval(poll) }
  }, [hasArrow])

  const leaving = shown?.toast === 'out'
  const liveText = shown?.text ?? ''
  const canDismiss = typeof onDismiss === 'function'

  return (
    <div className="luxiHint-layer" ref={layerRef}>
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
          style={{ visibility: 'hidden' }}
        >
          <div
            className="luxiHint-arrowMotion"
            ref={motionRef}
            data-state={shown.arrow}
            data-mode="world"
            data-soft={shown.soft ? '' : undefined}
          >
            <div className="luxiHint-arrowBob">
              <ArrowGlyph />
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

const ARROW_H = 48

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
