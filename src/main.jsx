import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initStore } from './store.js'
import { localBackend, supabaseBackend } from './backend.js'
import { getSessionOnce, onAuthChange, sendMagicLink } from './auth.js'
import './index.css'

/*
 * Backend choice (Phase A2, docs/accounts-boot-gate.md): production is the
 * hard sign-in wall — exactly two accounts, cloud sync is the whole point
 * (DECIDED: no guest mode; the one-line flip lives on the SignIn screen if
 * that ever changes). Dev stays on the local backend so pane QA and offline
 * hacking need no session — `?cloud` in the URL exercises the real flow.
 */
const CLOUD =
  import.meta.env.PROD || new URLSearchParams(window.location.search).has('cloud')

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
        if (session) enter()
        else {
          setPhase('signin')
          // Leave the SignIn screen the moment a magic link is redeemed —
          // including the redeem happening in this very tab (URL-hash tokens).
          unsub = onAuthChange((s) => s && enter())
        }
      })
    return () => {
      on = false
      unsub?.()
    }
  }, [])
  if (phase === 'ready') return <App cloud={CLOUD} />
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
          <h1 style={si.head}>Check your email!</h1>
          <p style={si.sub}>
            Tap the link inside and your world will open all by itself ✨
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
        <h1 style={si.head}>Ask Mum to open your world</h1>
        <p style={si.sub}>Your world is safe in the cloud — a grown-up sends the magic key.</p>
        <input
          style={si.input}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          placeholder="grown-up's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button style={{ ...si.btn, opacity: state === 'sending' ? 0.6 : 1 }} onPointerDown={send}>
          {state === 'sending' ? 'Sending…' : 'Send the magic key ✉️'}
        </button>
        {state === 'error' && (
          <div style={si.note}>Hmm, that key didn’t fly — check the email and try again 💜</div>
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Oops>
      <Boot />
    </Oops>
  </React.StrictMode>,
)
