import { useState } from 'react'
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

export function BasketButton({ total, onTap, className = '', buttonRef }) {
  return (
    <button
      ref={buttonRef}
      aria-label={`Open your basket — ${total} harvested`}
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
        background: '#ffffff',
        boxShadow: '0 4px 14px rgba(43,32,90,0.18)',
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
            background: 'var(--brand-iris-600)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 800,
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
          background: '#ffffff',
          boxShadow: '0 12px 32px rgba(43,32,90,0.22)',
          transformOrigin: 'bottom left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--brand-iris-700)' }}>Your basket</span>
          <button
            aria-label="Close your basket"
            onClick={onClose}
            style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'var(--brand-lilac-100)', color: 'var(--brand-lilac-900)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          {/* one generic unit, no label (spec: the basket IS the currency icon — "5 🧺") */}
          <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--brand-iris-900)' }}>{total}</span>
          <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>🧺</span>
        </div>

        {rows.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: '12px 0 0', borderTop: '1px solid var(--brand-lilac-100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map(([id, n]) => {
              const k = kindOf(id)
              return (
                <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--neutral-800)' }}>
                  <span style={{ fontSize: 20 }} aria-hidden>{k.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{k.name}</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-iris-900)' }}>× {n}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.45, color: 'var(--neutral-600)' }}>
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
  return (
    <>
      {open && <BasketCard total={total} basket={basket} onClose={() => setOpen(false)} />}
      <BasketButton total={total} className={className} buttonRef={buttonRef} onTap={() => setOpen((o) => !o)} />
    </>
  )
}
