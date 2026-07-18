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

import { GEMS, SHOP } from './config'

const KEY = 'math_world_v1'

/** The complete game state. Add fields here as stages land; keep it flat + serialisable. */
function freshState() {
  return {
    character: 'character-female-a', // Ivy's avatar (chosen later in a picker)
    pet: 'animal-cat', // her companion
    map: 'clearing', // which map she's in (walks through gates to change it)
    gems: 0, // Phase 2: collected from world sparkles (capped); Phase 4: earned by math
    // lifetimeGems = every gem ever EARNED (never decremented by spending). It
    // is the ledger the gem economy's badges read, and — the Cozy Closet lesson
    // honored — it means the beta cap can retire later with ZERO loss: her real
    // total was never bounded, only her spendable balance was.
    lifetimeGems: 0,
    soundOn: true, // the speaker toggle (music + pet sounds)
    world: [], // placed assets: [{ id, asset, pack, x, z, rot, map }] (Phase 3)
    owned: [], // bought but not yet placed: [{ id, asset, pack }] (Phase 3)
    nextId: 1, // asset id counter (persisted so ids never collide across sessions)
    // Curriculum progress (C1+). Per topic: her current ladder rung, per-level
    // counts, the last-10 results at the TOP level (with dates — mastery needs
    // 2 distinct days), and the mastered flag Phase 6's map nodes will light.
    topicProgress: {}, // { [topicId]: { level, byLevel: {n:{seen,correct}}, topResults: [{d, ok}], mastered } }
    // Phase 5: today's station plan. day = YYYY-MM-DD; byMap[mapId] =
    // { skinId, problems, bonus, x, z, solvedCount, completed }. Rebuilt daily
    // (stations.js) so 2–3 worlds get a themed quest and most days feel new.
    stations: { day: null, byMap: {} },
    startedISO: null,
    lastActive: null,
  }
}

let state = load()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const s = freshState()
      s.startedISO = new Date().toISOString()
      return s
    }
    // merge onto freshState so new fields appear for existing players
    const merged = { ...freshState(), ...JSON.parse(raw) }
    // Retroactive lifetimeGems seed (zero-loss): a returning player from before
    // the ledger existed has earned AT LEAST her current balance plus whatever
    // she already spent on things she owns/placed. Reconstruct that floor so no
    // past earnings are lost when badges start reading lifetimeGems.
    if (!merged.lifetimeGems) {
      const spent = [...(merged.owned || []), ...(merged.world || [])].reduce((sum, it) => {
        const s = SHOP.find((x) => x.asset === it.asset && x.pack === it.pack)
        return sum + (s ? s.price : 0)
      }, 0)
      merged.lifetimeGems = (merged.gems || 0) + spent
    }
    return merged
  } catch {
    return freshState()
  }
}

function save() {
  state.lastActive = new Date().toISOString()
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / disabled — game still runs in-memory this session */
  }
}

// ── Public API (the whole surface the rest of the app is allowed to use) ──

export function getState() {
  return state
}

export function setCharacter(id) {
  state.character = id
  save()
}

export function setPet(id) {
  state.pet = id
  save()
}

export function setMap(id) {
  state.map = id
  save()
}

export function setSoundOn(on) {
  state.soundOn = !!on
  save()
}

export function addGems(n) {
  // lifetime ledger counts everything EARNED (positive), before the cap clamps
  // the spendable balance — so the cap never costs her a real gem.
  if (n > 0) state.lifetimeGems = (state.lifetimeGems || 0) + n
  // clamped to the beta cap — the balance can never exceed it, however earned
  state.gems = Math.min(GEMS.cap, Math.max(0, state.gems + n))
  save()
  return state.gems
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

/** Buy an item from the shop → inventory. Returns the new id, or null if she can't afford it. */
export function buyAsset({ asset, pack }, price) {
  if (state.gems < price) return null
  state.gems -= price
  const id = state.nextId++
  state.owned.push({ id, asset, pack })
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
  const [{ id: wid, asset, pack }] = state.world.splice(i, 1)
  state.owned.push({ id: wid, asset, pack })
  save()
}

export function resetAll() {
  state = freshState()
  state.startedISO = new Date().toISOString()
  save()
  return state
}
