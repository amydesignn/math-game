/*
 * math.js — the problem engine (Phase 4, extended for curriculum phase C1).
 *
 * A problem is { type, level, op, a, b, similar:{a,b} }.
 *  - `type`  = topic id ('long-mult' | 'mult-2x1' | 'add-2x2') — Oscar's third
 *    axis: Skin × Problem × Representation. All three current types share the
 *    column-grid representation; fractions (C4) will register a new one.
 *  - `level` = the topic's difficulty-ladder rung the problem was generated at.
 *  - `similar` = a DIFFERENT problem of the same shape AND same carry class,
 *    used for the worked example — Ivy follows the method, never copies.
 *
 * ✅ THE C1 LADDER IS NOW CALIBRATED (2026-07-18). Finn's C1 topic spec + the
 * 10 real problems from Ivy's workbook landed and are locked in as CI fixtures
 * (src/__tests__/calibration.test.js) — the deploy fails if the generator
 * drifts from the curriculum. Gems per correct = ladder level (L1=1/L2=2/L3=3).
 * Still FINN-SPEC (provisional): the generator's numeric RANGES and the 70/30
 * session mix — those are Layer-2 scheduler work, not levelling.
 */

import { getState, setTopicLevel } from './store'

export const OPSYM = { '+': '+', '×': '×', '-': '−', '÷': '÷' }
// NOTE: solve() intentionally does NOT handle '÷' — a division answer is a
// quotient + remainder, not one number. The division ask compares the typed
// quotient AND remainder against `problem.quotient` / `problem.remainder`
// directly (see MathPopup's ÷ branch), so it never routes through solve().
export const solve = (op, a, b) => (op === '+' ? a + b : op === '×' ? a * b : a - b)

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))

/* ── carry anatomy ─────────────────────────────────────────────────── */
const addCarries = (a, b) => (a % 10) + (b % 10) > 9
const mulCarries = (a, b) => b * (a % 10) > 9 // 2×1: carry within the product

/**
 * Does the partial product `a × d` carry at ANY column?
 * NOTE (calibration finding, 2026-07-18): this must walk every column, not just
 * the ones digit. 53 × 32 carries at the TENS step of each partial (2×5=10) and
 * nowhere else — the old ones-digit-only check graded it L1 (easiest) when it is
 * really L3. Finn's calibration set caught it; see src/__tests__/calibration.
 */
function partialCarries(a, d) {
  let x = a
  while (x > 0) {
    if ((x % 10) * d > 9) return true
    x = Math.floor(x / 10)
  }
  return false
}

// Long multiplication carry anatomy: the two partial products (for the worked
// example) plus whether each one carries.
function longMultAnatomy(a, b) {
  const bo = b % 10
  const bt = Math.floor(b / 10)
  return {
    p1: a * bo,
    p2: a * bt * 10,
    p1Carries: partialCarries(a, bo),
    p2Carries: partialCarries(a, bt),
  }
}

/**
 * C1 ladder — Finn's C1 Topic Spec, calibrated against the 10 real problems
 * from Ivy's Grade 5 workbook (Unit 4, pp.18–19). The level is the count of
 * PARTIAL PRODUCTS that carry:
 *   L1 — neither partial carries. A carry in the FINAL ADDITION is fine here
 *        (calibration #2, 34 × 22: "partials clean; one carry in final add" =
 *        L1). The lesson at L1 is the algorithm's shape, not carry pressure.
 *   L2 — exactly one partial carries. One pressure point at a time.
 *   L3 — both partials carry. Real Grade 5/6 territory.
 * Locked by src/__tests__/calibration.test.js — CI fails if this drifts.
 */
export function levelOfLongMult(a, b) {
  const { p1Carries, p2Carries } = longMultAnatomy(a, b)
  return (p1Carries ? 1 : 0) + (p2Carries ? 1 : 0) + 1
}

/* ── long division (C2) — Finn's C2 spec + grade-tagging note ───────────
 * Divisor 2–9 (dividing by 1 is trivial). Dividend by RELEASE PHASE, which Amy
 * flips by hand when Ivy is ready — no mastery gate yet (Finn). The phase IS a
 * grade band in disguise (Finn's grade note): P1 = Grade 5, P2 = Grade 6.
 * Phase 3 (mixed 2-/3-digit) waits until Phase 2 settles — add here when it does.
 */
