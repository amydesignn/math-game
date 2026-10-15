import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl, WORLD } from '../config'
import BlobShadow from './BlobShadow'

/**
 * The cube pet. Trails the character: when it drifts further than
 * petFollowDistance it walks/runs to catch up, otherwise it idles. Reads the
 * character's live position from `targetPosRef`.
 */
export default function Pet({ id, start = [0, 0], targetPosRef, posRef, reactUntilRef }) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl('pets', id))
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, model)
  const current = useRef(null)
  // Generated models (Higgsfield → Blender) ship no skeleton or clips, so
  // they get a code bounce instead: hop on the move, breathe at rest.
  const body = useRef()
  const bounce = animations.length === 0

  useEffect(() => {
    play('idle')
    return () => current.current && actions[current.current]?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  function play(name) {
    if (current.current === name || !actions[name]) return
    const next = actions[name]
    const prev = current.current && actions[current.current]
    next.reset().fadeIn(0.2).play()
    if (prev) prev.fadeOut(0.2)
    current.current = name
  }

  useFrame((_, dt) => {
    const g = group.current
    const char = targetPosRef.current
    if (!g || !char) return

    const t = performance.now() / 1000

    // solved a problem → celebrate (cube pets ship a real dance animation)
    if (reactUntilRef && reactUntilRef.current > performance.now()) {
      play(actions['dance'] ? 'dance' : 'gesture-positive')
      if (bounce) hop(t, 7, 0.45, true)
      if (posRef) posRef.current.copy(g.position)
      return
    }

    const dx = char.x - g.position.x
    const dz = char.z - g.position.z
    const dist = Math.hypot(dx, dz)

    if (dist > WORLD.petFollowDistance) {
      const step = Math.min(WORLD.petSpeed * dt, dist - WORLD.petFollowDistance)
      g.position.x += (dx / dist) * step
      g.position.z += (dz / dist) * step
      g.rotation.y = dampAngle(g.rotation.y, Math.atan2(dx, dz), 12, dt)
      // 'run' when far behind, 'walk' when just trailing
      play(dist > WORLD.petFollowDistance * 2 ? 'run' : 'walk')
      if (bounce) hop(t, dist > WORLD.petFollowDistance * 2 ? 14 : 10, 0.18)
    } else {
      play('idle')
      if (bounce) breathe(t)
    }

    if (posRef) posRef.current.copy(g.position)
  })

  function hop(t, speed, height, spin = false) {
    const b = body.current
    const u = Math.abs(Math.sin(t * speed))
    b.position.y = u * height
    b.scale.set(1 + (1 - u) * 0.08, 1 - (1 - u) * 0.1, 1 + (1 - u) * 0.08)
    b.rotation.y = spin ? t * 6 : 0
  }

  function breathe(t) {
    const b = body.current
    const u = Math.sin(t * 2.2) * 0.025
    b.position.y = 0
    b.scale.set(1 - u, 1 + u, 1 - u)
    b.rotation.y = 0
  }

  return (
    <group ref={group} position={[start[0] + 1.4, 0, start[1] + 1.4]}>
      <BlobShadow radius={0.45} />
      <group scale={WORLD.petScale}>
        <group ref={body}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  )
}

function dampAngle(a, b, lambda, dt) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * (1 - Math.exp(-lambda * dt))
}

useGLTF.preload(modelUrl('pets', 'animal-cat'))
