import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Prop from './Prop'

/**
 * A travel gate: two columns straddling a glowing ring. The glow pulses in the
 * color of the map the gate leads to — the color IS the signpost, so Ivy can
 * learn "pink glow = the pink world" without any text. Walking into the ring
 * travels (proximity check lives in Scene).
 */
export default function Gate({ position, color }) {
  const ring = useRef()
  const t = useRef(Math.random() * Math.PI * 2) // desync pulses between gates

  useFrame((_, dt) => {
    t.current += dt * 2.2
    if (ring.current) {
      const pulse = 0.5 + Math.sin(t.current) * 0.18
      ring.current.material.opacity = pulse
      ring.current.scale.setScalar(1 + Math.sin(t.current) * 0.06)
    }
  })

  const [x, , z] = position
  return (
    <group position={[x, 0, z]}>
      <Prop pack="building" name="column" position={[0, 0, -1.3]} scale={0.8} />
      <Prop pack="building" name="column" position={[0, 0, 1.3]} scale={0.8} />
      {/* the glow — flat ring + soft filled disc under it */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.72, 1.02, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.72, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} />
      </mesh>
    </group>
  )
}
