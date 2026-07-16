import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { modelUrl } from '../config'

/** A static forest prop (tree, rock, tent…). Cloned so the same GLB can repeat. */
export default function Prop({ name, position, rotation = 0, scale = 1 }) {
  const { scene } = useGLTF(modelUrl('forest', name))
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene])
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

// Stage A scenery — a clearing around the spawn point (centre kept clear).
export const DECOR = [
  { name: 'tree-high', position: [-6, 0, -5], rotation: 0.4 },
  { name: 'tree', position: [7, 0, -4.5], rotation: -0.8 },
  { name: 'tree-high', position: [10, 0, 3], rotation: 1.2 },
  { name: 'tree', position: [-9, 0, 4], rotation: 2.1 },
  { name: 'tree', position: [4, 0, 9], rotation: 0.3 },
  { name: 'rocks-high', position: [5.5, 0, 5.5], rotation: 0.6 },
  { name: 'rocks-low', position: [-5, 0, 7], rotation: -0.4 },
  { name: 'stones', position: [-3.5, 0, 5.5], rotation: 0 },
  { name: 'plant', position: [3, 0, -5.5], rotation: 0 },
  { name: 'plant', position: [-4.5, 0, -3.5], rotation: 1 },
  { name: 'flag', position: [8.5, 0, -8], rotation: 0 },
  { name: 'tent', position: [-9, 0, -8], rotation: 0.5 },
]

DECOR.forEach((d) => useGLTF.preload(modelUrl('forest', d.name)))
