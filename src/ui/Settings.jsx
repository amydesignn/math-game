/*
 * Settings.jsx — the shared Settings sheet + the Door-only Profile popover.
 * Lifted from Oscar's comp (~/Downloads/Luxi Settings Gear + Profile …, 2026-08-30),
 * built to Nathan's brief (2026-08-30) + Amy's calls.
 *
 * ARCHITECTURE: ONE <SettingsSheet> mounts on BOTH the Door and the in-world
 * screen — identical menu, only the anchor differs (Door drops from the top-right
 * gear, in-game springs from the left rail). Account/sign-up lives INSIDE Settings
 * on purpose (it's a conversion entry — reachable everywhere, never hunted for);
 * only the Account row changes by sign-in state. <ProfilePopover> is Door-only
 * (personalization / avatar upload) — never in the world.
 *
 * The gear + profile BUTTONS are added inline in Door.jsx / App.jsx so each matches
 * its surface's own chrome (Amy: chrome icons match the Door's existing button look
 * — emoji ⚙️/🙂, not Oscar's stroke gear). Oscar's clean line-icons are kept for the
 * rows INSIDE the sheet (the settings-menu idiom). Account row uses the house GemIcon.
 *
 * Amy's calls folded in: Feedback + Help "SOON" rows DROPPED (hidden until they ship,
 * not shown disabled). The Account row opens the shared <SignupModal> (onOpenSignup).
 * 2026-09-19: Send Feedback SHIPPED — the row is back, live (onOpenFeedback →
 * <FeedbackModal>, Oscar's Feedback Flow comp). Help stays hidden.
 *
 * Governance (Amy 2026-08-30): 4px grid — sheet radius 20, rows 44–48, toggle 48×28
 * (knob 24), gaps 4/8/12/16, padding 16/20/24. Colours are Oscar's comp values.
 */
import { useRef, useState } from 'react'
import { GemIcon } from './hudkit.jsx'
import { fileToAvatar } from '../avatar.js'

const IRIS = '#4B54DD',
  LILAC700 = '#5B44C4'

// ── Oscar's line-icons (kept for the sheet's internal rows) ────────────────
const strokeBase = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
function Speaker() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...strokeBase} aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.8 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}
function HelpCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...strokeBase} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.4-2.6 2.4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
function MessageBubble() {
  // Oscar's feedback icon (Luxi Feedback Flow comp, 2026-08-31)
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...strokeBase} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  )
}
function ChevronR() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7FB8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...strokeBase} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  )
}

const scrimStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(47,38,83,.28)',
  animation: 'scrimIn .2s ease-out both',
  zIndex: 55,
}
const closeBtn = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(94,75,158,.08)',
  cursor: 'pointer',
  color: '#6e6e6e',
  fontSize: 15,
}
const sectionLabel = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.08em',
  color: '#9a92ac',
  textTransform: 'uppercase',
  padding: '0 4px 8px',
}
const rowIcon = { color: LILAC700, display: 'flex' }

/**
 * The shared settings sheet. surface: 'door' | 'game' (anchor + animation only).
 * auth: { signedIn, email, initial }. onOpenSignup opens the shared SignupModal.
 */
