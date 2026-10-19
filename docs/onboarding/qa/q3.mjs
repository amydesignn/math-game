import { open, sleep, $, obState } from './h.mjs'
const out = {}
// 1) 1280: does the card change size between About and step 1?
{
  const b = await open({ W: 1280, H: 800, tag: 'd1280b' })
  try {
    await b.fresh(); await sleep(2500)
    const r = async () => JSON.parse(await b.ev(`JSON.stringify((() => { const c = document.querySelector('.luxiOb-card'); const r = c.getBoundingClientRect(); return { page: c.dataset.page, r: [r.x, r.y, r.width, r.height].map(Math.round), tf: getComputedStyle(c).transform, anim: document.getAnimations().filter(a => a.effect?.target === c).map(a => a.animationName + ':' + a.playState), parentW: c.parentElement.getBoundingClientRect().width } })())`))
    out.d1280 = [await r()]
    await b.clickEl($.next); await sleep(1200); out.d1280.push(await r())
    await b.clickEl($.back); await sleep(1200); out.d1280.push(await r())
  } finally { b.close() }
}
// 2) 812x375 landscape: How to Play from Settings
{
  const b = await open({ W: 812, H: 375, tag: 'land2' })
  try {
    await b.fresh(); await b.clickEl($.x); await sleep(800)
    await b.clickEl(`document.querySelector('[aria-label=Settings]')`); await sleep(800)
    out.landSettings = await b.ev(`JSON.stringify((() => { const d = document.querySelector('[role=dialog][aria-label=Settings]'); if (!d) return 'no sheet'; const row = [...d.querySelectorAll('*')].find(e => e.textContent.trim() === 'How to Play'); const r = row?.getBoundingClientRect(); return { sheet: (x => [x.top|0, x.bottom|0])(d.getBoundingClientRect()), row: r && [r.top|0, r.bottom|0], vh: innerHeight } })())`)
    out.landSettingsShot = await b.shot('land812-settings-sheet')
    await b.ev(`[...document.querySelectorAll('[role=dialog][aria-label=Settings] *')].find(e => e.textContent.trim() === 'How to Play')?.scrollIntoView(), 1`); await sleep(400)
    await b.clickEl(`[...document.querySelectorAll('[role=dialog][aria-label=Settings] *')].find(e => e.textContent.trim() === 'How to Play')`); await sleep(900)
    out.landHowto = JSON.parse(await b.ev(obState) || 'null')
    out.landHowtoShot = await b.shot('land812-howto-0')
  } finally { b.close() }
}
// 3) reduced motion: what animates?
{
  const b = await open({ W: 768, H: 1024, tag: 'rm', rm: true })
  try {
    await b.fresh(); await sleep(400)
    out.rm = { matches: await b.ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`) }
    out.rm.animsOpen = JSON.parse(await b.ev(`JSON.stringify(document.getAnimations().filter(a => String(a.effect?.target?.className || '').includes('luxiOb')).map(a => (a.animationName || a.transitionProperty) + ' ' + String(a.effect.target.className).split(' ')[0]))`))
    out.rm.gemTf = await b.ev(`getComputedStyle(document.querySelector('.luxiOb-gemFloat')).animationName + ' / ' + getComputedStyle(document.querySelector('.luxiOb-card')).animationName`)
    out.rm.shot = await b.shot('rm-about')
    await b.clickEl($.next); await sleep(60)
    out.rm.animsNext = JSON.parse(await b.ev(`JSON.stringify(document.getAnimations().filter(a => String(a.effect?.target?.className || '').includes('luxiOb')).map(a => (a.animationName || a.transitionProperty) + ' ' + String(a.effect.target.className).split(' ')[0]))`))
    out.rm.mediaTransition = await b.ev(`getComputedStyle(document.querySelector('.luxiOb-media')).transition`)
    await sleep(800)
    for (let k = 0; k < 2; k++) { await b.clickEl($.next); await sleep(400) }
    await b.clickEl($.next); await sleep(60)
    out.rm.exitAnims = JSON.parse(await b.ev(`JSON.stringify(document.getAnimations().filter(a => String(a.effect?.target?.className || '').includes('luxiOb')).map(a => (a.animationName || a.transitionProperty) + ' ' + String(a.effect.target.className).split(' ')[0] + ' ' + getComputedStyle(a.effect.target).transform))`))
    await sleep(600)
    out.rm.closed = await b.ev(`!document.querySelector('.luxiOb-card')`)
  } finally { b.close() }
}
console.log(JSON.stringify(out, null, 1))
