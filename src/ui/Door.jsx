/*
 * Door.jsx — the hub a player lands on before a world (Luxi Math).
 * Lifted 1:1 from Oscar's `math-door-flow.html` (delivery — math door, 2026-07-31),
 * drawn to Nathan's door-data-contract. Left = who they are + how far they've
 * climbed; right = Choose your world.
 *
 * THE ONE RULE: the Door is a READOUT of store.js, never a scoreboard it invents.
 * Level + points come from lifetimeGems via levelState/fmtPoints — the SAME
 * functions the in-game level bar uses (levels.js), so a player never sees two
 * numbers for one play. One origin.
 *
 * States this release (Amy's scope, 2026-07-31): NEW + GUEST are public; ACCOUNT
 * is Amy/Ivy only (?account) and rolls out to new users later. The Meadow card
 * stays a visible "Coming soon" — the hook that sells accounts when they launch.
 *
 * Image-slot placeholders in the comp are replaced here with honest content:
 *   · world thumbs → each world's real signpost colour (maps.js gateColor), the
 *     same colour language the in-world gates use — identity, not invented art.
 *   · hero stage  → a branded placeholder; the real 3D character thumb lands later.
 *   · profile     → the settings-lives-here-later affordance (soft avatar chip).
 */

import { useRef, useState } from 'react'
import { levelState, fmtPoints } from '../levels'
import { LVL } from './mathkit'
import HeroStage from './HeroStage'
import { GemIcon, ProfileChip } from './hudkit'
import Footer from './Footer'
import { MAPS } from '../maps'

/* level math is imported from levels.js — the comp inlined a verbatim copy of it;
   in-app we read the real source so the two can never drift. */

/* house tokens — Oscar's Door palette (consistent with the iris/lilac system).
   Celebration colours stay honest: cyan = gems · violet = levels & actions ·
   amber = station/quests. BODY = the one shared body size (Datum text-sm, 14).
   GOVERNED 2026-10-22 (S5): every colour is a Datum semantic token or a Luxi-own
   --luxi-color-component-door-* token (index.css, luxi govern S5 block — values
   unchanged); spacing on the 4px grid; type on --text-*; weights 400/500/700. */
const BODY = 'var(--text-sm)'
const T = {
  textPrimary: 'var(--color-text-primary)', textSecondary: 'var(--color-text-secondary)', // Datum text tiers by name
  surface: 'var(--color-background-base)', // was #FFFFFF
  amberSoft: 'var(--luxi-color-component-door-quest-background)', amberLine: 'var(--luxi-color-component-door-quest-border)', amberInk: 'var(--luxi-color-component-door-quest-eyebrow-text)',
  pink: 'var(--luxi-color-component-door-button-together-background)', pinkDark: 'var(--luxi-color-component-door-button-together-shadow)',
}
/* Primary actions wear Brand Iris (Luxi's button3d-primary tokens: 500 face / 700 shadow, 4.56:1 white bold). The LEVEL bar reads mathkit LVL (Iris). */
const V = {
  btn: 'var(--luxi-color-component-button3d-primary-background)', btnDark: 'var(--luxi-color-component-button3d-primary-shadow)', btnText: 'var(--luxi-color-component-button3d-primary-text)',
}

/* The five REAL worlds. ids ARE the contract (they match maps.js exactly, so
   onPlay(id) → travel(id) needs no translation). Blurbs are vibe only — worlds
   are skins, same maths everywhere. `art` = a real in-game capture (Amy, from the
   built maps); `tint` = the world's in-world gate colour (read from maps.js, so
   the card and the gate can't drift), shown while the art loads and as the honest fallback. Art resolves against BASE_URL (Vercel '/',
   Pages '/math-game/'). */
