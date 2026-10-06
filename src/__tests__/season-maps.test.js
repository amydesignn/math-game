/*
 * season-maps.test.js — the Halloween arcade + the Sunny Town neighbours
 * (2026-10-06).
 *
 * Guards: (1) the season is a DATE WINDOW, inclusive both ends, every year;
 * (2) the Halloween dressing is ADDED on top of the arcade, never replacing its
 * machines, and never changes the gate colour (colour = the signpost);
 * (3) nothing seasonal or neighbourly sits where it could swallow a gate or
 * the spawn; (4) every decor entry is renderable — a GLB (pack+name) or a
 * known procedural `fx` — so a typo can't silently render nothing.
 */
import { describe, it, expect } from 'vitest'
import { seasonOn } from '../season'
import { MAPS, _arcadeWithSeason, _arcadeBase, blockers } from '../maps'
import { WORLD, CHARACTERS, PETS } from '../config'

const d = (m, day) => new Date(2026, m - 1, day, 12)
// mirrors world/fx.jsx's FX registry (Spooky + Market kinds)
const FX = new Set(['pumpkin', 'grave', 'candle', 'torch', 'cauldron', 'awning', 'fountain', 'bunting', 'crate', 'planter'])

describe('season window', () => {
  it('is Halloween from Oct 1 through Nov 2, inclusive', () => {
    expect(seasonOn(d(9, 30))).toBe(null)
    expect(seasonOn(d(10, 1))).toBe('halloween')
    expect(seasonOn(d(10, 31))).toBe('halloween')
    expect(seasonOn(d(11, 2))).toBe('halloween')
    expect(seasonOn(d(11, 3))).toBe(null)
    expect(seasonOn(new Date(2031, 9, 15))).toBe('halloween') // every year, no deploy
  })
})

describe('the Spooky Arcade', () => {
  const spooky = _arcadeWithSeason(_arcadeBase, 'halloween')

  it('is the plain Star Arcade out of season', () => {
    expect(_arcadeWithSeason(_arcadeBase, null)).toBe(_arcadeBase)
    expect(_arcadeBase.name).toBe('Star Arcade')
  })

  it('keeps every arcade machine and adds the Halloween dressing on top', () => {
    for (const piece of _arcadeBase.decor) expect(spooky.decor).toContain(piece)
    expect(spooky.decor.length).toBeGreaterThan(_arcadeBase.decor.length + 30)
    expect(spooky.ambient.filter((a) => a.kind === 'ghost').length).toBeGreaterThanOrEqual(4)
    expect(spooky.ambient.filter((a) => a.kind === 'wisp').length).toBeGreaterThanOrEqual(8)
  })

  it('keeps its id, gates and violet gate colour (the signpost never changes)', () => {
    expect(spooky.id).toBe('arcade')
    expect(spooky.gates).toEqual(_arcadeBase.gates)
    expect(spooky.gateColor).toBe(_arcadeBase.gateColor)
  })

  it('keeps the spawn and both gates clear of props', () => {
    for (const p of spooky.decor) {
      const [x, , z] = p.position
      expect(Math.hypot(x, z), `${p.fx || p.name} on spawn`).toBeGreaterThan(1.9)
      for (const g of spooky.gates) {
        expect(Math.hypot(x - g.position[0], z - g.position[2]), `${p.fx || p.name} in a gate`).toBeGreaterThan(3)
      }
    }
  })
})

describe('every map', () => {
  const all = Object.values(MAPS).concat(_arcadeWithSeason(_arcadeBase, 'halloween'))

  it('only uses renderable decor, inside the playable bounds', () => {
    for (const m of all) {
      for (const p of m.decor) {
        if (p.fx) expect(FX.has(p.fx), `${m.id}: unknown fx ${p.fx}`).toBe(true)
        else expect(p.pack && p.name, `${m.id}: decor without a model`).toBeTruthy()
        expect(Math.abs(p.position[0])).toBeLessThanOrEqual(WORLD.bounds)
        expect(Math.abs(p.position[2])).toBeLessThanOrEqual(WORLD.bounds)
      }
    }
  })
})

