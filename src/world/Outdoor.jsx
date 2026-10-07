import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import BlobShadow from './BlobShadow'
import { modelUrl } from '../config'

/*
 * Outdoor.jsx — procedural dressing for the Rosy Garden and the Forest
 * Clearing (2026-10-06, Ivy: "people there too", Amy: "a shed, people getting
 * tools in and out of it, working on their garden").
 *
 * Same deal as Market.jsx: Kenney's packs have trees, plants and borders but no
 * shed, hedges, pond, benches, campfire or garden tools — so these are three.js
 * primitives, flat-shaded to sit with Kenney. Placed from map.decor via `fx`
 * (world/fx.jsx). The CARRY kinds are the things a neighbour holds in their
 * right hand (Neighbour.jsx parents them to the `arm-right` bone).
 * Materials + geometries are module singletons.
 */

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra })
const mats = {}
const mat = (color) => (mats[color] ||= flat(color))

const WOOD = '#c98f5a'
const WOOD_DARK = '#a8703f'
const WOOD_PALE = '#e2b07c'
const CREAM = '#fff8ec'
const STONE = '#d9d2c4'
const STONE_DARK = '#bfb6a5'
const LEAF = '#6cbf5a'
const LEAF_DARK = '#4fa046'
const ROOF = '#4cc9a4' // the market's mint stripe — one palette across worlds
const ROSE = '#ff8fc0'
const DARK = '#3b2a3f' // the inside of a doorway
const METAL = '#9fb4c7'

const GEO = {
  ball: new THREE.SphereGeometry(0.5, 9, 7),
  bud: new THREE.SphereGeometry(0.07, 6, 4),
  log: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  pole: new THREE.CylinderGeometry(0.025, 0.025, 1, 5),
  flame: new THREE.ConeGeometry(0.5, 1, 6),
  arch: new THREE.TorusGeometry(0.9, 0.09, 6, 14, Math.PI),
  wheel: new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10),
}

/** A garden shed, door on the +z face (the follow-cam's side) standing open,
 *  so a gardener can be seen walking in and out. ~2 × 1.6, eaves 1.35. */
function Shed() {
  const W = 2, D = 1.6, H = 1.35, DOOR_W = 0.72, DOOR_H = 1.05
  const side = (W - DOOR_W) / 2
  return (
    <group>
      <BlobShadow radius={1.3} />
      {/* back + sides */}
      <mesh material={mat(WOOD)} position={[0, H / 2, -D / 2]}><boxGeometry args={[W, H, 0.08]} /></mesh>
      <mesh material={mat(WOOD)} position={[-W / 2, H / 2, 0]}><boxGeometry args={[0.08, H, D]} /></mesh>
      <mesh material={mat(WOOD)} position={[W / 2, H / 2, 0]}><boxGeometry args={[0.08, H, D]} /></mesh>
      {/* front: two panels either side of the doorway + the lintel */}
      <mesh material={mat(WOOD)} position={[-(DOOR_W + side) / 2, H / 2, D / 2]}><boxGeometry args={[side, H, 0.08]} /></mesh>
      <mesh material={mat(WOOD)} position={[(DOOR_W + side) / 2, H / 2, D / 2]}><boxGeometry args={[side, H, 0.08]} /></mesh>
      <mesh material={mat(WOOD)} position={[0, (H + DOOR_H) / 2, D / 2]}><boxGeometry args={[DOOR_W, H - DOOR_H, 0.08]} /></mesh>
      {/* the dark inside, so the doorway reads as a way in */}
      <mesh material={mat(DARK)} position={[0, H / 2, -D / 2 + 0.05]}><boxGeometry args={[W - 0.12, H - 0.02, 0.02]} /></mesh>
      <mesh material={mat(DARK)} position={[0, 0.01, 0]}><boxGeometry args={[W - 0.12, 0.02, D - 0.12]} /></mesh>
      {/* the door, swung wide open against the front */}
      <group position={[DOOR_W / 2, 0, D / 2 + 0.04]} rotation={[0, -1.9, 0]}>
        <mesh material={mat(ROOF)} position={[-DOOR_W / 2, DOOR_H / 2, 0]}><boxGeometry args={[DOOR_W, DOOR_H, 0.05]} /></mesh>
        <mesh material={mat(CREAM)} position={[-DOOR_W + 0.1, DOOR_H / 2, 0.04]}><boxGeometry args={[0.06, 0.06, 0.04]} /></mesh>
      </group>
      {/* trim at the corners */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => (
        <mesh key={i} material={mat(CREAM)} position={[sx * W / 2, H / 2, sz * D / 2]}><boxGeometry args={[0.1, H, 0.1]} /></mesh>
      ))}
      {/* gable roof: two slopes + the gable ends */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat(ROOF)} position={[s * W / 4 * 1.08, H + 0.33, 0]} rotation={[0, 0, -s * 0.58]}>
          <boxGeometry args={[W * 0.62, 0.08, D + 0.3]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat(WOOD)} position={[0, H, s * D / 2]}>
          <cylinderGeometry args={[0.001, W / Math.SQRT2 * 0.82, 0.08, 4, 1, false, Math.PI / 4]} />
        </mesh>
      ))}
      {/* a window on the west wall with a flower box under it */}
      <mesh material={mat(CREAM)} position={[-W / 2 - 0.03, 0.85, 0]}><boxGeometry args={[0.04, 0.46, 0.56]} /></mesh>
      <mesh material={mat('#bfe3f7')} position={[-W / 2 - 0.05, 0.85, 0]}><boxGeometry args={[0.02, 0.36, 0.46]} /></mesh>
      <mesh material={mat(WOOD_DARK)} position={[-W / 2 - 0.14, 0.52, 0]}><boxGeometry args={[0.2, 0.14, 0.6]} /></mesh>
      {[-0.2, 0, 0.2].map((z, i) => (
        <mesh key={z} geometry={GEO.bud} material={mat(i % 2 ? CREAM : ROSE)} position={[-W / 2 - 0.14, 0.64, z]} scale={1.3} />
      ))}
    </group>
  )
}

