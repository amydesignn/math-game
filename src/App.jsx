import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './world/Scene'
import Minimap from './ui/Minimap'
import Shop from './ui/Shop'
import Gem from './ui/Gem'
import MathPopup, { SKINS } from './ui/MathPopup'
import StationPopup from './ui/StationPopup'
import LevelBar, { LevelUpPopup } from './ui/LevelBar'
import { nextProblem, maybeLevelUp, TOPICS } from './math'
import { levelOf, pickLevelMessage } from './levels'
import { stationFor, currentWindow } from './stations'
import { getState, setMap, addGems, setSoundOn, recordAnswer, setStationSolved, completeStation, buyAsset, placeAsset, moveAsset, rotateAsset, pickupAsset, getActiveSparkle, buySparkle, giftSparkle, pendingLevelUps, recordLevelUp, getLevelUps } from './store'
import { setupAudio, unlockAudio, setAudioEnabled, setFocusMode } from './audio'
import { joinMeadow, EMOTES, labelFor } from './together'
import { sessionCache } from './auth'
import { WORLD } from './config'
import { MAPS, arrivalPoint, preloadMap } from './maps'

const FADE_MS = 380 // gate-travel fade half-duration (out, swap, in)

export default function App({ cloud = false }) {
  const [state] = useState(getState)
  const [moved, setMoved] = useState(false)

  // ── Gems (uncapped since the beta cap retired 2026-07-18) ──
  const [gems, setGems] = useState(state.gems)

  // ── Phase 5-A: Player Level ──
  // `points` IS lifetimeGems — the same accumulator, read for a different job:
  // gems are the wallet (spends down), points are the story so far (never do).
  // One trigger updates both, which is why they're set together in onAward.
  const [points, setPoints] = useState(state.lifetimeGems)
  const [levelQueue, setLevelQueue] = useState([]) // levels awaiting their popup
  const [levelPopup, setLevelPopup] = useState(null) // { level, message, from }

  // ── Phase 2: sound (Ivy's bgm + the cat's meow) ──
  useEffect(() => {
    setupAudio({ petId: state.pet, on: state.soundOn })
  }, [state.pet, state.soundOn])

  // ── Phase 4: the math loop — sparkles open problems ──
  const [math, setMath] = useState(null) // { sparkleId, problem, skin }
  const mathBusyRef = useRef(false) // Scene skips proximity checks while a problem is up
  const collectFnRef = useRef(null) // Scene's collect(), registered on mount
  const reactUntilRef = useRef(0) // char + pet celebrate until this timestamp
  const hudGemRef = useRef(null) // the counter pill — target of the gem flight

  function onSparkleReached(sparkleId) {
    if (mathBusyRef.current) return
    mathBusyRef.current = true
    setFocusMode(true) // Ivy's research: the meow holds during a problem
    setMath({ sparkleId, problem: nextProblem(), skin: SKINS.feedPet })
  }

  function onMathAward(n) {
    setGems(addGems(n)) // every correct answer pays, always
    setPoints(getState().lifetimeGems) // …and the same answer moves her level bar
  }

  /** The bar finished its theatre and handed us a new level — queue the applause. */
  function onLevelUp(newLevel) {
    setLevelQueue((q) => [...q, newLevel])
  }

  function closeLevelPopup() {
    if (levelPopup) recordLevelUp(levelPopup.level) // she's seen it; rotate the voice
    setLevelPopup(null)
  }

  function onPetReact() {
    reactUntilRef.current = performance.now() + 4000 // dance + emote-yes, visible after the card closes
  }

  function onMathClose(solved) {
    if (solved && math) collectFnRef.current?.(math.sparkleId) // burst — the gem is hers
    setMath(null)
    mathBusyRef.current = false
    setFocusMode(false)
  }

  // ── Phase 5: the station mini-quest (Oscar's tier-3 encounter) ──
  const [station, setStation] = useState(null) // { skinId, bonus, problems, resumeAt, mapId }
  const [farewellMap, setFarewellMap] = useState(null) // the map whose station is saying goodbye
  const stationRef = useRef(null) // Scene writes {x,z,color} here; the minimap draws the dot
  const farewellTimer = useRef()

  // Content refresh: when the window rolls over (every REFRESH.periodHours),
  // bump this so the Scene re-scatters gems + reloads its station. A minute-
  // granular check is plenty — the boundary just needs to be noticed while
  // she's playing; a reload picks it up regardless.
  const [refreshWindow, setRefreshWindow] = useState(currentWindow)
  useEffect(() => {
    const t = setInterval(() => {
      const w = currentWindow()
      setRefreshWindow((prev) => (w !== prev ? w : prev))
    }, 60000)
    return () => clearInterval(t)
  }, [])

  function onStationReached() {
    if (mathBusyRef.current) return
    const st = stationFor(mapId)
    if (!st) return
    mathBusyRef.current = true // shares the sparkle lock — one problem UI at a time
    setFocusMode(true)
    setStation({ skinId: st.skinId, bonus: st.bonus, problems: st.problems, resumeAt: st.solvedCount, mapId })
  }

  function onStationResult(problem, correct) {
    recordAnswer(problem.type, problem.level, correct, TOPICS[problem.type].topLevel)
    if (correct) maybeLevelUp(problem.type)
  }

  function onStationClose({ completed, solvedCount }) {
    const mid = station?.mapId
    setStation(null)
    mathBusyRef.current = false
    setFocusMode(false)
    if (!mid) return
    if (completed) {
      completeStation(mid) // done for the day — won't reappear
      setFarewellMap(mid) // the world plays the sparkle-white dissolve at its spot
      clearTimeout(farewellTimer.current)
      farewellTimer.current = setTimeout(() => setFarewellMap(null), 1750)
      // rare free sparkle AFTER a good quest — the tutorial (she learns what it
      // is before spending). Never mid-math, never for a wrong answer; and only
      // when none is already running (buying/gifting just resets, never stacks).
      if (!getActiveSparkle() && Math.random() < 0.25) {
        const gift = Math.random() < 0.5 ? 'pink' : 'blue'
        giftSparkle(gift)
        setSparkle(getActiveSparkle())
        showNote('A free sparkle for you! ✨')
      }
    } else {
      setStationSolved(mid, solvedCount) // remember progress — it RESUMES on return
    }
  }

  // ── Phase 3: shop + placement ──
  const [shopOpen, setShopOpen] = useState(false)
  const [placing, setPlacing] = useState(null) // { id, asset, pack, isMove?, startAt? }
  const [ghostRot, setGhostRot] = useState(0)
  const [selectedId, setSelectedId] = useState(null) // a placed asset being edited
  const [placed, setPlaced] = useState(() => getState().world)
  const [owned, setOwned] = useState(() => getState().owned)
  const [note, setNote] = useState(null) // small warning toast ("too close to the gate")
  const ghostPosRef = useRef(null) // Scene writes the ghost's spot; confirm reads it
  const noteTimer = useRef()

  function refreshAssets() {
    setPlaced([...getState().world])
    setOwned([...getState().owned])
  }

  // ── Sparkle Pack: the 15-minute consumable trail ──
  const [sparkle, setSparkle] = useState(getActiveSparkle) // { colorId, expiresAt } | null

  function handleBuySparkle(colorId) {
    if (!buySparkle(colorId)) return // can't afford — shop shows it greyed anyway
    setGems(getState().gems)
    setSparkle(getActiveSparkle())
  }
  function onSparkleExpire() {
    getActiveSparkle() // clears the lapsed one in the store
    setSparkle(null) // …dust settles, bar fades — quietly (no toast)
  }
  // catch expiry even if she's standing still (no frames driving the trail)
  useEffect(() => {
    if (!sparkle) return
    const t = setInterval(() => {
      if (!getActiveSparkle()) { setSparkle(null); clearInterval(t) }
    }, 1000)
    return () => clearInterval(t)
  }, [sparkle])

  function showNote(text) {
    setNote(text)
    clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(() => setNote(null), 2200)
  }

  function startPlacing(item) {
    setSelectedId(null)
    setShopOpen(false)
    setGhostRot(item.rot ?? 0)
    ghostPosRef.current = null
    setPlacing(item)
  }

  // `size` is the ×1/×2/×3 tier she picked; the price scales with it
  function handleBuy(item, size = 1) {
    const id = buyAsset({ ...item, size }, item.price * size)
    if (id == null) return
    setGems(getState().gems)
    refreshAssets()
    startPlacing({ id, asset: item.asset, pack: item.pack, size })
  }

  function confirmPlace() {
    const at = ghostPosRef.current
    if (!placing || !at) return
    const nearGate = MAPS[mapId].gates.some((g) => Math.hypot(at[0] - g.position[0], at[1] - g.position[2]) < 2.4)
    if (nearGate) {
      showNote('Too close to the gate — pick another spot ✨')
      return
    }
    if (placing.isMove) moveAsset(placing.id, at[0], at[1], ghostRot)
    else placeAsset(placing.id, mapId, at[0], at[1], ghostRot)
    refreshAssets()
    setPlacing(null)
  }

  function cancelPlace() {
    // a cancelled new item stays in "Your things"; a cancelled move changes nothing
    setPlacing(null)
    refreshAssets()
  }

  function startMove(id) {
    const w = getState().world.find((p) => p.id === id)
    if (w) startPlacing({ id: w.id, asset: w.asset, pack: w.pack, size: w.size, isMove: true, startAt: [w.x, w.z], rot: w.rot })
  }

  // ── Phase B: the Together Space (docs/together-space.md) ──
  // `meadow` = the live channel session, or null (home = the normal state).
  // Nothing here EVER touches the store — the meadow has no shared mutable
  // state by design, so no netcode path can reach Ivy's save (Invariant 1).
  const [meadow, setMeadow] = useState(null)
  const meadowRef = useRef(null) // for cleanup + handlers that outlive renders
  const joiningRef = useRef(false)
  const inMeadowRef = useRef(false) // gates keyframes/moves until we've actually arrived
  const [buddies, setBuddies] = useState([])
  const buddiesRef = useRef([]) // the minimap reads this each frame
  const [buddyEmotes, setBuddyEmotes] = useState({}) // k → { kind, emoji, at }
  const emoteTimers = useRef({})
  // (no "home map" bookkeeping: the store's persisted `map` IS home — the
  // meadow never writes it, so going home = reading it back)

  // ── Maps: which one we're in, where this visit starts, travel fade + toast ──
  const [mapId, setMapId] = useState(() => (MAPS[state.map] ? state.map : 'clearing'))
  const [spawn, setSpawn] = useState([0, 0])
  const [fading, setFading] = useState(false)
  const [toast, setToast] = useState(null)
  const travelling = useRef(false)
  const toastTimer = useRef()

  // the assets she's placed in the map she's standing in (mapId lives just above)
  const placedHere = placed.filter((w) => w.map === mapId)

  // ── Phase 5-A: retroactive congratulations, once, on boot ──
  // Her lifetime record predates the bar, so she may already be several levels
  // in. Amy overruled my caution here and she was right: those levels are real
  // and she never got to see them. `celebratedLevel` starts at 1, so this fires
  // exactly once per level, ever — the queue drains and the store remembers.
  useEffect(() => {
    const owed = pendingLevelUps(levelOf(getState().lifetimeGems))
    if (owed.length) setLevelQueue(owed)
  }, [])

  // Dev QA: drive an award without solving a problem. Level-ups need 50 points,
  // which is a lot of long multiplication to do by hand in a test pane.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__award = (n = 1) => { onMathAward(n); return getState().lifetimeGems }
    window.__level = () => ({ points: getState().lifetimeGems, level: levelOf(getState().lifetimeGems), celebrated: getState().celebratedLevel, levelUps: getState().levelUps })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Phase B pane QA hooks — reassigned EVERY render on purpose: a one-shot
  // effect would freeze enterMeadow's first-render closure (the stale-closure
  // class from the QA lessons in CLAUDE.md). Lets QA enter/leave without
  // fighting phantom taps, and inspect buddy sims without needing frames
  // (rAF is frozen in hidden panes).
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__enterMeadow = enterMeadow
    window.__leaveMeadow = leaveMeadow
    window.__meadow = () => ({
      in: inMeadowRef.current,
      key: meadowRef.current?.key ?? null,
      buddies: buddiesRef.current.map((b) => ({
        k: b.k,
        label: b.profile?.label,
        pos: b.sim ? { x: +b.sim.pos.x.toFixed(2), z: +b.sim.pos.z.toFixed(2) } : null,
        target: b.sim?.target ? { x: +b.sim.target.x.toFixed(2), z: +b.sim.target.z.toFixed(2) } : null,
      })),
    })
  })

  // ── The popup gate: applause only lands on a quiet world ──
  // Never over a math card, a station quest, the farewell dissolve, the shop,
  // a placement, or a gate fade. If she levels up mid-quest the bar celebrates
  // immediately (she sees it) and the card waits for the calm afterwards.
  // (the meadow counts as busy too — a signed congratulations card should be
  // read at home in the quiet, not mid-visit; the queue simply waits)
  const worldBusy = !!(math || station || farewellMap || placing || shopOpen || fading || meadow)
  useEffect(() => {
    if (levelPopup || worldBusy || !levelQueue.length) return
    const [next, ...rest] = levelQueue
    const { text, from } = pickLevelMessage(next, getLevelUps())
    setLevelPopup({ level: next, message: text, from })
    setLevelQueue(rest)
  }, [levelPopup, worldBusy, levelQueue])

  // ── Phase B: entering and leaving the meadow ──
  // Join FIRST (the world stays playable while the channel connects; a
  // failure is just a friendly note, never a white screen), then the same
  // fade theatre as gate travel. The store's `map` is never set to 'meadow' —
  // close the app there and you reopen at home: the session IS the room.
  async function enterMeadow() {
    if (travelling.current || joiningRef.current || meadowRef.current) return
    // Quiet world only. The 💞 button is already hidden in most busy states,
    // but re-check here — a popup can open between render and tap.
    if (math || station || placing || shopOpen || selectedId != null) return
    joiningRef.current = true
    // The join window is NON-interactive (adversarial-verify catch: an open
    // world during the await let the shop / a sparkle problem / a selection
    // bar ride into the meadow — store writes from the shared space). So:
    // stop her walk (no proximity events), latch travel (no gate can fire),
    // and raise the fade NOW — its overlay swallows every tap while we join.
    targetRef.current = null
    travelling.current = true
    setFading(true)
    const fadeStart = performance.now()
    let joinP = null
    let session = null
    try {
      joinP = joinMeadow({
          mode: cloud ? 'supabase' : 'dev',
          // the account uid ties a player's tabs together into one buddy; dev
          // (no session) leaves it undefined so two-tab QA still shows two
          identity: cloud ? sessionCache().uid : undefined,
          profile: {
            label: cloud ? labelFor(sessionCache().email) : 'Friend',
            character: state.character,
            pet: state.pet,
            sparkle: getActiveSparkle()?.colorId ?? null,
          },
          getSelf: () =>
            inMeadowRef.current
              ? {
                  x: +charPosRef.current.x.toFixed(2),
                  z: +charPosRef.current.z.toFixed(2),
                  tx: targetRef.current ? +targetRef.current.x.toFixed(2) : null,
                  tz: targetRef.current ? +targetRef.current.z.toFixed(2) : null,
                }
              : null, // not arrived yet — say nothing rather than a home position
          onBuddies: (list) => {
            buddiesRef.current = list
            setBuddies(list)
          },
          onJoin: (p) => showNote(`💜 ${p.label} is here!`),
          onLeave: (p) => showNote(`👋 ${p.label} went home`),
          onEmote: (k, kind) => {
            const e = EMOTES.find((x) => x.kind === kind)
            if (!e) return
            setBuddyEmotes((prev) => ({ ...prev, [k]: { kind, emoji: e.emoji, at: performance.now() } }))
            clearTimeout(emoteTimers.current[k])
            // a re-render after the bubble's hold, so it actually disappears
            emoteTimers.current[k] = setTimeout(() => {
              setBuddyEmotes((prev) => {
                const next = { ...prev }
                delete next[k]
                return next
              })
            }, 2800)
          },
          onDown: () => {
            // The channel died (network drop, failed token refresh). The buddy
            // is unreachable — clear them and stop our own sending by leaving
            // the dead session. She STAYS in the meadow (going home is hers to
            // choose); meadowRef is kept so 🏡 still runs the normal exit.
            meadowRef.current?.leave()
            buddiesRef.current = []
            setBuddies([])
            setBuddyEmotes({})
            showNote('The meadow hiccupped — you can head home anytime 💜')
          },
        })
      session = await withTimeout(joinP, 6000)
    } catch {
      // A timed-out join may still SUCCEED later — and a session nobody holds
      // can never be left (the zombie: ghost presence on Mum's side,
      // doppelgängers on retry — adversarial-verify catch). Kill it the
      // moment it materialises.
      joinP?.then((s) => s.leave()).catch(() => {})
      setFading(false)
      travelling.current = false
      joiningRef.current = false
      showNote("The meadow isn't reachable right now 💜")
      return
    }
    if (!mountedRef.current) {
      session.leave() // the App unmounted mid-join — nobody will render this
      return
    }
    meadowRef.current = session
    setMeadow(session)
    // the fade has been rising since before the join — wait out only the rest
    const fadeLeft = Math.max(0, FADE_MS - (performance.now() - fadeStart))
    setTimeout(() => {
      // spawn off-centre with a little scatter so the two of them never
      // appear inside each other (sides can coincide; the z jitter can't)
      const at = [Math.random() < 0.5 ? -1.6 : 1.6, 0.6 + Math.random() * 1.4]
      charPosRef.current.set(at[0], 0, at[1])
      petPosRef.current.set(at[0] + 1.4, 0, at[1] + 1.4)
      targetRef.current = null
      inMeadowRef.current = true
      setSpawn(at)
      setMapId('meadow') // deliberately NOT setMap() — nothing persists from here
      setToast(MAPS.meadow.name)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 2400)
      setTimeout(() => {
        setFading(false)
        travelling.current = false
        joiningRef.current = false
      }, FADE_MS)
    }, fadeLeft)
  }

  function leaveMeadow() {
    if (travelling.current || !meadowRef.current) return
    travelling.current = true
    setFading(true)
    setTimeout(() => {
      meadowRef.current?.leave()
      meadowRef.current = null
      inMeadowRef.current = false
      setMeadow(null)
      setBuddies([])
      buddiesRef.current = []
      setBuddyEmotes({})
      Object.values(emoteTimers.current).forEach(clearTimeout)
      emoteTimers.current = {}
      const persisted = getState().map // untouched by the meadow — still home
      const home = MAPS[persisted] && !MAPS[persisted].together ? persisted : 'clearing'
      charPosRef.current.set(0, 0, 0)
      petPosRef.current.set(1.4, 0, 1.4)
      targetRef.current = null
      setSpawn([0, 0])
      setMapId(home)
      setToast(MAPS[home].name)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 2400)
      setTimeout(() => {
        setFading(false)
        travelling.current = false
      }, FADE_MS)
    }, FADE_MS)
  }

  // Replicate TAPS, not positions (the whole netcode design): watch the walk
  // target for changes and broadcast position+target on each one. 200ms of
  // send latency is invisible — both sides converge on the same target, and
  // the keyframe beat corrects any drift.
  useEffect(() => {
    if (!meadow) return
    let last = 'init'
    const t = setInterval(() => {
      if (!inMeadowRef.current) return
      const tgt = targetRef.current
      const sig = tgt ? `${tgt.x.toFixed(1)},${tgt.z.toFixed(1)}` : 'stop'
      if (sig === last) return
      last = sig
      meadow.sendMove({
        x: +charPosRef.current.x.toFixed(2),
        z: +charPosRef.current.z.toFixed(2),
        tx: tgt ? +tgt.x.toFixed(2) : null,
        tz: tgt ? +tgt.z.toFixed(2) : null,
      })
    }, 200)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meadow])

  // sparkle bought/expired while in the meadow → the buddy sees it change
  useEffect(() => {
    meadowRef.current?.updateProfile({ sparkle: sparkle?.colorId ?? null })
  }, [sparkle])

  // leaving the page = leaving the meadow (presence would time out anyway,
  // but a clean bye makes the goodbye toast instant on the other side);
  // mountedRef also lets a join that resolves after unmount clean itself up
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true // StrictMode's simulated unmount must not stick
    return () => {
      mountedRef.current = false
      meadowRef.current?.leave()
    }
  }, [])

  function sendEmote(e) {
    meadowRef.current?.sendEmote(e.kind)
    onPetReact() // own character emote-yes + pet dance — the local feedback
  }

  function travel(toId) {
    if (travelling.current) return false // caller may retry next frame
    travelling.current = true
    setFading(true) // fade to white…
    setTimeout(() => {
      const from = mapId
      const at = arrivalPoint(MAPS[toId], from)
      // place her (and the trailing pet) just inside the gate she arrives by
      charPosRef.current.set(at[0], 0, at[1])
      petPosRef.current.set(at[0] + 1.4, 0, at[1] + 1.4)
      targetRef.current = null
      setSpawn(at)
      setMapId(toId)
      setMap(toId) // persist — she resumes in the map she left
      setToast(MAPS[toId].name)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 2400)
      setTimeout(() => {
        setFading(false) // …and fade back in on the new map
        travelling.current = false
      }, FADE_MS)
    }, FADE_MS)
    return true
  }

  // Preload: current map's models right away, the other maps once things settle
  // (so walking into a gate never lands on a half-loaded world).
  useEffect(() => {
    preloadMap(MAPS[mapId])
    const idle = setTimeout(() => Object.values(MAPS).forEach(preloadMap), 3500)
    return () => clearTimeout(idle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Shared refs — written by the scene each frame, read by the minimap +
  // gesture handlers. Refs (not state) so nothing re-renders at 60fps.
  const targetRef = useRef(null)
  const charPosRef = useRef(new THREE.Vector3())
  const petPosRef = useRef(new THREE.Vector3(1.4, 0, 1.4))
  const zoomRef = useRef(1)
  const gestureRef = useRef({ pinching: false })
  const sparklesRef = useRef([]) // live sparkles, written by Scene, drawn by Minimap

  // ── Pinch to zoom (iPad) + wheel/trackpad (desktop bonus) ──
  const pointers = useRef(new Map())
  const pinchStart = useRef(null) // { dist, zoom }

  const clampZoom = (z) => Math.min(WORLD.zoomMax, Math.max(WORLD.zoomMin, z))

  function onPointerDown(e) {
    setMoved(true)
    unlockAudio() // browsers only allow sound after a user gesture

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      gestureRef.current.pinching = true
      targetRef.current = null // a pinch is not a walk — stop where she is
      pinchStart.current = { dist: pointerDist(), zoom: zoomRef.current }
    }
  }

  function onPointerMove(e) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (gestureRef.current.pinching && pointers.current.size === 2 && pinchStart.current) {
      const ratio = pinchStart.current.dist / pointerDist() // fingers apart → closer
      zoomRef.current = clampZoom(pinchStart.current.zoom * ratio)
    }
  }

  function onPointerUp(e) {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) {
      pinchStart.current = null
      // let the tap-suppression linger one tick so finger-lift doesn't walk
      setTimeout(() => {
        if (pointers.current.size < 2) gestureRef.current.pinching = false
      }, 80)
    }
  }

  function pointerDist() {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y) || 1
  }

  function onWheel(e) {
    zoomRef.current = clampZoom(zoomRef.current * Math.exp(e.deltaY * 0.0015))
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ fov: 42, position: [0, 9, 11], near: 0.1, far: 200 }}
      >
        <color attach="background" args={[MAPS[mapId].sky]} />
        <Suspense fallback={null}>
          <Scene
            key={mapId} // travel = a fresh scene for the new map
            map={MAPS[mapId]}
            spawn={spawn}
            onTravel={travel}
            onSparkleReached={onSparkleReached}
            onStationReached={onStationReached}
            farewellActive={farewellMap === mapId}
            stationRef={stationRef}
            refreshKey={refreshWindow}
            sparkle={sparkle}
            onSparkleExpire={onSparkleExpire}
            mathBusyRef={mathBusyRef}
            collectFnRef={collectFnRef}
            reactUntilRef={reactUntilRef}
            sparklesRef={sparklesRef}
            placing={placing}
            ghostPosRef={ghostPosRef}
            ghostRot={ghostRot}
            placed={placedHere}
            hiddenId={placing?.isMove ? placing.id : null}
            selectedId={selectedId}
            onSelectPlaced={(id) => setSelectedId(id)}
            characterId={state.character}
            petId={state.pet}
            targetRef={targetRef}
            charPosRef={charPosRef}
            petPosRef={petPosRef}
            zoomRef={zoomRef}
            gestureRef={gestureRef}
            buddies={meadow && mapId === 'meadow' ? buddies : []}
            buddyEmotes={buddyEmotes}
          />
        </Suspense>
      </Canvas>

      {/* ── HUD ── */}
      <GemCounter count={gems} innerRef={hudGemRef} />
      <SpeakerButton />
      <div
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 16 + 104 + 12, // left of the minimap (SIZE 104 + gutter)
        }}
      >
        <LevelBar points={points} onLevelUp={onLevelUp} />
      </div>
      <Minimap map={MAPS[mapId]} charPosRef={charPosRef} petPosRef={petPosRef} sparklesRef={sparklesRef} stationRef={stationRef} buddiesRef={buddiesRef} placed={placedHere} />
      {!moved && !meadow && <MoveHint />}
      {toast && <MapToast name={toast} />}
      {note && <NoteToast text={note} />}

      {/* ── Phase 3: shop + placement HUD ── */}
      {!placing && !shopOpen && selectedId == null && !meadow && (
        <ShopButton onOpen={() => setShopOpen(true)} />
      )}

      {/* ── Phase B: the Together Space HUD ── */}
      {/* home: one quiet button, no status, no badge — the agreement to play
          together happens in the living room, not in the app */}
      {!placing && !shopOpen && selectedId == null && !meadow && !math && !station && (
        <TogetherButton onTap={enterMeadow} />
      )}
      {meadow && (
        <>
          <HomeButton onTap={leaveMeadow} />
          <EmoteBar onEmote={sendEmote} />
        </>
      )}
      {placing && (
        <ActionBar
          hint={placing.isMove ? 'Tap where it should go' : 'Tap a spot for it ✨'}
          buttons={[
            { label: '↻', aria: 'Rotate', onTap: () => setGhostRot((r) => (r + Math.PI / 4) % (Math.PI * 2)) },
            { label: placing.isMove ? '✓ Move here' : '✓ Place', aria: 'Confirm', primary: true, onTap: confirmPlace },
            { label: '✕', aria: 'Cancel', onTap: cancelPlace },
          ]}
        />
      )}
      {!placing && selectedId != null && !meadow && (
        <ActionBar
          hint="Your decoration"
          buttons={[
            { label: '✥ Move', aria: 'Move', onTap: () => startMove(selectedId) },
            { label: '↻', aria: 'Rotate', onTap: () => { rotateAsset(selectedId); refreshAssets() } },
            { label: '📦', aria: 'Put away', onTap: () => { pickupAsset(selectedId); refreshAssets(); setSelectedId(null) } },
            { label: '✓ Done', aria: 'Done', primary: true, onTap: () => setSelectedId(null) },
          ]}
        />
      )}
      {shopOpen && (
        <Shop
          gems={gems}
          owned={owned}
          activeSparkle={sparkle}
          onBuy={handleBuy}
          onBuySparkle={handleBuySparkle}
          onPlaceOwned={(o) => startPlacing({ id: o.id, asset: o.asset, pack: o.pack, size: o.size })}
          onClose={() => setShopOpen(false)}
        />
      )}

      {/* ── Phase 4: the math quest (Oscar's popup) ── */}
      {math && (
        <MathPopup
          problem={math.problem}
          skin={math.skin}
          hudGemRef={hudGemRef}
          onAward={onMathAward}
          onPetReact={onPetReact}
          onResult={(correct) => {
            const p = math.problem
            recordAnswer(p.type, p.level, correct, TOPICS[p.type].topLevel)
            if (correct) maybeLevelUp(p.type)
          }}
          onClose={onMathClose}
        />
      )}

      {/* ── Phase 5: the station mini-quest (Oscar's tier-3 encounter) ── */}
      {station && (
        <StationPopup
          quest={station}
          resumeAt={station.resumeAt}
          hudGemRef={hudGemRef}
          onAward={onMathAward}
          onBonusAward={onMathAward}
          onPetReact={onPetReact}
          onWorldReact={onPetReact}
          onResult={onStationResult}
          onClose={onStationClose}
        />
      )}

      {/* ── Phase 5-A: the congratulations, from the team to Ivy ── */}
      {levelPopup && (
        <LevelUpPopup
          level={levelPopup.level}
          message={levelPopup.message}
          from={levelPopup.from}
          onClose={closeLevelPopup}
        />
      )}

      {/* gate-travel fade (also swallows taps mid-travel) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
          opacity: fading ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
          pointerEvents: fading ? 'auto' : 'none',
        }}
      />
    </div>
  )
}

// joinMeadow already fails fast on a refused channel; this bounds the
// slow-network case so the button can never hang silently.
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('meadow-timeout')), ms)
    promise.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    )
  })
}

/** 💞 — the only Together surface in the solo game (bottom-left, quiet). */
function TogetherButton({ onTap }) {
  return (
    <button
      aria-label="Play together in the meadow"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onTap}
      style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left: 16,
        width: 54,
        height: 54,
        borderRadius: 999,
        border: 'none',
        background: '#ffffff',
        boxShadow: '0 4px 14px rgba(43,32,90,0.2)',
        fontSize: 24,
        cursor: 'pointer',
      }}
    >
      💞
    </button>
  )
}

