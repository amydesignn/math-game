import { open, sleep } from './h.mjs'
const b = await open({ W: 375, H: 812, tag: 'delay' })
const out = {}
try {
  await b.go(); await b.ev('localStorage.clear(), 1')
  await b.send('Network.enable'); await b.send('Network.setCacheDisabled', { cacheDisabled: true })
  b.on('Fetch.requestPaused', (p) => { setTimeout(() => b.send('Fetch.continueRequest', { requestId: p.requestId }), 2500) })
  await b.send('Fetch.enable', { patterns: [{ urlPattern: '*onboarding/step-*' }] })
  await b.send('Page.navigate', { url: 'http://localhost:5180/' })
  for (let k = 0; k < 60; k++) { await sleep(250); if (await b.ev(`!!document.querySelector('.luxiOb-cta')`)) break }
  await b.ev(`(() => { window.__fr = []; const t0 = performance.now(); const f = () => { const box = document.querySelector('.luxiOb-mediaBox'); if (box) { const card = document.querySelector('.luxiOb-card'); const L = [...box.querySelectorAll('.luxiOb-media')].map(l => ({ a: l.dataset.active, op: +getComputedStyle(l).opacity, ok: l.tagName !== 'IMG' || (l.complete && l.naturalWidth > 0), s: (l.getAttribute('src') || 'stage').split('/').pop() })); window.__fr.push({ t: (performance.now() - t0) | 0, page: card.dataset.page, empty: box.dataset.empty, vis: L.filter(l => l.op > 0.05).map(l => l.s + ':' + l.op.toFixed(2) + (l.ok ? '' : ':NOTREADY')) }) } if (performance.now() - t0 < 5000) requestAnimationFrame(f) }; requestAnimationFrame(f); return 1 })()`)
  const nx = JSON.parse(await b.ev(`JSON.stringify((r => [r.x + r.width / 2, r.y + r.height / 2])(document.querySelector('.luxiOb-cta').getBoundingClientRect()))`))
  await b.click(nx[0], nx[1]); await sleep(150); out.s1 = await b.shot('slowimg-step1-early')
  await b.click(nx[0], nx[1]); await sleep(150); out.s2 = await b.shot('slowimg-step2-early')
  await sleep(5000)
  const fr = JSON.parse(await b.ev('JSON.stringify(__fr)'))
  out.timeline = fr.filter((x, i) => i === 0 || JSON.stringify([x.page, x.vis]) !== JSON.stringify([fr[i - 1].page, fr[i - 1].vis])).map(x => `${x.t} ${x.page} [${x.vis}]`)
  out.lilacBg = await b.ev(`getComputedStyle(document.querySelector('.luxiOb-mediaBox')).backgroundImage.slice(0,80) + ' | ' + getComputedStyle(document.querySelector('.luxiOb-mediaBox')).backgroundColor`)
} catch (e) { out.err = String(e) } finally { b.close() }
console.log(JSON.stringify(out, null, 1))