export const DIV_PHASE = 1 // 1 = 2-digit dividend (G5) · 2 = 3-digit (G6)
const DIV_DIVIDEND = { 1: [10, 99], 2: [100, 999] }
const DIV_GRADE = { 1: 5, 2: 6 }

/** Finn's C2 payout: Phase 1 flat 1 gem · Phase 2 standard 2, sneaky-zero 3.
 *  Exported + phase-parameterised so BOTH phases' rules are unit-tested now,
 *  before Phase 2 is ever flipped on — and so the payout lives in ONE place the
 *  station loop can't accidentally flatten (the `p.gems = p.level` trap). */
export function divGems(sneakyZero, phase = DIV_PHASE) {
  return phase === 1 ? 1 : sneakyZero ? 3 : 2
}

/**
 * Quotient, remainder, and the SNEAKY-ZERO flag = a 0 in a NON-leading place of
 * the quotient (203, 10 — the interior/trailing zeros standard long division
 * must still write to keep the line). A leading digit that doesn't divide is NOT
 * a sneaky zero: 15 ÷ 4 = 3, never "03". Finn pays extra for the sneaky zero in
 * Phase 2 — it's Ivy's diagnosed "results go underground" slip.
 */
function divAnatomy(a, b) {
  const quotient = Math.floor(a / b)
  const qStr = String(quotient)
  return { quotient, remainder: a % b, sneakyZero: qStr.length > 1 && qStr.slice(1).includes('0') }
}

/** A DIFFERENT division of the same difficulty ANATOMY (same has-remainder AND
 *  same sneaky-zero shape) for the worked example — so the method transfers. */
function similarLongDiv(a, b, an) {
  const [lo, hi] = DIV_DIVIDEND[DIV_PHASE]
  let s
  let guard = 0
  do {
    const bb = rand(2, 9)
    const aa = rand(lo, hi)
    const sn = divAnatomy(aa, bb)
    s = { a: aa, b: bb, quotient: sn.quotient, remainder: sn.remainder, sneakyZero: sn.sneakyZero }
  } while ((s.a === a || s.sneakyZero !== an.sneakyZero || (s.remainder > 0) !== (an.remainder > 0)) && guard++ < 500)
  return s
}

/* ── topic registry ────────────────────────────────────────────────── */
// Each topic: generate(level) → problem, topLevel, and its mix role.
// FINN-SPEC: ranges + level rules are provisional data.
export const TOPICS = {
  'long-mult': {
    name: 'Long multiplication',
    topLevel: 3,
    grade: 5, // Finn's grade tag — long multiplication (2×2-digit) = Grade 5
    levelUpAfter: 5, // correct at current level → next rung (FINN-SPEC)
    generate(level) {
      const range = level === 1 ? [12, 43] : level === 2 ? [12, 69] : [24, 89]
      let a, b
      let guard = 0
      do {
        a = rand(range[0], range[1])
        b = rand(12, level === 1 ? 43 : level === 2 ? 49 : 89)
      } while (levelOfLongMult(a, b) !== level && guard++ < 500)
      const similar = similarLongMult(a, b, level)
      // gems per correct = ladder level (Finn's C1 spec: L1=1 · L2=2 · L3=3).
      // Carried on the problem so BOTH encounters pay the same — a sparkle and
      // a station problem of equal difficulty are worth the same to her.
      return { type: 'long-mult', level, op: '×', a, b, similar, gems: level }
    },
  },
  'mult-2x1': {
    name: 'Multiplication (2-digit × 1-digit)',
    topLevel: 1,
    grade: 4, // confidence pool — pre-C1 (≈ Grade 4)
    levelUpAfter: Infinity,
    generate() {
      const a = rand(12, 49)
      const b = rand(2, 6)
      let s
      do {
        s = { a: rand(12, 49), b: rand(2, 6) }
      } while (s.a === a || mulCarries(s.a, s.b) !== mulCarries(a, b))
      return { type: 'mult-2x1', level: 1, op: '×', a, b, similar: s, gems: 1 }
    },
  },
  'add-2x2': {
    name: 'Column addition',
    topLevel: 1,
    grade: 4, // confidence pool — pre-C1 (≈ Grade 4)
    levelUpAfter: Infinity,
    generate() {
      const a = rand(14, 68)
      const b = rand(13, 59)
      let s
      do {
        s = { a: rand(14, 68), b: rand(13, 59) }
      } while (s.a === a || addCarries(s.a, s.b) !== addCarries(a, b))
      return { type: 'add-2x2', level: 1, op: '+', a, b, similar: s, gems: 1 }
    },
  },
  'long-div': {
    name: 'Long division',
    // FLAT band — Finn's C2 spec has no in-topic ladder; the phases are RELEASE
    // bands (Amy flips DIV_PHASE), not difficulty rungs. So topLevel 1, never up.
    topLevel: 1,
    levelUpAfter: Infinity,
    grade: DIV_GRADE[DIV_PHASE], // phase-level grade (Finn): P1 = G5, P2 = G6
    generate() {
      const [lo, hi] = DIV_DIVIDEND[DIV_PHASE]
      const wantRem = Math.random() < 0.5 // Finn's ~50/50 with/without remainder (the tuning knob)
      let a, b, an
      let guard = 0
      do {
        b = rand(2, 9)
        a = rand(lo, hi)
        an = divAnatomy(a, b)
      } while ((an.remainder > 0) !== wantRem && guard++ < 200)
      // Payout carried on the problem so a sparkle and a station problem pay the
      // same (Finn's C2 rule, via the shared helper).
      const gems = divGems(an.sneakyZero)
      return {
        type: 'long-div', level: 1, op: '÷', a, b,
        quotient: an.quotient, remainder: an.remainder, sneakyZero: an.sneakyZero,
        grade: DIV_GRADE[DIV_PHASE], gems, similar: similarLongDiv(a, b, an),
      }
    },
  },
}

