/*
 * store.js — the single persistence boundary for Ivy's Math World.
 *
 * Everything the game needs to remember flows through here. Today it is backed
 * by localStorage; Stage B swaps the internals of load()/save() for Supabase
 * without any screen or scene component changing. (Same pattern as the Planner:
 * the app talks to the store, never to storage directly.)
 *
 * Account architecture (parent-held magic-link auth) is decided before Stage B,
 * per Amy — so this file is deliberately the only thing that will change.
 */

import { SHOP, SPARKLE, MUSIC_TRACKS, DEFAULT_MUSIC, COMPANIONS, PET_IDS, PLAYER, GEAR, DEFAULT_GEAR, HEROES } from './config'
import { localBackend } from './backend'

const KEY = 'math_world_v1'

/** The complete game state. Add fields here as stages land; keep it flat + serialisable. */
function freshState() {
  return {
    character: PLAYER, // who she plays as — the Sorcerer by default (2026-10-14)
    ownedHeroes: [], // heroes she's unlocked with gems (free ones are always hers)
    // What she's wearing (slot → GEAR id, or null = bare) and what she owns.
    // Free pieces (price 0) are always hers; ownedGear lists bought ones.
    gear: { ...DEFAULT_GEAR },
    ownedGear: [],
    pet: 'animal-cat', // her companion
    ownedPets: ['animal-cat'], // companions she owns (Gem Shop) — the cat is free
    // Profile photo — a small square JPEG data URL, or null. ON-DEVICE ONLY:
    // set from the OS photo picker, re-encoded + EXIF-stripped in avatar.js, and
    // kept right here in localStorage. It is NEVER uploaded — a child's photo is
    // personal information under COPPA, and we collect and transmit none of it
    // (Amy's call, 2026-09-20). migrate() defaults it to null for old saves.
    avatar: null,
    map: 'clearing', // which map she's in (walks through gates to change it)
    // The Door hub's New→Guest signal. `played` flips true the first time she
    // enters ANY world from the hub — that's the honest line between "nothing to
    // continue yet" (New: no stats, no Resume) and "has a world to come back to"
    // (Guest). A fresh save has map:'clearing' by default, so "has a map" can
    // never mean "has played" — this flag is what makes Resume truthful.
    played: false,
    // First-run onboarding: the "How to Play" walkthrough shows ONCE, the first
    // time someone plays, then never again. A brand-new player starts false (sees
    // it); migrate() seeds existing saves true so returning players (Ivy, Amy)
    // are never re-onboarded. Still re-openable any time from the gear menu.
    seenOnboarding: false,
    // Seasonal one-time popups (e.g. 'halloween-2026') she has already been
    // shown AND paid for. One id = one popup + its gift, once per player. Old
    // saves get [] from the freshState merge, so returning players see new ones.
    promos: [],
    // Her last standing spot in `map`, so the Door's Resume drops her exactly
    // where she left off (Play drops at the map's centre instead). Always paired
    // with `map`: every write that changes the map also writes pos, so it can
    // never be stale relative to the map it belongs to. { x, z } | null.
    pos: null,
    gems: 0, // spendable balance — uncapped since the beta cap retired (2026-07-18)
    // lifetimeGems = every gem ever EARNED (never decremented by spending). It
    // is the ledger the gem economy's badges read, and — the Cozy Closet lesson
    // honored — it is what let the beta cap retire with ZERO loss: her real
    // total was never bounded, only her spendable balance was.
    lifetimeGems: 0,
    capRetiredAt: null, // stamped once, when the one-time cap-retirement refund runs
    // Phase 5-A: the Player Level bar reads lifetimeGems directly (ONE
    // accumulator — see levels.js). These two only track the CELEBRATION:
    //   celebratedLevel — the highest level she has already been congratulated
    //     for. Starts at 1 (level 1 is where everyone begins, no popup), so an
    //     existing save naturally gets its retroactive popups on first boot —
    //     Amy's call: "It doesn't mean it's not there that she did not receive it."
    //   levelUps — how many congratulations she has seen, which is what rotates
    //     the message through Finn → Oscar → Nathan.
    celebratedLevel: 1,
    levelUps: 0,
    soundOn: true, // the speaker toggle (music + pet sounds)
    musicTrack: DEFAULT_MUSIC, // which bgm plays — MUSIC_TRACKS id, picked in Settings
    world: [], // placed assets: [{ id, asset, pack, x, z, rot, map }] (Phase 3)
    owned: [], // bought but not yet placed: [{ id, asset, pack }] (Phase 3)
    nextId: 1, // asset id counter (persisted so ids never collide across sessions)
    // Curriculum progress (C1+). Per topic: her current ladder rung, per-level
    // counts, the last-10 results at the TOP level (with dates — mastery needs
    // 2 distinct days), and the mastered flag Phase 6's map nodes will light.
    topicProgress: {}, // { [topicId]: { level, byLevel: {n:{seen,correct}}, topResults: [{d, ok}], mastered } }
    // Sparkle Pack: the active consumable trail, or null. { colorId, expiresAt }.
    // Survives reload; expires silently when the clock passes expiresAt.
    sparkle: null,
    // Phase 5: the current station plan. window = the refresh window it was
    // built for (see REFRESH); byMap[mapId] = { skinId, problems, bonus, x, z,
    // solvedCount, completed }. Rebuilt every refresh window (stations.js) so
    // 2–3 worlds get a fresh themed quest and there's always something to earn.
    stations: { window: null, byMap: {} },
    startedISO: null,
    lastActive: null,
  }
}

