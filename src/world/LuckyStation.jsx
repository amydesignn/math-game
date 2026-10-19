import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/*
 * LuckyStation — a NEW player's welcome gift, as it stands in the world
 * (2026-10-18, Amy; motion: Fern). It shows up near her in every world she
 * enters until her first right answer. Built on the daily Station's shape (ring
 * + orb + hitbox + the universal white farewell) but made to read as special:
 *   · a pastel RAINBOW ring that slowly turns (one turn / 8s) — the colours
 *     move, the brightness stays steady (a daily ring pulses; this one never
 *     does, so it never strobes)
 *   · a wide faint glow under it that breathes once every 4s
 *   · a few specks of light drifting up
 *   · the orb's glow drifts through the same pastel hues
 *   · a 🎁 marker, NO nameplate — the gold hint pill says the words (Linden)
 * Arrival: 400ms after she lands, the ring opens out from nothing over 600ms
 * and the orb rises in. Goodbye: the white dissolve every station shares, plus
 * a rainbow shockwave. Reduced motion: shown still — no turning, no specks, no
 * reveal; the farewell is a plain fade.
 */
const REVEAL_DELAY = 0.4
const REVEAL = 0.6
const FAREWELL = 1.6
const SPECKS = 7

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A small canvas of pastel hue wedges. On a ringGeometry the planar UVs map
 *  angle → hue, so the ring reads as a rainbow all the way round. */
function rainbowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const n = 90
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1.5) / n) * Math.PI * 2
    g.beginPath()
    g.moveTo(64, 64)
    g.arc(64, 64, 64, a0, a1)
    g.closePath()
    g.fillStyle = `hsl(${(i / n) * 360}, 90%, 74%)`
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const easeOut = (x) => 1 - Math.pow(1 - x, 3)

export default function LuckyStation({ x, z, farewell = false, onTap }) {
  const root = useRef()
  const ring = useRef()
  const glow = useRef()
  const orb = useRef()
  const flash = useRef()
  const shock = useRef()
  const specks = useRef([])
  const born = useRef(null) // clock time at first frame
  const fw = useRef(0) // farewell progress 0 → 1
  const still = useMemo(reduced, [])
  const tex = useMemo(rainbowTexture, [])
  const hue = useMemo(() => new THREE.Color(), [])
  const seeds = useMemo(() => [...Array(SPECKS)].map((_, i) => ({ a: (i / SPECKS) * Math.PI * 2, r: 0.45 + (i % 3) * 0.18, off: i / SPECKS })), [])

  useFrame((s, dt) => {
    if (!root.current || !orb.current) return
    const t = s.clock.elapsedTime
    if (born.current == null) born.current = t
    const age = t - born.current

    if (!farewell) {
      // arrival: the ring opens out, the orb rises in (still → already there)
      const k = still ? 1 : easeOut(Math.min(1, Math.max(0, (age - REVEAL_DELAY) / REVEAL)))
      root.current.scale.setScalar(Math.max(0.001, k))
      if (!still) {
        if (ring.current) ring.current.rotation.z = -t * ((Math.PI * 2) / 8) // one turn / 8s
        if (glow.current) glow.current.material.opacity = 0.22 + Math.sin(t * ((Math.PI * 2) / 4)) * 0.08 // breathes / 4s
        orb.current.position.y = 1.05 + Math.sin(t * 1.6) * 0.12
        orb.current.rotation.y += dt * 0.5
        hue.setHSL((t / 12) % 1, 0.9, 0.62) // the orb's glow drifts through the rainbow
        orb.current.material.emissive.copy(hue)
        specks.current.forEach((m, i) => {
          if (!m) return
          const sd = seeds[i]
          const p = (t / 3 + sd.off) % 1 // each speck rises over 3s, then starts again
          m.position.set(Math.cos(sd.a + t * 0.3) * sd.r, 0.2 + p * 2.0, Math.sin(sd.a + t * 0.3) * sd.r)
          m.material.opacity = Math.sin(p * Math.PI) * 0.9
        })
      }
      return
    }

    // goodbye — the white dissolve every station shares, plus a rainbow shockwave
    fw.current = Math.min(1, fw.current + dt / FAREWELL)
    const b = fw.current
    orb.current.position.y = 1.05 + (still ? 0 : b * 1.1)
    orb.current.scale.setScalar(Math.max(0.001, 1 - b * 0.8))
    orb.current.material.opacity = 1 - b
    if (ring.current) ring.current.material.opacity = 0.9 * (1 - b)
    if (glow.current) glow.current.material.opacity = 0.25 * (1 - b)
    specks.current.forEach((m) => m && (m.material.opacity = 0))
    if (flash.current && !still) {
      const f = Math.sin(Math.min(1, b * 2) * Math.PI)
      flash.current.material.opacity = f * 0.95
      flash.current.scale.setScalar(0.6 + f * 0.9)
      flash.current.position.y = orb.current.position.y
    }
    if (shock.current && !still) {
      shock.current.scale.setScalar(0.4 + b * 3)
      shock.current.material.opacity = 0.85 * (1 - b)
    }
  })

  return (
    <group position={[x, 0, z]}>
      <group ref={root} scale={still ? 1 : 0.001}>
        {/* the wide breathing glow under it */}
        <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <circleGeometry args={[1.35, 48]} />
          <meshBasicMaterial color="#FFE08A" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        {/* the turning pastel rainbow ring */}
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry args={[0.7, 1.05, 72]} />
          <meshBasicMaterial map={tex} transparent opacity={0.9} depthWrite={false} />
        </mesh>
        {/* a thin white inner ring — a little more "special" */}
        {!farewell && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
            <ringGeometry args={[0.36, 0.44, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} depthWrite={false} />
          </mesh>
        )}
        {/* the orb */}
        <mesh ref={orb} position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.44, 28, 28]} />
          <meshStandardMaterial color={farewell ? '#ffffff' : '#FFF6E0'} emissive={farewell ? '#ffffff' : '#FFB3C7'} emissiveIntensity={farewell ? 0.9 : 0.75} transparent opacity={1} />
        </mesh>
        {/* specks of light drifting up */}
        {!still &&
          seeds.map((sd, i) => (
            <mesh key={i} ref={(m) => (specks.current[i] = m)}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={`hsl(${(i / SPECKS) * 360}, 90%, 80%)`} transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
      </group>

      {farewell && (
        <>
          <mesh ref={flash} position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.6, 20, 20]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} />
          </mesh>
          <mesh ref={shock} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[0.5, 0.7, 64]} />
            <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} />
          </mesh>
        </>
      )}

      {/* invisible oversize hitbox — kid fingers, from anywhere near the ring */}
      {!farewell && (
        <mesh position={[0, 0.9, 0]} onPointerDown={onTap}>
          <sphereGeometry args={[1.25]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* the 🎁 marker (pointer-transparent so the hitbox wins) */}
      {!farewell && (
        <Html center position={[0, 1.85, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }} zIndexRange={[0, 0]}>
          <div style={{ fontSize: 40, lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(40,30,70,.4))', animation: still ? 'none' : 'markerOrbit 2.6s ease-in-out infinite' }}>🎁</div>
        </Html>
      )}
    </group>
  )
}
