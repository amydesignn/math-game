import { describe, it, expect } from 'vitest'
import { popScale, harvestPose, spotDelay, POP, HARVEST, HARVEST_MS } from '../world/GardenPlot.jsx'

// Grow a Garden ticket 7: the growth pop + harvest curves. The art is locked,
// so the curves must always come to rest at EXACTLY the locked pose.
describe('garden motion curves', () => {
  it('the pop starts small (never from 0) and rests at exactly 1', () => {
    expect(popScale(0)).toBe(POP.from)
    expect(POP.from).toBeGreaterThan(0.4)
    expect(popScale(1)).toBe(1)
    expect(popScale(5)).toBe(1)
  })
  it('the pop overshoots softly — a bounce, not a boing', () => {
    let peak = 0
    for (let u = 0; u <= 1; u += 0.01) peak = Math.max(peak, popScale(u))
    expect(peak).toBeGreaterThan(1.02)
    expect(peak).toBeLessThan(1.08)
  })
  it('the ripple is short: the last plant starts well under half a second in', () => {
    expect(spotDelay(0, 0)).toBe(0)
    expect(spotDelay(5, 2)).toBeLessThan(0.4)
    expect(POP.dur + spotDelay(5, 2)).toBeLessThan(1)
  })
  it('harvest swells, lifts, and the empty-bed callback waits for the last plant', () => {
    expect(harvestPose(0)).toEqual([1, 0])
    expect(harvestPose(0.25)[0]).toBeCloseTo(1.15, 5)
    expect(harvestPose(1)[1]).toBe(HARVEST.lift)
    expect(HARVEST_MS).toBeGreaterThanOrEqual((HARVEST.dur + spotDelay(5, 2)) * 1000)
    expect(HARVEST_MS).toBeLessThan(1500)
  })
})
