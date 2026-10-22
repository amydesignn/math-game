import { useRef, useState } from 'react'
import { solve } from '../math'
import { SKINS, skinTint } from './skins'
import { T, Gem, Sparkles, BigButton, EquationRow, Keypad, WorkedExample, FlyGem, useKeyInput, Modal, ModalClose, DivisionAsk, POP_IN } from './mathkit'
import DivisionWalkthrough from './DivisionWalkthrough'

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
          <div key={i} style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', /* was 46 · 14 */
            fontSize: 'var(--text-2xl)', lineHeight: 1,
            background: filled ? skinTint(skin.accent, '1e') : 'var(--color-background-subtle)',
            border: filled ? `2px solid ${skin.accent}` : active ? `2px solid ${skin.accent}` : `2px dashed var(--luxi-color-component-station-slot-border)`,
            boxShadow: active ? `0 0 0 4px ${skinTint(skin.accent, '22')}` : 'none',
            transition: 'background 200ms var(--ease-out), border-color 200ms var(--ease-out), box-shadow 200ms var(--ease-out)' }}>
            {filled ? <span style={{ animation: 'slotFill 300ms var(--ease-out) both' }}>{skin.marker}</span>
              : <span style={{ opacity: active ? 0.4 : 0.2 }}>{skin.marker}</span>}
          </div>
        )
      })}
    </div>
  )
}

