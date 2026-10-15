import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Prop from './Prop'
import BlobShadow from './BlobShadow'
import { modelUrl } from '../config'

/*
 * GardenPlot.jsx — Ivy's one garden plot in Sunny Town (Grow a Garden, ticket 6).
 *
 * A raised bed that ONE seed fills: rows of the same plant (COLS × ROWS), all
 * growing together through four stages (Amy, 10-15, from a cosy-game ref —
 * a whole bed of one crop reads as "my garden" far better than one plant):
 *   0 mound → 1 sprout → 2 bud → 3 bloom      (stage null = an empty bed)
 *
 * Kenney where Kenney has it, so it sits with the world: the bed is mini-forest
 * `patch-dirt`, the sprout mini-forest `plant`, the leaves + bloom
 * platformer-kit `plant` / `flowers-tall`. Two pieces Kenney doesn't have are
 * flat-shaded primitives (the Outdoor.jsx way): the soil mound (Kenney's dirt
 * clumps are flat, the same colour as the bed, and vanish on it) and stage 2's
 * three closed buds, coloured like the bloom's petals so bud → bloom reads as
 * the same flower. The wooden edging is primitives too (Kenney's fences are
 * full-size), and it hides the stretched dirt patch's jagged rim.
 *
 * Static on purpose: the growth pop + harvest tap are ticket 7, and the stage
 * comes from the store in ticket 5. Until then Scene drives it from the
 * dev-only toggle below.
 */

const BUD = new THREE.MeshStandardMaterial({ color: '#e8553f', flatShading: true, roughness: 0.85 })
const STEM = new THREE.MeshStandardMaterial({ color: '#3f9a6e', flatShading: true, roughness: 0.85 })
const SOIL = new THREE.MeshStandardMaterial({ color: '#d4875a', flatShading: true, roughness: 0.95 })
const WOOD = new THREE.MeshStandardMaterial({ color: '#c98f5a', flatShading: true, roughness: 0.85 }) // Outdoor.jsx's WOOD
const BED_SOIL = new THREE.MeshStandardMaterial({ color: '#b86a42', flatShading: true, roughness: 0.95 })
// a low-poly dome: the top half of a coarse sphere, squashed
const MOUND_GEO = new THREE.SphereGeometry(0.3, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2)
const BUD_GEO = new THREE.SphereGeometry(0.055, 6, 5)
const STEM_GEO = new THREE.CylinderGeometry(0.012, 0.012, 1, 5)

// the bed: COLS × ROWS plants, SP apart; long side along x
const COLS = 6
const ROWS = 3
const SP = 0.46
export const BED = { w: COLS * SP + 0.16, d: ROWS * SP + 0.16 } // inner soil size
const EDGE = { t: 0.1, h: 0.16 } // edging board thickness + height

// a fixed per-plant wobble (turn + size), so the rows look grown, not stamped
const SPOTS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS, r = Math.floor(i / COLS)
  const h = Math.sin(i * 12.9898 + 4.1) * 43758.5453
  const n = h - Math.floor(h) // 0..1
  return { x: (c - (COLS - 1) / 2) * SP, z: (r - (ROWS - 1) / 2) * SP, rot: n * Math.PI * 2, k: 0.9 + n * 0.2 }
})

// three closed buds on short stems, poking up out of the leaves
const BUDS = [[-0.08, 0.04, 0.34], [0.1, -0.05, 0.4], [0.0, 0.1, 0.3]]

function Buds() {
  return BUDS.map(([x, z, h], i) => (
    <group key={i} position={[x, 0, z]}>
      <mesh geometry={STEM_GEO} material={STEM} position={[0, h / 2, 0]} scale={[1, h, 1]} />
      <mesh geometry={BUD_GEO} material={BUD} position={[0, h, 0]} scale={[1, 1.35, 1]} />
    </group>
  ))
}

