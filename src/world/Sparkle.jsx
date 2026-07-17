import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/*
 * A gem sparkle — Phase 2's collectible world-node. A floating cyan gem that
 * bobs and spins over a glinting ground ring; tapping it walks Ivy there and
 * getting close collects it (the proximity trigger Phase 4's math gems reuse).
 * On collect it bursts: rises, swells, and fades out.
 */
export default function Sparkle({ x, z, collected, onTap }) {
  const grp = useRef()
  const core = useRef()
  const ring = useRef()
  const burst = useRef(0) // collect animation progress 0 → 1

  useFrame((s, dt) => {
    if (!grp.current) return
    const t = s.clock.elapsedTime
    if (!collected) {
      grp.current.position.y = 0.9 + Math.sin(t * 2 + x) * 0.15
      core.current.rotation.y += dt * 1.4
      ring.current.material.opacity = 0.32 + Math.sin(t * 3 + z) * 0.18
    } else if (burst.current < 1) {
      burst.current = Math.min(1, burst.current + dt * 2.2)
      const b = burst.current
      grp.current.position.y += dt * 2.2
      grp.current.scale.setScalar(1 + b * 1.5)
      core.current.material.opacity = 1 - b
      ring.current.material.opacity = 0
      if (b >= 1) grp.current.visible = false
    }
  })

  return (
    <>
      <group ref={grp} position={[x, 0.9, z]} onPointerDown={onTap}>
        <mesh ref={core}>
          <octahedronGeometry args={[0.34]} />
          <meshStandardMaterial
            color="#2ec5c5"
            emissive="#2ec5c5"
            emissiveIntensity={0.55}
            transparent
            opacity={1}
          />
        </mesh>
        {/* invisible oversize hitbox — kid fingers, small gem */}
        <mesh visible={false}>
          <sphereGeometry args={[0.85]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
        <ringGeometry args={[0.42, 0.58, 32]} />
        <meshBasicMaterial color="#2ec5c5" transparent opacity={0.35} />
      </mesh>
    </>
  )
}
