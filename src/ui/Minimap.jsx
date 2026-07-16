import { useEffect, useRef } from 'react'
import { WORLD } from '../config'
import { DECOR } from '../world/Prop'

const SIZE = 104 // css px, drawn 2x for retina

/**
 * Tiny map, top-right. The rounded square IS the playable map (edge = edge of
 * the world), with the scenery as fixed dots and Ivy + her pet as live dots.
 * Reads positions from refs each frame — no React re-renders.
 */
export default function Minimap({ charPosRef, petPosRef }) {
  const canvas = useRef()

  useEffect(() => {
    const ctx = canvas.current.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    const iris = css.getPropertyValue('--brand-iris-600').trim() || '#4b54dd'
    const gold = css.getPropertyValue('--star-gold').trim() || '#f5b623'
    const B = WORLD.bounds
    const s = (SIZE * 2) / (B * 2) // world units → device px
    const toPx = (v) => (v + B) * s

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, SIZE * 2, SIZE * 2)

      // the map itself — same green as the world's playable ground
      ctx.fillStyle = '#c7e6b8'
      ctx.beginPath()
      ctx.roundRect(0, 0, SIZE * 2, SIZE * 2, 24)
      ctx.fill()

      // scenery (static)
      ctx.fillStyle = 'rgba(74,61,122,0.35)' // lilac-900 @ 35%
      for (const d of DECOR) {
        ctx.beginPath()
        ctx.arc(toPx(d.position[0]), toPx(d.position[2]), 5, 0, Math.PI * 2)
        ctx.fill()
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
  }, [charPosRef, petPosRef])

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
