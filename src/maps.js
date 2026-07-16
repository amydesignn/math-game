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

const b = (name, x, z, rotation = 0, scale = BS) => ({
  pack: 'building', name, position: [x, 0, z], rotation, scale,
})
const f = (name, x, z, rotation = 0, scale = 1) => ({
  pack: 'forest', name, position: [x, 0, z], rotation, scale,
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
    gates: [{ to: 'town', position: [16, 0, 2] }],
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
    gates: [{ to: 'town', position: [-16, 0, -3] }],
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
