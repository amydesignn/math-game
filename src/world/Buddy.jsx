import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { modelUrl, WORLD, SPARKLE, CHARACTERS, PETS } from '../config'
import BlobShadow from './BlobShadow'
import { dampAngle } from '../walk'
import SparkleTrail from './SparkleTrail'

/*
 * Buddy — the OTHER player in the Together Space (Phase B,
 * docs/together-space.md): their character walking their replicated taps,
 * their pet trailing them with the same local follow logic as ours (the pet
 * is never synced — it follows its owner, wherever its owner is), a soft
 * name tag (the one word in the world — two players may have picked the
 * same character), an emote bubble, and their sparkle trail if one is
 * running (cosmetics exist to be shown to Mum).
 *
 * Movement comes from `sim` (together.js): App feeds it network messages;
 * this component just steps it each frame and renders where it says.
 * Invariant 1 applies here too — nothing in this file writes game state.
 */
const EMOTE_MS = 2600 // bubble + emote-yes hold, then back to idle/walk

export default function Buddy({ profile, sim, emote }) {
  const charGroup = useRef()
  const petGroup = useRef()
  const charPosRef = useRef(new THREE.Vector3()) // feeds the sparkle trail
  const prev = useRef({ x: 0, z: 0 }) // last frame's spot → heading

  // The profile is a network payload (the other device may run an older
  // cached build). An unknown model id would throw inside useGLTF and take
  // the WHOLE canvas down to <Oops> — so unknown ids degrade to the defaults
  // instead of trusting the wire (adversarial-verify catch).
  const charId = CHARACTERS.includes(profile.character) ? profile.character : CHARACTERS[0]
  const petId = PETS.includes(profile.pet) ? profile.pet : 'animal-cat'

  const { scene: charScene, animations: charAnims } = useGLTF(modelUrl('characters', charId))
  const charModel = useMemo(() => SkeletonUtils.clone(charScene), [charScene])
  const { actions: charActions } = useAnimations(charAnims, charModel)
  const charCurrent = useRef(null)

  const { scene: petScene, animations: petAnims } = useGLTF(modelUrl('pets', petId))
  const petModel = useMemo(() => SkeletonUtils.clone(petScene), [petScene])
  const { actions: petActions } = useAnimations(petAnims, petModel)
  const petCurrent = useRef(null)

  function play(actions, current, name) {
    if (current.current === name || !actions[name]) return
    const next = actions[name]
    const prevAction = current.current && actions[current.current]
    next.reset().fadeIn(0.2).play()
    if (prevAction) prevAction.fadeOut(0.2)
    current.current = name
  }

  useEffect(() => {
    play(charActions, charCurrent, 'idle')
    play(petActions, petCurrent, 'idle')
    return () => {
      if (charCurrent.current) charActions[charCurrent.current]?.stop()
      if (petCurrent.current) petActions[petCurrent.current]?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charActions, petActions])

  const emoteFresh = emote && performance.now() - emote.at < EMOTE_MS

  useFrame((_, dt) => {
    const g = charGroup.current
    const p = petGroup.current
    if (!g || !p || !sim) return

    // ── the character: step the replicated walk ──
    const moving = sim.step(dt)
    g.position.set(sim.pos.x, 0, sim.pos.z)
    const dx = sim.pos.x - prev.current.x
    const dz = sim.pos.z - prev.current.z
    if (moving && (dx || dz)) {
      g.rotation.y = dampAngle(g.rotation.y, Math.atan2(dx, dz), 12, dt)
    }
    prev.current = { x: sim.pos.x, z: sim.pos.z }
    charPosRef.current.copy(g.position)

    if (emote && performance.now() - emote.at < EMOTE_MS) {
      play(charActions, charCurrent, 'emote-yes')
    } else {
      play(charActions, charCurrent, moving ? 'walk' : 'idle')
    }

    // ── the pet: identical follow logic to Pet.jsx, just local vectors ──
    const pdx = sim.pos.x - p.position.x
    const pdz = sim.pos.z - p.position.z
    const dist = Math.hypot(pdx, pdz)
    if (dist > WORLD.petFollowDistance) {
      const step = Math.min(WORLD.petSpeed * dt, dist - WORLD.petFollowDistance)
      p.position.x += (pdx / dist) * step
      p.position.z += (pdz / dist) * step
      p.rotation.y = dampAngle(p.rotation.y, Math.atan2(pdx, pdz), 12, dt)
      play(petActions, petCurrent, dist > WORLD.petFollowDistance * 2 ? 'run' : 'walk')
    } else if (emoteFresh) {
      play(petActions, petCurrent, petActions['dance'] ? 'dance' : 'gesture-positive')
    } else {
      play(petActions, petCurrent, 'idle')
    }
  })

  // Their sparkle, if one is running. expiresAt here is COSMETIC — a fresh
  // full window per meadow visit (their store owns real expiry; we never see
  // it, and per Invariant 1 the onExpire is a no-op, never a store write).
  const buddySparkle = useMemo(
    () =>
      profile.sparkle && SPARKLE.colors[profile.sparkle] // unknown colour off the wire → no trail, no crash
        ? { colorId: profile.sparkle, expiresAt: Date.now() + SPARKLE.durationMs }
        : null,
    [profile.sparkle],
  )

  return (
    <>
      <group ref={charGroup}>
        <BlobShadow radius={0.55} />
        <group scale={WORLD.characterScale}>
          <primitive object={charModel} />
        </group>
        {/* the name tag — soft, small, the only word in the world */}
        <Html position={[0, 2.15, 0]} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.88)',
              color: 'var(--brand-iris-900, #2b205a)',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 13,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(43,32,90,0.18)',
              fontFamily: 'inherit',
            }}
          >
            {profile.label} 💜
          </div>
        </Html>
        {/* emote bubble */}
        {emoteFresh && (
          <Html position={[0, 2.75, 0]} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
            <div
              style={{
                fontSize: 30,
                animation: 'gempop 0.35s ease',
                filter: 'drop-shadow(0 2px 6px rgba(43,32,90,0.25))',
              }}
            >
              {emote.emoji}
            </div>
          </Html>
        )}
      </group>
      <group ref={petGroup} position={[1.4, 0, 1.4]}>
        <BlobShadow radius={0.45} />
        <group scale={WORLD.petScale}>
          <primitive object={petModel} />
        </group>
      </group>
      {buddySparkle && (
        <SparkleTrail key={buddySparkle.colorId} sparkle={buddySparkle} charPosRef={charPosRef} onExpire={() => {}} />
      )}
    </>
  )
}
