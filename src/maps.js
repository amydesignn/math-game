// maps.js — the world registry. Each map = same game, different place:
// its own ground colors, its own scenery (any pack mix), and gates that lead
// to other maps. Adding a map = adding an entry here (+ its models in
// public/models/<pack>/ — each pack keeps its own Textures/, see CLAUDE.md).
//
// Gates are discovered by walking: a gate glows in the color of the map it
// leads to, and walking into it travels there.

import { useGLTF } from '@react-three/drei'
import { modelUrl } from './config'

// Building-kit pieces are authored on a 2-unit grid, 2.4 tall — at full size a
// wall towers ~3× over the mini characters. 0.8 keeps houses cozy (~2.5×).
const BS = 0.8
const CELL = BS // half of a (scaled) 2-unit cell — wall offset from house centre

// Mini-market / mini-arcade are designed 1:1 with the mini characters (their
// packs ship the same chibi people) — scale 1, don't "correct" toward
// real-world proportions or machines tower over her.
const MS = 1

const b = (name, x, z, rotation = 0, scale = BS) => ({
  pack: 'building', name, position: [x, 0, z], rotation, scale,
})
const f = (name, x, z, rotation = 0, scale = 1) => ({
  pack: 'forest', name, position: [x, 0, z], rotation, scale,
})
const m = (name, x, z, rotation = 0, scale = MS) => ({
  pack: 'market', name, position: [x, 0, z], rotation, scale,
})
const a = (name, x, z, rotation = 0, scale = MS) => ({
  pack: 'arcade', name, position: [x, 0, z], rotation, scale,
})

/** A one-cell house: four walls + flat roof. `door` picks the doorway side. */
function house(cx, cz, { door = 'e', windows = 'square' } = {}) {
  const win = `wall-window-${windows}`
  const pick = (side, fallback) => (door === side ? 'wall-doorway-round' : fallback)
  return [
    b(pick('w', win), cx - CELL, cz, 0),
    b(pick('e', win), cx + CELL, cz, Math.PI),
    b(pick('n', 'wall'), cx, cz - CELL, Math.PI / 2),
    b(pick('s', 'wall'), cx, cz + CELL, -Math.PI / 2),
    { pack: 'building', name: 'roof-flat-square', position: [cx, 2.4 * BS, cz], rotation: 0, scale: BS },
  ]
}

/** An open pavilion: four columns holding a flat roof. */
function pavilion(cx, cz) {
  const c = CELL * 0.95
  return [
    b('column', cx - c, cz - c), b('column', cx + c, cz - c),
    b('column', cx - c, cz + c), b('column', cx + c, cz + c),
    { pack: 'building', name: 'roof-flat-square', position: [cx, 2.4 * BS, cz], rotation: 0, scale: BS },
  ]
}

// Stable pseudo-random in [0,1) — scenery must land in the same spot every
// load (and for every player), so jitter comes from the index, not Math.random.
const jitter = (i, k = 0) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return v - Math.floor(v)
}

/** A forest edge: two loose rows of trees just inside the map boundary, with
 *  openings where gates sit. `gaps` = gate positions [x, z] to keep clear. */
function treeLine({ gaps = [], step = 2.3 } = {}) {
  const out = []
  let i = 0
  for (const [inset, kind] of [[16.6, 'tree-high'], [14.6, 'tree']]) {
    const span = inset
    for (let t = -span; t <= span; t += step) {
      for (const [x, z] of [[t, -inset], [t, inset], [-inset, t], [inset, t]]) {
        i++
        const jx = x + (jitter(i, 1) - 0.5) * 1.2
        const jz = z + (jitter(i, 2) - 0.5) * 1.2
        if (gaps.some(([gx, gz]) => Math.hypot(jx - gx, jz - gz) < 4.2)) continue
        if (kind === 'tree' && jitter(i, 3) < 0.35) continue // inner row is patchy
        out.push(f(jitter(i, 4) < 0.3 ? 'tree' : kind, jx, jz, jitter(i, 5) * Math.PI * 2, 0.9 + jitter(i, 6) * 0.45))
      }
    }
  }
  return out
}

/** A footpath through `points` ([x, z] waypoints): small patch-dirt
 *  stepping stones with gaps between, so it guides without walling off. */
function trail(points, { step = 1.15, width = 0.62 } = {}) {
  const out = []
  let i = 0
  for (let p = 0; p < points.length - 1; p++) {
    const [ax, az] = points[p]
    const [bx, bz] = points[p + 1]
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / step))
    for (let s = 0; s < n; s++) {
      const u = s / n
      i++
      out.push(f('patch-dirt', ax + (bx - ax) * u, az + (bz - az) * u, Math.floor(jitter(i, 7) * 4) * (Math.PI / 2), width))
    }
  }
  return out
}

