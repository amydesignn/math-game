/*
 * hudkit.jsx — shared HUD chrome.
 *
 * Lifted out of Door.jsx so the hub AND the in-world HUD render the SAME gem
 * and profile marks from ONE source — a player can never see two different
 * diamonds or two different avatars for one game. Same move as mathkit.jsx
 * (shared math atoms) — shared modules, not copies (Oscar's house rule).
 */

/* Gem — Amy's exact cut-diamond w/ white "+" (Math version 3.svg), tight viewBox.
   The single gem in the app; Door.jsx and the in-world level bar both import it. */
export function GemIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="18 25.5 60 60" fill="none" aria-hidden="true">
      <path d="M30 33H66L57 45H39L30 33Z" fill="#A5F3FC" />
      <path d="M30 33L39 45H21L30 33Z" fill="#22D3EE" />
      <path d="M66 33L57 45H75L66 33Z" fill="#22D3EE" />
      <path d="M21 45H39L48 78L21 45Z" fill="#0E7490" />
      <path d="M39 45H57L48 78L39 45Z" fill="#0891B2" />
      <path d="M57 45H75L48 78L57 45Z" fill="#0E7490" />
      <g opacity="0.92" fill="#fff">
        <rect x="42" y="37.65" width="12" height="2.85" rx="1.425" />
        <rect x="46.575" y="33" width="2.85" height="12" rx="1.425" />
      </g>
    </svg>
  )
}

/* Profile — the soft avatar chip (settings will live inside it later). It carries
   its OWN lavender radial fill + white ring, so it reads on the Door's white
   header AND floating over the 3D world. Decorative for now, same as the Door. */
export function ProfileChip({ size = 44 }) {
  return (
    <span
      role="button"
      aria-label="Profile"
      title="Profile"
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: '50%',
        boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #E7DEFA',
        background: 'radial-gradient(120% 120% at 30% 25%, #EFE9FD, #A78BFA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.5),
      }}
    >
      🙂
    </span>
  )
}
