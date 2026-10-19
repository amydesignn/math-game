import { open, sleep, $, obState } from './h.mjs'
const SOUND = `(() => { window.__snd = { osc: 0, buf: 0, media: 0, ctx: 0 };
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) { const o = AC.prototype.createOscillator, b = AC.prototype.createBufferSource;
    AC.prototype.createOscillator = function () { window.__snd.osc++; return o.apply(this, arguments) };
    AC.prototype.createBufferSource = function () { window.__snd.buf++; return b.apply(this, arguments) } }
  const p = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__snd.media++; window.__snd.last = this.currentSrc || this.src; return p.apply(this, arguments) } })()`
const out = {}
const b = await open({ W: 768, H: 1024, tag: 'beh', init: SOUND })
const st = async () => JSON.parse(await b.ev(obState))
const snd = async () => JSON.parse(await b.ev('JSON.stringify(window.__snd)'))
try {
  // ── 1280 card-size jump: About vs step 1, measured after animations settle
  await b.fresh('http://localhost:5180/?season=halloween')
  await sleep(1500)
  out.anims = await b.ev(`JSON.stringify(document.getAnimations().map(a => [a.animationName || a.transitionProperty, a.playState, a.effect?.target?.className?.baseVal ?? a.effect?.target?.className]))`)
  // ── first run: scrim tap does nothing, Escape does nothing
  const s0 = await st()
  await b.click(8, 8); await sleep(500) // top-left scrim corner
  await b.click(b.W - 8, b.H - 8); await sleep(500)
  await b.key('Escape'); await sleep(500)
  out.firstScrimEsc = { before: s0?.page, after: (await st())?.page, sound: await snd() }
  // ── fast Next ×3 with a frame sampler: is the active layer ever not ready / is the box ever blank?
  await b.ev(`(() => { window.__fr = []; const t0 = performance.now(); const f = () => { const box = document.querySelector('.luxiOb-mediaBox'); const card = document.querySelector('.luxiOb-card'); if (!box) return; const layers = [...box.querySelectorAll('.luxiOb-media')].map(l => ({ a: l.dataset.active, p: l.dataset.prev, op: +getComputedStyle(l).opacity, ok: l.tagName !== 'IMG' || (l.complete && l.naturalWidth > 0), src: (l.getAttribute('src') || 'stage').split('/').pop() })); window.__fr.push({ t: (performance.now() - t0) | 0, page: card?.dataset.page, empty: box.dataset.empty, vis: layers.filter(l => l.op > 0.05).map(l => l.src + ':' + l.op.toFixed(2) + (l.ok ? '' : '!NOTREADY')), active: layers.filter(l => l.a === 'true').map(l => l.src + (l.ok ? '' : '!NOTREADY')) }); if (performance.now() - t0 < 2500) requestAnimationFrame(f) }; requestAnimationFrame(f); return 1 })()`)
  const nx = JSON.parse(await b.ev(`JSON.stringify((r => [r.x + r.width / 2, r.y + r.height / 2])(document.querySelector('.luxiOb-cta').getBoundingClientRect()))`))
  for (let k = 0; k < 3; k++) { await b.click(nx[0], nx[1]); await sleep(60) }
  out.fastShot = await b.shot('fast-next-x3-end')
  await sleep(2600)
  const fr = JSON.parse(await b.ev('JSON.stringify(window.__fr)'))
  out.fast = { frames: fr.length, pages: [...new Set(fr.map(x => x.page))], blankFrames: fr.filter(x => x.vis.length === 0 && x.empty !== 'true').length, notReady: fr.filter(x => x.vis.some(v => v.includes('NOTREADY'))).length, staleFrames: fr.filter(x => x.vis.some(v => !x.active.some(a => v.startsWith(a))) && x.vis.length && x.active.length).length, staleSample: fr.filter(x => x.active.length).filter(x => x.vis.some(v => !x.active.some(a => v.startsWith(a)))).slice(0, 4), lastPage: fr.at(-1) }
  out.afterFast = await st()
  // ── reload mid-first-run: never re-shows
  await b.go('http://localhost:5180/?season=halloween'); await sleep(1500)
  out.reloadShowsCard = !!(await st())
  out.reloadPromoOnDoor = await b.ev(`!!document.querySelector('[class*=luxiPromo]')`)
  out.doorShot = await b.shot('reload-door-no-promo')
  // ── enter a world (Forest Clearing), how to play in-world, no walk-through
  await b.clickEl(`[...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Play').find(b => /Forest Clearing/.test(b.parentElement.parentElement.textContent))`)
  await sleep(5000)
  out.sndInWorldBeforeTap = await snd()
  await b.click(b.W / 2, b.H * 0.75); await sleep(2500) // a real world tap: unlocks audio, walks her
  out.sndAfterWorldTap = await snd()
  await b.clickEl(`document.querySelector('[data-hint=settings-button]')`); await sleep(700)
  await b.clickEl(`[...document.querySelectorAll('[role=dialog][aria-label=Settings] *')].find(e => e.textContent.trim() === 'How to Play')`); await sleep(900)
  const pos0 = await b.ev('JSON.stringify(__dbg())')
  const sndHowto0 = await snd()
  out.inWorldHowto = await st()
  out.inWorldShot = await b.shot('inworld-howto')
  // tap through: Next, Next, Back, then scrim tap far from the card (over the canvas) → closes
  for (let k = 0; k < 2; k++) { await b.clickEl($.next); await sleep(400) }
  await b.clickEl($.back); await sleep(400)
  await b.click(30, b.H - 120); await sleep(900)
  out.inWorldScrimClosed = !(await st())
  out.inWorldPos = { before: JSON.parse(pos0), after: JSON.parse(await b.ev('JSON.stringify(__dbg())')) }
  out.sndHowto = { before: sndHowto0, after: await snd() }
  // howto Escape closes
  await b.clickEl(`document.querySelector('[data-hint=settings-button]')`); await sleep(700)
  await b.clickEl(`[...document.querySelectorAll('[role=dialog][aria-label=Settings] *')].find(e => e.textContent.trim() === 'How to Play')`); await sleep(900)
  await b.key('Escape'); await sleep(700)
  out.howtoEscCloses = !(await st())
  // ── first sparkle problem: walk to the nearest sparkle
  out.stations = await b.ev(`JSON.stringify(Object.entries(__stations()).map(([m, s]) => [m, s.problems.map(p => p.type + ' ' + p.a + p.op + p.b)]))`)
  const sp = JSON.parse(await b.ev(`JSON.stringify((() => { const c = __dbg().char; return __sparkles.filter(s => !s.collected).sort((a, b) => Math.hypot(a.x - c[0], a.z - c[2]) - Math.hypot(b.x - c[0], b.z - c[2]))[0] })())`))
  await b.ev(`(__walk(${sp.x}, ${sp.z}), 1)`)
  for (let k = 0; k < 20; k++) { await sleep(1500); await b.shot('_pump'); if (await b.ev(`/[×÷+−]/.test(document.body.innerText) && /\\d+\\s*[×÷+]\\s*\\d+/.test(document.body.innerText)`)) break }
  out.firstSparkle = await b.ev(`(document.body.innerText.match(/\\d+\\s*[×÷+]\\s*\\d+/) || [''])[0]`)
  out.firstSparkleShot = await b.shot('first-sparkle')
  // ── Exit → Door: Halloween should show now
  await b.ev(`(() => { [...document.querySelectorAll('[aria-label=Close], button')].find(b => b.getAttribute('aria-label') === 'Close' && b.getClientRects().length)?.click(); return 1 })()`); await sleep(800)
  await b.clickEl(`[...document.querySelectorAll('button')].find(b => /Exit/.test(b.textContent) && b.getClientRects().length)`); await sleep(3000)
  out.promoAfterExit = await b.ev(`!!document.querySelector('[class*=luxiPromo]')`)
  out.promoText = await b.ev(`document.querySelector('[class*=luxiPromo]')?.closest('[role=dialog]')?.innerText || document.querySelector('[class*=luxiPromo]')?.parentElement?.innerText`)
  out.promoShot = await b.shot('halloween-after-first-exit')
  out.sndEnd = await snd()
} catch (e) { out.err = String(e.stack || e) } finally { b.close() }
console.log(JSON.stringify(out, null, 1))