export default function StationPopup({ quest, onAward, onBonusAward, onPetReact, onWorldReact, onResult, onClose, hudGemRef, resumeAt = 0, giftGems = null }) {
  // The welcome gift (2026-10-18): if it's still owed when the quest opens, the
  // FIRST right answer here pays giftGems instead of its own gems (App claims it
  // and shows the gift card after the quest). Used once; the bonus is unchanged.
  const giftLeft = useRef(giftGems)
  const [gift, setGift] = useState(null) // { step, gems } — where the gift landed (latched: App stops passing giftGems once it's claimed)
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
  // A correct answer advances the quest (per-problem payout + pet, then either the
  // completion bonus or the next step). Shared by the single-answer check AND the
  // division ask's onSolved, so both encounters pay + progress identically.
  const succeed = () => {
    const pay = giftLeft.current || problem.gems || 1
    if (giftLeft.current) {
      setGift({ step, gems: giftLeft.current })
      giftLeft.current = null
    }
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
  }
  const fail = () => {
    setShake(true)
    setTimeout(() => setShake(false), 300)
    setTimeout(() => setPhase('recover'), 260)
  }
  // single-answer check (× / + / −). Division routes through <DivisionAsk> instead
  // — solve() has no ÷ case (for ÷ it returns a−b, the exact bug that wrong-marked
  // correct quotients in the quest), so ÷ never reaches this comparison.
  const check = () => {
    if (entry === '') return
    const ok = Number(entry) === answer
    onResult?.(problem, ok)
    if (ok) succeed()
    else fail()
  }
  const nextProblem = () => { setStep((s) => s + 1); setEntry(''); setPhase('ask') }
  const backToAsk = () => { setEntry(''); setPhase('ask') }
  const close = (completed) => onClose?.({ completed, solvedCount: completed ? total : step })

  // The station's own key handler is OFF for division — <DivisionAsk> owns its
  // two-field keypad (same guard MathPopup uses).
  useKeyInput(onKey, problem.op !== '÷')

  const dismissable = phase === 'ask' || phase === 'intro'

  return (
    // The shared shell (mathkit <Modal>, docs/modal-system.md) — identical frame
    // to the math and progress popups; only the header tint differs.
    <Modal
      onScrim={dismissable ? () => close(false) : undefined}
      cardRef={cardRef}
      cardClass={shake ? 'shakeit' : ''}
      cardStyle={{ padding: '0 0 24px' }}
      overlay={flyGems.map((g) => <FlyGem key={g.id} {...g} />)}
      label={skin.tag}>

        {/* quest banner — skin banner + a QUEST badge so it reads as the bigger encounter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px',
          background: `linear-gradient(180deg in srgb,${skinTint(skin.accent, '14')},var(--color-background-base))`, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 'var(--text-2xl)', lineHeight: 1 }}>{skin.paw}</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '.06em', textTransform: 'uppercase', color: skin.accentInk }}>{skin.tag}</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-inverse)',
            background: skin.accentInk, borderRadius: 8, padding: '4px 8px' }}>Quest</span>
          <div style={{ flex: 1 }} />
          {dismissable && <ModalClose onClick={() => close(false)} />}
        </div>

        <div style={{ padding: '20px 24px 4px' }}>
          {phase === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
              <div style={{ fontSize: 'var(--text-5xl)', lineHeight: 1, animation: 'floaty 3s ease-in-out infinite' }}>{skin.marker}</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: T.textPrimary }}>{skin.questAsk}</div>
                <div style={{ fontSize: 'var(--text-base)', color: T.textPrimary, marginTop: 4 }}>{total} {skin.stepPlural} to go — finish them all for a bonus gem!</div>
              </div>
              <QuestSlots skin={skin} total={total} done={0} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', fontWeight: 500, color: T.textSecondary,
                background: 'var(--color-background-subtle)', border: `1px solid ${T.line}`, borderRadius: 12, padding: '8px 16px' }}>
                Finish-the-quest bonus: +{quest.bonus} <Gem size={16} />
              </div>
              <BigButton tone="primary" onClick={() => setPhase('ask')} style={{ minWidth: 200 }}>Let's go ✨</BigButton>
            </div>
          )}

          {phase === 'ask' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <QuestSlots skin={skin} total={total} done={step} />
              {problem.op === '÷' ? (
                /* division = the shared two-field ask; a correct answer advances the
                   quest (succeed), a wrong one opens the candy walkthrough (recover). */
                <DivisionAsk problem={problem} skin={skin}
                  onSolved={succeed}
                  onResult={(ok) => onResult?.(problem, ok)}
                  onWalkthrough={() => setPhase('recover')} />
              ) : (
                <>
                  {/* same roles as MathPopup's ask: instruction 16/400 primary · hint 14/400 secondary (Amy 2026-10-05) */}
                  <div style={{ textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 400, color: T.textPrimary }}>
                    {skin.stepNoun[0].toUpperCase() + skin.stepNoun.slice(1)} {step + 1} of {total} — {skin.askShort}
                  </div>
                  <EquationRow a={problem.a} op={problem.op} b={problem.b} entry={entry} />
                  <Keypad onKey={onKey} />
                  <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: T.textSecondary, fontWeight: 400, marginTop: 8 }}>Type your answer, then tap Check</div>
                </>
              )}
            </div>
          )}

          {phase === 'stepdone' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              padding: '8px 0 0', animation: POP_IN }}>
              <Sparkles colors={['var(--luxi-color-component-reward-sparkle-1)', skin.accent, T.irisSoft, T.tealLt]} n={14} />
              <QuestSlots skin={skin} total={total} done={step + 1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: T.textPrimary }}>{skin.stepWin(step + 1, total)}</div>
                <div style={{ fontSize: 'var(--text-base)', color: T.textPrimary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                  +{gift?.step === step ? gift.gems : problem.gems || 1} <Gem size={16} />{gift?.step === step && ' +1 🌱'} · {total - (step + 1)} {total - (step + 1) > 1 ? skin.stepPlural : skin.stepNoun} to go
                </div>
              </div>
              <BigButton tone="primary" onClick={nextProblem} style={{ marginTop: 4, minWidth: 200 }}>Next {skin.stepNoun} ▸</BigButton>
            </div>
          )}

          {phase === 'recover' && (
            <div style={{ paddingBottom: 8 }}>
              <QuestSlots skin={skin} total={total} done={step} />
              {problem.op === '÷' ? (
                /* division recovers into Oscar's candy walkthrough (its own header +
                   steps) on a matched `similar` problem, then back to hers. */
                <DivisionWalkthrough problem={problem.similar || problem} onDone={backToAsk} />
              ) : (
                <>
                  <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: T.textPrimary }}>Let's look at one together 💡</div>
                    {/* reassurance = supporting line, 14 secondary (Amy 2026-10-05) */}
                    <div style={{ fontSize: 'var(--text-sm)', color: T.textSecondary, marginTop: 4 }}>No worries — the quest waits. Follow the steps, then try again.</div>
                  </div>
                  <WorkedExample problem={problem} onBack={backToAsk} />
                </>
              )}
            </div>
          )}

          {phase === 'complete' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              padding: '8px 0 0', animation: POP_IN }}>
              <Sparkles colors={['var(--luxi-color-component-reward-sparkle-1)', skin.accent, T.amber, T.tealLt]} n={20} />
              <QuestSlots skin={skin} total={total} done={total} />
              {/* the bonus moment — amber, ringed, visibly NOT the ordinary gem beat */}
              <div style={{ position: 'relative', width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `var(--border-stroke-2) solid ${T.amber}`, animation: 'bonusRing 1.1s ease-out .9s infinite' }} />
                <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'var(--luxi-color-component-station-bonus-halo)' }} />
                <Gem size={76} style={{ animation: 'gemSpin 500ms var(--ease-out) both', filter: 'var(--luxi-shadow-bonus-gem)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: T.textPrimary }}>Quest complete! 🎉</div>
                <div style={{ fontSize: 'var(--text-base)', color: T.textPrimary, marginTop: 4 }}>{skin.questWin}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', fontWeight: 500, color: T.textPrimary,
                    background: 'var(--color-background-subtle)', border: `1px solid ${T.line}`, borderRadius: 12, padding: '8px 12px' }}>+{earned} <Gem size={16} /> earned</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--luxi-color-component-station-bonus-chip-text)' /* amber-700 · AA on the cream chip */,
                    background: 'var(--luxi-color-component-station-bonus-chip-background)', border: '1px solid var(--luxi-color-component-station-bonus-chip-border)', borderRadius: 12, padding: '8px 12px' }}>+{quest.bonus} <Gem size={16} /> bonus!</span>
                </div>
              </div>
              <BigButton tone="primary" onClick={() => close(true)} style={{ marginTop: 8, minWidth: 200 }}>Back to your world ✨</BigButton>
            </div>
          )}
        </div>
    </Modal>
  )
}
