import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import BlobShadow from './BlobShadow'

/*
 * Market.jsx — the Merry Market's procedural dressing (2026-10-06): striped
 * stall canopies, the square's fountain, bunting, fruit crates, planters.
 *
 * Same deal as Spooky.jsx: the Kenney mini-market pack has the GOODS (fruit
 * stands, bread, freezers, shelves) but no stall roofs, fountain or flags, and
 * kenney.nl is unreachable from the build container — so these are three.js
 * primitives, flat-shaded to sit with Kenney. Placed from map.decor via `fx`
 * (see world/fx.jsx), so sparkles/stations/minimap keep clear of them for free.
 * Materials + geometries are module singletons.
 */

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra })
const mats = {}
const mat = (color) => (mats[color] ||= flat(color))

const WOOD = '#c98f5a'
const WOOD_DARK = '#a8703f'
const CREAM = '#fff8ec'
const STONE = '#d9d2c4'
const STONE_DARK = '#bfb6a5'

// pastel-bright stripe colours — every stall gets its own, cream between
export const AWNING_COLORS = {
  coral: '#ff7a6b',
  mint: '#4cc9a4',
  lilac: '#a98be8',
  sky: '#5aa9f0',
  pink: '#ff8fc0',
  sun: '#ffb62e',
}

const GEO = {
  post: new THREE.CylinderGeometry(0.05, 0.06, 1, 6),
  scallop: new THREE.CircleGeometry(0.16, 10, 0, Math.PI),
  ball: new THREE.SphereGeometry(0.5, 9, 7),
  fruit: new THREE.SphereGeometry(0.09, 7, 5),
  flag: (() => {
    const s = new THREE.Shape()
    s.moveTo(-0.13, 0)
    s.lineTo(0.13, 0)
    s.lineTo(0, -0.28)
    s.closePath()
    return new THREE.ShapeGeometry(s)
  })(),
  drop: new THREE.SphereGeometry(0.06, 6, 4),
}

/** A striped stall canopy on four posts. Front (the open, scalloped side) = +z. */
function Awning({ color = 'coral', width = 2.2, depth = 1.5, height = 1.75 }) {
  const c = AWNING_COLORS[color] || color
  const n = 6 // stripes across the width
  const sw = width / n
  const tilt = 0.32 // slopes down toward the customers
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} geometry={GEO.post} material={mat(WOOD)} position={[(sx * width) / 2.1, height / 2, (sz * depth) / 2.1]} scale={[1, height, 1]} />
      ))}
      <group position={[0, height + 0.12, 0]} rotation={[tilt, 0, 0]}>
        {Array.from({ length: n }, (_, i) => (
          <mesh key={i} material={mat(i % 2 ? CREAM : c)} position={[-width / 2 + sw * (i + 0.5), 0, 0]}>
            <boxGeometry args={[sw + 0.002, 0.05, depth + 0.2]} />
          </mesh>
        ))}
        {/* the scalloped valance along the front edge */}
        {Array.from({ length: n * 2 }, (_, i) => (
          <mesh key={i} geometry={GEO.scallop} material={mat(Math.floor(i / 2) % 2 ? CREAM : c)} position={[-width / 2 + (sw / 2) * (i + 0.5), -0.02, (depth + 0.2) / 2 + 0.005]} rotation={[-tilt, 0, Math.PI]} scale={[sw / 0.34, 1, 1]} />
        ))}
      </group>
    </group>
  )
}