// ── Phase A: cloud-sync machinery (design: docs/accounts-boot-gate.md) ──
// The public API below stays SYNCHRONOUS — async lives only here at the
// edges (boot + background persistence). localStorage remains this device's
// source of truth; the cloud is sync + backup, never a gate to play.
const TUNING = {
  pushDebounceMs: 2000, // trailing debounce on cloud pushes
  bootReadTimeoutMs: 4000, // boot never waits longer than this on the network
  retryReadMs: 15000, // how often a failed boot read retries in the background
}
let backend = localBackend()
// THE invariant that kills the empty-state-clobber race by construction:
// a session may never WRITE to the cloud until it has successfully READ it.
// (A failed read leaves this false; a read of an EMPTY cloud sets it true.)
let cloudSynced = false
// Best known value of the cloud copy's lifetimeGems ledger (-1 = cloud empty).
// The push guard refuses any write that would regress it — the ledger is
// monotonic in legal play, so a regression is a bug or a stale boot, never her.
let cloudLedger = -1
let dirty = false // local changes not yet confirmed in the cloud
let forceNextPush = false // resetAll's one legal ledger regression
let pushTimer = null
let retryTimer = null
let initPromise = null // memoized — StrictMode double-mounts initStore safely

let state = load()
// Persist immediately on boot so one-time migrations (the cap-retirement
// refund, new fields) are written even if she never touches anything. Without
// this the refund would re-run every load — harmless for assets, but it would
// hand back gems she'd spent on CONSUMABLES (sparkles can't be reconstructed
// as "spent"), which is a free-gem exploit.
save()

/**
 * The boot gate (main.jsx <Boot> awaits this before mounting <App>).
 * Local hydration already happened synchronously above — this reconciles
 * with the cloud: read (bounded by bootReadTimeoutMs), pick the winner by
 * the merge rule, adopt or push. A failed read leaves the game fully
 * playable on local state, with pushes disabled until a read succeeds.
 */
export function initStore(be, tuning) {
  if (initPromise) return initPromise
  if (be) backend = be
  if (tuning) Object.assign(TUNING, tuning)
  initPromise = (async () => {
    try {
      const remote = await withTimeout(backend.loadRemote(), TUNING.bootReadTimeoutMs)
      adoptReadResult(remote, { allowAdopt: true })
    } catch {
      scheduleRetryRead() // offline / flaky — play local, keep trying quietly
    }
    return state
  })()
  return initPromise
}

/** A successful cloud read landed — reconcile. Only the BOOT read may adopt
 *  a winning remote state (`allowAdopt`); a late background read never yanks
 *  the world out from under her mid-play. If a late read finds the cloud
 *  ahead (two-device play — out of scope by design), we keep playing local,
 *  the push guard blocks uploads, and the next boot resolves it cleanly. */
