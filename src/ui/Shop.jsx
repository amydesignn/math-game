import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { SHOP, SHOP_CATEGORIES, SIZES, SPARKLE, COMPANIONS, GEAR, HEROES, PLAYER, modelUrl } from '../config'

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
export default function Shop({ gems, owned, activeSparkle, pet, ownedPets = [], gear = {}, ownedGear = [], character, ownedHeroes = [], onBuyHero, onChooseHero, onBuy, onBuySparkle, onBuyPet, onChoosePet, onBuyGear, onWearGear, onPlaceOwned, onClose }) {
  const [selected, setSelected] = useState(null) // "pack:asset" of the selected tile
  const [magicSel, setMagicSel] = useState(null) // selected sparkle colorId
  const [petSel, setPetSel] = useState(null) // selected companion id (not yet owned)
  const [gearSel, setGearSel] = useState(null) // selected wardrobe piece (not yet owned)
  const [heroSel, setHeroSel] = useState(null) // selected locked hero (asking to unlock)
  // Warm every hero's model while the shop is open, so a swap doesn't
  // suspend the world on a fetch (most are cached already — neighbours).
  useEffect(() => { HEROES.forEach((h) => useGLTF.preload(modelUrl('characters', h.id))) }, [])
  const [size, setSize] = useState(1) // ×1/×2/×3 — resets each time the shop opens

  const sheet = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    background: 'var(--color-background-base)',
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

          {/* Heroes — who she plays as. Free ones swap any time; a locked one
              unlocks with gems ONCE (tap → Unlock pill, the same two-tap buy as
              every shelf) and she plays as them right away. */}
          <SectionLabel>🦸 Heroes</SectionLabel>
          <div role="group" aria-label="Heroes" style={{ ...grid, marginBottom: 6 }}>
            {HEROES.map((h) => {
              const isHers = h.price === 0 || ownedHeroes.includes(h.id)
              const isOn = character === h.id
              const affordable = isHers || gems >= h.price
              const isSel = heroSel === h.id
              return (
                <button
                  key={h.id}
                  onClick={(e) => {
                    if (isOn) return
                    if (isHers) onChooseHero(h.id)
                    else if (isSel && byKeyboard(e)) { onBuyHero(h.id); setHeroSel(null) }
                    else if (affordable) setHeroSel(isSel ? null : h.id)
                  }}
                  aria-disabled={(!affordable || isOn) || undefined}
                  aria-pressed={isOn}
                  aria-label={isHers ? h.name : isSel ? `Unlock ${h.name} for ${h.price} gems` : `${h.name}, locked, ${h.price} gems`}
                  style={{ ...tile(affordable), ...selRing(isSel || isOn) }}
                >
                  <img
                    src={import.meta.env.BASE_URL + h.thumb}
                    alt=""
                    width={48}
                    height={48}
                    style={{ objectFit: 'contain', filter: affordable ? 'none' : 'grayscale(1)', opacity: affordable ? 1 : 0.5 }}
                  />
                  <span style={tileName(affordable)}>{h.name}</span>
                  {isOn ? (
                    <span style={{ ...tilePrice, color: 'var(--color-text-brand)' }}>Playing 💜</span>
                  ) : isHers ? (
                    <span style={{ ...tilePrice, color: 'var(--color-component-button-link-text-default)' }}>Play</span>
                  ) : isSel ? (
                    <span
                      onClick={(e) => { e.stopPropagation(); onBuyHero(h.id); setHeroSel(null) }}
                      style={{ ...tilePrice, ...buyPill }}
                    >
                      Unlock 💎{h.price}
                    </span>
                  ) : (
                    <span style={{ ...tilePrice, color: affordable ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>🔒 💎 {h.price}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Wardrobe — the Sorcerer's hat + staff: buy a colour and she wears it
              right away; switch (or take one off) any time. Only the Sorcerer has
              the sockets, so the shelves show only while she's the hero. */}
          {character === PLAYER && [['hat', '🧙 Hats', 'No hat'], ['staff', '🪄 Staffs', 'No staff']].map(([slot, label, bare]) => (
            <div key={slot}>
              <SectionLabel>{label}</SectionLabel>
              <div style={{ ...grid, marginBottom: 6 }}>
                {GEAR.filter((g) => g.slot === slot).map((g) => {
                  const isHers = g.price === 0 || ownedGear.includes(g.id)
                  const isOn = gear[slot] === g.id
                  const affordable = isHers || gems >= g.price
                  const isSel = gearSel === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={(e) => {
                        if (isOn) return
                        if (isHers) onWearGear(slot, g.id)
                        else if (isSel && byKeyboard(e)) { onBuyGear(g.id); setGearSel(null) }
                        else if (affordable) setGearSel(isSel ? null : g.id)
                      }}
                      aria-disabled={(!affordable || isOn) || undefined}
                      aria-pressed={isOn}
                      aria-label={isSel ? `Buy ${g.name} for ${g.price} gems` : undefined}
                      style={{ ...tile(affordable), ...selRing(isSel || isOn) }}
                    >
                      <img
                        src={import.meta.env.BASE_URL + g.thumb}
                        alt=""
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain', filter: affordable ? 'none' : 'grayscale(1)', opacity: affordable ? 1 : 0.5 }}
                      />
                      <span style={tileName(affordable)}>{g.name}</span>
                      {isOn ? (
                        <span style={{ ...tilePrice, color: 'var(--color-text-brand)' }}>Wearing 💜</span>
                      ) : isHers ? (
                        <span style={{ ...tilePrice, color: 'var(--color-component-button-link-text-default)' }}>Wear</span>
                      ) : isSel ? (
                        <span
                          onClick={(e) => { e.stopPropagation(); onBuyGear(g.id); setGearSel(null) }}
                          style={{ ...tilePrice, ...buyPill }}
                        >
                          Buy 💎{g.price}
                        </span>
                      ) : (
                        <span style={{ ...tilePrice, color: affordable ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>💎 {g.price}</span>
                      )}
                    </button>
                  )
                })}
                <button
                  onClick={() => gear[slot] !== null && onWearGear(slot, null)}
                  aria-pressed={gear[slot] === null}
                  style={{ ...tile(true), ...selRing(gear[slot] === null) }}
                >
                  <span style={{ fontSize: 30, lineHeight: '48px' }}>🚫</span>
                  <span style={tileName(true)}>{bare}</span>
                  <span style={{ ...tilePrice, color: gear[slot] === null ? 'var(--color-text-brand)' : 'var(--color-component-button-link-text-default)' }}>
                    {gear[slot] === null ? 'Wearing 💜' : 'Take off'}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {/* Companions — buy one and it follows her right away; switch any time */}
          <SectionLabel>💜 Companions</SectionLabel>
          <div style={{ ...grid, marginBottom: 6 }}>
            {COMPANIONS.map((c) => {
              const isHers = ownedPets.includes(c.id)
              const isActive = pet === c.id
              const affordable = isHers || gems >= c.price
              const isSel = petSel === c.id
              return (
                <button
                  key={c.id}
                  onClick={(e) => {
                    if (isActive) return
                    if (isHers) onChoosePet(c.id)
                    else if (isSel && byKeyboard(e)) { onBuyPet(c.id); setPetSel(null) }
                    else if (affordable) setPetSel(isSel ? null : c.id)
                  }}
                  aria-disabled={(!affordable || isActive) || undefined}
                  aria-pressed={isActive}
                  aria-label={isSel ? `Buy ${c.name} for ${c.price} gems` : undefined}
                  style={{ ...tile(affordable), ...selRing(isSel || isActive) }}
                >
                  <img
                    src={import.meta.env.BASE_URL + c.thumb}
                    alt=""
                    width={48}
                    height={48}
                    style={{ objectFit: 'contain', filter: affordable ? 'none' : 'grayscale(1)', opacity: affordable ? 1 : 0.5 }}
                  />
                  <span style={tileName(affordable)}>{c.name}</span>
                  {isActive ? (
                    <span style={{ ...tilePrice, color: 'var(--color-text-brand)' }}>With you 💜</span>
                  ) : isHers ? (
                    <span style={{ ...tilePrice, color: 'var(--color-component-button-link-text-default)' }}>Choose</span>
                  ) : isSel ? (
                    <span
                      onClick={(e) => { e.stopPropagation(); onBuyPet(c.id); setPetSel(null) }}
                      style={{ ...tilePrice, ...buyPill }}
                    >
                      Buy 💎{c.price}
                    </span>
                  ) : (
                    <span style={{ ...tilePrice, color: affordable ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>💎 {c.price}</span>
                  )}
                </button>
              )
            })}
          </div>

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
                  onClick={(e) => {
                    if (isSel && byKeyboard(e)) { onBuySparkle(id); setMagicSel(null) }
                    else if (affordable) setMagicSel(isSel ? null : id)
                  }}
                  aria-disabled={!affordable || undefined}
                  aria-label={isSel ? `Buy ${c.label} sparkle for ${c.price} gems` : undefined}
                  style={{ ...tile(affordable), ...selRing(isSel) }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: SWATCH_BG[id],
                    boxShadow: '0 1px 4px rgba(40,30,70,0.25), inset 0 0 0 1.5px rgba(255,255,255,0.6)',
                    filter: affordable ? 'none' : 'grayscale(0.7)', opacity: affordable ? 1 : 0.5 }} />
                  <span style={tileName(affordable)}>{c.label}</span>
                  {isSel ? (
                    <span
                      onClick={(e) => { e.stopPropagation(); onBuySparkle(id); setMagicSel(null) }}
                      style={{ ...tilePrice, ...buyPill }}
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
                        onClick={(e) => {
                          if (isSel && byKeyboard(e)) { onBuy(item, size); setSelected(null) }
                          else if (affordable) setSelected(isSel ? null : key)
                        }}
                        aria-disabled={!affordable || undefined}
                        aria-label={isSel ? `Buy ${item.name}${size > 1 ? ` ×${size}` : ''} for ${cost} gems` : undefined}
                        style={{ ...tile(affordable), ...selRing(isSel) }}
                      >
                        <span style={{ fontSize: 30, filter: affordable ? 'none' : 'grayscale(1)', opacity: affordable ? 1 : 0.5 }}>{item.emoji}</span>
                        <span style={tileName(affordable)}>{item.name}</span>
                        {isSel ? (
                          <span
                            onClick={(e) => { e.stopPropagation(); onBuy(item, size); setSelected(null) }}
                            style={{ ...tilePrice, ...buyPill }}
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

/*
 * Every shelf's two-tap buy (a11y, 2026-10-20): tap a tile → it's selected and shows the
 * Buy/Unlock pill. The pill is a <span> inside the tile's <button> (a button can't nest a
 * button), so the keyboard can't reach it: Enter/Space on a SELECTED tile is the pill
 * (a keyboard click has detail 0). A tap off the pill still un-selects, as before.
 */
const byKeyboard = (e) => e.detail === 0
// Selected / on = an INSET Iris ring (border + inset shadow), never an outline — the
// outline stays free for the 1px Iris 700 focus ring (a selected tile used to hide it).
const selRing = (on) => (on ? { borderColor: 'var(--brand-iris-600)', boxShadow: 'inset 0 0 0 1px var(--brand-iris-600)' } : null)
// The Buy/Unlock pill — 8px sides so "Unlock 💎50" fits a 3-up tile on a 375 phone
const buyPill = { background: 'var(--brand-iris-600)', color: 'var(--color-text-on-brand)', borderRadius: 999, padding: '4px 8px', fontWeight: 800, whiteSpace: 'nowrap' }

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
