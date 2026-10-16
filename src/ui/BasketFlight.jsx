import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/*
 * 🌸 → 🧺 The harvest flight (Grow a Garden, "Harvest + exchange", locked spec):
 * the picked flower flies AS ITSELF from the bed into the basket button, then
 * the total ticks +1. Plain DOM over the canvas, one emoji per pick.
 *
 * The flight is a Web Animations keyframe track (compositor-driven, no React
 * re-renders). The count tick does NOT wait on it: App lands it on a plain
 * setTimeout(FLY_MS), like the gem award — so a starved/hidden frame loop can
 * never strand a harvest. Reduced motion: no flight, App ticks at once.
 */
export const FLY_MS = 760
const ARC = 0.32 // how high the arc bows above the straight line, × the distance
const STEPS = 16 // keyframes sampled along the curve

/** A world point → page pixels for this camera + canvas rect, or null when it's behind the camera. */
export function worldToScreen([x, y, z], camera, rect) {
  const v = new THREE.Vector3(x, y, z).project(camera)
  if (v.z > 1) return null
  return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height }
}

/** Points along a quadratic arc from → to, bowing upward (screen y is down). t ∈ [0, 1]. */
export function arcPoint(from, to, t) {
  const dx = to.x - from.x, dy = to.y - from.y
  const lift = Math.hypot(dx, dy) * ARC
  const c = { x: from.x + dx * 0.35, y: Math.min(from.y, to.y) - lift } // control point: up and a little along
  const s = 1 - t
  return { x: s * s * from.x + 2 * s * t * c.x + t * t * to.x, y: s * s * from.y + 2 * s * t * c.y + t * t * to.y }
}

export function FlyFlower({ from, to, emoji }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el?.animate) return
    const frames = []
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS
      const p = arcPoint(from, to, t)
      // a little swell as it leaves the bed, then it shrinks into the basket
      const s = t < 0.2 ? 1 + t : 1.2 - 0.6 * ((t - 0.2) / 0.8)
      // …and drops INTO it: gone over the last stretch, so it never sits on the button
      const o = t < 0.88 ? 1 : 1 - (t - 0.88) / 0.12
      frames.push({ transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${s}) rotate(${-12 + 24 * t}deg)`, opacity: o })
    }
    const a = el.animate(frames, { duration: FLY_MS, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'forwards' })
    return () => a.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        fontSize: 40,
        lineHeight: 1,
        pointerEvents: 'none',
        transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%)`,
        filter: 'drop-shadow(0 4px 8px rgba(43,32,90,0.28))',
      }}
    >
      {emoji}
    </div>
  )
}
