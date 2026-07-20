import { WORLD } from './config'

/*
 * walk.js — the ONE walk step, shared by the local Character and the remote
 * Buddy sim (Phase B, docs/together-space.md).
 *
 * The Together Space replicates TAPS, not positions: both clients run this
 * exact function against the same target, so the sims converge by
 * construction. That only holds while there is literally one implementation —
 * if you retune movement, tune it here and both sides stay in step.
 */

/**
 * Advance a walker one frame toward `target` ({x,z} or null).
 * Mutates and returns `pos` ({x,z}); returns the walk state so callers can
 * pick animations: 'walk' while moving, 'idle' otherwise.
 * `arrived` fires exactly once — the frame the walker reaches the target.
 */
export function stepToward(pos, target, dt, speed = WORLD.characterSpeed) {
  if (!target) return { moving: false, arrived: false }
  const dx = target.x - pos.x
  const dz = target.z - pos.z
  const dist = Math.hypot(dx, dz)
  if (dist <= WORLD.arriveThreshold) return { moving: false, arrived: true }
  const step = Math.min(speed * dt, dist)
  pos.x += (dx / dist) * step
  pos.z += (dz / dist) * step
  return { moving: true, arrived: false }
}

/** Shortest-path angular damping — smooth turns, never a full spin.
 *  (Lifted from Character/Pet so the Buddy turns the same way.) */
export function dampAngle(a, b, lambda, dt) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * (1 - Math.exp(-lambda * dt))
}
