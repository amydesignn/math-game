import { useRef, useState } from 'react'
import { solve } from '../math'
import { SKINS } from './skins'
import { T, Gem, Sparkles, BigButton, EquationRow, Keypad, WorkedExample, FlyGem, useKeyInput } from './mathkit'

/*
 * StationPopup — Oscar's station mini-quest, lifted from
 * ~/Downloads/delivery — station + sparkle packs/math-station-flow.html
 * (encounter tier 3). The sparkle popup wrapped in a QUEST SPINE: an intro,
 * one problem per step with the skin's marker filling in, a distinct completion
 * bonus, and a farewell handled by the world. Shares every math atom with
 * MathPopup via ./mathkit — same keypad, same worked example, same gem flight.
 *
 * quest = { skinId, bonus, problems:[{ type, level, op, a, b, gems, similar }] }
 *   per-problem `gems` = the ladder level she solved it at (L1=1 … L3=3).
 *
 * Seams (wired by App):
 *   onAward(gems)          per-problem payout, fires per correct answer
 *   onBonusAward(gems)     completion bonus, fires ONCE at quest end (own burst)
 *   onPetReact()           per-correct pet reaction
 *   onWorldReact(skinId)   quest-complete world moment
 *   onResult(problem, ok)  topicProgress bookkeeping (App knows the topic)
 *   onClose({completed, solvedCount})  dismiss; !completed RESUMES next visit
 *   hudGemRef              the HUD counter, target of the gem flight
 *   resumeAt               index of the problem she left off at (0 = fresh)
 */

// The quest progress row: one marker slot per problem. Filled slots pop in with
// the skin's marker; the ACTIVE slot glows; pending slots are dashed.
function QuestSlots({ skin, total, done }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {[...Array(total)].map((_, i) => {
        const filled = i < done, active = i === done
        return (
          <div key={i} style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, lineHeight: 1,
            background: filled ? `${skin.accent}1e` : '#fafafa',
            border: filled ? `2px solid ${skin.accent}` : active ? `2px solid ${skin.accent}` : `2px dashed #d9d9d9`,
            boxShadow: active ? `0 0 0 5px ${skin.accent}22` : 'none',
            transition: 'all .25s' }}>
            {filled ? <span style={{ animation: 'slotFill .45s ease-out both' }}>{skin.marker}</span>
              : <span style={{ opacity: active ? 0.45 : 0.2 }}>{skin.marker}</span>}
          </div>
        )
      })}
    </div>
  )
}

