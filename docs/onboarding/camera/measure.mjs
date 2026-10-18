// Camera trial measurement: headless Chrome over CDP (Node global WebSocket, no npm).
// usage: node measure.mjs W H TAG [shots]
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
const SHOTS = '/Users/amy/projects/math-game/.claude/worktrees/onboarding-how-to-play-ef9825/docs/onboarding/camera'
const SCR = '/private/tmp/claude-501/-Users-amy-projects-math-game--claude-worktrees-onboarding-how-to-play-ef9825/7dbf7070-b102-4b50-b48f-549ff7921dfe/scratchpad/cam'
mkdirSync(SHOTS, { recursive: true })
const W = +process.argv[2], H = +process.argv[3], TAG = process.argv[4], DO_SHOTS = process.argv[5] === 'shots'
const PORT = 9400 + (W % 97)
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${SCR}/prof-${TAG}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let ws, id = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600)); return r.result?.result?.value }
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${SHOTS}/${name}.png`, Buffer.from(r.result.data, 'base64')); return `docs/onboarding/camera/${name}.png` }

// In-page simulator: same spawn rules as Scene.spawnSparkles + stations.pickSpot, seeded RNG,
// and the game's camera (fov 42, offset * zoom, lookAt spawn + 0.6) projected by hand.
const SIM = `
window.__camSim = async ({ N, zooms, hud }) => {
  const { MAPS, blockers, arrivalPoint } = await import('/src/maps.js')
  const { WORLD, GEMS } = await import('/src/config.js')
  const cv = document.querySelector('canvas').getBoundingClientRect()
  const W = cv.width, H = cv.height
  const mul = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const sparkles = (map, sp, R) => { const pts = [], B = WORLD.bounds - 2.5, blk = blockers(map); let g = 0
    while (pts.length < GEMS.perMap && g++ < 400) { const x = (R() * 2 - 1) * B, z = (R() * 2 - 1) * B
      if (Math.hypot(x - sp[0], z - sp[1]) < 4) continue
      if (map.gates.some((q) => Math.hypot(x - q.position[0], z - q.position[2]) < 4.5)) continue
      if (blk.some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < 1.8 + r)) continue
      if (pts.some((p) => Math.hypot(x - p.x, z - p.z) < 5)) continue
      pts.push({ x, z }) } return pts }
  const station = (map, R) => { const B = WORLD.bounds - 3, blk = blockers(map)
    for (let g = 0; g < 300; g++) { const x = (R() * 2 - 1) * B, z = (R() * 2 - 1) * B
      if (Math.hypot(x, z) < 5) continue
      if (map.gates.some((q) => Math.hypot(x - q.position[0], z - q.position[2]) < 4.5)) continue
      if (blk.some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < 2 + r)) continue
      return { x, z } } return { x: 6, z: -6 } }
  const t = Math.tan((42 / 2) * Math.PI / 180), asp = W / H
  const proj = (sp, zoom, P) => { const [ox, oy, oz] = WORLD.camOffset
    const C = [sp[0] + ox * zoom, oy * zoom, sp[1] + oz * zoom], T = [sp[0], 0.6, sp[1]]
    let f = [T[0] - C[0], T[1] - C[1], T[2] - C[2]]; const fl = Math.hypot(...f); f = f.map((v) => v / fl)
    let r = [f[1] * 0 - f[2] * 1, f[2] * 0 - f[0] * 0, f[0] * 1 - f[1] * 0]; const rl = Math.hypot(...r); r = r.map((v) => v / rl)
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    const d = [P[0] - C[0], P[1] - C[1], P[2] - C[2]]
    const xc = d[0] * r[0] + d[1] * r[1] + d[2] * r[2], yc = d[0] * u[0] + d[1] * u[1] + d[2] * u[2], zc = d[0] * f[0] + d[1] * f[1] + d[2] * f[2]
    if (zc <= 0) return null
    return { x: ((xc / (zc * t * asp)) + 1) / 2 * W, y: (1 - yc / (zc * t)) / 2 * H } }
  const M = 16
  const inView = (p) => p && p.x >= M && p.x <= W - M && p.y >= M && p.y <= H - M
  const clear = (p) => inView(p) && !hud.some(([l, tp, rr, b]) => p.x >= l - 8 && p.x <= rr + 8 && p.y >= tp - 8 && p.y <= b + 8)
  const out = {}
  const maps = Object.entries(MAPS).filter(([, m]) => !m.together)
  for (const zoom of zooms) {
    const acc = { centre: { gem: 0, any: 0, gemClear: 0, n: 0 }, gate: { gem: 0, any: 0, gemClear: 0, n: 0 }, perMap: {} }
    for (const [id, map] of maps) {
      const spawns = [['centre', [0, 0]], ...map.gates.map((g) => ['gate', arrivalPoint(map, g.to)])]
      const pm = { gem: 0, n: 0 }
      for (const [kind, sp] of spawns) for (let s = 1; s <= N; s++) {
        const R = mul(s * 7919 + id.length * 31 + Math.round(sp[0] * 13))
        const gems = sparkles(map, sp, R)
        const hasStation = R() < 0.5 // 2-3 of 5 maps per day = 0.5 on average
        const st = hasStation ? station(map, R) : null
        const g = gems.map((p) => proj(sp, zoom, [p.x, 0.9, p.z]))
        const sg = st ? proj(sp, zoom, [st.x, 1.0, st.z]) : null
        const gemIn = g.some(inView), gemClear = g.some(clear), stIn = inView(sg)
        const a = acc[kind]; a.n++; if (gemIn) a.gem++; if (gemIn || stIn) a.any++; if (gemClear) a.gemClear++
        if (kind === 'centre') { pm.n++; if (gemIn || stIn) pm.gem++ }
      }
      acc.perMap[id] = Math.round(100 * pm.gem / pm.n)
    }
    for (const k of ['centre', 'gate']) { const a = acc[k]; acc[k] = { gem: Math.round(100 * a.gem / a.n), gemOrStation: Math.round(100 * a.any / a.n), gemClearOfHud: Math.round(100 * a.gemClear / a.n), n: a.n } }
    // half-width of view at her feet (world units, side to side)
    const left = (() => { let lo = 0, hi = 30; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const p = proj([0, 0], zoom, [m, 0, 0]); if (p && p.x < W) lo = m; else hi = m } return lo })()
    acc.halfWidthAtFeet = +left.toFixed(1)
    out['z' + zoom] = acc
  }
  // validation: my projection vs the game's own (hintPos) for the Sunny Town bed, if present
  return { W, H, out }
}`

try {
  for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break } } catch {} await sleep(250) }
  await new Promise((r) => (ws.onopen = r))
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } }
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 })
  await send('Page.navigate', { url: 'http://localhost:5180/' }); await sleep(3000)
  await ev(`(() => { localStorage.clear(); return 1 })()`)
  await send('Page.reload'); await sleep(6000)
  // fresh guest: close onboarding, take the Halloween treat, Play Sunny Town (has the garden bed for validation)
  const entered = await ev(`(async () => { const w=(ms)=>new Promise(r=>setTimeout(r,ms)); document.querySelector('[aria-label=Close]')?.click(); await w(800); [...document.querySelectorAll('button')].find(b=>/^Treat$|^Trick$/.test(b.textContent.trim()))?.click(); await w(800); [...document.querySelectorAll('button')].find(b=>/Let.s play|Yum|Got it|Close/.test(b.textContent))?.click(); document.querySelector('[aria-label=Close]')?.click(); await w(800); const b=[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Play').find(b=>/${process.env.MAP || 'Forest Clearing'}/.test(b.parentElement.parentElement.textContent)); b?.click(); return !!b })()`)
  await sleep(5000)
  const log = { W, H, entered }
  // HUD rects as the world sees them
  log.hud = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('[data-hint], button, canvas')].filter(e=>e.getClientRects().length>0).map(e=>{const r=e.getBoundingClientRect();const lab=e.getAttribute('data-hint')==='minimap'?44:0;return [r.left|0,r.top|0,Math.ceil(r.right),Math.ceil(r.bottom)+lab]}).filter(r=>r[2]-r[0]<${W}*0.9))`))
  await ev(SIM)
  log.sim = await ev(`__camSim({ N: 400, zooms: [1, 1.4, 1.8, 2.2], hud: ${JSON.stringify(log.hud)} })`)
  // validation: the real game's own projection of the live sparkles vs the sim's formula, at zoom 1
  log.real = await ev(`JSON.stringify({ dbg: __dbg(), sparkles: (__sparkles||[]).map(s=>[+s.x.toFixed(2),+s.z.toFixed(2)]) })`)
  if (DO_SHOTS) {
    log.shots = {}
    const cx = Math.round(W / 2), cy = Math.round(H * 0.55)
    let cur = 1
    for (const z of [1, 1.4, 1.8]) {
      if (z !== cur) { const total = Math.log(z / cur) / 0.0015; const steps = 6
        for (let i = 0; i < steps; i++) await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: cx, y: cy, deltaX: 0, deltaY: total / steps })
        cur = z }
      await sleep(3500)
      const tag = `${TAG}-z${String(z).replace('.', '')}`
      const hero = await ev(`JSON.stringify(window.__hintAvoid?.()?.[0] || null)`)
      log.shots[tag] = { file: await shot(tag), hero: hero && JSON.parse(hero) }
    }
  }
  console.log(JSON.stringify(log, null, 1))
} finally { try { ws?.close() } catch {} chrome.kill() }
