// Luxi Math's hint CONFIG — the game-specific half of the hint system.
// The engine (src/hints/) knows nothing about gardens; everything Luxi lives here.
// A new hint = one entry in GAME_HINTS (+ its line in gameHintsCopy.js).
import { HINT_COPY } from './gameHintsCopy'

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
 */
export function hintCtx({ mapId, hasPlot, garden, calm, gardenOpen }) {
  return {
    mapId,
    hasPlot: !!hasPlot,
    gardenOpen: !!gardenOpen,
    seeds: garden?.seeds ?? 0,
    everPlanted: everPlanted(garden),
    calm: !!calm,
  }
}

export const GARDEN_HINT_ID = 'garden-first-plant'

export const GAME_HINTS = [
  {
    // Amy: in a scene where she can grow a garden, an arrow on the garden,
    // and a toast if she hasn't grown any crop. Retires on her first planting.
    id: GARDEN_HINT_ID,
    target: { world: 'garden-bed' },
    when: (c) => c.mapId === 'town' && c.hasPlot,
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
