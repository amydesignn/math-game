// Asset registry + world tuning. Paths resolve against BASE_URL so the same code
// works in dev ('/') and on GitHub Pages ('/math-game/').

const B = import.meta.env.BASE_URL

export const modelUrl = (pack, name) => `${B}models/${pack}/${name}.glb`

// The characters staged for Stage A (the 12 people; aids/wheelchairs live in the
// source pack, brought in later if wanted).
export const CHARACTERS = [
  'character-female-a', 'character-female-b', 'character-female-c',
  'character-female-d', 'character-female-e', 'character-female-f',
  'character-male-a', 'character-male-b', 'character-male-c',
  'character-male-d', 'character-male-e', 'character-male-f',
]

// All 24 cube pets — this is the collection surface.
export const PETS = [
  'animal-beaver', 'animal-bee', 'animal-bunny', 'animal-cat',
  'animal-caterpillar', 'animal-chick', 'animal-cow', 'animal-crab',
  'animal-deer', 'animal-dog', 'animal-elephant', 'animal-fish',
  'animal-fox', 'animal-giraffe', 'animal-hog', 'animal-koala',
  'animal-lion', 'animal-monkey', 'animal-panda', 'animal-parrot',
  'animal-penguin', 'animal-pig', 'animal-polar', 'animal-tiger',
]

// Forest props for world-building (Stage C).
export const PROPS = [
  'tree', 'tree-high', 'rocks-low', 'rocks-high', 'rocks-ramp',
  'plant', 'stones', 'fence', 'flag', 'tent', 'bridge', 'ladder',
  'platform', 'patch-grass', 'patch-dirt', 'target',
]

// ── World tuning (adjusted after first visual check) ──
export const WORLD = {
  characterScale: 1,
  petScale: 0.6,
  characterSpeed: 3.2, // units / second
  petSpeed: 4.0, // pet is a touch faster so it can catch up
  petFollowDistance: 1.6, // how far behind the character the pet trails
  arriveThreshold: 0.12, // stop when this close to the tap target
  groundSize: 120, // large enough that the edge never shows under the follow cam
  bounds: 18, // half-extent of the playable map — walks clamp to ±bounds
  // camera offset from the character — steep 3/4 top-down so the trailing pet
  // never looms between camera and character
  camOffset: [0, 9, 6.5],
  zoomMin: 0.55, // pinch-in limit (closer)
  zoomMax: 2.2, // pinch-out limit (see more of the map)
}

// ── Phase 3: the Gem Shop catalog ──
// Curated from the packs already staged in public/models (all CC0, all scale 1
// per the mini-pack rule). Prices tuned to the 15-gem cap: a full pocket buys
// a handful of things, so earning → spending → earning keeps cycling.
export const SHOP = [
  { asset: 'tree', pack: 'forest', name: 'Tree', emoji: '🌳', price: 3 },
  { asset: 'tree-high', pack: 'forest', name: 'Tall tree', emoji: '🌲', price: 4 },
  { asset: 'plant', pack: 'forest', name: 'Plant', emoji: '🌿', price: 2 },
  { asset: 'patch-grass', pack: 'forest', name: 'Grass patch', emoji: '🌱', price: 2 },
  { asset: 'stones', pack: 'forest', name: 'Stones', emoji: '🪨', price: 2 },
  { asset: 'fence', pack: 'forest', name: 'Fence', emoji: '🪵', price: 2 },
  { asset: 'flag', pack: 'forest', name: 'Flag', emoji: '🚩', price: 2 },
  { asset: 'tent', pack: 'forest', name: 'Tent', emoji: '⛺', price: 5 },
  { asset: 'bridge', pack: 'forest', name: 'Bridge', emoji: '🌉', price: 6 },
  { asset: 'target', pack: 'forest', name: 'Target', emoji: '🎯', price: 3 },
  { asset: 'display-fruit', pack: 'market', name: 'Fruit stand', emoji: '🍎', price: 4 },
  { asset: 'display-bread', pack: 'market', name: 'Bakery stand', emoji: '🥐', price: 4 },
  { asset: 'shopping-cart', pack: 'market', name: 'Cart', emoji: '🛒', price: 3 },
  { asset: 'freezer', pack: 'market', name: 'Ice-cream freezer', emoji: '🍦', price: 4 },
  { asset: 'arcade-machine', pack: 'arcade', name: 'Arcade machine', emoji: '🕹️', price: 6 },
  { asset: 'claw-machine', pack: 'arcade', name: 'Claw machine', emoji: '🧸', price: 6 },
  { asset: 'pinball', pack: 'arcade', name: 'Pinball', emoji: '🎮', price: 5 },
  { asset: 'dance-machine', pack: 'arcade', name: 'Dance machine', emoji: '💃', price: 6 },
  { asset: 'prize-wheel', pack: 'arcade', name: 'Prize wheel', emoji: '🎡', price: 5 },
  { asset: 'basketball-game', pack: 'arcade', name: 'Basketball hoop', emoji: '🏀', price: 5 },
]