/** A clipped hedge. `len` along x. */
function Hedge({ len = 2, flowers }) {
  const buds = useMemo(() => {
    if (!flowers) return []
    const n = Math.max(2, Math.round(len * 2))
    return Array.from({ length: n }, (_, i) => [(-len / 2) + (i + 0.5) * (len / n), 0.62 + (i % 2) * 0.04, (i % 2 ? 0.26 : -0.2)])
  }, [len, flowers])
  return (
    <group>
      <BlobShadow radius={Math.max(0.5, len / 2)} />
      <mesh material={mat(LEAF_DARK)} position={[0, 0.3, 0]}><boxGeometry args={[len, 0.6, 0.55]} /></mesh>
      <mesh material={mat(LEAF)} position={[0, 0.6, 0]}><boxGeometry args={[len - 0.04, 0.06, 0.5]} /></mesh>
      {buds.map((p, i) => <mesh key={i} geometry={GEO.bud} material={mat(flowers)} position={p} />)}
    </group>
  )
}

/** A rose bush — a round green bush dotted with blooms. */
const BLOOMS = [[0.22, 0.42, 0.1], [-0.2, 0.46, 0.12], [0.05, 0.56, -0.18], [-0.08, 0.36, 0.26], [0.26, 0.3, -0.12], [-0.27, 0.3, -0.1]]
function RoseBush({ color = ROSE }) {
  return (
    <group>
      <BlobShadow radius={0.4} />
      <mesh geometry={GEO.ball} material={mat(LEAF_DARK)} position={[0, 0.3, 0]} scale={[0.7, 0.6, 0.7]} />
      {BLOOMS.map((p, i) => <mesh key={i} geometry={GEO.bud} material={mat(i % 3 === 2 ? CREAM : color)} position={p} scale={1.25} />)}
    </group>
  )
}

/** A wooden bench facing +z. */
function Bench() {
  return (
    <group>
      <BlobShadow radius={0.6} />
      <mesh material={mat(WOOD)} position={[0, 0.24, 0]}><boxGeometry args={[1.2, 0.06, 0.36]} /></mesh>
      <mesh material={mat(WOOD)} position={[0, 0.5, -0.17]} rotation={[-0.15, 0, 0]}><boxGeometry args={[1.2, 0.26, 0.05]} /></mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} material={mat(WOOD_DARK)} position={[x, 0.12, 0]}><boxGeometry args={[0.07, 0.24, 0.32]} /></mesh>
      ))}
    </group>
  )
}