function similarLongMult(a, b, level) {
  let s
  let guard = 0
  do {
    s = { a: rand(12, 89), b: rand(12, 89) }
  } while ((s.a === a || levelOfLongMult(s.a, s.b) !== level) && guard++ < 500)
  return s
}

/* ── session mix + progression ─────────────────────────────────────── */

/**
 * Next problem for a gem. C1 is the frontier topic; the pre-C1 shapes stay in
 * the mix as confidence problems. FINN-SPEC: 70/30 frontier/confidence is the
 * provisional stand-in for the session-mix rule (the full 30%-confidence /
 * 75–85%-band scheduler is Layer-2 work with its own phase).
 */
export function nextProblem() {
  // TWO frontier topics now: multiplication (C1, retained via spacing) and
  // division (C2, her new school focus). Even frontier split; the pre-C1 shapes
  // stay the confidence pool. FINN-SPEC: the 35/35/30 mix is a provisional
  // one-line tune (division-first weighting is a knob if Finn wants it).
  const roll = Math.random()
  if (roll < 0.35) return TOPICS['long-mult'].generate(currentLevel('long-mult'))
  if (roll < 0.7) return TOPICS['long-div'].generate()
  return TOPICS[Math.random() < 0.6 ? 'mult-2x1' : 'add-2x2'].generate()
}

/** The topic's current ladder rung (diagnostic sets the start; store persists). */
export function currentLevel(topicId) {
  const t = getState().topicProgress[topicId]
  return Math.min(TOPICS[topicId].topLevel, Math.max(1, t?.level ?? 1))
}

/**
 * A station's problem list. Oscar's locked rule: ONE skill per station (variety
 * lives BETWEEN stations, never inside one) — so all `count` problems come from
 * a SINGLE topic, chosen frontier-weighted like the sparkle mix, at her current
 * ladder level. Each problem's `gems` payout = the level she solved it at
 * (L1=1 … L3=3), per the economy spec. Length is data — 2 today, 3 later.
 */
