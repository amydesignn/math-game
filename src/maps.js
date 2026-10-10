// maps.js — the world registry. Each map = same game, different place:
// its own ground colors, its own scenery (any pack mix), and gates that lead
// to other maps. Adding a map = adding an entry here (+ its models in
// public/models/<pack>/ — each pack keeps its own Textures/, see CLAUDE.md).
//
// Gates are discovered by walking: a gate glows in the color of the map it
// leads to, and walking into it travels there.

import { useGLTF } from '@react-three/drei'
import { modelUrl } from './config'
import { currentSeason } from './season'

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
// a procedural Halloween prop (world/Spooky.jsx) — `fx` instead of a GLB name
const sp = (fx, x, z, rotation = 0, scale = 1, extra = {}) => ({
  fx, position: [x, 0, z], rotation, scale, ...extra,
})

// (house() — the one-cell building-kit house — retired with the old Sunny
// Town 2026-10-06; it's in git history if a map wants houses again.)

/** An open pavilion: four columns holding a flat roof. `k` scales it up. */
function pavilion(cx, cz, k = 1) {
  const c = CELL * 0.95 * k
  const s = BS * k
  return [
    b('column', cx - c, cz - c, 0, s), b('column', cx + c, cz - c, 0, s),
    b('column', cx - c, cz + c, 0, s), b('column', cx + c, cz + c, 0, s),
    { pack: 'building', name: 'roof-flat-square', position: [cx, 2.4 * s, cz], rotation: 0, scale: s },
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
function treeLine({ gaps = [], step = 2.3, inner = true } = {}) {
  const out = []
  let i = 0
  const rows = inner ? [[16.6, 'tree-high'], [14.6, 'tree']] : [[16.6, 'tree-high']]
  for (const [inset, kind] of rows) {
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

/** A square flower bed: two L-shaped stone borders closing a frame, three
 *  plants inside, and (with `roses`) two rose bushes in that colour.
 *  `k` scales the whole bed. */
function flowerBed(cx, cz, k = 1, roses) {
  return [
    ...(roses ? [
      sp('rosebush', cx + 0.4 * k, cz - 0.4 * k, 0.3, 0.9 * k, { color: roses }),
      sp('rosebush', cx - 0.45 * k, cz + 0.35 * k, 1.9, 0.8 * k, { color: roses }),
    ] : []),
    b('border-corner', cx, cz, 0, BS * k),
    b('border-corner', cx, cz, Math.PI, BS * k),
    f('plant', cx - 0.35 * k, cz - 0.3 * k, 0.4, 1.2 * k),
    f('plant', cx + 0.4 * k, cz + 0.1 * k, 2.1, 1.1 * k),
    f('plant', cx - 0.1 * k, cz + 0.45 * k, 1.3, 1 * k),
  ]
}

/** A market stall: a striped canopy over its goods, front facing +z (the
 *  follow-cam's side). `goods` are placed props; the keeper is a neighbour
 *  listed with the map. */
function stall(cx, cz, color, goods) {
  return [sp('awning', cx, cz, 0, 1, { color }), ...goods]
}

// ── Map 5 — a games arcade on violet ground ──
const ARCADE = {
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
}

// ── 🎃 Halloween: the Star Arcade turns spooky (season.js: Oct 1 → Nov 2) ──
// Amy's ask (2026-10-06): floating fire + cute ghosts. Everything is ADDED on
// top of the arcade (the machines stay — it's the arcade's Halloween party, not
// a different map), dusk lighting, and the gate glow stays violet: the colour is
// the signpost and must not change with the season. Props are procedural
// (world/Spooky.jsx — no Kenney Halloween pack is staged).
const ARCADE_HALLOWEEN = {
  name: 'Spooky Arcade',
  ground: '#b3a2e0',
  outside: '#6e5a9e',
  sky: '#2f2452',
  light: { hemi: ['#d8c8ff', '#4b3a78', 0.85], dir: ['#ffd6a8', 0.75] },
  card: { name: 'Spooky Arcade', blurb: 'Pumpkins, ghosts & glowing lights', art: 'arcade-halloween.jpg' },
  decor: [
    // the bubbling cauldron, straight ahead of spawn — the first thing she sees
    sp('cauldron', 0, -2.8),
    sp('pumpkin', -1.9, -1.4, 0.3, 0.8), sp('pumpkin', 2, -2.2, -0.4, 0.7, { carved: false }),

    // fire-basket torches light the way gate → gate
    sp('torch', -13, -4.2), sp('torch', -13, 0.2),
    sp('torch', 13, -0.2), sp('torch', 13, 4.2),
    sp('torch', -9, -4.6), sp('torch', 9, 4.6),

    // jack-o'-lanterns among the machines
    sp('pumpkin', -3.8, -6.3, 0.2, 0.9), sp('pumpkin', 0.2, -6.4, -0.2, 0.75),
    sp('pumpkin', 4.4, 7.3, -0.3, 0.9), sp('pumpkin', -1.9, 7.5, 0.4, 0.8, { carved: false }),

    // the pumpkin patch (south-east)
    f('patch-dirt', 11, 9, 0.3, 1.8), f('patch-dirt', 12.6, 10.6, 1.4, 1.5),
    sp('pumpkin', 10, 8.4, 0.2, 1.1), sp('pumpkin', 11.6, 8.1, -0.5, 0.9, { carved: false }),
    sp('pumpkin', 13, 9, -0.3, 1.3), sp('pumpkin', 10.6, 10, 0.8, 0.8, { carved: false }),
    sp('pumpkin', 12.2, 10.8, 0, 1), sp('pumpkin', 13.8, 11.6, 0.5, 0.7, { carved: false }),
    sp('pumpkin', 9.6, 11.4, -0.2, 0.9),
    f('plant', 11, 9.4, 0.4), f('plant', 12.8, 8.2, 2.2, 0.9),

    // the boo-yard (north-west): friendly little headstones + candles
    sp('grave', -13, -11, 0.2), sp('grave', -11.2, -11.5, 0, 1, { variant: 1 }),
    sp('grave', -9.4, -11, -0.2), sp('grave', -12.2, -8.4, 0.1, 0.9, { variant: 1 }),
    sp('grave', -10, -8.2, -0.1, 0.85),
    sp('candle', -12.1, -10.1), sp('candle', -10.3, -10, 0, 1, { height: 0.5 }),
    sp('candle', -8.6, -9.4, 0, 1, { height: 0.25 }),
    sp('pumpkin', -13.9, -8.2, 0.6, 1),

    // north-east: a pumpkin pile with candles
    sp('pumpkin', 10.5, -9.4, 0.1, 1.4), sp('pumpkin', 12, -8.6, -0.5, 0.9),
    sp('pumpkin', 11.2, -10.8, 0.3, 0.8, { carved: false }),
    sp('candle', 9.4, -8.4), sp('candle', 9.8, -7.9, 0, 1, { height: 0.5 }), sp('candle', 12.7, -9.9, 0, 1, { height: 0.25 }),

    // south-west, by the vending machine
    sp('pumpkin', -12, 9, 0.4, 1.2), sp('pumpkin', -10.4, 10.3, -0.2, 0.9, { carved: false }),
    sp('torch', -9.5, 8.6),
  ],
  // things that MOVE — float above head height, never block a tap
  ambient: [
    { kind: 'ghost', center: [-11.2, -9.8], radius: 2.2, speed: 0.35, phase: 0 },
    { kind: 'ghost', center: [0, -2.8], radius: 3.8, speed: 0.22, phase: 2, height: 1.6 },
    { kind: 'ghost', center: [1.2, 6.8], radius: 2.6, speed: 0.3, phase: 4 },
    { kind: 'ghost', center: [11.5, 9.5], radius: 2.4, speed: 0.28, phase: 1, scale: 0.8 },
    { kind: 'ghost', center: [0, 0], radius: 10, speed: 0.07, phase: 3, height: 2, scale: 1.2 },
    { kind: 'wisp', center: [-6, -8], color: 'violet', phase: 0 },
    { kind: 'wisp', center: [6, -9], color: 'orange', phase: 1.5, height: 1.9 },
    { kind: 'wisp', center: [-11, -2], color: 'mint', phase: 3 },
    { kind: 'wisp', center: [10, -3], color: 'violet', phase: 4.5, height: 2.1 },
    { kind: 'wisp', center: [-6, 10], color: 'orange', phase: 2 },
    { kind: 'wisp', center: [6, 11], color: 'mint', phase: 5, height: 1.4 },
    { kind: 'wisp', center: [-3, 3], color: 'violet', phase: 1, radius: 1.6, height: 2.2 },
    { kind: 'wisp', center: [12, 6], color: 'orange', phase: 3.7 },
    { kind: 'wisp', center: [-13, 5], color: 'violet', phase: 2.6, height: 1.8 },
    { kind: 'wisp', center: [3, -12], color: 'mint', phase: 0.8 },
  ],
}

/** The arcade as it should look today: Halloween dressing layered on top in
 *  season (decor APPENDED, never replaced), the plain arcade otherwise. */
function withSeason(base, season = currentSeason()) {
  if (season !== 'halloween') return base
  return { ...base, ...ARCADE_HALLOWEEN, decor: [...base.decor, ...ARCADE_HALLOWEEN.decor] }
}
export { withSeason as _arcadeWithSeason, ARCADE as _arcadeBase }

export const MAPS = {
  // ── Map 1 — the forest clearing: a campsite in a glade ──
  // Laid out as a place, not a scatter (Ivy's feedback): a tree line frames the
  // edge, a dirt trail runs gate → camp → gate, and four spots sit off it —
  // the campsite straight ahead of spawn, the lookout, the archery range and
  // the rocky knoll. The open meadow between them is where sparkles and
  // stations land (both keep ~2 units clear of decor).
  // People (2026-10-06, Ivy: "people there too"): two campers on logs at a
  // crackling fire, a real archer at the range, a hiker + dog on the trail, a
  // forager filling a basket in the grove, someone at the lookout.
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
      sp('campfire', 0, -6, 0, 1.3), // crackling, in its own ring of stones
      sp('logseat', -1.55, -6, Math.PI / 2), sp('logseat', 1.55, -6, Math.PI / 2),
      sp('woodpile', -4.4, -8.4, 0.3), sp('woodpile', 4.6, -8.6, -0.2, 0.8),
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
      { pack: 'forest', name: 'weapon-arrow', position: [-9.5, 0.75, 9.55], rotation: Math.PI / 2, scale: 1.2 },
      { pack: 'forest', name: 'weapon-arrow', position: [-12.1, 0.62, 9.45], rotation: Math.PI / 2, scale: 1.2 },
      f('weapon-bow', -13, 7, 0.4, 1.1), // a spare bow by the range
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
    neighbours: [
      // campers on the logs, warming their hands at the fire
      { character: 'character-female-b', home: [-1.55, -6], stroll: 0, facing: Math.PI / 2, pose: 'sit', seat: 0.27,
        lines: ['Want a marshmallow? 🔥', 'Shh… listen to the owls 🦉', 'We sleep in the tents tonight!'] },
      { character: 'character-male-b', home: [1.55, -6], stroll: 0, facing: -Math.PI / 2, pose: 'sit', seat: 0.27,
        lines: ['The fire is so cosy', 'I can see the first star! ⭐', 'Have you been to the lookout?'] },
      // the archer, bow up, facing the targets
      { character: 'character-male-d', home: [-9.4, 6.6], stroll: 0, facing: 0, pose: 'holding-both-shoot', carry: 'bow',
        lines: ['Bullseye! 🎯 …almost', 'Practice makes perfect!', 'Stand behind me, please!'] },
      // someone at the foot of the lookout
      { character: 'character-male-f', home: [10.4, -5.4], stroll: 0, facing: 0,
        lines: ['I climbed up there this morning!', 'You can see the whole forest 🌲', 'Mind the ladder!'] },
      // a hiker + dog on the trail, stopping at the fire on the way
      { character: 'character-female-d', pet: 'animal-dog',
        route: [[-10, 3.4, undefined, { wait: 2000 }], [-5, 2.4], [-0.9, 2.2], [-0.6, -3.7, Math.PI, { wait: 4000 }], [0.9, 2.2], [5, 2.6], [10, 3.6, undefined, { wait: 2000 }], [5, 2.6], [0.9, 2.2], [-0.9, 2.2], [-5, 2.4]],
        lines: ['The trail goes all the way round!', 'My dog found a stick 🐕', 'Hello, fellow explorer!'] },
      // a forager with a basket, picking in the grove and dropping off at camp
      { character: 'character-female-f', pet: 'animal-bunny', carry: 'basket',
        route: [[-6.6, -3.6], [-6.8, -6.2, -2, { do: 'pick-up', ms: 2600, wait: 3000 }], [-6.6, -3.6], [-9.2, -3.6, Math.PI, { do: 'pick-up', ms: 2600, wait: 3000 }], [-6.6, -3.6], [-5, -7.2, 2.7, { wait: 2500 }]],
        lines: ['Found a mushroom! 🍄', 'Berries for the campfire', 'The forest has so many treasures'] },
    ],
    gates: [
      { to: 'town', position: [16, 0, 2] },
      { to: 'arcade', position: [-16, 0, 2] },
    ],
  },

  // ── Map 2 — Sunny Town: an open plot for HER to build, and neighbours ──
  // Rebuilt 2026-10-06 (Amy + Ivy): the pre-made houses are gone — the town is
  // a ring of shade trees around a wide open square, deliberately almost empty,
  // because this is the map where kids BUILD (shop → place). Ivy's ask: "why is
  // there no friendly face?" → four neighbours live here (world/Neighbour.jsx),
  // each with a cube pet, strolling near home and saying hello when she comes
  // by. Homes sit out in the four quarters so the middle stays hers to fill.
  town: {
    id: 'town',
    name: 'Sunny Town',
    ground: '#f9d9a8',
    outside: '#ddba85',
    sky: '#fdeedd',
    gateColor: '#f0a03c',
    decor: [
      ...treeLine({ gaps: [[-16, 2], [16, -3]], step: 2.6, inner: false }),
      // a few shade trees in the corners — the square itself stays open
      f('tree', -12.6, -12, 0.4, 1.2), f('tree-high', -11, -13.2, 1.9, 1.1),
      f('tree', 12.4, -12.4, 2.6, 1.15),
      f('tree', -12.8, 12.2, 1.2, 1.1),
      f('tree-high', 12.2, 12.6, 0.2, 1.15), f('tree', 10.8, 13.4, 2.2),
    ],
    neighbours: [
      { character: 'character-female-b', pet: 'animal-bunny', home: [-7, -7],
        lines: ["Hi! I'm Mia 👋", 'This town needs a bakery!', 'Ooh, is that your pet?', 'Come back soon!'] },
      { character: 'character-male-c', pet: 'animal-dog', home: [8, -6.5],
        lines: ["Hey neighbour! I'm Leo", 'Could you build a park here?', 'Nice to see you again!', 'Gems make great houses 💎'] },
      { character: 'character-female-d', pet: 'animal-chick', home: [-8, 7.5],
        lines: ["Hello! I'm Sam 🌳", 'I love these big trees', 'What will you build today?', 'Your pet is so cute!'] },
      { character: 'character-male-e', pet: 'animal-panda', home: [7.5, 7.5],
        lines: ['Welcome to Sunny Town! ☀️', "I'm Max — I live here!", 'Maths makes gems ✨', 'Build something next to me!'] },
    ],
    gates: [
      { to: 'clearing', position: [-16, 0, 2] },
      { to: 'garden', position: [16, 0, -3] },
    ],
  },

  // ── Map 3 — the rosy garden: a working garden, dense + alive ──
  // First laid out LIGHT (~50 props, the twin of the dense Clearing); Ivy
  // picked dense, and asked for people (2026-10-06). Amy: "a shed, and people
  // getting in and out of it to take tools — working on their garden." So:
  // the gazebo on the axis ahead of spawn (with a tea party in it), the
  // stepping-stone walk gate → centre → gate under two rose arches, four
  // flower beds, a shed + veg patch in the north-east corner, a lily pond in
  // the south-west, hedges and a tree line round the edge. Gardeners walk
  // shed → beds → shed (in through the door, out with a tool, back to put it
  // away); routes are checked against every solid prop in season-maps.test.js.
  garden: {
    id: 'garden',
    name: 'Rosy Garden',
    ground: '#fad4e6', // bright enough that it still reads pink under the scene lighting
    outside: '#d8abc4',
    sky: '#fbe9f3',
    gateColor: '#ef7fb5',
    decor: [
      ...treeLine({ gaps: [[-16, -3], [16, 3]], step: 2.5, inner: false }),

      // the gazebo, straight ahead of spawn: a tea table + two stools inside,
      // two lamp posts at its door
      ...pavilion(0, -8.5, 1.5),
      sp('teatable', 0, -8.5), sp('stool', -0.75, -8.5), sp('stool', 0.75, -8.5),
      b('column-thin', -2.4, -5.4), b('column-thin', 2.4, -5.4),
      f('tree', -3.6, -11, 0.7, 1.4), f('tree', 3.6, -11, 2.4, 1.4),
      sp('planter', -1.9, -6.2, 0, 0.9), sp('planter', 1.9, -6.2, 0, 0.9, { flowers: '#a98be8' }),

      // the walk: gate → centre → gate, plus the spur to the gazebo, two rose
      // arches over it and a bench either side of the spur
      ...trail([[-15, -3], [-8, -1.6], [0, 0], [8, 1.6], [15, 3]], { step: 1.7, width: 0.85 }),
      ...trail([[0, 0], [0, -5]], { step: 1.7, width: 0.85 }),
      sp('rosearch', -10.5, -2.1, Math.PI / 2 - 0.2), sp('rosearch', 10.5, 2.1, Math.PI / 2 - 0.2), // posts across the walk
      sp('bench', -1.6, -2.8, Math.PI / 2), sp('bench', 1.6, -2.8, -Math.PI / 2),

      // four flower beds, one per quarter, flowers in clumps around them
      ...flowerBed(-7, -5.5, 1.8, '#ff8fc0'), ...flowerBed(7, -5.5, 1.8, '#ff7a6b'),
      ...flowerBed(-7, 6.5, 1.8, '#ffb62e'), ...flowerBed(7, 6.5, 1.8, '#a98be8'),
      // rose bushes along the walk and round the gazebo
      ...[[-13.2, -5.6], [-12.4, 0.4], [-5, -2.5], [-3.2, 1.8], [3.4, -1.9], [5.8, 3.4], [12.6, 0.2], [13.2, 5.4],
        [-3.4, -6.6], [3.4, -6.8], [-2.6, -11.6], [2.6, -11.8], [-12.6, 3.6], [12.4, -3.8]]
        .map(([x, z], i) => sp('rosebush', x, z, i * 0.9, 0.85 + (i % 3) * 0.12, { color: ['#ff8fc0', '#ff7a6b', '#fff8ec', '#a98be8'][i % 4] })),
      // tree clumps at the middle of each side, so no edge is bare
      f('tree', -14, -8.6, 0.6, 1.2), f('tree-high', -13.4, 7.6, 2.4, 1.1),
      f('tree', 0.4, 15, 1.4, 1.2), f('tree-high', -6.6, 15.2, 0.3, 1.1), f('tree', 8.4, 14.8, 2, 1.15),
      f('tree-high', 14.2, -6.8, 1.1, 1.15), f('tree', 14.4, 8.4, 0.8, 1.1),
      f('plant', -4.6, -7.4, 0.3, 0.9), f('patch-grass', -9.4, -7.6, 1.2),
      f('plant', 4.4, 8.6, 2.1, 0.9), f('patch-grass', 9.6, 4.4, 0.4),
      f('plant', -4.4, 4.6, 1.6, 0.8), f('plant', 4.6, -3.4, 0.7, 0.8),

      // the shed corner (north-east): shed door to the square, tools, a
      // wheelbarrow, sacks, and a veg patch out front the gardeners water
      sp('shed', 10.5, -10.6),
      sp('toolrack', 12.4, -9.7, -Math.PI / 2),
      sp('wheelbarrow', 8.2, -11.4, 0.4),
      sp('sack', 12.6, -11.7, 0.3), sp('sack', 12.2, -12.3, 1.2, 1, { color: '#c9b083' }),
      ...[5.6, 6.5, 7.4].flatMap((x, i) => [
        f('patch-dirt', x, -8.9, 0, 0.9), f('patch-dirt', x, -9.9, Math.PI / 2, 0.9),
        f('plant', x, -8.9, i * 1.7, 1.05), sp('rosebush', x, -9.9, i, 0.55, { color: ['#ff7a6b', '#ffb62e', '#ff7a6b'][i] }), // lettuces + tomatoes
      ]),

      // the lily pond (south-west) with a bench looking over it
      sp('pond', -10.6, 11.2, 0, 1, { r: 1.5 }),
      sp('bench', -10.6, 8.7),
      f('plant', -12.6, 9.4, 0.5), f('patch-grass', -8.2, 12.6, 1.4), f('plant', -8.6, 9.6, 2.2, 0.8),

      // hedges: behind the gazebo, and a flowering hedge along the south edge
      sp('hedge', -6, -13, 0, 1, { len: 4 }), sp('hedge', 6, -13.4, 0, 1, { len: 3 }),
      sp('hedge', -1.6, 12.8, 0, 1, { len: 4.4, flowers: '#ff8fc0' }),
      sp('hedge', 4.6, 12.8, 0, 1, { len: 4, flowers: '#fff8ec' }),
      sp('planter', 10.8, 9.6, 0, 1, { flowers: '#ff7a6b' }), sp('planter', 12.4, 6.2, 0, 1),

      // a tree at each corner frames the lawn
      f('tree-high', -13, -11, 0.4, 1.3), f('tree-high', 13, -13.6, 2.2, 1.3),
      f('tree-high', -13.6, 13.4, 1.1, 1.3), f('tree-high', 13, 11, 2.9, 1.3),
    ],
    neighbours: [
      // the tea party in the gazebo — sitting on their stools, chatting
      { character: 'character-female-e', home: [-0.75, -8.5], stroll: 0, facing: Math.PI / 2, pose: 'sit', seat: 0.28,
        lines: ['Lovely day for tea! ☕', 'Would you like a cup?', 'The roses smell so sweet today 🌹'] },
      { character: 'character-male-e', home: [0.75, -8.5], stroll: 0, facing: -Math.PI / 2, pose: 'sit', seat: 0.28,
        lines: ['Hello! Cookie? 🍪', 'We have tea here every afternoon', 'The gardeners work SO hard'] },
      // the bench by the pond
      { character: 'character-male-c', home: [-10.6, 8.75], stroll: 0, facing: 0, pose: 'sit', seat: 0.26,
        lines: ['Shh… the frogs are singing 🐸', 'I like watching the lily pads', 'Look, a dragonfly!'] },
      // gardener #1 — fetches the watering can, waters the veg patch and the
      // two north beds, puts the can back
      { character: 'character-female-c',
        route: [
          [10.5, -8.9],
          [10.5, -10.3, Math.PI, { inside: true, wait: 2600, take: 'can' }],
          [10.5, -8.9],
          [6.5, -8.1, Math.PI, { do: 'holding-right', ms: 3200, wait: 3600 }],
          [4.2, -4.4],
          [7, -3.6, Math.PI, { do: 'holding-right', ms: 3200, wait: 3600 }],
          [-7, -3.6, Math.PI, { do: 'holding-right', ms: 3200, wait: 3600 }],
          [4.2, -4.4],
          [4.2, -7.6],
          [9.4, -8.2],
          [10.5, -8.9],
          [10.5, -10.3, Math.PI, { inside: true, wait: 3000, take: null }],
        ],
        lines: ['Watering time! 💧', 'Thirsty flowers grow the best', 'Want to help me garden?'] },
      // gardener #2 — takes the spade to weed the south beds, swaps it for a
      // basket, picks flowers and carries them up to the tea party
      { character: 'character-male-a',
        route: [
          [10.5, -8.9],
          [10.5, -10.3, Math.PI, { inside: true, wait: 2400, take: 'spade' }],
          [10.5, -8.9],
          [9.6, -0.4],
          [9.4, 8.2],
          [7, 8.4, Math.PI, { do: 'pick-up', ms: 3600, wait: 4000 }],
          [-7, 8.4, Math.PI, { do: 'pick-up', ms: 3600, wait: 4000 }],
          [-4.4, 8.6],
          [-4.4, 2.6],
          [9.6, -0.4],
          [10.5, -8.9],
          [10.5, -10.3, Math.PI, { inside: true, wait: 2400, take: 'basket' }],
          [10.5, -8.9],
          [9.6, -0.4],
          [9.6, 4.6, 0, { do: 'pick-up', ms: 2400, wait: 2800 }],
          [4.2, -4.4],
          [1, -4.4],
          [0, -5.6],
          [0, -7, Math.PI, { wait: 3200 }], // flowers for the tea table
          [0, -5.6],
          [1, -4.4],
          [4.2, -4.4],
          [4.2, -7.6],
          [9.4, -8.2],
          [10.5, -8.9],
          [10.5, -10.3, Math.PI, { inside: true, wait: 2400, take: null }],
        ],
        lines: ['Pulling weeds is my job! 🌱', 'These flowers are for the tea party', 'A garden needs lots of love'] },
      // a dog walker on the stepping-stone walk
      { character: 'character-female-a', pet: 'animal-dog',
        route: [[-10.4, -2.1, undefined, { wait: 2500 }], [-3.6, -0.7], [3.6, 0.7], [10.4, 2.1, undefined, { wait: 2500 }], [3.6, 0.7], [-3.6, -0.7]],
        lines: ['Hi! 👋 We walk here every day', 'Smell the roses! 🌸', 'My dog loves the arches'] },
    ],
    gates: [
      { to: 'town', position: [-16, 0, -3] },
      { to: 'market', position: [16, 0, 3] },
    ],
  },

  // ── Map 4 — Merry Market: market day in the square (rebuilt 2026-10-06) ──
  // Amy: "redo the market — will there be people wandering too?" A busy town
  // square (Ivy loves the DENSE Clearing): the fountain straight ahead of
  // spawn, a row of striped stalls behind it (fruit, bakery, limes, toys) and
  // two across the square (ice cream, checkout), bunting over both rows, trees
  // round the edge. Shopkeepers stand at their counters (`stroll: 0` +
  // `facing`); shoppers walk stall to stall (`route`) and browse. EVERY stall
  // faces +z, the follow-cam's side (a back-facing stall hid its goods and its
  // keeper under the canopy), and keepers stand BESIDE the counter, not under
  // the roof, so the camera sees their faces. Canopies/fountain/bunting/crates are procedural (Market.jsx).
  market: {
    id: 'market',
    name: 'Merry Market',
    ground: '#fdf0b8', // extra-bright — the lilac ground-light drags yellow toward dijon
    outside: '#dcc98c',
    sky: '#fdf6e3',
    gateColor: '#f2c530',
    decor: [
      ...treeLine({ gaps: [[-16, 3], [16, -2]], step: 2.4, inner: false }),

      // the fountain, straight ahead of spawn, planters at its shoulders
      sp('fountain', 0, -4.4),
      sp('planter', -3.4, -2.6), sp('planter', 3.4, -2.6, 0, 1, { flowers: '#ffb62e' }),

      // ── north row: four stalls facing the square ──
      ...stall(-9, -9.6, 'coral', [m('display-fruit', -9.45, -9.3, Math.PI), m('display-fruit', -8.55, -9.3, Math.PI)]),
      sp('crate', -10.8, -8.6, 0.2), sp('crate', -10.6, -9.6, -0.1, 1, { fruit: 'oranges' }),
      ...stall(-4.5, -9.6, 'sun', [m('display-bread', -4.95, -9.3, Math.PI), m('display-bread', -4.05, -9.3, Math.PI)]),
      ...stall(4.5, -9.6, 'mint', [m('display-fruit', 4.05, -9.3, Math.PI), m('display-fruit', 4.95, -9.3, Math.PI)]),
      sp('crate', 2.9, -9.4, -0.2, 1, { fruit: 'limes' }), sp('crate', 3, -10.4, 0.1, 1, { fruit: 'plums' }),
      ...stall(9, -9.6, 'lilac', [m('shelf-boxes', 8.6, -9.5, 0), m('shelf-bags', 9.4, -9.5, 0)]),
      // the space behind the stalls: stock + a couple of trees
      { pack: 'dungeon', name: 'barrel', position: [-7, 0, -11.6], rotation: 0, scale: 0.8 },
      { pack: 'dungeon', name: 'barrel', position: [-6.3, 0, -11.9], rotation: 1, scale: 0.8 },
      { pack: 'dungeon', name: 'chest', position: [7, 0, -11.7], rotation: 0.2, scale: 0.8 },
      f('tree', 0, -11.8, 0.4, 1.2),
      sp('planter', -1.6, -10.6, 0, 0.9), sp('planter', 1.6, -10.6, 0, 0.9, { flowers: '#a98be8' }),

      // bunting over the north row's frontage (poles clear of the walkway)
      sp('bunting', -5.5, -7.3, 0, 1, { span: 9 }), sp('bunting', 5.5, -7.3, 0, 1, { span: 9 }),

      // ── south row: ice cream + the checkout (customers queue on the south side) ──
      ...stall(-6, 8.6, 'sky', [m('freezer', -6.45, 8.9, Math.PI), m('freezer', -5.55, 8.9, Math.PI)]),
      ...stall(6, 8.6, 'pink', [m('cash-register', 6, 8.9, Math.PI), m('shopping-basket', 6.6, 9.1, 0.3)]),
      m('shopping-cart', 11.2, 4.4, 0.6), m('shopping-cart', 11.8, 5.2, 0.5),
      m('bottle-return', 10.4, 9.6, -Math.PI / 2),
      sp('bunting', 0, 11.6, 0, 1, { span: 16 }),
      sp('planter', 0, 9.6, 0, 1, { flowers: '#ff7a6b' }),

      // west: a cart someone left by the trail + a fruit crate pile
      m('shopping-cart', -11.6, -2.8, 2.2),
      sp('crate', -12.4, 7.6, 0.3, 1, { fruit: 'oranges' }), sp('crate', -11.7, 8.3, -0.2),
      // east: the quiet corner by the arcade gate
      sp('planter', 12.4, 1.4, 0, 1, { flowers: '#4cc9a4' }),
      f('plant', 11.4, -5.6, 0.8), f('patch-grass', -8, 2.8, 1.9),
    ],
    neighbours: [
      // shopkeepers — beside their counters, facing the square (+z)
      { character: 'character-male-a', home: [-7.55, -9.05], stroll: 0, facing: 0,
        lines: ['Fresh apples! 🍎', 'Three apples for one smile!', 'Pick a shiny one!'] },
      { character: 'character-female-c', home: [-3.05, -9.05], stroll: 0, facing: 0,
        lines: ['Warm bread, just baked! 🥖', 'Smell that? Cinnamon buns!', 'Come back for cookies 🍪'] },
      { character: 'character-male-d', home: [5.95, -9.05], stroll: 0, facing: 0,
        lines: ['Limes and plums! 🍋', 'Fruit makes you fast!', 'Have a lovely day!'] },
      { character: 'character-female-e', home: [10.45, -9.05], stroll: 0, facing: 0,
        lines: ['Toys and treasures! 🧸', 'Everything here is one-of-a-kind', 'Look around, take your time!'] },
      { character: 'character-male-f', home: [-7.45, 9.15], stroll: 0, facing: 0,
        lines: ['Ice cream! 🍦 Which flavour?', 'Strawberry is my favourite!', 'Brrr, the freezer is cold!'] },
      { character: 'character-female-f', home: [4.55, 9.15], stroll: 0, facing: 0,
        lines: ['Ring ring! Checkout is open 🛒', 'Did you find everything?', 'Thank you for shopping!'] },
      // shoppers — stall to stall, browsing as they go. A stop WITH a yaw is a
      // stall (face it, browse); without one it's a corner they walk round.
      // Routes go around the fountain, planters, crates, carts, stalls and
      // keepers (season-maps.test.js walks every segment).
      { character: 'character-female-a', pet: 'animal-dog',
        route: [[-4.5, -8.1, Math.PI], [-9, -8.1, Math.PI], [-3.4, 8.6], [-6, 10.2, Math.PI], [-3.4, 8.6], [-4.5, 1.2]],
        lines: ['Hi there! 👋', 'Have you tried the bread? 😋', 'My dog loves market day!'] },
      { character: 'character-male-b',
        route: [[4.5, -8.1, Math.PI], [9, -8.1, Math.PI], [8.6, 8.6], [6, 10.2, Math.PI], [8.6, 8.6], [4.6, 1.6]],
        lines: ["Hello! I'm looking for limes", 'This fountain is my favourite spot', 'So much to see today!'] },
      { character: 'character-female-b', pet: 'animal-chick',
        route: [[9, -8.1, Math.PI], [-9, -8.1, Math.PI], [-3.4, 8.6], [-6, 10.2, Math.PI], [-3.4, 8.6], [2.6, 3.6]],
        lines: ['Ice cream first, then shopping!', 'Have a sparkly day ✨', 'Hi, neighbour!'] },
      { character: 'character-male-c', pet: 'animal-pig',
        route: [[-4.5, -8.1, Math.PI], [-5.4, -1], [-2.6, 2.4], [2.6, 2.4, 0], [5.4, -1], [4.5, -8.1, Math.PI]],
        lines: ['Good morning! ☀️', 'The baker gave me a free roll!', 'What are you buying today?'] },
    ],
    gates: [
      { to: 'garden', position: [-16, 0, 3] },
      { to: 'arcade', position: [16, 0, -2] },
    ],
  },

  arcade: withSeason(ARCADE),

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

/** Every fixed spot on a map that sparkles/stations must keep clear of:
 *  scenery + neighbours' homes (they stroll ~2 around home). [x, z, radius]. */
export function blockers(map) {
  return [
    ...map.decor.map((d) => [d.position[0], d.position[2], 0]),
    // a keeper/stroller's home, or a shopper's first stop
    ...(map.neighbours || []).map((n) => { const [x, z] = n.home || n.route[0]; return [x, z, 1.5] }),
  ]
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
  for (const d of map.decor) if (!d.fx) seen.add(modelUrl(d.pack, d.name))
  for (const n of map.neighbours || []) {
    seen.add(modelUrl('characters', n.character))
    if (n.pet) seen.add(modelUrl('pets', n.pet))
  }
  seen.add(modelUrl('building', 'column'))
  for (const url of seen) useGLTF.preload(url)
}
