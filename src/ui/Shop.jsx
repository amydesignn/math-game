import { useState } from 'react'
import { SHOP, SPARKLE } from '../config'

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
  const [selected, setSelected] = useState(null) // catalog index
  const [magicSel, setMagicSel] = useState(null) // selected sparkle colorId

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

      <div style={sheet} onPointerDown={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px' }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--brand-iris-900)' }}>Gem Shop 🛍️</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--brand-iris-900)' }}>💎 {gems}</div>
            <button aria-label="Close shop" onClick={onClose} style={btnStyle({ w: 36, bg: 'var(--brand-lilac-100)', color: 'var(--brand-lilac-900)' })}>✕</button>
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
                      <span style={tileName}>{item?.name ?? o.asset}</span>
                      <span style={{ ...tilePrice, color: 'var(--brand-iris-600)' }}>place ✥</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Magic — the sparkle consumable (15-min trail on her character) */}
          <SectionLabel>✨ Magic — a sparkle trail for 15 min</SectionLabel>
          {activeSparkle && (
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brand-iris-600)', margin: '0 4px 8px' }}>
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
                  style={{ ...tile(affordable), outline: isSel ? '3px solid var(--brand-iris-600)' : 'none' }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: SWATCH_BG[id],
                    boxShadow: '0 1px 4px rgba(40,30,70,0.25), inset 0 0 0 1.5px rgba(255,255,255,0.6)',
                    filter: affordable ? 'none' : 'grayscale(0.7)' }} />
                  <span style={tileName}>{c.label}</span>
                  {isSel ? (
                    <span
                      onClick={(e) => { e.stopPropagation(); onBuySparkle(id); setMagicSel(null) }}
                      style={{ ...tilePrice, background: 'var(--brand-iris-600)', color: '#fff', borderRadius: 999, padding: '3px 12px', fontWeight: 800 }}
                    >
                      Buy 💎{c.price}
                    </span>
                  ) : (
                    <span style={{ ...tilePrice, color: affordable ? 'var(--brand-iris-900)' : '#b6aed6' }}>💎 {c.price} · 15m</span>
                  )}
                </button>
              )
            })}
          </div>

          <SectionLabel>Buy with gems</SectionLabel>
          <div style={grid}>
            {SHOP.map((item, i) => {
              const affordable = gems >= item.price
              const isSel = selected === i
              return (
                <button
                  key={item.asset}
                  onClick={() => affordable && setSelected(isSel ? null : i)}
                  style={{ ...tile(affordable), outline: isSel ? '3px solid var(--brand-iris-600)' : 'none' }}
                >
                  <span style={{ fontSize: 30, filter: affordable ? 'none' : 'grayscale(1)' }}>{item.emoji}</span>
                  <span style={tileName}>{item.name}</span>
                  {isSel ? (
                    <span
                      onClick={(e) => { e.stopPropagation(); onBuy(item) }}
                      style={{ ...tilePrice, background: 'var(--brand-iris-600)', color: '#fff', borderRadius: 999, padding: '3px 12px', fontWeight: 800 }}
                    >
                      Buy 💎{item.price}
                    </span>
                  ) : (
                    <span style={{ ...tilePrice, color: affordable ? 'var(--brand-iris-900)' : '#b6aed6' }}>💎 {item.price}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--brand-lilac-900)', opacity: 0.75, margin: '8px 4px 8px' }}>{children}</div>
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
  background: enabled ? 'var(--lilac-50)' : '#f4f2fa',
  border: '2px solid var(--brand-lilac-100)',
  borderRadius: 16,
  cursor: enabled ? 'pointer' : 'default',
  opacity: enabled ? 1 : 0.55,
  fontFamily: 'inherit',
})

const tileName = { fontSize: 13, fontWeight: 600, color: 'var(--brand-iris-900)' }
const tilePrice = { fontSize: 13, fontWeight: 700 }

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
