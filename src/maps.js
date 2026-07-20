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

export const MAPS = {
  // ── Map 1 — the original forest clearing ──
  clearing: {
    id: 'clearing',
    name: 'Forest Clearing',
    ground: '#c7e6b8',
    outside: '#aec49e',
    sky: '#eae6f7',
    gateColor: '#5fbf63', // what gates leading HERE glow like
    decor: [
      f('tree-high', -6, -5, 0.4),
      f('tree', 7, -4.5, -0.8),
      f('tree-high', 10, 3, 1.2),
      f('tree', -9, 4, 2.1),
      f('tree', 4, 9, 0.3),
      f('rocks-high', 5.5, 5.5, 0.6),
      f('rocks-low', -5, 7, -0.4),
      f('stones', -3.5, 5.5, 0),
      f('plant', 3, -5.5, 0),
      f('plant', -4.5, -3.5, 1),
      f('flag', 8.5, -8, 0),
      f('tent', -9, -8, 0.5),
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

/** Preload every model a map uses (called for the current map at startup,
 *  and lazily for the rest so travel never pops in raw). */
export function preloadMap(map) {
  const seen = new Set()
  for (const d of map.decor) seen.add(modelUrl(d.pack, d.name))
  seen.add(modelUrl('building', 'column'))
  for (const url of seen) useGLTF.preload(url)
}
