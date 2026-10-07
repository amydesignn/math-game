import { useState } from 'react'
import { SHOP, SHOP_CATEGORIES, SIZES, SPARKLE } from '../config'

// display fill for each sparkle swatch (metallics + rainbow read as gradients)
const SWATCH_BG = {
  pink: '#FB64B6',
  blue: '#51A2FF',
  gold: 'linear-gradient(135deg,#FFD230,#E17100)',
  silver: 'linear-gradient(135deg,#F8FAFC,#90A1B9)',
  rainbow: 'linear-gradient(135deg,#FF6467,#FFB900,#00C950,#51A2FF,#C27AFF)',
}

/*
 * The Gem Shop — Phase 3's bottom sheet. Functional Nathan-built UI (house
 * iris/lilac tokens); Oscar reskins it in a later pass if he wants to.
 *
 * Flow: tap a tile → it selects and shows a Buy button → buying closes the
 * shop and hands the item to App, which enters placement mode. "Your things"
 * lists bought-but-unplaced items (e.g. a cancelled placement) to place later.
 */
export default function Shop({ gems, owned, activeSparkle, onBuy, onBuySparkle, onPlaceOwned, onClose }) {
  const [selected, setSelected] = useState(null) // "pack:asset" of the selected tile
  const [magicSel, setMagicSel] = useState(null) // selected sparkle colorId
  const [size, setSize] = useState(1) // ×1/×2/×3 — resets each time the shop opens

  const sheet = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    background: '#ffffff',
    borderRadius: '22px 22px 0 0',
    boxShadow: '0 -8px 30px rgba(43,32,90,0.25)',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 'env(safe-area-inset-bottom)',
  }

  return (
    <>
      {/* scrim — tap outside to close */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,32,90,0.25)' }} onPointerDown={(e) => { e.stopPropagation(); onClose() }} />

      <div style={sheet} role="dialog" aria-modal="true" aria-label="Gem Shop" onPointerDown={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px' }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--color-text-primary)' }}>Gem Shop 🛍️</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>💎 {gems}</div>
            <button aria-label="Close shop" onClick={onClose} style={btnStyle({ w: 36, bg: 'var(--color-background-brand-subtle)', color: 'var(--color-icon-secondary)' })}>✕</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 14px 14px' }}>
          {/* your things — bought, waiting to be placed */}
          {owned.length > 0 && (
            <>
              <SectionLabel>Your things — tap to place</SectionLabel>
              <div style={grid}>
                {owned.map((o) => {
                  const item = SHOP.find((s) => s.asset === o.asset && s.pack === o.pack)
                  return (
                    <button key={o.id} onClick={() => onPlaceOwned(o)} style={tile(true)}>
                      <span style={{ fontSize: 30 }}>{item?.emoji ?? '📦'}</span>
                      <span style={tileName(true)}>
                        {item?.name ?? o.asset}
                        {o.size > 1 && <span style={{ color: 'var(--color-text-brand)', fontWeight: 800 }}> ×{o.size}</span>}
                      </span>
                      <span style={{ ...tilePrice, color: 'var(--color-component-button-link-text-default)' }}>place ✥</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Magic — the sparkle consumable (15-min trail on her character) */}
          <SectionLabel>✨ Magic — a sparkle trail for 15 min</SectionLabel>
          {activeSparkle && (
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-brand)', margin: '0 4px 8px' }}>
              {SPARKLE.colors[activeSparkle.colorId]?.label} sparkle is on ✨ — buy again to refresh it
            </div>
          )}
          <div style={{ ...grid, marginBottom: 6 }}>
            {SPARKLE.order.map((id) => {
              const c = SPARKLE.colors[id]
              const affordable = gems >= c.price
              const isSel = magicSel === id
              return (
                <button
                  key={id}
                  onClick={() => affordable && setMagicSel(isSel ? null : id)}
                  aria-disabled={!affordable || undefined}
                  style={{ ...tile(affordable), outline: isSel ? '3px solid var(--brand-iris-600)' : undefined /* undefined, not 'none' — lets the dialog focus ring show */ }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: SWATCH_BG[id],
                    boxShadow: '0 1px 4px rgba(40,30,70,0.25), inset 0 0 0 1.5px rgba(255,255,255,0.6)',
                    filter: affordable ? 'none' : 'grayscale(0.7)', opacity: affordable ? 1 : 0.5 }} />
                  <span style={tileName(affordable)}>{c.label}</span>
                  {isSel ? (
                    <span
                      onClick={(e) => { e.stopPropagation(); onBuySparkle(id); setMagicSel(null) }}
                      style={{ ...tilePrice, background: 'var(--brand-iris-600)', color: '#fff', borderRadius: 999, padding: '3px 12px', fontWeight: 800 }}
                    >
                      Buy 💎{c.price}
                    </span>
                  ) : (
                    <span style={{ ...tilePrice, color: affordable ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>💎 {c.price} · 15m</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Size — the multiplier IS the price multiplier (Ivy: "it is fun") */}
          <SectionLabel>How big?</SectionLabel>
          <div style={{ display: 'flex', gap: 8, margin: '0 4px 4px' }}>
            {SIZES.map((s) => {
              const on = size === s.size
              return (
                <button
                  key={s.size}
                  onClick={() => { setSize(s.size); setSelected(null) }}
                  style={{
                    flex: 1, padding: '9px 6px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${on ? 'var(--brand-iris-600)' : 'var(--color-component-button-secondary-background-default)'}`,
                    background: on ? 'var(--brand-iris-600)' : 'var(--color-component-button-secondary-background-default)',
                    color: on ? 'var(--color-text-on-brand)' : 'var(--color-component-button-secondary-text-default)',
                    fontWeight: on ? 800 : 600, fontSize: 14,
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          {size > 1 && (
            <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-secondary)', margin: '0 4px 10px' }}>
              {size}× bigger — so everything costs {size}× more ✨
            </div>
          )}

          {/* One shelf per theme */}
          {SHOP_CATEGORIES.map((cat) => {
            const items = SHOP.filter((s) => s.cat === cat.id)
            if (!items.length) return null
            return (
              <div key={cat.id}>
                <SectionLabel>{cat.emoji} {cat.label}</SectionLabel>
                <div style={grid}>
                  {items.map((item) => {
                    const cost = item.price * size
                    const affordable = gems >= cost
                    const key = item.pack + ':' + item.asset
                    const isSel = selected === key
                    return (
                      <button
                        key={key}
                        onClick={() => affordable && setSelected(isSel ? null : key)}
                        aria-disabled={!affordable || undefined}
                        style={{ ...tile(affordable), outline: isSel ? '3px solid var(--brand-iris-600)' : undefined /* undefined, not 'none' — lets the dialog focus ring show */ }}
                      >
                        <span style={{ fontSize: 30, filter: affordable ? 'none' : 'grayscale(1)', opacity: affordable ? 1 : 0.5 }}>{item.emoji}</span>
                        <span style={tileName(affordable)}>{item.name}</span>
                        {isSel ? (
                          <span
                            onClick={(e) => { e.stopPropagation(); onBuy(item, size); setSelected(null) }}
                            style={{ ...tilePrice, background: 'var(--brand-iris-600)', color: '#fff', borderRadius: 999, padding: '3px 12px', fontWeight: 800 }}
                          >
                            Buy 💎{cost}
                          </span>
                        ) : (
                          <span style={{ ...tilePrice, color: affordable ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>💎 {cost}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function SectionLabel({ children }) {
  // the 12 caps eyebrow — was Lilac 900 at .75 (Lilac is decoration only) → Datum text-brand
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--color-text-brand)', margin: '8px 4px 8px' }}>{children}</div>
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
  gap: 10,
}

const tile = (enabled) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '12px 6px 10px',
  background: enabled ? 'var(--lilac-50)' : 'var(--color-background-subtle)',
  border: `2px solid ${enabled ? 'var(--brand-lilac-100)' : 'var(--color-border-default)'}`,
  borderRadius: 16,
  cursor: enabled ? 'pointer' : 'default',
  // no whole-tile opacity: it took the name + price under AA, and she needs to
  // read what she's saving toward. Not-yet-affordable = neutral surface + grey emoji.
  fontFamily: 'inherit',
})

const tileName = (enabled) => ({ fontSize: 14, fontWeight: 500, color: enabled ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' })
const tilePrice = { fontSize: 14, fontWeight: 700 }

function btnStyle({ w, bg, color }) {
  return {
    width: w,
    height: w,
    borderRadius: 999,
    border: 'none',
    background: bg,
    color,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  }
}
