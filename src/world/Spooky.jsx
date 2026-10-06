import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import BlobShadow from './BlobShadow'
import { WORLD } from '../config'

/*
 * Spooky.jsx — the Halloween dressing for the Star Arcade (season.js window).
 *
 * Built from three.js primitives, not GLBs: no Kenney Halloween pack is staged
 * in public/models, so these are drawn in the same flat-shaded low-poly look as
 * the Kenney minis (faceted, chunky, soft pastel-dark palette). CUTE, never
 * scary — Ivy is the audience: ghosts have big eyes and blush, pumpkins smile.
 *
 * Two kinds of thing live here:
 *  · SPOOKY_FX kinds (placed by fx.jsx's <FxProp>) — STATIC decor (pumpkin, grave, candle, torch, cauldron).
 *    They sit in map.decor like any Prop, so sparkles/stations/minimap already
 *    keep clear of them (decor entries carry `fx` instead of a GLB `name`).
 *  · <Ambient items/> — things that MOVE (floating flames, drifting ghosts).
 *    They live in map.ambient, float above head height and never block a tap
 *    (R3F only raycasts objects that carry handlers; none of these do).
 *
 * Materials + geometries are module singletons — dozens of pumpkins share one
 * orange material, so the whole set costs a handful of GPU programs.
 */

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra })
const glow = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 })

const MAT = {
  pumpkin: flat('#f08a2c'),
  pumpkinDeep: flat('#d9701c'),
  stem: flat('#5d7a3a'),
  stone: flat('#9a93b5'),
  stoneDark: flat('#77709a'),
  mound: flat('#9584c8'), // a soft grassy hump — darker read as a hole
  wax: flat('#fbeed2'),
  iron: flat('#3b3352', { roughness: 0.6 }),
  // opaque + strongly self-lit: a translucent ghost showed its overlapping inner
  // spheres, and dusk lighting turned its top grey. This reads as a soft glow.
  ghost: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#efe8ff', emissiveIntensity: 0.8, flatShading: true }),
  eye: new THREE.MeshBasicMaterial({ color: '#2a2140' }),
  blush: new THREE.MeshBasicMaterial({ color: '#ff9cc8', transparent: true, opacity: 0.85 }),
  brew: glow('#8ff07a'),
  face: glow('#ffd25e'),
}

// flame palettes: [outer, inner]. Orange = real fire; violet + mint = the
// friendly "spirit flames" that float around (purple is the arcade's colour).
const FLAME = {
  orange: ['#ff8a2a', '#ffe36b'],
  violet: ['#a77bff', '#f1e4ff'],
  mint: ['#4fe0b0', '#e3fff3'],
}
const flameMats = {}
const flameMat = (kind, layer) => {
  const key = kind + layer
  return (flameMats[key] ||= glow(FLAME[kind][layer], layer ? 1 : 0.92))
}

// a soft additive halo behind each flame — one canvas texture, made lazily
// (the module is imported by tests via maps.js → never; still, no DOM at load)
let haloTex
function haloTexture() {
  if (haloTex) return haloTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,0.9)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  haloTex = new THREE.CanvasTexture(c)
  return haloTex
}

const GEO = {
  ball: new THREE.SphereGeometry(0.5, 10, 7),
  lobe: new THREE.SphereGeometry(0.32, 8, 6),
  stem: new THREE.CylinderGeometry(0.05, 0.07, 0.22, 6),
  tri: new THREE.CircleGeometry(0.1, 3),
  flameOuter: new THREE.ConeGeometry(0.2, 0.55, 7),
  flameInner: new THREE.ConeGeometry(0.11, 0.32, 6),
  flameBase: new THREE.SphereGeometry(0.2, 8, 6),
  flameCore: new THREE.SphereGeometry(0.11, 7, 5),
  ghostHead: new THREE.SphereGeometry(0.42, 12, 9, 0, Math.PI * 2, 0, Math.PI / 2),
  ghostBody: new THREE.CylinderGeometry(0.42, 0.5, 0.5, 12, 1, true),
  ghostToe: new THREE.SphereGeometry(0.14, 7, 5),
  ghostArm: new THREE.SphereGeometry(0.11, 7, 5),
  dot: new THREE.SphereGeometry(0.075, 8, 6),
  blush: new THREE.CircleGeometry(0.07, 10),
}

