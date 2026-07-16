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
  // camera offset from the character — steep 3/4 top-down so the trailing pet
  // never looms between camera and character
  camOffset: [0, 9, 6.5],
}
