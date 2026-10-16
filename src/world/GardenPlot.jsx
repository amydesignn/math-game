import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import Prop from './Prop'
import BlobShadow from './BlobShadow'
import { modelUrl, SEED_KINDS } from '../config'

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
 * Motion (ticket 7) — growth in code, not video. All of it is per-frame
 * three.js in useFrame (the Character/Sparkle idiom), never DOM:
 *   - stage change → every plant pops into its new stage (shrink-in + a small
 *     overshoot), rippling across the bed, with a sparkle burst over it;
 *   - `watering` ticks up → drops fall onto the bed, splash, plants give a
 *     tiny squash (the "the water landed" beat);
 *   - stage 3 is tappable (`canTap` = Scene's pinch/placing guards) → the
 *     flowers lift and pop off in sparkles, then `onHarvest` fires (on a plain
 *     timer, NOT the frame loop — rAF starves in hidden tabs and the harvest
 *     must always land; the award-hardening lesson).
 * prefers-reduced-motion → every change snaps: no pop, no drops, no burst;
 * a harvest tap calls onHarvest at once. Read at trigger time, the house way.
 *
 * Ticket 5: Scene drives `stage` from the store (garden.plot.seed.stage) and
 * App owns the plant / water / harvest actions — this file only draws + moves.
 *
 * Ticket 10 — seed colours: `kind` (garden.plot.seed.kind) picks the bloom's
 * petal colour and the buds' colour from SEED_KINDS. Nothing else about the
 * look changes (Amy locked the art): the petals keep Kenney's own model and
 * texture — their UVs are just pointed at a different swatch of the same
 * platformer colormap (`petalGeometry`), and the buds' colour follows. The
 * starter (red) is the stock model, untouched.
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

// ── motion tuning ─────────────────────────────────────────────────────────
// Rare + celebratory (a stage moves on a handful of times per seed), so it
// gets the delight budget — but kept short and soft: ~0.8s end to end.
export const POP = { from: 0.55, dur: 0.55, colStep: 0.04, rowStep: 0.02 }
export const HARVEST = { dur: 0.6, lift: 0.7 }
const WATER = { fall: 0.38, gap: 0.06, from: 1.7 }
// a watering's new stage pops in as the drops hit (the third drop lands)
const WATER_LAND_MS = Math.round((WATER.fall + 2 * WATER.gap) * 1000)
export const HARVEST_MS = Math.round((HARVEST.dur + spotDelay(COLS - 1, ROWS - 1)) * 1000) + 80

/** Ripple delay for the plant at column c, row r (left → right, back → front). */
export function spotDelay(c, r) {
  return c * POP.colStep + r * POP.rowStep
}

/**
 * The growth pop: a damped spring from `POP.from` to 1 over u = 0..1 —
 * shrink-in, a ~5% overshoot, settle. Never from 0 (nothing grows from
 * nothing on screen). Exactly 1 at u ≥ 1 so the bed rests at its locked art.
 */
export function popScale(u) {
  if (u <= 0) return POP.from
  if (u >= 1) return 1
  return 1 - (1 - POP.from) * Math.exp(-5 * u) * Math.cos(2.2 * Math.PI * u)
}

/** Harvest: a quick swell, then rise + shrink away. Returns [scale, lift]. */
export function harvestPose(u) {
  if (u <= 0) return [1, 0]
  if (u >= 1) return [0.2, HARVEST.lift]
  const swell = u < 0.25 ? 1 + 0.15 * Math.sin((u / 0.25) * Math.PI * 0.5) : 1.15 - 0.95 * ((u - 0.25) / 0.75) ** 2
  const lift = HARVEST.lift * (1 - (1 - u) ** 3) // ease-out
  return [swell, lift]
}

// DEV-only slow motion for feel-checks + frame capture: window.__gardenSlow = 5
// plays everything 5× slower. Always 1 in production.
const slow = () => (import.meta.env.DEV && window.__gardenSlow > 0 ? window.__gardenSlow : 1)

const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ── seed colours (ticket 10) ──────────────────────────────────────────────
// Kenney's colormap is a palette of 32px swatches; flowers-tall's petals sample
// the starter's swatch (`SEED_KINDS.starter.petal`). A kind recolours them by
// moving just those UVs to its own swatch — same column offset, same spot in
// the band — so the petals keep the kit's shading gradient and nothing else on
// the model (stems, leaves, yellow centres) moves.
const kindOf = (kind) => SEED_KINDS[kind] || SEED_KINDS.starter
const swatchU = (col) => (col * 32 + 16) / 512
const STOCK = SEED_KINDS.starter.petal
const recoloured = new WeakMap() // stock geometry → Map(kind → geometry)

/** The flowers' geometry with its petal UVs moved to `kind`'s swatch (cached). */
export function petalGeometry(geo, kind) {
  const { petal } = kindOf(kind)
  if (petal.col === STOCK.col && petal.row === STOCK.row) return geo
  if (!recoloured.has(geo)) recoloured.set(geo, new Map())
  const byKind = recoloured.get(geo)
  if (!byKind.has(kind)) {
    const out = geo.clone()
    const uv = out.attributes.uv.clone()
    const from = swatchU(STOCK.col), to = swatchU(petal.col), dv = (petal.row - STOCK.row) * 0.25
    for (let i = 0; i < uv.count; i++) {
      if (Math.abs(uv.getX(i) - from) < 1e-3) uv.setXY(i, to, uv.getY(i) + dv)
    }
    out.setAttribute('uv', uv)
    byKind.set(kind, out)
  }
  return byKind.get(kind)
}

const budMats = new Map() // kind → the buds' material
function budMaterial(kind) {
  const { bud } = kindOf(kind)
  if (bud === '#e8553f') return BUD
  if (!budMats.has(bud)) budMats.set(bud, new THREE.MeshStandardMaterial({ color: bud, flatShading: true, roughness: 0.85 }))
  return budMats.get(bud)
}

/** Kenney's flowers-tall in `kind`'s colour (the Prop, with recoloured petals). */
function Flowers({ kind, scale }) {
  const { scene } = useGLTF(modelUrl('platformer', 'flowers-tall'))
  const model = useMemo(() => {
    const m = SkeletonUtils.clone(scene)
    m.traverse((o) => {
      if (o.isMesh) o.geometry = petalGeometry(o.geometry, kind)
    })
    return m
  }, [scene, kind])
  return (
    <group scale={scale}>
      <primitive object={model} />
    </group>
  )
}

// three closed buds on short stems, poking up out of the leaves
const BUDS = [[-0.08, 0.04, 0.34], [0.1, -0.05, 0.4], [0.0, 0.1, 0.3]]

function Buds({ kind }) {
  const mat = budMaterial(kind)
  return BUDS.map(([x, z, h], i) => (
    <group key={i} position={[x, 0, z]}>
      <mesh geometry={STEM_GEO} material={STEM} position={[0, h / 2, 0]} scale={[1, h, 1]} />
      <mesh geometry={BUD_GEO} material={mat} position={[0, h, 0]} scale={[1, 1.35, 1]} />
    </group>
  ))
}

/** One plant at `stage` (in `kind`'s colour), sized for a bed spot (~SP wide). */
function Plant({ stage, kind }) {
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
          <Buds kind={kind} />
        </group>
      )
    case 3: // bloom
      return (
        <group scale={0.6}>
          <Prop pack="platformer" name="plant" scale={1.9} />
          <Flowers kind={kind} scale={1.7} />
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

// ── sparkle bursts (shared by pop / water / harvest) ──────────────────────
const SPARK_GEO = new THREE.OctahedronGeometry(0.08)
const SPARK_MAX = 28
const DROP_GEO = new THREE.SphereGeometry(0.06, 6, 5)
const DROP_MAT = new THREE.MeshBasicMaterial({ color: '#7fd3f5', transparent: true, opacity: 0.9 })
const DROPS = [[-0.9, -0.15], [0.3, 0.2], [-0.2, -0.25], [0.95, -0.1], [-0.45, 0.25], [0.65, 0.05]]

/**
 * A pool of SPARK_MAX tiny glints. `fire(n, colours, opts)` flings n of them up
 * out of the bed under gravity; each fades over its life. Own materials per
 * glint (opacity is per-particle), allocated once.
 */
function useSparks() {
  const pool = useRef(null)
  if (!pool.current)
    pool.current = Array.from({ length: SPARK_MAX }, () => ({
      mat: new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0, depthWrite: false }),
      p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, age: 1, mesh: null,
    }))
  const fire = (n, colours, { at = null, up = 2.2, spread = 1 } = {}) => {
    let k = 0
    for (const g of pool.current) {
      if (k >= n) break
      if (g.age < g.life) continue
      const [x, z] = at ?? [(Math.random() - 0.5) * BED.w * 0.9, (Math.random() - 0.5) * BED.d * 0.9]
      g.p.set(x, 0.3, z)
      const a = Math.random() * Math.PI * 2
      g.v.set(Math.cos(a) * spread * (0.3 + Math.random() * 0.7), up * (0.7 + Math.random() * 0.5), Math.sin(a) * spread * (0.3 + Math.random() * 0.7))
      g.mat.color.set(colours[k % colours.length])
      g.life = 0.7 + Math.random() * 0.4
      g.age = 0
      k++
    }
  }
  const step = (dt) => {
    for (const g of pool.current) {
      if (!g.mesh) continue
      if (g.age >= g.life) { g.mesh.visible = false; continue }
      g.age += dt
      g.v.y -= 5 * dt
      g.p.addScaledVector(g.v, dt)
      const f = Math.min(1, g.age / g.life)
      g.mesh.visible = true
      g.mesh.position.copy(g.p)
      g.mesh.rotation.y += dt * 6
      g.mesh.scale.setScalar(1 - f * 0.6)
      g.mat.opacity = 1 - f * f
    }
  }
  const clear = () => pool.current.forEach((g) => { g.age = g.life })
  return { pool: pool.current, fire, step, clear }
}

