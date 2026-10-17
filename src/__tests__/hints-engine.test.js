/*
 * In-game hints — the engine (src/hints/engine.js). The quiet budget, the calm
 * gate + delay, the lifecycle (show → pause → resume → done/dismissed/left),
 * and the reserved event/tip shapes. Pure: a fake clock, the host drives ticks.
 */
import { describe, it, expect } from 'vitest'
import { createHintController, beginSession, normalizeMemory, budgetAllows, QUIET_SESSIONS } from '../hints/engine.js'

function rig(hints, startMem = beginSession({})) {
  let t = 1000
  let stored = startMem
  const log = []
  const views = []
  const c = createHintController({
    hints,
    memory: { load: () => stored, save: (m) => (stored = m) },
    onChange: (v) => views.push(v),
    onShow: (h) => log.push(['show', h.id]),
    onDone: (h, r) => log.push(['done', h.id, r]),
    now: () => t,
    tickMs: false, // the test drives time
  })
  const at = (ms, ctx) => {
    t += ms
    c.update(ctx)
  }
  return { c, at, log, views, mem: () => stored, setMem: (m) => (stored = m) }
}

const garden = (over = {}) => ({
  id: 'g',
  target: { world: 'bed' },
  when: (c) => c.town,
  say: (c) => (c.atBed ? '' : 'Plant it'),
  retire: (c) => c.planted,
  delayMs: 3000,
  ...over,
})
const calmTown = { town: true, calm: true, planted: false }

describe('the calm gate + delay', () => {
  it('shows only after delayMs of continuous calm, once', () => {
    const r = rig([garden()])
    r.at(0, calmTown)
    r.at(2999, calmTown)
    expect(r.c.view.hint).toBe(null)
    r.at(1, calmTown)
    expect(r.c.view.hint).toMatchObject({ id: 'g', text: 'Plant it', target: { world: 'bed' } })
    expect(r.log).toEqual([['show', 'g']])
  })
  it('a busy moment restarts the calm clock (never mid-problem)', () => {
    const r = rig([garden()])
    r.at(0, calmTown)
    r.at(2500, { ...calmTown, calm: false })
    r.at(2500, calmTown) // calm again — clock restarts here
    r.at(2999, calmTown)
    expect(r.c.view.hint).toBe(null)
    r.at(1, calmTown)
    expect(r.c.view.hint?.id).toBe('g')
  })
  it('calm must be exactly true (missing = busy)', () => {
    const r = rig([garden()])
    r.at(0, { town: true })
    r.at(9999, { town: true })
    expect(r.c.view.hint).toBe(null)
  })
  it('never shows a retired hint (an old save that already planted)', () => {
    const r = rig([garden()])
    r.at(0, { ...calmTown, planted: true })
    r.at(10000, { ...calmTown, planted: true })
    expect(r.c.view.hint).toBe(null)
    expect(r.log).toEqual([])
  })
})

describe('lifecycle', () => {
  const shown = () => {
    const r = rig([garden()])
    r.at(0, calmTown)
    r.at(3000, calmTown)
    return r
  }
  it('pause hides it, resume brings it back silently (no second onShow)', () => {
    const r = shown()
    r.at(10, { ...calmTown, calm: false })
    expect(r.c.view).toEqual({ hint: null, exitReason: 'paused' })
    r.at(10, calmTown)
    expect(r.c.view.hint?.id).toBe('g')
    expect(r.log.filter((l) => l[0] === 'show')).toHaveLength(1)
  })
  it('retire flips it to done (her first plant)', () => {
    const r = shown()
    r.at(10, { ...calmTown, planted: true })
    expect(r.c.view).toEqual({ hint: null, exitReason: 'done' })
    expect(r.log.at(-1)).toEqual(['done', 'g', 'done'])
    expect(r.c.activeId).toBe(null)
  })
  it('retire while paused still ends as done (she plants from the bar)', () => {
    const r = shown()
    r.at(10, { ...calmTown, calm: false })
    r.at(10, { ...calmTown, calm: false, planted: true })
    expect(r.log.at(-1)).toEqual(['done', 'g', 'done'])
  })
  it('when() going false ends it as left, and it does not come back this session', () => {
    const r = shown()
    r.at(10, { ...calmTown, town: false })
    expect(r.c.view.exitReason).toBe('left')
    r.at(1000, calmTown)
    r.at(60000, calmTown)
    expect(r.c.view.hint).toBe(null)
  })
  it('say() changing on the same id refreshes the text, keeps it shown (arrow-only at the bed)', () => {
    const r = shown()
    r.at(10, { ...calmTown, atBed: true })
    expect(r.c.view.hint).toMatchObject({ id: 'g', text: '' })
    expect(r.log.filter((l) => l[0] === 'show')).toHaveLength(1)
  })
  it('onChange only fires on a real change', () => {
    const r = shown()
    const n = r.views.length
    r.at(500, calmTown)
    r.at(500, calmTown)
    expect(r.views.length).toBe(n)
  })
})