const ART = import.meta.env.BASE_URL + 'worlds/'
const BASE_WORLDS = [
  { id: 'clearing', name: 'Forest Clearing', blurb: 'Where every journey begins', tint: MAPS.clearing.gateColor, art: ART + 'clearing.jpg' },
  { id: 'town', name: 'Sunny Town', blurb: 'Warm streets, friendly faces', tint: MAPS.town.gateColor, art: ART + 'town.jpg' },
  { id: 'garden', name: 'Rosy Garden', blurb: 'Petal paths and quiet corners', tint: MAPS.garden.gateColor, art: ART + 'garden.jpg' },
  { id: 'market', name: 'Merry Market', blurb: 'Stalls, treats, and trinkets', tint: MAPS.market.gateColor, art: ART + 'market.jpg' },
  { id: 'arcade', name: 'Star Arcade', blurb: 'Bright lights, big scores', tint: MAPS.arcade.gateColor, art: ART + 'arcade.jpg' },
]
// A seasonal map (maps.js `card`) re-dresses its Door card too — name, blurb,
// and its own capture when one exists — so the hub and the world agree.
const WORLDS = BASE_WORLDS.map((w) => {
  const c = MAPS[w.id]?.card
  return c ? { ...w, ...c, art: c.art ? ART + c.art : w.art } : w
})
const MEADOW = { id: 'meadow', name: 'The Meadow', blurb: 'Play together', tint: MAPS.meadow.gateColor }

/* ── What's new — THE place the Door announces game news (Amy 2026-10-06):
   new maps, seasonal events, updates. Newest first; one entry = one slide.
   `world` makes the slide a door into that world AND puts the same New badge on its
   world card below, so the carousel and the grid can never disagree.
   One freshness word only — 'New' ('Just in' retired, Amy 2026-10-07) — and it
   expires (addedAt, below). Remove an entry to retire its slide. */
const UPDATES = [
  { world: 'arcade', title: 'Spooky Arcade for Halloween', addedAt: '2026-10-06' },
  { world: 'town', title: 'Sunny Town', addedAt: '2026-10-06' },
  { world: 'market', title: 'Merry Market', addedAt: '2026-10-06' },
  { world: 'clearing', title: 'Forest Clearing', addedAt: '2026-10-05' },
]
/* New is earned and ends (Datum Badge contract): an entry shows the New badge — on its
   slide AND its world card — for NEW_FOR_DAYS after addedAt, then drops on its own. */
const NEW_FOR_DAYS = 14
const isFresh = (u, now = Date.now()) => now - new Date(u.addedAt + 'T00:00:00').getTime() < NEW_FOR_DAYS * 864e5
const WORLD_NEW = Object.fromEntries(UPDATES.filter((u) => u.world && isFresh(u)).map((u) => [u.world, true]))