// a carved jack-o'-lantern grin: a crescent with two teeth notches
const smile = (() => {
  const s = new THREE.Shape()
  s.moveTo(-0.2, 0.02)
  s.quadraticCurveTo(0, -0.2, 0.2, 0.02)
  s.lineTo(0.12, -0.02)
  s.lineTo(0.08, 0.04)
  s.lineTo(0.02, -0.04)
  s.lineTo(-0.04, 0.04)
  s.lineTo(-0.1, -0.03)
  s.closePath()
  return new THREE.ShapeGeometry(s)
})()

// ─────────────────────────── static props ───────────────────────────

function Pumpkin({ carved = true }) {
  // six lobes around a squashed core, the front left BETWEEN two lobes so the
  // face sits on a smooth patch
  const lobes = useMemo(() => [0, 1, 2, 3, 4, 5].map((k) => (Math.PI / 6) + (k * Math.PI) / 3), [])
  return (
    <group>
      <BlobShadow radius={0.6} />
      <group position={[0, 0.38, 0]} scale={[1, 0.78, 1]}>
        <mesh geometry={GEO.ball} material={MAT.pumpkin} />
        {lobes.map((a, i) => (
          <mesh key={i} geometry={GEO.lobe} material={i % 2 ? MAT.pumpkin : MAT.pumpkinDeep} position={[Math.sin(a) * 0.24, 0, Math.cos(a) * 0.24]} />
        ))}
      </group>
      <mesh geometry={GEO.stem} material={MAT.stem} position={[0, 0.8, 0]} rotation={[0.2, 0, 0.15]} />
      {carved && (
        <group position={[0, 0.42, 0.55]}>
          <mesh geometry={GEO.tri} material={MAT.face} position={[-0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={GEO.tri} material={MAT.face} position={[0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={smile} material={MAT.face} position={[0, -0.06, 0]} />
        </group>
      )}
    </group>
  )
}

function Grave({ variant = 0 }) {
  // a rounded headstone (slab + half-disc cap) on a little lilac mound
  return (
    <group>
      <mesh material={MAT.mound} position={[0, 0.02, 0.35]} scale={[0.55, 0.12, 0.7]} geometry={GEO.ball} />
      <group position={[0, 0, -0.05]} rotation={[-0.06, 0, variant ? 0.08 : -0.05]}>
        <mesh material={MAT.stone} position={[0, 0.38, 0]}>
          <boxGeometry args={[0.7, 0.76, 0.18]} />
        </mesh>
        <mesh material={MAT.stone} position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.18, 12, 1, false, -Math.PI / 2, Math.PI]} />
        </mesh>
        {/* a little carved cross on the face */}
        <mesh material={MAT.stoneDark} position={[0, 0.58, 0.095]}>
          <boxGeometry args={[0.06, 0.3, 0.02]} />
        </mesh>
        <mesh material={MAT.stoneDark} position={[0, 0.63, 0.095]}>
          <boxGeometry args={[0.2, 0.06, 0.02]} />
        </mesh>
      </group>
    </group>
  )
}

function Candle({ height = 0.35 }) {
  return (
    <group>
      <mesh material={MAT.wax} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.08, height, 8]} />
      </mesh>
      <Flame position={[0, height + 0.07, 0]} scale={0.3} />
    </group>
  )
}

function Torch() {
  // an iron lamp post with a fire basket — lines the paths, lights the way
  return (
    <group>
      <BlobShadow radius={0.35} />
      <mesh material={MAT.iron} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1.6, 6]} />
      </mesh>
      <mesh material={MAT.iron} position={[0, 1.63, 0]}>
        <cylinderGeometry args={[0.2, 0.08, 0.16, 8, 1, true]} />
      </mesh>
      <Flame position={[0, 1.78, 0]} scale={0.7} />
    </group>
  )
}

