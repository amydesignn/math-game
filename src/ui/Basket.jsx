import { useCallback, useEffect, useRef, useState } from 'react'
import { SEED_KINDS } from '../config'

/*
 * 🧺 The Basket (Grow a Garden ticket 8, Amy's design 2026-10-15): everything
 * she has harvested, kept. A round button at the bottom-left; a tap opens a
 * small card above it — the total (every harvest = one unit, whatever the seed;
 * no unit label, the 🧺 is the icon)
 * and then one line per seed kind. Counts only: nothing personal, and nothing
 * here can be spent yet (the exchange for a rare item is parked in the spec).
 * The numbers come from store.garden.harvests + .basket, which never go down.
 */
const kindOf = (id) => SEED_KINDS[id] || { name: 'Flowers', emoji: '🌼' }

export function BasketButton({ total, onTap, className = '', buttonRef, open = false }) {
  return (
    <button
      ref={buttonRef}
      aria-label={`Open your basket — ${total} harvested`}
      aria-expanded={open}
      aria-controls={open ? 'basket-card' : undefined}
      data-hint="basket"
      className={`hud-basket ${className}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onTap}
      style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left: 16,
        width: 52,
        height: 52,
        borderRadius: 999,
        border: 'none',
        background: 'var(--color-background-base)',
        boxShadow: 'var(--luxi-shadow-basket-button)',
        fontSize: 24,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      🧺
      {total > 0 && (
        // key={total} remounts the chip so the gempop replays on every new harvest
        <span
          key={total}
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 24,
            height: 24,
            padding: '0 8px',
            borderRadius: 999,
            background: 'var(--luxi-color-component-basket-count-background)',
            color: 'var(--luxi-color-component-basket-count-text)',
            fontSize: 'var(--luxi-component-basket-count-font-size)', // Luxi-own token, not Datum's Badge (Amy, 2026-10-20)
            fontWeight: 'var(--luxi-component-basket-count-font-weight)',
            lineHeight: '24px',
            boxSizing: 'border-box',
            animation: 'gempop 0.45s ease-out',
          }}
        >
          {total}
        </span>
      )}
    </button>
  )
}

export function BasketCard({ total, basket, onClose }) {
  const rows = Object.entries(basket).filter(([, n]) => n > 0)
  const closeRef = useRef(null)
  // keyboard: focus lands in the card when it opens; Escape closes it
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <>
      {/* invisible scrim: a tap anywhere else closes the card (and never walks her) */}
      <div
        onPointerDown={(e) => {
          e.stopPropagation()
          onClose()
        }}
        style={{ position: 'absolute', inset: 0 }}
      />
      <div
        id="basket-card"
        role="dialog"
        aria-label="Your basket"
        className="basket-card"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: 16,
          bottom: 'calc(max(20px, env(safe-area-inset-bottom)) + 52px + 12px)',
          width: 'min(288px, calc(100vw - 32px))',
          boxSizing: 'border-box',
          padding: 20,
          borderRadius: 24,
          background: 'var(--color-background-base)',
          boxShadow: 'var(--luxi-shadow-basket-card)',
          transformOrigin: 'bottom left',
          // above the GardenBar: on an iPad held upright (768px) the bar's hint pill
          // reached in over the card's last row. The card is what she just opened.
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* the house 12 caps eyebrow (= the Gem Shop's SectionLabel) */}
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--color-text-brand)' }}>Your basket</span>
          <button
            ref={closeRef}
            aria-label="Close your basket"
            onClick={onClose}
            // the ✕ is a WCAG glyph → neutral icon token, not Lilac (decoration only) — same as the Gem Shop's close
            style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'var(--color-background-brand-subtle)', color: 'var(--color-icon-secondary)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          {/* one generic unit, no label (spec: the basket IS the currency icon — "5 🧺") */}
          <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--color-text-brand)' }}>{total}</span>
          <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>🧺</span>
        </div>

        {rows.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: '12px 0 0', borderTop: '1px solid var(--luxi-color-component-basket-divider)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map(([id, n]) => {
              const k = kindOf(id)
              return (
                <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--color-text-primary)' }}>
                  <span style={{ fontSize: 20 }} aria-hidden>{k.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{k.name}</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-brand)' }}>× {n}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.45, color: 'var(--color-text-secondary)' }}>
            Empty for now. Grow flowers in Sunny Town and pick them to fill it 🌱
          </p>
        )}
      </div>
    </>
  )
}

/** Button + card together, owning the open state. */
export default function Basket({ total, basket, className, buttonRef }) {
  const [open, setOpen] = useState(false)
  const ownRef = useRef(null)
  const btnRef = buttonRef || ownRef
  // closing hands focus back to the button (keyboard users don't get lost)
  const close = useCallback(() => { setOpen(false); btnRef.current?.focus({ preventScroll: true }) }, [btnRef])
  return (
    <>
      {open && <BasketCard total={total} basket={basket} onClose={close} />}
      <BasketButton total={total} open={open} className={className} buttonRef={btnRef} onTap={() => setOpen((o) => !o)} />
    </>
  )
}
