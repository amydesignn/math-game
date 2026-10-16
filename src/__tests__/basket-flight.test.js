import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { worldToScreen, arcPoint, FLY_MS } from '../ui/BasketFlight.jsx'
import { HARVEST_MS } from '../world/GardenPlot.jsx'

// Grow a Garden "Harvest + exchange": the picked flower flies from the bed to
// the 🧺 button, then the count ticks. The flight must start where the bed is
// on screen and land exactly on the basket.
describe('harvest flight to the basket', () => {
  const rect = { left: 0, top: 0, width: 800, height: 600 }
  const cam = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 100)
  cam.position.set(0, 9, 6.5)
  cam.lookAt(0, 0.6, 0)
  cam.updateMatrixWorld()

  it('projects the point the camera looks at to the middle of the canvas', () => {
    const p = worldToScreen([0, 0.6, 0], cam, rect)
    expect(p.x).toBeCloseTo(400, 3)
    expect(p.y).toBeCloseTo(300, 3)
  })
  it('a bed to the left lands left of centre; the canvas offset is respected', () => {
    const p = worldToScreen([-3, 0.6, 0], cam, { ...rect, left: 20, top: 10 })
    expect(p.x).toBeLessThan(420)
    expect(p.y).toBeGreaterThan(10)
  })
  it('a point behind the camera has no screen spot (no flight from nowhere)', () => {
    expect(worldToScreen([0, 9, 20], cam, rect)).toBeNull()
  })
  it('the arc starts on the bed, ends on the basket, and bows upward', () => {
    const from = { x: 400, y: 300 }, to = { x: 42, y: 560 }
    expect(arcPoint(from, to, 0)).toEqual(from)
    const end = arcPoint(from, to, 1)
    expect(end.x).toBeCloseTo(to.x, 6)
    expect(end.y).toBeCloseTo(to.y, 6)
    let top = Infinity
    for (let t = 0; t <= 1; t += 0.05) top = Math.min(top, arcPoint(from, to, t).y)
    expect(top).toBeLessThan(from.y) // rises above the bed before it drops into the basket
  })
  it('the flight is short — under a second, like the pick itself', () => {
    expect(FLY_MS).toBeLessThan(1000)
    expect(FLY_MS).toBeGreaterThan(HARVEST_MS / 2)
  })
})
