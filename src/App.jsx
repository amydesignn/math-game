import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './world/Scene'
import { getState } from './store'

export default function App() {
  const [state] = useState(getState)
  const [moved, setMoved] = useState(false)

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onPointerDown={() => setMoved(true)}
    >
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ fov: 42, position: [0, 9, 11], near: 0.1, far: 200 }}
      >
        <color attach="background" args={['#eae6f7']} />
        <Suspense fallback={null}>
          <Scene characterId={state.character} petId={state.pet} />
        </Suspense>
      </Canvas>

      {/* ── HUD ── */}
      <GemCounter count={state.gems} />
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