export function generateStation(count = 2) {
  const roll = Math.random()
  const topicId = roll < 0.35 ? 'long-mult' : roll < 0.7 ? 'long-div' : Math.random() < 0.6 ? 'mult-2x1' : 'add-2x2'
  const level = currentLevel(topicId)
  const problems = []
  let guard = 0
  while (problems.length < count && guard++ < 200) {
    const p = TOPICS[topicId].generate(level)
    if (problems.some((q) => q.a === p.a && q.b === p.b)) continue // no repeat in one quest
    // Payout stays exactly as the generator set it: long-mult by ladder level,
    // long-div by Finn's phase rule (flat 1 in P1, the sneaky-zero bump in P2).
    // The old `p.gems = p.level` line is GONE on purpose — it was redundant for
    // multiplication (generate already sets gems=level) and would flatten
    // division's Phase-2 bump to 1. Never reintroduce it.
    problems.push(p)
  }
  return problems
}

/**
 * Level-up check, called after each recorded answer: `levelUpAfter` correct at
 * the current rung advances her one rung (never past the top; never down —
 * the worked example is the struggle-support, not demotion).
 */
export function maybeLevelUp(topicId) {
  const topic = TOPICS[topicId]
  const t = getState().topicProgress[topicId]
  if (!t || t.level >= topic.topLevel) return
  const at = t.byLevel?.[t.level]
  if (at && at.correct >= topic.levelUpAfter) setTopicLevel(topicId, t.level + 1)
}

// QA hook (dev builds only): exercise the engine from the console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__math = {
    nextProblem, buildStages: (p) => buildStages(p), buildStagesMulti, TOPICS, currentLevel,
    divProblem: () => TOPICS['long-div'].generate(), buildDivisionStages, divideSteps,
  }
}

/* ══════════════════ WORKED-EXAMPLE BUILDERS ═══════════════════════ */
/*
 * All builders emit the ROWS model ColumnMath renders:
 *   { cols, rows: [{ id, cells, lead?, note?, style? } | { rule: true }], hi }
 * cells are right-aligned strings, one per column; hi keys are `${rowId}-${i}`
 * (i = column index). Visual language is Oscar's — only the shape generalized
 * so partial-product rows fit (long multiplication needs them).
 */

const padTo = (n, cols) => {
  const s = n === '' ? '' : String(n)
  return Array.from({ length: cols }, (_, i) => s[s.length - cols + i] ?? '')
}

export function buildStages(problem) {
  const { op, a, b } = problem
  if (problem.type === 'long-mult') return buildLongMult(a, b)
  if (op === '+') return buildAdd(a, b)
  return buildMult2x1(a, b)
}

/* ---- C1 v2: multi-digit multiplier worked example (Oscar's comp, lifted
   1:1 from ~/Downloads/math-worked-example-v2.html). Solves OPERAND-TRACKING,
   Ivy's confirmed failure (Finn's diagnosis): the top number stays WHOLE in a
   capsule, the active multiplier digit is spotlighted, and the tens-pass zero
   placeholder is WRITTEN, never "remembered". Snap model is Oscar's (not the
   rows model) — MultiColumnMath renders it. The shared WorkedExample routes
   here when op==='×' && b>=10; buildLongMult above is the rows-model fallback,
   superseded for the actual worked example by this. */
const pad4 = (n) => padTo(n, 4)

