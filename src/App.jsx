import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './world/Scene'
import Minimap from './ui/Minimap'
import { getState, setMap, addGems, setSoundOn } from './store'
import { setupAudio, unlockAudio, setAudioEnabled } from './audio'
import { WORLD, GEMS } from './config'
import { MAPS, arrivalPoint, preloadMap } from './maps'

const FADE_MS = 380 // gate-travel fade half-duration (out, swap, in)
const TEASER = 'More gems coming with math! ✨' // the beta-cap lock message (Finn's brief)

export default function App() {
  const [state] = useState(getState)
  const [moved, setMoved] = useState(false)

  // ── Phase 2: gems + beta cap ──
  const [gems, setGems] = useState(state.gems)
  const [teaser, setTeaser] = useState(false)
  const teaserTimer = useRef()

  function showTeaser() {
    setTeaser(true)
    clearTimeout(teaserTimer.current)
    teaserTimer.current = setTimeout(() => setTeaser(false), 4000)
  }

  function onGem() {
    const total = addGems(1)
    setGems(total)
    if (total >= GEMS.cap) showTeaser()
  }

  // already at the cap when the game opens → say why the sparkles are gone
  useEffect(() => {
    if (getState().gems >= GEMS.cap) {
      const t = setTimeout(showTeaser, 1500)
      return () => clearTimeout(t)
    }
  }, [])

  // ── Phase 2: sound (Ivy's bgm + the cat's meow) ──
  useEffect(() => {
    setupAudio({ petId: state.pet, on: state.soundOn })
  }, [state.pet, state.soundOn])

  // ── Maps: which one we're in, where this visit starts, travel fade + toast ──
  const [mapId, setMapId] = useState(() => (MAPS[state.map] ? state.map : 'clearing'))
  const [spawn, setSpawn] = useState([0, 0])
  const [fading, setFading] = useState(false)
  const [toast, setToast] = useState(null)
  const travelling = useRef(false)
  const toastTimer = useRef()

  function travel(toId) {
    if (travelling.current) return false // caller may retry next frame
    travelling.current = true
    setFading(true) // fade to white…
    setTimeout(() => {
      const from = mapId
      const at = arrivalPoint(MAPS[toId], from)
      // place her (and the trailing pet) just inside the gate she arrives by
      charPosRef.current.set(at[0], 0, at[1])
      petPosRef.current.set(at[0] + 1.4, 0, at[1] + 1.4)
      targetRef.current = null
      setSpawn(at)
      setMapId(toId)
      setMap(toId) // persist — she resumes in the map she left
      setToast(MAPS[toId].name)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 2400)
      setTimeout(() => {
        setFading(false) // …and fade back in on the new map
        travelling.current = false
      }, FADE_MS)
    }, FADE_MS)
    return true
  }

  // Preload: current map's models right away, the other maps once things settle
  // (so walking into a gate never lands on a half-loaded world).
  useEffect(() => {
    preloadMap(MAPS[mapId])
    const idle = setTimeout(() => Object.values(MAPS).forEach(preloadMap), 3500)
    return () => clearTimeout(idle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Shared refs — written by the scene each frame, read by the minimap +
  // gesture handlers. Refs (not state) so nothing re-renders at 60fps.
  const targetRef = useRef(null)
  const charPosRef = useRef(new THREE.Vector3())
  const petPosRef = useRef(new THREE.Vector3(1.4, 0, 1.4))
  const zoomRef = useRef(1)
  const gestureRef = useRef({ pinching: false })
  const sparklesRef = useRef([]) // live sparkles, written by Scene, drawn by Minimap

  // ── Pinch to zoom (iPad) + wheel/trackpad (desktop bonus) ──
  const pointers = useRef(new Map())
  const pinchStart = useRef(null) // { dist, zoom }

  const clampZoom = (z) => Math.min(WORLD.zoomMax, Math.max(WORLD.zoomMin, z))

  function onPointerDown(e) {
    setMoved(true)
    unlockAudio() // browsers only allow sound after a user gesture

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      gestureRef.current.pinching = true
      targetRef.current = null // a pinch is not a walk — stop where she is
      pinchStart.current = { dist: pointerDist(), zoom: zoomRef.current }
    }
  }

  function onPointerMove(e) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (gestureRef.current.pinching && pointers.current.size === 2 && pinchStart.current) {
      const ratio = pinchStart.current.dist / pointerDist() // fingers apart → closer
      zoomRef.current = clampZoom(pinchStart.current.zoom * ratio)
    }
  }

  function onPointerUp(e) {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) {
      pinchStart.current = null
      // let the tap-suppression linger one tick so finger-lift doesn't walk
      setTimeout(() => {
        if (pointers.current.size < 2) gestureRef.current.pinching = false
      }, 80)
    }
  }

  function pointerDist() {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y) || 1
  }

  function onWheel(e) {
    zoomRef.current = clampZoom(zoomRef.current * Math.exp(e.deltaY * 0.0015))
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ fov: 42, position: [0, 9, 11], near: 0.1, far: 200 }}
      >
        <color attach="background" args={[MAPS[mapId].sky]} />
        <Suspense fallback={null}>
          <Scene
            key={mapId} // travel = a fresh scene for the new map
            map={MAPS[mapId]}
            spawn={spawn}
            onTravel={travel}
            onGem={onGem}
            sparklesRef={sparklesRef}
            characterId={state.character}
            petId={state.pet}
            targetRef={targetRef}
            charPosRef={charPosRef}
            petPosRef={petPosRef}
            zoomRef={zoomRef}
            gestureRef={gestureRef}
          />
        </Suspense>
      </Canvas>

      {/* ── HUD ── */}
      <GemCounter count={gems} />
      <SpeakerButton />
      <Minimap map={MAPS[mapId]} charPosRef={charPosRef} petPosRef={petPosRef} sparklesRef={sparklesRef} />
      {!moved && <MoveHint />}
      {toast && <MapToast name={toast} />}
      {teaser && <TeaserToast />}

      {/* gate-travel fade (also swallows taps mid-travel) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
          opacity: fading ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
          pointerEvents: fading ? 'auto' : 'none',
        }}
      />
    </div>
  )
}

function MapToast({ name }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'max(72px, calc(env(safe-area-inset-top) + 56px))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        background: 'rgba(43,32,90,0.82)',
        color: '#fff',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 0.2,
        pointerEvents: 'none',
      }}
    >
      ✨ {name}
    </div>
  )
}

function GemCounter({ count }) {
  return (
    <div
      key={count} // remount on change → the pop animation replays
      style={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top))',
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px 8px 10px',
        background: '#ffffff',
        borderRadius: 999,
        boxShadow: '0 4px 14px rgba(43,32,90,0.16)',
        fontWeight: 700,
        color: 'var(--brand-iris-900)',
        fontSize: 18,
        animation: count > 0 ? 'gempop 0.35s ease' : undefined,
      }}
    >
      <Gem />
      {count.toLocaleString()}
    </div>
  )
}

function SpeakerButton() {
  const [on, setOn] = useState(getState().soundOn)
  return (
    <button
      aria-label={on ? 'Sound on' : 'Sound off'}
      onPointerDown={(e) => e.stopPropagation()} // a speaker tap is not a walk/pinch
      onClick={() => {
        const next = !on
        setOn(next)
        setSoundOn(next) // persist
        setAudioEnabled(next) // apply
      }}
      style={{
        position: 'absolute',
        top: 'max(64px, calc(env(safe-area-inset-top) + 48px))',
        left: 16,
        width: 42,
        height: 42,
        borderRadius: 999,
        border: 'none',
        background: '#ffffff',
        boxShadow: '0 4px 14px rgba(43,32,90,0.16)',
        fontSize: 19,
        cursor: 'pointer',
        opacity: on ? 1 : 0.72,
      }}
    >
      {on ? '🔊' : '🔇'}
    </button>
  )
}

function TeaserToast() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'max(120px, calc(env(safe-area-inset-top) + 104px))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        background: 'var(--star-gold)',
        color: '#4a3305',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 0.2,
        boxShadow: '0 4px 14px rgba(43,32,90,0.22)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {TEASER}
    </div>
  )
}

function Gem() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12l4 6-10 12L2 9z" fill="var(--gem-cyan)" />
      <path d="M6 3h12l4 6H2z" fill="#7fe0e0" />
      <path d="M12 21 2 9h20z" fill="#25a8a8" />
    </svg>
  )
}

function MoveHint() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'max(28px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        background: 'rgba(43,32,90,0.82)',
        color: '#fff',
        borderRadius: 999,
        fontWeight: 600,
        fontSize: 15,
        letterSpacing: 0.2,
        pointerEvents: 'none',
      }}
    >
      Tap anywhere to walk there ✨
    </div>
  )
}
