import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl, WORLD } from '../config'
import BlobShadow from './BlobShadow'

/**
 * The player character. Walks toward `targetRef.current` (a Vector3 set by
 * tapping the ground), crossfading between idle and walk. Writes its own
 * position into `posRef` each frame so the pet can follow.
 */
export default function Character({ id, start = [0, 0], targetRef, posRef, reactUntilRef }) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl('characters', id))
  // Clone so animations get their own mixer and swapping characters is clean.
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  // Target the clone directly so the mixer binds to this instance's bones.
  const { actions } = useAnimations(animations, model)
  const current = useRef(null)


  // start idle
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
    if (!g) return

    // solved a problem → a proud yes! (already rigged in the Kenney pack)
    if (reactUntilRef && reactUntilRef.current > performance.now()) {
      play('emote-yes')
      posRef.current.copy(g.position)
      return
    }

    const target = targetRef.current

    if (target) {
      const dx = target.x - g.position.x
      const dz = target.z - g.position.z
      const dist = Math.hypot(dx, dz)

      if (dist > WORLD.arriveThreshold) {
        const step = Math.min(WORLD.characterSpeed * dt, dist)
        g.position.x += (dx / dist) * step
        g.position.z += (dz / dist) * step
        // face the direction of travel (Kenney characters model-forward is +Z)
        const want = Math.atan2(dx, dz)
        g.rotation.y = dampAngle(g.rotation.y, want, 12, dt)
        play('walk')
      } else {
        targetRef.current = null
        play('idle')
      }
    } else {
      play('idle')
    }

    posRef.current.copy(g.position)
  })

  return (
    <group ref={group} position={[start[0], 0, start[1]]}>
      <BlobShadow radius={0.55} />
      <group scale={WORLD.characterScale}>
        <primitive object={model} />
      </group>
    </group>
  )
}

// shortest-path angular damping so the character turns smoothly, no spin
function dampAngle(a, b, lambda, dt) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * (1 - Math.exp(-lambda * dt))
}

// preload the default so the first paint isn't empty
useGLTF.preload(modelUrl('characters', 'character-female-a'))
