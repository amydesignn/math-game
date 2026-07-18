/*
 * stations.js — the daily station plan manager (Phase 5).
 *
 * Owns WHICH worlds host a themed quest today, WHICH skin each wears, WHAT
 * problems it holds, and WHERE its ring sits in the map. Rebuilt once per day so
 * "2–3 per day across worlds — so most days feel different" (Oscar's release
 * note). Lives here, not in the store, so the store stays free of the math.js
 * import (math.js already imports the store — the other direction would loop).
 */

import { MAPS } from './maps'
import { WORLD, STATION, REFRESH } from './config'
import { generateStation } from './math'
import { STATION_SKIN_IDS } from './ui/skins'
import { getStations, setStations } from './store'

// The current refresh window: an integer that ticks up every REFRESH.periodHours.
// Stations (and the map's gem sparkles) regenerate whenever it advances, so
// there's always something new to earn. Clock-aligned, so a fresh batch lands on
// each boundary no matter when she last played.
export const currentWindow = () => Math.floor(Date.now() / (REFRESH.periodHours * 3600_000))

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A clear spot for the ring: away from map centre (her first-load spawn), the
 *  gates (a quest luring her into a gate would teleport her), and the scenery. */
function pickSpot(map) {
  const B = WORLD.bounds - 3
  for (let guard = 0; guard < 300; guard++) {
    const x = (Math.random() * 2 - 1) * B
    const z = (Math.random() * 2 - 1) * B
    if (Math.hypot(x, z) < 5) continue // not on top of the centre spawn
    if (map.gates.some((g) => Math.hypot(x - g.position[0], z - g.position[2]) < 4.5)) continue
    if (map.decor.some((d) => Math.hypot(x - d.position[0], z - d.position[2]) < 2)) continue
    return [round(x), round(z)]
  }
  return [6, -6] // fallback — a corner of the playable field
}
const round = (n) => Math.round(n * 100) / 100

/**
 * Ensure the current window's plan exists (idempotent within a window). Picks
 * perDayMin..Max of the maps, gives each a distinct skin, generates its quest,
 * and persists. Returns the plan's byMap object. Rebuilds whenever the refresh
 * window advances — that's the "stations restart after a period" rule.
 */
export function ensureStations() {
  const plan = getStations()
  if (plan.window === currentWindow()) return plan.byMap

  const mapIds = shuffle(Object.keys(MAPS))
  const span = STATION.perDayMax - STATION.perDayMin + 1
  const count = Math.min(mapIds.length, STATION.perDayMin + Math.floor(Math.random() * span))
  const skins = shuffle(STATION_SKIN_IDS)

  const byMap = {}
  for (let i = 0; i < count; i++) {
    const mapId = mapIds[i]
    const [x, z] = pickSpot(MAPS[mapId])
    byMap[mapId] = {
      skinId: skins[i % skins.length],
      problems: generateStation(STATION.length),
      bonus: STATION.bonus,
      x,
      z,
      solvedCount: 0,
      completed: false,
    }
  }
  setStations({ window: currentWindow(), byMap })
  return byMap
}

/** The current window's live (uncompleted) station for a map, or null. */
export function stationFor(mapId) {
  const byMap = ensureStations()
  const st = byMap[mapId]
  return st && !st.completed ? st : null
}

// QA hooks (dev builds only): inspect the plan, force a station into a map for
// deterministic testing (spawns are random across 2–3 maps/window; force +
// reload/re-enter to mount), and roll the refresh window forward to test the
// periodic restart without waiting for the clock.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__stations = () => ensureStations()
  window.__forceStation = (mapId = 'clearing', skinId = 'feedPet') => {
    ensureStations()
    const plan = getStations()
    plan.byMap[mapId] = {
      skinId,
      problems: generateStation(STATION.length),
      bonus: STATION.bonus,
      x: 4,
      z: -4,
      solvedCount: 0,
      completed: false,
    }
    setStations({ window: plan.window, byMap: plan.byMap })
    return plan.byMap[mapId]
  }
  // pretend the window already elapsed → next ensureStations regenerates
  window.__rollRefresh = () => {
    const plan = getStations()
    setStations({ window: (plan.window ?? currentWindow()) - 1, byMap: plan.byMap })
    return 'refresh window rolled back — reload or re-enter a map to see fresh content'
  }
}