/** One plant at `stage`, sized for a bed spot (~SP wide). */
function Plant({ stage }) {
  switch (stage) {
    case 0: // mound — the seed is in
      return <mesh geometry={MOUND_GEO} material={SOIL} scale={[0.6, 0.45, 0.6]} />
    case 1: // sprout — first leaves out of a smaller mound
      return (
        <>
          <mesh geometry={MOUND_GEO} material={SOIL} scale={[0.45, 0.25, 0.45]} />
          <Prop pack="forest" name="plant" position={[0, 0.05, 0]} scale={0.85} />
        </>
      )
    case 2: // bud — a leafy plant holding three closed buds
      return (
        <group scale={0.6}>
          <Prop pack="platformer" name="plant" scale={1.9} />
          <Buds />
        </group>
      )
    case 3: // bloom
      return (
        <group scale={0.6}>
          <Prop pack="platformer" name="plant" scale={1.9} />
          <Prop pack="platformer" name="flowers-tall" scale={1.7} />
        </group>
      )
    default:
      return null
  }
}

/** Low wooden edging round the bed. */
function Edging() {
  const { w, d } = BED
  const { t, h } = EDGE
  const W = w + 2 * t
  return (
    <>
      <mesh material={WOOD} position={[0, h / 2, -(d + t) / 2]}><boxGeometry args={[W, h, t]} /></mesh>
      <mesh material={WOOD} position={[0, h / 2, (d + t) / 2]}><boxGeometry args={[W, h, t]} /></mesh>
      <mesh material={WOOD} position={[-(w + t) / 2, h / 2, 0]}><boxGeometry args={[t, h, d]} /></mesh>
      <mesh material={WOOD} position={[(w + t) / 2, h / 2, 0]}><boxGeometry args={[t, h, d]} /></mesh>
    </>
  )
}

/** The plot. `stage`: 0–3 (every plant in the bed), or null for an empty bed. */
export default function GardenPlot({ position, stage = null }) {
  const SOIL_Y = 0.08 // soil sits raised, just under the edging's top
  return (
    <group position={position}>
      <BlobShadow radius={BED.w * 0.62} />
      <Edging />
      {/* the soil: a flat base filling the bed to the edging, and Kenney's dirt
          patch stretched over it for its dug surface (its jagged rim alone
          left sand showing at the corners) */}
      <mesh material={BED_SOIL} position={[0, SOIL_Y / 2, 0]}><boxGeometry args={[BED.w, SOIL_Y, BED.d]} /></mesh>
      <Prop pack="forest" name="patch-dirt" position={[0, SOIL_Y - 0.06, 0]} scale={[BED.w + 0.1, 1, BED.d + 0.1]} />
      {stage != null &&
        SPOTS.map((p, i) => (
          <group key={i} position={[p.x, SOIL_Y + 0.02, p.z]} rotation={[0, p.rot, 0]} scale={p.k}>
            <Plant stage={stage} />
          </group>
        ))}
    </group>
  )
}

for (const [pack, name] of [['forest', 'patch-dirt'], ['forest', 'plant'], ['platformer', 'plant'], ['platformer', 'flowers-tall']])
  useGLTF.preload(modelUrl(pack, name))

/**
 * DEV-only stage toggle until ticket 5 wires the store: `?garden=0..3` (or
 * `?garden=empty`) on the URL, or `window.__garden(n)` / `__garden(null)` from
 * the console. Returns undefined (= no plot rendered) when nothing has been
 * toggled, and always in production builds.
 */
export function useDevGardenStage() {
  const [stage, setStage] = useState(() => {
    if (!import.meta.env.DEV) return undefined
    const q = new URLSearchParams(window.location.search).get('garden')
    if (q == null) return undefined
    return /^[0-3]$/.test(q) ? Number(q) : null
  })
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__garden = (n = null) => setStage(n == null ? null : Math.max(0, Math.min(3, n | 0)))
    return () => delete window.__garden
  }, [])
  return stage
}
