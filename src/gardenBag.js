/*
 * Grow a Garden ticket 10 — seed colours rotate (Finn's shuffle bag).
 *
 * Every seed she plants grows a different colour, so the next bloom is a
 * surprise. A shuffle bag, not a fixed order she could learn:
 *   - draw kinds out of the bag without repeating until every kind is used,
 *     then refill it with all of them;
 *   - NEVER the same kind twice in a row — including across a refill (the
 *     first draw of a fresh bag skips the kind just drawn).
 *
 * The bag lives in the save as `garden.bag = { left, last }`: `left` = kinds
 * still in this bag, `last` = the kind most recently planted (null = none
 * yet). Pure + `rand` injectable so it's unit-tested; the store owns when it's
 * called (at PLANT time — the colour is decided the moment the seed goes in).
 */

/** Draw the next seed kind. `kinds` = every kind that exists (order is only a
 *  tie-break for tests); `rand` returns [0, 1). Unknown or duplicate ids in an
 *  old/edited bag are ignored. Returns `{ kind, bag }` — a NEW bag, the input
 *  is never mutated. */
export function drawKind(bag, kinds, rand = Math.random) {
  if (!kinds.length) throw new Error('drawKind: no seed kinds')
  const last = bag && kinds.includes(bag.last) ? bag.last : null
  let left = [...new Set(((bag && bag.left) || []).filter((k) => kinds.includes(k)))]
  let pool = left.filter((k) => k !== last)
  if (!pool.length) {
    // bag used up (or holding only the kind just drawn): refill with every kind
    left = [...kinds]
    pool = left.filter((k) => k !== last)
    if (!pool.length) pool = left // only one kind exists — a repeat can't be avoided
  }
  const i = Math.min(pool.length - 1, Math.floor(rand() * pool.length))
  const kind = pool[i]
  return { kind, bag: { left: left.filter((k) => k !== kind), last: kind } }
}

/** A bag read from a save, made safe: `left` = known kinds only, no repeats,
 *  never the `last` kind; anything unreadable → an empty bag (refills on the
 *  next draw). `fallbackLast` is used when the save has no bag at all. */
export function normalizeBag(raw, kinds, fallbackLast = null) {
  if (!raw || typeof raw !== 'object') return { left: [], last: kinds.includes(fallbackLast) ? fallbackLast : null }
  const last = typeof raw.last === 'string' ? raw.last : null
  const left = Array.isArray(raw.left) ? [...new Set(raw.left.filter((k) => kinds.includes(k) && k !== last))] : []
  return { left, last }
}
