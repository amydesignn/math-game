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
 * Governance (Amy 2026-08-30): 4px grid — card radius 24, input/button 48h, radius 12,
 * padding 24, gaps 8/12/16, card min(400px, 100vw−32).
 *
 * ON DATUM (2026-10-05, same recipe as FeedbackModal + Settings): every colour by Datum
 * NAME (index.css :root), WCAG AA in every state (a11y/signup-modal.audit.mjs). Type =
 * Amy's roles: 20/700 heading · 16 main content (primary) · 14 supporting (secondary) ·
 * 12 caps eyebrow only · buttons 500. Primary = the Luxi 3D button (Iris 500 face /
 * Iris 700 shadow, Datum changelog · Luxi Math · Button). Input = Datum's interactive
 * border trio (rest neutral-500 · hover 600 · focus iris-600). Hover/press/focus live in
 * index.css `.luxiSu-*` (an inline style beats :hover). role="dialog" + aria-modal.
 */
import { useState, useEffect, useRef } from 'react'

const FACE = 'var(--brand-iris-500)', // Luxi 3D button face (white 4.56:1)
  SHADOW = 'var(--brand-iris-700)'
const TYPE = {
  xs: { fontSize: 'var(--text-xs)', lineHeight: 'var(--text-xs--line-height)' },
  sm: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)' },
  base: { fontSize: 'var(--text-base)', lineHeight: 'var(--text-base--line-height)' },
  xl: { fontSize: 'var(--text-xl)', lineHeight: 'var(--text-xl--line-height)' },
}
const W = { normal: 'var(--font-weight-normal)', medium: 'var(--font-weight-medium)', bold: 'var(--font-weight-bold)' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PrivacyLine({ href = '/privacy.html' }) {
  return (
    <div
      style={{
        textAlign: 'center',
        ...TYPE.sm, // 14 supporting (was 12 — 12 is caps eyebrows only)
        color: 'var(--color-text-secondary)', // was #9a92ac (2.9:1)
        fontWeight: W.normal,
        textWrap: 'pretty',
      }}
    >
      We only use a parent&rsquo;s email to save the game.{' '}
      <a href={href} target="_blank" rel="noopener noreferrer" className="luxiSu-link" style={{ fontWeight: W.medium }}>
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
    background: 'color-mix(in srgb, var(--brand-lilac-950) 50%, transparent)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    animation: 'scrimIn .25s ease-out both',
  },
  card: {
    position: 'relative',
    width: '100%',
    background: 'var(--color-background-base)',
    border: '1.5px solid color-mix(in srgb, var(--brand-lilac-950) 10%, transparent)',
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
    background: 'linear-gradient(180deg, var(--brand-lilac-50), var(--color-background-base))',
    borderBottom: '1px solid var(--brand-lilac-100)',
  },
  headerLabel: {
    ...TYPE.xs,
    fontWeight: W.bold,
    letterSpacing: 'var(--tracking-widest)',
    textTransform: 'uppercase',
    color: 'var(--color-text-brand)', // was lilac-700 #6E5BC0
  },
  closeBtn: {
    border: 'none',
    width: 40,
    height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'var(--color-icon-secondary)', // ✕ on lilac-100 (Snack Time close precedent)
    fontSize: 16,
    lineHeight: 1,
  },
  title: { ...TYPE.xl, fontWeight: W.bold, color: 'var(--color-text-primary)', textWrap: 'pretty' }, // 20/700 (was 22/800)
  sub: { ...TYPE.base, fontWeight: W.normal, color: 'var(--color-text-primary)', textWrap: 'pretty' }, // 16 main content (was 15/500 #6e6e6e)
  primary: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    border: 'none',
    ...TYPE.base,
    fontWeight: W.medium, // buttons 500 (was 700)
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: FACE,
    color: 'var(--color-text-on-brand)',
    boxShadow: '0 4px 0 ' + SHADOW,
    cursor: 'pointer',
  },
  primaryDisabled: {
    background: 'var(--color-background-interactive-disabled)', // Datum disabled tokens, not opacity
    color: 'var(--color-text-disabled)',
    boxShadow: '0 4px 0 var(--color-border-disabled)',
    cursor: 'default',
  },
  notNow: {
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    ...TYPE.base,
    fontWeight: W.medium,
    fontFamily: 'inherit',
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
  privacyHref = '/privacy.html',
  onSend,
  onClose,
}) {
  const [phase, setPhase] = useState(entry) // form | sending | check | error | guest
  const [email, setEmail] = useState(defaultEmail)
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
        <div role="dialog" aria-modal="true" aria-labelledby="luxiSu-guest-title" style={{ position: 'relative', width: 'min(360px, calc(100vw - 32px))', flexShrink: 0 }}>
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
            <button aria-label="Close" onClick={dismiss} className="luxiSu-close" style={{ ...S.closeBtn, position: 'absolute', top: 12, right: 12 }}>
              ✕
            </button>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(160deg, var(--brand-lilac-100), var(--brand-iris-100))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                animation: 'floaty 4s ease-in-out infinite',
              }}
            >
              <span aria-hidden="true">💎</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div id="luxiSu-guest-title" style={S.title}>Save your progress</div>
              <div style={S.sub}>
                Ask a parent to make a free account, so your gems and the world you&rsquo;re building stay saved on any device.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
              <button onClick={() => setPhase('form')} className="luxiSu-primary" style={S.primary}>
                Save my progress
              </button>
              <button onClick={dismiss} className="luxiSu-notnow" style={{ ...S.notNow, width: '100%', height: 44 }}>
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
  const btnDisabled = !canSend && !sending // sending keeps the face + spinner (Datum loading = aria-busy, not disabled colours)
  const trimmed = (email || '').trim()
  return (
    <div style={S.overlay}>
      <div style={S.scrim} onClick={dismiss} />
      <div role="dialog" aria-modal="true" aria-labelledby="luxiSu-title" style={{ position: 'relative', width: 'min(400px, calc(100vw - 32px))', flexShrink: 0 }}>
        <div style={S.card}>
          <div style={S.header}>
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>💎</span>
            <span style={S.headerLabel}>Save progress</span>
            <div style={{ flex: 1 }} />
            <button aria-label="Close" onClick={dismiss} className="luxiSu-close" style={S.closeBtn}>
              ✕
            </button>
          </div>

          {bodyForm && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div id="luxiSu-title" style={S.title}>Save your progress</div>
                <div style={S.sub}>Enter a parent&rsquo;s email and we&rsquo;ll send a sign-in link &mdash; no password needed.</div>
              </div>

              {phase === 'error' && (
                <div
                  role="alert"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    background: 'var(--color-status-warning-background)',
                    border: '1px solid var(--color-status-warning-border)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    animation: 'suFadeSlide .3s ease-out both',
                  }}
                >
                  <span aria-hidden="true" style={{ ...TYPE.sm }}>⚠️</span>
                  <span style={{ ...TYPE.sm, fontWeight: W.medium, color: 'var(--color-status-warning-text)', textWrap: 'pretty' }}>
                    That didn&rsquo;t send &mdash; check the email and try again.
                  </span>
                </div>
              )}

              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="parent@email.com"
                value={email}
                disabled={sending}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Parent's email"
                className="luxiSu-input"
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  padding: '0 16px',
                  ...TYPE.base,
                  fontWeight: W.normal,
                  fontFamily: 'inherit',
                  color: 'var(--color-text-primary)',
                  boxSizing: 'border-box',
                }}
              />

              {/* the action pair (Send + Not now) sits together, the privacy note below: same order as the guest popup (Amy) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={submit}
                  disabled={btnDisabled}
                  aria-busy={sending || undefined}
                  className="luxiSu-primary"
                  style={{ ...S.primary, ...(btnDisabled ? S.primaryDisabled : null), ...(sending ? { cursor: 'default' } : null) }}
                >
                  {sending && (
                    <span
                      aria-hidden="true"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '2px solid color-mix(in srgb, var(--color-text-on-brand) 45%, transparent)',
                        borderTopColor: 'var(--color-text-on-brand)',
                        animation: 'suSpin .7s linear infinite',
                      }}
                    />
                  )}
                  <span>{sending ? 'Sending…' : 'Send the link'}</span>
                </button>
                <button onClick={dismiss} className="luxiSu-notnow" style={{ ...S.notNow, width: '100%', height: 44 }}>
                  Not now
                </button>
              </div>

              <PrivacyLine href={privacyHref} />
            </div>
          )}

          {inCheck && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--brand-lilac-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  animation: 'floaty 4s ease-in-out infinite',
                }}
              >
                <span aria-hidden="true">📬</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div id="luxiSu-title" style={S.title}>Check your inbox</div>
                <div style={S.sub}>
                  We sent a link to{' '}
                  <strong style={{ color: 'var(--color-text-primary)', fontWeight: W.bold }}>{canSend ? trimmed : 'your email'}</strong>. Open it to
                  save this game.
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
                  borderTop: '1px solid var(--brand-lilac-100)',
                }}
              >
                <span style={{ ...TYPE.sm, color: 'var(--color-text-secondary)', fontWeight: W.normal }}>Didn&rsquo;t get the email?</span>
                <button
                  onClick={resend}
                  disabled={resendLeft > 0}
                  className="luxiSu-link"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontWeight: W.medium,
                    ...TYPE.sm,
                    fontFamily: 'inherit',
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
          background: 'var(--color-background-base)',
          border: '1.5px solid color-mix(in srgb, var(--brand-lilac-950) 10%, transparent)',
          borderRadius: 16,
          boxShadow: '0 16px 40px rgba(50,38,80,.24)',
          padding: '12px 20px 12px 16px',
          animation: 'suToastIn .4s ease-out both',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-status-success-background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: 'var(--color-status-success-text)', // green-800 (was green-600 #00A63E on green-100)
            fontWeight: W.bold,
            flexShrink: 0,
          }}
        >
          ✓
        </span>
        <span role="status" style={{ ...TYPE.base, fontWeight: W.medium, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
          You&rsquo;re all set &mdash; your progress is saved 💎
        </span>
      </div>
    </div>
  )
}
