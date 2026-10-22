/*
 * HeroStage.jsx — the Door's identity render: the default character + her cat,
 * alive (idle animation + the cat's gentle bob), on a transparent stage so the
 * card's lavender gradient shows through.
 *
 * ONE build for everyone (Amy, 2026-07-31): the character is the player's —
 * Sunny by default (2026-10-19), or whoever she picked — the Sorcerer wears whatever she has on (wardrobe). The companion is HERS: the cat
 * until she buys another in the Gem Shop (2026-10-14). Models + animations are the SAME assets the world uses (already
 * preloaded there), so it paints instantly and can never drift from in-game.
 */
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl, WORLD } from '../config'
import BlobShadow from '../world/BlobShadow'
import Gear from '../world/Gear'
import { getState } from '../store'

/** One clone of a Kenney GLB, playing an animation, grounded with a blob shadow.
 *  `bob` adds a gentle vertical hop (the cube pet's liveliness, standing still). */
function Avatar({ pack, id, anim = 'idle', position, rotationY = 0, scale, shadow = 0.5, bob = 0, gear }) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl(pack, id))
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, model)

  useEffect(() => {
    const a = actions[anim] || actions.idle || Object.values(actions)[0]
    a?.reset().fadeIn(0.3).play()
    return () => a?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  useFrame((state) => {
    if (bob && group.current) {
      group.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 2.2)) * bob
    }
  })

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      <BlobShadow radius={shadow} />
      <group scale={scale}>
        <primitive object={model} />
        <Gear model={model} gear={gear} />
      </group>
    </group>
  )
}

/** A slow ±sway so the 3D form reads without a distracting full spin. */
function Turntable({ children, amp = 0.16, speed = 0.5 }) {
  const g = useRef()
  useFrame((state) => {
    if (g.current) g.current.rotation.y = Math.sin(state.clock.elapsedTime * speed) * amp
  })
  return <group ref={g}>{children}</group>
}

export default function HeroStage() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: 30, position: [0.55, 1.4, 4.0], near: 0.1, far: 50 }}
      onCreated={({ camera }) => camera.lookAt(0.05, 0.68, 0)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* the world's exact lighting rig, so the hero matches in-game. These are 3D scene
          colours — parked out of the governance pass with src/world/* (Amy 2026-10-21). */}
      <hemisphereLight args={['#fff6e8', '#b9b0d6', 1.0]} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />
      <Suspense fallback={null}>
        <Turntable>
          <Avatar pack="characters" id={getState().character} gear={getState().gear} position={[-0.22, 0, 0.25]} rotationY={0.3} scale={WORLD.characterScale} shadow={0.55} />
          <Avatar pack="pets" id={getState().pet} position={[0.78, 0, -0.35]} rotationY={-0.5} scale={WORLD.petScale} shadow={0.42} bob={0.05} />
        </Turntable>
      </Suspense>
    </Canvas>
  )
}
