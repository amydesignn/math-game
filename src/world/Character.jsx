import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl, WORLD, PLAYER } from '../config'
import BlobShadow from './BlobShadow'
import Gear from './Gear'

/**
 * The player character. Walks toward `targetRef.current` (a Vector3 set by
 * tapping the ground), crossfading between idle and walk. Writes its own
 * position into `posRef` each frame so the pet can follow.
 * `gear` (slot → GEAR id) dresses a model that carries sockets (the Sorcerer).
 */
export default function Character({ id, start = [0, 0], targetRef, posRef, reactUntilRef, gear }) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl('characters', id))
  // Clone so animations get their own mixer and swapping characters is clean.
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  // Target the clone directly so the mixer binds to this instance's bones.
  const { actions } = useAnimations(animations, model)
  const current = useRef(null)
  // A generated model (the Sorcerer) ships no skeleton or clips — she gets
  // the code bounce generated pets use: hop on the move, breathe at rest,
  // a spin-hop on a solve.
  const body = useRef()
  const bounce = animations.length === 0

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
      if (bounce) hop(body.current, performance.now() / 1000, 7, 0.4, true)
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
        if (bounce) hop(body.current, performance.now() / 1000, 9, 0.12)
      } else {
        targetRef.current = null
        play('idle')
        if (bounce) breathe(body.current, performance.now() / 1000)
      }
    } else {
      play('idle')
      if (bounce) breathe(body.current, performance.now() / 1000)
    }

    posRef.current.copy(g.position)
  })

  return (
    <group ref={group} position={[start[0], 0, start[1]]}>
      <BlobShadow radius={0.55} />
      <group scale={WORLD.characterScale}>
        <group ref={body}>
          <primitive object={model} />
          <Gear model={model} gear={gear} />
        </group>
      </group>
    </group>
  )
}

// The code bounce for clip-less models (same feel as Pet.jsx's).
function hop(b, t, speed, height, spin = false) {
  if (!b) return
  const u = Math.abs(Math.sin(t * speed))
  b.position.y = u * height
  b.scale.set(1 + (1 - u) * 0.05, 1 - (1 - u) * 0.06, 1 + (1 - u) * 0.05)
  b.rotation.y = spin ? t * 6 : 0
}

function breathe(b, t) {
  if (!b) return
  const u = Math.sin(t * 2) * 0.015
  b.position.y = 0
  b.scale.set(1 - u, 1 + u, 1 - u)
  b.rotation.y = 0
}

// shortest-path angular damping so the character turns smoothly, no spin
function dampAngle(a, b, lambda, dt) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * (1 - Math.exp(-lambda * dt))
}

// preload the default so the first paint isn't empty
useGLTF.preload(modelUrl('characters', PLAYER))
