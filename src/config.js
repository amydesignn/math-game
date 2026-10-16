// Asset registry + world tuning. Paths resolve against BASE_URL, which is always
// '/' now that everything serves from the root (Vercel, dev, preview).

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

// Companions she can buy in the Gem Shop and switch between (Ivy, 2026-10-14).
// The cat is hers from the start. `thumb` is a still render for the shop tile.
// Generated models (Higgsfield → Blender) have no skeleton — Pet.jsx bounces
// them in code instead of playing clips.
export const COMPANIONS = [
  { id: 'animal-cat', name: 'Cat', thumb: 'thumbs/pet-cat.png', price: 0 },
  { id: 'sprout', name: 'Sproutling', thumb: 'thumbs/pet-sprout.png', price: 50 },
]

// The player character (Ivy's pick, 2026-10-14): the Sorcerer, generated in
// parts (Higgsfield → Blender) so her hat and staff swap. Her model carries
// two empty nodes, socket_head + socket_hand_R; Gear.jsx mounts the equipped
// piece on each. No skeleton — Character.jsx bounces her in code.
export const PLAYER = 'sorcerer'
export const GEAR_SOCKETS = { hat: 'socket_head', staff: 'socket_hand_R' }

// Wardrobe (Gem Shop). One mesh per slot; colours are repainted textures
// (`tex` swaps the base-colour map; null = the model's own). price 0 = hers
// from the start. Prices are placeholders until Amy sets them.
export const GEAR = [
  { id: 'hat-blue', slot: 'hat', name: 'Blue hat', model: 'hat', tex: null, thumb: 'thumbs/gear-hat-blue.png', price: 0 },
  { id: 'hat-green', slot: 'hat', name: 'Green hat', model: 'hat', tex: 'hat-green', thumb: 'thumbs/gear-hat-green.png', price: 10 },
  { id: 'hat-red', slot: 'hat', name: 'Red hat', model: 'hat', tex: 'hat-red', thumb: 'thumbs/gear-hat-red.png', price: 10 },
  { id: 'hat-cream', slot: 'hat', name: 'Cream hat', model: 'hat', tex: 'hat-cream', thumb: 'thumbs/gear-hat-cream.png', price: 10 },
  { id: 'staff-purple', slot: 'staff', name: 'Purple staff', model: 'staff', tex: null, thumb: 'thumbs/gear-staff-purple.png', price: 0 },
  { id: 'staff-blue', slot: 'staff', name: 'Blue staff', model: 'staff', tex: 'crystal-blue', thumb: 'thumbs/gear-staff-blue.png', price: 10 },
  { id: 'staff-pink', slot: 'staff', name: 'Pink staff', model: 'staff', tex: 'crystal-pink', thumb: 'thumbs/gear-staff-pink.png', price: 10 },
  { id: 'staff-orange', slot: 'staff', name: 'Orange staff', model: 'staff', tex: 'crystal-orange', thumb: 'thumbs/gear-staff-orange.png', price: 10 },
]
export const DEFAULT_GEAR = { hat: 'hat-blue', staff: 'staff-purple' }

// Heroes (Gem Shop, 2026-10-15): the player swaps who she plays as. The
// Sorcerer + two Kenney minis are free; the rest unlock with gems, ONCE. Only
// the Sorcerer has gear sockets, so the hat/staff shelves are hers alone.
// Names + the 💎50 price are placeholders until Amy sets them.
const hero = (id, name, price) => ({ id, name, price, thumb: `thumbs/hero-${id.replace('character-', '')}.png` })
export const HEROES = [
  hero(PLAYER, 'Sorcerer', 0),
  hero('character-female-b', 'Sunny', 0),
  hero('character-male-a', 'Bookworm', 0),
  hero('character-female-a', 'Champ', 50),
  hero('character-female-c', 'Bluebell', 50),
  hero('character-female-d', 'Boss', 50),
  hero('character-female-e', 'Scientist', 50),
  hero('character-female-f', 'Rocker', 50),
  hero('character-male-b', 'Grandpa', 50),
  hero('character-male-c', 'Officer', 50),
  hero('character-male-d', 'Mayor', 50),
  hero('character-male-e', 'Builder', 50),
  hero('character-male-f', 'Gardener', 50),
]
export const gearUrl = (model) => `${B}models/gear/${model}.glb`
export const gearTexUrl = (tex) => `${B}models/gear/tex/${tex}.jpg`

