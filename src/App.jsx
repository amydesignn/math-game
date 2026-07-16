import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './world/Scene'
import Minimap from './ui/Minimap'
import { getState } from './store'
import { WORLD } from './config'

export default function App() {
  const [state] = useState(getState)
  const [moved, setMoved] = useState(false)

  // Shared refs — written by the scene each frame, read by the minimap +
  // gesture handlers. Refs (not state) so nothing re-renders at 60fps.
  const targetRef = useRef(null)
  const charPosRef = useRef(new THREE.Vector3())
  const petPosRef = useRef(new THREE.Vector3(1.4, 0, 1.4))
  const zoomRef = useRef(1)
  const gestureRef = useRef({ pinching: false })

  // ── Pinch to zoom (iPad) + wheel/trackpad (desktop bonus) ──
  const pointers = useRef(new Map())
  const pinchStart = useRef(null) // { dist, zoom }

  const clampZoom = (z) => Math.min(WORLD.zoomMax, Math.max(WORLD.zoomMin, z))

  function onPointerDown(e) {
    setMoved(true)
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
        <color attach="background" args={['#eae6f7']} />
        <Suspense fallback={null}>
          <Scene
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
      <GemCounter count={state.gems} />
      <Minimap charPosRef={charPosRef} petPosRef={petPosRef} />
      {!moved && <MoveHint />}
    </div>
  )
}

function GemCounter({ count }) {
  return (
    <div
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
      }}
    >
      <Gem />
      {count.toLocaleString()}
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
