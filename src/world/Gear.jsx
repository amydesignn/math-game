import { Fragment, useMemo } from 'react'
import { createPortal } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'
import { GEAR, GEAR_SOCKETS, gearUrl, gearTexUrl } from '../config'

/**
 * The Sorcerer's wardrobe, worn. `model` is her cloned scene; each slot in
 * `gear` (slot → GEAR id, or null) mounts its piece on the matching socket
 * node (socket_head / socket_hand_R), so it rides every hop, turn and spin.
 * A model without sockets (any Kenney character) simply wears nothing.
 */
export default function Gear({ model, gear }) {
  return Object.entries(GEAR_SOCKETS).map(([slot, socketName]) => {
    const item = gear && GEAR.find((g) => g.id === gear[slot])
    const socket = model.getObjectByName(socketName)
    if (!item || !socket) return null
    return (
      <Fragment key={slot}>
        {createPortal(item.tex ? <Recoloured key={item.id} item={item} /> : <Piece key={item.id} item={item} />, socket)}
      </Fragment>
    )
  })
}

function Piece({ item, map }) {
  const { scene } = useGLTF(gearUrl(item.model))
  const piece = useMemo(() => {
    const c = scene.clone(true)
    if (map) {
      // own material per clone, so recolouring one never touches another
      c.traverse((o) => {
        if (o.isMesh) {
          o.material = o.material.clone()
          o.material.map = map
          o.material.needsUpdate = true
        }
      })
    }
    return c
  }, [scene, map])
  return <primitive object={piece} />
}

function Recoloured({ item }) {
  const map = useTexture(gearTexUrl(item.tex), (t) => {
    t.flipY = false // glTF UV convention
    t.colorSpace = SRGBColorSpace
  })
  return <Piece item={item} map={map} />
}

useGLTF.preload(gearUrl('hat'))
useGLTF.preload(gearUrl('staff'))
