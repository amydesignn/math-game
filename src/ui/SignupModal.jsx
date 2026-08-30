/*
 * SignupModal.jsx — "Save Your Progress" passwordless magic-link signup.
 * Lifted 1:1 from Oscar's comp (~/Downloads/Luxi Save Your Progress …, 2026-08-30),
 * built to Nathan's brief (2026-08-29) + Amy's calls (2026-08-30). Replaces the
 * old full-screen "Ask Mum…" wall in main.jsx with a dismissible modal over the game.
 *
 * TWO SHIPPED SURFACES (Oscar's DEMO chrome — SEAM cards + state chips — is dropped):
 *   <SignupModal>  — the modal: form · sending · check · error, + the return-visit
 *                    guest popup (entry="guest"). Sign-up == sign-in (one email, one
 *                    link). Error is GENERIC on purpose — never reveal if an account
 *                    exists (mirrors auth.js: "the allowlist never leaks").
 *   <SavedToast>   — the success toast, fired POST-REDIRECT on the game screen once a
 *                    magic link is redeemed (not a modal state — different lifecycle).
 *
 * SEAMS (wired at integration): onSend(email) sends the magic link (throws → error);
 *   onClose() dismisses (✕ / tap-outside / "Not now") — non-destructive, the guest
 *   keeps playing on local progress. Resend re-calls onSend behind a 30s cooldown
 *   (≤ Supabase's own rate limit). The guest→account merge rides main.jsx's existing
 *   redeem path (REDEEMING → cloud boot → monotonic-ledger merge); this component
 *   does not touch the store.
 *
 * Colours are Oscar's exact comp values (iris #4B54DD ≈ --brand-iris-600). Governance
 * (Amy 2026-08-30): 4px grid — card radius 24, input/button 48h, radius 12, padding
 * 24, gaps 8/12/16, card min(400px, 100vw−32).
 */
import { useState, useEffect, useRef } from 'react'

const IRIS = '#4B54DD',
  IRISD = '#3D43BE',
  LILAC200 = '#DDD1F7'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PrivacyLine({ href = '#' }) {
  return (
    <div
      style={{
        textAlign: 'center',
        fontSize: 12,
        color: '#9a92ac',
        fontWeight: 500,
        lineHeight: 1.5,
        textWrap: 'pretty',
      }}
    >
      We only use your email to save your game.{' '}
      <a href={href} style={{ color: '#6E5BC0', fontWeight: 600 }}>
        Privacy Policy
      </a>
    </div>
  )
}

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(47,38,83,.5)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    animation: 'scrimIn .25s ease-out both',
  },
  card: {
    position: 'relative',
    width: '100%',
    background: '#fff',
    border: '1.5px solid rgba(74,54,110,.10)',
    borderRadius: 24,
    boxShadow: '0 24px 60px rgba(50,38,80,.32), 0 4px 16px rgba(50,38,80,.14)',
    overflow: 'hidden',
    animation: 'popIn .28s ease-out both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '16px 24px',
    background: 'linear-gradient(180deg, rgba(110,91,192,.09), #fff)',
    borderBottom: '1px solid #EDE7FC',
  },
  headerLabel: {
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    color: '#6E5BC0',
  },
  closeBtn: {
    border: 'none',
    background: 'rgba(94,75,158,.08)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#6e6e6e',
    fontSize: 16,
    lineHeight: 1,
  },
  title: { fontSize: 22, fontWeight: 800, color: '#262626', lineHeight: 1.2, textWrap: 'pretty' },
  sub: { fontSize: 15, fontWeight: 500, color: '#6e6e6e', lineHeight: 1.45, textWrap: 'pretty' },
  notNow: {
    border: 'none',
    background: 'transparent',
    color: '#6e6e6e',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: 8,
  },
}

/**
 * entry: 'form' (from the Settings account row) | 'guest' (return-visit nudge).
 * onSend(email) → Promise (throws on failure). onClose() dismisses.
 */
