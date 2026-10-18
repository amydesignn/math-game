/*
 * audio.js — Phase 2 sound (bgm + ambient pet sound, Ivy's picks).
 * 2026-10-04: two bgm tracks (config MUSIC_TRACKS), chosen in Settings.
 *
 * Cozy Closet pattern: browsers refuse to autoplay sound, so nothing actually
 * plays until the first pointerdown calls unlockAudio(). The ambient sound
 * keys off the pet id — pet ≠ always a cat, so pets without a sound file
 * simply stay quiet. The meow is occasional and ambient by design (Ivy's
 * research: calm over busy; nothing interrupts focus).
 *
 * 2026-10-16: sound effects (Notion "Luxi Math — Sound Effects", ticket 1).
 * playSfx() makes tiny chimes in code with Web Audio — no files, nothing to
 * license. Same rules as the rest: the speaker toggle mutes them, nothing plays
 * before the first tap, and a throttle keeps a burst of gems from stacking.
 */

import { MUSIC_TRACKS, DEFAULT_MUSIC } from './config'

const BASE = import.meta.env.BASE_URL

const PET_SOUNDS = { 'animal-cat': 'meow-cat.mp3' }
const PET_SOUND_GAP_MS = [45_000, 100_000] // occasional — never spammy

let bgm = null
let bgmTrack = null // MUSIC_TRACKS id currently loaded into `bgm`
let petSound = null
let enabled = true
let unlocked = false
let petTimer = null
let focus = false // math focus time — pet sounds hold (music stays, it soothes)
let sfxCtx = null // Web Audio context for playSfx — made on the first tap

export function setupAudio({ petId, on, track }) {
  enabled = on
  if (!bgm) {
    bgm = new Audio()
    bgm.loop = true
  }
  setMusic(track)
  const file = PET_SOUNDS[petId]
  petSound = file ? new Audio(`${BASE}audio/${file}`) : null
  if (petSound) petSound.volume = 0.6
  if (unlocked) schedulePetSound() // pet changed → restart (or stop) its sound loop
  if (import.meta.env.DEV) {
    window.__meow = () => petSound?.play()
    window.__sfx = (name = 'gem') => playSfx(name)
    window.__audio = () => ({ unlocked, enabled, bgmTrack, bgmSrc: bgm?.src, bgmVolume: bgm?.volume, bgmPaused: bgm?.paused, bgmTime: bgm?.currentTime })
  }
}

/** Call on the first pointerdown — starts the loop if sound is on. */
export function unlockAudio() {
  if (unlocked) return
  unlocked = true
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (Ctx && !sfxCtx) sfxCtx = new Ctx()
  sfxCtx?.resume?.().catch(() => {})
  if (enabled && bgm) bgm.play().catch(() => {})
  schedulePetSound()
}

/** The speaker toggle. Pauses/resumes everything in place. */
export function setAudioEnabled(on) {
  enabled = on
  if (!unlocked) return
  if (on) {
    bgm?.play().catch(() => {})
    schedulePetSound()
  } else {
    bgm?.pause()
    clearTimeout(petTimer)
  }
}

/** The Settings music picker. Swaps the loop in place: if music was playing it
 *  starts the new track from the top; if sound is off it just preloads it. */
export function setMusic(id) {
  const t = MUSIC_TRACKS.find((x) => x.id === id) || MUSIC_TRACKS.find((x) => x.id === DEFAULT_MUSIC)
  if (!bgm || bgmTrack === t.id) return
  const wasPlaying = !bgm.paused
  bgm.src = `${BASE}audio/${t.file}`
  bgm.volume = t.gain
  bgmTrack = t.id
  if (wasPlaying && enabled && unlocked) bgm.play().catch(() => {})
}

/** A promo clip playing WITH sound (PromoPopup) — the loop steps aside so two
 *  tracks never play over each other, and comes back after if it was allowed. */
export function holdMusic(on) {
  if (!bgm) return
  if (on) bgm.pause()
  else if (enabled && unlocked) bgm.play().catch(() => {})
}

/** Ivy's research: nothing interrupts during a problem. Meow holds in focus mode. */
export function setFocusMode(on) {
  focus = on
}

function schedulePetSound() {
  clearTimeout(petTimer)
  if (!petSound) return
  const [min, max] = PET_SOUND_GAP_MS
  petTimer = setTimeout(() => {
    if (petSound && enabled && !focus && document.visibilityState === 'visible') {
      petSound.currentTime = 0
      petSound.play().catch(() => {})
    }
    schedulePetSound()
  }, min + Math.random() * (max - min))
}

