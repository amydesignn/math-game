import { open, sleep } from './h.mjs'
const out = {}
for (const slow of [false, true]) {
  const b = await open({ W: 375, H: 812, tag: 'fast' + slow })
  try {
    await b.go(); await b.ev('localStorage.clear(), 1')
    await b.send('Network.enable'); await b.send('Network.setCacheDisabled', { cacheDisabled: true })
    if (slow) await b.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 50 * 1024 / 8 * 8, uploadThroughput: 20000 })
    await b.send('Page.navigate', { url: 'http://localhost:5180/' })
    // wait for the card
    for (let k = 0; k < 120; k++) { await sleep(500); if (await b.ev(`!!document.querySelector('.luxiOb-cta')`)) break }
    await b.ev(`(() => { window.__fr = []; const t0 = performance.now(); const f = () => { const box = document.querySelector('.luxiOb-mediaBox'); if (box) { const card = document.querySelector('.luxiOb-card'); const L = [...box.querySelectorAll('.luxiOb-media')].map(l => ({ a: l.dataset.active, op: +getComputedStyle(l).opacity, ok: l.tagName !== 'IMG' || (l.complete && l.naturalWidth > 0), s: (l.getAttribute('src') || 'stage').split('/').pop() })); window.__fr.push({ t: (performance.now() - t0) | 0, page: card.dataset.page, empty: box.dataset.empty, vis: L.filter(l => l.op > 0.05).map(l => l.s + ':' + l.op.toFixed(2) + (l.ok ? '' : ':NOTREADY')), act: L.filter(l => l.a === 'true').map(l => l.s + (l.ok ? '' : ':NOTREADY')) }) } if (performance.now() - t0 < 3000) requestAnimationFrame(f) }; requestAnimationFrame(f); return 1 })()`)
    const nx = JSON.parse(await b.ev(`JSON.stringify((r => [r.x + r.width / 2, r.y + r.height / 2])(document.querySelector('.luxiOb-cta').getBoundingClientRect()))`))
    const shots = []
    for (let k = 0; k < 3; k++) { await b.click(nx[0], nx[1]); shots.push(await b.shot(`fast${slow ? '-slow' : ''}-${k + 1}`)) }
    await sleep(3200)
    const fr = JSON.parse(await b.ev('JSON.stringify(__fr)'))
    out[slow ? 'slow' : 'fast'] = {
      frames: fr.length,
      imgsReadyAtOpen: await b.ev(`[...document.querySelectorAll('img.luxiOb-media')].map(i => i.complete && i.naturalWidth > 0).join(',')`),
      blankNotEmptyPage: fr.filter(x => !x.vis.length && x.empty !== 'true'),
      notReady: fr.filter(x => x.vis.some(v => v.includes('NOTREADY')) || x.act.some(v => v.includes('NOTREADY'))).length,
      timeline: fr.filter((x, i) => i === 0 || JSON.stringify([x.page, x.vis]) !== JSON.stringify([fr[i - 1].page, fr[i - 1].vis])).map(x => `${x.t} ${x.page} [${x.vis}]`),
      shots,
    }
  } catch (e) { out.err = String(e) } finally { b.close() }
}
console.log(JSON.stringify(out, null, 1))
