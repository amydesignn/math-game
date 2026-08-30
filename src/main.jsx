import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import { initStore } from './store.js'
import { localBackend, supabaseBackend } from './backend.js'
import { getSessionOnce, onAuthChange, sendMagicLink } from './auth.js'
import DivisionWalkthrough from './ui/DivisionWalkthrough.jsx'
import { Modal } from './ui/mathkit.jsx'
import SignupModal, { SavedToast } from './ui/SignupModal.jsx'
import { SettingsSheet, ProfilePopover } from './ui/Settings.jsx'
import { GemIcon } from './ui/hudkit.jsx'
import './index.css'

/*
 * Backend choice (public release scope, Amy 2026-07-31): the public gets the
 * hub straight away — New + Guest, localStorage only, no sign-in wall. Account
 * is opt-in via `?account` (the two family accounts today; it rolls out to new
 * users later, at which point the sign-in becomes a visible affordance). The
 * account code is fully intact — this is a promotion switch, not a removal.
 *   guest   → default: local backend, no wall, lands on the Door.
 *   account → `?account` (or `?cloud` for dev): the Supabase sign-in wall.
 * Guest never touches the cloud, so the two family cloud saves stay untouched;
 * signing in via ?account reconciles local vs cloud by the monotonic ledger.
 */
const params = new URLSearchParams(window.location.search)
/*
 * Account mode is entered by ?account (or ?cloud in dev) — but ALSO when a
 * magic link is redeeming (its tokens ride in the URL hash) and when this
 * device has signed in before. Without those two, the guest-first boot never
 * constructs the auth client, so a magic link redeeming on the bare origin
 * (emailRedirectTo carries no ?account) is silently dropped — the device
 * "signs in" yet boots the empty guest world. That is exactly the bug Ivy hit
 * 2026-08-01, and this restores auth.js's stated intent: "sign in once per
 * device and never see a login screen again."
 */
const REDEEMING = window.location.hash.includes('access_token')
const REMEMBERED = (() => {
  try {
    // 'luxi.account' is the key going forward. 'lumio.account' is read as a
    // TRANSITIONAL fallback so a device already remembered on the old
    // math.lumio.land origin stays signed in until the lumio.land → luxi.land
    // redirect settles (no repeat of Ivy's guest-world drop). Safe to delete the
    // lumio fallback in a later cleanup once the redirect has been live a while.
    return (
      localStorage.getItem('luxi.account') === '1' ||
      localStorage.getItem('lumio.account') === '1'
    )
  } catch {
    return false
  }
})()
const CLOUD = params.has('account') || params.has('cloud') || REDEEMING || REMEMBERED

// Mark this device as an account device (set ONLY on a confirmed session), so
// future visits to the bare bookmark open straight into her cloud world.
function rememberAccount() {
  try {
    localStorage.setItem('luxi.account', '1')
  } catch {
    /* private mode — nothing to persist */
  }
}

/*
 * The boot gate: <App> mounts only after initStore() settles, so every
 * consumer's synchronous store call is guaranteed a hydrated state — the
 * async-ness never leaks past this file. Local boots settle in a microtask
 * (the cover's shimmer waits 350ms, so they render nothing visible); cloud
 * boots are bounded by the store's 4s read timeout, after which she plays
 * on the local save regardless.
 */
function Boot() {
  const [phase, setPhase] = React.useState('boot') // boot | signin | ready
  React.useEffect(() => {
    let on = true
    let unsub = null
    const enter = () =>
      initStore(CLOUD ? supabaseBackend() : localBackend()).then(
        () => on && setPhase('ready'),
      )
    if (!CLOUD) enter()
    else
      getSessionOnce().then((session) => {
        if (!on) return
        if (session) {
          rememberAccount()
          enter()
        } else {
          setPhase('signin')
          // Leave the SignIn screen the moment a magic link is redeemed —
          // including the redeem happening in this very tab (URL-hash tokens).
          unsub = onAuthChange((s) => {
            if (s) {
              rememberAccount()
              enter()
            }
          })
        }
      })
    return () => {
      on = false
      unsub?.()
    }
  }, [])
  // justSignedIn: this boot is a magic-link redeem → App shows the "progress saved"
  // toast once. REDEEMING is read at module load (hash still present); the URL is
  // cleaned right after, so a later reload passes false.
  if (phase === 'ready') return <App cloud={CLOUD} justSignedIn={REDEEMING} />
  if (phase === 'signin') return <SignIn />
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--lilac-50)' }}>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 40,
          opacity: 0,
          animation: 'bootshimmer 1.1s ease 0.35s infinite alternate',
        }}
      >
        ✨
      </span>
    </div>
  )
}