describe('quiet budget', () => {
  it('fresh memory + one boot → the nudge is allowed (Clover’s boot blocker)', () => {
    const m = beginSession({})
    expect(m.session).toBe(1)
    expect(budgetAllows({ id: 'g' }, m)).toBe(true)
    // and WITHOUT a begun session it is blocked — the bug this guards
    expect(budgetAllows({ id: 'g' }, normalizeMemory({}))).toBe(false)
  })
  it('at most one nudge per session, spent on SHOW (a reload mid-hint can’t buy another)', () => {
    const r = rig([garden()])
    r.at(0, calmTown)
    r.at(3000, calmTown)
    expect(r.mem().lastNudgeSession).toBe(1)
    // a second nudge in the same session never shows
    const r2 = rig([garden({ id: 'other' })], r.mem())
    r2.at(0, calmTown)
    r2.at(9999, calmTown)
    expect(r2.c.view.hint).toBe(null)
    // next session it can
    const r3 = rig([garden({ id: 'other' })], beginSession(r.mem()))
    r3.at(0, calmTown)
    r3.at(3000, calmTown)
    expect(r3.c.view.hint?.id).toBe('other')
  })
  it(`dismiss = quiet for the next ${QUIET_SESSIONS} sessions`, () => {
    const r = rig([garden()])
    r.at(0, calmTown)
    r.at(3000, calmTown)
    r.c.dismiss('g')
    expect(r.c.view.exitReason).toBe('dismissed')
    expect(r.log.at(-1)).toEqual(['done', 'g', 'dismissed'])
    let m = r.mem()
    for (let i = 0; i < QUIET_SESSIONS; i++) {
      m = beginSession(m)
      expect(budgetAllows({ id: 'g' }, m)).toBe(false)
    }
    m = beginSession(m)
    expect(budgetAllows({ id: 'g' }, m)).toBe(true)
  })
  it('dismiss of a different id, or with nothing up, is a no-op', () => {
    const r = rig([garden()])
    r.c.dismiss('g')
    r.at(0, calmTown)
    r.at(3000, calmTown)
    r.c.dismiss('nope')
    expect(r.c.view.hint?.id).toBe('g')
  })
  it('one on screen: nothing new arrives while an exit is still playing', () => {
    const tip = { id: 't', budget: 'tip', when: () => true, say: () => 'tip', retire: () => false, delayMs: 0 }
    const r = rig([garden({ exitMs: 700 }), tip])
    r.at(0, calmTown)
    r.at(3000, calmTown)
    r.at(10, { ...calmTown, planted: true }) // garden done → exit plays 700ms
    r.at(100, { ...calmTown, planted: true })
    expect(r.c.view.hint).toBe(null)
    r.at(700, { ...calmTown, planted: true })
    expect(r.c.view.hint?.id).toBe('t')
  })
})

describe('reserved shapes (backlog: first-time tips, "you got something new!")', () => {
  it('a tip shows once per device, regardless of the session nudge budget', () => {
    const tip = { id: 'tip1', budget: 'tip', when: (c) => c.town, say: () => 'Tap to pick it', retire: () => false, delayMs: 0 }
    const r = rig([tip])
    r.at(0, calmTown)
    expect(r.c.view.hint?.id).toBe('tip1')
    expect(r.mem().tips).toEqual(['tip1'])
    const again = rig([tip], beginSession(beginSession(r.mem())))
    again.at(0, calmTown)
    expect(again.c.view.hint).toBe(null)
  })
  it('an event-triggered toast (no target) shows on notify, only when calm', () => {
    const reward = { id: 'seed', on: 'seed-granted', budget: 'reward', say: () => 'A new seed!', retire: () => false, delayMs: 0 }
    const r = rig([reward])
    r.at(0, { calm: false })
    r.c.notify('seed-granted')
    expect(r.c.view.hint).toBe(null) // never over a maths problem
    r.at(10, { calm: true })
    expect(r.c.view.hint).toMatchObject({ id: 'seed', text: 'A new seed!', target: undefined })
  })
  it('a throwing config entry can’t take the host down', () => {
    const bad = { id: 'bad', when: () => { throw new Error('x') }, say: () => 'x', retire: () => false }
    const r = rig([bad, garden()])
    expect(() => r.at(0, calmTown)).not.toThrow()
    r.at(3000, calmTown)
    expect(r.c.view.hint?.id).toBe('g')
  })
})

describe('memory', () => {
  it('normalizeMemory repairs junk', () => {
    expect(normalizeMemory('x')).toEqual({ session: 0, lastNudgeSession: null, quietUntil: 0, tips: [] })
    expect(normalizeMemory({ session: -3, tips: ['a', 'a', 4] })).toMatchObject({ session: 0, tips: ['a'] })
  })
})
