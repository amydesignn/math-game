/*
 * Onboarding copy truth tests (Trail crew job 1, 2026-10-18). The words live in
 * src/onboardingCopy.js and are BUILT from config — these tests check the final
 * strings, so a config change can't leave the card telling a kid something false.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

function fakeStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }
}

let copy, config, maps, math
beforeAll(async () => {
  globalThis.localStorage = fakeStorage()
  copy = await import('../onboardingCopy.js')
  config = await import('../config.js')
  maps = await import('../maps.js')
  math = await import('../math.js')
})

const allText = () => [
  copy.ABOUT.title, ...copy.ABOUT.lines, copy.ABOUT.small,
  ...copy.STEPS.flatMap((s) => [s.title, s.body]),
]
// words = tokens with a letter or digit (emoji and "·" don't count)
const words = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
const body = (id) => copy.STEPS.find((s) => s.id === id).body

describe('onboarding copy — numbers and names come from config', () => {
  it('the garden step names the garden town and the real seed rate', () => {
    expect(copy.GARDEN_TOWN).toBe(maps.MAPS.town.name)
    expect(body('garden')).toContain(maps.MAPS.town.name)
    expect(body('garden')).toContain(`every ${config.GARDEN.seedEveryGems} gems`)
  })

  it('the hero step counts the free heroes from HEROES', () => {
    const free = config.HEROES.filter((h) => !h.price).length
    expect(copy.FREE_HEROES).toBe(free)
    expect(body('hero')).toContain(`${free} are free`)
  })

  it('the small print carries the live grade range', () => {
    expect(copy.ABOUT.small).toContain(`grades ${copy.gradeRange()}`)
  })
})

describe('gradeRange — the min–max of the live topics\' grade tags', () => {
  it('equals the min–max of TOPICS today', () => {
    const g = Object.values(math.TOPICS).map((t) => t.grade)
    const lo = Math.min(...g)
    const hi = Math.max(...g)
    expect(copy.gradeRange()).toBe(lo === hi ? `${lo}` : `${lo}–${hi}`)
  })

  it('reads 4–6 by itself once division moves to Phase 2 (G6)', () => {
    // Injected topics = DIV_PHASE 2: long-div's grade tag becomes 6.
    const phase2 = { ...math.TOPICS, 'long-div': { ...math.TOPICS['long-div'], grade: 6 } }
    expect(copy.gradeRange(phase2)).toBe('4–6')
  })

  it('one grade reads as a single number, untagged topics are ignored', () => {
    expect(copy.gradeRange({ a: { grade: 5 }, b: { grade: 5 }, c: {} })).toBe('5')
  })
})

describe('onboarding copy — truth rules', () => {
  it('never says "soon" (the game reads as "available now")', () => {
    for (const s of allText()) expect(s).not.toMatch(/soon/i)
  })

  it('has no "gym" line (that is marketing\'s, outside the game)', () => {
    for (const s of allText()) expect(s).not.toMatch(/gym/i)
  })

  it('every step body is 22 words or fewer', () => {
    for (const s of copy.STEPS) expect(words(s.body), s.id).toBeLessThanOrEqual(22)
  })

  it('every media path exists in public/', () => {
    const media = copy.STEPS.map((s) => s.media).filter(Boolean)
    expect(media.length).toBeGreaterThan(0)
    for (const m of media) expect(existsSync(resolve(__dirname, '../../public', `.${m}`)), m).toBe(true)
    // every clip ships in both formats (WebM first, MP4 for Safari)
    for (const c of copy.STEPS.map((s) => s.clip).filter(Boolean)) {
      for (const ext of ['webm', 'mp4']) expect(existsSync(resolve(__dirname, '../../public', `.${c}.${ext}`)), `${c}.${ext}`).toBe(true)
    }
  })
})

describe('onboardingPages — two entries, one card', () => {
  it("'first' opens on About, then the 3 steps", () => {
    const p = copy.onboardingPages('first')
    expect(p[0].kind).toBe('about')
    expect(p.slice(1).map((x) => x.id)).toEqual(copy.STEPS.map((s) => s.id))
  })

  it("'howto' is the 3 steps only — no About", () => {
    const p = copy.onboardingPages('howto')
    expect(p.some((x) => x.kind === 'about')).toBe(false)
    expect(p.map((x) => x.id)).toEqual(copy.STEPS.map((s) => s.id))
  })
})
