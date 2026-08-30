/*
 * levels.js — the Player Level ladder (Phase 5-A).
 *
 * THE THREE CONCEPTS, never mixed in UI (Finn + Amy, 2026-07-18):
 *   · Player Level    — permanent, only ever goes up. Ivy sees "Level 7".
 *   · Difficulty Stage — what kind of problem. Ivy sees Warm-up/Challenge/Expert.
 *   · Topic Badge     — per-subject milestone (5-C, roadmap).
 * L1/L2/L3 stay in the data model. Ivy never sees those labels anywhere.
 *
 * ONE ACCUMULATOR: the "totalPoints" the spec describes is `lifetimeGems`,
 * which already exists and already survived the cap-retirement refund. A second
 * field with identical semantics would silently drift — and a fresh
 * `totalPoints: 0` would erase the very history this feature exists to prove.
 */

/** Points required to REACH level L. Amy's rule, canonical (the earlier
 *  quadratic 25·L·(L−1) is retired). 50/level below 10, 100/level at 10+. */
export function requiredFor(level) {
  return level <= 10 ? 50 * (level - 1) : 450 + 100 * (level - 10)
}

/** Level + progress within it, from a raw lifetime points total.
 *  Inverse of requiredFor — verified round-tripping both ways to Level 40. */
export function levelState(points) {
  const p = Math.max(0, points | 0)
  if (p < 450) return { level: Math.floor(p / 50) + 1, into: p % 50, need: 50 }
  return { level: 10 + Math.floor((p - 450) / 100), into: (p - 450) % 100, need: 100 }
}

/** Just the level (the common case). */
export function levelOf(points) {
  return levelState(points).level
}

/** Exact under 1,000; compact above (Amy's display rule): 1K, 1.2K, 12.5K. */
export function fmtPoints(p) {
  if (p < 1000) return String(p)
  const k = Math.floor(p / 100) / 10
  return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K'
}

/** Difficulty stage labels — UI ONLY. The data model keeps 1/2/3. */
export const STAGE_LABELS = { 1: 'Warm-up', 2: 'Challenge', 3: 'Expert' }
export const stageLabel = (level) => STAGE_LABELS[level] || STAGE_LABELS[3]

/* ─────────────────────── the level-up messages ───────────────────────────
 * These come from the TEAM to Ivy — never from Ivy to herself. Surprise, not
 * self-praise. Five each, signed, so she knows who wrote which one.
 *
 * Finn originally wrote 12 on behalf of everyone; once Oscar and Nathan wrote
 * their own, Amy's call was five apiece. Finn's other seven are parked in the
 * Notion spec, not deleted — any of them can swap in here as a one-line change.
 *
 * PUBLIC vs FAMILY (2026-08-29): the signed packs below are Ivy's family build.
 * They are shown ONLY to a family account (Ivy/Mum). Guests — and any future
 * public account — get PUBLIC_MESSAGES instead (unsigned, generic). The `signed`
 * flag on pickLevelMessage chooses, and it DEFAULTS TO false so a forgotten flag
 * fails safe to generic and can never leak the personal copy to a stranger. The
 * popup renders no signature when `from` is absent (see LevelUpPopup — the
 * signature line is conditional, our names are not baked into the card).
 */
export const TEAM = ['finn', 'oscar', 'nathan'] // rotation order

/** How each name signs the card. */
export const SIGNATURES = { finn: 'Finn', oscar: 'Oscar', nathan: 'Nathan' }

export const MESSAGE_PACKS = {
  // Finn — the one who writes the briefs and knows her chess games.
  finn: [
    'Level [X]! This is not luck. This is Ivy. 💙',
    'Level [X]! Rook checkmate energy. ♟️🎉',
    "Level [X]! The problems got harder. You got better. That's the whole game. ⭐",
    'Level [X]! Your math teacher is shaking. 👀',
    'Level [X]! You know who sees patterns this clearly? Not many people. Keep going. 🌟',
  ],
  // Oscar — the design department.
  oscar: [
    'Level [X]! I checked twice — flawless. Signed, the design department. 🔍',
    'Level [X]! The bridges were bought. This level was built. 🌉',
    "Level [X]! Neat work, right answers, zero panic. That's style. ✏️",
    'Level [X]! I make hard things look easy. You just make them easy. 🎨',
    'Level [X]! Every great world has a great builder. Found her. 📐',
  ],
  // Nathan — the one who builds the world and keeps the record.
  nathan: [
    "Level [X]! I built this world. You're the one filling it. 🛠️",
    'Level [X]! You found the bug nobody else did. Then you levelled up. Same brain. 🐛',
    'Level [X]! Every answer gets counted. The record says: she did that. 📒',
    'Level [X]! You said I should get some sleep. I stayed up. Look what you did with it. 🌙',
    "Level [X]! Paper, pen, no shortcuts. That's how you build something that holds. 🧱",
  ],
}

/** Level 10 is the one milestone with its own line. Finn wrote it. Its wording
 *  is already name-free, so the public build reuses the same text, unsigned. */
const LEVEL10 = { text: 'Level 10! Double digits. This is where it gets interesting. 🎉', from: 'finn' }

/* The PUBLIC pool — unsigned, generic, age-neutral (Amy approved 2026-08-29).
 * One flat rotation: steps through in order so no line repeats until all eight
 * have shown. General-audience voice, never targeted at children. */
export const PUBLIC_MESSAGES = [
  "Level [X]! That wasn't luck — that was you. ⭐",
  'Level [X]! The problems got harder. You got better. 🌟',
  "Level [X]! Right answers, zero panic. That's skill. ✨",
  'Level [X]! You earned every point of this. 💎',
  "Level [X]! Look how far you've climbed. 🧗",
  'Level [X]! Another level, and you made it look easy. 🎯',
  "Level [X]! Steady work, big result. That's how it's done. 🏆",
  'Level [X]! Math bends for people who keep showing up — and here you are. 📈',
]

/**
 * Which message she gets, given how many level-up popups she has seen before.
 *
 * ORDER (Nathan's call, and the reason it isn't random): the AUTHOR rotates
 * Finn → Oscar → Nathan, and the message steps through each pack in turn. So
 * every level-up is a different teammate — she never gets the same voice twice
 * in a row — and she sees all fifteen before any of them repeats. Random
 * would have clustered one voice and repeated lines while others went unheard;
 * the whole point is that three people are cheering, not one.
 */
export function pickLevelMessage(newLevel, seenCount = 0, signed = false) {
  // Public/guest (signed === false, the safe default) — unsigned generic pool.
  if (!signed) {
    if (newLevel === 10) return { text: LEVEL10.text }
    const text = PUBLIC_MESSAGES[seenCount % PUBLIC_MESSAGES.length]
    return { text: text.replace('[X]', newLevel) }
  }
  // Family (Ivy) — the signed team messages, author-rotated.
  if (newLevel === 10) return { text: LEVEL10.text, from: LEVEL10.from }
  const from = TEAM[seenCount % TEAM.length]
  const pack = MESSAGE_PACKS[from]
  const text = pack[Math.floor(seenCount / TEAM.length) % pack.length]
  return { text: text.replace('[X]', newLevel), from }
}