/** A round lily pond with a stone rim. `r` = water radius. */
function Pond({ r = 1.6 }) {
  const pads = [[0.45, 0.3, 0.18], [-0.5, -0.2, 0.22], [0.1, -0.6, 0.15], [-0.2, 0.55, 0.16]]
  return (
    <group>
      <mesh material={mat('#7cc8f0')} position={[0, 0.03, 0]}><cylinderGeometry args={[r, r, 0.04, 20]} /></mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return (
          <mesh key={i} geometry={GEO.ball} material={mat(i % 3 ? STONE : STONE_DARK)}
            position={[Math.cos(a) * (r + 0.12), 0.07, Math.sin(a) * (r + 0.12)]} scale={[0.42, 0.2, 0.34]} rotation={[0, -a, 0]} />
        )
      })}
      {pads.map(([x, z, s], i) => (
        <group key={i} position={[x * r, 0.06, z * r]}>
          <mesh material={mat(LEAF)}><cylinderGeometry args={[s * r * 0.9, s * r * 0.9, 0.02, 8]} /></mesh>
          {i % 2 === 0 && <mesh geometry={GEO.bud} material={mat(ROSE)} position={[0, 0.05, 0]} scale={1.2} />}
        </group>
      ))}
    </group>
  )
}

/** A rose arch over a path — open along z (walk through it east–west by
 *  default; rotate to suit). */
function RoseArch() {
  const buds = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 8) * Math.PI
    return [Math.cos(a) * 0.9, Math.sin(a) * 0.9 + 1.0, (i % 2 ? 0.08 : -0.08)]
  }), [])
  return (
    <group>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} geometry={GEO.pole} material={mat(CREAM)} position={[x, 0.5, 0]} scale={[2.2, 1, 2.2]} />
      ))}
      <mesh geometry={GEO.arch} material={mat(LEAF_DARK)} position={[0, 1.0, 0]} />
      {buds.map((p, i) => <mesh key={i} geometry={GEO.bud} material={mat(i % 3 ? ROSE : CREAM)} position={p} scale={1.4} />)}
    </group>
  )
}

/** A little round table with a teapot and two cups — for the gazebo. */
function TeaTable() {
  return (
    <group>
      <BlobShadow radius={0.45} />
      <mesh material={mat(CREAM)} position={[0, 0.38, 0]}><cylinderGeometry args={[0.38, 0.38, 0.05, 14]} /></mesh>
      <mesh material={mat(WOOD_DARK)} position={[0, 0.18, 0]}><cylinderGeometry args={[0.05, 0.1, 0.36, 6]} /></mesh>
      <mesh geometry={GEO.ball} material={mat(ROSE)} position={[0, 0.5, 0]} scale={[0.2, 0.17, 0.2]} />
      <mesh material={mat(ROSE)} position={[0.13, 0.5, 0]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.015, 0.025, 0.14, 5]} /></mesh>
      {[[-0.2, 0.15], [0.18, -0.18]].map(([x, z], i) => (
        <mesh key={i} material={mat(CREAM)} position={[x, 0.44, z]}><cylinderGeometry args={[0.045, 0.035, 0.07, 8]} /></mesh>
      ))}
    </group>
  )
}

/** A wheelbarrow full of soil, handles toward -x. */
function Wheelbarrow() {
  return (
    <group>
      <BlobShadow radius={0.5} />
      <mesh material={mat(ROOF)} position={[0, 0.34, 0]}><boxGeometry args={[0.66, 0.24, 0.48]} /></mesh>
      <mesh material={mat('#8a5a3b')} position={[0, 0.47, 0]}><boxGeometry args={[0.58, 0.04, 0.4]} /></mesh>
      <mesh geometry={GEO.wheel} material={mat('#3b3340')} position={[0.4, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {[-0.17, 0.17].map((z) => (
        <mesh key={z} material={mat(WOOD_DARK)} position={[-0.38, 0.3, z]} rotation={[0, 0, 0.25]}><boxGeometry args={[0.6, 0.04, 0.04]} /></mesh>
      ))}
      {[-0.14, 0.14].map((z) => (
        <mesh key={z} material={mat(WOOD_DARK)} position={[-0.18, 0.11, z]}><boxGeometry args={[0.04, 0.22, 0.04]} /></mesh>
      ))}
    </group>
  )
}

/** Tools leaning on a rack: a rake, a spade, a hoe. */
function ToolRack() {
  return (
    <group>
      <mesh material={mat(WOOD_DARK)} position={[0, 0.85, 0]}><boxGeometry args={[0.9, 0.06, 0.06]} /></mesh>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} material={mat(WOOD_DARK)} position={[x, 0.43, 0]}><boxGeometry args={[0.06, 0.86, 0.06]} /></mesh>
      ))}
      {[[-0.25, Rake], [0, Spade], [0.25, Rake]].map(([x, Tool], i) => (
        <group key={i} position={[x, 0, 0.08]} rotation={[-0.12, 0, 0]}><Tool standing /></group>
      ))}
    </group>
  )
}