/*
 * The signed-out screen — deliberately NOT an error tone (this is also the
 * accidental-logout screen: cleared site data, iOS storage reclaim). A
 * grown-up types the email; the magic link lands in Amy's inbox either way.
 * Functional build on house tokens — Oscar reskin welcome later, same as
 * the shop's first pass.
 */
const si = {
  cover: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--lilac-50)',
    padding: 20,
  },
  card: {
    width: 'min(400px, 92vw)',
    background: '#fff',
    borderRadius: 26,
    boxShadow: '0 18px 50px rgba(43,32,90,0.18)',
    padding: '30px 26px 26px',
    textAlign: 'center',
    fontFamily: 'inherit',
  },
  big: { fontSize: 44, lineHeight: 1 },
  head: { margin: '12px 0 6px', fontSize: 21, fontWeight: 800, color: '#262626' },
  sub: { margin: 0, fontSize: 14.5, fontWeight: 600, color: 'var(--brand-lilac-900)', lineHeight: 1.45 },
  input: {
    width: '100%',
    marginTop: 18,
    height: 48,
    borderRadius: 14,
    border: '2px solid #E6E6E6',
    outline: 'none',
    padding: '0 14px',
    fontSize: 16,
    fontWeight: 600,
    color: '#262626',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    marginTop: 12,
    height: 50,
    borderRadius: 14,
    border: 'none',
    background: '#2D6DF6',
    color: '#fff',
    fontSize: 16.5,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 6px 0 #0946CA',
  },
  note: { marginTop: 12, fontSize: 13.5, fontWeight: 700, color: '#D97706' },
  again: {
    marginTop: 14,
    display: 'inline-block',
    fontSize: 13.5,
    fontWeight: 700,
    color: 'var(--brand-iris-600)',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}

function SignIn() {
  const [email, setEmail] = React.useState('')
  const [state, setState] = React.useState('idle') // idle | sending | sent | error
  const send = async () => {
    if (!email.trim() || state === 'sending') return
    setState('sending')
    try {
      await sendMagicLink(email)
      setState('sent')
    } catch {
      setState('error') // generic on purpose — the allowlist never leaks
    }
  }
  if (state === 'sent')
    return (
      <div style={si.cover}>
        <div style={si.card}>
          <div style={si.big}>📬</div>
          <h1 style={si.head}>Check your inbox</h1>
          <p style={si.sub}>
            Tap the link inside and your world opens right up ✨
          </p>
          <span style={si.again} onPointerDown={() => setState('idle')}>
            Send it again
          </span>
        </div>
      </div>
    )
  return (
    <div style={si.cover}>
      <div style={si.card}>
        <div style={si.big}>💜</div>
        <h1 style={si.head}>Open your world</h1>
        <p style={si.sub}>Enter your email and we’ll send you a link to sign in — no password needed.</p>
        <input
          style={si.input}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button style={{ ...si.btn, opacity: state === 'sending' ? 0.6 : 1 }} onPointerDown={send}>
          {state === 'sending' ? 'Sending…' : 'Send my link'}
        </button>
        {state === 'error' && (
          <div style={si.note}>That didn’t send — check the email and try again.</div>
        )}
      </div>
    </div>
  )
}

/*
 * Friendly crash screen — if anything ever throws, Ivy gets a tap-to-reload
 * card instead of a blank page (her world is safe in localStorage either way).
 */
