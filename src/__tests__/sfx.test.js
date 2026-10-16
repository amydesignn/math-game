/*
 * Sound effects (2026-10-16, ticket 1 — the gem tink): playSfx obeys the same
 * rules as the music — speaker toggle, first-tap unlock — and a burst of the
 * same sound never stacks.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

function fakeCtx() {
  const node = () => ({ connect: (n) => n, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, frequency: {}, detune: {}, start() {}, stop() {} })
  const ctx = { currentTime: 0, destination: {}, created: 0, resume: () => Promise.resolve(),
    createOscillator: () => { ctx.created++; return node() }, createGain: node }
  return ctx
}

let ctx, audio
beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  ctx = fakeCtx()
  globalThis.window = { AudioContext: function () { return ctx } }
  globalThis.Audio = function () { return { play: () => Promise.resolve(), pause() {} } }
  audio = await import('../audio.js')
  audio.setupAudio({ petId: 'none', on: true, track: 'island' })
})

describe('playSfx', () => {
  it('stays quiet before the first tap', () => {
    expect(audio.playSfx('gem')).toBe(false)
  })

  it('plays the three-note chime 3 times after the first tap', () => {
    audio.unlockAudio()
    expect(audio.playSfx('gem')).toBe(true)
    expect(audio.SFX.gem.notes.length).toBe(3)
    expect(ctx.created).toBe(3 * 3)
  })

  it('the speaker toggle mutes it', () => {
    audio.unlockAudio()
    audio.setAudioEnabled(false)
    expect(audio.playSfx('gem')).toBe(false)
  })

  it('a burst of gems (3 flying + a bonus) plays ONE sequence, the next answer plays again', () => {
    audio.unlockAudio()
    expect(audio.playSfx('gem')).toBe(true)
    vi.advanceTimersByTime(90)
    expect(audio.playSfx('gem')).toBe(false)
    vi.advanceTimersByTime(1500)
    expect(audio.playSfx('gem')).toBe(false)
    vi.advanceTimersByTime(audio.sfxLength(audio.SFX.gem) * 1000)
    expect(audio.playSfx('gem')).toBe(true)
  })

  it('stays gentle: quieter than the music, each chime about a second, the whole sequence under 3 s', () => {
    for (const r of Object.values(audio.SFX)) {
      expect(r.gain).toBeLessThan(0.2)
      for (const [, at, len] of r.notes) expect(at + len).toBeLessThanOrEqual(1)
      expect(audio.sfxLength(r)).toBeLessThan(3)
    }
  })

  it('an unknown name is a quiet no-op', () => {
    audio.unlockAudio()
    expect(audio.playSfx('nope')).toBe(false)
  })
})
