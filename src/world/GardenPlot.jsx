import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Prop from './Prop'
import BlobShadow from './BlobShadow'
import { modelUrl } from '../config'

/*
 * GardenPlot.jsx — Ivy's one garden plot in Sunny Town (Grow a Garden, ticket 6).
 *
 * A soil bed with the plant on it at one of four stages:
 *   0 mound → 1 sprout → 2 bud → 3 bloom      (stage null = an empty bed)
 *
 * Kenney where Kenney has it, so it sits with the world: the bed is mini-forest
 * `patch-dirt`, the sprout mini-forest `plant`, the leaves + bloom
 * platformer-kit `plant` / `flowers-tall`. Two pieces Kenney doesn't have are
 * flat-shaded primitives (the Outdoor.jsx way): the soil mound (Kenney's dirt
 * clumps are flat, the same colour as the bed, and vanish on it) and stage 2's
 * three closed buds, coloured like the bloom's petals so bud → bloom reads as
 * the same flower.
 *
 * Static on purpose: the growth pop + harvest tap are ticket 7, and the stage
 * comes from the store in ticket 5. Until then Scene drives it from the
 * dev-only toggle below.
 */

const BUD = new THREE.MeshStandardMaterial({ color: '#e8553f', flatShading: true, roughness: 0.85 })
const STEM = new THREE.MeshStandardMaterial({ color: '#3f9a6e', flatShading: true, roughness: 0.85 })
const SOIL = new THREE.MeshStandardMaterial({ color: '#d4875a', flatShading: true, roughness: 0.95 })
// a low-poly dome: the top half of a coarse sphere, squashed
const MOUND_GEO = new THREE.SphereGeometry(0.3, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2)
const BUD_GEO = new THREE.SphereGeometry(0.055, 6, 5)
const STEM_GEO = new THREE.CylinderGeometry(0.012, 0.012, 1, 5)

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

function Plant({ stage }) {
  switch (stage) {
    case 0: // mound — the seed is in
      return <mesh geometry={MOUND_GEO} material={SOIL} position={[0, 0.05, 0]} scale={[1.15, 0.9, 1.15]} />
    case 1: // sprout — first leaves out of a smaller mound
      return (
        <>
          <mesh geometry={MOUND_GEO} material={SOIL} position={[0, 0.05, 0]} scale={[0.8, 0.4, 0.8]} />
          <Prop pack="forest" name="plant" position={[0, 0.12, 0]} rotation={0.6} scale={1.3} />
        </>
      )
    case 2: // bud — a leafy plant holding three closed buds
      return (
        <group position={[0, 0.08, 0]}>
          <Prop pack="platformer" name="plant" scale={1.9} rotation={0.4} />
          <Buds />
        </group>
      )
    case 3: // bloom
      return (
        <group position={[0, 0.08, 0]}>
          <Prop pack="platformer" name="plant" scale={1.9} rotation={0.4} />
          <Prop pack="platformer" name="flowers-tall" scale={1.7} rotation={-0.3} />
        </group>
      )
    default:
      return null
  }
}

/** The plot. `stage`: 0–3, or null for an empty bed. */
export default function GardenPlot({ position, stage = null }) {
  return (
    <group position={position}>
      <BlobShadow radius={1} />
      {/* the bed: two crossed dirt patches so its edge looks dug, not tiled */}
      <Prop pack="forest" name="patch-dirt" position={[0, 0.02, 0]} scale={1.6} />
      <Prop pack="forest" name="patch-dirt" position={[0, 0.025, 0]} rotation={Math.PI / 4} scale={1.35} />
      <Plant stage={stage} />
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
