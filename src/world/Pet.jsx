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
export default function Pet({ id, targetPosRef, posRef }) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl('pets', id))
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, model)
  const current = useRef(null)

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
    } else {
      play('idle')
    }

    if (posRef) posRef.current.copy(g.position)
  })

  return (
    <group ref={group} position={[1.4, 0, 1.4]}>
      <BlobShadow radius={0.45} />
      <group scale={WORLD.petScale}>
        <primitive object={model} />
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
