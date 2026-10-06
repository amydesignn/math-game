import { SPOOKY_FX } from './Spooky'
import { MARKET_FX } from './Market'

/*
 * fx.jsx — the ONE dispatcher for procedural decor. A map.decor entry with an
 * `fx` field (instead of a GLB pack+name) renders here: the Halloween kinds
 * (Spooky.jsx) and the market kinds (Market.jsx). Adding a kind = add it to its
 * file's registry and to FX_KINDS' test (season-maps.test.js checks every
 * decor fx is a real kind, so a typo can't silently render nothing).
 */
export const FX = { ...SPOOKY_FX, ...MARKET_FX }

export function FxProp({ fx, position, rotation = 0, scale = 1, ...rest }) {
  const Kind = FX[fx]
  if (!Kind) return null
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <Kind {...rest} />
    </group>
  )
}