const POP_SPARKS = ['#fff6c8', '#f5b623', '#ffffff', '#9be8c4']
const WATER_SPARKS = ['#7fd3f5', '#ffffff', '#bdeeff']
const HARVEST_SPARKS = ['#ff8fb1', '#f5b623', '#ffffff', '#e8553f', '#fff6c8']

/**
 * The plot. `stage`: 0–3 (every plant in the bed), or null for an empty bed.
 * `kind`: the seed's SEED_KINDS id — the colour of its buds + bloom.
 * `watering`: a counter — each increment plays the water drops; when a
 * watering and a stage change arrive together (store.waterPlot), the drops
 * land FIRST and the bed pops to its new stage as they hit. The bed is one
 * big tap target: at stage 3 a tap (when `canTap(e)` allows it) harvests —
 * the flowers pop off, then `onHarvest()` is called and the caller empties the
 * bed; at any other stage (empty included) a tap calls `onTap()` instead.
 */
export default function GardenPlot({ position, stage = null, kind = 'starter', watering = 0, canTap, onTap, onHarvest }) {
  const SOIL_Y = 0.08 // soil sits raised, just under the edging's top
  const plants = useRef([]) // inner groups, one per spot — motion writes their transform
  const drops = useRef([])
  const sparks = useSparks()
  const anim = useRef({ pop: -1, water: -1, harvest: -1 }) // start times (s), -1 = idle
  const clock = useRef(0)
  const harvestTimer = useRef(0)
  const swapTimer = useRef(0)
  const [harvesting, setHarvesting] = useState(false)
  // the stage the bed is SHOWING — trails `stage` while a watering's drops fall
  const [shown, setShown] = useState(stage)
  const onHarvestRef = useRef(onHarvest)
  onHarvestRef.current = onHarvest

  // A watering plays the drops; a stage change swaps the bed (after the drops
  // land, if both came together). Neither plays on first mount — she walks up
  // to the bed as it is. Reduced motion: no drops, the swap is immediate.
  const lastStage = useRef(stage)
  const lastWater = useRef(watering)
  useEffect(() => {
    const watered = lastWater.current !== watering
    const grew = lastStage.current !== stage
    lastWater.current = watering
    lastStage.current = stage
    const reduce = reducedMotion()
    if (watered && !reduce) {
      anim.current.water = clock.current
      DROPS.forEach((_, i) => { if (drops.current[i]) drops.current[i].userData.splashed = false })
    }
    if (!grew) return
    clearTimeout(harvestTimer.current)
    clearTimeout(swapTimer.current)
    setHarvesting(false)
    anim.current.harvest = -1
    if (watered && !reduce) swapTimer.current = setTimeout(() => setShown(stage), WATER_LAND_MS * slow())
    else setShown(stage)
  }, [stage, watering])

  // the bed changed what it shows → pop into it (never on mount, never empty)
  const lastShown = useRef(shown)
  useEffect(() => {
    if (lastShown.current === shown) return
    lastShown.current = shown
    if (shown == null || reducedMotion()) { anim.current.pop = -1; return }
    anim.current.pop = clock.current
    sparks.fire(shown === 3 ? 22 : 14, POP_SPARKS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  useEffect(() => () => { clearTimeout(harvestTimer.current); clearTimeout(swapTimer.current) }, [])

  function tapBed(e) {
    if (harvesting) return
    if (canTap && !canTap(e)) return
    e.stopPropagation()
    if (shown !== 3 || stage !== 3) { onTap?.(); return }
    setHarvesting(true)
    if (reducedMotion()) { onHarvestRef.current?.(); return }
    anim.current.harvest = clock.current
    anim.current.pop = -1
    sparks.fire(SPARK_MAX, HARVEST_SPARKS, { up: 2.8, spread: 1.4 })
    harvestTimer.current = setTimeout(() => onHarvestRef.current?.(), HARVEST_MS * slow())
  }

  useFrame((_, frameDt) => {
    const dt = Math.min(frameDt, 0.1) / slow()
    const t = (clock.current += dt)
    const { pop, water, harvest } = anim.current

    // water: drops fall (gravity — ease-in is the physics here), splash on landing
    let squash = 0
    if (water >= 0) {
      let busy = false
      DROPS.forEach(([x, z], i) => {
        const d = drops.current[i]
        if (!d) return
        const u = (t - water - i * WATER.gap) / WATER.fall
        d.visible = u > 0 && u < 1
        if (u < 1) busy = true
        if (u > 0 && u < 1) d.position.set(x, WATER.from - (WATER.from - 0.25) * u * u, z)
        if (u >= 1 && !d.userData.splashed) {
          d.userData.splashed = true
          sparks.fire(4, WATER_SPARKS, { at: [x, z], up: 1.4, spread: 0.8 })
        }
      })
      // a small squash as the water lands, then back
      const v = (t - water - WATER.fall) / 0.45
      if (v > 0 && v < 1) squash = Math.sin(v * Math.PI) * 0.06
      if (!busy && v >= 1) anim.current.water = -1
    }

    plants.current.forEach((g, i) => {
      if (!g) return
      const c = i % COLS, r = Math.floor(i / COLS)
      let s = 1, y = 0, gone = false
      if (harvest >= 0) {
        const u = (t - harvest - spotDelay(c, r)) / HARVEST.dur
        ;[s, y] = harvestPose(u)
        gone = u >= 1 // popped off — hidden until onHarvest empties the bed
      } else if (pop >= 0) {
        s = popScale((t - pop - spotDelay(c, r)) / POP.dur)
      }
      g.visible = !gone
      g.position.y = y
      g.scale.set(s * (1 + squash * 0.5), s * (1 - squash), s * (1 + squash * 0.5))
    })
    if (pop >= 0 && t - pop > POP.dur + spotDelay(COLS - 1, ROWS - 1)) anim.current.pop = -1

    sparks.step(dt)
  })

  const { w, d } = BED
  return (
    <group position={position}>
      <BlobShadow radius={BED.w * 0.62} />
      <Edging />
      {/* the soil: a flat base filling the bed to the edging, and Kenney's dirt
          patch stretched over it for its dug surface (its jagged rim alone
          left sand showing at the corners) */}
      <mesh material={BED_SOIL} position={[0, SOIL_Y / 2, 0]}><boxGeometry args={[BED.w, SOIL_Y, BED.d]} /></mesh>
      <Prop pack="forest" name="patch-dirt" position={[0, SOIL_Y - 0.06, 0]} scale={[BED.w + 0.1, 1, BED.d + 0.1]} />
      {shown != null &&
        SPOTS.map((p, i) => (
          <group key={i} position={[p.x, SOIL_Y + 0.02, p.z]} rotation={[0, p.rot, 0]} scale={p.k}>
            <group ref={(el) => (plants.current[i] = el)}>
              <Plant stage={shown} kind={kind} />
            </group>
          </group>
        ))}
      {/* the whole bed is one tap target: an invisible hitbox (kid fingers).
          Bloom → harvest; anything else → onTap (Scene walks her over). */}
      {!harvesting && (onTap || shown === 3) && (
        <mesh position={[0, 0.4, 0]} onPointerDown={tapBed} visible={false}>
          <boxGeometry args={[w + 0.4, 0.8, d + 0.4]} />
          <meshBasicMaterial />
        </mesh>
      )}
      {DROPS.map((_, i) => (
        <mesh key={i} ref={(el) => (drops.current[i] = el)} geometry={DROP_GEO} material={DROP_MAT} scale={[0.8, 1.4, 0.8]} visible={false} />
      ))}
      {sparks.pool.map((g, i) => (
        <mesh key={i} ref={(el) => (g.mesh = el)} geometry={SPARK_GEO} material={g.mat} visible={false} />
      ))}
    </group>
  )
}

for (const [pack, name] of [['forest', 'patch-dirt'], ['forest', 'plant'], ['platformer', 'plant'], ['platformer', 'flowers-tall']])
  useGLTF.preload(modelUrl(pack, name))