/* ── icons (crafted, not emoji) ── */
/* GemIcon + ProfileChip now live in hudkit.jsx (shared with the in-world HUD). */
function Trophy({ size = 22 }) {
  return (
    // drawing: path coordinates are artwork; fills are the trophy-* tokens (same values).
    // The handles' 1.5 stroke is in viewBox units (24 → 22–24px), artwork too.
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 4h11v3.5a5.5 5.5 0 0 1-11 0V4Z" style={{ fill: 'var(--luxi-color-component-door-trophy-cup)' }} />
      <path d="M6.5 5.2H4v1.4A3.4 3.4 0 0 0 7.4 10" style={{ stroke: 'var(--luxi-color-component-door-trophy-handle)' }} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M17.5 5.2H20v1.4A3.4 3.4 0 0 1 16.6 10" style={{ stroke: 'var(--luxi-color-component-door-trophy-handle)' }} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M9.6 16h4.8l-.5-3h-3.8z" style={{ fill: 'var(--luxi-color-component-door-trophy-handle)' }} />
      <rect x="7.4" y="18.4" width="9.2" height="2.4" rx="1.2" style={{ fill: 'var(--luxi-color-component-door-trophy-base)' }} />
    </svg>
  )
}
/* Rocket — the friendly "coming soon" mark. Positive framing, not a padlock (Amy). */
function Rocket({ size = 22, color = 'var(--luxi-color-component-door-soon-icon)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ fill: color }} aria-hidden="true">
      <path d="M12 2.8c3 2.2 4.5 5.2 4.5 8.9 0 1.2-.2 2.3-.5 3.3H8c-.3-1-.5-2.1-.5-3.3 0-3.7 1.5-6.7 4.5-8.9Z" />
      <circle cx="12" cy="9.4" r="1.8" style={{ fill: 'var(--luxi-color-component-door-soon-icon-window)' }} />
      <path d="M7.6 13.4 5.4 15c-.5.4-.8 1-.8 1.7v1.8l2.9-1.2z" />
      <path d="M16.4 13.4 18.6 15c.5.4.8 1 .8 1.7v1.8l-2.9-1.2z" />
      <path d="M10.5 16h3l-.4 2.3a1.1 1.1 0 0 1-2.2 0z" style={{ fill: 'var(--luxi-color-component-door-soon-icon-window)' }} opacity="0.7" />
    </svg>
  )
}
function Saved({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--color-icon-success)' }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21a9 9 0 1 0-9-9" />
      <path d="m8.5 12 2.5 2.5 5-5" />
    </svg>
  )
}
function Play({ size = 16, color = V.btnText }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ fill: color }} aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
  )
}

/* chunky 3D button — the game's button language. Violet by default.
   S5: the house 4px press (rest 0 4px 0 → down translateY(4) + no shadow, like
   .luxiOb-cta), 100ms on --ease-out, radius 12 (was 14 · 5px/3px press · 80ms). */
function ChunkyButton({ color = V.btn, dark = V.btnDark, onClick, children, style }) {
  const base = {
    position: 'relative', width: '100%', border: 'none', borderRadius: 12, background: color, color: V.btnText,
    fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 0 ' + dark, transition: 'transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }
  const down = (e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0 0 ' + dark }
  const up = (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 ' + dark }
  return (
    <button className="doorBtn" style={{ ...base, ...style }} onClick={onClick} onPointerDown={down} onPointerUp={up} onPointerLeave={up}>
      {children}
    </button>
  )
}

/* ── hero: character stage + level readout + saved line ── */
const heroS = {
  card: { background: T.surface, borderRadius: 24, boxShadow: 'var(--luxi-shadow-door-card)', padding: 16, animation: 'doorPop 300ms var(--ease-out) both' }, // 26→24: 4px-grid align to the new Settings sheet (Amy 2026-08-30)
  stage: { position: 'relative', width: '100%', height: 196, borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(120% 100% at 50% 18%, var(--luxi-color-component-door-hero-stage-center) 0%, var(--luxi-color-component-door-hero-stage-mid) 62%, var(--luxi-color-component-door-hero-stage-edge) 100%)' },
  lvlRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 16 }, // 18 → 16
  lvlNum: { fontSize: 'var(--text-xl)', fontWeight: 500, color: T.textPrimary, letterSpacing: '-.01em' },
  pts: { fontSize: BODY, fontWeight: 400, color: T.textSecondary },
  gems: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: BODY, fontWeight: 700, color: T.textPrimary },
  // the level bar reads the SHARED level identity (mathkit LVL, Iris since 2026-10-06) — the
  // Door's own Lilac copy is what left it lilac when the HUD pill went Iris
  track: { position: 'relative', height: 12, borderRadius: 999, background: LVL.soft, overflow: 'hidden', marginTop: 8, border: '1px solid ' + LVL.softLine },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, background: LVL.grad },
  toNextRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  toNext: { fontSize: BODY, fontWeight: 400, color: T.textSecondary },
  newLine: { fontSize: BODY, fontWeight: 400, color: T.textSecondary, marginTop: 16, lineHeight: 1.5 },
  saved: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: BODY, fontWeight: 400, color: T.textSecondary }, // 12.5 → 14 supporting (Amy: Door = 14 + 12 only); check = Datum icon-success
}
function Hero({ mode, points, gems }) {
  const stats = mode !== 'new'
  const st = stats ? levelState(points) : null
  return (
    <div style={heroS.card}>
      <div style={heroS.stage}>
        {/* the default character + her cat, alive (idle + the cat's bob) */}
        <HeroStage />
      </div>
      {stats ? (
        <>
          <div style={heroS.lvlRow}>
            <span style={heroS.lvlNum}>Level {st.level}</span>
            <span style={heroS.gems}><GemIcon size={18} />{gems}</span>
          </div>
          <div style={heroS.track}><span style={{ ...heroS.fill, width: Math.min(100, Math.round((st.into / st.need) * 100)) + '%' }}></span></div>
          <div style={heroS.toNextRow}>
            <span style={heroS.toNext}>{st.need - st.into} points to Level {st.level + 1}</span>
            <span style={heroS.pts}>{fmtPoints(points)} points</span>
          </div>
          <div style={heroS.saved}><Saved /> {mode === 'account' ? 'Saved to your account' : 'Saved on this device'}</div>
        </>
      ) : (
        <div style={heroS.newLine}>Pick a world and start playing — no setup, jump right in. 🌟</div>
      )}
    </div>
  )
}

