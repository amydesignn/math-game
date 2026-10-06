// season.js — which seasonal dressing the world wears today.
//
// Seasons are DATE WINDOWS, not switches someone has to remember to flip: the
// Star Arcade turns spooky on Oct 1 and goes back to its bright self after
// Nov 2, every year, with no deploy. Pure + framework-free so the window is
// unit-tested (season.test.js).
//
// Dev/QA override: `?season=halloween` forces it on, `?season=none` forces it
// off (any URL, prod included — it only changes decoration, never saves).

export const SEASONS = {
  // [month, day] inclusive, months 1-based. Ends Nov 2 so the morning after
  // Halloween (Día de Muertos, candy-sorting day) still has the pumpkins up.
  halloween: { from: [10, 1], to: [11, 2] },
}

/** The season active on `date`, or null. */
export function seasonOn(date) {
  const md = (date.getMonth() + 1) * 100 + date.getDate()
  for (const [id, { from, to }] of Object.entries(SEASONS)) {
    if (md >= from[0] * 100 + from[1] && md <= to[0] * 100 + to[1]) return id
  }
  return null
}

/** Today's season, honouring the ?season= override. */
export function currentSeason(date = new Date()) {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('season') : null
  if (q === 'none') return null
  if (q && SEASONS[q]) return q
  return seasonOn(date)
}