// Every pet id the game can load — the cube pets plus the bought companions.
export const PET_IDS = [...PETS, ...COMPANIONS.map((c) => c.id).filter((id) => !PETS.includes(id))]

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
  // camera offset from the character — a 3/4 view, steep enough that the
  // trailing pet never looms between camera and character. Eased from
  // [0, 9, 6.5] (~54°) to ~41° (2026-10-14) so her face shows under the
  // Sorcerer's hat brim; same distance.
  camOffset: [0, 7, 8],
  zoomMin: 0.55, // pinch-in limit (closer)
  zoomMax: 2.2, // pinch-out limit (see more of the map)
}

// ── Phase 3: the Gem Shop catalog ──
// All CC0 Kenney packs staged in public/models (each keeps its OWN Textures/ —
// see the texture-collision rule in CLAUDE.md).
//
// Shelves are labelled the way IVY reads them ("Skate park"), never by pack name
// ("kenney_mini-skate" means nothing to an 11-year-old). A category is also the
// natural home for a future aspirational / mastery-locked set — a whole shelf
// can sit visible as "???" for her to save toward.
export const SHOP_CATEGORIES = [
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'market', label: 'Market', emoji: '🛒' },
  { id: 'arcade', label: 'Arcade', emoji: '🕹️' },
  { id: 'skate', label: 'Skate park', emoji: '🛹' },
  { id: 'dungeon', label: 'Dungeon', emoji: '🗝️' },
  { id: 'castle', label: 'Castle', emoji: '🏰' },
]