export function buildStagesMulti(a, b) {
  const bO = b % 10, bT = Math.floor(b / 10)
  const p1 = a * bO, p2 = a * bT, answer = a * b
  const blank = () => ({ top: pad4(a), bO, bT, spot: null, row1: pad4(''), row2: pad4(''), sum: pad4(''), hiRow: null, zeroHot: false, shifted: false, carry: pad4(''), carryHot: false })
  const stages = []
  let s
  s = blank()
  stages.push({ caption: `${a} stays WHOLE — it's the whole team, we never split it apart. We'll take the bottom digits one at a time, right to left.`, snap: s })
  // ones pass — if it carries, show the school's "remember it on top" move once
  const aO = a % 10, aT = Math.floor(a / 10)
  const oProd = aO * bO, oWrite = oProd % 10, oCarry = Math.floor(oProd / 10)
  if (oCarry > 0) {
    s = blank(); s.spot = 'O'; s.row1 = ['', '', '', String(oWrite)]; s.carry[2] = String(oCarry); s.carryHot = true; s.hiRow = 'row1'
    stages.push({ caption: `Ones pass: spotlight the ${bO}. Start small: ${aO} × ${bO} = ${oProd} — write the ${oWrite}, and pop the ${oCarry} up top in yellow so we remember to add it.`, snap: s })
    s = blank(); s.spot = 'O'; s.row1 = pad4(p1); s.carry[2] = String(oCarry); s.hiRow = 'row1'
    stages.push({ caption: `Keep going: ${aT} × ${bO} = ${aT * bO}, plus the ${oCarry} waiting on top = ${aT * bO + oCarry}. Row 1 is ${p1}.`, snap: s })
  } else {
    s = blank(); s.spot = 'O'; s.row1 = pad4(p1); s.hiRow = 'row1'
    stages.push({ caption: `Ones pass: spotlight the ${bO}. Whole ${a} × ${bO} = ${p1}. Write it as row 1, starting under the ones.`, snap: s })
  }
  s = blank(); s.spot = 'T'; s.row1 = pad4(p1); s.row2 = pad4('0'); s.zeroHot = true; s.shifted = true; s.hiRow = 'row2'
  stages.push({ caption: `Tens pass: spotlight the ${bT}. It's not really ${bT} — it's ${bT}0! So this row slides one place left. Write a 0 in the ones spot first, so nothing sneaks in there.`, snap: s })
  s = blank(); s.spot = 'T'; s.row1 = pad4(p1); s.row2 = pad4(p2 * 10); s.shifted = true; s.hiRow = 'row2'
  stages.push({ caption: `Now the same move as before: whole ${a} × ${bT} = ${p2}. Write it next to the zero — that makes ${p2 * 10}.`, snap: s })
  s = blank(); s.row1 = pad4(p1); s.row2 = pad4(p2 * 10); s.sum = pad4(answer); s.hiRow = 'sum'
  stages.push({ caption: `Both passes done! Add the rows: ${p1} + ${p2 * 10} = ${answer}.`, snap: s })
  return { stages, answer }
}

function baseRows(cols, a, op, b) {
  return () => ({
    cols,
    rows: [
      { id: 'carry', cells: padTo('', cols), style: 'carry' },
      { id: 'top', cells: padTo(a, cols) },
      { id: 'bot', cells: padTo(b, cols), lead: OPSYM[op] },
      { rule: true },
      { id: 'res', cells: padTo('', cols) },
    ],
    hi: [],
  })
}

const row = (snap, id) => snap.rows.find((r) => r.id === id)

/* ---- column addition (Oscar's original, re-emitted as rows) ---- */
function buildAdd(a, b) {
  const answer = a + b
  const A = { T: Math.floor(a / 10) % 10, O: a % 10 }
  const B = { T: Math.floor(b / 10) % 10, O: b % 10 }
  const blank = baseRows(3, a, '+', b)
  const stages = []

  const onesSum = A.O + B.O, oDigit = onesSum % 10, c1 = Math.floor(onesSum / 10)
  const tensSum = A.T + B.T + c1, tDigit = tensSum % 10, c2 = Math.floor(tensSum / 10)

  let s
  s = blank()
  stages.push({ caption: 'Stack them so the ones line up under the ones.', snap: s })

  s = blank()
  row(s, 'res').cells[2] = String(oDigit)
  if (c1) row(s, 'carry').cells[1] = '1'
  s.hi = ['top-2', 'bot-2', 'res-2']
  stages.push({ caption: `Add the ones: ${A.O} + ${B.O} = ${onesSum}.` + (c1 ? ` That's more than 9 — write ${oDigit} and carry the 1.` : ` Write ${oDigit}.`), snap: s })

  s = blank()
  row(s, 'res').cells[2] = String(oDigit)
  if (c1) row(s, 'carry').cells[1] = '1'
  row(s, 'res').cells[1] = String(tDigit)
  if (c2) row(s, 'res').cells[0] = String(c2)
  s.hi = ['top-1', 'bot-1', 'res-1'].concat(c1 ? ['carry-1'] : [])
  stages.push({ caption: `Add the tens: ${A.T} + ${B.T}${c1 ? ' + 1' : ''} = ${tensSum}. Write ${c2 ? tensSum : tDigit}.`, snap: s })

  s = blank()
  row(s, 'res').cells = padTo(answer, 3)
  if (c1) row(s, 'carry').cells[1] = '1'
  s.hi = ['res-0', 'res-1', 'res-2'].filter((k) => k !== 'res-0' || answer >= 100)
  stages.push({ caption: `Put it together: ${answer}.`, snap: s })

  return { stages, answer }
}

