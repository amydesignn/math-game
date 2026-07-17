/*
 * math.js — the problem engine (Phase 4).
 *
 * Problem generation is Nathan's (infinite, times-tables-first per Amy's
 * curriculum call); buildStages is lifted 1:1 from Oscar's handoff comp — it
 * turns a problem into the step-by-step column-math worked example that is
 * THE feature for Ivy (wrong answer → follow a real example, not a hint).
 *
 * A problem is { op, a, b, similar:{a,b} }. `similar` is a DIFFERENT problem
 * of the same shape (same carry profile), used for the worked example — so
 * Ivy follows the method, never just copies her own answer.
 */

export const OPSYM = { '+': '+', '×': '×', '-': '−' }
export const solve = (op, a, b) => (op === '+' ? a + b : op === '×' ? a * b : a - b)

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const mulCarries = (a, b) => b * (a % 10) > 9
const addCarries = (a, b) => (a % 10) + (b % 10) > 9

/** Next problem for a gem. Leans multiplication (Ivy's practice area),
 *  mixes in column addition; curriculum topics widen in Phase 6. */
export function nextProblem() {
  if (Math.random() < 0.6) {
    const a = rand(12, 49)
    const b = rand(2, 6)
    let s
    do {
      s = { a: rand(12, 49), b: rand(2, 6) }
    } while (s.a === a || mulCarries(s.a, s.b) !== mulCarries(a, b))
    return { op: '×', a, b, similar: s }
  }
  const a = rand(14, 68)
  const b = rand(13, 59)
  let s
  do {
    s = { a: rand(14, 68), b: rand(13, 59) }
  } while (s.a === a || addCarries(s.a, s.b) !== addCarries(a, b))
  return { op: '+', a, b, similar: s }
}

/* ---- worked example builder (Oscar's, lifted verbatim) ----
   Returns { stages:[{caption, snap}], answer }.
   snap = right-aligned column snapshot the grid renders at that step.
   Columns are [hundreds, tens, ones]. Supports + and × (−/÷ follow the same
   pattern — add a builder and they slot straight in). */
function pad3(n) {
  const s = String(n)
  return ['', '', ''].map((_, i) => s[s.length - 3 + i] || '').slice()
}
function digitsOf(n) {
  return { H: Math.floor(n / 100) % 10, T: Math.floor(n / 10) % 10, O: n % 10 }
}

export function buildStages(op, a, b) {
  const answer = solve(op, a, b)
  const A = digitsOf(a)
  const topRow = pad3(a)
  const stages = []
  const B = digitsOf(b)
  const blank = () => ({ carry: ['', '', ''], top: topRow.slice(), op, bottom: op === '×' ? ['', '', String(b)] : pad3(b), result: ['', '', ''], hi: [] })

  if (op === '+') {
    const onesSum = A.O + B.O, oDigit = onesSum % 10, c1 = Math.floor(onesSum / 10)
    const tensSum = A.T + B.T + c1, tDigit = tensSum % 10, c2 = Math.floor(tensSum / 10)
    const res = pad3(answer)
    let s
    s = blank(); s.hi = []; stages.push({ caption: 'Stack them so the ones line up under the ones.', snap: s })
    s = blank(); s.hi = ['top-O', 'bot-O', 'res-O']; s.result[2] = String(oDigit); if (c1) s.carry[1] = '1'
    stages.push({ caption: `Add the ones: ${A.O} + ${B.O} = ${onesSum}.` + (c1 ? ` That's more than 9 — write ${oDigit} and carry the 1.` : ` Write ${oDigit}.`), snap: s })
    s = blank(); s.result[2] = String(oDigit); if (c1) s.carry[1] = '1'; s.hi = ['top-T', 'bot-T', 'res-T'].concat(c1 ? ['carry-T'] : [])
    s.result[1] = String(tDigit); if (c2) s.result[0] = String(c2)
    stages.push({ caption: `Add the tens: ${A.T} + ${B.T}${c1 ? ' + 1' : ''} = ${tensSum}.` + ` Write ${c2 ? tensSum : tDigit}.`, snap: s })
    s = blank(); s.result = res.slice(); if (c1) s.carry[1] = '1'; s.hi = ['res-H', 'res-T', 'res-O'].filter((k) => k !== 'res-H' || res[0])
    stages.push({ caption: `Put it together: ${answer}.`, snap: s })
  } else {
    // ×  (2-digit × 1-digit)
    const onesP = b * A.O, oDigit = onesP % 10, carry = Math.floor(onesP / 10)
    const tensBase = b * A.T, tensP = tensBase + carry
    const res = pad3(answer)
    let s
    s = blank(); stages.push({ caption: 'Line up the ones, with the × underneath.', snap: s })
    s = blank(); s.hi = ['top-O', 'bot-O', 'res-O']; s.result[2] = String(oDigit); if (carry) s.carry[1] = String(carry)
    stages.push({ caption: `Multiply the ones: ${b} × ${A.O} = ${onesP}.` + (carry ? ` Write ${oDigit}, carry the ${carry}.` : ` Write ${oDigit}.`), snap: s })
    s = blank(); s.result[2] = String(oDigit); if (carry) s.carry[1] = String(carry)
    s.hi = ['top-T', 'bot-O'].concat(carry ? ['carry-T'] : [])
    const tD = tensP % 10, tH = Math.floor(tensP / 10)
    s.result[1] = String(tD); if (tH) s.result[0] = String(tH); s.hi = s.hi.concat(tH ? ['res-H', 'res-T'] : ['res-T'])
    stages.push({ caption: `Multiply the tens: ${b} × ${A.T} = ${tensBase}.` + (carry ? ` Add the ${carry} you carried: ${tensBase} + ${carry} = ${tensP}.` : ''), snap: s })
    s = blank(); s.result = res.slice(); s.hi = ['res-H', 'res-T', 'res-O'].filter((k) => k !== 'res-H' || res[0])
    stages.push({ caption: `Read it together: ${answer}.`, snap: s })
  }
  return { stages, answer }
}