// `scale` = the pack's base size against the mini characters. The mini-* packs
// are authored 1:1 with them (scale 1 — do NOT "correct" toward real-world
// proportions); the full-size kits need bringing down (castle, like the
// building kit, is authored on a big modular grid).
export const SHOP = [
  // ── Forest ──
  { asset: 'tree', pack: 'forest', cat: 'forest', name: 'Tree', emoji: '🌳', price: 3 },
  { asset: 'tree-high', pack: 'forest', cat: 'forest', name: 'Tall tree', emoji: '🌲', price: 4 },
  { asset: 'plant', pack: 'forest', cat: 'forest', name: 'Plant', emoji: '🌿', price: 2 },
  { asset: 'patch-grass', pack: 'forest', cat: 'forest', name: 'Grass patch', emoji: '🌱', price: 2 },
  { asset: 'stones', pack: 'forest', cat: 'forest', name: 'Stones', emoji: '🪨', price: 2 },
  { asset: 'fence', pack: 'forest', cat: 'forest', name: 'Fence', emoji: '🪵', price: 2 },
  { asset: 'flag', pack: 'forest', cat: 'forest', name: 'Flag', emoji: '🚩', price: 2 },
  { asset: 'tent', pack: 'forest', cat: 'forest', name: 'Tent', emoji: '⛺', price: 5 },
  { asset: 'bridge', pack: 'forest', cat: 'forest', name: 'Bridge', emoji: '🌉', price: 6 },
  { asset: 'target', pack: 'forest', cat: 'forest', name: 'Target', emoji: '🎯', price: 3 },
  // ── Market ──
  { asset: 'display-fruit', pack: 'market', cat: 'market', name: 'Fruit stand', emoji: '🍎', price: 4 },
  { asset: 'display-bread', pack: 'market', cat: 'market', name: 'Bakery stand', emoji: '🥐', price: 4 },
  { asset: 'shopping-cart', pack: 'market', cat: 'market', name: 'Cart', emoji: '🛒', price: 3 },
  { asset: 'freezer', pack: 'market', cat: 'market', name: 'Ice-cream freezer', emoji: '🍦', price: 4 },
  // ── Arcade ──
  { asset: 'arcade-machine', pack: 'arcade', cat: 'arcade', name: 'Arcade machine', emoji: '🕹️', price: 6 },
  { asset: 'claw-machine', pack: 'arcade', cat: 'arcade', name: 'Claw machine', emoji: '🧸', price: 6 },
  { asset: 'pinball', pack: 'arcade', cat: 'arcade', name: 'Pinball', emoji: '🎮', price: 5 },
  { asset: 'dance-machine', pack: 'arcade', cat: 'arcade', name: 'Dance machine', emoji: '💃', price: 6 },
  { asset: 'prize-wheel', pack: 'arcade', cat: 'arcade', name: 'Prize wheel', emoji: '🎡', price: 5 },
  { asset: 'basketball-game', pack: 'arcade', cat: 'arcade', name: 'Basketball hoop', emoji: '🏀', price: 5 },
  // ── Skate park (mini pack — scale 1) ──
  { asset: 'half-pipe', pack: 'skate', cat: 'skate', name: 'Half pipe', emoji: '🛝', price: 6 },
  { asset: 'bowl-side', pack: 'skate', cat: 'skate', name: 'Bowl', emoji: '🥣', price: 5 },
  { asset: 'structure-platform', pack: 'skate', cat: 'skate', name: 'Platform', emoji: '🏗️', price: 4 },
  { asset: 'rail-curve', pack: 'skate', cat: 'skate', name: 'Curved rail', emoji: '➰', price: 3 },
  { asset: 'rail-high', pack: 'skate', cat: 'skate', name: 'High rail', emoji: '🚧', price: 3 },
  { asset: 'steps', pack: 'skate', cat: 'skate', name: 'Steps', emoji: '🪜', price: 3 },
  { asset: 'obstacle-box', pack: 'skate', cat: 'skate', name: 'Grind box', emoji: '📦', price: 2 },
  { asset: 'skateboard', pack: 'skate', cat: 'skate', name: 'Skateboard', emoji: '🛹', price: 2 },
  // ── Dungeon (mini pack — scale 1) ──
  { asset: 'chest', pack: 'dungeon', cat: 'dungeon', name: 'Treasure chest', emoji: '💰', price: 5 },
  { asset: 'gate', pack: 'dungeon', cat: 'dungeon', name: 'Dungeon gate', emoji: '⛩️', price: 5 },
  { asset: 'column', pack: 'dungeon', cat: 'dungeon', name: 'Column', emoji: '🏛️', price: 3 },
  { asset: 'stairs', pack: 'dungeon', cat: 'dungeon', name: 'Stone stairs', emoji: '🗿', price: 3 },
  { asset: 'banner', pack: 'dungeon', cat: 'dungeon', name: 'Banner', emoji: '🎌', price: 2 },
  { asset: 'shield-round', pack: 'dungeon', cat: 'dungeon', name: 'Shield', emoji: '🛡️', price: 2 },
  { asset: 'barrel', pack: 'dungeon', cat: 'dungeon', name: 'Barrel', emoji: '🛢️', price: 2 },
  { asset: 'wall', pack: 'dungeon', cat: 'dungeon', name: 'Stone wall', emoji: '🧱', price: 2 },
  // ── Castle (full-size kit — scaled down like the building kit) ──
  // NOTE: castle-kit is MODULAR — towers are meant to stack (base+mid+roof) and
  // we only place on the ground plane, so a single piece is a block, not a
  // tower. Named honestly. A real castle centrepiece wants to be a COMPOSED
  // prefab (same trick as house()/pavilion() in maps.js) — good candidate for
  // the aspirational tier.
  { asset: 'tower-square', pack: 'castle', cat: 'castle', name: 'Tower block', emoji: '🗿', price: 8, scale: 0.6 },
  { asset: 'gate', pack: 'castle', cat: 'castle', name: 'Castle gate', emoji: '🏰', price: 6, scale: 0.6 },
  { asset: 'bridge-straight', pack: 'castle', cat: 'castle', name: 'Stone bridge', emoji: '🌁', price: 6, scale: 0.6 },
  { asset: 'rocks-large', pack: 'castle', cat: 'castle', name: 'Boulder', emoji: '⛰️', price: 3, scale: 0.6 },
  { asset: 'flag', pack: 'castle', cat: 'castle', name: 'Castle flag', emoji: '🏳️', price: 2, scale: 0.6 },
]