export default function StationPopup({ quest, onAward, onBonusAward, onPetReact, onWorldReact, onResult, onClose, hudGemRef, resumeAt = 0 }) {
  const skin = SKINS[quest.skinId]
  const total = quest.problems.length
  const [step, setStep] = useState(resumeAt)
  const [phase, setPhase] = useState(resumeAt === 0 ? 'intro' : 'ask') // intro | ask | stepdone | recover | complete
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const [flyGems, setFlyGems] = useState([])
  const [earned, setEarned] = useState(0) // gems earned inside this quest (recap on complete)
  const cardRef = useRef(null)
  const problem = quest.problems[Math.min(step, total - 1)]
  const answer = solve(problem.op, problem.a, problem.b)

  const flyToHud = (n, bonus) => {
    const card = cardRef.current, hud = hudGemRef && hudGemRef.current
    if (!card || !hud) return
    const c = card.getBoundingClientRect(), h = hud.getBoundingClientRect()
    const from = { x: c.left + c.width / 2, y: c.top + c.height * 0.42 }
    const to = { x: h.left + h.width / 2, y: h.top + h.height / 2 }
    setFlyGems([...Array(bonus ? n + 1 : n)].map((_, i) => ({ id: Date.now() + i, from, to, delay: i * 90, bonus: bonus && i === 0 })))
    setTimeout(() => setFlyGems([]), 1400)
  }

  const onKey = (k) => {
    if (phase !== 'ask') return
    if (k === 'del') { setEntry((e) => e.slice(0, -1)); return }
    if (k === 'ok') { check(); return }
    if (entry.length >= 4) return
    setEntry((e) => (e + k).replace(/^0+(?=\d)/, ''))
  }
  const check = () => {
    if (entry === '') return
    const ok = Number(entry) === answer
    onResult?.(problem, ok)
    if (ok) {
      const pay = problem.gems || 1
      setEarned((g) => g + pay)
      onPetReact?.()
      const lastOne = step + 1 >= total
      setPhase(lastOne ? 'complete' : 'stepdone')
      // Awards ride plain timers so they can never be lost — rAF starves in
      // hidden/throttled windows (iOS low-power). Only the flight visual is rAF.
      setTimeout(() => onAward?.(pay), 620)
      if (lastOne) {
        setTimeout(() => onWorldReact?.(skin.id), 900)
        setTimeout(() => onBonusAward?.(quest.bonus), 1550)
      }
      requestAnimationFrame(() => {
        flyToHud(pay, false)
        if (lastOne) setTimeout(() => flyToHud(quest.bonus, true), 950)
      })
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 420)
      setTimeout(() => setPhase('recover'), 260)
    }
  }
  const nextProblem = () => { setStep((s) => s + 1); setEntry(''); setPhase('ask') }
  const backToAsk = () => { setEntry(''); setPhase('ask') }
  const close = (completed) => onClose?.({ completed, solvedCount: completed ? total : step })

  useKeyInput(onKey)

  const dismissable = phase === 'ask' || phase === 'intro'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={dismissable ? () => close(false) : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(50,42,80,.44)', backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)', animation: 'scrimIn .25s ease-out both' }} />
      {flyGems.map((g) => <FlyGem key={g.id} {...g} />)}

      <div ref={cardRef} className={shake ? 'shakeit' : ''}
        style={{ position: 'relative', width: 'min(520px,100%)', maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto', background: '#fff', borderRadius: T.radius,
          boxShadow: '0 24px 60px rgba(40,30,70,.28)', padding: '0 0 26px',
          animation: 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>

        {/* quest banner — skin banner + a QUEST badge so it reads as the bigger encounter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px',
          background: `linear-gradient(180deg,${skin.accent}14,#fff)`, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{skin.paw}</span>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: skin.accent }}>{skin.tag}</span>
          <span style={{ fontWeight: 700, fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff',
            background: skin.accent, borderRadius: 9, padding: '4px 9px' }}>Quest</span>
          <div style={{ flex: 1 }} />
          {dismissable && (
            <button onClick={() => close(false)} aria-label="close"
              style={{ border: 'none', background: '#f2f2f2', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                color: T.ink3, fontSize: 16, lineHeight: 1 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '20px 26px 4px' }}>
          {phase === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '6px 0 4px' }}>
              <div style={{ fontSize: 44, lineHeight: 1, animation: 'floaty 3s ease-in-out infinite' }}>{skin.marker}</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.ink }}>{skin.questAsk}</div>
                <div style={{ fontSize: 15, color: T.ink3, marginTop: 5 }}>{total} {skin.stepPlural} to go — finish them all for a bonus gem!</div>
              </div>
              <QuestSlots skin={skin} total={total} done={0} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, color: T.ink3,
                background: '#fafafa', border: `1px solid ${T.line}`, borderRadius: 12, padding: '8px 14px' }}>
                Finish-the-quest bonus: +{quest.bonus} <Gem size={15} />
              </div>
              <BigButton tone="blue" onClick={() => setPhase('ask')} style={{ minWidth: 200 }}>Let's go ✨</BigButton>
            </div>
          )}

          {phase === 'ask' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <QuestSlots skin={skin} total={total} done={step} />
              <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 500, color: T.ink3 }}>
                {skin.stepNoun[0].toUpperCase() + skin.stepNoun.slice(1)} {step + 1} of {total} — {skin.askShort}
              </div>
              <EquationRow a={problem.a} op={problem.op} b={problem.b} entry={entry} />
              <Keypad onKey={onKey} />
              <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9a92ac', fontWeight: 500 }}>Type your answer, then tap Check</div>
            </div>
          )}

          {phase === 'stepdone' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              padding: '8px 0 2px', animation: 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
              <Sparkles colors={['#fff', skin.accent, T.blueSubtle, T.tealLt]} n={14} />
              <QuestSlots skin={skin} total={total} done={step + 1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: T.ink }}>{skin.stepWin(step + 1, total)}</div>
                <div style={{ fontSize: 15.5, color: T.ink3, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  +{problem.gems || 1} <Gem size={17} /> · {total - (step + 1)} {total - (step + 1) > 1 ? skin.stepPlural : skin.stepNoun} to go
                </div>
              </div>
              <BigButton tone="blue" onClick={nextProblem} style={{ marginTop: 4, minWidth: 200 }}>Next {skin.stepNoun} ▸</BigButton>
            </div>
          )}

          {phase === 'recover' && (
            <div style={{ paddingBottom: 6 }}>
              <QuestSlots skin={skin} total={total} done={step} />
              <div style={{ textAlign: 'center', margin: '14px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.ink }}>Let's look at one together 💡</div>
                <div style={{ fontSize: 15, color: T.ink3, marginTop: 4 }}>No worries — the quest waits. Follow the steps, then try again.</div>
              </div>
              <WorkedExample problem={problem} onBack={backToAsk} />
            </div>
          )}

          {phase === 'complete' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              padding: '8px 0 2px', animation: 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
              <Sparkles colors={['#fff', skin.accent, T.amber, T.tealLt]} n={20} />
              <QuestSlots skin={skin} total={total} done={total} />
              {/* the bonus moment — amber, ringed, visibly NOT the ordinary gem beat */}
              <div style={{ position: 'relative', width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${T.amber}`, animation: 'bonusRing 1.1s ease-out .9s infinite' }} />
                <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: `${T.amber}1f` }} />
                <Gem size={76} style={{ animation: 'gemSpin .5s ease-out both', filter: `drop-shadow(0 0 14px ${T.amber}) drop-shadow(0 6px 14px rgba(217,119,6,.45))` }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: T.ink }}>Quest complete! 🎉</div>
                <div style={{ fontSize: 16, color: T.ink3, marginTop: 3 }}>{skin.questWin}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14.5, fontWeight: 700, color: T.ink,
                    background: '#fafafa', border: `1px solid ${T.line}`, borderRadius: 12, padding: '7px 13px' }}>+{earned} <Gem size={16} /> earned</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14.5, fontWeight: 700, color: T.amberDeep,
                    background: '#FEF3E2', border: `1px solid #FDE0B8`, borderRadius: 12, padding: '7px 13px' }}>+{quest.bonus} <Gem size={16} /> bonus!</span>
                </div>
              </div>
              <BigButton tone="blue" onClick={() => close(true)} style={{ marginTop: 6, minWidth: 200 }}>Back to your world ✨</BigButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
