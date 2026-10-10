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
   amber = station/quests. BODY = the one shared body size. */
const BODY = 14
const T = {
  textPrimary: 'var(--color-text-primary)', textSecondary: 'var(--color-text-secondary)', textTertiary: 'var(--color-text-tertiary)', // Datum text tiers by name
  line: '#ECE7F5', surface: '#FFFFFF',
  iris: '#4B54DD', // brand purple — the wordmark
  amber: '#FE9A00', amberSoft: '#FFF7EA', amberLine: '#FBE3B6', amberInk: '#8A5300',
  pink: '#F6339A', pinkDark: '#C6005C',
}
/* Brand Lilac — decoration on the Door (rocket, stage, chip dot); the LEVEL bar reads mathkit LVL (Iris). Primary actions wear Brand Iris (btn) */
const V = {
  main: '#B29BEA', soft: '#EDE7FC', softLine: '#DDD1F7', deep: '#5B4B9E',
  btn: '#6169E0', btnDark: '#3D43BE', // Brand Iris 500 face / 700 shadow — actions (4.56:1 white bold; was #7C6CE8 at 4.06, failed AA)
  grad: 'linear-gradient(135deg,#C6B4F0 0%,#B29BEA 58%,#9B84E0 100%)',
}

/* The five REAL worlds. ids ARE the contract (they match maps.js exactly, so
   onPlay(id) → travel(id) needs no translation). Blurbs are vibe only — worlds
   are skins, same maths everywhere. `art` = a real in-game capture (Amy, from the
   built maps); `tint` = the world's in-world gate colour, shown while the art
   loads and as the honest fallback. Art resolves against BASE_URL (Vercel '/',
   Pages '/math-game/'). */
