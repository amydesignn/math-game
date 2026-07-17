/*
 * The gem — one identity everywhere (HUD counter, shop prices, math rewards).
 * Oscar's comp used a placeholder PNG; in-game the gem IS this SVG.
 */
export default function Gem({ size = 22, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', ...style }}>
      <path d="M6 3h12l4 6-10 12L2 9z" fill="var(--gem-cyan)" />
      <path d="M6 3h12l4 6H2z" fill="#7fe0e0" />
      <path d="M12 21 2 9h20z" fill="#25a8a8" />
    </svg>
  )
}