/** The catalog entry for a placed/owned asset (pack + asset is the key). */
export const shopEntry = (pack, asset) => SHOP.find((s) => s.pack === pack && s.asset === asset)

/**
 * Final render scale = the pack's base scale × the SIZE she bought.
 * Amy's call (Ivy: "it is fun"): a ×2 costs 2× and a ×3 costs 3×.
 */
export const assetScale = (pack, asset, size = 1) => (shopEntry(pack, asset)?.scale ?? 1) * size

/** Size tiers — the multiplier IS the price multiplier. Legible for a kid, and
 *  on-theme for a maths game: pick ×3 and every price visibly triples. */
export const SIZES = [
  { size: 1, label: 'Normal' },
  { size: 2, label: 'Big ×2' },
  { size: 3, label: 'Huge ×3' },
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

// ── Grow a Garden (2026-10-15, spec: Notion "Luxi Math — Grow a Garden") ──
// Math is the only fuel: seeds come from lifetime gems (earned-only, never
// bought), and she waters her plot with gems she won from answers. Nothing
// wilts, no clocks, no streaks. These are the two knobs Amy tunes from play —
// too rare / too many → change a NUMBER here, never the logic in store.js.
//   seedEveryGems — one seed per this many LIFETIME gems (answers pay 1–3)
//   waterCost     — gems per watering ("Water 💧 for 5 💎")
//   waterings     — waterings from planted to bloom. One watering = one stage:
//                   0 mound → 1 sprout → 2 bud → 3 bloom (the 4 stage models
//                   assume 3 — retune the art mapping if this changes).
// 3 × 5 = 15 gems a plant, a bit under the seed rate so seeds never wait on water.
export const GARDEN = {
  seedEveryGems: 20,
  waterCost: 5,
  waterings: 3,
}

// Seed kinds — how each harvest is named in the 🧺 Basket (ticket 8). Only the
// starter exists today; a new kind = one entry here, and the Basket gives it its
// own line. Every harvest counts as ONE generic unit in the total, whatever its
// kind. (What harvests later exchange for — a rare, permanent item gems can't
// buy — is parked in the Notion spec.) Unknown kinds fall back to a generic row.
export const SEED_KINDS = {
  starter: { name: 'Red flowers', emoji: '🌸' },
}

// ── Background music: two tracks, player's choice (2026-10-04) ──
// "Island" is the new default (Amy's Suno brief: grounded light-adventure —
// marimba + nylon guitar + upright bass, no piano/glockenspiel so it never reads
// as café lo-fi). "Soft Focus" is the calmer Luxi song from the award video —
// the Suno Pro (licensed) render. Both are ours under the Pro plan's commercial
// rights; the July free-download bgm.mp3 was retired (Ivy's call — she never
// loved it). `gain` levels the files to the same perceived loudness, ≈ −17.4
// LUFS: Island masters at −15.5 (×0.80), Soft Focus at −14.9 (×0.75).
export const MUSIC_TRACKS = [
  { id: 'island', label: 'Island', file: 'bgm-island.mp3', gain: 0.8 },
  { id: 'soft-focus', label: 'Soft Focus', file: 'bgm-soft-focus.mp3', gain: 0.75 },
]
export const DEFAULT_MUSIC = 'island'
