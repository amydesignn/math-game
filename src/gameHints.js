// Luxi Math's hint CONFIG — the game-specific half of the hint system.
// The engine (src/hints/) knows nothing about gardens; everything Luxi lives here.
// A new hint = one entry in GAME_HINTS (+ its line in gameHintsCopy.js).
import { HINT_COPY } from './gameHintsCopy'

// ── Which arrow, per map (Amy 2026-10-17): green by default, pink on green
// ground. ONE source: the map's own `ground` colour — a new grass map gets the
// pink arrow without anyone remembering a flag. A map may still pin one with
// `hintArrow: 'green' | 'pink' | 'iris'` if its lighting fools the hue test.
/** Is this ground colour green? Hue in the green band, with real saturation. */
export function isGreenGround(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  if (!d) return false
  const l = (max + min) / 2
  const sat = d / (1 - Math.abs(2 * l - 1))
  const hue = max === r ? 60 * (((g - b) / d + 6) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4)
  return hue >= 75 && hue <= 165 && sat >= 0.2
}
/** The hint arrow for a map: dev override > the map's pin > ground colour. */
export function arrowForMap(map, override = null) {
  if (override) return override
  if (map?.hintArrow) return map.hintArrow
  return isGreenGround(map?.ground) ? 'pink' : 'green'
}

/** "Has she ever planted?" — derived from garden state, never stored.
 *  A planted plot, or any harvest, means yes. (Old saves that planted before
 *  this feature therefore never see the garden hint.) */
export function everPlanted(g) {
  return !!(g && (g.plot?.seed || g.harvests > 0))
}

/**
 * The ctx every hint reads. Build it from App state in one place.
 * @param {object} s
 * @param {string} s.mapId
 * @param {boolean} s.hasPlot   the current map has a garden bed
 * @param {object} s.garden     store.getGarden()
 * @param {boolean} s.calm      a natural pause: nothing is open, nothing is moving between screens
 * @param {boolean} s.gardenOpen the GardenBar is up (she's at the bed)
 * @param {boolean} s.luckyHere  the lucky station stands in this world (welcome gift still owed)
 */
export function hintCtx({ mapId, hasPlot, garden, calm, gardenOpen, luckyHere }) {
  return {
    mapId,
    hasPlot: !!hasPlot,
    gardenOpen: !!gardenOpen,
    luckyHere: !!luckyHere,
    seeds: garden?.seeds ?? 0,
    everPlanted: everPlanted(garden),
    calm: !!calm,
  }
}

/** Does this pointerdown count as "she walked" (the MoveHint lesson is learned)?
 *  Only a tap on the WORLD canvas while she's in a world — never the Door's
 *  Play/Resume tap (the Door lives inside the same root div), never a HUD
 *  button, never the minimap (also a canvas, but marked data-hint). Amy
 *  2026-10-17: walk lesson first, then the garden hint. */
export function isWorldTap(view, target) {
  if (view !== 'world' || !target) return false
  if (String(target.tagName).toUpperCase() !== 'CANVAS') return false
  return !target.closest?.('[data-hint]')
}

export const GARDEN_HINT_ID = 'garden-first-plant'
export const LUCKY_HINT_ID = 'lucky-station'

export const GAME_HINTS = [
  {
    // The lucky station (2026-10-18, Amy): a NEW player's welcome gift. Our arrow
    // on the station + a GOLD pill, in every world she enters, every visit, until
    // her first right answer anywhere ("follow her — teach them, push a little").
    // FIRST in the list, so it always beats the garden hint. A 'reward', not a
    // nudge: no once-per-session budget, and a ✕ only hides it until the next
    // calm moment. `live`: shown in production even while HINTS_ON is off.
    id: LUCKY_HINT_ID,
    live: true,
    tone: 'lucky',
    budget: 'reward',
    target: { world: 'lucky' },
    when: (c) => c.luckyHere,
    say: () => HINT_COPY.lucky.pill,
    retire: (c) => !c.luckyHere,
    delayMs: 1200, // Fern: the station reveals first, then the arrow, then the pill
    exitMs: 700,
  },
  {
    // Amy: in a scene where she can grow a garden, an arrow on the garden,
    // and a toast if she hasn't grown any crop. Retires on her first planting.
    id: GARDEN_HINT_ID,
    target: { world: 'garden-bed' },
    // Waits for her first seed (a new player's comes from the welcome gift), and
    // never shares the screen with the lucky station.
    when: (c) => c.mapId === 'town' && c.hasPlot && c.seeds > 0 && !c.luckyHere,
    // At the bed the GardenBar already says "Plant your seed" → arrow only, no
    // toast. The arrow STAYS so her plant (always from the bar) lands the
    // 'done' beat on a visible arrow.
    say: (c) => (c.gardenOpen ? '' : c.seeds > 0 ? HINT_COPY.garden.plant : HINT_COPY.garden.noSeed),
    retire: (c) => c.everPlanted,
    // 4s of calm: arriving through a gate, or closing a maths popup. The gem
    // chime starts ~0.6s after an award and rings 2.8s, and hintShow yields to
    // any ringing sfx — 4s keeps the arrival and its sound together (Wren).
    delayMs: 4000,
    exitMs: 700, // the layer unmounts 600ms after the done beat (Fern + Linden, measured)
  },
]