/* ---- 2-digit × 1-digit (Oscar's original, re-emitted as rows) ---- */
function buildMult2x1(a, b) {
  const answer = a * b
  const A = { T: Math.floor(a / 10) % 10, O: a % 10 }
  const blank = baseRows(3, a, '×', b)
  const stages = []

  const onesP = b * A.O, oDigit = onesP % 10, carry = Math.floor(onesP / 10)
  const tensBase = b * A.T, tensP = tensBase + carry
  const tD = tensP % 10, tH = Math.floor(tensP / 10)

  let s
  s = blank()
  stages.push({ caption: 'Line up the ones, with the × underneath.', snap: s })

  s = blank()
  row(s, 'res').cells[2] = String(oDigit)
  if (carry) row(s, 'carry').cells[1] = String(carry)
  s.hi = ['top-2', 'bot-2', 'res-2']
  stages.push({ caption: `Multiply the ones: ${b} × ${A.O} = ${onesP}.` + (carry ? ` Write ${oDigit}, carry the ${carry}.` : ` Write ${oDigit}.`), snap: s })

  s = blank()
  row(s, 'res').cells[2] = String(oDigit)
  if (carry) row(s, 'carry').cells[1] = String(carry)
  row(s, 'res').cells[1] = String(tD)
  if (tH) row(s, 'res').cells[0] = String(tH)
  s.hi = ['top-1', 'bot-2'].concat(carry ? ['carry-1'] : []).concat(tH ? ['res-0', 'res-1'] : ['res-1'])
  stages.push({ caption: `Multiply the tens: ${b} × ${A.T} = ${tensBase}.` + (carry ? ` Add the ${carry} you carried: ${tensBase} + ${carry} = ${tensP}.` : ''), snap: s })

  s = blank()
  row(s, 'res').cells = padTo(answer, 3)
  s.hi = ['res-0', 'res-1', 'res-2'].filter((k) => k !== 'res-0' || answer >= 100)
  stages.push({ caption: `Read it together: ${answer}.`, snap: s })

  return { stages, answer }
}

/* ══════════════════ C2 — LONG DIVISION WALKTHROUGH ═══════════════════ */
/*
 * buildDivisionStages(a, b) — the pedagogy of Oscar's "Let's share the candy"
 * comp, as a list of `snap` view-states the <DivisionWalkthrough> diagram
 * renders (bracket notation, not the column grid — long division's
 * representation genuinely differs, per math-game-topic §4). Pure + framework-
 * free so it stays unit-testable; the React lives in DivisionWalkthrough.jsx.
 *
 * ✅ STANDARD long division (fixed 2026-08-23, C2 Phase 1): the first quotient
 * digit sits above the LAST digit of the smallest leading group b divides into —
 * NO leading zero is ever written (15 ÷ 4 = 3, never "03"). Leading digits that
 * can't be divided are absorbed into that first group. INTERIOR/TRAILING zeros
 * (815 ÷ 4 = 203, 90 ÷ 9 = 10) are the real "sneaky zeros" and keep their
 * celebration. The pre-fix build wrote a leading "0" and mis-celebrated it as a
 * sneaky zero for every first-digit-<-divisor problem (~a third of Phase 1);
 * Track 1 only ever tested 8xx ÷ 4, which hid it.
 *
 * Model: one STEP per quotient digit (indexed by si), each aligned to a dividend
 * COLUMN (step.col). Four-move spine DIVIDE → MULTIPLY → SUBTRACT → BRING DOWN,
 * then a FINAL seal.
 */
export function divideSteps(a, b) {
  const digits = String(a).split('').map(Number)
  const n = digits.length
  // startCol = last column of the smallest leading group that b divides into;
  // the leading digits before it are absorbed (no leading zero is written).
  let acc = 0
  let startCol = 0
  while (startCol < n) {
    acc = acc * 10 + digits[startCol]
    if (acc >= b) break
    startCol++
  }
  const steps = []
  let carry = 0
  for (let col = startCol; col < n; col++) {
    const w = col === startCol ? acc : carry * 10 + digits[col]
    const qd = Math.floor(w / b)
    const prod = qd * b
    steps.push({ col, w, qd, prod, sub: w - prod, first: col === startCol })
    carry = w - prod
  }
  return { digits, n, startCol, steps, remainder: carry, quotient: Number(steps.map((s) => s.qd).join('')) }
}