/** 🏡 — leave the meadow (takes the shop button's spot while visiting). */
function HomeButton({ onTap }) {
  return (
    <button
      aria-label="Go back home"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onTap}
      style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        right: 16,
        width: 54,
        height: 54,
        borderRadius: 999,
        border: 'none',
        background: '#ffffff',
        boxShadow: '0 4px 14px rgba(43,32,90,0.2)',
        fontSize: 24,
        cursor: 'pointer',
      }}
    >
      🏡
    </button>
  )
}

/** The meadow's whole vocabulary — four emotes, no text (Phase B rule). */
function EmoteBar({ onEmote }) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 10,
        background: '#ffffff',
        borderRadius: 999,
        padding: 8,
        boxShadow: '0 4px 14px rgba(43,32,90,0.2)',
      }}
    >
      {EMOTES.map((e) => (
        <button
          key={e.kind}
          aria-label={e.kind}
          onClick={() => onEmote(e)}
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            border: 'none',
            background: 'var(--brand-lilac-100)',
            fontSize: 22,
            cursor: 'pointer',
          }}
        >
          {e.emoji}
        </button>
      ))}
    </div>
  )
}

function MapToast({ name }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'max(72px, calc(env(safe-area-inset-top) + 56px))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        background: 'rgba(43,32,90,0.82)',
        color: '#fff',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 0.2,
        pointerEvents: 'none',
      }}
    >
      ✨ {name}
    </div>
  )
}

