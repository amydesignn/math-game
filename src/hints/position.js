// Pure screen-space maths for the hint arrow. No DOM, no React, no imports.
//
// The arrow is drawn POINTING DOWN at rest; `angle` is the CSS rotate (deg)
// that turns it toward its target. On-screen: angle 0, tip on the point.
// Off-screen (or inside a HUD band): the tip is clamped onto the edge of the
// safe rect along the line from the rect's centre, and rotated to point at it.

export const DEFAULT_INSETS = { top: 168, right: 16, bottom: 132, left: 16 } // Linden's measured HUD bands
export const EDGE_HYSTERESIS = 24 // px a point must be clear inside before an edge arrow returns to world mode
export const REARM_MOVE_PX = 24 // the edge arrow re-arms its taps after a rest once its spot moves this far…
export const REARM_TURN_DEG = 10 // …or turns this much (the camera moved)

/**
 * @param {{x:number,y:number}} pt   target point, px relative to the layer (may be off-screen)
 * @param {{w:number,h:number}} size layer size
 * @param {{top,right,bottom,left}} insets safe rect = size minus these bands
 * @returns {{x:number,y:number,angle:number,edge:boolean}}
 */
export function placeArrow(pt, size, insets = DEFAULT_INSETS, { wasEdge = false, hysteresis = EDGE_HYSTERESIS } = {}) {
  const i = { ...DEFAULT_INSETS, ...insets }
  const L = i.left, T = i.top
  const R = Math.max(L, size.w - i.right), B = Math.max(T, size.h - i.bottom)
  if (pt.x >= L && pt.x <= R && pt.y >= T && pt.y <= B) {
    // Hysteresis (Amy's review): world→edge flips AT the boundary, but edge→world
    // only once the point is `hysteresis` px clear inside. Without it a bed near a
    // HUD band flips mode frame to frame and restarts the edge keyframes. Inside
    // that strip the geometry still follows the point (no jump) — only the MODE
    // stays edge. Asymmetric on purpose: a world arrow never sits inside a band.
    const h = Math.max(0, Math.min(hysteresis, (R - L) / 2, (B - T) / 2))
    const clear = pt.x >= L + h && pt.x <= R - h && pt.y >= T + h && pt.y <= B - h
    return { x: pt.x, y: pt.y, angle: 0, edge: wasEdge && !clear }
  }
  const cx = (L + R) / 2, cy = (T + B) / 2
  const dx = pt.x - cx, dy = pt.y - cy
  const hx = (R - L) / 2, hy = (B - T) / 2
  // smallest t at which the ray centre→pt leaves the rect
  const tx = dx ? hx / Math.abs(dx) : Infinity
  const ty = dy ? hy / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty, 1)
  const x = cx + dx * t, y = cy + dy * t
  return { x, y, angle: angleToward(pt.x - x, pt.y - y, dx, dy), edge: true }
}

/** CSS rotate (deg) that turns a DOWN-pointing arrow along (dx, dy). Screen y is down. */
export function arrowAngle(dx, dy) {
  if (!dx && !dy) return 0
  let a = Math.round(((Math.atan2(-dx, dy) * 180) / Math.PI) * 10) / 10
  if (a <= -180) a += 360 // range (-180, 180]: straight up is always 180
  return a + 0 // +0 turns -0 into 0
}

// Point from the clamped tip toward the target; if they coincide (degenerate rect), use the centre ray.
function angleToward(ex, ey, dx, dy) {
  return Math.hypot(ex, ey) > 0.5 ? arrowAngle(ex, ey) : arrowAngle(dx, dy)
}

/** Top-centre of a [data-hint=key] element, relative to `origin` (a DOMRect-like). null if absent/hidden. */
export function domTargetPos(key, origin = { left: 0, top: 0 }, doc = globalThis.document) {
  const el = doc?.querySelector?.(`[data-hint="${key}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (!r.width && !r.height) return null
  return { x: r.left + r.width / 2 - origin.left, y: r.top - origin.top }
}

/** Has an edge arrow moved enough since its last arm to tap again? (Amy's
 *  "5 taps, rest, re-arm when the camera moves".) Compares two placements. */
export function movedEnough(a, b, px = REARM_MOVE_PX, deg = REARM_TURN_DEG) {
  if (!a || !b) return false
  if (Math.hypot(a.x - b.x, a.y - b.y) >= px) return true
  const d = Math.abs((((a.angle - b.angle) % 360) + 540) % 360 - 180)
  return d >= deg
}