function adoptReadResult(remote, { allowAdopt }) {
  cloudSynced = true
  cloudLedger = remote ? remote.state.lifetimeGems || 0 : -1
  const remoteWins = remote && pickWinner(state, remote.state) === 'remote'
  if (remoteWins && allowAdopt) {
    state = migrate(remote.state)
    writeLocal()
    dirty = false // the pre-boot local copy lost the merge; nothing of hers is in it
  } else if (!remoteWins) {
    scheduleCloudPush() // local is authoritative (cloud empty or behind) — sync up
  }
}

/** The merge rule: the monotonic ledger picks the winner, not the clock —
 *  an iPad that lost its battery can carry a stale save with a future
 *  timestamp, but lifetimeGems only ever counts UP in legal play.
 *  Tie on the ledger → later lastActive wins (skew is irrelevant at a tie). */
function pickWinner(local, remote) {
  const l = local.lifetimeGems || 0
  const r = remote.lifetimeGems || 0
  if (r !== l) return r > l ? 'remote' : 'local'
  return (remote.lastActive || '') > (local.lastActive || '') ? 'remote' : 'local'
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('boot-read-timeout')), ms)
    promise.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    )
  })
}

function scheduleRetryRead() {
  clearTimeout(retryTimer)
  retryTimer = setTimeout(async () => {
    try {
      const remote = await backend.loadRemote()
      adoptReadResult(remote, { allowAdopt: false })
    } catch {
      scheduleRetryRead()
    }
  }, TUNING.retryReadMs)
}

/** Trailing-debounced cloud push. Every save() calls this; it quietly does
 *  nothing until the read-before-write invariant is satisfied. */
function scheduleCloudPush() {
  dirty = true
  if (!cloudSynced) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    flushCloudNow()
  }, TUNING.pushDebounceMs)
}

/**
 * Push the current state to the cloud immediately (pagehide / visibility
 * flush, and the tail of the debounce). Refuses — loudly, in dev — any push
 * that would regress the cloud's ledger, unless resetAll armed forceNextPush.
 */
export async function flushCloudNow() {
  if (!cloudSynced) return false
  clearTimeout(pushTimer)
  const ledger = state.lifetimeGems || 0
  if (!forceNextPush && cloudLedger > ledger) {
    if (import.meta.env.DEV)
      console.warn(`[store] refused cloud push: ledger ${ledger} < cloud ${cloudLedger}`)
    return false
  }
  try {
    const snapshot = JSON.parse(JSON.stringify(state))
    await backend.saveRemote(snapshot)
    cloudLedger = ledger
    dirty = false
    forceNextPush = false
    return true
  } catch {
    dirty = true // localStorage holds truth; a lost push costs nothing until the next one lands
    return false
  }
}

// Flush at the moments an iPad actually disappears: home button (pagehide),
// tab hidden, and coming back online with unsent changes. (The supabase
// backend uses keepalive fetch so the pagehide flush survives dismissal.)
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    flushCloudNow()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushCloudNow()
    else if (dirty) scheduleCloudPush()
  })
  window.addEventListener('online', () => {
    if (dirty) flushCloudNow()
  })
}

// Dev QA hook, same family as __award/__stations.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__cloud = () => ({ kind: backend.kind, cloudSynced, cloudLedger, dirty })
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const s = freshState()
      s.startedISO = new Date().toISOString()
      return s
    }
    return migrate(JSON.parse(raw))
  } catch {
    // Corrupt/unreadable local storage. Fresh is SAFE even with a cloud copy:
    // fresh carries ledger 0, so the boot merge rule hands the win straight
    // to the cloud save — corrupt-local recovers from the cloud for free.
    return freshState()
  }
}

/** Everything a parsed save needs before it may become `state` — shared by
 *  the localStorage path (load) and cloud adoption (adoptReadResult), so a
 *  save is migrated identically wherever it came from. Idempotent. */
