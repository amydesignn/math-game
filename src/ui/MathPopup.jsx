import { useRef, useState } from 'react'
import { solve } from '../math'
import { SKINS } from './skins'
import { T, Gem, Sparkles, BigButton, EquationRow, Keypad, WorkedExample, FlyGem, useKeyInput } from './mathkit'

/*
 * MathPopup — Oscar's Phase 4 handoff, lifted 1:1 (his comp:
 * ~/Downloads/math-popup-flow.html). The React overlay that turns a single gem
 * sparkle into a math quest: ask → correct (gems fly to the HUD, pet reacts)
 * or ask → recover (step-by-step worked example on a SIMILAR problem — Ivy's
 * make-or-break feature) → try again.
 *
 * The reusable pieces (keypad, column-math grids, worked example, gem flight)
 * now live in ./mathkit and are SHARED with StationPopup — Oscar's rule that a
 * problem renders the same in either encounter. SKINS moved to ./skins.
 *
 * Seams (wired by App):
 *   onAward(n)        -> add gems (store caps at the beta limit)
 *   onPetReact()      -> pet dances + character emote-yes in-world
 *   onClose(solved)   -> dismiss; solved=true collects the sparkle
 *   onResult(correct) -> topicProgress bookkeeping
 *   hudGemRef         -> the HUD counter, target of the gem flight
 */

export { SKINS } // App still imports SKINS from here for the sparkle popup

/* ============================ MATH POPUP ============================= */
export default function MathPopup({ problem, skin, onAward, onPetReact, onClose, onResult, hudGemRef }) {
  const [phase, setPhase] = useState('ask') // ask | correct | recover
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const [flyGems, setFlyGems] = useState([])
  const cardRef = useRef(null)
  const answer = solve(problem.op, problem.a, problem.b)

  const onKey = (k) => {
    if (phase !== 'ask') return
    if (k === 'del') { setEntry((e) => e.slice(0, -1)); return }
    if (k === 'ok') { check(); return }
    if (entry.length >= 4) return
    setEntry((e) => (e + k).replace(/^0+(?=\d)/, ''))
  }
  const check = () => {
    if (entry === '') return
    const correct = Number(entry) === answer
    onResult?.(correct)
    if (correct) win()
    else {
      setShake(true)
      setTimeout(() => setShake(false), 420)
      setTimeout(() => setPhase('recover'), 260)
    }
  }
  const win = () => {
    setPhase('correct')
    onPetReact?.()
    // The AWARD rides a plain timer so it can never be lost — rAF starves in
    // hidden/throttled windows (iOS low-power, background tabs), and the gem
    // must land even if the flight animation doesn't get a frame.
    setTimeout(() => onAward?.(1), 620)
    requestAnimationFrame(() => {
      const card = cardRef.current, hud = hudGemRef && hudGemRef.current
      if (!card || !hud) return
      const c = card.getBoundingClientRect(), h = hud.getBoundingClientRect()
      const from = { x: c.left + c.width / 2, y: c.top + c.height * 0.42 }
      const to = { x: h.left + h.width / 2, y: h.top + h.height / 2 }
      setFlyGems([0, 1, 2].map((i) => ({ id: Date.now() + i, from, to, delay: i * 90 })))
      setTimeout(() => setFlyGems([]), 1200)
    })
  }
  const backToAsk = () => { setEntry(''); setPhase('ask') }

  useKeyInput(onKey)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* scrim — the world (and companions) softly recede into focus mode */}
      <div onClick={phase === 'ask' ? () => onClose(false) : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(50,42,80,.44)', backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)', animation: 'scrimIn .25s ease-out both' }} />
      {flyGems.map((g) => <FlyGem key={g.id} {...g} />)}

      <div ref={cardRef} className={shake ? 'shakeit' : ''}
        style={{ position: 'relative', width: 'min(520px,100%)', maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto', background: '#fff', borderRadius: T.radius,
          boxShadow: '0 24px 60px rgba(40,30,70,.28)', padding: '0 0 26px',
          animation: phase === 'correct' ? '' : 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>

        {/* skin banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px',
          background: `linear-gradient(180deg,${skin.accent}14,#fff)`, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{skin.paw}</span>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: skin.accent }}>{skin.tag}</span>
          <div style={{ flex: 1 }} />
          {phase === 'ask' && (
            <button onClick={() => onClose(false)} aria-label="close"
              style={{ border: 'none', background: '#f2f2f2', width: 32, height: 32, borderRadius: '50%',
                cursor: 'pointer', color: T.ink3, fontSize: 16, lineHeight: 1 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '22px 26px 4px' }}>
          {phase === 'ask' && <AskState skin={skin} problem={problem} entry={entry} onKey={onKey} />}
          {phase === 'correct' && <CorrectState skin={skin} onNext={() => onClose(true)} />}
          {phase === 'recover' && (
            <div style={{ paddingBottom: 6 }}>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.ink }}>Let's look at one together 💡</div>
                <div style={{ fontSize: 15, color: T.ink3, marginTop: 4 }}>No worries — follow the steps, then give it another go.</div>
              </div>
              <WorkedExample problem={problem} onBack={backToAsk} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AskState({ skin, problem, entry, onKey }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500, color: T.ink3 }}>{skin.ask}</div>
      <EquationRow a={problem.a} op={problem.op} b={problem.b} entry={entry} />
      <Keypad onKey={onKey} />
      <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9a92ac', fontWeight: 500, marginTop: 2 }}>
        Type your answer, then tap Check
      </div>
    </div>
  )
}

function CorrectState({ skin, onNext }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      padding: '8px 0 2px', animation: 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
      <Sparkles colors={['#fff', skin.accent, T.blueSubtle, T.tealLt]} n={16} />
      <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `${skin.accent}22`,
          animation: 'ringpulse 1.4s ease-out infinite' }} />
        <Gem size={72} style={{ animation: 'gemSpin .5s ease-out both', filter: 'drop-shadow(0 6px 14px rgba(46,197,197,.4))' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: T.ink }}>Nice work!</div>
        <div style={{ fontSize: 16, color: T.ink3, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          {skin.win} <span>+1</span> <Gem size={18} />
        </div>
      </div>
      <BigButton tone="blue" onClick={onNext} style={{ marginTop: 6, minWidth: 180 }}>Keep going ✨</BigButton>
    </div>
  )
}