class Oops extends React.Component {
  state = { broken: false }
  static getDerivedStateFromError() {
    return { broken: true }
  }
  render() {
    if (!this.state.broken) return this.props.children
    return (
      <div
        onPointerDown={() => window.location.reload()}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: 'var(--lilac-50)',
          color: 'var(--brand-iris-900)',
          fontWeight: 700,
          fontSize: 20,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 44 }}>🙀</span>
        Oops, the world hiccupped!
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--brand-lilac-900)' }}>
          Tap anywhere to reload — your world is safe ✨
        </span>
      </div>
    )
  }
}

/*
 * Dev-only preview harness for the C2 division walkthrough (Oscar's lift):
 * open `/?divdemo` (add `&ex=85` for the simpler 85 ÷ 4). It mounts the
 * walkthrough in the house <Modal>, exactly the frame it wears in the game.
 * `import.meta.env.DEV` guards it, so it's dead-code-eliminated from prod.
 */
function DivDemo() {
  const p = new URLSearchParams(window.location.search)
  const ex = p.get('ex') === '85' ? { a: 85, b: 4 } : { a: 815, b: 4 }
  const [done, setDone] = React.useState(0)
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#c8c0da' }}>
      <Modal label="Division walkthrough (dev preview)" cardStyle={{ padding: 0 }}>
        <DivisionWalkthrough key={`${ex.a}-${done}`} problem={ex} onDone={() => setDone((d) => d + 1)} />
      </Modal>
    </div>
  )
}
const DEV_DEMO =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('divdemo')

/*
 * Dev-only preview for the Save-Your-Progress signup surfaces (Oscar's lift):
 * open `/?signupdemo`. A faux game backdrop + a control bar to flip entry
 * (form / guest), simulate a failing send, and fire the success toast. The
 * real onSend is wired at integration (Settings account row); here it's a
 * 1.2s stub. DEV-guarded → dead-code-eliminated from prod.
 */
function SignupDemo() {
  const [entry, setEntry] = React.useState('form')
  const [fail, setFail] = React.useState(false)
  const [toast, setToast] = React.useState(false)
  const [open, setOpen] = React.useState(true)
  const [k, setK] = React.useState(0) // remount to reset the modal's internal phase
  const onSend = () =>
    new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error('demo')) : res(true)), 1200))
  const reopen = (e) => {
    setEntry(e)
    setOpen(true)
    setK((n) => n + 1)
  }
  const bar = { padding: '6px 12px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(120% 90% at 20% 0%, #cdeccb, #a9d3a6)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          background: 'rgba(255,255,255,.9)',
          borderRadius: 999,
          padding: '8px 12px',
          boxShadow: '0 6px 18px rgba(0,0,0,.15)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.07em', color: '#8A7FB8' }}>DEMO</span>
        <button style={{ ...bar, background: '#4B54DD', color: '#fff' }} onClick={() => reopen('form')}>
          Modal
        </button>
        <button style={{ ...bar, background: '#EDE7FC', color: '#4B54DD' }} onClick={() => reopen('guest')}>
          Guest popup
        </button>
        <button style={{ ...bar, background: fail ? '#FB2C36' : '#EDEBF2', color: fail ? '#fff' : '#6e6e6e' }} onClick={() => setFail((f) => !f)}>
          {fail ? 'send: FAIL' : 'send: ok'}
        </button>
        <button style={{ ...bar, background: '#DCFCE7', color: '#00A63E' }} onClick={() => setToast(true)}>
          Success toast
        </button>
      </div>
      {open && (
        <SignupModal key={k} entry={entry} onSend={onSend} onClose={() => setOpen(false)} />
      )}
      {toast && <SavedToast onDone={() => setToast(false)} />}
    </div>
  )
}
const SIGNUP_DEMO =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('signupdemo')

/*
 * Dev-only preview for the Settings gear + Profile lift: `/?settingsdemo`.
 * Faux Door / in-game chrome with the emoji gear (Amy's chrome call) + a
 * surface/auth toggle bar, so both anchors + both sign-in states are viewable.
 * DEV-guarded → stripped from prod.
 */