const ART = import.meta.env.BASE_URL + 'worlds/'
const BASE_WORLDS = [
  { id: 'clearing', name: 'Forest Clearing', blurb: 'Where every journey begins', tint: '#5fbf63', art: ART + 'clearing.jpg' },
  { id: 'town', name: 'Sunny Town', blurb: 'Warm streets, friendly faces', tint: '#f0a03c', art: ART + 'town.jpg' },
  { id: 'garden', name: 'Rosy Garden', blurb: 'Petal paths and quiet corners', tint: '#ef7fb5', art: ART + 'garden.jpg' },
  { id: 'market', name: 'Merry Market', blurb: 'Stalls, treats, and trinkets', tint: '#f2c530', art: ART + 'market.jpg' },
  { id: 'arcade', name: 'Star Arcade', blurb: 'Bright lights, big scores', tint: '#8f6fe8', art: ART + 'arcade.jpg' },
]
// A seasonal map (maps.js `card`) re-dresses its Door card too — name, blurb,
// and its own capture when one exists — so the hub and the world agree.
const WORLDS = BASE_WORLDS.map((w) => {
  const c = MAPS[w.id]?.card
  return c ? { ...w, ...c, art: c.art ? ART + c.art : w.art } : w
})
const MEADOW = { id: 'meadow', name: 'The Meadow', blurb: 'Play together', tint: '#b48fe0' }

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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 4h11v3.5a5.5 5.5 0 0 1-11 0V4Z" fill="#FDBA3D" />
      <path d="M6.5 5.2H4v1.4A3.4 3.4 0 0 0 7.4 10" stroke="#EF9E17" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M17.5 5.2H20v1.4A3.4 3.4 0 0 1 16.6 10" stroke="#EF9E17" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M9.6 16h4.8l-.5-3h-3.8z" fill="#EF9E17" />
      <rect x="7.4" y="18.4" width="9.2" height="2.4" rx="1.2" fill="#E0890E" />
    </svg>
  )
}
/* Rocket — the friendly "coming soon" mark. Positive framing, not a padlock (Amy). */
function Rocket({ size = 22, color = V.main }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2.8c3 2.2 4.5 5.2 4.5 8.9 0 1.2-.2 2.3-.5 3.3H8c-.3-1-.5-2.1-.5-3.3 0-3.7 1.5-6.7 4.5-8.9Z" />
      <circle cx="12" cy="9.4" r="1.8" fill="#fff" />
      <path d="M7.6 13.4 5.4 15c-.5.4-.8 1-.8 1.7v1.8l2.9-1.2z" />
      <path d="M16.4 13.4 18.6 15c.5.4.8 1 .8 1.7v1.8l-2.9-1.2z" />
      <path d="M10.5 16h3l-.4 2.3a1.1 1.1 0 0 1-2.2 0z" fill="#fff" opacity="0.7" />
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
function Play({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
  )
}

/* chunky 3D button — the game's button language. Violet by default. */
function ChunkyButton({ color = V.btn, dark = V.btnDark, onClick, children, style }) {
  const base = {
    position: 'relative', width: '100%', border: 'none', borderRadius: 14, background: color, color: '#fff',
    fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 0 ' + dark, transition: 'transform .08s ease, box-shadow .08s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }
  const down = (e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 2px 0 ' + dark }
  const up = (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 ' + dark }
  return (
    <button style={{ ...base, ...style }} onClick={onClick} onPointerDown={down} onPointerUp={up} onPointerLeave={up}>
      {children}
    </button>
  )
}

/* ── hero: character stage + level readout + saved line ── */
const heroS = {
  card: { background: T.surface, borderRadius: 24, boxShadow: '0 2px 14px rgba(74,54,110,.07)', padding: 16, animation: 'doorPop .4s ease-out both' }, // 26→24: 4px-grid align to the new Settings sheet (Amy 2026-08-30)
  stage: { position: 'relative', width: '100%', height: 196, borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(120% 100% at 50% 18%, #F6F1FF 0%, #ECE4FB 62%, #E4D9F6 100%)' },
  lvlRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 },
  lvlNum: { fontSize: 20, fontWeight: 600, color: T.textPrimary, letterSpacing: '-.01em' },
  pts: { fontSize: BODY, fontWeight: 400, color: T.textSecondary },
  gems: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: BODY, fontWeight: 700, color: T.textPrimary },
  // the level bar reads the SHARED level identity (mathkit LVL, Iris since 2026-10-06) — the
  // Door's own Lilac copy is what left it lilac when the HUD pill went Iris
  track: { position: 'relative', height: 12, borderRadius: 999, background: LVL.soft, overflow: 'hidden', marginTop: 10, border: '1px solid ' + LVL.softLine },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, background: LVL.grad },
  toNextRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  toNext: { fontSize: BODY, fontWeight: 400, color: T.textSecondary },
  newLine: { fontSize: BODY, fontWeight: 400, color: T.textSecondary, marginTop: 18, lineHeight: 1.5 },
  saved: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: BODY, fontWeight: 400, color: T.textSecondary }, // 12.5 → 14 supporting (Amy: Door = 14 + 12 only); check = Datum icon-success
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
  card: { display: 'flex', alignItems: 'center', gap: 13, background: T.amberSoft, border: '1.5px solid ' + T.amberLine, borderRadius: 18, padding: '12px 15px', marginTop: 16, animation: 'doorPop .4s .05s ease-out both' },
  badge: { width: 40, height: 40, flex: 'none', borderRadius: 12, background: '#FFEFCF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mid: { minWidth: 0, flex: 1 },
  labelRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 7, rowGap: 2, whiteSpace: 'nowrap' }, // eyebrow line can outrun the column; phone column ~196 → 'refreshes' drops to its own line whole, never mid-phrase
  label: { fontSize: 12, fontWeight: 600, color: T.amberInk, letterSpacing: '.02em' }, // 11.5 → 12, Title Case (Amy: Door = 14 + 12 only, no caps)
  refresh: { fontSize: 12, fontWeight: 600, color: T.amberInk, letterSpacing: '.02em' }, // 10.5 → 12, same eyebrow as the label (was #B4832E 3.17 ✗ → amberInk 5.95 on amberSoft)
  text: { fontSize: BODY, fontWeight: 400, color: '#6E4E15', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  reward: { flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: T.amberInk, fontSize: BODY, background: '#FFEFCF', padding: '5px 10px 5px 9px', borderRadius: 999 },
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
   a green dot that breathes (motion-pulse). Token names copied verbatim into index.css. ── */
const pill = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1, 4px)', height: 20, padding: '0 var(--space-2, 8px)', borderRadius: 9999, borderWidth: 1, borderStyle: 'solid', fontSize: 'var(--text-xs)', lineHeight: 'var(--text-xs--line-height)', fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap' }
const badgeS = {
  new: { background: 'var(--color-component-badge-new-background)', borderColor: 'var(--color-component-badge-new-border)', color: 'var(--color-component-badge-new-text)' },
}
function Badge({ variant, children, style }) {
  return <span style={{ ...pill, ...badgeS[variant], ...style }}>{children}</span>
}
const indicatorS = {
  live: { background: 'var(--color-component-status-indicator-background)', borderColor: 'var(--color-component-status-indicator-border)', color: 'var(--color-component-status-indicator-text)' },
  // 6px dot: Datum's size-1.5 (a documented 2px step); colour on `color` so the pulse ring matches (bg = currentColor)
  dot: { width: 6, height: 6, borderRadius: 9999, flex: 'none', color: 'var(--color-component-status-indicator-live-dot)', background: 'currentColor' },
}
function StatusIndicator({ children, style }) {
  return (
    <span style={{ ...pill, ...indicatorS.live, ...style }}>
      <span aria-hidden="true" className="motion-pulse" style={indicatorS.dot} />
      {children}
    </span>
  )
}
const corner = { position: 'absolute', top: 'var(--space-3, 12px)', zIndex: 2 }

/* ── what's new — a full-bleed manual carousel (Amy 2026-10-06): the image fills
   the card, "What's new" + the tag ride on it as pills, one arrow each side, no
   pagination. No auto-rotate: it would need a pause control (WCAG 2.2.2) and a
   moving card fights the quest strip for a kid's attention. Type = 14 + 12 only. ── */
const newS = {
  card: { position: 'relative', background: T.surface, borderRadius: 24, boxShadow: '0 2px 14px rgba(74,54,110,.07)', overflow: 'hidden', marginTop: 16, animation: 'doorPop .4s .03s ease-out both' },
  track: { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' },
  slide: { flex: '0 0 100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', border: 'none', background: T.surface, padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit', minWidth: 0 },
  media: { position: 'relative', display: 'block', width: '100%', height: 148, overflow: 'hidden' },
  img: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' },
  text: { display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 16px 16px' },
  // two lines only (Amy 2026-10-07): the heading, then the update on ONE line
  sTitle: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)', fontWeight: 'var(--font-weight-medium)', color: T.textPrimary },
  sLine: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)', fontWeight: 'var(--font-weight-normal)', color: T.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  // arrows sit on the image's vertical centre (148 / 2 − 16), outside the track so they don't scroll
  arrow: { position: 'absolute', top: 58, zIndex: 2, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.94)', color: 'var(--brand-iris-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 2px 8px rgba(74,54,110,.18)' },
}
function Chevron({ left }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={left ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>
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
            <button key={k} className="doorNew-slide" style={newS.slide} onClick={open} aria-roledescription="slide" aria-label={`What's new, ${k + 1} of ${n}: ${isFresh(u) ? 'New, ' : ''}${u.title}`} tabIndex={k === i ? 0 : -1}>
              <span style={{ ...newS.media, ...(w ? worldThumb(w.tint) : null), position: 'relative' }}>
                {w?.art && <img src={w.art} alt="" style={newS.img} loading="lazy" />}
                {isFresh(u) && <Badge variant="new" style={{ ...corner, right: 'var(--space-3, 12px)' }}>New</Badge>}
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
  card: { position: 'relative', background: T.surface, borderRadius: 22, boxShadow: '0 2px 14px rgba(74,54,110,.07)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'doorPop .4s ease-out both' },
  thumb: { position: 'relative', width: '100%', height: 128 },
  thumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' },
  soonScrim: { position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(160deg, rgba(238,233,251,.94), rgba(228,220,247,.96))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 },
  soonBadge: { width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(124,108,232,.22)' },
  soonWord: { fontSize: 13, fontWeight: 700, color: 'var(--color-text-brand)', letterSpacing: '.01em' },
  body: { padding: '13px 15px 4px' },
  name: { fontSize: 18, fontWeight: 600, color: T.textPrimary, letterSpacing: '-.01em' },
  blurb: { fontSize: BODY, fontWeight: 400, color: T.textSecondary, marginTop: 2 },
  foot: { padding: '11px 15px 15px', marginTop: 'auto' },
}
/* the world's signpost colour as a soft thumb — matches its in-world gate glow */
function worldThumb(tint) {
  return { position: 'absolute', inset: 0, background: `linear-gradient(150deg, ${tint}22 0%, ${tint}66 55%, ${tint}aa 100%)` }
}
function WorldCard({ world, current, locked, together, onPlay, onResume }) {
  return (
    <div style={cardS.card}>
      <div style={cardS.thumb}>
        {WORLD_NEW[world.id] && !locked && <Badge variant="new" style={{ ...corner, right: 'var(--space-3, 12px)' }}>New</Badge>}
        {current && !locked && <StatusIndicator style={{ ...corner, left: 'var(--space-3, 12px)' }}>Last played</StatusIndicator>}
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
            ? <ChunkyButton color={T.pink} dark={T.pinkDark} onClick={() => onPlay(world.id)} style={{ padding: '12px 0', fontSize: 15 }}>Play together 💞</ChunkyButton>
            : current
              ? <ChunkyButton onClick={onResume} style={{ padding: '12px 0', fontSize: 15 }}><Play />Resume</ChunkyButton>
              : <ChunkyButton onClick={() => onPlay(world.id)} style={{ padding: '12px 0', fontSize: 15 }}>Play</ChunkyButton>}
      </div>
    </div>
  )
}

/* ── header ── */
const hS = {
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  mark: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  word: { fontSize: 23, fontWeight: 600, color: T.iris, letterSpacing: '-.02em' },
  right: { display: 'flex', alignItems: 'center', gap: 10 },
  // Profile (personalization) and the gear (settings, incl. sound + account) — the
  // two Door chrome buttons. Emoji glyph, matching the Door's existing button look
  // (Amy 2026-08-30: chrome icons stay emoji, not Oscar's stroke gear).
  profileBtn: { border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', borderRadius: '50%' },
  gear: { width: 44, height: 44, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, lineHeight: 1 },
}
function Header({ onOpenSettings, onOpenProfile, settingsActive, avatar }) {
  return (
    <header className="doorHdr">
      <div className="doorHdrIn">
        <div style={hS.brand}><span style={hS.mark}><GemIcon size={36} /></span><span style={hS.word}>Luxi Math</span></div>
        <div style={hS.right}>
          {/* Gear first, profile at the corner (Amy 2026-08-30). */}
          <button style={{ ...hS.gear, background: settingsActive ? '#DDD1F7' : '#EDE7FC' }} onClick={onOpenSettings} aria-label="Settings" title="Settings">⚙️</button>
          <button style={hS.profileBtn} onClick={onOpenProfile} aria-label="Profile" title="Profile"><ProfileChip src={avatar} /></button>
        </div>
      </div>
    </header>
  )
}

/* ── the door ── */
const dS = {
  greet: { fontSize: 24, fontWeight: 600, color: T.textPrimary, letterSpacing: '-.01em', lineHeight: 1.25, margin: '0 0 24px', minHeight: 38, display: 'flex', alignItems: 'center' },
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '0 0 24px', minHeight: 38 },
  colTitle: { fontSize: 24, fontWeight: 600, color: T.textPrimary, letterSpacing: '-.01em' },
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
          <div id="worlds" className="doorWorldsCol" style={{ scrollMarginTop: 90 }}>
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