function Cauldron() {
  // the centrepiece by the spawn: a bubbling green brew over a little fire
  const bubbles = useRef([])
  const seeds = useMemo(() => [0, 1, 2, 3, 4].map((i) => ({ a: i * 1.3, r: 0.12 + (i % 3) * 0.12, t: i * 0.37 })), [])
  useFrame((_, dt) => {
    seeds.forEach((s, i) => {
      const b = bubbles.current[i]
      if (!b) return
      s.t = (s.t + dt * 0.55) % 1
      b.position.set(Math.cos(s.a) * s.r, 0.98 + s.t * 0.55, Math.sin(s.a) * s.r)
      b.scale.setScalar(0.6 + s.t * 0.7)
      b.material.opacity = 1 - s.t
    })
  })
  return (
    <group>
      <BlobShadow radius={1} />
      {/* three stubby legs + a ring of fire underneath */}
      {[0, 1, 2].map((k) => (
        <mesh key={k} material={MAT.iron} position={[Math.sin(k * 2.1) * 0.5, 0.15, Math.cos(k * 2.1) * 0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 6]} />
        </mesh>
      ))}
      <Flame position={[0, 0.12, 0.42]} scale={0.55} />
      <Flame position={[-0.36, 0.12, -0.2]} scale={0.5} />
      <Flame position={[0.36, 0.12, -0.2]} scale={0.5} />
      {/* the pot: a bowl (lower hemisphere) with a rim */}
      <mesh material={MAT.iron} position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.72, 14, 9, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68]} />
      </mesh>
      <mesh material={MAT.iron} position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.08, 6, 18]} />
      </mesh>
      <mesh material={MAT.brew} position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 18]} />
      </mesh>
      {seeds.map((s, i) => (
        <mesh key={i} ref={(el) => (bubbles.current[i] = el)} position={[0, 1, 0]}>
          <sphereGeometry args={[0.08, 7, 5]} />
          <meshBasicMaterial color="#c6ffb4" toneMapped={false} transparent />
        </mesh>
      ))}
    </group>
  )
}

// the static Halloween kinds, placed via world/fx.jsx's <FxProp>
export const SPOOKY_FX = { pumpkin: Pumpkin, grave: Grave, candle: Candle, torch: Torch, cauldron: Cauldron }

// ─────────────────────────── moving things ───────────────────────────

/** A flickering flame: two nested teardrops + a soft halo. Optionally floats. */
export function Flame({ position = [0, 0, 0], scale = 1, kind = 'orange', float = 0 }) {
  const g = useRef()
  const outer = useRef()
  const t = useRef(Math.random() * 10)
  const tex = useMemo(haloTexture, [])
  useFrame((_, dt) => {
    t.current += dt
    const k = t.current
    if (outer.current) {
      outer.current.scale.set(1 + Math.sin(k * 13) * 0.06, 1 + Math.sin(k * 9.3) * 0.12 + Math.sin(k * 21) * 0.05, 1)
      outer.current.rotation.z = Math.sin(k * 5.1) * 0.08
    }
    if (g.current && float) g.current.position.y = position[1] + Math.sin(k * 1.6) * float
  })
  return (
    <group ref={g} position={position} scale={scale}>
      <sprite scale={[1.3, 1.3, 1]} position={[0, 0.15, 0]}>
        <spriteMaterial map={tex} color={FLAME[kind][0]} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <group ref={outer}>
        <mesh geometry={GEO.flameBase} material={flameMat(kind, 0)} />
        <mesh geometry={GEO.flameOuter} material={flameMat(kind, 0)} position={[0, 0.26, 0]} />
        <mesh geometry={GEO.flameCore} material={flameMat(kind, 1)} position={[0, -0.02, 0.04]} />
        <mesh geometry={GEO.flameInner} material={flameMat(kind, 1)} position={[0, 0.15, 0.04]} />
      </group>
    </group>
  )
}

/** A floating spirit flame drifting slowly around a small loop. */
function Wisp({ center, radius = 1.2, height = 1.6, speed = 0.35, kind = 'violet', phase = 0, scale = 0.6 }) {
  const g = useRef()
  const t = useRef(phase)
  useFrame((_, dt) => {
    t.current += dt * speed
    const k = t.current
    if (!g.current) return
    // a lazy figure-eight, not a perfect circle — reads as drifting, not orbiting
    g.current.position.set(center[0] + Math.sin(k) * radius, height + Math.sin(k * 2.3) * 0.25, center[1] + Math.sin(k * 2) * radius * 0.5)
  })
  return (
    <group ref={g} position={[center[0], height, center[1]]}>
      <Flame scale={scale} kind={kind} />
    </group>
  )
}

