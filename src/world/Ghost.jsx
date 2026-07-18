import { useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl } from '../config'

/*
 * The placement ghost — a see-through preview of the asset being placed.
 * Taps move it (App/Scene own the position); a pulsing ring marks its footprint.
 * Materials are cloned per-mesh so the transparency never leaks back into the
 * shared GLB cache (the same model may be solid elsewhere in the scene).
 */
export default function Ghost({ pack, asset, position, rotation = 0, scale = 1 }) {
  const { scene } = useGLTF(modelUrl(pack, asset))
  const ring = useRef()

  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)
    clone.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone()
        o.material.transparent = true
        o.material.opacity = 0.55
        o.material.depthWrite = false
      }
    })
    return clone
  }, [scene])

  useFrame((s) => {
    if (ring.current) {
      const t = s.clock.elapsedTime
      ring.current.material.opacity = 0.45 + Math.sin(t * 4) * 0.25
    }
  })

  return (
    <>
      <group position={[position[0], 0, position[1]]} rotation={[0, rotation, 0]} scale={scale}>
        <primitive object={model} />
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.025, position[1]]}>
        <ringGeometry args={[0.8, 1.0, 40]} />
        <meshBasicMaterial color="#4b54dd" transparent opacity={0.5} />
      </mesh>
    </>
  )
}
