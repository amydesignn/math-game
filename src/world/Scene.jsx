import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Character from './Character'
import Pet from './Pet'
import Prop from './Prop'
import Gate from './Gate'
import Sparkle from './Sparkle'
import Station from './Station'
import SparkleTrail from './SparkleTrail'
import Ghost from './Ghost'
import { WORLD, GEMS, STATION, assetScale } from '../config'
import { MAPS } from '../maps'
import { stationFor } from '../stations'
import { SKINS } from '../ui/skins'

const GATE_RADIUS = 1.7 // walk this close to a gate's glow → travel (forgiving: tap-walks stop at the ring's edge)

/**
 * Scatter this visit's gem sparkles: random spots on the map, kept clear of
 * the spawn point, the gates (a sparkle luring her into a gate would teleport
 * her), the scenery, and each other. Count respects the remaining beta cap.
 */
function spawnSparkles(map, spawn, placed = []) {
  // Full scatter every visit — the balance is uncapped since the beta cap
  // retired, so gems-to-find are never rationed by how many she already holds.
  const count = GEMS.perMap
  const pts = []
  const B = WORLD.bounds - 2.5
  let guard = 0
  while (pts.length < count && guard++ < 400) {
    const x = (Math.random() * 2 - 1) * B
    const z = (Math.random() * 2 - 1) * B
    if (Math.hypot(x - spawn[0], z - spawn[1]) < 4) continue
    if (map.gates.some((g) => Math.hypot(x - g.position[0], z - g.position[2]) < 4.5)) continue
    if (map.decor.some((d) => Math.hypot(x - d.position[0], z - d.position[2]) < 1.8)) continue
    if (placed.some((w) => Math.hypot(x - w.x, z - w.z) < 1.8)) continue
    if (pts.some((p) => Math.hypot(x - p.x, z - p.z) < 5)) continue
    pts.push({ id: pts.length, x, z, collected: false })
  }
  return pts
}

/**
 * The 3D world for one map (App remounts it with key={mapId} on travel).
 * Shared refs live in App (so the minimap + pinch gestures can reach them):
 * `targetRef` = walk destination, `charPosRef`/`petPosRef` = live positions,
 * `zoomRef` = camera distance multiplier, `gestureRef.pinching` = true while
 * two fingers are down (taps ignored). `spawn` = [x,z] where this visit starts
 * (map centre on first load, just inside the gate after travelling).
 */