// ── Sound effects ──
// Each recipe is a few soft sine notes: [frequency Hz, start s, length s],
// optionally played `repeat` times, `every` seconds apart. Quieter than the music.
const CHIME = [[1318.5, 0, 0.45], [1661.2, 0.09, 0.5], [1975.5, 0.18, 0.8]] // E6 → G#6 → B6
export const SFX = {
  // gems landing in the wallet. 2026-10-16, Amy's pick after three listens: the
  // three-note chime, 3 times back to back (~2.8 s). One burst of gems = ONE
  // sequence, so the 3 flying gems (and a station's bonus gem) never pile up.
  gem: { gain: 0.1, notes: CHIME, repeat: 3, every: 1.0 },

  // ── In-game hints (Trail crew job 1, 2026-10-17 — Wren). Same E-major family
  // as the gem chime so the game sounds like one world, and quieter than it.
  // `yields: true` = a hint cue steps aside: if ANY effect is still ringing
  // (the 2.8 s gem chime above all) it doesn't play, so it never stacks on gems.
  // hintShow — the soft "look here" when the arrow arrives: B5 → E6, ~0.7 s,
  // half the gem's gain. Note 2 at 120 ms = the arrow's landing (Fern's beat).
  hintShow: { gain: 0.05, notes: [[987.77, 0, 0.4], [1318.51, 0.12, 0.58]], yields: true },
  // hintDone — the small reward when she plants (the garden hint's cue). Amy's
  // pick 2026-10-17 ("I love the 4 the most"): the gem's E-major arpeggio an
  // octave DOWN — E5 → G#5 → B5 → E6, ONCE (~1 s). Earthier, a garden sound, and
  // it sits under the gem's E6–B6 so the two never sound like the same event.
  // The top note at 270 ms = the "you did it" peak (Fern's swell).
  hintDone: { gain: 0.09, notes: [[659.26, 0, 0.5], [830.61, 0.09, 0.5], [987.77, 0.18, 0.5], [1318.51, 0.27, 0.73]], yields: true },
  // Kept for later hints (Amy: "they can stay"), not wired to anything yet.
  hintShowSingle: { gain: 0.05, notes: [[1318.51, 0, 0.8]], yields: true }, // one bell, E6
  hintDoneBloom: { gain: 0.08, notes: [...CHIME.map(([f, at]) => [f, at, 0.5]), [2637.02, 0.27, 0.73]], yields: true }, // the gem's octave + E7 on top — brighter
  hintDoneLong: { gain: 0.08, notes: [...CHIME.map(([f, at]) => [f, at, 0.5]), [2637.02, 0.27, 0.73]], repeat: 2, every: 1.0, yields: true }, // ×2, ~2 s (over the 1 s rule — Amy's call)
}
const lastSfx = {} // name → when its current play finishes (ms) — a burst inside it is skipped

/** How long a recipe plays, in seconds (the last repeat's longest note). */
export function sfxLength(r) {
  const tail = Math.max(...r.notes.map(([, at, len]) => at + len))
  return (r.every || 0) * ((r.repeat || 1) - 1) + tail
}

/** Play a named effect. Quiet no-op when sound is off, before the first tap,
 *  in a hidden tab, without Web Audio, or while the same effect is still
 *  playing. Returns true if it played. */
export function playSfx(name) {
  const r = SFX[name]
  if (!r || !enabled || !unlocked || !sfxCtx) return false
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false
  const now = Date.now()
  if (now < (lastSfx[name] || 0)) return false
  if (r.yields && Object.values(lastSfx).some((until) => now < until)) return false // a hint cue never stacks on another sound
  lastSfx[name] = now + sfxLength(r) * 1000
  const t0 = sfxCtx.currentTime
  for (let k = 0; k < (r.repeat || 1); k++) {
    const tk = t0 + k * (r.every || 0)
    const detune = (Math.random() - 0.5) * 30 // ±15 cents — no two chimes are exact copies
    for (const [freq, at, len] of r.notes) {
      const osc = sfxCtx.createOscillator()
      const amp = sfxCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = detune
      amp.gain.setValueAtTime(0.0001, tk + at)
      amp.gain.exponentialRampToValueAtTime(r.gain, tk + at + 0.008) // soft attack, no click
      amp.gain.exponentialRampToValueAtTime(0.0001, tk + at + len)
      osc.connect(amp).connect(sfxCtx.destination)
      osc.start(tk + at)
      osc.stop(tk + at + len + 0.02)
    }
  }
  return true
}
