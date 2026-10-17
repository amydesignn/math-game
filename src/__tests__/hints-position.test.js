/* In-game hints — the arrow's screen maths (src/hints/position.js). */
import { describe, it, expect } from 'vitest'
import { placeArrow, arrowAngle, domTargetPos, movedEnough, EDGE_HYSTERESIS } from '../hints/position.js'

const size = { w: 1000, h: 800 }
const ins = { top: 100, right: 20, bottom: 100, left: 20 } // safe rect x 20..980, y 100..700

describe('placeArrow', () => {
  it('on-screen: tip on the point, no rotation', () => {
    expect(placeArrow({ x: 500, y: 400 }, size, ins)).toEqual({ x: 500, y: 400, angle: 0, edge: false })
  })
  it('off the right: clamped to the right edge, pointing right', () => {
    const a = placeArrow({ x: 1500, y: 400 }, size, ins)
    expect(a).toMatchObject({ x: 980, y: 400, edge: true })
    expect(a.angle).toBe(-90)
  })
  it('off the left: pointing left', () => {
    const a = placeArrow({ x: -300, y: 400 }, size, ins)
    expect(a).toMatchObject({ x: 20, y: 400, edge: true, angle: 90 })
  })
  it('off the top: pointing up; below: pointing down', () => {
    expect(placeArrow({ x: 500, y: -50 }, size, ins)).toMatchObject({ x: 500, y: 100, angle: 180 })
    expect(placeArrow({ x: 500, y: 2000 }, size, ins)).toMatchObject({ x: 500, y: 700, angle: 0, edge: true })
  })
  it('on-screen but inside a HUD band counts as edge (never under the HUD)', () => {
    const a = placeArrow({ x: 500, y: 50 }, size, ins)
    expect(a).toMatchObject({ x: 500, y: 100, edge: true, angle: 180 })
  })
  it('corner: stays inside the safe rect, points diagonally at the target', () => {
    const a = placeArrow({ x: 3000, y: 3000 }, size, ins)
    expect(a.x).toBeLessThanOrEqual(980)
    expect(a.y).toBeLessThanOrEqual(700)
    expect(a.x === 980 || a.y === 700).toBe(true)
    expect(a.angle).toBeLessThan(0)
    expect(a.angle).toBeGreaterThan(-90)
  })
  it('degenerate tiny viewport never throws or NaNs', () => {
    const a = placeArrow({ x: 900, y: 900 }, { w: 100, h: 100 }, ins)
    expect(Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.angle)).toBe(true)
  })
})

describe('arrowAngle (CSS rotate for a DOWN arrow)', () => {
  it('down 0, right -90, left 90, up 180', () => {
    expect(arrowAngle(0, 1)).toBe(0)
    expect(arrowAngle(1, 0)).toBe(-90)
    expect(arrowAngle(-1, 0)).toBe(90)
    expect(arrowAngle(0, -1)).toBe(180)
  })
})

describe('domTargetPos', () => {
  const doc = (rect) => ({ querySelector: (q) => (q === '[data-hint="basket"]' && rect ? { getBoundingClientRect: () => rect } : null) })
  it('top-centre of the element, relative to the origin', () => {
    expect(domTargetPos('basket', { left: 10, top: 20 }, doc({ left: 100, top: 300, width: 50, height: 50 }))).toEqual({ x: 115, y: 280 })
  })
  it('missing or hidden → null', () => {
    expect(domTargetPos('basket', undefined, doc(null))).toBe(null)
    expect(domTargetPos('basket', undefined, doc({ left: 0, top: 0, width: 0, height: 0 }))).toBe(null)
  })
})

describe('hysteresis (Amy review: no world↔edge stutter near a HUD band)', () => {
  // follow the arrow like the layer does: wasEdge = last frame's mode
  const sweep = (ys, x = 500) => {
    let was = false
    const modes = []
    for (const y of ys) {
      was = placeArrow({ x, y }, size, ins, { wasEdge: was, hysteresis: EDGE_HYSTERESIS }).edge
      modes.push(was)
    }
    return modes
  }
  const flips = (m) => m.slice(1).filter((v, i) => v !== m[i]).length
  it('a point jittering ±20px across the top edge flips ONCE, not every frame', () => {
    const ys = Array.from({ length: 40 }, (_, k) => 100 + (k % 2 ? 20 : -20)) // 80, 120, 80, 120…
    const m = sweep(ys)
    expect(m[0]).toBe(true) // starts out above the band: edge
    expect(flips(m)).toBe(0) // 120 is only 20px inside → stays edge
    expect(flips(sweep([120, ...ys]))).toBe(1) // starting in world: one flip to edge, then it holds
  })
  it('world→edge flips right at the boundary (asymmetric: never sits inside a band)', () => {
    expect(placeArrow({ x: 500, y: 99 }, size, ins, { wasEdge: false }).edge).toBe(true)
    expect(placeArrow({ x: 500, y: 101 }, size, ins, { wasEdge: false }).edge).toBe(false)
  })
  it('edge→world only once ≥ 24px clear inside; geometry follows the point (no jump)', () => {
    expect(placeArrow({ x: 500, y: 110 }, size, ins, { wasEdge: true })).toEqual({ x: 500, y: 110, angle: 0, edge: true })
    expect(placeArrow({ x: 500, y: 123 }, size, ins, { wasEdge: true }).edge).toBe(true)
    expect(placeArrow({ x: 500, y: 124 }, size, ins, { wasEdge: true }).edge).toBe(false)
    expect(placeArrow({ x: 965, y: 400 }, size, ins, { wasEdge: true }).edge).toBe(true) // right side too
  })
  it('hysteresis 0 = the old instant behaviour', () => {
    expect(placeArrow({ x: 500, y: 101 }, size, ins, { wasEdge: true, hysteresis: 0 }).edge).toBe(false)
  })
})

describe('movedEnough (edge re-arm when the camera moves)', () => {
  const a = { x: 20, y: 400, angle: 90 }
  it('small drift does not re-arm', () => expect(movedEnough(a, { x: 20, y: 415, angle: 95 })).toBe(false))
  it('a 24px move or a 10° turn does', () => {
    expect(movedEnough(a, { x: 20, y: 424, angle: 90 })).toBe(true)
    expect(movedEnough(a, { x: 20, y: 400, angle: 100 })).toBe(true)
  })
  it('angle wraps (179° vs -179° is a 2° turn)', () =>
    expect(movedEnough({ x: 0, y: 0, angle: 179 }, { x: 0, y: 0, angle: -179 })).toBe(false))
  it('missing placement never re-arms', () => expect(movedEnough(null, a)).toBe(false))
})
