// Luxi Math in-game hint copy (Trail crew, owner: Clover).
// Every line is checked against the game code. Rules: 8 words or fewer, one idea,
// an emoji only where it helps a non-reader, no clocks, no spend nudges, no
// promises about the basket. Facts this copy relies on (store.js / config.js,
// checked 2026-10-17 on 84a0cd7):
//   - every save starts with ONE free seed (freshGarden: seeds 1); old saves from
//     before the garden get the same via normalizeGarden.
//   - more seeds come from LIFETIME gems: 1 per GARDEN.seedEveryGems (20).
//     NOT from levelling up.
//   - the one garden bed is in Sunny Town (mapId 'town').
//   - conservation law: seeds + (planted ? 1 : 0) + harvests = 1 + seedsGranted,
//     so a kid who has never planted ALWAYS holds at least one seed.

export const HINT_COPY = {
  garden: {
    // The main line: she is in Sunny Town, has never planted, holds a seed.
    plant: 'Plant your seed in the garden 🌱',
    // Fallback only. Under "retire on first plant" this state cannot happen
    // (never planted => seeds >= 1). Kept true in case a hand-edited save has
    // seeds 0. Seeds come from gems, so the line says gems.
    noSeed: 'Earn gems to get a seed 💎',
  },
  // Shared controls for every hint toast.
  dismiss: {
    label: '✕',
    aria: 'Not now',
  },
}

export default HINT_COPY
