/*
 * topicMeta.js — how the DATA MODEL's topics are shown to Ivy (Phase 5-B).
 *
 * WHY THIS FILE EXISTS: the store keys `topicProgress` by TOPIC ID
 * (`long-mult`, `mult-2x1`, `add-2x2` — see TOPICS in math.js), but those are
 * engineering names and there are more of them than there are things a kid
 * thinks about. Oscar's progress popup speaks in subjects: "Multiplication",
 * "Division". This is the one place the two vocabularies meet.
 *
 * Getting this wrong is invisible and total: a card that doesn't match a real
 * topic id simply renders nothing, so Ivy would open her record book after a
 * week of work and read "Start playing to fill this in." The fixtures in
 * __tests__/topicMeta.test.js exist to make that failure impossible — in
 * particular, EVERY topic in TOPICS must be claimed by exactly one card, so
 * when Finn's C2 long division lands, forgetting this file fails CI instead of
 * quietly hiding her division work.
 *
 * No dependency on math.js on purpose: this is a display map, and levels.js
 * (its sibling) is deliberately dependency-free so its tests never drag the
 * store — and through it auth — into the import graph (the A2 CI lesson). The
 * drift test imports both and asserts they agree.
 */

/**
 * `topics` — the real topicProgress ids merged into this card.
 * `stages`  — how many difficulty rungs this subject actually HAS. Must equal
 *             the highest `topLevel` among its topics (CI-enforced).
 *             1 = no ladder to climb → the card shows a single total instead
 *             of a Warm-up/Challenge/Expert list, because rows that read "0"
 *             forever aren't "not yet", they're "never" (Amy, 2026-07-25).
 */
export const TOPIC_META = {
  multiplication: {
    label: 'Multiplication',
    icon: '×',
    // long-mult is the C1 frontier (3 rungs); mult-2x1 is the confidence pool
    // and only ever has rung 1 — which is exactly what "Warm-up" means here,
    // so merging them is honest rather than a fudge.
    topics: ['long-mult', 'mult-2x1'],
    stages: 3,
  },
  addition: {
    label: 'Addition',
    icon: '+',
    topics: ['add-2x2'],
    // One rung by design — column addition is a supporting skill today, not a
    // graded ladder. Amy: show the total for now; revisit the addition concept
    // as a lower-grade topic if the app ever goes public.
    stages: 1,
  },

  /* ── The curriculum roadmap. These render the moment their topics exist and
     have counts; until then they're invisible (a kid needs no backlog). Adding
     C2 = give `division` its topic id here — the fixture will insist on it. */
  division: { label: 'Division', icon: '÷', topics: [], stages: 3 }, // C2
  fractions: { label: 'Fractions', icon: '½', topics: [], stages: 3 }, // C3
  decimals: { label: 'Decimals', icon: '.5', topics: [], stages: 3 }, // C4
}

/** Display order: her frontier first, supporting skills last. */
export const TOPIC_ORDER = ['multiplication', 'division', 'fractions', 'decimals', 'addition']

/**
 * Merge the real topics behind one card into per-stage solved counts.
 * Counts `correct` only — never `seen`, so nothing here can imply accuracy
 * (Design Principle 4: show what she's done, never grade what she missed).
 */
export function stageCounts(topicProgress, meta) {
  const by = {}
  for (const id of meta.topics) {
    const byLevel = topicProgress?.[id]?.byLevel
    if (!byLevel) continue
    for (const n of Object.keys(byLevel)) {
      by[n] = (by[n] || 0) + (byLevel[n]?.correct || 0)
    }
  }
  return by
}

/** Everything she's solved in this subject. 0 ⇒ the card doesn't render. */
export function topicTotal(topicProgress, meta) {
  const by = stageCounts(topicProgress, meta)
  return Object.values(by).reduce((s, n) => s + n, 0)
}

/** The cards that have something to show, in display order. */
export function startedTopics(topicProgress) {
  return TOPIC_ORDER.filter((k) => topicTotal(topicProgress, TOPIC_META[k]) > 0)
}