export const MAPS = {
  // ── Map 1 — the forest clearing: a campsite in a glade ──
  // Laid out as a place, not a scatter (Ivy's feedback): a tree line frames the
  // edge, a dirt trail runs gate → camp → gate, and four spots sit off it —
  // the campsite straight ahead of spawn, the lookout, the archery range and
  // the rocky knoll. The open meadow between them is where sparkles and
  // stations land (both keep ~2 units clear of decor).
  clearing: {
    id: 'clearing',
    name: 'Forest Clearing',
    ground: '#c7e6b8',
    outside: '#aec49e',
    sky: '#eae6f7',
    gateColor: '#5fbf63', // what gates leading HERE glow like
    decor: [
      ...treeLine({ gaps: [[-16, 2], [16, 2]] }),
      ...trail([[-15, 2], [-10, 2.6], [-5, 1.6], [0, 1.4], [5, 1.8], [10, 2.8], [15, 2]]),
      ...trail([[0, 1.4], [0.4, -1.4], [0, -4]]), // spur up to the camp

      // campsite — straight ahead of spawn, the first thing she sees
      f('stones', 0, -6, 0.3, 1.2), // the fire ring
      f('tent', -2.6, -7.4, 0.7, 1.4),
      f('tent', 2.6, -7.6, -0.7, 1.4),
      f('flag', 0.2, -9.2, 0, 1.6),
      f('fence', -3.8, -9.6, 0.3), f('fence', -2.7, -9.9, 0.1),
      f('fence', 2.7, -10, -0.1), f('fence', 3.8, -9.7, -0.3),
      f('plant', -4.5, -6.4, 0.4), f('plant', 4.6, -6.7, 2.1),

      // lookout — a little tower on the trail's north side, east
      f('building-structure', 9, -7, 0, 1.6),
      { pack: 'forest', name: 'building-roof', position: [9, 1.6, -7], rotation: 0, scale: 1.6 },
      f('ladder', 9, -6.1, 0, 1.6),
      f('patch-grass', 7.6, -5.6, 0.8), f('plant', 10.4, -5.8, 1.4),

      // archery range — south-west: targets in a row, an archer practising
      f('target', -12, 9.6, 0, 1.8), f('target', -9.5, 9.8, 0, 1.8), f('target', -7, 9.6, 0, 1.8),
      f('fence', -12.9, 11, 0, 1.3), f('fence', -11.5, 11, 0, 1.3), f('fence', -10.1, 11, 0, 1.3),
      f('fence', -8.7, 11, 0, 1.3), f('fence', -7.3, 11, 0, 1.3), f('fence', -5.9, 11, 0, 1.3),
      f('character-archer', -9.2, 6.6, Math.PI, 1.4),
      f('plant', -13.2, 7.4, 0.6), f('plant', -5.6, 8.2, 2.3),

      // rocky knoll — south-east, a lump of rock with a flag on top
      f('rocks-high', 10, 9.2, 0.4, 1.6),
      f('rocks-low', 8.6, 8.4, 1.2, 1.1),
      f('stones', 7.8, 10, 0.9), f('stones', 11.8, 8, 2.2, 0.8),
      { pack: 'forest', name: 'flag', position: [10, 0.8, 9.2], rotation: 0.6, scale: 1.4 },
      f('patch-grass', 11.6, 10.4, 1.3),

      // a small grove north-west — balances the lookout across the camp
      f('tree-high', -9.4, -7.2, 0.3, 1.2), f('tree', -10.8, -5.6, 1.7, 1.1),
      f('tree', -8, -5.4, 2.9), f('patch-grass', -9.2, -4.6, 0.4), f('plant', -7.6, -6.6, 1.2),

      // meadow flowers along the trail, in little clumps
      f('plant', -6, 3.6, 0.2), f('plant', -5.4, 4.1, 1.9, 0.8), f('patch-grass', -6.4, 4.4, 1),
      f('plant', 5.6, -0.4, 2.6), f('plant', 6.3, -0.1, 0.5, 0.9),
      f('plant', 3.2, 5.6, 1.1), f('patch-grass', 2.6, 6, 0.3),
      f('patch-grass', -4, -3.8, 2.2), f('plant', -3.5, -4.3, 0.9),
    ],
    gates: [
      { to: 'town', position: [16, 0, 2] },
      { to: 'arcade', position: [-16, 0, 2] },
    ],
  },

  // ── Map 2 — a little town on warm orange ground ──
  town: {
    id: 'town',
    name: 'Sunny Town',
    ground: '#f9d9a8',
    outside: '#ddba85',
    sky: '#fdeedd',
    gateColor: '#f0a03c',
    decor: [
      ...house(-7, -6, { door: 'e' }),
      ...house(7, -7, { door: 'w', windows: 'round' }),
      ...house(-8, 6, { door: 'n', windows: 'round' }),
      ...house(8, 6.5, { door: 'w' }),
      ...pavilion(0, -9),
      b('stairs-open-short', 3.2, -9, -Math.PI / 2),
      // market corner
      b('barricade-window-a', 3, 3.2, 0.3),
      b('barricade-doorway-a', -3.2, 3.6, -0.5),
      // fence run along the south path
      b('border', -1.6, 10, Math.PI / 2),
      b('border', 0, 10, Math.PI / 2),
      b('border', 1.6, 10, Math.PI / 2),
      // lamppost-ish columns marking the square
      b('column-thin', 11.5, -1.5),
      b('column-thin', -11.5, -1.5),
      // ground interest borrowed from the forest pack
      f('patch-dirt', 0, 4.5, 0.8),
      f('stones', -5.5, 0.5, 0.4),
      f('plant', 10.5, 1.5, 1.7),
    ],
    gates: [
      { to: 'clearing', position: [-16, 0, 2] },
      { to: 'garden', position: [16, 0, -3] },
    ],
  },

  // ── Map 3 — a rosy ruin garden on pink ground ──
  garden: {
    id: 'garden',
    name: 'Rosy Garden',
    ground: '#fad4e6', // bright enough that it still reads pink under the scene lighting
    outside: '#d8abc4',
    sky: '#fbe9f3',
    gateColor: '#ef7fb5',
    decor: [
      ...pavilion(0, -8),
      // ruined colonnade wandering the west side
      b('column', -7, -4, 0.2),
      b('column', -8.5, -1, -0.3),
      b('column-thin', -6.5, 2, 0.5),
      b('column', -8, 5, 0),
      // flower beds: border edging + plants inside
      b('border', 5, -3.2, Math.PI / 2),
      b('border', 5, -0.8, Math.PI / 2),
      f('plant', 4.4, -2, 0.4, 1.1),
      f('plant', 5.7, -2.1, 1.9, 0.9),
      b('border', 9.5, 3.8, Math.PI / 2),
      b('border', 9.5, 6.2, Math.PI / 2),
      f('plant', 9, 5, 2.6),
      f('plant', 10.1, 5.1, 0.9, 1.15),
      // soft forest touches
      f('patch-grass', -3, 6, 0.7),
      f('patch-grass', 3.5, 8.5, 2.2),
      f('stones', -4.5, -1.5, 1.1),
      f('rocks-low', 8, -7.5, 0.9),
      f('plant', -2.5, -4.5, 1.4),
      f('plant', 1.5, 5.5, 0.2),
    ],
    gates: [
      { to: 'town', position: [-16, 0, -3] },
      { to: 'market', position: [16, 0, 3] },
    ],
  },

  // ── Map 4 — an open-air market on sunny yellow ground ──
  market: {
    id: 'market',
    name: 'Merry Market',
    ground: '#fdf0b8', // extra-bright — the lilac ground-light drags yellow toward dijon
    outside: '#dcc98c',
    sky: '#fdf6e3',
    gateColor: '#f2c530',
    decor: [
      // front stalls — fruit + bread facing the spawn
      m('display-fruit', -2.4, -5, Math.PI),
      m('display-fruit', -1.2, -5, Math.PI),
      m('display-bread', 1.2, -5, Math.PI),
      m('display-bread', 2.4, -5, Math.PI),
      // a continuous aisle of shelves behind the stalls (0.8 = touching)
      m('shelf-boxes', -2.4, -8), m('shelf-bags', -1.6, -8),
      m('shelf-boxes', -0.8, -8), m('shelf-end', 0, -8),
      // frozen corner
      m('freezer', 6.5, -3, -Math.PI / 2),
      m('freezers-standing', 6.5, -5, -Math.PI / 2),
      // checkout
      m('cash-register', -5.5, -2, 0.5),
      m('bottle-return', -7, -4.5, Math.PI / 2),
      // strays — carts and a basket someone left around the square
      m('shopping-cart', 4.5, 1.5, 2.4),
      m('shopping-cart', -4, 4, -0.7),
      m('shopping-basket', 1, 3, 0),
      // entrance framing + a bit of green
      m('fence', -1.2, 7), m('fence-door-rotate', 0, 7), m('fence', 1.2, 7),
      m('column', -8, 6), m('column', 8, 6),
      f('plant', 10, -8, 0.8),
      f('patch-grass', -8, 8.5, 1.9),
      f('plant', -10.5, 0, 2.4),
    ],
    gates: [
      { to: 'garden', position: [-16, 0, 3] },
      { to: 'arcade', position: [16, 0, -2] },
    ],
  },

  // ── Map 5 — a games arcade on violet ground ──
  arcade: {
    id: 'arcade',
    name: 'Star Arcade',
    ground: '#ddcef6',
    outside: '#b4a3d8',
    sky: '#efe8fb',
    gateColor: '#8f6fe8',
    decor: [
      // a row of arcade cabinets, screens facing the spawn
      a('arcade-machine', -2.9, -5.5, Math.PI),
      a('arcade-machine', -2.2, -5.5, Math.PI),
      a('arcade-machine', -1.5, -5.5, Math.PI),
      a('arcade-machine', -0.8, -5.5, Math.PI),
      // the big machines get their own spots
      a('dance-machine', 3.5, -4.5, Math.PI + 0.4),
      a('claw-machine', -6, -3.5, 0.9),
      a('air-hockey', 2.5, 0.5, 0.3),
      a('pinball', -5, 1.5, Math.PI / 2),
      a('pinball', -5, 2.6, Math.PI / 2),
      a('basketball-game', 6, 2.5, -Math.PI / 2),
      // prize corner
      a('prize-wheel', 1.2, 6.5, Math.PI),
      a('prizes', 2.8, 6.8, Math.PI),
      a('ticket-machine', -0.6, 6.8, Math.PI),
      // snacks + pillars
      a('vending-machine', -7, 6, Math.PI / 2),
      a('column', -9.5, -1), a('column', 9.5, -1),
    ],
    gates: [
      { to: 'market', position: [-16, 0, -2] },
      { to: 'clearing', position: [16, 0, 2] },
    ],
  },

  // ── The Meadow — the Together Space (Phase B, docs/together-space.md) ──
  // OUTSIDE the ring on purpose: no gates lead here and none lead away — you
  // arrive by the 💞 button (mutual agreement made in the living room, not in
  // the app) and go home the same way. `together: true` switches the rules:
  // no sparkles, no stations, no shop, no placement — presence + emotes only,
  // and NOTHING here is ever persisted (the session is the room).
  meadow: {
    id: 'meadow',
    name: 'The Meadow',
    together: true,
    ground: '#e7dcf7', // soft lavender — its own colour, not one of the ring's
    outside: '#c3b3e0',
    sky: '#f5effc',
    gateColor: '#b48fe0', // unused (no gates lead here) — registry-consistent
    decor: [
      // a loose tree ring, open in the middle where the two of them meet
      f('tree-high', -9, -7, 0.5),
      f('tree', 8, -8, -0.6),
      f('tree', -11, 3, 1.8),
      f('tree-high', 10, 5, 0.9),
      f('tree', -4, 10, 2.4),
      f('tree', 5, 10.5, 0.1),
      // flowers and soft ground
      f('plant', -3, -4, 0.4, 1.1),
      f('plant', 3.5, -3.5, 1.7),
      f('plant', -5.5, 3, 2.2, 0.9),
      f('plant', 6, 2.5, 0.8),
      f('patch-grass', 0, -6, 1.2),
      f('patch-grass', -7, -1, 0.3),
      f('patch-grass', 7.5, -1.5, 2.0),
      f('stones', 0, 6.5, 0.7),
      f('flag', 11, -3, 0), // a little landmark to wander to
    ],
    gates: [],
  },
}