export default function SignupModal({
  entry = 'form',
  defaultEmail = '',
  resendSeconds = 30,
  privacyHref = '#',
  onSend,
  onClose,
}) {
  const [phase, setPhase] = useState(entry) // form | sending | check | error | guest
  const [email, setEmail] = useState(defaultEmail)
  const [focused, setFocused] = useState(false)
  const [resendLeft, setResendLeft] = useState(0)
  const iv = useRef(null)

  useEffect(() => () => clearInterval(iv.current), [])

  const canSend = EMAIL_RE.test((email || '').trim())
  const sending = phase === 'sending'
  const bodyForm = phase === 'form' || phase === 'sending' || phase === 'error'

  const startResend = () => {
    clearInterval(iv.current)
    setResendLeft(resendSeconds)
    iv.current = setInterval(() => {
      setResendLeft((n) => {
        if (n <= 1) {
          clearInterval(iv.current)
          return 0
        }
        return n - 1
      })
    }, 1000)
  }

  const submit = async () => {
    if (sending || !canSend) return
    setPhase('sending')
    try {
      await onSend?.((email || '').trim())
      setPhase('check')
      startResend()
    } catch {
      setPhase('error') // generic — never reveal whether the account exists
    }
  }

  const resend = async () => {
    if (resendLeft > 0) return
    try {
      await onSend?.((email || '').trim())
      startResend()
    } catch {
      setPhase('error')
    }
  }

  const dismiss = () => onClose?.()

  // ── Guest popup (return-visit nudge) ─────────────────────────────────────
  if (phase === 'guest') {
    return (
      <div style={S.overlay}>
        <div style={S.scrim} onClick={dismiss} />
        <div style={{ position: 'relative', width: 'min(360px, calc(100vw - 32px))', flexShrink: 0 }}>
          <div
            style={{
              ...S.card,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              textAlign: 'center',
            }}
          >
            <button aria-label="Close" onClick={dismiss} style={{ ...S.closeBtn, position: 'absolute', top: 12, right: 12, width: 36, height: 36, fontSize: 15 }}>
              ✕
            </button>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(160deg, #EDE7FC, #E4E5FA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                animation: 'floaty 4s ease-in-out infinite',
              }}
            >
              💎
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ ...S.title, fontSize: 20 }}>Save your progress</div>
              <div style={{ ...S.sub, lineHeight: 1.5 }}>
                Create a free account to keep your gems and the world you&rsquo;re building &mdash; on any device.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              <button
                onClick={() => setPhase('form')}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                  background: IRIS,
                  color: '#fff',
                  boxShadow: '0 4px 0 ' + IRISD,
                  cursor: 'pointer',
                }}
              >
                Save my progress
              </button>
              <button onClick={dismiss} style={{ ...S.notNow, width: '100%', height: 44, fontSize: 15 }}>
                Not now
              </button>
            </div>
            <PrivacyLine href={privacyHref} />
          </div>
        </div>
      </div>
    )
  }

  // ── Signup modal (form / sending / error / check) ────────────────────────
  const inCheck = phase === 'check'
  const btnDisabled = sending || !canSend
  const trimmed = (email || '').trim()
  return (
    <div style={S.overlay}>
      <div style={S.scrim} onClick={dismiss} />
      <div style={{ position: 'relative', width: 'min(400px, calc(100vw - 32px))', flexShrink: 0 }}>
        <div style={S.card}>
          <div style={S.header}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>💎</span>
            <span style={S.headerLabel}>Save progress</span>
            <div style={{ flex: 1 }} />
            <button aria-label="Close" onClick={dismiss} style={S.closeBtn}>
              ✕
            </button>
          </div>

          {bodyForm && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={S.title}>Save your progress</div>
                <div style={S.sub}>Enter your email and we&rsquo;ll send you a link &mdash; no password needed.</div>
              </div>

              {phase === 'error' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: 12,
                    padding: '12px 16px',
                    animation: 'suFadeSlide .3s ease-out both',
                  }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1.35 }}>⚠️</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#9A3412', lineHeight: 1.4, textWrap: 'pretty' }}>
                    That didn&rsquo;t send &mdash; check the email and try again.
                  </span>
                </div>
              )}

              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                disabled={sending}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  border: '2px solid ' + (focused ? IRIS : LILAC200),
                  outline: 'none',
                  padding: '0 16px',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#262626',
                  background: sending ? '#F6F2FF' : '#fff',
                  boxShadow: focused ? '0 0 0 4px rgba(75,84,221,.15)' : 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color .15s, box-shadow .15s',
                }}
              />

              <button
                onClick={submit}
                disabled={btnDisabled}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: btnDisabled ? '#EDEBF2' : IRIS,
                  color: btnDisabled ? '#b5aec4' : '#fff',
                  boxShadow: btnDisabled ? '0 4px 0 #dcd8e4' : '0 4px 0 ' + IRISD,
                  cursor: btnDisabled ? 'default' : 'pointer',
                }}
              >
                {sending && (
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '2.5px solid rgba(255,255,255,.45)',
                      borderTopColor: '#fff',
                      animation: 'suSpin .7s linear infinite',
                    }}
                  />
                )}
                <span>{sending ? 'Sending…' : 'Send my link'}</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <PrivacyLine href={privacyHref} />
                <button onClick={dismiss} style={S.notNow}>
                  Not now
                </button>
              </div>
            </div>
          )}

          {inCheck && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#F6F2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  animation: 'floaty 4s ease-in-out infinite',
                }}
              >
                📬
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={S.title}>Check your inbox</div>
                <div style={{ ...S.sub, lineHeight: 1.5 }}>
                  We sent a link to{' '}
                  <strong style={{ color: '#262626', fontWeight: 700 }}>{canSend ? trimmed : 'your email'}</strong>. Open it to
                  save your progress.
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                  paddingTop: 16,
                  borderTop: '1px solid #EDE7FC',
                }}
              >
                <span style={{ fontSize: 14, color: '#9a92ac', fontWeight: 500 }}>Didn&rsquo;t get the email?</span>
                <button
                  onClick={resend}
                  disabled={resendLeft > 0}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: resendLeft > 0 ? '#b5aec4' : IRIS,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: resendLeft > 0 ? 'default' : 'pointer',
                    padding: '8px 12px',
                    height: 36,
                    borderRadius: 8,
                  }}
                >
                  {resendLeft > 0 ? 'Resend in ' + resendLeft + 's' : 'Resend'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * The success toast — fired once on the game screen after a magic link is
 * redeemed (post-redirect). Auto-dismisses. Not part of the modal lifecycle.
 */
export function SavedToast({ onDone, duration = 3200 }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), duration)
    return () => clearTimeout(t)
  }, [onDone, duration])
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 108,
        transform: 'translateX(-50%)',
        zIndex: 70,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#fff',
          border: '1.5px solid rgba(74,54,110,.10)',
          borderRadius: 16,
          boxShadow: '0 16px 40px rgba(50,38,80,.24)',
          padding: '12px 20px 12px 16px',
          animation: 'suToastIn .4s ease-out both',
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#00A63E',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          ✓
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#262626', whiteSpace: 'nowrap' }}>
          You&rsquo;re all set &mdash; your progress is saved 💎
        </span>
      </div>
    </div>
  )
}