function migrate(parsed) {
  // merge onto freshState so new fields appear for existing players
  const merged = { ...freshState(), ...parsed }
  // Reconstruct what she has already spent, from the things she owns/placed.
  // (Consumed items like sparkles can't be reconstructed — so this is a FLOOR,
  // which always errs in her favour below. That's deliberate.)
  const spent = [...(merged.owned || []), ...(merged.world || [])].reduce((sum, it) => {
    const s = SHOP.find((x) => x.asset === it.asset && x.pack === it.pack)
    return sum + (s ? s.price : 0)
  }, 0)

  // Retroactive lifetimeGems seed (zero-loss): a returning player from before
  // the ledger existed has earned AT LEAST her current balance plus whatever
  // she already spent. Reconstruct that floor so no past earnings are lost.
  if (!merged.lifetimeGems) merged.lifetimeGems = (merged.gems || 0) + spent

  // A save from before the `played` field: any earnings or things she owns mean
  // she has clearly played, so the Door shows Guest (with Resume), not New.
  if (!merged.played && ((merged.lifetimeGems || 0) > 0 || (merged.owned || []).length || (merged.world || []).length)) {
    merged.played = true
  }

  // A save from before the onboarding feature has clearly already played — never
  // interrupt a returning player with a first-run walkthrough. Only genuinely
  // fresh states (freshState, which load() returns WITHOUT going through migrate)
  // keep seenOnboarding=false, so exactly the brand-new player sees it.
  if (parsed.seenOnboarding === undefined) merged.seenOnboarding = true

  // Music picker (2026-10-04): saves from before it get the new default via the
  // freshState merge above; an id we no longer ship falls back to it too.
  if (!MUSIC_TRACKS.some((t) => t.id === merged.musicTrack)) merged.musicTrack = DEFAULT_MUSIC

  // Companion shop (2026-10-14): the cat is always hers; a pet she doesn't own
  // (or one we no longer ship) falls back to the cat.
  if (!Array.isArray(merged.ownedPets)) merged.ownedPets = []
  if (!merged.ownedPets.includes('animal-cat')) merged.ownedPets.unshift('animal-cat')
  merged.ownedPets = merged.ownedPets.filter((id) => PET_IDS.includes(id))
  if (!merged.ownedPets.includes(merged.pet)) merged.pet = 'animal-cat'

  // Heroes (2026-10-15): she plays as a hero she owns (free, or unlocked).
  // Anything else — the old Kenney default from before the Sorcerer, a hero we
  // no longer ship, an edited save — falls back to the Sorcerer. Wardrobe: keep
  // only pieces we ship, in the right slot, that she owns.
  if (!Array.isArray(merged.ownedHeroes)) merged.ownedHeroes = []
  merged.ownedHeroes = merged.ownedHeroes.filter((id) => HEROES.some((h) => h.id === id))
  if (!ownsHero(merged, merged.character)) merged.character = PLAYER
  if (!Array.isArray(merged.ownedGear)) merged.ownedGear = []
  merged.ownedGear = merged.ownedGear.filter((id) => GEAR.some((g) => g.id === id))
  const gear = { ...DEFAULT_GEAR, ...(merged.gear && typeof merged.gear === 'object' ? merged.gear : {}) }
  for (const slot of Object.keys(DEFAULT_GEAR)) {
    const id = gear[slot]
    const g = GEAR.find((x) => x.id === id)
    if (id !== null && !(g && g.slot === slot && ownsGear(merged, id))) gear[slot] = DEFAULT_GEAR[slot]
  }
  merged.gear = gear

  // ── One-time CAP-RETIREMENT REFUND (2026-07-18) ──
  // While the 15-gem beta cap was live, a correct answer over the cap paid
  // NOTHING — Ivy solved 6 problems, was told she was right, and got zero.
  // The lifetime ledger recorded those earnings even when the balance was
  // clamped, so we can pay them back exactly: what she earned, minus what she
  // spent, IS her rightful balance. Never take gems away — only ever top up.
  if (!merged.capRetiredAt) {
    const rightful = (merged.lifetimeGems || 0) - spent
    if (rightful > (merged.gems || 0)) merged.gems = rightful
    merged.capRetiredAt = new Date().toISOString()
  }
  return merged
}

function writeLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / disabled — game still runs in-memory this session */
  }
}

function save() {
  state.lastActive = new Date().toISOString()
  writeLocal()
  scheduleCloudPush()
}

// ── Public API (the whole surface the rest of the app is allowed to use) ──

export function getState() {
  return state
}

function ownsHero(s, id) {
  const h = HEROES.find((x) => x.id === id)
  return !!h && (h.price === 0 || s.ownedHeroes.includes(id))
}

/** Switch hero — only to one she owns. */
export function setCharacter(id) {
  if (!ownsHero(state, id)) return false
  state.character = id
  save()
  return true
}

/** Unlock a hero with gems → she plays as them right away. Costs once.
 *  Returns the id, or null if she can't afford it (or it isn't a hero). */
export function buyHero(id) {
  const h = HEROES.find((x) => x.id === id)
  if (!h) return null
  if (!ownsHero(state, id)) {
    if (state.gems < h.price) return null
    state.gems -= h.price
    state.ownedHeroes.push(id)
  }
  state.character = id
  save()
  return id
}

/** Switch companion — only to one she owns. */
export function setPet(id) {
  if (!state.ownedPets.includes(id)) return false
  state.pet = id
  save()
  return true
}

/** Buy a companion from the Gem Shop → it becomes her companion right away.
 *  Returns the id, or null if she can't afford it (or it isn't for sale). */
export function buyPet(id) {
  const c = COMPANIONS.find((x) => x.id === id)
  if (!c) return null
  if (!state.ownedPets.includes(id)) {
    if (state.gems < c.price) return null
    state.gems -= c.price
    state.ownedPets.push(id)
  }
  state.pet = id
  save()
  return id
}

function ownsGear(s, id) {
  const g = GEAR.find((x) => x.id === id)
  return !!g && (g.price === 0 || s.ownedGear.includes(id))
}

/** Wear a piece she owns, or take a slot off (id = null). */
export function setGear(slot, id) {
  if (!(slot in DEFAULT_GEAR)) return false
  if (id !== null) {
    const g = GEAR.find((x) => x.id === id)
    if (!g || g.slot !== slot || !ownsGear(state, id)) return false
  }
  state.gear = { ...state.gear, [slot]: id }
  save()
  return true
}

/** Buy a wardrobe piece → she puts it on right away.
 *  Returns the id, or null if she can't afford it (or it isn't for sale). */
export function buyGear(id) {
  const g = GEAR.find((x) => x.id === id)
  if (!g) return null
  if (!ownsGear(state, id)) {
    if (state.gems < g.price) return null
    state.gems -= g.price
    state.ownedGear.push(id)
  }
  state.gear = { ...state.gear, [g.slot]: id }
  save()
  return id
}

export function setMap(id) {
  state.map = id
  save()
}

/** She has entered a world at least once — the Door hub reads this to graduate
 *  her from New to Guest. Idempotent (only the first flip writes). */
export function markPlayed() {
  if (!state.played) {
    state.played = true
    save()
  }
}

/** The first-run "How to Play" walkthrough has been dismissed — never auto-show
 *  it again. Idempotent (only the first flip writes). Still re-openable from the
 *  gear menu, which doesn't depend on this flag. */
export function markOnboardingSeen() {
  if (!state.seenOnboarding) {
    state.seenOnboarding = true
    save()
  }
}

/**
 * A seasonal popup's one-time gift (src/ui/PromoPopup.jsx). Marks the promo as
 * seen AND pays its gems in ONE save, the moment the popup shows — the
 * seen-on-show lesson from onboarding (Finn 2026-10-10): a reload, closed tab or
 * back-button mid-popup can neither re-show it nor lose the treat.
 * Idempotent: returns the new balance on the first claim, null after that.
 */
export function claimPromo(id, gems) {
  if (!Array.isArray(state.promos)) state.promos = []
  if (state.promos.includes(id)) return null
  state.promos.push(id)
  return addGems(gems) // addGems saves (and counts it toward lifetimeGems)
}

/** Has this promo already been shown + paid? */
export function hasSeenPromo(id) {
  return Array.isArray(state.promos) && state.promos.includes(id)
}

