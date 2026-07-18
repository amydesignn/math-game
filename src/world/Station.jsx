import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

/*
 * Station — a themed mini-quest as it sits in the world (Oscar's encounter tier
 * 3, the 3D lift of <StationMarker/>). A glowing orb in the skin's colour bobs
 * over a pulsing ring, the skin's marker + quest label float above it, and an
 * oversize invisible hitbox lets kid fingers tap it from anywhere near. Walking
 * into the ring opens the quest (proximity check lives in Scene, like sparkles).
 *
 * FAREWELL v1 (Amy's pick, locked 2026-07-17): on a COMPLETED close the parent
 * flips `farewell` and the orb plays ONE effect — a sparkle-white dissolve,
 * UNIVERSAL SILVER-WHITE for every skin. The station wears its colour in life;
 * the goodbye is the same white magic everywhere, one language world-wide.
 * (Variants H/I/J are fenced for a later "special stations" drop — not built.)
 */
export default function Station({ x, z, skin, resume = 0, farewell = false, onTap }) {
  const orb = useRef()
  const ring = useRef()
  const flash = useRef()
  const shock = useRef()
  const fw = useRef(0) // farewell progress 0 → 1

  useFrame((s, dt) => {
    if (!orb.current) return
    const t = s.clock.elapsedTime

    if (!farewell) {
      // idle life: bob the orb, breathe the ring
      orb.current.position.y = 1.05 + Math.sin(t * 1.8 + x) * 0.14
      orb.current.rotation.y += dt * 0.6
      if (ring.current) {
        const p = 0.5 + Math.sin(t * 2.4 + z) * 0.5 // 0..1 pulse
        ring.current.scale.setScalar(1 + p * 0.22)
        ring.current.material.opacity = 0.35 + p * 0.3
      }
      return
    }

    // the goodbye — a ~1.6s white dissolve, universal silver-white
    fw.current = Math.min(1, fw.current + dt / 1.6)
    const b = fw.current
    // orb rises, shrinks, and fades to white as it goes
    orb.current.position.y = 1.05 + b * 1.1
    orb.current.scale.setScalar(Math.max(0.001, 1 - b * 0.8))
    orb.current.material.opacity = 1 - b
    if (ring.current) ring.current.material.opacity = 0.4 * (1 - b)
    if (flash.current) {
      // a quick bloom of white at the top of the dissolve
      const f = Math.sin(Math.min(1, b * 2) * Math.PI) // 0→1→0 over the first half
      flash.current.material.opacity = f * 0.95
      flash.current.scale.setScalar(0.6 + f * 0.9)
      flash.current.position.y = orb.current.position.y
    }
    if (shock.current) {
      shock.current.scale.setScalar(0.4 + b * 2.4)
      shock.current.material.opacity = 0.6 * (1 - b)
    }
  })

  const accent = skin.accent
  const glow = skin.glow

  return (
    <group position={[x, 0, z]}>
      {/* ground ring — the skin's colour in life; white as it says goodbye */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.62, 0.86, 48]} />
        <meshBasicMaterial color={farewell ? '#E2E8F0' : accent} transparent opacity={0.4} />
      </mesh>
      {/* dashed inner accent ring — a little more "quest", not just "gem" */}
      {!farewell && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, 0]}>
          <ringGeometry args={[0.3, 0.4, 40]} />
          <meshBasicMaterial color={accent} transparent opacity={0.45} />
        </mesh>
      )}

      {/* the orb */}
      <mesh ref={orb} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial
          color={farewell ? '#ffffff' : glow}
          emissive={farewell ? '#ffffff' : accent}
          emissiveIntensity={farewell ? 0.9 : 0.5}
          transparent
          opacity={1}
        />
      </mesh>

      {/* farewell-only: white bloom + expanding shockwave (universal, no skin colour) */}
      {farewell && (
        <>
          <mesh ref={flash} position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.6, 20, 20]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} />
          </mesh>
          <mesh ref={shock} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[0.5, 0.66, 48]} />
            <meshBasicMaterial color="#F8FAFC" transparent opacity={0} />
          </mesh>
        </>
      )}

      {/* invisible oversize hitbox — kid fingers, from anywhere near the ring */}
      {!farewell && (
        <mesh position={[0, 0.9, 0]} onPointerDown={onTap}>
          <sphereGeometry args={[1.15]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* the floating marker + quest label (pointer-transparent so the hitbox wins) */}
      {!farewell && (
        <Html center distanceFactor={9} position={[0, 2.35, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }} zIndexRange={[12, 0]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 40, lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(40,30,70,.4))', animation: 'markerOrbit 2.6s ease-in-out infinite' }}>{skin.marker}</div>
            <div style={{
              background: `linear-gradient(180deg,${glow},${accent})`, color: '#fff', fontWeight: 700, fontSize: 15,
              padding: '7px 15px', borderRadius: 18, boxShadow: `0 6px 16px ${accent}72`, textShadow: '0 1px 3px rgba(0,0,0,.25)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {resume > 0 ? `${skin.questLabel} · ${resume} done ✨` : `${skin.questLabel}! ✨`}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
