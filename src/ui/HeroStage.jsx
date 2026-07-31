/*
 * HeroStage.jsx — the Door's identity render: the default character + her cat,
 * alive (idle animation + the cat's gentle bob), on a transparent stage so the
 * card's lavender gradient shows through.
 *
 * ONE build for everyone (Amy, 2026-07-31): this is always character-female-a +
 * animal-cat — the game's default avatar — not a per-account render. When a real
 * avatar picker lands, this reads the chosen ids; until then it's the one face of
 * Lumio Math. Models + animations are the SAME assets the world uses (already
 * preloaded there), so it paints instantly and can never drift from in-game.
 */
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl, WORLD } from '../config'
import BlobShadow from '../world/BlobShadow'

/** One clone of a Kenney GLB, playing an animation, grounded with a blob shadow.
 *  `bob` adds a gentle vertical hop (the cube pet's liveliness, standing still). */
function Avatar({ pack, id, anim = 'idle', position, rotationY = 0, scale, shadow = 0.5, bob = 0 }) {
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
      camera={{ fov: 30, position: [0.55, 1.35, 3.85], near: 0.1, far: 50 }}
      onCreated={({ camera }) => camera.lookAt(0.05, 0.62, 0)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* the world's exact lighting rig, so the hero matches in-game */}
      <hemisphereLight args={['#fff6e8', '#b9b0d6', 1.0]} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />
      <Suspense fallback={null}>
        <Turntable>
          <Avatar pack="characters" id="character-female-a" position={[-0.22, 0, 0.25]} rotationY={0.3} scale={WORLD.characterScale} shadow={0.55} />
          <Avatar pack="pets" id="animal-cat" position={[0.78, 0, -0.35]} rotationY={-0.5} scale={WORLD.petScale} shadow={0.42} bob={0.05} />
        </Turntable>
      </Suspense>
    </Canvas>
  )
}
