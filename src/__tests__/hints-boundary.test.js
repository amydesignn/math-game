/*
 * In-game hints — the module stays app-agnostic: files in src/hints/ import only
 * each other (and react/react-dom). It has to drop into luxi.land, a plain React
 * page with no 3D and none of this game's files.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'hints')
const ALLOWED_PACKAGES = new Set(['react', 'react-dom'])

export function importsOf(src) {
  const out = []
  const re = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g
  for (const m of src.matchAll(re)) out.push(m[1] || m[2] || m[3] || m[4])
  return out
}

export function violations(files) {
  const bad = []
  for (const [name, src] of files) {
    for (const spec of importsOf(src)) {
      const local = spec.startsWith('./') && !spec.slice(2).includes('/')
      if (local || ALLOWED_PACKAGES.has(spec)) continue
      bad.push(`${name} → ${spec}`)
    }
  }
  return bad
}

describe('src/hints/ is self-contained', () => {
  const files = readdirSync(DIR)
    .filter((f) => /\.(m?jsx?|tsx?)$/.test(f))
    .map((f) => [f, readFileSync(join(DIR, f), 'utf8')])
  it('has the module files', () => {
    const names = files.map((f) => f[0])
    for (const f of ['engine.js', 'position.js', 'index.js', 'HintLayer.jsx']) expect(names).toContain(f)
  })
  it('imports nothing from outside its folder', () => {
    expect(violations(files)).toEqual([])
  })
  it('the checker itself catches an escape (sabotage guard)', () => {
    expect(violations([['x.js', "import { getGarden } from '../store'"]])).toEqual(['x.js → ../store'])
    expect(violations([['x.js', "import * as THREE from 'three'"]])).toEqual(['x.js → three'])
    expect(violations([['x.js', "export { a } from './sub/a.js'"]])).toEqual(['x.js → ./sub/a.js'])
    expect(violations([['x.js', "import './hints.css'\nimport { useState } from 'react'"]])).toEqual([])
  })
})