// ── Content refresh cadence ──
// So there's always something new to earn: stations regenerate and the map's
// gem sparkles re-scatter every this-many hours. This is the "restart after a
// period" rule (Ivy maxed out day one). BETA-PROVISIONAL — the blessed gem
// economy spec finalizes the cadence and when the 15-gem cap retires; until
// then, tune this ONE number. Guide: 24 = once a day · 6 = a few times a day ·
// 3 = frequent (current) · 1 = very abundant. Windows align to the clock (UTC),
// so a fresh batch lands on each boundary regardless of when she last played.
export const REFRESH = {
  periodHours: 3,
}

// ── Sparkle Pack: a 15-minute cosmetic consumable (Oscar's Sparkle Pack) ──
// The first non-permanent shop item — the gem SINK that keeps gems worth
// earning after the world fills up. Bought from the shop's "Magic" tier; a
// sparkle aura + fairy-dust trail rides on Ivy's character for the duration,
// with a quiet-draining bar above her head. Prices are per-colour (Oscar's,
// blessed by Amy): 2 a colour, 3 for a metallic, 4 for rainbow.
export const SPARKLE = {
  durationMs: 15 * 60 * 1000,
  // emitter recipe (Oscar's, tuned with Amy — translated from his 2D comp to
  // the 3D world): beat cadence, motes per beat, glint cadence, particle cap.
  beatMs: 55,
  dustPerBeat: 3,
  glintEvery: 4, // lux skus glint every 3rd beat instead
  auraStars: 7,
  maxParticles: 80,
  colors: {
    pink: { label: 'Pink', price: 2, hex: '#FB64B6', cs: ['#FB64B6', '#FDA5D5', '#ffffff'] },
    blue: { label: 'Blue', price: 2, hex: '#51A2FF', cs: ['#51A2FF', '#8EC5FF', '#ffffff'] },
    gold: { label: 'Gold', price: 3, hex: '#FFB900', cs: ['#FFB900', '#FEE685', '#ffffff'], lux: true },
    silver: { label: 'Silver', price: 3, hex: '#E2E8F0', cs: ['#E2E8F0', '#CAD5E2', '#ffffff'], lux: true },
    rainbow: { label: 'Rainbow', price: 4, hex: null, cs: null }, // per-particle hue cycle
  },
  // the shop's Magic tier, in display order
  order: ['pink', 'blue', 'gold', 'silver', 'rainbow'],
}

// ── Phase 5: station mini-quests (encounter tier 3) ──
// Stations are the "task wrappers with world presence" — rare-ish, 2–3 a day
// across the ring of maps, so most days feel different. One skin + one skill per
// station; a completion bonus on top of the per-problem payout.
export const STATION = {
  length: 2, // problems per quest (data — Oscar's wrapper is agnostic; 3 later)
  bonus: 1, // completion-bonus gems (economy spec: +1–2)
  perDayMin: 2, // how many of the 5 maps host a station today…
  perDayMax: 3, // …picked fresh each day
  reach: 1.7, // walk this close to the ring → the quest opens (matches gate feel)
  rearm: 2.6, // after an unfinished close, re-open only once she walks this far off
}

// ── Phase 2: gem sparkles (beta collection loop; Phase 4 swaps taps for math) ──
export const GEMS = {
  // ⚰️ THE 15-GEM BETA CAP RETIRED 2026-07-18 — deliberately, as the economy
  // design always said it would ("the cap retires with the real economy").
  // It was right for the pre-math beta, where gems were free to collect and a
  // cap created anticipation instead of an unlimited balance that later resets
  // (Finn's Cozy Closet lesson). The moment MATH became how gems are earned it
  // inverted: Ivy solved 6 problems, was told she was correct, and was paid
  // NOTHING. Effort with no reward is the one thing this app must never do.
  // Gems earned under the cap were refunded from the lifetime ledger (store.js).
  // The economy self-limits by what a problem pays (ladder level) + the refresh
  // cadence — not by a ceiling on her savings. An uncapped balance is also what
  // makes the aspirational shop tier (50–150 gems) mean anything to save toward.
  perMap: 3, // sparkles per map visit, so finding more means exploring the ring
  collectRadius: 1.0, // walk this close to a sparkle → collected
}