export function buildDivisionStages(a, b) {
  const { digits, n, startCol, steps, remainder, quotient } = divideSteps(a, b)
  const quotientNum = String(quotient)
  const candies = (v) => (String(v) === '1' ? 'candy' : 'candies')

  // quotient digit per COLUMN (blank for the absorbed leading columns)
  const q = Array(n).fill('')
  steps.forEach((s) => { q[s.col] = String(s.qd) })

  // the number being shared at step si, as a string:
  //   first step  → the leading group ("15" for 15÷4, "8" for 85÷4)
  //   later steps → leftover + brought-down digit ("01" for the 815÷4 zero)
  const groupStr = (si) =>
    si === 0 ? String(steps[0].w) : String(steps[si - 1].sub) + String(digits[steps[si].col])
  // Sharing-Table rectangle for step si (dividend row + the columns it spans)
  const tableFor = (si) =>
    si === 0 ? { row: 1, cols: [0, startCol] } : { row: 1 + 2 * si, cols: [steps[si].col - 1, steps[si].col] }

  const st = {
    qShown: Array(n).fill(false), qSneaky: Array(n).fill(false), dim: Array(n).fill(false),
    multShown: Array(steps.length).fill(false), subShown: Array(steps.length).fill(false),
    bdShown: Array(steps.length).fill(false),
    table: null, move: null, round: null, final: false, celebrate: null,
  }
  const stages = []
  // deep-clone the mutable state into an immutable stage snapshot (Oscar's snap)
  const snap = (caption, hot) => {
    const s = JSON.parse(JSON.stringify({
      qShown: st.qShown, qSneaky: st.qSneaky, dim: st.dim,
      multShown: st.multShown, subShown: st.subShown, bdShown: st.bdShown,
      table: st.table, move: st.move, round: st.round, final: st.final, celebrate: st.celebrate,
    }))
    s.caption = caption
    s.hot = hot || {}
    stages.push(s)
  }

  // ── intro ──
  st.move = null; st.round = null; st.table = null
  snap(`We have ${a} candies to share equally among ${b} friends. Let's find out how many each friend gets! 🍬`)
  st.dim = digits.map((_, i) => i > startCol); st.table = tableFor(0)
  snap(startCol === 0
    ? `We only look at a little at a time. This glowing box is the Sharing Table — the candies we're splitting right now. The faded ones wait their turn.`
    : `${b} can't share just ${digits[0]}, so we look at the first ${startCol + 1} digits together — ${groupStr(0)}. That glowing box is the Sharing Table; the faded candies wait their turn.`)

  // ── one round per quotient digit ──
  for (let si = 0; si < steps.length; si++) {
    const s = steps[si]
    const col = s.col
    const last = si === steps.length - 1
    st.round = si; st.table = tableFor(si)
    st.move = 'DIVIDE'; st.qShown[col] = true; st.qSneaky[col] = s.qd === 0
    if (s.qd === 0) {
      st.celebrate = 'sneaky'
      snap(`How many times does ${b} fit into ${groupStr(si)}? It can't — not even once! So each friend gets 0 here. We still WRITE the 0 so the shares stay lined up. You caught the sneaky zero! 🎉`, { q: col })
    } else {
      st.celebrate = null
      snap(`How many times does ${b} fit into ${groupStr(si)}? ${s.qd}! Each friend gets ${s.qd} so far. 🔎`, { q: col })
    }
    st.move = 'MULTIPLY'; st.multShown[si] = true; st.celebrate = null
    snap(`Now count what we handed out: ${s.qd} for each of the ${b} friends = ${s.qd} × ${b} = ${s.prod} ${candies(s.prod)}.`, { mult: si })
    st.move = 'SUBTRACT'; st.subShown[si] = true; st.celebrate = 'round'
    snap(last
      ? `${groupStr(si)} − ${s.prod} = ${s.sub}. ${s.sub > 0 ? `That's the remainder — ${s.sub} leftover ${candies(s.sub)}! 🍬` : 'It shares perfectly evenly — nothing left over! 🎉'}`
      : `${groupStr(si)} − ${s.prod} = ${s.sub}. ${s.sub === 0 ? 'Nothing left in this group! ✨' : `${s.sub} ${candies(s.sub)} still waiting to be shared.`}`,
      { sub: si })
    if (!last) {
      const nextCol = steps[si + 1].col
      st.move = 'BRINGDOWN'; st.bdShown[si] = true; st.round = si + 1; st.table = tableFor(si + 1)
      st.dim = digits.map((_, i) => i > nextCol); st.celebrate = null
      const lastBring = si + 1 === steps.length - 1
      snap(`Invite the ${lastBring ? 'last' : 'next'} candy down! Bring the ${digits[nextCol]} down to join the leftover. Now we're sharing ${groupStr(si + 1)}. ⬇️`, { bd: si })
    }
  }
  st.move = null; st.table = null; st.final = true; st.round = null; st.celebrate = 'final'
  snap(`Done! Each of the ${b} friends gets ${quotientNum} ${candies(quotientNum)}${remainder > 0 ? `, with ${remainder} left over 🍬` : ` — it shares perfectly evenly! 🎉`}.`)

  return { stages, a, b, n, digits, startCol, steps, q, remainder, quotient, quotientNum }
}