/** Remember where she's standing in the current map, so the Door's Resume
 *  returns her here. Written wherever `map` changes (Play, gate travel) and at
 *  every exit point (Home button, pagehide) — kept in lockstep with `map`. */
export function setPos(x, z) {
  state.pos = { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 }
  save()
}

export function setSoundOn(on) {
  state.soundOn = !!on
  save()
}

export function setMusicTrack(id) {
  if (!MUSIC_TRACKS.some((t) => t.id === id) || state.musicTrack === id) return
  state.musicTrack = id
  save()
}

// Profile photo (on-device only — see the `avatar` field + avatar.js). setAvatar
// takes the already-processed data URL from avatar.js; anything non-string clears.
export function setAvatar(dataUrl) {
  state.avatar = typeof dataUrl === 'string' && dataUrl ? dataUrl : null
  save()
}

export function clearAvatar() {
  if (!state.avatar) return // already clear — no needless save/push
  state.avatar = null
  save()
}

export function addGems(n) {
  // lifetime ledger counts everything EARNED (positive) — the badges read this
  if (n > 0) state.lifetimeGems = (state.lifetimeGems || 0) + n
  // NO CAP. The beta cap retired on 2026-07-18 (see retireBetaCap below): once
  // math became the way gems are earned, clamping the balance meant a correct
  // answer could pay NOTHING — effort with no reward, the one thing this app
  // must never do. The economy self-limits by what a problem pays instead.
  state.gems = Math.max(0, state.gems + n)
  save()
  return state.gems
}

// ── Phase 5-A: the level-up celebration ledger ──
// The LEVEL itself is derived from lifetimeGems (levels.js) and never stored —
// one accumulator, no second field to drift. What's stored here is only which
// congratulations she has already received.

/** Levels she has earned but not yet been congratulated for, low → high.
 *  Normally empty; non-empty on the migration boot, or if she closed the app
 *  mid-celebration. */
export function pendingLevelUps(currentLevel) {
  const from = state.celebratedLevel || 1
  const out = []
  for (let l = from + 1; l <= currentLevel; l++) out.push(l)
  return out
}

/** She saw the popup for `level`. Never walks backwards. */
export function recordLevelUp(level) {
  state.celebratedLevel = Math.max(state.celebratedLevel || 1, level)
  state.levelUps = (state.levelUps || 0) + 1
  save()
  return state.levelUps
}

/** How many congratulations she has seen — the message rotation cursor. */
export function getLevelUps() {
  return state.levelUps || 0
}

/**
 * C1 bookkeeping: record a checked answer for a topic at a ladder level.
 * At the topic's TOP level we also keep the last-10 results with dates, and
 * flip `mastered` on Finn's rule: 8 of the last 10 correct, across ≥2 days.
 * (Old v1 records were keyed by bare op ('+'/'×') with {seen,correct} only —
 * they're simply left in place; new topic ids never collide with them.)
 */
export function recordAnswer(topicId, level, correct, topLevel) {
  const t = state.topicProgress[topicId] || { level: 1, byLevel: {}, topResults: [], mastered: false }
  t.level = t.level || 1
  t.byLevel[level] = t.byLevel[level] || { seen: 0, correct: 0 }
  t.byLevel[level].seen += 1
  if (correct) t.byLevel[level].correct += 1

  if (level === topLevel) {
    t.topResults = (t.topResults || []).slice(-9)
    t.topResults.push({ d: new Date().toISOString().slice(0, 10), ok: !!correct })
    const last10 = t.topResults
    const wins = last10.filter((r) => r.ok).length
    const days = new Set(last10.map((r) => r.d)).size
    if (last10.length === 10 && wins >= 8 && days >= 2) t.mastered = true
  }

  state.topicProgress[topicId] = t
  save()
}

/** Advance (or set) a topic's ladder rung — the diagnostic or level-up rule calls this. */
export function setTopicLevel(topicId, level) {
  const t = state.topicProgress[topicId] || { level: 1, byLevel: {}, topResults: [], mastered: false }
  t.level = level
  state.topicProgress[topicId] = t
  save()
}