export default function Scene({ map, spawn, onTravel, onSparkleReached, onStationReached, farewellActive, stationRef, refreshKey, sparkle, onSparkleExpire, mathBusyRef, collectFnRef, reactUntilRef, sparklesRef, placing, ghostPosRef, ghostRot, placed, hiddenId, selectedId, onSelectPlaced, characterId, petId, targetRef, charPosRef, petPosRef, zoomRef, gestureRef }) {
  const marker = useRef() // the ring that pings on tap
  const markerLife = useRef(0) // 1 → 0 fade
  const traveled = useRef(false) // one travel per visit — App swaps the scene

  // ── Phase 2/4: this visit's gem sparkles (Phase 4: walking up opens MATH) ──
  const [sparkles, setSparkles] = useState(() => spawnSparkles(map, spawn, placed))
  const taken = useRef(new Set()) // same-frame double-fire guard
  const cooling = useRef(new Set()) // unsolved popups re-arm only after she walks away

  // ── Phase 5: the current window's station for this map (or null) ──
  const [station, setStation] = useState(() => stationFor(map.id))
  const stationSkin = station ? SKINS[station.skinId] : null
  const stationCooling = useRef(false) // unfinished close re-arms only after she walks off

  // ── Content refresh: when the window rolls over, re-scatter this map's gems
  // and reload its station in place (no remount, no camera snap). Deferred while
  // a problem/placement is up — the next check or map visit picks it up. This is
  // the "gems + stations restart after a period" rule, felt without traveling. ──
  const firstRefresh = useRef(true)
  useEffect(() => {
    if (firstRefresh.current) { firstRefresh.current = false; return }
    if ((mathBusyRef && mathBusyRef.current) || placing) return
    taken.current.clear()
    cooling.current.clear()
    setSparkles(spawnSparkles(map, spawn, placed))
    stationCooling.current = false
    setStation(stationFor(map.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // let the minimap draw a dot where the station stands (world presence)
  useEffect(() => {
    if (stationRef) stationRef.current = station && !station.completed ? { x: station.x, z: station.z, color: stationSkin.accent } : null
    return () => {
      if (stationRef) stationRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station, farewellActive])

  // tapping the station walks her to its ring — proximity opens the quest
  function walkToStation(e) {
    if (gestureRef.current.pinching || placing || !station) return
    e.stopPropagation()
    targetRef.current = new THREE.Vector3(station.x, 0, station.z)
    if (marker.current) {
      marker.current.position.set(station.x, 0.03, station.z)
      markerLife.current = 1
    }
  }

  // the minimap draws live sparkles from this shared ref
  useEffect(() => {
    if (sparklesRef) sparklesRef.current = sparkles.filter((s) => !s.collected)
    if (import.meta.env.DEV) {
      // QA hooks (dev builds only): inspect sparkles, drive the walk
      window.__sparkles = sparkles
      window.__walk = (x, z) => (targetRef.current = new THREE.Vector3(x, 0, z))
      window.__dbg = () => ({
        char: charPosRef.current.toArray().map((v) => +v.toFixed(2)),
        target: targetRef.current && targetRef.current.toArray().map((v) => +v.toFixed(2)),
        traveled: traveled.current,
        cooling: [...cooling.current],
        busy: !!(mathBusyRef && mathBusyRef.current),
        gates: map.gates.map((g) => ({ to: g.to, d: +Math.hypot(charPosRef.current.x - g.position[0], charPosRef.current.z - g.position[2]).toFixed(2) })),
      })
    }
  }, [sparkles, sparklesRef, targetRef])

  // App collects a sparkle after the problem is SOLVED (visual only — the
  // award happens in App through the popup's onAward seam).
  function collect(id) {
    if (taken.current.has(id)) return
    taken.current.add(id)
    setSparkles((prev) => prev.map((s) => (s.id === id ? { ...s, collected: true } : s)))
  }
  useEffect(() => {
    if (collectFnRef) collectFnRef.current = collect
    return () => {
      if (collectFnRef) collectFnRef.current = null
    }
  })

  // tapping a sparkle walks her to it — proximity does the collecting
  function walkToSparkle(sp) {
    return (e) => {
      if (gestureRef.current.pinching || sp.collected || placing) return
      e.stopPropagation()
      targetRef.current = new THREE.Vector3(sp.x, 0, sp.z)
      if (marker.current) {
        marker.current.position.set(sp.x, 0.03, sp.z)
        markerLife.current = 1
      }
    }
  }

  // ── Phase 3: placement ghost (its position lives in state so it re-renders
  // per tap; the shared ref lets App read the final spot on confirm) ──
  const [ghostPos, setGhostPos] = useState(null)
  useEffect(() => {
    if (!placing) {
      setGhostPos(null)
      return
    }
    // moves start at the asset's own spot; new items just in front of her
    const B = WORLD.bounds - 1
    const c = charPosRef.current
    const [sx, sz] = placing.startAt ?? [c.x + 1.8, c.z + 1.8]
    const at = [Math.min(B, Math.max(-B, sx)), Math.min(B, Math.max(-B, sz))]
    setGhostPos(at)
    if (ghostPosRef) ghostPosRef.current = at
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placing])

  function handleTap(e) {
    if (gestureRef.current.pinching) return // two fingers = zoom, not walk
    e.stopPropagation()
    const B = WORLD.bounds
    // clamp to the playable map so she can never wander off the edge
    const x = Math.min(B, Math.max(-B, e.point.x))
    const z = Math.min(B, Math.max(-B, e.point.z))

    // placing? taps position the ghost instead of walking
    if (placing) {
      setGhostPos([x, z])
      if (ghostPosRef) ghostPosRef.current = [x, z]
      return
    }

    if (selectedId != null) onSelectPlaced(null) // ground tap = done editing

    targetRef.current = new THREE.Vector3(x, 0, z)
    if (marker.current) {
      marker.current.position.set(x, 0.03, z)
      markerLife.current = 1
    }
  }

  // Follow camera + tap-marker animation (must live under the Canvas).
  const { camera } = useThree()
  const camTarget = useRef(new THREE.Vector3())

  // On entering a map, snap the camera straight to the spawn point — the fade
  // overlay hides the cut; without this it would swoosh across the new map.
  useEffect(() => {
    const [ox, oy, oz] = WORLD.camOffset
    const z = zoomRef.current
    camera.position.set(spawn[0] + ox * z, oy * z, spawn[1] + oz * z)
    camera.lookAt(spawn[0], 0.6, spawn[1])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, dt) => {
    // camera trails the character; pinch zoom scales the offset
    const desired = charPosRef.current
    const zoom = zoomRef.current
    const [ox, oy, oz] = WORLD.camOffset
    camTarget.current.set(desired.x + ox * zoom, desired.y + oy * zoom, desired.z + oz * zoom)
    camera.position.lerp(camTarget.current, 1 - Math.exp(-4 * dt))
    camera.lookAt(desired.x, desired.y + 0.6, desired.z)

    // sparkle check — walking up to a gem opens its math problem (Phase 4).
    // A closed-unsolved popup re-arms only after she walks away, so it never
    // instantly reopens on the spot she's still standing in.
    if (!(mathBusyRef && mathBusyRef.current)) {
      for (const sp of sparkles) {
        if (sp.collected || taken.current.has(sp.id)) continue
        const dx = desired.x - sp.x
        const dz = desired.z - sp.z
        const d2 = dx * dx + dz * dz
        if (cooling.current.has(sp.id)) {
          if (d2 > 2.6 * 2.6) cooling.current.delete(sp.id)
          continue
        }
        if (d2 < GEMS.collectRadius * GEMS.collectRadius) {
          cooling.current.add(sp.id)
          targetRef.current = null // she stops for the question
          onSparkleReached(sp.id)
          break
        }
      }
    }

    // station check — walking into the ring opens the mini-quest. Re-arms only
    // after she walks off (same kindness as the sparkle popup), and never while
    // it's saying goodbye (farewellActive) or already done for the day.
    if (station && !station.completed && !farewellActive && !(mathBusyRef && mathBusyRef.current) && !placing) {
      const sdx = desired.x - station.x
      const sdz = desired.z - station.z
      const sd2 = sdx * sdx + sdz * sdz
      if (stationCooling.current) {
        if (sd2 > STATION.rearm * STATION.rearm) stationCooling.current = false
      } else if (sd2 < STATION.reach * STATION.reach) {
        stationCooling.current = true
        targetRef.current = null // she stops for the quest
        onStationReached()
      }
    }

    // gate check — walking into a glow travels to its map
    if (!traveled.current) {
      for (const g of map.gates) {
        const dx = desired.x - g.position[0]
        const dz = desired.z - g.position[2]
        if (dx * dx + dz * dz < GATE_RADIUS * GATE_RADIUS) {
          // only latch if App accepted the travel — a refusal (already mid-fade)
          // must NOT lock this scene out of ever traveling again
          if (onTravel(g.to)) traveled.current = true
          break
        }
      }
    }

    // fade the tap ring
    if (markerLife.current > 0 && marker.current) {
      markerLife.current = Math.max(0, markerLife.current - dt * 1.6)
      const l = markerLife.current
      marker.current.scale.setScalar(0.4 + (1 - l) * 0.9)
      marker.current.material.opacity = l * 0.8
      marker.current.visible = l > 0
    } else if (marker.current) {
      marker.current.visible = false
    }
  })

  return (
    <>
      <hemisphereLight args={['#fff6e8', '#b9b0d6', 0.9]} />
      <directionalLight position={[6, 12, 6]} intensity={1.1} />

      {/* the land beyond the map — muted, so "outside" reads as outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerDown={handleTap}>
        <planeGeometry args={[WORLD.groundSize, WORLD.groundSize]} />
        <meshStandardMaterial color={map.outside} />
      </mesh>

      {/* the playable map — brighter, its edge IS the end of the world */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onPointerDown={handleTap}>
        <planeGeometry args={[WORLD.bounds * 2, WORLD.bounds * 2]} />
        <meshStandardMaterial color={map.ground} />
      </mesh>

      {/* tap marker */}
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial color="#4b54dd" transparent opacity={0} />
      </mesh>

      {map.decor.map((d, i) => (
        <Prop key={i} {...d} />
      ))}

      {map.gates.map((g) => (
        <Gate key={g.to} position={g.position} color={MAPS[g.to].gateColor} />
      ))}

      {sparkles.map((sp) => (
        <Sparkle key={sp.id} x={sp.x} z={sp.z} collected={sp.collected} onTap={walkToSparkle(sp)} />
      ))}

      {/* ── Phase 5: today's station (stays visible through its farewell) ── */}
      {station && (!station.completed || farewellActive) && (
        <Station x={station.x} z={station.z} skin={stationSkin} resume={station.solvedCount} farewell={farewellActive} onTap={walkToStation} />
      )}

      {/* ── Phase 3: assets Ivy has placed in THIS map ── */}
      {placed.map((w) =>
        w.id === hiddenId ? null : (
          <group
            key={w.id}
            onPointerDown={(e) => {
              if (gestureRef.current.pinching || placing) return
              e.stopPropagation()
              onSelectPlaced(w.id)
            }}
          >
            <Prop pack={w.pack} name={w.asset} position={[w.x, 0, w.z]} rotation={w.rot} scale={assetScale(w.pack, w.asset, w.size)} />
          </group>
        )
      )}

      {/* selection ring under the asset she's editing */}
      {selectedId != null &&
        placed
          .filter((w) => w.id === selectedId && w.id !== hiddenId)
          .map((w) => (
            <mesh key="sel" rotation={[-Math.PI / 2, 0, 0]} position={[w.x, 0.02, w.z]}>
              <ringGeometry args={[0.9, 1.12, 40]} />
              <meshBasicMaterial color="#f5b623" transparent opacity={0.85} />
            </mesh>
          ))}

      {/* the placement ghost */}
      {placing && ghostPos && <Ghost pack={placing.pack} asset={placing.asset} position={ghostPos} rotation={ghostRot} scale={assetScale(placing.pack, placing.asset, placing.size)} />}

      <Character id={characterId} start={spawn} targetRef={targetRef} posRef={charPosRef} reactUntilRef={reactUntilRef} />
      <Pet id={petId} start={spawn} targetPosRef={charPosRef} posRef={petPosRef} reactUntilRef={reactUntilRef} />

      {/* ── Sparkle Pack: the consumable aura + fairy-dust trail on her ── */}
      {sparkle && (
        <SparkleTrail key={sparkle.colorId + ':' + sparkle.expiresAt} sparkle={sparkle} charPosRef={charPosRef} onExpire={onSparkleExpire} />
      )}
    </>
  )
}
