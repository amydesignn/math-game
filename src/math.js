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
 * ⚠️ LADDER + MIX NUMBERS ARE PROVISIONAL DATA (marked FINN-SPEC below):
 * Finn's C1 topic spec + Amy's workbook calibration problems replace them the
 * moment they land — the machinery stays. The calibration set becomes a test
 * fixture file asserting generator output per level (curate to calibrate).
 */

import { getState, setTopicLevel } from './store'

export const OPSYM = { '+': '+', '×': '×', '-': '−' }
export const solve = (op, a, b) => (op === '+' ? a + b : op === '×' ? a * b : a - b)

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))

/* ── carry anatomy ─────────────────────────────────────────────────── */
const addCarries = (a, b) => (a % 10) + (b % 10) > 9
const mulCarries = (a, b) => b * (a % 10) > 9 // 2×1: carry within the product

// Long multiplication carry anatomy: carries inside each partial product,
// plus a carry in the final addition of the partials.
function longMultAnatomy(a, b) {
  const bo = b % 10
  const bt = Math.floor(b / 10)
  const p1 = a * bo
  const p2 = a * bt * 10
  const p1Carries = bo * (a % 10) > 9
  const p2Carries = bt * (a % 10) > 9
  const addCarry = (() => {
    // column-wise addition of p1 + p2 with carry detection
    let x = p1, y = p2, c = 0
    while (x > 0 || y > 0) {
      const s = (x % 10) + (y % 10) + c
      if (s > 9) return true
      c = 0
      x = Math.floor(x / 10)
      y = Math.floor(y / 10)
    }
    return false
  })()
  return { p1, p2, p1Carries, p2Carries, addCarry }
}

/** C1 ladder — carry-class per level. FINN-SPEC: provisional definitions. */
function longMultLevelOf(a, b) {
  const { p1Carries, p2Carries, addCarry } = longMultAnatomy(a, b)
  const carries = (p1Carries ? 1 : 0) + (p2Carries ? 1 : 0)
  if (carries === 0 && !addCarry) return 1 // L1: no carrying anywhere
  if (carries <= 1) return 2 // L2: one partial product carries
  return 3 // L3: both partials carry (final-addition carry welcome)
}

/* ── topic registry ────────────────────────────────────────────────── */
// Each topic: generate(level) → problem, topLevel, and its mix role.
// FINN-SPEC: ranges + level rules are provisional data.
export const TOPICS = {
  'long-mult': {
    name: 'Long multiplication',
    topLevel: 3,
    levelUpAfter: 5, // correct at current level → next rung (FINN-SPEC)
    generate(level) {
      const range = level === 1 ? [12, 43] : level === 2 ? [12, 69] : [24, 89]
      let a, b
      let guard = 0
      do {
        a = rand(range[0], range[1])
        b = rand(12, level === 1 ? 43 : level === 2 ? 49 : 89)
      } while (longMultLevelOf(a, b) !== level && guard++ < 500)
      const similar = similarLongMult(a, b, level)
      return { type: 'long-mult', level, op: '×', a, b, similar }
    },
  },
  'mult-2x1': {
    name: 'Multiplication (2-digit × 1-digit)',
    topLevel: 1,
    levelUpAfter: Infinity,
    generate() {
      const a = rand(12, 49)
      const b = rand(2, 6)
      let s
      do {
        s = { a: rand(12, 49), b: rand(2, 6) }
      } while (s.a === a || mulCarries(s.a, s.b) !== mulCarries(a, b))
      return { type: 'mult-2x1', level: 1, op: '×', a, b, similar: s }
    },
  },
  'add-2x2': {
    name: 'Column addition',
    topLevel: 1,
    levelUpAfter: Infinity,
    generate() {
      const a = rand(14, 68)
      const b = rand(13, 59)
      let s
      do {
        s = { a: rand(14, 68), b: rand(13, 59) }
      } while (s.a === a || addCarries(s.a, s.b) !== addCarries(a, b))
      return { type: 'add-2x2', level: 1, op: '+', a, b, similar: s }
    },
  },
}

function similarLongMult(a, b, level) {
  let s
  let guard = 0
  do {
    s = { a: rand(12, 89), b: rand(12, 89) }
  } while ((s.a === a || longMultLevelOf(s.a, s.b) !== level) && guard++ < 500)
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
  if (Math.random() < 0.7) {
    const level = currentLevel('long-mult')
    return TOPICS['long-mult'].generate(level)
  }
  const confidence = Math.random() < 0.6 ? 'mult-2x1' : 'add-2x2'
  return TOPICS[confidence].generate()
}

/** The topic's current ladder rung (diagnostic sets the start; store persists). */
export function currentLevel(topicId) {
  const t = getState().topicProgress[topicId]
  return Math.min(TOPICS[topicId].topLevel, Math.max(1, t?.level ?? 1))
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
  window.__math = { nextProblem, buildStages: (p) => buildStages(p), TOPICS, currentLevel }
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
