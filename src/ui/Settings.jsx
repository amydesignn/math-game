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
 *
 * Governance (Amy 2026-08-30): 4px grid — sheet radius 20, rows 44–48, toggle 48×28
 * (knob 24), gaps 4/8/12/16, padding 16/20/24. Colours are Oscar's comp values.
 */
import { useState } from 'react'
import { GemIcon } from './hudkit.jsx'

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
function ChevronR() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7FB8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
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
export function SettingsSheet({ surface = 'game', auth = {}, sound = true, onToggleSound, onOpenSignup, onSignOut, privacyHref = '#', onClose }) {
  const [view, setView] = useState('menu') // menu | howto
  const isDoor = surface === 'door'
  const anchor = isDoor ? { top: 72, right: 16 } : { top: 16, left: 72 }
  const anim = isDoor ? 'suSheetIn' : 'suSheetInUp'
  const close = () => onClose?.()

  return (
    <>
      <div style={scrimStyle} onClick={close} />
      <div style={{ position: 'fixed', ...anchor, width: 320, maxWidth: 'calc(100vw - 32px)', zIndex: 56, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #ECE7F5',
            boxShadow: '0 24px 60px rgba(50,38,80,.30), 0 4px 16px rgba(50,38,80,.12)',
            overflow: 'hidden',
            animation: anim + ' .28s cubic-bezier(.2,.9,.3,1.1) both',
          }}
        >
          {view === 'menu' && (
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
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(160deg, #C4B5FD, #8E7BF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {auth.initial || '★'}
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

              {/* HELP (Feedback + Help "SOON" rows dropped — hidden until they ship) */}
              <div style={{ padding: '12px 16px 8px' }}>
                <div style={sectionLabel}>Help</div>
                <button
                  onClick={() => setView('howto')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={rowIcon}>
                    <HelpCircle />
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#262626' }}>How to Play</span>
                  <ChevronR />
                </button>
              </div>

              <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1ECF8' }}>
                <a href={privacyHref} style={{ fontSize: 13, fontWeight: 600, color: '#8A7FB8' }}>
                  Privacy Policy
                </a>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#c3bcd0', whiteSpace: 'nowrap' }}>Luxi Math</span>
              </div>
            </div>
          )}

          {view === 'howto' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 12px' }}>
                <button aria-label="Back" onClick={() => setView('menu')} style={{ ...closeBtn, color: LILAC700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BackArrow />
                </button>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#262626' }}>How to Play</span>
              </div>
              <div style={{ padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Explore a world and walk up to the glowing gems to start a math challenge.',
                  'Answer correctly to earn gems and points — points raise your level.',
                  'Spend gems at the shop, then try a new world for a fresh set of stalls.',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#F1ECFE', color: LILAC700, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#4d4d4d', lineHeight: 1.5, paddingTop: 3, textWrap: 'pretty' }}>{step}</span>
                  </div>
                ))}
              </div>
              <div style={{ margin: '12px 16px 16px', padding: '10px 14px', background: '#FFF7EA', border: '1px solid #FBE3B6', borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#8A5300', lineHeight: 1.5, textWrap: 'pretty' }}>
                Placeholder copy — final text is shared with the homepage &ldquo;How it works&rdquo; (Finn/Amy), one source.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Profile popover — Door only. Personalization (avatar) — account controls live
 * in the gear, cross-referenced in the caption.
 */
export function ProfilePopover({ auth = {}, onUploadAvatar, onClose }) {
  const [soon, setSoon] = useState(false)
  const close = () => onClose?.()
  // Avatar upload is deferred (Amy 2026-08-30 — "we'll talk before building it").
  // With no handler wired, the button says so rather than doing nothing.
  const upload = () => (onUploadAvatar ? onUploadAvatar() : setSoon(true))
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
              {auth.signedIn ? (
                <span style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #C4B5FD, #8E7BF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 38 }}>
                  {auth.initial || '★'}
                </span>
              ) : (
                <span>🙂</span>
              )}
            </div>
            <button
              onClick={upload}
              style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #E7DEFA', background: '#F6F2FF', color: LILAC700, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <UploadIcon />
              Upload a photo
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9a92ac', textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty' }}>
              {soon ? 'Photo upload is coming soon ✨' : 'Personalize your avatar. Account settings live in the gear ⚙️.'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
