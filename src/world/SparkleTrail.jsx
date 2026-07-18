import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { SPARKLE } from '../config'

/*
 * SparkleTrail — the 15-minute consumable made real in the 3D world (Oscar's
 * Sparkle Pack, `handoff — sparkle pack.md`). His emitter recipe was authored
 * for a 2D comp; here it's translated to world-space particles so the sparkle
 * rides ON Ivy's character as she walks the world:
 *   · AURA — ~7 tiny stars twinkling around her while active (even idle)
 *   · TRAIL — 3 dust motes per 55ms beat, spawned slightly BEHIND her walk
 *     direction, drifting down + fading over 1.4–2.2s; a bigger GLINT every 4th
 *     beat (every 3rd for the lux metallics)
 *   · BAR — a small "SPARKLE" bar above her head that drains linearly over the
 *     15 minutes, then settles QUIETLY (no countdown, no "expired!" — Design
 *     Principle 4). Colours + cadence come straight from SPARKLE (config).
 *
 * Self-glowing look = additive-blended sprites (a soft dot for dust, a 4-point
 * star for glints). Rainbow cycles hue per particle.
 */

// soft round dot (radial white→transparent) — tinted per particle
function makeDotTexture() {
  const s = 64, cv = document.createElement('canvas')
  cv.width = cv.height = s
  const g = cv.getContext('2d')
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(cv)
  return t
}
// 4-point sparkle star (white core) — tinted per particle
function makeStarTexture() {
  const s = 64, cv = document.createElement('canvas')
  cv.width = cv.height = s
  const g = cv.getContext('2d')
  g.translate(s / 2, s / 2)
  g.fillStyle = '#ffffff'
  g.beginPath()
  const R = s / 2, r = s / 9
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4
    const rad = i % 2 === 0 ? R : r
    const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad
    if (i === 0) g.moveTo(x, y)
    else g.lineTo(x, y)
  }
  g.closePath()
  g.fill()
  return new THREE.CanvasTexture(cv)
}

const tmpColor = new THREE.Color()

