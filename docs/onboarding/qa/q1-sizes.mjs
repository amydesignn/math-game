import { open, sleep, $, obState } from './h.mjs'
const sizes = [[375, 812, 'p375'], [768, 1024, 'p768'], [1024, 768, 'l1024'], [1280, 800, 'd1280'], [812, 375, 'land812']]
const out = {}
for (const [W, H, tag] of sizes) {
  const b = await open({ W, H, tag })
  const log = (out[tag] = { pages: [] })
  try {
    await b.fresh()
    const all = tag === 'p375' || tag === 'p768' || tag === 'land812'
    for (let n = 0; n < 4; n++) {
      const s = JSON.parse(await b.ev(obState))
      if (all || n === 0 || n === 3) s.shot = await b.shot(`${tag}-first-${n}-${s?.page}`)
      log.pages.push(s)
      if (n < 3) { await b.clickEl($.next); await sleep(500) }
    }
    // Let's play closes
    await b.clickEl($.next); await sleep(600)
    log.closedAfterLetsPlay = (await b.ev(`!document.querySelector('.luxiOb-card')`))
    log.promoOnDoorBeforePlay = await b.ev(`!!document.querySelector('.luxiPromo-card, [class*=luxiPromo]')`)
    log.seen = await b.ev(`JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>/save|state|luxi|math/i.test(k)))||'{}').seenOnboarding`)
    // Settings → How to Play from the Door
    await b.clickEl(`document.querySelector('[aria-label=Settings]')`); await sleep(600)
    await b.clickEl(`[...document.querySelectorAll('[role=dialog][aria-label=Settings] *')].find(e => e.textContent.trim() === 'How to Play')`); await sleep(700)
    const h = JSON.parse(await b.ev(obState)); h.shot = await b.shot(`${tag}-howto-0`)
    log.howto = h
    await b.clickEl($.x); await sleep(500)
    log.howtoClosedByX = await b.ev(`!document.querySelector('.luxiOb-card')`)
  } catch (e) { log.err = String(e) } finally { b.close() }
}
console.log(JSON.stringify(out, null, 1))
