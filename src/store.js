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

const KEY = 'math_world_v1'

/** The complete game state. Add fields here as stages land; keep it flat + serialisable. */
function freshState() {
  return {
    character: 'character-female-a', // Ivy's avatar (chosen later in a picker)
    pet: 'animal-cat', // her companion
    map: 'clearing', // which map she's in (walks through gates to change it)
    gems: 0, // earned by solving problems (Stage B)
    world: [], // placed props: [{ asset, x, z, rotation }] (Stage C)
    owned: [], // assets bought from the shop (Stage C)
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

export function addGems(n) {
  state.gems = Math.max(0, state.gems + n)
  save()
  return state.gems
}

export function resetAll() {
  state = freshState()
  state.startedISO = new Date().toISOString()
  save()
  return state
}
