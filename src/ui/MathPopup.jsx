import { useRef, useState } from 'react'
import { solve } from '../math'
import { SKINS } from './skins'
import { T, Gem, Sparkles, BigButton, EquationRow, Keypad, WorkedExample, FlyGem, useKeyInput, Modal, ModalClose } from './mathkit'
import DivisionWalkthrough from './DivisionWalkthrough'

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
  // what this problem is worth: her ladder level (Finn's C1 spec L1=1/L2=2/L3=3)
  const pay = problem.gems || 1
  // division (C2) recovers into Oscar's full walkthrough, not the inline grid
  const divRecover = phase === 'recover' && problem.op === '÷'

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
    setTimeout(() => onAward?.(pay), 620)
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

  // division has its own two-field key handling (DivisionAsk); keep this one off ÷
  useKeyInput(onKey, problem.op !== '÷')

  return (
    // The shared shell (mathkit <Modal>, docs/modal-system.md) — the same frame
    // the station and progress popups wear. The scrim doubles as focus mode:
    // the world and her companions softly recede behind it.
    <Modal
      onScrim={phase === 'ask' ? () => onClose(false) : undefined}
      cardRef={cardRef}
      cardClass={shake ? 'shakeit' : ''}
      cardStyle={{ padding: '0 0 26px' }}
      overlay={flyGems.map((g) => <FlyGem key={g.id} {...g} />)}
      animation={phase === 'correct' ? '' : 'popIn .34s cubic-bezier(.2,.9,.3,1.2) both'}
      label={skin.tag}>

        {divRecover ? (
          /* The walkthrough owns its own "Let's share the candy 🍬" header, so the
             skin banner is HIDDEN on the lesson (Amy: the banner belongs on the
             calculation screen, not the instruction) — just a floating ✕ so she
             can always leave (the walkthrough's own buttons only retry/step). */
          <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 3 }}>
            <ModalClose onClick={() => onClose(false)} />
          </div>
        ) : (
          /* skin banner — the family header: scenario tint → white + a 1px divider */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px',
            background: `linear-gradient(180deg,${skin.accent}14,#fff)`, borderBottom: `1px solid ${T.line}` }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{skin.paw}</span>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: skin.accent }}>{skin.tag}</span>
            <div style={{ flex: 1 }} />
            {phase === 'ask' && <ModalClose onClick={() => onClose(false)} />}
          </div>
        )}

        {divRecover ? (
          /* Division recovers into Oscar's full walkthrough (Amy's call,
             2026-08-21): it owns its title, step navigation and "I got it!", so
             it REPLACES the inline WorkedExample + its header and brings its own
             padding (no 22px wrapper). Multiplication/addition keep the compact
             inline recovery below. It teaches a matched `similar` problem (Track
             2's generator will supply one) then she retries hers via onDone. */
          <DivisionWalkthrough problem={problem.similar || problem} onDone={backToAsk} />
        ) : (
          <div style={{ padding: '22px 26px 4px' }}>
            {phase === 'ask' && (problem.op === '÷'
              ? <DivisionAsk problem={problem} skin={skin} onSolved={win} onResult={onResult} onWalkthrough={() => setPhase('recover')} />
              : <AskState skin={skin} problem={problem} entry={entry} onKey={onKey} />)}
            {phase === 'correct' && <CorrectState skin={skin} pay={pay} onNext={() => onClose(true)} />}
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
        )}
    </Modal>
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

function CorrectState({ skin, pay, onNext }) {
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
          {skin.win} <span>+{pay}</span> <Gem size={18} />
        </div>
      </div>
      <BigButton tone="blue" onClick={onNext} style={{ marginTop: 6, minWidth: 180 }}>Keep going ✨</BigButton>
    </div>
  )
}

/* ---- C2 division ask: two-part entry (quotient + remainder) ----
 * Oscar's comp (design_handoff_division_ask_screen), rebuilt on the real shared
 * atoms. A division answer is TWO numbers, so this replaces the single-entry
 * AskState for op === '÷'. Correctness = Number(q)===quotient && Number(r)===
 * remainder — solve() is never used. Decisions (Finn/Oscar/Amy): R is always
 * present (type R 0 on a clean share); Check lives in the keypad, disabled until
 * BOTH fields have a value; NO digit-count auto-advance (it would leak the
 * quotient's length) — the R label lights once the quotient has a digit, focus
 * jumps only at the 3-digit cap; a remainder-only FIRST miss gets one gentle
 * nudge, not the whole walkthrough; "Show me how" opens the walkthrough with no
 * wrong answer recorded. Scenario copy = the existing skin (Amy: don't change the
 * station copy). No berry accent — the banner keeps the skin's accent (Amy). */
const Q_CAP = 3
const R_CAP = 2

