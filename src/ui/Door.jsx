/*
 * Door.jsx — the hub a player lands on before a world (Lumio Math).
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

import { levelState, fmtPoints } from '../levels'
import HeroStage from './HeroStage'

/* level math is imported from levels.js — the comp inlined a verbatim copy of it;
   in-app we read the real source so the two can never drift. */

/* house tokens — Oscar's Door palette (consistent with the iris/lilac system).
   Celebration colours stay honest: cyan = gems · violet = levels & actions ·
   amber = station/quests. BODY = the one shared body size. */
const BODY = 14
const T = {
  ink: '#262626', ink2: '#4d4d4d', ink3: '#6e6e6e',
  line: '#ECE7F5', surface: '#FFFFFF',
  iris: '#4B54DD', // brand purple — the wordmark
  amber: '#FE9A00', amberSoft: '#FFF7EA', amberLine: '#FBE3B6', amberInk: '#8A5300',
  pink: '#F6339A', pinkDark: '#C6005C',
}
/* violet — levels + all primary actions */
const V = {
  main: '#A78BFA', soft: '#F1ECFE', softLine: '#E7DEFA', deep: '#5B44C4',
  btn: '#7C6CE8', btnDark: '#5B44C4',
  grad: 'linear-gradient(135deg,#C4B5FD 0%,#A78BFA 58%,#8E7BF2 100%)',
}

/* The five REAL worlds. ids ARE the contract (they match maps.js exactly, so
   onPlay(id) → travel(id) needs no translation). Blurbs are vibe only — worlds
   are skins, same maths everywhere. `art` = a real in-game capture (Amy, from the
   built maps); `tint` = the world's in-world gate colour, shown while the art
   loads and as the honest fallback. Art resolves against BASE_URL (Vercel '/',
   Pages '/math-game/'). */
const ART = import.meta.env.BASE_URL + 'worlds/'
const WORLDS = [
  { id: 'clearing', name: 'Forest Clearing', blurb: 'Where every journey begins', tint: '#5fbf63', art: ART + 'clearing.jpg' },
  { id: 'town', name: 'Sunny Town', blurb: 'Warm streets, friendly faces', tint: '#f0a03c', art: ART + 'town.jpg' },
  { id: 'garden', name: 'Rosy Garden', blurb: 'Petal paths and quiet corners', tint: '#ef7fb5', art: ART + 'garden.jpg' },
  { id: 'market', name: 'Merry Market', blurb: 'Stalls, treats, and trinkets', tint: '#f2c530', art: ART + 'market.jpg' },
  { id: 'arcade', name: 'Star Arcade', blurb: 'Bright lights, big scores', tint: '#8f6fe8', art: ART + 'arcade.jpg' },
]
const MEADOW = { id: 'meadow', name: 'The Meadow', blurb: 'Play together', tint: '#b48fe0' }

/* ── icons (crafted, not emoji) ── */
/* Gem — Amy's exact cut-diamond w/ white "+" (Math version 3.svg), tight viewBox */
function GemIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="18 25.5 60 60" fill="none" aria-hidden="true">
      <path d="M30 33H66L57 45H39L30 33Z" fill="#A5F3FC" />
      <path d="M30 33L39 45H21L30 33Z" fill="#22D3EE" />
      <path d="M66 33L57 45H75L66 33Z" fill="#22D3EE" />
      <path d="M21 45H39L48 78L21 45Z" fill="#0E7490" />
      <path d="M39 45H57L48 78L39 45Z" fill="#0891B2" />
      <path d="M57 45H75L48 78L57 45Z" fill="#0E7490" />
      <g opacity="0.92" fill="#fff">
        <rect x="42" y="37.65" width="12" height="2.85" rx="1.425" />
        <rect x="46.575" y="33" width="2.85" height="12" rx="1.425" />
      </g>
    </svg>
  )
}
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
function Saved({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={T.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  card: { background: T.surface, borderRadius: 26, boxShadow: '0 2px 14px rgba(74,54,110,.07)', padding: 16, animation: 'doorPop .4s ease-out both' },
  stage: { position: 'relative', width: '100%', height: 196, borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(120% 100% at 50% 18%, #F6F1FF 0%, #ECE4FB 62%, #E4D9F6 100%)' },
  lvlRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 },
  lvlNum: { fontSize: 20, fontWeight: 600, color: T.ink, letterSpacing: '-.01em' },
  pts: { fontSize: BODY, fontWeight: 400, color: T.ink3 },
  gems: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: BODY, fontWeight: 700, color: T.ink },
  track: { position: 'relative', height: 12, borderRadius: 999, background: V.soft, overflow: 'hidden', marginTop: 10, border: '1px solid ' + V.softLine },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, background: V.grad },
  toNextRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  toNext: { fontSize: BODY, fontWeight: 400, color: T.ink3 },
  newLine: { fontSize: BODY, fontWeight: 400, color: T.ink2, marginTop: 18, lineHeight: 1.5 },
  saved: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 12.5, fontWeight: 400, color: T.ink3 },
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
        <div style={heroS.newLine}>Pick a world below and start playing — no setup, jump right in. 🌟</div>
      )}
    </div>
  )
}

