/*
 * Hint sounds (Trail crew job 1, 2026-10-17 — Wren). hintShow / hintDone sit
 * in the gem chime's family, are quieter than it, and YIELD: a hint cue never
 * stacks on the gem chime (or any other effect still ringing).
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
  audio.unlockAudio()
})

describe('hint sounds', () => {
  it('hintShow is 2 soft notes, hintDone is 4 — one oscillator per note', () => {
    expect(audio.playSfx('hintShow')).toBe(true)
    expect(ctx.created).toBe(2)
    vi.advanceTimersByTime(audio.sfxLength(audio.SFX.hintShow) * 1000 + 10)
    expect(audio.playSfx('hintDone')).toBe(true)
    expect(ctx.created).toBe(2 + 4)
  })

  it('both are quieter and shorter than the gem chime, and 1 s or less', () => {
    for (const name of ['hintShow', 'hintDone']) {
      const r = audio.SFX[name]
      expect(r.gain).toBeLessThan(audio.SFX.gem.gain)
      expect(audio.sfxLength(r)).toBeLessThanOrEqual(1)
    }
    expect(audio.SFX.hintShow.gain).toBeLessThan(audio.SFX.hintDone.gain) // "look here" softer than the reward
  })

  it('never stacks on the gem chime: a hint cue skips while gems ring, plays after', () => {
    expect(audio.playSfx('gem')).toBe(true)
    const before = ctx.created
    vi.advanceTimersByTime(1500)
    expect(audio.playSfx('hintShow')).toBe(false)
    expect(audio.playSfx('hintDone')).toBe(false)
    expect(ctx.created).toBe(before)
    vi.advanceTimersByTime(audio.sfxLength(audio.SFX.gem) * 1000)
    expect(audio.playSfx('hintShow')).toBe(true)
  })

  it('obeys the speaker toggle', () => {
    audio.setAudioEnabled(false)
    expect(audio.playSfx('hintShow')).toBe(false)
    expect(audio.playSfx('hintDone')).toBe(false)
  })

  it("the plant cue is Amy's pick (2026-10-17, cut 04): E5 → G#5 → B5 → E6, once", () => {
    expect(audio.SFX.hintDone.notes.map(([f]) => f)).toEqual([659.26, 830.61, 987.77, 1318.51])
    expect(audio.SFX.hintDone.repeat).toBeUndefined()
  })

  it('the gem chime is unchanged', () => {
    expect(audio.SFX.gem).toEqual({ gain: 0.1, notes: [[1318.5, 0, 0.45], [1661.2, 0.09, 0.5], [1975.5, 0.18, 0.8]], repeat: 3, every: 1.0 })
  })
})