function GemCounter({ count, innerRef }) {
  return (
    <div
      key={count} // remount on change → the pop animation replays
      ref={innerRef}
      style={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top))',
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px 8px 10px',
        background: '#ffffff',
        borderRadius: 999,
        boxShadow: '0 4px 14px rgba(43,32,90,0.16)',
        fontWeight: 700,
        color: 'var(--brand-iris-900)',
        fontSize: 18,
        animation: count > 0 ? 'gempop 0.35s ease' : undefined,
      }}
    >
      <Gem />
      {count.toLocaleString()}
    </div>
  )
}

function SpeakerButton() {
  const [on, setOn] = useState(getState().soundOn)
  return (
    <button
      aria-label={on ? 'Sound on' : 'Sound off'}
      onPointerDown={(e) => e.stopPropagation()} // a speaker tap is not a walk/pinch
      onClick={() => {
        const next = !on
        setOn(next)
        setSoundOn(next) // persist
        setAudioEnabled(next) // apply
      }}
      style={{
        position: 'absolute',
        top: 'max(64px, calc(env(safe-area-inset-top) + 48px))',
        left: 16,
        width: 42,
        height: 42,
        borderRadius: 999,
        border: 'none',
        background: '#ffffff',
        boxShadow: '0 4px 14px rgba(43,32,90,0.16)',
        fontSize: 19,
        cursor: 'pointer',
        opacity: on ? 1 : 0.72,
      }}
    >
      {on ? '🔊' : '🔇'}
    </button>
  )
}