/* ── today's quest — ONE line, crafted trophy. Real station-plan data (or hidden). ── */
const questS = {
  // S5: gap 13 → 12 · stroke 1.5 → stroke-1_6 · radius 18 → 16 · padding 15 → 16 · the 50ms stagger dropped (off the ladder, not seen)
  card: { display: 'flex', alignItems: 'center', gap: 12, background: T.amberSoft, border: 'var(--border-stroke-1_6) solid ' + T.amberLine, borderRadius: 16, padding: '12px 16px', marginTop: 16, animation: 'doorPop 300ms var(--ease-out) both' },
  badge: { width: 40, height: 40, flex: 'none', borderRadius: 12, background: 'var(--luxi-color-component-door-quest-chip-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mid: { minWidth: 0, flex: 1 },
  labelRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 2, whiteSpace: 'nowrap' }, // rowGap 2 = the documented 2px exception: a wrapped eyebrow line hugs its first line. Eyebrow line can outrun the column; phone column ~196 → 'refreshes' drops to its own line whole, never mid-phrase
  label: { fontSize: 'var(--text-xs)', fontWeight: 500, color: T.amberInk, letterSpacing: '.02em' }, // 11.5 → 12, Title Case (Amy: Door = 14 + 12 only, no caps)
  refresh: { fontSize: 'var(--text-xs)', fontWeight: 500, color: T.amberInk, letterSpacing: '.02em' }, // 10.5 → 12, same eyebrow as the label (was #B4832E 3.17 ✗ → amberInk 5.95 on amberSoft)
  text: { fontSize: BODY, fontWeight: 400, color: 'var(--luxi-color-component-door-quest-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  reward: { flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: T.amberInk, fontSize: BODY, background: 'var(--luxi-color-component-door-quest-chip-background)', padding: '4px 12px', borderRadius: 9999 }, // was gap 3 · 5/10/5/9
}
function QuestCard({ quest }) {
  if (!quest) return null // no live station today → no dead strip (honest readout)
  return (
    <div style={questS.card}>
      <span style={questS.badge}><Trophy size={24} /></span>
      <div style={questS.mid}>
        <div style={questS.labelRow}>
          <span style={questS.label}>Today’s Quest</span>
          <span style={questS.refresh}>· Refreshes in {quest.hrs}h</span>
        </div>
        <div style={questS.text}>Visit {quest.worldName} to earn gems</div>
      </div>
      <span style={questS.reward}>+{quest.gems}<GemIcon size={16} /></span>
    </div>
  )
}

/* ── badge + status indicator — Datum styling-v0.21. Two components, two jobs:
   Badge 'new' = a fact about the CONTENT (the Beta amber, 6.84:1, top-right).
   Status indicator = a live state about HER ("Last played", 10.37:1, top-left):
   a green dot that breathes (motion-pulse). Colours = Luxi's own door-badge / door-status
   tokens (same values as Datum's, 10-21: no Datum component tokens on Luxi elements). ── */
const pill = { display: 'inline-flex', alignItems: 'center', gap: 4, height: 20, padding: '0 8px', borderRadius: 9999, borderWidth: 1, borderStyle: 'solid', fontSize: 'var(--text-xs)', lineHeight: 'var(--text-xs--line-height)', fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap' }
const badgeS = {
  new: { background: 'var(--luxi-color-component-door-badge-new-background)', borderColor: 'var(--luxi-color-component-door-badge-new-border)', color: 'var(--luxi-color-component-door-badge-new-text)' },
}
function Badge({ variant, children, style }) {
  return <span style={{ ...pill, ...badgeS[variant], ...style }}>{children}</span>
}
const indicatorS = {
  live: { background: 'var(--luxi-color-component-door-status-indicator-background)', borderColor: 'var(--luxi-color-component-door-status-indicator-border)', color: 'var(--luxi-color-component-door-status-indicator-text)' },
  // 6px dot: Datum's size-1.5 (a documented 2px step); colour on `color` so the pulse ring matches (bg = currentColor)
  dot: { width: 6, height: 6, borderRadius: 9999, flex: 'none', color: 'var(--luxi-color-component-door-status-indicator-live-dot)', background: 'currentColor' },
}
function StatusIndicator({ children, style }) {
  return (
    <span style={{ ...pill, ...indicatorS.live, ...style }}>
      <span aria-hidden="true" className="motion-pulse" style={indicatorS.dot} />
      {children}
    </span>
  )
}
const corner = { position: 'absolute', top: 12, zIndex: 2 }

/* ── what's new — a full-bleed manual carousel (Amy 2026-10-06): the image fills
   the card, "What's new" + the tag ride on it as pills, one arrow each side, no
   pagination. No auto-rotate: it would need a pause control (WCAG 2.2.2) and a
   moving card fights the quest strip for a kid's attention. Type = 14 + 12 only.
   Off-screen slides are inert: out of the tab order AND the accessibility tree, so a
   screen reader only meets the slide she can see (10-21). ── */
const NEW_MEDIA_H = 148
const newS = {
  card: { position: 'relative', background: T.surface, borderRadius: 24, boxShadow: 'var(--luxi-shadow-door-card)', overflow: 'hidden', marginTop: 16, animation: 'doorPop 300ms var(--ease-out) both' },
  track: { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' },
  slide: { flex: '0 0 100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', border: 'none', background: T.surface, padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit', minWidth: 0 },
  media: { position: 'relative', display: 'block', width: '100%', height: NEW_MEDIA_H, overflow: 'hidden' },
  img: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' },
  text: { display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 16px 16px' }, // gap 2 = the 2px exception: heading + its one line read as a pair
  // two lines only (Amy 2026-10-07): the heading, then the update on ONE line
  sTitle: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)', fontWeight: 'var(--font-weight-medium)', color: T.textPrimary },
  sLine: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)', fontWeight: 'var(--font-weight-normal)', color: T.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  // arrows sit on the image's vertical centre (media height / 2 − half the 32 disc), outside the track so they don't scroll
  arrow: { position: 'absolute', top: NEW_MEDIA_H / 2 - 16, zIndex: 2, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--luxi-color-component-door-carousel-arrow-background)', color: 'var(--luxi-color-component-door-carousel-arrow-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: 'var(--luxi-shadow-door-carousel-arrow)' },
}
// the path is drawing; its stroke is the named 1.6px (non-scaling, so it renders exactly
// --border-stroke-1_6 — the old 2.4 viewBox units at 16/24 scale were the same 1.6px)
function Chevron({ left }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={left ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} vectorEffect="non-scaling-stroke" style={{ strokeWidth: 'var(--border-stroke-1_6)' }} /></svg>
}
function WhatsNew({ map, onPlay, onResume }) {
  const track = useRef(null)
  const [i, setI] = useState(0)
  const n = UPDATES.length
  if (!n) return null
  const go = (k) => {
    const t = track.current; if (!t) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    t.scrollTo({ left: ((k + n) % n) * t.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
  }
  const onScroll = () => { const t = track.current; if (t) setI(Math.round(t.scrollLeft / t.clientWidth)) }
  return (
    <section style={newS.card} aria-roledescription="carousel" aria-label="What's new">
      <div ref={track} className="doorNew-track" style={newS.track} onScroll={onScroll}>
        {UPDATES.map((u, k) => {
          const w = WORLDS.find((x) => x.id === u.world)
          const open = () => (u.world === map ? onResume?.() : onPlay?.(u.world))
          return (
            <button key={k} className="doorNew-slide" style={newS.slide} onClick={open} aria-roledescription="slide" aria-label={`What's new, ${k + 1} of ${n}: ${isFresh(u) ? 'New, ' : ''}${u.title}`} tabIndex={k === i ? 0 : -1} inert={k !== i} aria-hidden={k !== i || undefined}>
              <span style={{ ...newS.media, ...(w ? worldThumb(w.tint) : null), position: 'relative' }}>
                {w?.art && <img src={w.art} alt="" style={newS.img} loading="lazy" />}
                {isFresh(u) && <Badge variant="new" style={{ ...corner, right: 12 }}>New</Badge>}
              </span>
              <span style={newS.text}>
                <span style={newS.sTitle}>What’s new</span>
                <span style={newS.sLine}>{u.title}</span>
              </span>
            </button>
          )
        })}
      </div>
      {n > 1 && <>
        <button className="doorNew-arrow" style={{ ...newS.arrow, left: 8 }} onClick={() => go(i - 1)} aria-label="Previous"><Chevron left /></button>
        <button className="doorNew-arrow" style={{ ...newS.arrow, right: 8 }} onClick={() => go(i + 1)} aria-label="Next"><Chevron /></button>
      </>}
    </section>
  )
}

/* ── world card ── */
const cardS = {
  card: { position: 'relative', background: T.surface, borderRadius: 24, boxShadow: 'var(--luxi-shadow-door-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'doorPop 300ms var(--ease-out) both' }, // radius 22 → 24, like the hero + What's new cards
  thumb: { position: 'relative', width: '100%', height: 128 },
  thumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' },
  soonScrim: { position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(160deg, var(--luxi-color-component-door-soon-scrim-start), var(--luxi-color-component-door-soon-scrim-end))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  soonBadge: { width: 56, height: 56, borderRadius: '50%', background: 'var(--luxi-color-component-door-soon-badge-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--luxi-shadow-door-soon-badge)' },
  soonWord: { fontSize: BODY, fontWeight: 700, color: 'var(--color-text-brand)', letterSpacing: '.01em' },
  body: { padding: '12px 16px 4px' }, // was 13/15
  name: { fontSize: 'var(--text-lg)', fontWeight: 500, color: T.textPrimary, letterSpacing: '-.01em' },
  blurb: { fontSize: BODY, fontWeight: 400, color: T.textSecondary, marginTop: 2 }, // 2 = the 2px exception: name + blurb read as one pair
  foot: { padding: '12px 16px 16px', marginTop: 'auto' }, // was 11/15/15
}
/* the world's signpost colour as a soft thumb — matches its in-world gate glow */
function worldThumb(tint) {
  return { position: 'absolute', inset: 0, background: `linear-gradient(150deg, ${tint}22 0%, ${tint}66 55%, ${tint}aa 100%)` }
}
function WorldCard({ world, current, locked, together, onPlay, onResume }) {
  return (
    <div style={cardS.card}>
      <div style={cardS.thumb}>
        {WORLD_NEW[world.id] && !locked && <Badge variant="new" style={{ ...corner, right: 12 }}>New</Badge>}
        {current && !locked && <StatusIndicator style={{ ...corner, left: 12 }}>Last played</StatusIndicator>}
        <div style={worldThumb(world.tint)}>
          {world.art && <img src={world.art} alt="" style={cardS.thumbImg} loading="lazy" />}
        </div>
        {locked && <div style={cardS.soonScrim}><div style={cardS.soonBadge}><Rocket size={28} /></div><span style={cardS.soonWord}>Coming soon</span></div>}
      </div>
      <div style={cardS.body}>
        <div style={cardS.name}>{world.name}</div>
        <div style={cardS.blurb}>{world.blurb}</div>
      </div>
      <div style={cardS.foot}>
        {locked
          ? null
          : together
            ? <ChunkyButton color={T.pink} dark={T.pinkDark} onClick={() => onPlay(world.id)} style={{ padding: '12px 0', fontSize: 'var(--text-base)' }}>Play together 💞</ChunkyButton>
            : current
              ? <ChunkyButton onClick={onResume} style={{ padding: '12px 0', fontSize: 'var(--text-base)' }}><Play />Resume</ChunkyButton>
              : <ChunkyButton onClick={() => onPlay(world.id)} style={{ padding: '12px 0', fontSize: 'var(--text-base)' }}>Play</ChunkyButton>}
      </div>
    </div>
  )
}

/* ── header ── */
const hS = {
  mark: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  right: { display: 'flex', alignItems: 'center', gap: 12 }, // 10 → 12
  // Profile (personalization) and the gear (settings, incl. sound + account) — the
  // two Door chrome buttons. Emoji glyph, matching the Door's existing button look
  // (Amy 2026-08-30: chrome icons stay emoji, not Oscar's stroke gear).
  profileBtn: { border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', borderRadius: '50%' },
  gear: { width: 44, height: 44, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 'var(--text-xl)', lineHeight: 1 },
}
/* Luxi Cozy Closet's mark, in the gem's language (Amy 2026-10-17): flat facets in
   three steps of one ramp (pink 200 / 400 / 700 ≈ the gem's cyan 200 / 400 / 700).
   Fills come from CSS (.doorApp .hg*) so the same drawing goes grey when the app is
   inactive and pink on hover/focus. Decorative: the link text names the app. */
function HangerIcon({ size = 32 }) {
  return (
    <svg className="doorAppIcon" width={size} height={size} viewBox="4 4 52 52" fill="none" aria-hidden="true">
      <path className="hgHook" d="M30 19.5V16c0-2.4 3.6-3 3.6-6.2a3.6 3.6 0 0 0-7.2 0" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path className="hgL" d="M30 17.5 5 40h9.5L30 26z" />
      <path className="hgM" d="M30 17.5 55 40h-9.5L30 26z" />
      <path className="hgD" d="M5 40h50l-3.2 7.5H8.2z" />
    </svg>
  )
}
function Header({ onOpenSettings, onOpenProfile, settingsActive, avatar }) {
  return (
    <header className="doorHdr">
      <div className="doorHdrIn">
        {/* App switcher (Amy 2026-10-17): the wordmark row doubles as Luxi Land's
            app nav. Luxi Math = the current app (iris); the other apps sit beside it
            in the same type, inactive (text-tertiary, 4.74:1 on white = AA at any
            size), and light up iris on hover/focus. Door-only, so it never
            interrupts a math session. Same tab: the closet is its own app. Naming
            rule (Amy + Finn): always "Luxi Cozy Closet". Hover/focus live in
            index.css (.doorApp*), not inline. */}
        <nav className="doorApps" aria-label="Luxi apps">
          <span style={hS.mark} className="doorAppsMark"><GemIcon size={36} /></span>
          <span className="doorApp doorApp--on" aria-current="page">Luxi Math</span>
          <span className="doorAppsSep" aria-hidden="true" />
          <a className="doorApp" href="https://closet.luxi.land"><HangerIcon size={32} />Luxi Cozy Closet</a>
        </nav>
        <div style={hS.right}>
          {/* Gear first, profile at the corner (Amy 2026-08-30). */}
          <button className="doorBtn" style={{ ...hS.gear, background: settingsActive ? 'var(--luxi-color-component-door-gear-background-active)' : 'var(--color-background-brand-subtle)' }} onClick={onOpenSettings} aria-label="Settings" title="Settings">⚙️</button>
          <button className="doorBtn" style={hS.profileBtn} onClick={onOpenProfile} aria-label="Profile" title="Profile"><ProfileChip src={avatar} /></button>
        </div>
      </div>
    </header>
  )
}

/* ── the door ── */
const dS = {
  greet: { fontSize: 'var(--text-2xl)', fontWeight: 500, color: T.textPrimary, letterSpacing: '-.01em', lineHeight: 1.25, margin: '0 0 24px', minHeight: 40, display: 'flex', alignItems: 'center' }, // minHeight 38 → 40
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '0 0 24px', minHeight: 40 },
  colTitle: { fontSize: 'var(--text-2xl)', fontWeight: 500, color: T.textPrimary, letterSpacing: '-.01em' },
  colNote: { fontSize: BODY, fontWeight: 400, color: T.textSecondary }, // sits on the lavender page gradient, not white: Datum rule = tertiary only on base, so secondary (7.07; tertiary would be 4.29 ✗)
}
export default function Door({ mode, name, points, gems, map, quest, meadowOpen = false, avatar = null, onOpenSettings, onOpenProfile, onOpenFeedback, settingsActive = false, onResume, onPlay }) {
  const greet = mode === 'account' && name ? 'Welcome back, ' + name + '!' : 'Welcome, player!'
  return (
    <div className="doorScreen">
      <Header onOpenSettings={onOpenSettings} onOpenProfile={onOpenProfile} settingsActive={settingsActive} avatar={avatar} />
      <main className="doorWrap">
        <div className="doorGrid">
          {/* Mobile order (Finn 2026-10-10): on one column the worlds came after
              the hero + quest cards, so the first thing a phone player could tap
              to play sat far below the fold. Under 860px .doorLeft dissolves
              (display: contents) and .doorGreet / #worlds / .doorLeftBody are
              re-ordered: greeting → worlds → hero + quest. Desktop unchanged. */}
          <div className="doorLeft">
            <div className="doorGreet" style={dS.greet}>{greet}</div>
            <div className="doorLeftBody">
              <Hero mode={mode} points={points} gems={gems} />
              <WhatsNew map={mode !== 'new' ? map : null} onPlay={onPlay} onResume={onResume} />
              <QuestCard quest={quest} />
            </div>
          </div>
          {/* id + scroll-margin: the footer's "Worlds" link (#worlds) lands here,
              clear of the sticky .doorHdr (~70px). */}
          <div id="worlds" className="doorWorldsCol" style={{ scrollMarginTop: 88 }}>
            <div style={dS.colHead}>
              <span style={dS.colTitle}>Choose your world</span>
              <span style={dS.colNote}>{WORLDS.length} worlds{meadowOpen ? ' · Meadow open' : ''}</span>
            </div>
            <div className="doorWorlds">
              {WORLDS.map((w) => (
                <WorldCard key={w.id} world={w} current={mode !== 'new' && w.id === map} onPlay={onPlay} onResume={onResume} />
              ))}
              <WorldCard world={MEADOW} together locked={!meadowOpen} onPlay={onPlay} />
            </div>
          </div>
        </div>
      </main>
      {/* full-bleed dark footer at the foot of the Door's scroll container */}
      <Footer onFeedback={onOpenFeedback} />
    </div>
  )
}