describe('Sunny Town', () => {
  const town = MAPS.town

  it('is an open square for building — trees only, the middle left empty', () => {
    for (const p of town.decor) {
      expect(['tree', 'tree-high']).toContain(p.name)
      expect(Math.hypot(p.position[0], p.position[2])).toBeGreaterThan(12)
    }
  })

  it('has friendly neighbours, each with a real character, pet and something to say', () => {
    expect(town.neighbours.length).toBeGreaterThanOrEqual(3)
    const looks = new Set()
    for (const n of town.neighbours) {
      expect(CHARACTERS).toContain(n.character)
      expect(PETS).toContain(n.pet)
      expect(n.lines.length).toBeGreaterThanOrEqual(2)
      looks.add(n.character)
      // their stroll (≤2.2 from home) can never reach a gate or the spawn
      for (const g of town.gates) expect(Math.hypot(n.home[0] - g.position[0], n.home[1] - g.position[2])).toBeGreaterThan(5)
      expect(Math.hypot(n.home[0], n.home[1])).toBeGreaterThan(5)
    }
    expect(looks.size).toBe(town.neighbours.length) // no twins
  })

  it('keeps public-safe copy — no player or family names', () => {
    const text = town.neighbours.flatMap((n) => n.lines).join(' ')
    expect(text).not.toMatch(/\b(Ivy|Amy|Finn|Oscar|Nathan|Mum)\b/)
  })

  it('makes sparkles and stations keep clear of neighbours too', () => {
    const homes = blockers(town).filter(([, , r]) => r > 0)
    expect(homes.length).toBe(town.neighbours.length)
  })
})

describe('Merry Market', () => {
  const mk = MAPS.market
  const at = (n) => n.home || n.route[0]

  it('is a busy square — dense like the Clearing, fountain ahead of spawn', () => {
    expect(mk.decor.length).toBeGreaterThan(60)
    const f = mk.decor.find((d) => d.fx === 'fountain')
    expect(Math.hypot(f.position[0], f.position[2])).toBeLessThan(6)
  })

  it('has shopkeepers who stay at their counters and shoppers who walk a route', () => {
    const keepers = mk.neighbours.filter((n) => n.stroll === 0)
    const shoppers = mk.neighbours.filter((n) => n.route)
    expect(keepers.length).toBeGreaterThanOrEqual(5)
    expect(shoppers.length).toBeGreaterThanOrEqual(3)
    for (const k of keepers) expect(typeof k.facing).toBe('number')
    for (const s of shoppers) expect(s.route.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps every person and every shopper stop in bounds and out of the gates', () => {
    for (const n of mk.neighbours) {
      expect(CHARACTERS).toContain(n.character)
      if (n.pet) expect(PETS).toContain(n.pet)
      for (const [x, z] of n.route || [at(n)]) {
        expect(Math.abs(x)).toBeLessThan(WORLD.bounds - 1)
        expect(Math.abs(z)).toBeLessThan(WORLD.bounds - 1)
        for (const g of mk.gates) expect(Math.hypot(x - g.position[0], z - g.position[2])).toBeGreaterThan(4)
      }
    }
    expect(new Set(mk.neighbours.map((n) => n.character)).size).toBe(mk.neighbours.length)
  })

  it('keeps the spawn and gates clear of props', () => {
    for (const p of mk.decor) {
      const [x, , z] = p.position
      expect(Math.hypot(x, z), `${p.fx || p.name} on spawn`).toBeGreaterThan(2.4)
      for (const g of mk.gates) expect(Math.hypot(x - g.position[0], z - g.position[2]), `${p.fx || p.name} in a gate`).toBeGreaterThan(3)
    }
  })

  it("never routes a shopper through the fountain, a stall, a keeper, a planter, a crate or a cart", () => {
    const segDist = ([ax, az], [bx, bz], [px, pz]) => {
      const dx = bx - ax, dz = bz - az
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)))
      return Math.hypot(ax + dx * t - px, az + dz * t - pz)
    }
    const CLEAR = { fountain: 2.1, awning: 1.05 } // the rest (planters, crates, carts, keepers): 0.9
    const solid = [
      ...mk.decor.filter((d) => ['fountain', 'planter', 'crate', 'awning'].includes(d.fx) || d.name === 'shopping-cart')
        .map((d) => [d.fx || d.name, d.position[0], d.position[2]]),
      ...mk.neighbours.filter((n) => n.stroll === 0).map((n) => ['keeper', n.home[0], n.home[1]]),
    ]
    for (const n of mk.neighbours.filter((n) => n.route)) {
      n.route.forEach((a, i) => {
        const b = n.route[(i + 1) % n.route.length]
        for (const [kind, x, z] of solid) {
          expect(segDist(a, b, [x, z]), `${n.character} walks through ${kind} at ${x},${z}`).toBeGreaterThan(CLEAR[kind] ?? 0.9)
        }
      })
    }
  })

  it('keeps public-safe copy', () => {
    const text = mk.neighbours.flatMap((n) => n.lines).join(' ')
    expect(text).not.toMatch(/\b(Ivy|Amy|Finn|Oscar|Nathan|Mum)\b/)
  })
})
