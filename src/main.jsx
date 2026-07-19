import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initStore } from './store.js'
import './index.css'

/*
 * The boot gate (Phase A, docs/accounts-boot-gate.md): <App> mounts only
 * after initStore() settles, so every consumer's synchronous store call is
 * guaranteed a hydrated state — the async-ness never leaks past this file.
 * With the local backend it settles in a microtask; the cover below matches
 * the page background and only shows its shimmer after 350ms, so a fast boot
 * renders nothing visible at all. The cloud boot is bounded by the store's
 * 4s read timeout, after which she plays on the local save regardless.
 */
function Boot() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    let on = true
    initStore().then(() => on && setReady(true)) // memoized — StrictMode-safe
    return () => {
      on = false
    }
  }, [])
  if (!ready)
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
  return <App />
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