/** A little wooden stool — a seat for the gazebo's tea party. */
function Stool() {
  return (
    <group>
      <BlobShadow radius={0.25} />
      <mesh material={mat(WOOD)} position={[0, 0.27, 0]}><cylinderGeometry args={[0.2, 0.2, 0.05, 10]} /></mesh>
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} material={mat(WOOD_DARK)} position={[Math.cos(a) * 0.12, 0.13, Math.sin(a) * 0.12]}>
          <boxGeometry args={[0.04, 0.26, 0.04]} />
        </mesh>
      ))}
    </group>
  )
}

/** A sack of soil / seed. */
function Sack({ color = '#d8c39a' }) {
  return (
    <group>
      <BlobShadow radius={0.3} />
      <mesh geometry={GEO.ball} material={mat(color)} position={[0, 0.2, 0]} scale={[0.42, 0.42, 0.34]} />
      <mesh material={mat(color)} position={[0, 0.42, 0]}><cylinderGeometry args={[0.05, 0.1, 0.1, 6]} /></mesh>
    </group>
  )
}

/** A crackling campfire — flickering flame cones on crossed logs. Sits inside
 *  its own ring of stones (Kenney's `stones` is a rock pile, not a ring). */
function Campfire() {
  const flames = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    flames.current?.children.forEach((c, i) => {
      const s = 1 + Math.sin(t * (7 + i * 2.3) + i) * 0.12
      c.scale.set(c.userData.s * (2 - s) * 0.5 + c.userData.s * 0.5, c.userData.h * s, c.userData.s * (2 - s) * 0.5 + c.userData.s * 0.5)
    })
  })
  const cones = [[0, 0, 0.32, 0.7, '#ff7a3b'], [0.1, 0.06, 0.2, 0.5, '#ffb62e'], [-0.09, -0.05, 0.18, 0.42, '#ffd25c']]
  return (
    <group>
      {/* the ring of stones round it */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        return (
          <mesh key={i} geometry={GEO.ball} material={mat(i % 3 ? STONE : STONE_DARK)}
            position={[Math.cos(a) * 0.52, 0.06, Math.sin(a) * 0.52]} scale={[0.26, 0.16, 0.22]} rotation={[0, -a, 0]} />
        )
      })}
      {[0, Math.PI / 3, -Math.PI / 3].map((r, i) => (
        <mesh key={i} geometry={GEO.log} material={mat(WOOD_DARK)} position={[0, 0.07, 0]} rotation={[0, r, Math.PI / 2]} scale={[0.08, 0.7, 0.08]} />
      ))}
      <group ref={flames}>
        {cones.map(([x, z, s, h, c], i) => (
          <mesh key={i} geometry={GEO.flame} position={[x, 0.1 + h / 2, z]} scale={[s, h, s]} userData={{ s, h }}
            material={mats[`flame${c}`] ||= flat(c, { emissive: c, emissiveIntensity: 0.9 })} />
        ))}
      </group>
    </group>
  )
}

/** A log to sit on, lying along x. */
function LogSeat({ len = 1.1 }) {
  return (
    <group>
      <BlobShadow radius={0.5} />
      <mesh geometry={GEO.log} material={mat(WOOD)} position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.15, len, 0.15]} />
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat(WOOD_PALE)} position={[s * len / 2, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.01, 8]} />
        </mesh>
      ))}
    </group>
  )
}