/** The square's fountain: a stone basin, a two-tier spout, falling droplets. */
function Fountain() {
  const drops = useRef([])
  const ripple = useRef()
  const seeds = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2, t: (i * 0.37) % 1 })), [])
  useFrame((_, dt) => {
    seeds.forEach((s, i) => {
      const d = drops.current[i]
      if (!d) return
      s.t = (s.t + dt * 0.9) % 1
      const r = 0.15 + s.t * 0.75
      d.position.set(Math.cos(s.a) * r, 1.75 + s.t * 0.25 - s.t * s.t * 1.35, Math.sin(s.a) * r)
    })
    if (ripple.current) {
      const k = (performance.now() / 1600) % 1
      ripple.current.scale.setScalar(0.4 + k * 0.9)
      ripple.current.material.opacity = 0.5 * (1 - k)
    }
  })
  return (
    <group>
      <BlobShadow radius={1.8} />
      {/* basin wall + rim */}
      <mesh material={mat(STONE)} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[1.55, 1.65, 0.44, 16, 1, true]} />
      </mesh>
      <mesh material={mat(STONE_DARK)} position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.1, 6, 24]} />
      </mesh>
      {/* the water */}
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 24]} />
        <meshStandardMaterial color="#7fd3f5" emissive="#3fb2e6" emissiveIntensity={0.25} flatShading />
      </mesh>
      <mesh ref={ripple} position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1, 28]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      {/* the spout: pillar, a small bowl, a finial */}
      <mesh material={mat(STONE)} position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.1, 8]} />
      </mesh>
      <mesh material={mat(STONE_DARK)} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.55, 0.25, 0.22, 12]} />
      </mesh>
      <mesh position={[0, 1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#7fd3f5" emissive="#3fb2e6" emissiveIntensity={0.25} />
      </mesh>
      <mesh material={mat(STONE)} position={[0, 1.78, 0]} geometry={GEO.ball} scale={0.22} />
      {seeds.map((s, i) => (
        <mesh key={i} ref={(el) => (drops.current[i] = el)} geometry={GEO.drop}>
          <meshBasicMaterial color="#c9efff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

const FLAG_COLORS = ['#ff7a6b', '#ffb62e', '#4cc9a4', '#5aa9f0', '#a98be8', '#ff8fc0']

/** A string of bunting between two poles, `span` apart along local x. Sways. */
function Bunting({ span = 8, height = 2.7 }) {
  const flags = useRef()
  const n = Math.max(4, Math.round(span / 0.55))
  const sag = Math.min(0.6, span * 0.05)
  const pts = useMemo(
    () => Array.from({ length: n }, (_, i) => {
      const u = (i + 0.5) / n
      return [-span / 2 + u * span, height - 0.05 - sag * 4 * u * (1 - u)]
    }),
    [n, span, height, sag],
  )
  const rope = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-span / 2, height, 0),
      new THREE.Vector3(0, height - sag * 2, 0),
      new THREE.Vector3(span / 2, height, 0),
    )
    return new THREE.TubeGeometry(curve, 16, 0.02, 4, false)
  }, [span, height, sag])
  useFrame(() => {
    const t = performance.now() / 700
    flags.current?.children.forEach((f, i) => (f.rotation.x = Math.sin(t + i * 0.7) * 0.25))
  })
  return (
    <group>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[(sx * span) / 2, 0, 0]}>
          <BlobShadow radius={0.3} />
          <mesh geometry={GEO.post} material={mat(WOOD_DARK)} position={[0, height / 2, 0]} scale={[1.2, height, 1.2]} />
          <mesh geometry={GEO.ball} material={mat(AWNING_COLORS.sun)} position={[0, height + 0.08, 0]} scale={0.18} />
        </group>
      ))}
      <mesh geometry={rope} material={mat('#7a6a5a')} />
      <group ref={flags}>
        {pts.map(([x, y], i) => (
          <mesh key={i} geometry={GEO.flag} material={mat(FLAG_COLORS[i % FLAG_COLORS.length])} position={[x, y, 0]} />
        ))}
      </group>
    </group>
  )
}

const FRUITS = { apples: ['#e8443a', '#f25a4c', '#ff7a5c'], oranges: ['#ff9a2e', '#ffb04a'], limes: ['#7cc44a', '#98d65c'], plums: ['#8b5bd6', '#a77bff'] }

/** A wooden crate heaped with fruit. */
function Crate({ fruit = 'apples' }) {
  const heap = useMemo(() => {
    const cs = FRUITS[fruit] || FRUITS.apples
    const out = []
    for (let i = 0; i < 9; i++) out.push([((i % 3) - 1) * 0.17, ((Math.floor(i / 3)) - 1) * 0.17, cs[i % cs.length]])
    return out
  }, [fruit])
  return (
    <group>
      <BlobShadow radius={0.45} />
      <mesh material={mat(WOOD)} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
      </mesh>
      {[-0.12, 0.12].map((y) => (
        <mesh key={y} material={mat(WOOD_DARK)} position={[0, 0.2 + y, 0.302]}>
          <boxGeometry args={[0.6, 0.05, 0.01]} />
        </mesh>
      ))}
      {heap.map(([x, z, c], i) => (
        <mesh key={i} geometry={GEO.fruit} material={mat(c)} position={[x, 0.45 + (i === 4 ? 0.08 : 0), z]} />
      ))}
    </group>
  )
}

/** A painted planter box with a round bush and a few flowers. */
function Planter({ flowers = '#ff8fc0' }) {
  return (
    <group>
      <BlobShadow radius={0.55} />
      <mesh material={mat(AWNING_COLORS.sky)} position={[0, 0.22, 0]}>
        <boxGeometry args={[0.8, 0.44, 0.8]} />
      </mesh>
      <mesh material={mat(CREAM)} position={[0, 0.46, 0]}>
        <boxGeometry args={[0.86, 0.06, 0.86]} />
      </mesh>
      <mesh geometry={GEO.ball} material={mat('#6cbf5a')} position={[0, 0.72, 0]} scale={[0.75, 0.6, 0.75]} />
      {[[0.18, 0.92, 0.15], [-0.2, 0.88, 0.05], [0.02, 0.95, -0.2], [-0.05, 0.9, 0.25]].map((p, i) => (
        <mesh key={i} geometry={GEO.fruit} material={mat(i % 2 ? flowers : CREAM)} position={p} scale={0.9} />
      ))}
    </group>
  )
}

export const MARKET_FX = { awning: Awning, fountain: Fountain, bunting: Bunting, crate: Crate, planter: Planter }
