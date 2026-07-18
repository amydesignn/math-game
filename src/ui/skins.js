/*
 * skins.js — the task-wrapper skins (Skin × Problem × Representation, Oscar's
 * third axis). A skin wraps naked math in a nurturing world action: positive
 * motivation only, a gift to the world, never a rescue.
 *
 * This is the RELEASE SET v1 — the six skins Oscar + Amy locked on 2026-07-17
 * (delivery: ~/Downloads/delivery — station + sparkle packs/). Each skin drives
 * BOTH surfaces:
 *   · a single sparkle problem (MathPopup) — uses tag/paw/accent/ask/win
 *   · a station mini-quest (StationPopup) — adds the quest-voice fields
 *     (marker/asset/glow/questLabel/stepNoun/questAsk/stepWin/questWin)
 * One skin = one marker + one asset-in-the-ring + one accent. Variety lives
 * BETWEEN stations, never inside one (locked in the Break Room review).
 *
 * To add a skin later: drop one entry here — nothing else changes.
 */

const teal = '#00BBA7'

export const SKINS = {
  feedPet: {
    id: 'feedPet', tag: 'Snack time', paw: '🧺', asset: '🧺', marker: '🍎',
    accent: teal, glow: '#46ECD5',
    ask: 'Your pet wants a snack! Solve it to fill the bowl.',
    askShort: 'solve it to fill the bowl',
    win: 'Yum! Your pet is happy.',
    questLabel: 'Picnic quest', stepNoun: 'snack', stepPlural: 'snacks',
    questAsk: 'Your pet is extra hungry today — a whole picnic!',
    stepWin: (n, total) => `Snack ${n} of ${total} — gobbled up!`,
    questWin: 'What a feast! Your pet is doing the happy dance.',
  },
  waterTree: {
    id: 'waterTree', tag: 'Water the tree', paw: '🌳', asset: '🌳', marker: '🌱',
    accent: '#00A63E', glow: '#7BF1A8',
    ask: 'The tree is thirsty! Solve it to fill the can.',
    askShort: 'solve it to fill the can',
    win: 'Glug glug — the tree drank it up!',
    questLabel: 'Watering quest', stepNoun: 'splash', stepPlural: 'splashes',
    questAsk: 'This tree needs a big drink today!',
    stepWin: (n, total) => `Splash ${n} of ${total} — glug glug!`,
    questWin: 'The tree is blooming! Look at it go.',
  },
  bakery: {
    id: 'bakery', tag: 'Bakery run', paw: '🍞', asset: '🍞', marker: '🥐',
    accent: '#E17100', glow: '#FFD230',
    ask: 'The oven is warm! Solve it to mix the dough.',
    askShort: 'solve it to mix the dough',
    win: 'Fresh and warm — nice work!',
    questLabel: 'Bakery quest', stepNoun: 'batch', stepPlural: 'batches',
    questAsk: 'Big order at the bakery — time to bake!',
    stepWin: (n, total) => `Batch ${n} of ${total} — golden and warm!`,
    questWin: 'The oven is full! It smells amazing.',
  },
  flowers: {
    id: 'flowers', tag: 'Flower patch', paw: '🪴', asset: '🪴', marker: '🌷',
    accent: '#F6339A', glow: '#FDA5D5',
    ask: 'The patch is ready! Solve it to plant a seed.',
    askShort: 'solve it to plant a seed',
    win: 'A new bloom — lovely!',
    questLabel: 'Bloom quest', stepNoun: 'seed', stepPlural: 'seeds',
    questAsk: 'Let’s fill this whole patch with flowers!',
    stepWin: (n, total) => `Seed ${n} of ${total} — planted!`,
    questWin: 'The whole patch is blooming!',
  },
  arcade: {
    id: 'arcade', tag: 'Arcade night', paw: '🎯', asset: '🎯', marker: '🕹️',
    accent: '#2B7FFF', glow: '#8EC5FF',
    ask: 'Step right up! Solve it to take your shot.',
    askShort: 'solve it to take your shot',
    win: 'Bullseye! Nice shot.',
    questLabel: 'Arcade quest', stepNoun: 'round', stepPlural: 'rounds',
    questAsk: 'Arcade night — bright lights, big prizes!',
    stepWin: (n, total) => `Round ${n} of ${total} — bullseye!`,
    questWin: 'High score! The arcade lights up for you.',
  },
  starParty: {
    id: 'starParty', tag: 'Star party', paw: '🔭', asset: '🔭', marker: '⭐',
    accent: '#8E51FF', glow: '#DDD6FF',
    ask: 'The sky is clear! Solve it to spot a star.',
    askShort: 'solve it to spot a star',
    win: 'A star for you — spotted!',
    questLabel: 'Star quest', stepNoun: 'star', stepPlural: 'stars',
    questAsk: 'Star party tonight — the sky is showing off!',
    stepWin: (n, total) => `Star ${n} of ${total} — spotted!`,
    questWin: 'A whole constellation — name it anything you like.',
  },
}

/** The station skin ids, in a stable order (the daily plan picks from these). */
export const STATION_SKIN_IDS = Object.keys(SKINS)
