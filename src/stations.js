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
import { WORLD, STATION } from './config'
import { generateStation } from './math'
import { STATION_SKIN_IDS } from './ui/skins'
import { getStations, setStations } from './store'

const todayKey = () => new Date().toISOString().slice(0, 10)

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
 * Ensure today's plan exists (idempotent within a day). Picks perDayMin..Max of
 * the maps, gives each a distinct skin, generates its quest, and persists.
 * Returns the plan's byMap object.
 */
export function ensureDailyStations() {
  const plan = getStations()
  if (plan.day === todayKey()) return plan.byMap

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
  setStations({ day: todayKey(), byMap })
  return byMap
}

/** Today's live (uncompleted) station for a map, or null. */
export function stationFor(mapId) {
  const byMap = ensureDailyStations()
  const st = byMap[mapId]
  return st && !st.completed ? st : null
}

// QA hooks (dev builds only): inspect today's plan and force a station into a
// given map so the encounter can be tested deterministically (spawns are random
// across 2–3 maps/day). A forced station shows after the scene remounts —
// reload or re-enter the map.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__stations = () => ensureDailyStations()
  window.__forceStation = (mapId = 'clearing', skinId = 'feedPet') => {
    const plan = getStations()
    ensureDailyStations()
    plan.byMap[mapId] = {
      skinId,
      problems: generateStation(STATION.length),
      bonus: STATION.bonus,
      x: 4,
      z: -4,
      solvedCount: 0,
      completed: false,
    }
    setStations({ day: plan.day, byMap: plan.byMap })
    return plan.byMap[mapId]
  }
}