/* ---- C1: long multiplication (2-digit × 2-digit, partial products) ---- */
function buildLongMult(a, b) {
  const answer = a * b
  const bo = b % 10
  const bt = Math.floor(b / 10)
  const { p1, p2 } = longMultAnatomy(a, b)
  const cols = 4

  const blank = () => ({
    cols,
    rows: [
      { id: 'carry', cells: padTo('', cols), style: 'carry' },
      { id: 'top', cells: padTo(a, cols) },
      { id: 'bot', cells: padTo(b, cols), lead: '×' },
      { rule: true },
      { id: 'p1', cells: padTo('', cols), note: `${a} × ${bo}` },
      { id: 'p2', cells: padTo('', cols), note: `${a} × ${bt}0` },
      { rule: true },
      { id: 'res', cells: padTo('', cols) },
    ],
    hi: [],
  })
  const stages = []

  let s
  s = blank()
  stages.push({ caption: `Two rows this time — we'll multiply ${a} by the ${bo} and by the ${bt}0 separately, then add.`, snap: s })

  s = blank()
  row(s, 'p1').cells = padTo(p1, cols)
  s.hi = ['top-2', 'top-3', 'bot-3', 'p1-2', 'p1-3'].concat(p1 >= 100 ? ['p1-1'] : [])
  stages.push({ caption: `First the ones: ${a} × ${bo} = ${p1}. That whole answer goes in the first row.`, snap: s })

  s = blank()
  row(s, 'p1').cells = padTo(p1, cols)
  row(s, 'p2').cells = padTo(p2, cols)
  s.hi = ['top-2', 'top-3', 'bot-2', 'p2-3', 'p2-2', 'p2-1'].concat(p2 >= 1000 ? ['p2-0'] : [])
  stages.push({ caption: `Now the tens: the ${bt} really means ${bt}0, so write a 0 first, then ${a} × ${bt} = ${a * bt}. Second row: ${p2}.`, snap: s })

  s = blank()
  row(s, 'p1').cells = padTo(p1, cols)
  row(s, 'p2').cells = padTo(p2, cols)
  row(s, 'res').cells = padTo(answer, cols)
  s.hi = ['p1-3', 'p2-3', 'res-3', 'p1-2', 'p2-2', 'res-2']
  stages.push({ caption: `Add the two rows: ${p1} + ${p2} = ${answer}. Column by column, just like addition.`, snap: s })

  s = blank()
  row(s, 'p1').cells = padTo(p1, cols)
  row(s, 'p2').cells = padTo(p2, cols)
  row(s, 'res').cells = padTo(answer, cols)
  s.hi = padTo(answer, cols).map((c, i) => (c !== '' ? `res-${i}` : null)).filter(Boolean)
  stages.push({ caption: `So ${a} × ${b} = ${answer}. Two little multiplications and one addition — that's the whole trick.`, snap: s })

  return { stages, answer }
}
