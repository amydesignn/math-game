// The hint engine: picks at most ONE hint to show, from config, under the quiet budget.
// App-agnostic: no imports at all (this folder may only import itself + react).
//
// A hint is a config entry:
//   { id, target?, when(ctx), say(ctx), retire(ctx), on?, budget?, delayMs?, exitMs? }
//   target  { world: key } | { dom: key } | undefined (toast only)
//   when    is this the place/moment? (context trigger)
//   on      event name — the hint is also a candidate while that event is pending (notify)
//   say     the toast line ('' = arrow only)
//   retire  derived from the host's saved state — true = never again on this save
//   budget  'nudge' (default) | 'tip' (once per device) | 'reward' (not a nudge)
//   tone    optional look name the layer wears while it shows (e.g. 'lucky')
//
// Quiet budget (shared by every nudge, incl. the planned garden popup):
//   · at most one hint on screen (also: none while another is still leaving)
//   · at most one nudge per session (session = one host boot → beginSession)
//   · dismiss = quiet for the next QUIET_SESSIONS sessions
//   · natural pauses only: nothing shows unless ctx.calm, for delayMs straight
//
// All state moves on plain timers (setInterval/setTimeout) — never rAF, which
// starves in hidden/throttled windows.

export const QUIET_SESSIONS = 2
export const TICK_MS = 500
export const DEFAULT_DELAY_MS = 3000
export const DEFAULT_EXIT_MS = 700
export const EVENT_TTL_MS = 5 * 60 * 1000

/** A fresh (or repaired) memory object. Safe on any junk input. */
export function normalizeMemory(m) {
  const n = (v, d) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : d)
  const src = m && typeof m === 'object' ? m : {}
  return {
    session: n(src.session, 0),
    lastNudgeSession: Number.isFinite(src.lastNudgeSession) ? Math.floor(src.lastNudgeSession) : null,
    quietUntil: n(src.quietUntil, 0),
    tips: Array.isArray(src.tips) ? [...new Set(src.tips.filter((t) => typeof t === 'string'))] : [],
  }
}

/** Call ONCE per host boot. Returns the memory with the session counter moved on. */
export function beginSession(m) {
  const mem = normalizeMemory(m)
  return { ...mem, session: mem.session + 1 }
}

/** May this hint show now, budget-wise? (Context/retire are checked separately.) */
export function budgetAllows(hint, mem) {
  const budget = hint.budget || 'nudge'
  if (budget === 'reward') return true
  if (budget === 'tip') return !mem.tips.includes(hint.id)
  return mem.lastNudgeSession !== mem.session && mem.session > mem.quietUntil
}

const safe = (fn, ctx, fallback) => {
  try {
    return fn ? fn(ctx) : fallback
  } catch {
    return fallback // a broken config entry must never take the host down
  }
}

/**
 * @param {object} o
 * @param {object[]} o.hints   config entries, in priority order
 * @param {{load:()=>object, save:(m:object)=>void}} o.memory  host persistence (already beginSession'd by the host)
 * @param {(view:{hint:null|{id,text,target}, exitReason:null|string})=>void} [o.onChange]
 * @param {(hint:object)=>void} [o.onShow]          once per showing (not on resume)
 * @param {(hint:object, reason:'done'|'dismissed'|'left')=>void} [o.onDone]
 * @param {()=>number} [o.now]
 * @param {number|false} [o.tickMs] re-evaluate the last ctx on this plain interval (false = host drives)
 */
export function createHintController({ hints, memory, onChange, onShow, onDone, now = Date.now, tickMs = TICK_MS }) {
  let ctx = null
  let active = null // { hint, paused }
  let pending = null // { id, since } — a candidate waiting out its calm delay
  let busyUntil = 0 // an exit is still playing → nothing new may arrive
  const events = new Map() // name → expiresAt
  let view = { hint: null, exitReason: null }
  let destroyed = false

  const mem = () => normalizeMemory(memory.load())
  const save = (m) => memory.save(normalizeMemory(m))

  function emit(next) {
    const same =
      next.exitReason === view.exitReason &&
      (next.hint === view.hint ||
        (next.hint && view.hint && next.hint.id === view.hint.id && next.hint.text === view.hint.text && next.hint.target === view.hint.target))
    view = next
    if (!same) onChange?.(view)
  }

  const shownView = (h) => ({ hint: { id: h.id, text: safe(h.say, ctx, '') || '', target: h.target, tone: h.tone }, exitReason: null })

  function end(reason) {
    const h = active.hint
    active = null
    pending = null
    busyUntil = now() + (h.exitMs ?? DEFAULT_EXIT_MS)
    emit({ hint: null, exitReason: reason })
    onDone?.(h, reason)
  }

  function candidate(m) {
    const t = now()
    for (const [name, exp] of events) if (exp <= t) events.delete(name)
    for (const h of hints) {
      if (safe(h.retire, ctx, true)) continue
      const triggered = (h.on && events.has(h.on)) || (h.when ? safe(h.when, ctx, false) : false)
      if (!triggered) continue
      if (!budgetAllows(h, m)) continue
      return h
    }
    return null
  }

  function evaluate() {
    if (destroyed || !ctx) return
    const calm = ctx.calm === true
    if (active) {
      const h = active.hint
      if (safe(h.retire, ctx, false)) return end('done')
      const stillOn = (h.on && events.has(h.on)) || (h.when ? safe(h.when, ctx, false) : false)
      if (!stillOn) return end('left')
      if (!calm) {
        if (!active.paused) {
          active.paused = true
          emit({ hint: null, exitReason: 'paused' })
        }
        return
      }
      active.paused = false
      return emit(shownView(h)) // also refreshes the line if say(ctx) changed
    }
    if (!calm || now() < busyUntil) {
      pending = null
      return
    }
    const m = mem()
    const h = candidate(m)
    if (!h) {
      pending = null
      return
    }
    if (!pending || pending.id !== h.id) pending = { id: h.id, since: now() }
    if (now() - pending.since < (h.delayMs ?? DEFAULT_DELAY_MS)) return
    // SHOW. The budget is spent on show, not on dismiss — closing early or
    // reloading can't buy a second showing (the onboarding seen-on-show lesson).
    pending = null
    active = { hint: h, paused: false }
    const budget = h.budget || 'nudge'
    if (budget === 'nudge') save({ ...m, lastNudgeSession: m.session })
    else if (budget === 'tip') save({ ...m, tips: [...m.tips, h.id] })
    if (h.on) events.delete(h.on)
    emit(shownView(h))
    onShow?.(h)
  }

  const timer = tickMs ? setInterval(evaluate, tickMs) : null

  return {
    update(next) {
      ctx = next
      evaluate()
    },
    tick: evaluate,
    notify(name) {
      events.set(name, now() + EVENT_TTL_MS)
      evaluate()
    },
    dismiss(id) {
      if (!active || (id != null && active.hint.id !== id)) return
      if ((active.hint.budget || 'nudge') === 'nudge') {
        const m = mem()
        save({ ...m, quietUntil: m.session + QUIET_SESSIONS }) // "a dismissal is an answer"
      }
      end('dismissed')
    },
    get view() {
      return view
    },
    get activeId() {
      return active?.hint.id ?? null
    },
    destroy() {
      destroyed = true
      if (timer) clearInterval(timer)
    },
  }
}
