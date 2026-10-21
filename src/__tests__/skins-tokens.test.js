/*
 * Skin colours are Luxi tokens (Amy's 10-20 rule; brief 10-21). Every skin slot
 * reads its own `--luxi-color-component-skin-<id>-*` token — no raw hex, no Datum
 * hue primitive, no Datum component token at the use site — and every token it
 * names exists in index.css. The tint helper must reproduce the old hex-suffix
 * alpha exactly (screens were pixel-diffed identical on that basis).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { SKINS, LUCKY_SKIN, skinTint, skinColor } from '../ui/skins'

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
const src = readFileSync(new URL('../ui/skins.js', import.meta.url), 'utf8')
const ALL = { ...SKINS, lucky: LUCKY_SKIN }
const SLOTS = ['accent', 'accentInk', 'glow']

describe('skin colours → Luxi tokens', () => {
  it.each(Object.keys(ALL))('%s reads a Luxi skin token for every slot, and it is defined', (id) => {
    for (const slot of SLOTS) {
      const name = /^var\((--luxi-color-component-skin-[a-z-]+)\)$/.exec(ALL[id][slot])?.[1]
      expect(name, `${id}.${slot}`).toBeTruthy()
      expect(css).toMatch(new RegExp(`^\\s*${name}:`, 'm'))
    }
  })

  it('skins.js carries no raw hex, hue primitive or Datum component token', () => {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(code).not.toMatch(/var\(--(teal|green|amber|pink|blue|sky|color-component)-/)
  })

  it('accent + glow tokens stay hex — the 3D station and minimap read them raw', () => {
    for (const id of Object.keys(ALL)) for (const slot of ['accent', 'glow']) {
      const name = ALL[id][slot].slice(4, -1)
      expect(css).toMatch(new RegExp(`^\\s*${name}: #[0-9A-F]{6};`, 'm'))
    }
  })

  it('skinTint reproduces the hex-suffix alpha', () => {
    expect(skinTint('var(--x)', '14')).toBe('color-mix(in srgb, var(--x) 7.8431%, transparent)')
    expect(skinTint('var(--x)', '22')).toBe('color-mix(in srgb, var(--x) 13.3333%, transparent)')
  })

  it('skinColor passes a non-var value straight through', () => {
    expect(skinColor('#E17100')).toBe('#E17100')
  })
})
