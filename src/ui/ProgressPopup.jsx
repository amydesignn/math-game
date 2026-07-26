import { useEffect, useState } from 'react'
import { T, Modal, ModalClose } from './mathkit'
import { levelState, fmtPoints, STAGE_LABELS } from '../levels'
import { TOPIC_META, stageCounts, startedTopics } from '../topicMeta'

/*
 * ProgressPopup — tap the level bar → her record book (Phase 5-B).
 * Lifted 1:1 from Oscar's `math-level-history-flow.html` + `handoff - progress
 * popup.md` (2026-07-25). His visual language verbatim; adaptations noted at
 * each site.
 *
 * REVIEW-ONLY, and that's the whole character of it: it opens deliberately
 * (tap) and closes deliberately (✕ · Done · scrim · Esc). The applause lives
 * in the 5-A congratulations card — this is calm, proud and legible. A record
 * book, not a trophy cabinet.
 *
 * NO ACCURACY, EVER (Design Principle 4). Counts only. Nothing in here may
 * ever divide correct by seen — show what she's done, never grade what she
 * missed.
 *
 * ADAPTATIONS from the comp:
 *  · levelState/fmtPoints IMPORTED from levels.js rather than copied — the
 *    comp redeclares them identically, and two definitions of the level ladder
 *    would drift the way a second points accumulator would (Amy's call).
 *  · STAGE labels come from levels.js STAGE_LABELS (the single UI-only source;
 *    Ivy must never see L1/L2/L3), so only the pip COLOURS live here.
 *  · Topic cards read the display map in topicMeta.js — the comp's topic keys
 *    were subject names, the store keys are topic ids. See that file.
 *  · A subject with one rung renders a single total row instead of a ladder
 *    (Amy: rows stuck at 0 forever aren't "not yet", they're "never").
 *  · The shell is the shared <Modal>, so this card is the same frame as the
 *    math and station popups.
 */

/* Level identity = VIOLET (teal = gems · amber = station bonus), softened to
 * PASTEL for this card so it sits inside the app's pastel skin. Note the bar
 * itself still wears the saturated 5-A violet — mirroring the pastel into the
 * bar is Amy's open taste call, and a one-line change in LevelBar if she says
 * yes (Oscar flagged it in the comp). */
const LVL = {
  main: '#A78BFA', soft: '#F1ECFE', deep: '#5B44C4', softLine: '#E7DEFA',
  grad: 'linear-gradient(135deg,#C4B5FD 0%,#A78BFA 58%,#8E7BF2 100%)',
}

/* One ascending pastel-violet ramp so the SYSTEM reads at a glance:
 * light → deep = easier → harder. Distinct from the ⭐ badge track (5-C). */
const STAGE_DOT = { 1: '#C9BCF5', 2: '#A78BFA', 3: '#7C5CE0' }

const REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

/* Greys are WCAG AA on their backgrounds (Oscar's locked format): #5C5470 body
 * ≈7:1 on white, #6E6685 muted ≈6:1. The one light grey is the upcoming-level
 * ladder node — an inactive indicator, SC 1.4.3 exempt. Keep it light. */