function DivisionAsk({ problem, skin, onSolved, onResult, onWalkthrough }) {
  const [q, setQ] = useState('')
  const [r, setR] = useState('')
  const [active, setActive] = useState('q')
  const [nudge, setNudge] = useState(false)
  const [misses, setMisses] = useState(0)
  const [shakeR, setShakeR] = useState(false)

  const check = () => {
    if (q === '' || r === '') return
    const qOk = Number(q) === problem.quotient
    const rOk = Number(r) === problem.remainder
    onResult?.(qOk && rOk) // record every submit, same as multiplication (Amy)
    if (qOk && rOk) return onSolved()
    if (qOk && misses === 0) {
      // remainder-only first miss → keep her share, one warm nudge, refocus R
      setNudge(true); setMisses(1); setR(''); setActive('r')
      setShakeR(true); setTimeout(() => setShakeR(false), 420)
      return
    }
    onWalkthrough() // wrong quotient, or a second miss → the full walkthrough
  }

  const onKey = (k) => {
    if (k === 'del') {
      if (active === 'r') {
        if (r === '') return setActive('q') // empty R → step focus back to the share
        return setR((v) => v.slice(0, -1))
      }
      return setQ((v) => v.slice(0, -1))
    }
    if (k === 'ok') return check()
    if (active === 'q') {
      if (q.length >= Q_CAP) return
      const nq = (q + k).replace(/^0+(?=\d)/, '')
      setQ(nq)
      if (nq.length >= Q_CAP) setActive('r') // jump only AT the cap, never at the answer's length
    } else {
      if (r.length >= R_CAP) return
      setR((v) => (v + k).replace(/^0+(?=\d)/, '')) // a lone 0 survives → "R 0" is typable
    }
  }
  useKeyInput(onKey)

  const ready = q !== '' && r !== ''
  const hint = q === ''
    ? 'Tap her share first — then the leftover.'
    : r === ''
      ? 'Now the leftover. Tap R, then type it — R 0 if none is left.'
      : 'Tap Check when you’re ready.'
  const caretStyle = { display: 'inline-block', width: 3, height: 36, borderRadius: 2, background: T.blue, animation: 'dvCaret 1.1s steps(1) infinite' }
  const box = (f, val) => ({
    height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer',
    fontSize: 40, fontWeight: 700, color: T.blue, fontVariantNumeric: 'tabular-nums', borderStyle: 'solid', borderWidth: 2.5,
    borderColor: val !== '' || active === f ? T.blue : T.blueSubtle,
    background: val !== '' ? T.blueTint : active === f ? '#fff' : '#fafafa',
    boxShadow: active === f ? '0 0 0 4px rgba(45,109,246,.18)' : 'none',
    transition: 'border-color .15s, background .15s, box-shadow .15s',
  })
  const cap = (on) => ({ height: 14, fontSize: 10, fontWeight: 800, letterSpacing: '.05em', color: on ? T.blue : '#a3a3a3' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500, color: T.ink3 }}>{skin.ask}</div>

      {/* a ÷ b = [q] R [r] — two nowrap groups, so a narrow modal drops the answer to its own line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 42, fontWeight: 700, color: T.ink }}>{problem.a}</span>
          <span style={{ fontSize: 32, fontWeight: 600, color: T.ink3 }}>÷</span>
          <span style={{ fontSize: 42, fontWeight: 700, color: T.ink }}>{problem.b}</span>
          <span style={{ fontSize: 32, fontWeight: 600, color: T.ink3 }}>=</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setActive('q')} style={{ ...box('q', q), minWidth: 112, padding: '0 10px' }}>
              {q}{active === 'q' && <span style={caretStyle} />}
            </button>
            <span style={cap(active === 'q')}>EACH SHARE</span>
          </div>
          {/* R label — a real tap target that lights + pulses once the quotient has a digit */}
          <button onClick={() => setActive('r')} aria-label="remainder"
            style={{ height: 64, padding: '0 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 28, fontWeight: 800, lineHeight: 1, borderRadius: 12,
              color: active === 'r' || r !== '' ? T.blue : '#a3a3a3', animation: q !== '' && r === '' && active === 'q' ? 'dvTapMe 1.6s ease-in-out infinite' : 'none' }}>R</button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setActive('r')} style={{ ...box('r', r), width: 74, animation: shakeR ? 'dvShakeCell .4s ease-in-out both' : 'none' }}>
              {r}{active === 'r' && <span style={caretStyle} />}
            </button>
            <span style={cap(active === 'r')}>LEFT OVER</span>
          </div>
        </div>
      </div>

      {nudge && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 14, padding: '11px 14px', animation: 'dvFadeSlide .3s ease-out both' }}>
          <span style={{ fontSize: 16, lineHeight: 1.35 }}>🍬</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#9A3412', lineHeight: 1.4 }}>The share is right! Now look again at what&apos;s <strong style={{ fontWeight: 800 }}>left over</strong>.</span>
        </div>
      )}

      <Keypad onKey={onKey} okDisabled={!ready} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, marginTop: 2 }}>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9a92ac', fontWeight: 500 }}>{hint}</div>
        <button onClick={onWalkthrough}
          style={{ border: 'none', background: 'transparent', color: '#6E5BC0', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', padding: '5px 12px', borderRadius: 10, textDecoration: 'underline', textUnderlineOffset: 3 }}>Show me how 🔎</button>
      </div>
    </div>
  )
}
