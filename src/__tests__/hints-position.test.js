/* In-game hints — the arrow's screen maths (src/hints/position.js). */
import { describe, it, expect } from 'vitest'
import { placeArrow, arrowAngle, domTargetPos } from '../hints/position.js'

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
