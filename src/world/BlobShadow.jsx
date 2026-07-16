import { useMemo } from 'react'
import * as THREE from 'three'

// One soft radial-gradient texture, shared by every blob shadow.
let shared = null
function shadowTexture() {
  if (shared) return shared
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(40,30,70,0.55)')
  g.addColorStop(0.7, 'rgba(40,30,70,0.22)')
  g.addColorStop(1, 'rgba(40,30,70,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  shared = new THREE.CanvasTexture(c)
  return shared
}

/** A soft drop-shadow disc that sits under a moving character/pet. */
export default function BlobShadow({ radius = 0.6 }) {
  const tex = useMemo(shadowTexture, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}
