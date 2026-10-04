/*
 * audio.js — Phase 2 sound (bgm + ambient pet sound, Ivy's picks).
 * 2026-10-04: two bgm tracks (config MUSIC_TRACKS), chosen in Settings.
 *
 * Cozy Closet pattern: browsers refuse to autoplay sound, so nothing actually
 * plays until the first pointerdown calls unlockAudio(). The ambient sound
 * keys off the pet id — pet ≠ always a cat, so pets without a sound file
 * simply stay quiet. The meow is occasional and ambient by design (Ivy's
 * research: calm over busy; nothing interrupts focus).
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
  if (import.meta.env.DEV) {
    window.__meow = () => petSound?.play()
    window.__audio = () => ({ unlocked, enabled, bgmTrack, bgmSrc: bgm?.src, bgmVolume: bgm?.volume, bgmPaused: bgm?.paused, bgmTime: bgm?.currentTime })
  }
}

/** Call on the first pointerdown — starts the loop if sound is on. */
export function unlockAudio() {
  if (unlocked) return
  unlocked = true
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

/** Ivy's research: nothing interrupts during a problem. Meow holds in focus mode. */
export function setFocusMode(on) {
  focus = on
}

function schedulePetSound() {
  clearTimeout(petTimer)
  if (!petSound) return
  const [min, max] = PET_SOUND_GAP_MS
  petTimer = setTimeout(() => {
    if (enabled && !focus && document.visibilityState === 'visible') {
      petSound.currentTime = 0
      petSound.play().catch(() => {})
    }
    schedulePetSound()
  }, min + Math.random() * (max - min))
}
