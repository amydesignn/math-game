import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { modelUrl, WORLD } from '../config'
import BlobShadow from './BlobShadow'
import Pet from './Pet'

/*
 * Neighbour — a friendly face who lives in a map (Sunny Town first; Ivy asked
 * "why is there no one here?"). Same Kenney mini characters as the player, with
 * their own cube pet trailing them (the real <Pet>, following the neighbour's
 * live position instead of hers).
 *
 * Life loop: idle at home → now and then stroll a few steps around home → idle.
 * When she walks within GREET_R they stop, turn to face her, cheer
 * (`emote-yes`) and say a line in a speech bubble. Lines step through the
 * neighbour's list, so coming back gets something new; the greeting re-arms
 * only once she's walked away (LEAVE_R), so standing next to them isn't spammy.
 *
 * Copy is PUBLIC-SAFE (guests play this): no player names, no family names.
 * Neighbours never touch the store — they're scenery with a heartbeat.
 */

const GREET_R = 3
const LEAVE_R = 5
const SPEED = 1.3 // an amble — slower than her 3.2 walk
const BUBBLE_MS = 3600

export default function Neighbour({ character, pet, home, lines, stroll = 2.2, charPosRef }) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl('characters', character))
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, model)
  const current = useRef(null)
  const posRef = useRef(new THREE.Vector3(home[0], 0, home[1]))
  const startYaw = useMemo(() => Math.random() * Math.PI * 2, []) // stable across bubble re-renders

  const target = useRef(null) // stroll destination, or null while idling
  const restUntil = useRef(performance.now() + 1500 + Math.random() * 4000)
  const greeted = useRef(false)
  const cheerUntil = useRef(0)
  const lineIx = useRef(0)
  const [say, setSay] = useState(null)
  const hideTimer = useRef()

  useEffect(() => {
    play('idle')
    return () => {
      clearTimeout(hideTimer.current)
      if (current.current) actions[current.current]?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  function play(name) {
    if (current.current === name || !actions[name]) return
    const next = actions[name]
    const prev = current.current && actions[current.current]
    next.reset().fadeIn(0.25).play()
    if (prev) prev.fadeOut(0.25)
    current.current = name
  }

  function greet() {
    setSay(lines[lineIx.current % lines.length])
    lineIx.current++
    cheerUntil.current = performance.now() + 1700
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setSay(null), BUBBLE_MS)
  }

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const now = performance.now()
    const p = charPosRef?.current
    const dist = p ? Math.hypot(p.x - g.position.x, p.z - g.position.z) : Infinity

    if (dist > LEAVE_R) greeted.current = false

    if (dist < GREET_R) {
      // she's here: stop, look at her, say hello once per visit
      target.current = null
      restUntil.current = now + 2500
      g.rotation.y = dampAngle(g.rotation.y, Math.atan2(p.x - g.position.x, p.z - g.position.z), 6, dt)
      if (!greeted.current) {
        greeted.current = true
        greet()
      }
      play(now < cheerUntil.current ? 'emote-yes' : 'idle')
    } else if (target.current) {
      const dx = target.current[0] - g.position.x
      const dz = target.current[1] - g.position.z
      const d = Math.hypot(dx, dz)
      if (d > 0.1) {
        const step = Math.min(SPEED * dt, d)
        g.position.x += (dx / d) * step
        g.position.z += (dz / d) * step
        g.rotation.y = dampAngle(g.rotation.y, Math.atan2(dx, dz), 8, dt)
        play('walk')
      } else {
        target.current = null
        restUntil.current = now + 3500 + Math.random() * 6000
        play('idle')
      }
    } else {
      play(now < cheerUntil.current ? 'emote-yes' : 'idle')
      if (now > restUntil.current) {
        // amble somewhere near home (clamped inside the map, never wandering off)
        const a = Math.random() * Math.PI * 2
        const r = stroll * (0.4 + Math.random() * 0.6)
        const B = WORLD.bounds - 1.5
        target.current = [clamp(home[0] + Math.cos(a) * r, B), clamp(home[1] + Math.sin(a) * r, B)]
      }
    }

    posRef.current.copy(g.position)
  })

  return (
    <>
      <group ref={group} position={[home[0], 0, home[1]]} rotation={[0, startYaw, 0]}>
        <BlobShadow radius={0.55} />
        <group scale={WORLD.characterScale}>
          <primitive object={model} />
        </group>
        {say && (
          <Html center position={[0, 2.1, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }} zIndexRange={[0, 0]}>
            {/* No distanceFactor (the Station nameplate rule): one legible size at every zoom.
                Under the HUD (zIndex 0). 4px grid: pad 8/16, radius 16, tail 8. */}
            <div className="nbBubble" style={{
              position: 'relative', background: '#fff', color: '#2a2140',
              fontWeight: 700, fontSize: 'var(--text-base, 16px)', lineHeight: 1.25,
              padding: '8px 16px', borderRadius: 16, whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(40,30,70,.22)', animation: 'nbPop .28s cubic-bezier(.2,1.4,.4,1) both',
            }}>
              {say}
              <span style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #fff' }} />
            </div>
          </Html>
        )}
      </group>
      {pet && <Pet id={pet} start={[home[0] - 1.4, home[1] - 1.4]} targetPosRef={posRef} />}
    </>
  )
}

const clamp = (v, B) => Math.max(-B, Math.min(B, v))

function dampAngle(a, b, lambda, dt) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * (1 - Math.exp(-lambda * dt))
}