/** A stack of chopped firewood. */
function Woodpile() {
  const logs = [[-0.2, 0.09], [0, 0.09], [0.2, 0.09], [-0.1, 0.25], [0.1, 0.25], [0, 0.41]]
  return (
    <group>
      <BlobShadow radius={0.45} />
      {logs.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh geometry={GEO.log} material={mat(WOOD)} rotation={[Math.PI / 2, 0, 0]} scale={[0.09, 0.6, 0.09]} />
          <mesh material={mat(WOOD_PALE)} position={[0, 0, 0.301]}><circleGeometry args={[0.08, 8]} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ── carried things (Neighbour `carry`) — authored in the right hand's space:
// the hand hangs ~0.13 below the arm bone; tools point forward (+z). ──

function WateringCan() {
  return (
    <group position={[0, -0.16, 0.04]}>
      <mesh material={mat('#5aa9f0')} position={[0, -0.03, 0.05]}><cylinderGeometry args={[0.06, 0.07, 0.13, 10]} /></mesh>
      <mesh material={mat('#5aa9f0')} position={[0, 0.0, 0.15]} rotation={[1.0, 0, 0]}><cylinderGeometry args={[0.012, 0.018, 0.16, 5]} /></mesh>
      <mesh material={mat('#5aa9f0')} position={[0, 0.06, 0.03]}><torusGeometry args={[0.04, 0.01, 4, 8, Math.PI]} /></mesh>
    </group>
  )
}

function Rake({ standing }) {
  // standing = leaning on the rack, head down; carried = held upright in the hand
  return (
    <group position={standing ? [0, 0.5, 0] : [0, -0.14, 0.03]} rotation={standing ? [0, 0, 0] : [0.35, 0, 0]}>
      <mesh geometry={GEO.pole} material={mat(WOOD_PALE)} scale={[1, standing ? 1 : 0.7, 1]} />
      <group position={[0, standing ? -0.5 : 0.35, 0]}>
        <mesh material={mat(METAL)}><boxGeometry args={[0.2, 0.025, 0.03]} /></mesh>
        {[-0.08, -0.03, 0.03, 0.08].map((x) => (
          <mesh key={x} material={mat(METAL)} position={[x, standing ? 0.03 : -0.03, 0]}><boxGeometry args={[0.012, 0.05, 0.012]} /></mesh>
        ))}
      </group>
    </group>
  )
}

function Spade({ standing }) {
  return (
    <group position={standing ? [0, 0.5, 0] : [0, -0.14, 0.03]} rotation={standing ? [0, 0, 0] : [0.35, 0, 0]}>
      <mesh geometry={GEO.pole} material={mat(WOOD_PALE)} scale={[1, standing ? 1 : 0.7, 1]} />
      <mesh material={mat(METAL)} position={[0, standing ? -0.44 : -0.36, 0]}><boxGeometry args={[0.1, 0.14, 0.015]} /></mesh>
    </group>
  )
}

function FlowerBasket() {
  return (
    <group position={[0, -0.18, 0.05]}>
      <mesh material={mat(WOOD_PALE)} position={[0, -0.02, 0]}><cylinderGeometry args={[0.09, 0.07, 0.08, 8]} /></mesh>
      <mesh material={mat(WOOD_DARK)} position={[0, 0.04, 0]}><torusGeometry args={[0.07, 0.008, 4, 10, Math.PI]} /></mesh>
      {[[0.04, 0.03], [-0.04, 0.01], [0, -0.04]].map(([x, z], i) => (
        <mesh key={i} geometry={GEO.bud} material={mat(i % 2 ? CREAM : ROSE)} position={[x, 0.04, z]} scale={0.8} />
      ))}
    </group>
  )
}

// The bow is held up in front of the chest, not in the hand bone: in the
// shooting pose the arm points at the target, so a hand-parented bow lay along
// the arm and hid behind the body. `body` tells Neighbour to mount it on the
// character instead (character space, +z = facing).
function Bow() {
  const { scene } = useGLTF(modelUrl('forest', 'weapon-bow'))
  const bow = useMemo(() => scene.clone(), [scene])
  return <primitive object={bow} position={[0.22, 0.1, 0.1]} rotation={[0, 0, -0.12]} scale={1} />
}
Bow.body = true

export const OUTDOOR_FX = {
  rosebush: RoseBush, shed: Shed, hedge: Hedge, bench: Bench, pond: Pond, rosearch: RoseArch, teatable: TeaTable,
  wheelbarrow: Wheelbarrow, toolrack: ToolRack, sack: Sack, stool: Stool,
  campfire: Campfire, logseat: LogSeat, woodpile: Woodpile,
}

export const CARRY = { can: WateringCan, rake: Rake, spade: Spade, basket: FlowerBasket, bow: Bow }
