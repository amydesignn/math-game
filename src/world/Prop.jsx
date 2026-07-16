import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl } from '../config'

/**
 * A static scenery prop from any pack (forest tree, building wall, …).
 * Cloned so the same GLB can repeat. Scenery lists live in src/maps.js.
 */
export default function Prop({ pack = 'forest', name, position, rotation = 0, scale = 1 }) {
  const { scene } = useGLTF(modelUrl(pack, name))
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <primitive object={model} />
    </group>
  )
}