/* ── today's quest — ONE line, crafted trophy. Real station-plan data (or hidden). ── */
const questS = {
  card: { display: 'flex', alignItems: 'center', gap: 13, background: T.amberSoft, border: '1.5px solid ' + T.amberLine, borderRadius: 18, padding: '12px 15px', marginTop: 16, animation: 'doorPop .4s .05s ease-out both' },
  badge: { width: 40, height: 40, flex: 'none', borderRadius: 12, background: '#FFEFCF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mid: { minWidth: 0, flex: 1 },
  labelRow: { display: 'flex', alignItems: 'center', gap: 7 },
  label: { fontSize: 11.5, fontWeight: 600, color: T.amberInk, letterSpacing: '.02em' },
  refresh: { fontSize: 10.5, fontWeight: 600, color: '#B4832E' },
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
          <span style={questS.label}>Today’s quest</span>
          <span style={questS.refresh}>· refreshes in {quest.hrs}h</span>
        </div>
        <div style={questS.text}>Visit {quest.worldName} to earn gems</div>
      </div>
      <span style={questS.reward}>+{quest.gems}<GemIcon size={16} /></span>
    </div>
  )
}

/* ── world card ── */
const cardS = {
  card: { position: 'relative', background: T.surface, borderRadius: 22, boxShadow: '0 2px 14px rgba(74,54,110,.07)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'doorPop .4s ease-out both' },
  thumb: { position: 'relative', width: '100%', height: 128 },
  thumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' },
  chip: { position: 'absolute', left: 10, top: 10, zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.94)', color: V.deep, fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 999, boxShadow: '0 2px 8px rgba(74,54,110,.14)' },
  soonScrim: { position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(160deg, rgba(238,233,251,.94), rgba(228,220,247,.96))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 },
  soonBadge: { width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(124,108,232,.22)' },
  soonWord: { fontSize: 13, fontWeight: 700, color: V.deep, letterSpacing: '.01em' },
  body: { padding: '13px 15px 4px' },
  name: { fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: '-.01em' },
  blurb: { fontSize: BODY, fontWeight: 400, color: T.ink3, marginTop: 2 },
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
        {current && !locked && <span style={cardS.chip}><span style={{ width: 7, height: 7, borderRadius: '50%', background: V.main }}></span>Last played</span>}
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
  round: { width: 42, height: 42, borderRadius: '50%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20 },
  profile: { position: 'relative', width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px ' + V.softLine, background: 'radial-gradient(120% 120% at 30% 25%, #EFE9FD, ' + V.main + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
}
function Header({ sound, setSound }) {
  return (
    <header className="doorHdr">
      <div className="doorHdrIn">
        <div style={hS.brand}><span style={hS.mark}><GemIcon size={36} /></span><span style={hS.word}>Lumio Math</span></div>
        <div style={hS.right}>
          <button style={hS.round} onClick={() => setSound(!sound)} title={sound ? 'Sound on' : 'Sound off'} aria-label="Toggle sound">{sound ? '🔈' : '🔇'}</button>
          {/* Profile — the affordance settings lives inside later; soft avatar for now */}
          <span style={hS.profile} title="Profile" role="button" aria-label="Profile">🙂</span>
        </div>
      </div>
    </header>
  )
}

/* ── the door ── */
const dS = {
  greet: { fontSize: 24, fontWeight: 600, color: T.ink, letterSpacing: '-.01em', lineHeight: 1.25, margin: '0 0 24px', minHeight: 38, display: 'flex', alignItems: 'center' },
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '0 0 24px', minHeight: 38 },
  colTitle: { fontSize: 24, fontWeight: 600, color: T.ink, letterSpacing: '-.01em' },
  colNote: { fontSize: BODY, fontWeight: 400, color: T.ink3 },
}
export default function Door({ mode, name, points, gems, map, quest, meadowOpen = false, sound, setSound, onResume, onPlay }) {
  const greet = mode === 'account' && name ? 'Welcome back, ' + name + '!' : 'Welcome, player!'
  return (
    <div className="doorScreen">
      <Header sound={sound} setSound={setSound} />
      <main className="doorWrap">
        <div className="doorGrid">
          <div className="doorLeft">
            <div style={dS.greet}>{greet}</div>
            <Hero mode={mode} points={points} gems={gems} />
            <QuestCard quest={quest} />
          </div>
          <div>
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
    </div>
  )
}