const S = {
  card: { display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' },

  /* HEADER ZONE — the celebration panel. Family header: tint→near-white
     gradient + a 1px stroke divider at its foot (mirrors the station popup). */
  head: { position: 'relative', padding: '30px 24px 22px', textAlign: 'center', flex: 'none',
    background: 'linear-gradient(180deg,#E9E2FA 0%,#F8F5FE 100%)', borderBottom: '1px solid #E7DEF4', overflow: 'hidden' },
  lvlLabel: { position: 'relative', fontSize: 14, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: LVL.deep, marginBottom: 16, zIndex: 2 },
  circle: { position: 'relative', width: 80, height: 80, margin: '0 auto 16px', borderRadius: '50%', background: LVL.grad, color: '#fff', fontWeight: 700, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 22px rgba(139,123,242,.42), inset 0 -4px 0 rgba(0,0,0,.10)', zIndex: 2 },
  totalLine: { position: 'relative', fontSize: 17, fontWeight: 400, color: '#5C5470', zIndex: 2 },
  totalStrong: { color: LVL.deep, fontWeight: 700 },

  /* CLIMB ZONE — its own white band between two dividers; the tint stays
     isolated to the celebration panel above. */
  climb: { position: 'relative', padding: '18px 24px 15px', background: T.surface, borderBottom: '1px solid #EDEAF3', flex: 'none' },
  ladder: { position: 'relative', height: 40 },
  ladderLine: { position: 'absolute', left: '6%', right: '6%', top: '50%', height: 4, marginTop: -2, borderRadius: 2, background: '#E7E1F1' },
  ladderFill: { position: 'absolute', left: '6%', top: '50%', height: 4, marginTop: -2, borderRadius: 2, background: LVL.grad, transition: 'width .75s cubic-bezier(.22,1,.36,1)' },
  node: { position: 'relative', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
  toNext: { position: 'relative', fontSize: 14, fontWeight: 400, color: '#6E6685', textAlign: 'right', marginTop: 12, paddingRight: 2 },

  /* BODY ZONE — the white record. */
  body: { padding: '18px 24px 22px', overflowY: 'auto', flex: '1 1 auto' },
  sectionLbl: { fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6E6685', marginBottom: 12 },
  topicHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  topicIcon: { width: 40, height: 40, borderRadius: 12, background: LVL.soft, color: LVL.deep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flex: 'none' },
  topicName: { fontWeight: 700, fontSize: 19, color: T.ink },
  stageRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '6px 2px' },
  pips: { display: 'flex', gap: 4, flex: 'none' },
  pip: { width: 8, height: 8, borderRadius: '50%' },
  stageTxt: { flex: 1, fontSize: 15, color: '#5C5470', fontWeight: 400 },
  stageCount: { fontWeight: 700, fontSize: 20, color: LVL.deep, minWidth: 24, textAlign: 'right' },
  divider: { height: 1, background: LVL.softLine, margin: '16px 0' },
  empty: { textAlign: 'center', color: '#6E6685', fontWeight: 400, fontSize: 15, padding: '8px 0 18px' },
}

/* A number ticks up from 0 on mount. The state DEFAULTS to the true value and
 * a timer guarantees it — rAF starves in hidden/throttled tabs (the award
 * hardening lesson), and a record book that reads 0 because a frame never came
 * would be worse than no animation at all. */
function useCountUp(value, dur = 750) {
  const [v, setV] = useState(value)
  useEffect(() => {
    if (REDUCED) { setV(value); return }
    let raf, start
    let done = false
    const ease = (p) => 1 - Math.pow(1 - p, 3)
    const step = (t) => {
      if (!start) { start = t; setV(0) }
      const p = Math.min(1, (t - start) / dur)
      setV(Math.round(value * ease(p)))
      if (p < 1) raf = requestAnimationFrame(step)
      else done = true
    }
    raf = requestAnimationFrame(step)
    const settle = setTimeout(() => { if (!done) setV(value) }, dur + 400)
    return () => { cancelAnimationFrame(raf); clearTimeout(settle) }
  }, [value, dur])
  return v
}
function Count({ value, format }) {
  const v = useCountUp(value)
  return <>{format ? format(v) : v}</>
}

/* Soft pastel confetti in the header — decorative only, aria-hidden. The real
 * applause is the 5-A card; this is just a little warmth. */
const CONFETTI = [
  { l: '8%', t: '30%', c: '#C4B5FD', w: 9, h: 9, r: 18, br: '2px' },
  { l: '16%', t: '60%', c: '#F5B8D0', w: 7, h: 7, r: 0, br: '50%' },
  { l: '22%', t: '16%', c: '#FBCE7E', w: 8, h: 8, r: -24, br: '2px' },
  { l: '27%', t: '72%', c: '#9FE0D2', w: 7, h: 7, r: 0, br: '50%' },
  { l: '11%', t: '46%', c: '#A9C5F5', w: 11, h: 4, r: 32, br: '2px' },
  { l: '74%', t: '16%', c: '#C4B5FD', w: 7, h: 7, r: 0, br: '50%' },
  { l: '89%', t: '40%', c: '#FBCE7E', w: 9, h: 9, r: 20, br: '2px' },
  { l: '80%', t: '66%', c: '#F5B8D0', w: 9, h: 4, r: -18, br: '2px' },
  { l: '92%', t: '56%', c: '#9FE0D2', w: 7, h: 7, r: 0, br: '50%' },
  { l: '84%', t: '22%', c: '#A9C5F5', w: 8, h: 8, r: 26, br: '2px' },
]
function Confetti() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} aria-hidden="true">
      {CONFETTI.map((p, i) => (
        <span key={i} style={{ position: 'absolute', left: p.l, top: p.t, width: p.w, height: p.h,
          borderRadius: p.br, background: p.c, transform: `rotate(${p.r}deg)`, opacity: .92 }} />
      ))}
    </div>
  )
}

/* THE CLIMB — the 4 most recent levels [L-2, L-1, L, L+1]. Current is normally
 * node 3 and next is node 4; the window slides forward on its own as she
 * levels. Clamped so a new player never sees level 0 (the one exception: at
 * L1–2 the current node sits earlier than node 3). The fill runs through the
 * reached nodes and nubs PAST the current one toward next — so it doubles as
 * points-to-next and no separate bar is needed. */