function SettingsDemo() {
  const [surface, setSurface] = React.useState('door')
  const [signedIn, setSignedIn] = React.useState(false)
  const [sound, setSound] = React.useState(true)
  const [view, setView] = React.useState('none') // none | settings | profile
  const auth = { signedIn, email: 'ivy@email.com', initial: 'I' }
  const isDoor = surface === 'door'
  const chip = (on) => ({
    border: 'none',
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    background: on ? '#4B54DD' : 'transparent',
    color: on ? '#fff' : '#6e6e6e',
  })
  const gearBtnDoor = { width: 44, height: 44, borderRadius: '50%', border: 'none', background: view === 'settings' ? '#E7DEFA' : '#F1ECFE', cursor: 'pointer', fontSize: 20, lineHeight: 1 }
  const railBtn = { width: 50, height: 50, borderRadius: '50%', border: 'none', background: '#fff', boxShadow: '0 4px 14px rgba(50,38,80,.16)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }
  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: "'Inter', system-ui, sans-serif", background: isDoor ? 'linear-gradient(180deg,#F6F3FD,#EEE9F8)' : 'radial-gradient(130% 120% at 50% 30%,#C9D8B6,#B7C9A6 70%,#AEC29C)' }}>
      {/* faux chrome */}
      {isDoor ? (
        <div style={{ height: 64, background: '#fff', boxShadow: '0 1px 0 rgba(74,54,110,.07),0 3px 14px rgba(74,54,110,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GemIcon size={26} />
            <span style={{ fontSize: 20, fontWeight: 600, color: '#4B54DD' }}>Luxi Math</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button aria-label="Profile" onClick={() => setView('profile')} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#F1ECFE', boxShadow: '0 0 0 2px #fff,0 0 0 3.5px #E7DEFA', cursor: 'pointer', fontSize: 20 }}>
              {signedIn ? '🅸' : '🙂'}
            </button>
            <button aria-label="Settings" onClick={() => setView('settings')} style={gearBtnDoor}>
              ⚙️
            </button>
          </span>
        </div>
      ) : (
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 44, background: '#fff', borderRadius: 999, padding: '0 18px 0 14px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(50,38,80,.16)', color: '#3B3266', fontWeight: 700 }}>‹ Exit</div>
          <button aria-label="Shop" style={railBtn}>🛍️</button>
          <button aria-label="Settings" onClick={() => setView('settings')} style={railBtn}>⚙️</button>
        </div>
      )}

      {/* control bar */}
      <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.92)', borderRadius: 999, padding: '8px 12px', boxShadow: '0 6px 18px rgba(50,38,80,.16)' }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.07em', color: '#8A7FB8' }}>DEMO</span>
        <span style={{ display: 'flex', gap: 4, background: '#F1ECF8', borderRadius: 999, padding: 4 }}>
          <button style={chip(isDoor)} onClick={() => { setSurface('door'); setView('none') }}>Door</button>
          <button style={chip(!isDoor)} onClick={() => { setSurface('game'); setView('none') }}>In-game</button>
        </span>
        <span style={{ display: 'flex', gap: 4, background: '#F1ECF8', borderRadius: 999, padding: 4 }}>
          <button style={chip(!signedIn)} onClick={() => setSignedIn(false)}>Guest</button>
          <button style={chip(signedIn)} onClick={() => setSignedIn(true)}>Account</button>
        </span>
      </div>

      {view === 'settings' && (
        <SettingsSheet surface={surface} auth={auth} sound={sound} onToggleSound={setSound} onOpenSignup={() => alert('→ opens SignupModal')} onSignOut={() => setSignedIn(false)} onClose={() => setView('none')} />
      )}
      {view === 'profile' && <ProfilePopover auth={auth} onUploadAvatar={() => alert('→ upload avatar')} onClose={() => setView('none')} />}
    </div>
  )
}
const SETTINGS_DEMO =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('settingsdemo')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Oops>
      {DEV_DEMO ? <DivDemo /> : SIGNUP_DEMO ? <SignupDemo /> : SETTINGS_DEMO ? <SettingsDemo /> : <Boot />}
    </Oops>
    {/* Cookieless, privacy-friendly traffic counting (no personal data, no
      * consent banner needed) — the whole point of moving to a real domain. */}
    <Analytics />
  </React.StrictMode>,
)