/**
 * A cute ghost: drifts a slow loop, bobbing and swaying. When Ivy comes near it
 * stops, turns to look at her and does a happy wiggle — a friendly face, not a
 * fright. `charPosRef` is the player's live position (Scene's shared ref).
 */
function GhostFriend({ center, radius = 2.5, height = 1.25, speed = 0.3, phase = 0, scale = 1, charPosRef }) {
  const g = useRef()
  const body = useRef()
  const t = useRef(phase)
  const happy = useRef(0) // 0 → 1 as she approaches
  useFrame((_, dt) => {
    const o = g.current
    if (!o) return
    const p = charPosRef?.current
    const near = p ? Math.hypot(p.x - o.position.x, p.z - o.position.z) < 3 : false
    happy.current += ((near ? 1 : 0) - happy.current) * Math.min(1, dt * 3)
    const h = happy.current

    // drift slows to a hover while she's close
    t.current += dt * speed * (1 - h * 0.9)
    const k = t.current
    const x = center[0] + Math.cos(k) * radius
    const z = center[1] + Math.sin(k) * radius
    o.position.x = x
    o.position.z = z
    o.position.y = height + Math.sin(k * 3 + phase) * 0.15 + Math.sin(performance.now() / 160) * 0.06 * h

    // face along the loop; when she's near, turn to look out at the PLAYER —
    // aim between her and the follow-cam (which sits camOffset[2] behind her),
    // so the big eyes + blush actually face the screen instead of her back.
    const along = Math.atan2(-Math.sin(k), Math.cos(k)) // tangent of the circle
    const want = near && p ? Math.atan2(p.x - x, p.z + WORLD.camOffset[2] - z) : along
    o.rotation.y = dampAngle(o.rotation.y, want, 4, dt)
    if (body.current) body.current.rotation.z = Math.sin(k * 2.2) * 0.12 + Math.sin(performance.now() / 110) * 0.14 * h
  })
  return (
    <group ref={g} position={[center[0] + radius, height, center[1]]} scale={scale}>
      <group ref={body}>
        <mesh geometry={GEO.ghostHead} material={MAT.ghost} position={[0, 0.25, 0]} />
        <mesh geometry={GEO.ghostBody} material={MAT.ghost} />
        {/* wavy hem — six little toes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} geometry={GEO.ghostToe} material={MAT.ghost} position={[Math.sin((i * Math.PI) / 3) * 0.38, -0.27, Math.cos((i * Math.PI) / 3) * 0.38]} />
        ))}
        <mesh geometry={GEO.ghostArm} material={MAT.ghost} position={[-0.47, 0.02, 0.05]} />
        <mesh geometry={GEO.ghostArm} material={MAT.ghost} position={[0.47, 0.02, 0.05]} />
        {/* face: big eyes, blush, a little "o" */}
        <mesh geometry={GEO.dot} material={MAT.eye} position={[-0.14, 0.3, 0.37]} scale={[1, 1.35, 0.6]} />
        <mesh geometry={GEO.dot} material={MAT.eye} position={[0.14, 0.3, 0.37]} scale={[1, 1.35, 0.6]} />
        <mesh geometry={GEO.blush} material={MAT.blush} position={[-0.25, 0.16, 0.36]} rotation={[0, -0.5, 0]} />
        <mesh geometry={GEO.blush} material={MAT.blush} position={[0.25, 0.16, 0.36]} rotation={[0, 0.5, 0]} />
        <mesh geometry={GEO.dot} material={MAT.eye} position={[0, 0.13, 0.4]} scale={[0.55, 0.65, 0.4]} />
      </group>
      {/* a faint shadow on the ground under it, so it reads as floating */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, (-height + 0.03) / scale, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#2a2140" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Everything in map.ambient — the moving dressing. */
export function Ambient({ items = [], charPosRef }) {
  return items.map((it, i) =>
    it.kind === 'ghost' ? <GhostFriend key={i} {...it} charPosRef={charPosRef} /> : it.kind === 'wisp' ? <Wisp key={i} {...it} kind={it.color} /> : null,
  )
}

function dampAngle(a, b, lambda, dt) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * (1 - Math.exp(-lambda * dt))
}
