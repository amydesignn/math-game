import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Character from './Character'
import Pet from './Pet'
import Prop from './Prop'
import Gate from './Gate'
import { WORLD } from '../config'
import { MAPS } from '../maps'

const GATE_RADIUS = 1.7 // walk this close to a gate's glow → travel (forgiving: tap-walks stop at the ring's edge)

/**
 * The 3D world for one map (App remounts it with key={mapId} on travel).
 * Shared refs live in App (so the minimap + pinch gestures can reach them):
 * `targetRef` = walk destination, `charPosRef`/`petPosRef` = live positions,
 * `zoomRef` = camera distance multiplier, `gestureRef.pinching` = true while
 * two fingers are down (taps ignored). `spawn` = [x,z] where this visit starts
 * (map centre on first load, just inside the gate after travelling).
 */
export default function Scene({ map, spawn, onTravel, characterId, petId, targetRef, charPosRef, petPosRef, zoomRef, gestureRef }) {
  const marker = useRef() // the ring that pings on tap
  const markerLife = useRef(0) // 1 → 0 fade
  const traveled = useRef(false) // one travel per visit — App swaps the scene

  function handleTap(e) {
    if (gestureRef.current.pinching) return // two fingers = zoom, not walk
    e.stopPropagation()
    const B = WORLD.bounds
    // clamp to the playable map so she can never wander off the edge
    const x = Math.min(B, Math.max(-B, e.point.x))
    const z = Math.min(B, Math.max(-B, e.point.z))
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

    // gate check — walking into a glow travels to its map
    if (!traveled.current) {
      for (const g of map.gates) {
        const dx = desired.x - g.position[0]
        const dz = desired.z - g.position[2]
        if (dx * dx + dz * dz < GATE_RADIUS * GATE_RADIUS) {
          traveled.current = true
          onTravel(g.to)
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

      <Character id={characterId} start={spawn} targetRef={targetRef} posRef={charPosRef} />
      <Pet id={petId} start={spawn} targetPosRef={charPosRef} posRef={petPosRef} />
    </>
  )
}