// ── Sparkle Pack: the 15-minute consumable trail ──

/** The active sparkle if it hasn't expired, else null (clears a lapsed one). */
export function getActiveSparkle() {
  const s = state.sparkle
  if (!s) return null
  if (Date.now() >= s.expiresAt) {
    state.sparkle = null
    save()
    return null
  }
  return s
}

/** Start (or restart) a sparkle — buying while one is active just resets the
 *  timer, no stacking, no waste-guilt. */
export function activateSparkle(colorId) {
  state.sparkle = { colorId, expiresAt: Date.now() + SPARKLE.durationMs }
  save()
  return state.sparkle
}

/** Buy a sparkle colour → activate it. Returns the colorId, or null if she
 *  can't afford it. Price is per-colour (SPARKLE.colors). */
export function buySparkle(colorId) {
  const c = SPARKLE.colors[colorId]
  if (!c || state.gems < c.price) return null
  state.gems -= c.price
  activateSparkle(colorId)
  return colorId
}

/** A rare free gift (the tutorial: she learns what a sparkle IS before spending). */
export function giftSparkle(colorId) {
  activateSparkle(colorId)
  return colorId
}

// ── Phase 5: station daily plan ──
// The plan is built by stations.js (which owns the generation + spot logic);
// the store only persists it and records progress, so it stays circular-import
// free (math.js imports the store, not the other way around).

export function getStations() {
  return state.stations
}

/** Replace today's whole station plan (stations.js calls this once per day). */
export function setStations(plan) {
  state.stations = plan
  save()
}

/** She left a station unfinished — remember how far she got so it RESUMES. */
export function setStationSolved(mapId, solvedCount) {
  const st = state.stations.byMap[mapId]
  if (st) {
    st.solvedCount = solvedCount
    save()
  }
}

/** A completed quest — mark it done so it won't reappear until tomorrow. */
export function completeStation(mapId) {
  const st = state.stations.byMap[mapId]
  if (st) {
    st.completed = true
    save()
  }
}

// ── Phase 3: shop + placement ──
// Spending gems frees room under the beta cap (the cap limits the BALANCE,
// not lifetime earnings), so buying things lets more sparkles appear.

/** Buy an item from the shop → inventory. `size` is the ×1/×2/×3 she chose (it
 *  rides with the item forever, so a Huge tree stays huge when moved or stored).
 *  Returns the new id, or null if she can't afford it. */
export function buyAsset({ asset, pack, size = 1 }, price) {
  if (state.gems < price) return null
  state.gems -= price
  const id = state.nextId++
  state.owned.push({ id, asset, pack, size })
  save()
  return id
}

/** Place an owned item into the current map's world. */
export function placeAsset(id, map, x, z, rot = 0) {
  const i = state.owned.findIndex((o) => o.id === id)
  if (i === -1) return
  const [item] = state.owned.splice(i, 1)
  state.world.push({ ...item, map, x, z, rot })
  save()
}

export function moveAsset(id, x, z, rot) {
  const w = state.world.find((p) => p.id === id)
  if (w) {
    w.x = x
    w.z = z
    if (rot != null) w.rot = rot
    save()
  }
}

/** Rotate a placed asset by 45°. */
export function rotateAsset(id) {
  const w = state.world.find((p) => p.id === id)
  if (w) {
    w.rot = (w.rot + Math.PI / 4) % (Math.PI * 2)
    save()
  }
}

/** Put a placed asset back into inventory (no refund — it's hers). */
export function pickupAsset(id) {
  const i = state.world.findIndex((p) => p.id === id)
  if (i === -1) return
  const [{ id: wid, asset, pack, size = 1 }] = state.world.splice(i, 1)
  state.owned.push({ id: wid, asset, pack, size }) // size survives put-away
  save()
}

export function resetAll() {
  state = freshState()
  state.startedISO = new Date().toISOString()
  // The ONE legal ledger regression (see the push guard): arm a forced push,
  // and if it can't land right now (offline), the flag holds until one does —
  // otherwise the guard would block the fresh save's uploads forever.
  forceNextPush = true
  save()
  flushCloudNow()
  return state
}
