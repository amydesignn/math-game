import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Character from './Character'
import Pet from './Pet'
import Prop, { DECOR } from './Prop'
import { WORLD } from '../config'

export default function Scene({ characterId, petId }) {
  const targetRef = useRef(null) // where the character is walking to (Vector3 | null)
  const charPos = useRef(new THREE.Vector3(0, 0, 0)) // character's live position, for the pet + camera
  const marker = useRef() // the ring that pings on tap
  const markerLife = useRef(0) // 1 → 0 fade

  function handleTap(e) {
    e.stopPropagation()
    const p = e.point
    targetRef.current = new THREE.Vector3(p.x, 0, p.z)
    if (marker.current) {
      marker.current.position.set(p.x, 0.02, p.z)
      markerLife.current = 1
    }
  }

  // Follow camera + tap-marker animation (must live under the Canvas).
  const { camera } = useThree()
  const camTarget = useRef(new THREE.Vector3())
  useFrame((_, dt) => {
    // camera trails the character at a fixed couch-friendly iso offset
    const desired = charPos.current
    const [ox, oy, oz] = WORLD.camOffset
    camTarget.current.set(desired.x + ox, desired.y + oy, desired.z + oz)
    camera.position.lerp(camTarget.current, 1 - Math.exp(-4 * dt))
    camera.lookAt(desired.x, desired.y + 0.6, desired.z)

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

      {/* tappable ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerDown={handleTap} receiveShadow>
        <planeGeometry args={[WORLD.groundSize, WORLD.groundSize]} />
        <meshStandardMaterial color="#c7e6b8" />
      </mesh>

      {/* tap marker */}
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial color="#4b54dd" transparent opacity={0} />
      </mesh>

      {DECOR.map((d, i) => (
        <Prop key={i} {...d} />
      ))}

      <Character id={characterId} targetRef={targetRef} posRef={charPos} />
      <Pet id={petId} targetPosRef={charPos} />
    </>
  )
}
