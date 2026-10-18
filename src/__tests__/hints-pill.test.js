/*
 * In-game hints — the pill rides the arrow (job 3, "sign on a post").
 * placePill: tail side first, then right, then left, else the dock; never on
 * the HUD, the arrow, the bed or her; side switches only when she's stopped
 * (unless blocked), with a 24px buffer.
 */
import { describe, it, expect } from 'vitest'
import { placePill, placeArrow, arrowBox, PILL_GAP } from '../hints/position.js'

const arrowSize = { w: 56, h: 64 }
const pillOf = (w, h = 44) => (maxW) => ({ w: Math.min(w, maxW), h: maxW < w ? h * 2 : h }) // wraps to 2 lines when squeezed
const desk = { w: 1280, h: 800 }
const phone = { w: 375, h: 812 }
const boxOf = (p) => ({ left: p.x, top: p.y, right: p.x + p.w, bottom: p.y + p.h })
const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
const down = (x, y) => ({ x, y, angle: 0, edge: false })

describe('the rule: tail side first', () => {
  it('a down arrow on the bed → the pill sits ABOVE it, centred, 8px past the body', () => {
    const a = down(640, 400)
    const p = placePill(a, pillOf(300), desk, [], null, { arrowSize })
    const ab = arrowBox(a, arrowSize)
    expect(p.side).toBe('tail')
    expect(p.y + p.h).toBeCloseTo(ab.top - PILL_GAP)
    expect(p.x + p.w / 2).toBeCloseTo(640)
  })
  it('phone, left-edge arrow pointing left → the pill sits to its RIGHT, wraps to fit, stays on screen', () => {
    const a = { x: 16, y: 400, angle: 90, edge: true }
    let asked = null
    const p = placePill(a, (maxW) => ((asked = maxW), pillOf(329)(maxW)), phone, [], null, { arrowSize })
    expect(p.side).toBe('tail')
    expect(asked).toBeLessThan(329) // squeezed → 2 lines
    expect(p.x).toBeGreaterThan(16 + 64)
    expect(p.x + p.w).toBeLessThanOrEqual(375 - 16)
  })
  it('a hanging arrow (pointing up) → the pill below it', () => {
    const a = { x: 640, y: 300, angle: 180, edge: false }
    const p = placePill(a, pillOf(300), desk, [], null, { arrowSize })
    expect(p.side).toBe('tail')
    expect(p.y).toBeGreaterThan(300 + 64)
  })
})

describe('fallbacks + never covering anything', () => {
  const a = down(640, 400)
  const above = { left: 400, right: 880, top: 200, bottom: 330 } // e.g. her character above the arrow
  it('tail blocked → right', () => {
    expect(placePill(a, pillOf(240), desk, [above], null, { arrowSize }).side).toBe('right')
  })
  it('tail + right blocked → left', () => {
    const rightBlock = { left: 680, right: 1280, top: 0, bottom: 800 }
    expect(placePill(a, pillOf(240), desk, [above, rightBlock], null, { arrowSize }).side).toBe('left')
  })
  it('nothing fits → the dock', () => {
    const all = { left: 0, right: 1280, top: 0, bottom: 330 }
    const r = { left: 680, right: 1280, top: 0, bottom: 800 }
    const l = { left: 0, right: 600, top: 0, bottom: 800 }
    expect(placePill(a, pillOf(240), desk, [all, r, l], null, { arrowSize })).toMatchObject({ side: 'dock', docked: true })
  })
  it('property: over 500 random scenes the pill never touches the arrow, the screen edge or any avoid rect', () => {
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let n = 0; n < 500; n++) {
      const size = rnd() < 0.5 ? phone : desk
      const pt = { x: rnd() * size.w * 1.6 - size.w * 0.3, y: rnd() * size.h * 1.6 - size.h * 0.3 }
      const avoid = Array.from({ length: 4 }, () => {
        const x = rnd() * size.w, y = rnd() * size.h
        return { left: x, top: y, right: x + 30 + rnd() * 160, bottom: y + 30 + rnd() * 160 }
      })
      const a = placeArrow(pt, size, { top: 80, right: 16, bottom: 16, left: 16 }, { avoid, arrow: arrowSize })
      const p = placePill(a, pillOf(120 + rnd() * 220), size, avoid, null, { arrowSize, walking: rnd() < 0.5 })
      if (p.docked) continue
      const b = boxOf(p)
      expect(b.left).toBeGreaterThanOrEqual(15.5)
      expect(b.right).toBeLessThanOrEqual(size.w - 15.5)
      expect(b.top).toBeGreaterThanOrEqual(15.5)
      expect(b.bottom).toBeLessThanOrEqual(size.h - 15.5)
      expect(overlaps(b, arrowBox(a, arrowSize))).toBe(false)
      for (const r of avoid) expect(overlaps(b, r)).toBe(false)
    }
  })
})