export function SettingsSheet({ auth = {}, avatar = null, sound = true, onToggleSound, onOpenSignup, onOpenHowTo, onOpenFeedback, onSignOut, privacyHref = '/privacy.html', onClose }) {
  // The gear lives top-right on BOTH surfaces now (Door header + in-world, by the
  // level bar), so the sheet drops from the top-right uniformly.
  const close = () => onClose?.()

  return (
    <>
      <div style={scrimStyle} onClick={close} />
      <div style={{ position: 'fixed', top: 72, right: 16, width: 320, maxWidth: 'calc(100vw - 32px)', zIndex: 56, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #ECE7F5',
            boxShadow: '0 24px 60px rgba(50,38,80,.30), 0 4px 16px rgba(50,38,80,.12)',
            overflow: 'hidden',
            animation: 'suSheetIn .28s cubic-bezier(.2,.9,.3,1.1) both',
          }}
        >
          <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#262626' }}>Settings</span>
                <button aria-label="Close" onClick={close} style={closeBtn}>
                  ✕
                </button>
              </div>

              {/* ACCOUNT — guest opens the signup modal; signed-in shows status + sign out */}
              <div style={{ padding: '0 16px 16px' }}>
                {!auth.signedIn ? (
                  <button
                    onClick={() => {
                      close()
                      onOpenSignup?.()
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: '#F6F2FF',
                      border: '1.5px solid #EDE7FC',
                      borderRadius: 12,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GemIcon size={20} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#262626' }}>Save your progress</span>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6e6e6e' }}>Sign up or sign in</span>
                    </span>
                    <ChevronR />
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F6F2FF', border: '1.5px solid #EDE7FC', borderRadius: 12, padding: '12px 16px' }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(160deg, #C4B5FD, #8E7BF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : auth.initial || '★'}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#262626' }}>Signed in</span>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6e6e6e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth.email || ''}</span>
                    </span>
                    <button onClick={() => onSignOut?.()} style={{ border: 'none', background: 'transparent', color: IRIS, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 8, borderRadius: 8, whiteSpace: 'nowrap' }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: '#F1ECF8', margin: '0 16px' }} />

              {/* PREFERENCES */}
              <div style={{ padding: '12px 16px 4px' }}>
                <div style={sectionLabel}>Preferences</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 8px', borderRadius: 10 }}>
                  <span style={rowIcon}>
                    <Speaker />
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#262626' }}>Sound</span>
                  <button
                    aria-label="Toggle sound"
                    onClick={() => onToggleSound?.(!sound)}
                    style={{ width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .18s', background: sound ? IRIS : '#D8D2E4' }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: 2, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,.2)', transition: 'transform .18s', transform: 'translateX(' + (sound ? '20px' : '0px') + ')' }} />
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: '#F1ECF8', margin: '8px 16px 0' }} />

              {/* HELP — Send Feedback went LIVE 2026-09-19 (Oscar's Feedback Flow
                  lifted; the row returns exactly where the SOON row once sat).
                  The Help row stays hidden until it ships (Amy's 08-30 call). */}
              <div style={{ padding: '12px 16px 8px' }}>
                <div style={sectionLabel}>Help</div>
                <button
                  onClick={() => onOpenHowTo?.()}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={rowIcon}>
                    <HelpCircle />
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#262626' }}>How to Play</span>
                  <ChevronR />
                </button>
                <button
                  onClick={() => {
                    close()
                    onOpenFeedback?.()
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={rowIcon}>
                    <MessageBubble />
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#262626' }}>Send Feedback</span>
                  <ChevronR />
                </button>
              </div>

              <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1ECF8' }}>
                <a href={privacyHref} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: '#8A7FB8' }}>
                  Privacy Policy
                </a>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#c3bcd0', whiteSpace: 'nowrap' }}>Luxi Math</span>
              </div>
            </div>
        </div>
      </div>
    </>
  )
}

/**
 * Profile popover — Door only. Personalization (avatar) — account controls live
 * in the gear, cross-referenced in the caption.
 *
 * The photo is ON-DEVICE ONLY (Amy 2026-09-20, the "we'll talk first" gate): the
 * OS picker hands us a File, avatar.js re-encodes it to a small EXIF-stripped
 * JPEG data URL, and onUploadAvatar persists that in the store's localStorage.
 * Nothing is uploaded — a child's photo is personal information under COPPA and
 * we transmit none of it. `avatar` is the current data URL (or null).
 */
export function ProfilePopover({ auth = {}, avatar = null, onUploadAvatar, onRemoveAvatar, onClose }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const fileRef = useRef(null)
  const close = () => onClose?.()
  const pick = () => fileRef.current?.click()

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // let her re-pick the same file (onChange won't fire twice otherwise)
    if (!file) return
    setErr(null)
    setBusy(true)
    try {
      const dataUrl = await fileToAvatar(file) // decode → crop → EXIF-stripped JPEG, all local
      onUploadAvatar?.(dataUrl)
    } catch {
      setErr("Hmm, that photo wouldn't open. Try another one? ✨")
    } finally {
      setBusy(false)
    }
  }

  const caption = err
    ? err
    : busy
      ? 'Adding your photo…'
      : 'Your photo stays on this device. Account settings live in the gear ⚙️.'

  return (
    <>
      <div style={scrimStyle} onClick={close} />
      <div style={{ position: 'fixed', top: 72, right: 60, width: 288, maxWidth: 'calc(100vw - 32px)', zIndex: 56, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #ECE7F5', boxShadow: '0 24px 60px rgba(50,38,80,.30)', overflow: 'hidden', animation: 'suSheetIn .28s cubic-bezier(.2,.9,.3,1.1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#262626' }}>Profile</span>
            <button aria-label="Close" onClick={close} style={closeBtn}>
              ✕
            </button>
          </div>
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#F1ECFE', boxShadow: '0 0 0 3px #fff, 0 0 0 5px #E7DEFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, overflow: 'hidden' }}>
              {avatar ? (
                <img src={avatar} alt="Your avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : auth.signedIn ? (
                <span style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #C4B5FD, #8E7BF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 38 }}>
                  {auth.initial || '★'}
                </span>
              ) : (
                <span>🙂</span>
              )}
            </div>

            {/* Hidden native picker — accept=image/* offers Photo Library / Take
                Photo / Choose File on iPad. The result never leaves avatar.js. */}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />

            <button
              onClick={pick}
              disabled={busy}
              style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #E7DEFA', background: '#F6F2FF', color: LILAC700, fontWeight: 700, fontSize: 15, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <UploadIcon />
              {busy ? 'Adding…' : avatar ? 'Change photo' : 'Upload a photo'}
            </button>

            {avatar && !busy && (
              <button
                onClick={() => onRemoveAvatar?.()}
                style={{ border: 'none', background: 'transparent', color: '#8A7FB8', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 4, marginTop: -8 }}
              >
                Remove photo
              </button>
            )}

            <span style={{ fontSize: 12, fontWeight: 500, color: err ? '#B4531F' : '#9a92ac', textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty' }}>
              {caption}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
