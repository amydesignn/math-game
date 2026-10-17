// Public surface of the hint module. App-agnostic: drop this folder into any
// React host (Luxi Math, luxi.land). The host supplies config, ctx, memory and
// (for world targets) getTargetPos; it plays any sound from onShow / onDone.
export { createHintController, beginSession, normalizeMemory, budgetAllows, QUIET_SESSIONS, DEFAULT_DELAY_MS, DEFAULT_EXIT_MS } from './engine.js'
export { placeArrow, arrowAngle, domTargetPos, DEFAULT_INSETS } from './position.js'
