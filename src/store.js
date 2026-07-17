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

import { GEMS } from './config'

const KEY = 'math_world_v1'

/** The complete game state. Add fields here as stages land; keep it flat + serialisable. */
function freshState() {
  return {
    character: 'character-female-a', // Ivy's avatar (chosen later in a picker)
    pet: 'animal-cat', // her companion
    map: 'clearing', // which map she's in (walks through gates to change it)
    gems: 0, // Phase 2: collected from world sparkles (capped); Phase 4: earned by math
    soundOn: true, // the speaker toggle (music + pet sounds)
    world: [], // placed assets: [{ id, asset, pack, x, z, rot, map }] (Phase 3)
    owned: [], // bought but not yet placed: [{ id, asset, pack }] (Phase 3)
    nextId: 1, // asset id counter (persisted so ids never collide across sessions)
    // Stage B — times tables first, curriculum topics later:
    topicProgress: {}, // { [topicId]: { seen, correct } }
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
    return { ...freshState(), ...JSON.parse(raw) }
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
  // clamped to the beta cap — the balance can never exceed it, however earned
  state.gems = Math.min(GEMS.cap, Math.max(0, state.gems + n))
  save()
  return state.gems
}

/** Phase 4/6 bookkeeping: per-topic seen/correct counts (weekly quotas later). */
export function recordAnswer(op, correct) {
  const t = state.topicProgress[op] || { seen: 0, correct: 0 }
  t.seen += 1
  if (correct) t.correct += 1
  state.topicProgress[op] = t
  save()
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