function ShopButton({ onOpen }) {
  return (
    <button
      aria-label="Open the Gem Shop"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onOpen}
      style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        right: 16,
        width: 54,
        height: 54,
        borderRadius: 999,
        border: 'none',
        background: '#ffffff',
        boxShadow: '0 4px 14px rgba(43,32,90,0.2)',
        fontSize: 24,
        cursor: 'pointer',
      }}
    >
      🛍️
    </button>
  )
}

/** Bottom-center pill of big kid-sized buttons (placement + edit modes). */
function ActionBar({ hint, buttons }) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ padding: '6px 14px', background: 'rgba(43,32,90,0.82)', color: '#fff', borderRadius: 999, fontWeight: 600, fontSize: 13.5 }}>{hint}</div>
      <div style={{ display: 'flex', gap: 10, background: '#ffffff', borderRadius: 999, padding: 8, boxShadow: '0 4px 14px rgba(43,32,90,0.2)' }}>
        {buttons.map((b) => (
          <button
            key={b.aria}
            aria-label={b.aria}
            onClick={b.onTap}
            style={{
              minWidth: 46,
              height: 46,
              padding: '0 16px',
              borderRadius: 999,
              border: 'none',
              background: b.primary ? 'var(--brand-iris-600)' : 'var(--brand-lilac-100)',
              color: b.primary ? '#ffffff' : 'var(--brand-lilac-900)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function NoteToast({ text }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'max(120px, calc(env(safe-area-inset-top) + 104px))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        background: 'rgba(43,32,90,0.88)',
        color: '#fff',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 15,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  )
}

function MoveHint() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'max(28px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        background: 'rgba(43,32,90,0.82)',
        color: '#fff',
        borderRadius: 999,
        fontWeight: 600,
        fontSize: 15,
        letterSpacing: 0.2,
        pointerEvents: 'none',
      }}
    >
      Tap anywhere to walk there ✨
    </div>
  )
}