export default function SparkleTrail({ sparkle, charPosRef, onExpire }) {
  const dotTex = useMemo(makeDotTexture, [])
  const starTex = useMemo(makeStarTexture, [])
  const conf = SPARKLE.colors[sparkle.colorId] || SPARKLE.colors.pink
  const lux = !!conf.lux

  // trail particle pool (reused, never re-allocated) + their runtime state
  const pool = useMemo(() => {
    return Array.from({ length: SPARKLE.maxParticles }, () => {
      const mat = new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
      const sp = new THREE.Sprite(mat)
      sp.visible = false
      sp.scale.setScalar(0.1)
      return { sp, on: false, life: 0, max: 1, vy: 0, base: 0.1, glint: false }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // persistent aura stars around her torso
  const aura = useMemo(() => {
    return Array.from({ length: SPARKLE.auraStars }, (_, i) => {
      const mat = new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
      // aura wears the sku colour (rainbow cycles hue per star)
      mat.color.copy(conf.cs ? new THREE.Color(conf.cs[i % 3]) : new THREE.Color().setHSL(((i * 47) % 360) / 360, 0.9, 0.65))
      const sp = new THREE.Sprite(mat)
      const size = 0.09 + (i % 3) * 0.045
      sp.scale.setScalar(size)
      // a fixed offset around her body; twinkles in place
      const ang = (i / SPARKLE.auraStars) * Math.PI * 2
      return { sp, size, ox: Math.cos(ang) * 0.42, oy: 0.5 + (i % 4) * 0.28, oz: Math.sin(ang) * 0.42, phase: i * 0.9 }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const barFill = useRef(null)
  const barGroup = useRef(null)
  const prev = useRef(new THREE.Vector3())
  const dir = useRef(new THREE.Vector3(0, 0, 1))
  const acc = useRef(0)
  const beat = useRef(0)
  const expired = useRef(false)
  const hueN = useRef(0)

  const pickColor = () => {
    if (!conf.cs) { hueN.current++; return tmpColor.setHSL(((hueN.current * 47) % 360) / 360, 0.9, 0.65) }
    const hex = conf.cs[Math.floor(Math.random() * conf.cs.length)]
    return tmpColor.set(hex)
  }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05) // clamp so a hidden-tab catch-up frame can't fling everything
    const now = Date.now()
    const remain = sparkle.expiresAt - now
    const active = remain > 0
    const frac = Math.max(0, Math.min(1, remain / SPARKLE.durationMs))

    if (!active && !expired.current) { expired.current = true; if (onExpire) onExpire() }

    // where she is + which way she's walking
    const cur = charPosRef.current
    const moved = cur.distanceToSquared(prev.current)
    if (moved > 1e-5) dir.current.subVectors(cur, prev.current).normalize()
    prev.current.copy(cur)

    // the bar drains + follows above her head; settles quietly on expiry
    if (barGroup.current) barGroup.current.position.set(cur.x, 2.0, cur.z)
    if (barFill.current) barFill.current.style.width = (frac * 100).toFixed(1) + '%'

    // aura — twinkles on her while active, fades out when the sparkle settles
    const t = now / 1000
    for (const a of aura) {
      const tw = 0.55 + 0.45 * Math.sin(t * 2.4 + a.phase)
      a.sp.position.set(cur.x + a.ox, a.oy, cur.z + a.oz)
      a.sp.material.opacity = active ? tw : Math.max(0, a.sp.material.opacity - dt * 1.5)
      a.sp.scale.setScalar(a.size * (0.8 + 0.3 * tw))
    }

    // emit trail while active — 3 dust per beat, a glint every 4th (3rd lux)
    if (active) {
      acc.current += dt * 1000
      while (acc.current >= SPARKLE.beatMs) {
        acc.current -= SPARKLE.beatMs
        beat.current++
        const behindX = -dir.current.x * 0.3, behindZ = -dir.current.z * 0.3
        for (let k = 0; k < SPARKLE.dustPerBeat; k++) spawn(cur, behindX, behindZ, false)
        if (beat.current % (lux ? SPARKLE.glintEvery - 1 : SPARKLE.glintEvery) === 0) spawn(cur, behindX, behindZ, true)
      }
    }

    // advance every live particle: drift down, fade + shrink over its life
    for (const p of pool) {
      if (!p.on) continue
      p.life += dt
      const u = p.life / p.max
      if (u >= 1) { p.on = false; p.sp.visible = false; p.sp.material.opacity = 0; continue }
      p.sp.position.y += p.vy * dt
      const fade = u < 0.7 ? 0.95 - (u / 0.7) * 0.4 : 0.55 * (1 - (u - 0.7) / 0.3)
      p.sp.material.opacity = Math.max(0, fade)
      p.sp.scale.setScalar(p.base * (1 - u * 0.75))
    }
  })

  function spawn(cur, bx, bz, glint) {
    const p = pool.find((q) => !q.on)
    if (!p) return
    p.on = true
    p.glint = glint
    p.life = 0
    p.max = glint ? 1.5 : 1.4 + Math.random() * 0.8
    p.vy = -(0.12 + Math.random() * 0.12) // gentle downward settle
    const base = glint ? (lux ? 0.22 : 0.18) + Math.random() * 0.12 : 0.055 + Math.random() * 0.06
    p.base = base
    p.sp.material.map = glint ? starTex : dotTex
    p.sp.material.color.copy(pickColor())
    p.sp.material.opacity = 0.95
    p.sp.scale.setScalar(base)
    p.sp.position.set(
      cur.x + bx + (Math.random() * 0.34 - 0.17),
      0.3 + Math.random() * 1.15, // spread along body height
      cur.z + bz + (Math.random() * 0.34 - 0.17)
    )
    p.sp.visible = true
  }

  // bar fill: SKU colour (gradient for metallics/rainbow)
  const barBg =
    sparkle.colorId === 'gold' ? 'linear-gradient(90deg,#FFD230,#E17100)'
    : sparkle.colorId === 'silver' ? 'linear-gradient(90deg,#F8FAFC,#90A1B9)'
    : sparkle.colorId === 'rainbow' ? 'linear-gradient(90deg,#FF6467,#FFB900,#00C950,#51A2FF,#C27AFF)'
    : conf.hex

  return (
    <>
      {pool.map((p, i) => <primitive key={'d' + i} object={p.sp} />)}
      {aura.map((a, i) => <primitive key={'a' + i} object={a.sp} />)}
      <group ref={barGroup}>
        <Html center distanceFactor={9} style={{ pointerEvents: 'none', userSelect: 'none' }} zIndexRange={[11, 0]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff',
              textShadow: '0 1px 3px rgba(40,30,70,.6)', fontFamily: 'Inter, system-ui, sans-serif' }}>sparkle</span>
            <div style={{ width: 82, height: 9, borderRadius: 6, background: 'rgba(255,255,255,.45)', overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(40,30,70,.25)' }}>
              <div ref={barFill} style={{ height: '100%', width: '100%', borderRadius: 6, background: barBg }} />
            </div>
          </div>
        </Html>
      </group>
    </>
  )
}
