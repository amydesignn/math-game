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
// Each recipe is a few soft sine notes: [frequency Hz, start s, length s].
// Kept quieter than the music and under ~0.6 s (calm over busy).
export const SFX = {
  // a gem landing in the wallet — a small two-note "tink" (E6 → B6)
  gem: { gain: 0.09, notes: [[1318.5, 0, 0.22], [1975.5, 0.05, 0.3]] },
  // the amber completion gem — the same tink, one note taller (E6 → G#6 → B6)
  gemBonus: { gain: 0.11, notes: [[1318.5, 0, 0.22], [1661.2, 0.06, 0.24], [1975.5, 0.12, 0.4]] },
}
const SFX_GAP_MS = 60 // same sound closer than this = skipped, so bursts never stack
const lastSfx = {}

/** Play a named effect. Quiet no-op when sound is off, before the first tap,
 *  in a hidden tab, or without Web Audio. Returns true if it played. */
export function playSfx(name) {
  const r = SFX[name]
  if (!r || !enabled || !unlocked || !sfxCtx) return false
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false
  const now = Date.now()
  if (now - (lastSfx[name] || 0) < SFX_GAP_MS) return false
  lastSfx[name] = now
  const t0 = sfxCtx.currentTime
  const detune = (Math.random() - 0.5) * 30 // ±15 cents — the 20th tink isn't a copy of the first
  for (const [freq, at, len] of r.notes) {
    const osc = sfxCtx.createOscillator()
    const amp = sfxCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.detune.value = detune
    amp.gain.setValueAtTime(0.0001, t0 + at)
    amp.gain.exponentialRampToValueAtTime(r.gain, t0 + at + 0.008) // soft attack, no click
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len)
    osc.connect(amp).connect(sfxCtx.destination)
    osc.start(t0 + at)
    osc.stop(t0 + at + len + 0.02)
  }
  return true
}
