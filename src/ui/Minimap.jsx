import { useEffect, useRef } from 'react'
import { WORLD } from '../config'
import { MAPS } from '../maps'

const SIZE = 104 // css px, drawn 2x for retina

/**
 * Tiny map, top-right. The rounded square IS the playable map (edge = edge of
 * the world), with the scenery as fixed dots and Ivy + her pet as live dots.
 * Reads positions from refs each frame — no React re-renders.
 */
export default function Minimap({ map, charPosRef, petPosRef, sparklesRef, stationRef, placed = [] }) {
  const canvas = useRef()

  useEffect(() => {
    const ctx = canvas.current.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    const iris = css.getPropertyValue('--brand-iris-600').trim() || '#4b54dd'
    const gold = css.getPropertyValue('--star-gold').trim() || '#f5b623'
    const cyan = css.getPropertyValue('--gem-cyan').trim() || '#2ec5c5'
    const B = WORLD.bounds
    const s = (SIZE * 2) / (B * 2) // world units → device px
    const toPx = (v) => (v + B) * s

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, SIZE * 2, SIZE * 2)

      // the map itself — same color as this world's playable ground
      ctx.fillStyle = map.ground
      ctx.beginPath()
      ctx.roundRect(0, 0, SIZE * 2, SIZE * 2, 24)
      ctx.fill()

      // scenery (static)
      ctx.fillStyle = 'rgba(74,61,122,0.35)' // lilac-900 @ 35%
      for (const d of map.decor) {
        ctx.beginPath()
        ctx.arc(toPx(d.position[0]), toPx(d.position[2]), 5, 0, Math.PI * 2)
        ctx.fill()
      }

      // gates — glowing dots in the color of the map they lead to
      for (const g of map.gates) {
        ctx.fillStyle = MAPS[g.to].gateColor
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(toPx(g.position[0]), toPx(g.position[2]), 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      // Ivy's placed decorations (lilac — hers, distinct from grey scenery)
      ctx.fillStyle = '#9b84e0'
      for (const w of placed) {
        ctx.beginPath()
        ctx.arc(toPx(w.x), toPx(w.z), 5, 0, Math.PI * 2)
        ctx.fill()
      }

      // gem sparkles (cyan — "something to find here")
      ctx.fillStyle = cyan
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      for (const sp of sparklesRef?.current || []) {
        ctx.beginPath()
        ctx.arc(toPx(sp.x), toPx(sp.z), 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      // today's station (a bigger ringed dot in the skin's colour — the special
      // thing to find; drawn under the companions so they always read on top)
      const st = stationRef?.current
      if (st) {
        ctx.beginPath()
        ctx.arc(toPx(st.x), toPx(st.z), 8, 0, Math.PI * 2)
        ctx.fillStyle = st.color
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // pet (gold, so it reads as "the companion")
      const p = petPosRef.current
      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.arc(toPx(p.x), toPx(p.z), 7, 0, Math.PI * 2)
      ctx.fill()

      // Ivy (iris, biggest dot, white ring so she pops on any background)
      const c = charPosRef.current
      ctx.fillStyle = iris
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(toPx(c.x), toPx(c.z), 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [map, charPosRef, petPosRef, sparklesRef, stationRef, placed])

  return (
    <canvas
      ref={canvas}
      width={SIZE * 2}
      height={SIZE * 2}
      style={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top))',
        right: 16,
        width: SIZE,
        height: SIZE,
        borderRadius: 14,
        boxShadow: '0 4px 14px rgba(43,32,90,0.16)',
        border: '3px solid #ffffff',
        pointerEvents: 'none',
      }}
    />
  )
}
