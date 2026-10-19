// Luxi Math in-game hint copy (Trail crew, owner: Clover).
// Every line is checked against the game code. Rules: 8 words or fewer, one idea,
// an emoji only where it helps a non-reader, no clocks, no spend nudges, no
// promises about the basket. Facts this copy relies on (store.js / config.js,
// checked 2026-10-17 on 84a0cd7):
//   - a NEW save starts with NO seed (2026-10-18): her first seed is the lucky
//     station's welcome gift (her first correct answer anywhere). Saves from
//     before keep their ONE free seed (normalizeGarden).
//   - more seeds come from LIFETIME gems: 1 per GARDEN.seedEveryGems (20).
//     NOT from levelling up.
//   - the one garden bed is in Sunny Town (mapId 'town').
//   - conservation law: seeds + (planted ? 1 : 0) + harvests = starter + seedsGranted,
//     so a kid who has never planted holds a seed once starter is 1 (the gift).
//     Before the gift a new player holds 0 — the garden hint waits for the gift.

export const HINT_COPY = {
  garden: {
    // The main line: she is in Sunny Town, has never planted, holds a seed.
    plant: 'Plant your seed in the garden 🌱',
    // Fallback only: the garden hint waits until she holds a seed (the welcome
    // gift), so this shows only for an edited save. Seeds come from gems.
    noSeed: 'Earn gems to get a seed 💎',
  },
  // The lucky station (2026-10-18): a NEW player's welcome gift. Amy: say
  // "Welcome gift" clearly. Facts: her first correct answer ANYWHERE pays
  // WELCOME.gems (3) + her first seed (store.claimWelcomeGift); the seed grows
  // FLOWERS (not a crop) in the bed in Sunny Town (town.gardenPlot).
  lucky: {
    pill: 'Welcome gift! Solve it to open 🎁',
    // the win, in three beats (one idea each)
    title: 'Welcome gift! 🎉',
    got: '3 gems 💎 and 1 seed 🌱',
    next: 'Plant it in Sunny Town 🌸',
    ok: 'Yay! ✨',
    // the station's skin (MathPopup banner + ask line)
    tag: 'Lucky station',
    ask: 'Solve it to open your welcome gift!',
  },
  // Shared controls for every hint toast.
  dismiss: {
    label: '✕',
    aria: 'Not now',
  },
}

export default HINT_COPY
