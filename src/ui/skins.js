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
 * Colours are Luxi tokens (`--luxi-color-component-skin-<id>-*`, the `luxi skins
 * 10-21` block in index.css). `accentInk` = the accent's 700 step (800 for Flower
 * patch + Star party, Amy 2026-10-05 — AAA headroom) — the colour for any TEXT or
 * text-bearing fill (tag, Quest badge). The raw accent fails WCAG AA on white; ink
 * passes (contrast audit, 2026-10-04). `accent` stays for slots, rings and glow.
 * In CSS, tint with `skinTint()`; three.js and canvas need `skinColor()` (hex).
 * One skin = one marker + one asset-in-the-ring + one accent. Variety lives
 * BETWEEN stations, never inside one (locked in the Break Room review).
 *
 * To add a skin later: drop one entry here — nothing else changes.
 */

import { HINT_COPY } from '../gameHintsCopy'

const skinVar = (id, slot) => `var(--luxi-color-component-skin-${id}-${slot})`

/** A skin colour (a `var(--…)`) at an alpha written the old hex-suffix way:
 *  skinTint(accent, '14') renders exactly like `${hex}14` did. */
export const skinTint = (color, hexAlpha) =>
  `color-mix(in srgb, ${color} ${(parseInt(hexAlpha, 16) / 2.55).toFixed(4)}%, transparent)`

/** A skin colour resolved to its literal value, for three.js materials and the
 *  minimap canvas (neither reads CSS variables). Passes non-var values through. */
export function skinColor(color) {
  const name = /^var\((--[\w-]+)\)$/.exec(color)?.[1]
  if (!name || typeof document === 'undefined') return color
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || color
}

export const SKINS = {
  feedPet: {
    id: 'feedPet', tag: 'Snack time', paw: '🧺', asset: '🧺', marker: '🍎',
    accent: skinVar('feed-pet', 'accent'), accentInk: skinVar('feed-pet', 'ink'), glow: skinVar('feed-pet', 'glow'),
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
    accent: skinVar('water-tree', 'accent'), accentInk: skinVar('water-tree', 'ink'), glow: skinVar('water-tree', 'glow'),
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
    accent: skinVar('bakery', 'accent'), accentInk: skinVar('bakery', 'ink'), glow: skinVar('bakery', 'glow'),
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
    accent: skinVar('flowers', 'accent'), accentInk: skinVar('flowers', 'ink'), glow: skinVar('flowers', 'glow'), /* ink = pink-800 (Amy: +1 step for headroom) */
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
    accent: skinVar('arcade', 'accent'), accentInk: skinVar('arcade', 'ink'), glow: skinVar('arcade', 'glow'),
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
    accent: skinVar('star-party', 'accent'), accentInk: skinVar('star-party', 'ink'), glow: skinVar('star-party', 'glow'), /* sky — off violet so it stops competing with Iris (Amy) */
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

/** The lucky station's skin (2026-10-18) — a new player's welcome gift. Kept
 *  OUT of SKINS on purpose, so the daily plan can never deal it as a quest. It
 *  wears gold (amber-800 ink, 7:1 on white) — reward
 *  colour, unlike any daily skin. Copy lives with the hint copy (Clover). */
export const LUCKY_SKIN = {
  id: 'lucky', tag: HINT_COPY.lucky.tag, paw: '🎁', marker: '🎁',
  accent: skinVar('lucky', 'accent'), accentInk: skinVar('lucky', 'ink'), glow: skinVar('lucky', 'glow'),
  ask: HINT_COPY.lucky.ask,
  win: HINT_COPY.lucky.title,
}