describe('following: locked to the arrow, sides switch only when she stops', () => {
  const a = down(640, 400)
  it('locked: the pill moves exactly with the arrow', () => {
    const p1 = placePill(a, pillOf(300), desk, [], 'tail', { arrowSize })
    const p2 = placePill(down(700, 430), pillOf(300), desk, [], 'tail', { arrowSize })
    expect(p2.x - p1.x).toBeCloseTo(60)
    expect(p2.y - p1.y).toBeCloseTo(30)
  })
  it('walking: stays on its (still valid) side even when the tail frees up', () => {
    expect(placePill(a, pillOf(240), desk, [], 'right', { arrowSize, walking: true }).side).toBe('right')
  })
  it('stopped: moves back to the preferred tail side', () => {
    expect(placePill(a, pillOf(240), desk, [], 'right', { arrowSize, walking: false }).side).toBe('tail')
  })
  it('walking but its side got blocked: it switches anyway', () => {
    const rightBlock = { left: 800, right: 1280, top: 0, bottom: 800 } // blocks the right side, leaves the tail roomy
    expect(placePill(a, pillOf(240), desk, [rightBlock], 'right', { arrowSize, walking: true }).side).toBe('tail')
  })
  it('buffer: a tail that clears an obstacle by only 10px is not worth switching to', () => {
    const p0 = placePill(a, pillOf(240), desk, [], 'tail', { arrowSize })
    const near = { left: 0, right: 1280, top: 0, bottom: p0.y - 10 } // 10px above where the tail pill would sit
    expect(placePill(a, pillOf(240), desk, [near], 'right', { arrowSize, walking: false }).side).toBe('right')
    // …but it IS a fine place to stay if it was already there
    expect(placePill(a, pillOf(240), desk, [near], 'tail', { arrowSize, walking: false }).side).toBe('tail')
  })
})

describe('slide along the arrow (job 3 QA: the dock was carrying 75–100%)', () => {
  it("Clover's 1280 case: arrow near the top-left, tail's centred spot in the Exit column → slides right, still over the arrow", () => {
    const a = down(110, 260) // arrow near the left edge, tip on the bed
    const exitCol = { left: 16, right: 64, top: 16, bottom: 180 } // Exit + shop column
    const p = placePill(a, pillOf(300), desk, [exitCol], null, { arrowSize })
    expect(p.docked).toBe(false)
    expect(p.side).toBe('tail')
    const ab = arrowBox(a, arrowSize)
    expect(p.x).toBeLessThan(ab.right - 15) // still overlaps the arrow horizontally: attached
    expect(p.x).toBeGreaterThan(exitCol.right) // slid off the column
    expect(overlaps(boxOf(p), exitCol)).toBe(false)
  })
  it('side spot centred on the bed → it slides up beside the arrow body instead of docking', () => {
    const a = down(200, 260)
    const hud = { left: 0, right: 1280, top: 0, bottom: 150 } // nothing above the arrow
    const bed = { left: 60, right: 600, top: 236, bottom: 330 } // the bed under the tip
    const p = placePill(a, pillOf(180, 40), desk, [hud, bed], null, { arrowSize })
    expect(p.docked).toBe(false)
    expect(p.side).toBe('right')
    expect(p.y + p.h).toBeLessThanOrEqual(236)
    expect(p.y + p.h).toBeGreaterThan(arrowBox(a, arrowSize).top + 15) // attached to the body
  })
})

describe('corner attach (job 3 QA issues 1 + 2) — only when nothing else fits', () => {
  // Clover's phone, in front of the bed: arrow high up, HUD above/left/right, the bed below
  const phoneFront = () => {
    const a = down(189, 157) // arrow box ≈ (161–217, 93–157)
    const avoid = [
      { left: 16, right: 247, top: 16, bottom: 60 }, // level pill + settings
      { left: 255, right: 359, top: 16, bottom: 155 }, // minimap + label
      { left: 16, right: 64, top: 72, bottom: 178 }, // Exit + shop column
      { left: -14, right: 225, top: 160, bottom: 300 }, // the bed's soil
      { left: 130, right: 245, top: 308, bottom: 487 }, // her
    ]
    return { a, avoid }
  }
  it('phone in front of the bed: pairs at the arrow’s corner instead of docking', () => {
    const { a, avoid } = phoneFront()
    const p = placePill(a, pillOf(256, 44), phone, avoid, null, { arrowSize })
    expect(p.docked).toBe(false)
    const b = boxOf(p), ab = arrowBox(a, arrowSize)
    for (const r of [...avoid, ab]) expect(overlaps(b, r)).toBe(false)
    // touching-close: within gap+1 of the arrow box on both axes
    const dx = Math.max(ab.left - b.right, b.left - ab.right, 0)
    const dy = Math.max(ab.top - b.bottom, b.top - ab.bottom, 0)
    expect(Math.max(dx, dy)).toBeLessThanOrEqual(9)
  })
  it('a strict (beside-the-body) spot still wins over a corner one', () => {
    expect(placePill(down(640, 400), pillOf(300), desk, [], null, { arrowSize }).side).toBe('tail')
  })
  it('once corner-attached, it keeps its side while she walks (no hop)', () => {
    const { a, avoid } = phoneFront()
    const p = placePill(a, pillOf(256, 44), phone, avoid, null, { arrowSize })
    const q = placePill(down(191, 158), pillOf(256, 44), phone, avoid, p.side, { arrowSize, walking: true })
    expect(q.side).toBe(p.side)
    expect(q.docked).toBe(false)
  })
})

describe("Clover's iPad arrival (left edge arrow, her silhouette across its band)", () => {
  it('pairs stacked just above/below the edge arrow instead of docking', () => {
    const ipad = { w: 768, h: 1024 }
    const a = { x: 16, y: 512, angle: 90, edge: true } // pointing left, at the left edge
    const her = { left: 60, right: 460, top: 480, bottom: 700 } // across the arrow's band, room above it
    const p = placePill(a, pillOf(300), ipad, [her], null, { arrowSize })
    expect(p.docked).toBe(false)
    const b = boxOf(p), ab = arrowBox(a, arrowSize)
    expect(overlaps(b, her)).toBe(false)
    expect(overlaps(b, ab)).toBe(false)
    const dy = Math.max(ab.top - b.bottom, b.top - ab.bottom, 0)
    expect(dy).toBeLessThanOrEqual(9) // stacked right against the arrow
    expect(b.left).toBeLessThan(ab.right) // stacked straight above/below the arrow (overlaps it in x), aligned to the edge
    expect(['above', 'below']).toContain(p.side)
  })
})