/** Where to stand after arriving in `map` from `fromId`: just inside the
 *  reciprocal gate, pulled toward the centre so the gate doesn't re-trigger. */
export function arrivalPoint(map, fromId) {
  const gate = map.gates.find((g) => g.to === fromId)
  if (!gate) return [0, 0]
  const [x, , z] = gate.position
  const len = Math.hypot(x, z) || 1
  const pull = 2.4 / len
  return [x * (1 - pull), z * (1 - pull)]
}

/** Where to drop her on Resume: her saved spot, eased clear of any gate so she
 *  doesn't instantly trigger travel back out. `pos` is a place she legally stood
 *  (always in-bounds); if it happens to sit inside a gate's trigger radius (she
 *  closed the app right at a gate edge), ease toward the centre — always safe
 *  and in-bounds — until clear. No saved spot yet → the centre. */
export function resumePoint(map, pos) {
  if (!pos) return [0, 0]
  let { x, z } = pos
  const nearGate = map.gates.some((g) => Math.hypot(x - g.position[0], z - g.position[2]) < 2.4)
  if (nearGate) {
    const len = Math.hypot(x, z) || 1
    const pull = Math.min(1, 3 / len) // up to 3 units inward — clears the 1.7 gate trigger with margin
    x *= 1 - pull
    z *= 1 - pull
  }
  return [x, z]
}

/** Preload every model a map uses (called for the current map at startup,
 *  and lazily for the rest so travel never pops in raw). */
export function preloadMap(map) {
  const seen = new Set()
  for (const d of map.decor) seen.add(modelUrl(d.pack, d.name))
  seen.add(modelUrl('building', 'column'))
  for (const url of seen) useGLTF.preload(url)
}
