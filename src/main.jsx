import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

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
      <App />
    </Oops>
  </React.StrictMode>,
)
