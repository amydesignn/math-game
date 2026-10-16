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

  it('plays the gem tink after the first tap (one oscillator per note)', () => {
    audio.unlockAudio()
    expect(audio.playSfx('gem')).toBe(true)
    expect(ctx.created).toBe(audio.SFX.gem.notes.length)
  })

  it('the speaker toggle mutes it', () => {
    audio.unlockAudio()
    audio.setAudioEnabled(false)
    expect(audio.playSfx('gem')).toBe(false)
  })

  it('a burst of the same sound never stacks, but gems 90 ms apart each tink', () => {
    audio.unlockAudio()
    expect(audio.playSfx('gem')).toBe(true)
    expect(audio.playSfx('gem')).toBe(false)
    vi.advanceTimersByTime(90)
    expect(audio.playSfx('gem')).toBe(true)
  })

  it('stays gentle: quieter than the music, about a second at most', () => {
    for (const r of Object.values(audio.SFX)) {
      expect(r.gain).toBeLessThan(0.2)
      for (const [, at, len] of r.notes) expect(at + len).toBeLessThanOrEqual(1)
    }
  })

  it('an unknown name is a quiet no-op', () => {
    audio.unlockAudio()
    expect(audio.playSfx('nope')).toBe(false)
  })
})
