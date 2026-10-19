// Tiny CDP harness (Node global WebSocket, system Chrome, no npm).
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
export const QA = '/Users/amy/projects/math-game/.claude/worktrees/onboarding-how-to-play-ef9825/docs/onboarding/qa'
mkdirSync(QA, { recursive: true })
const SCR = '/private/tmp/claude-501/-Users-amy-projects-math-game--claude-worktrees-onboarding-how-to-play-ef9825/7dbf7070-b102-4b50-b48f-549ff7921dfe/scratchpad/cam'
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let port = 9500
export async function open({ W, H, tag, rm = false, init = '' }) {
  const P = port++
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', `--remote-debugging-port=${P}`, `--user-data-dir=${SCR}/qprof-${tag}-${Date.now()}`,
    ...(rm ? ['--force-prefers-reduced-motion'] : []),
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', `--window-size=${W},${H}`, 'about:blank',
  ], { stdio: 'ignore' })
  let ws, id = 0
  const pending = new Map()
  const handlers = {}
  for (let i = 0; i < 80; i++) { try { const l = await (await fetch(`http://127.0.0.1:${P}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break } } catch {} await sleep(250) }
  await new Promise((r) => (ws.onopen = r))
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } else if (d.method && handlers[d.method]) handlers[d.method](d.params) }
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) return { __err: JSON.stringify(r.result.exceptionDetails).slice(0, 400) }; return r.result?.result?.value }
  const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${QA}/${name}.png`, Buffer.from(r.result.data, 'base64')); return `qa/${name}.png` }
  const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 }) }
  // click the centre of the first element matching a JS expression returning an element
  const clickEl = async (js) => { const r = await ev(`(() => { const e = (${js}); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2] })()`); if (!r || r.__err) return false; await click(r[0], r[1]); return true }
  const key = async (k) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: k === 'Escape' ? 27 : 0 }) }
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 })
  if (init) await send('Page.addScriptToEvaluateOnNewDocument', { source: init })
  const go = async (url = 'http://localhost:5180/') => { await send('Page.navigate', { url }); await sleep(4500) }
  const fresh = async (url) => { await go(url); await ev('localStorage.clear(), 1'); await go(url) }
  const close = () => { try { ws.close() } catch {} chrome.kill() }
  const on = (m, fn) => (handlers[m] = fn)
  return { on, send, ev, shot, click, clickEl, key, go, fresh, close, W, H }
}
// selectors
export const $ = {
  btn: (re) => `[...document.querySelectorAll('button')].find(b => ${re}.test(b.textContent.trim()) && b.getClientRects().length)`,
  x: `document.querySelector('.luxiOb-close')`,
  next: `[...document.querySelectorAll('.luxiOb-cta')][0]`,
  back: `document.querySelector('.luxiOb-back')`,
}
export const obState = `JSON.stringify((() => { const c = document.querySelector('.luxiOb-card'); if (!c) return null; const r = c.getBoundingClientRect(); const x = document.querySelector('.luxiOb-close')?.getBoundingClientRect(); const cta = document.querySelector('.luxiOb-cta')?.getBoundingClientRect(); return { page: c.dataset.page, entry: c.dataset.entry, title: document.getElementById(c.getAttribute('aria-labelledby'))?.textContent, dots: document.querySelectorAll('.luxiOb-dot').length, back: !!document.querySelector('.luxiOb-back'), cta: document.querySelector('.luxiOb-cta')?.textContent.trim(), card: [r.x|0, r.y|0, Math.ceil(r.right), Math.ceil(r.bottom)], xBtn: x && [x.x|0, x.y|0, Math.ceil(x.right), Math.ceil(x.bottom)], ctaR: cta && [cta.x|0, cta.y|0, Math.ceil(cta.right), Math.ceil(cta.bottom)], text: c.querySelector('.luxiOb-page[data-active=true]')?.innerText, scroll: (s => s && [s.scrollHeight, s.clientHeight])(c.querySelector('.luxiOb-scroll')) } })())`