export function ClimbLadder({ points }) {
  const st = levelState(points)
  const start = Math.max(1, st.level - 2)
  const rungs = [start, start + 1, start + 2, start + 3]
  const curIdx = st.level - start
  const frac = Math.min(1, st.into / st.need)
  const inset = 6
  const gap = (100 - inset * 2) / 3
  const center = (i) => inset + i * gap
  const nub = curIdx < 3 ? frac * gap : 0
  const fillEnd = Math.min(center(3), center(curIdx) + nub)
  const toNext = st.need - st.into
  return (
    <div style={{ position: 'relative' }}>
      <div style={S.ladder}>
        <span style={S.ladderLine} />
        <span style={{ ...S.ladderFill, width: (fillEnd - inset) + '%' }} />
        {rungs.map((L, i) => {
          const done = L < st.level
          const current = L === st.level
          const face = (done || current)
            ? { background: LVL.grad, color: '#fff', boxShadow: current ? '0 6px 14px rgba(139,123,242,.46)' : '0 3px 9px rgba(139,123,242,.30)' }
            : { background: '#EFEDF2', color: '#A79FB4' } // upcoming — inactive indicator (WCAG 1.4.3 exempt)
          return (
            <span key={L} style={{ position: 'absolute', top: '50%', left: center(i) + '%',
              transform: `translate(-50%,-50%) scale(${current ? 1.1 : 1})`, zIndex: current ? 2 : 1 }}>
              <span style={{ ...S.node, ...face, animation: REDUCED ? 'none' : `rungPop .42s cubic-bezier(.22,1.4,.36,1) ${i * 0.06}s both` }}>{L}</span>
            </span>
          )
        })}
      </div>
      <div style={S.toNext}>{toNext} {toNext === 1 ? 'point' : 'points'} to Level {st.level + 1} →</div>
    </div>
  )
}

function TopicCard({ tkey, topicProgress }) {
  const meta = TOPIC_META[tkey]
  const counts = stageCounts(topicProgress, meta)
  const total = Object.values(counts).reduce((s, n) => s + n, 0)
  return (
    <div>
      <div style={S.topicHead}>
        <span style={S.topicIcon}>{meta.icon}</span>
        <span style={S.topicName}>{meta.label}</span>
      </div>
      {/* 5-C badge seam: ⭐ Explorer / ⭐⭐ Challenger / ⭐⭐⭐ Master row slots here. Not built. */}
      {meta.stages === 1
        /* One rung — no ladder to show, so show the work instead of three rows
           where two can never move off 0 (Amy, 2026-07-25). */
        ? (
          <div style={S.stageRow}>
            <span style={S.pips}><span style={{ ...S.pip, background: STAGE_DOT[1] }} /></span>
            <span style={S.stageTxt}>Problems solved</span>
            <span style={S.stageCount}><Count value={total} /></span>
          </div>
        )
        : [...Array(meta.stages)].map((_, i) => {
          const n = i + 1
          return (
            <div key={n} style={S.stageRow}>
              <span style={S.pips}>
                {[...Array(n)].map((_, j) => <span key={j} style={{ ...S.pip, background: STAGE_DOT[n] }} />)}
              </span>
              <span style={S.stageTxt}>{STAGE_LABELS[n]} problems solved</span>
              <span style={S.stageCount}><Count value={counts[n] || 0} /></span>
            </div>
          )
        })}
    </div>
  )
}

export default function ProgressPopup({ totalPoints, topicProgress, onClose }) {
  const st = levelState(totalPoints)
  const started = startedTopics(topicProgress)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <Modal onScrim={onClose} cardStyle={S.card} label="Your progress"
      animation="sheetIn .42s cubic-bezier(.22,1.2,.36,1) both" zIndex={45}>

      {/* HEADER ZONE — level medallion + the permanent total */}
      <div style={S.head}>
        <Confetti />
        <ModalClose onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 4 }} />
        <div style={S.lvlLabel}>Level</div>
        <div style={S.circle} aria-label={'Level ' + st.level}>{st.level}</div>
        <div style={S.totalLine}>
          <span style={S.totalStrong}><Count value={totalPoints} format={fmtPoints} /></span> total points earned!
        </div>
      </div>

      {/* CLIMB ZONE — the recent levels, in its own white band */}
      <div style={S.climb}><ClimbLadder points={totalPoints} /></div>

      {/* BODY ZONE — what she's solved. Counts only, never accuracy. */}
      <div style={S.body}>
        <div style={S.sectionLbl}>What you&apos;ve solved</div>
        {started.length > 0
          ? started.map((k, i) => (
            <div key={k}>
              {i > 0 && <div style={S.divider} />}
              <TopicCard tkey={k} topicProgress={topicProgress} />
            </div>
          ))
          : <div style={S.empty}>Start playing to fill this in.</div>}
      </div>
    </Modal>
  )
}
