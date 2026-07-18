import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './world/Scene'
import Minimap from './ui/Minimap'
import Shop from './ui/Shop'
import Gem from './ui/Gem'
import MathPopup, { SKINS } from './ui/MathPopup'
import StationPopup from './ui/StationPopup'
import { nextProblem, maybeLevelUp, TOPICS } from './math'
import { stationFor } from './stations'
import { getState, setMap, addGems, setSoundOn, recordAnswer, setStationSolved, completeStation, buyAsset, placeAsset, moveAsset, rotateAsset, pickupAsset } from './store'
import { setupAudio, unlockAudio, setAudioEnabled, setFocusMode } from './audio'
import { WORLD, GEMS } from './config'
import { MAPS, arrivalPoint, preloadMap } from './maps'

const FADE_MS = 380 // gate-travel fade half-duration (out, swap, in)
const TEASER = 'More gems coming with math! ✨' // the beta-cap lock message (Finn's brief)

export default function App() {
  const [state] = useState(getState)
  const [moved, setMoved] = useState(false)

  // ── Phase 2: gems + beta cap ──
  const [gems, setGems] = useState(state.gems)
  const [teaser, setTeaser] = useState(false)
  const teaserTimer = useRef()

  function showTeaser() {
    setTeaser(true)
    clearTimeout(teaserTimer.current)
    teaserTimer.current = setTimeout(() => setTeaser(false), 4000)
  }

  // already at the cap when the game opens → say why the sparkles are gone
  useEffect(() => {
    if (getState().gems >= GEMS.cap) {
      const t = setTimeout(showTeaser, 1500)
      return () => clearTimeout(t)
    }
  }, [])

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
    const total = addGems(n)
    setGems(total)
    if (total >= GEMS.cap) showTeaser()
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

  function handleBuy(item) {
    const id = buyAsset(item, item.price)
    if (id == null) return
    setGems(getState().gems)
    refreshAssets()
    startPlacing({ id, asset: item.asset, pack: item.pack })
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
    if (w) startPlacing({ id: w.id, asset: w.asset, pack: w.pack, isMove: true, startAt: [w.x, w.z], rot: w.rot })
  }

  // ── Maps: which one we're in, where this visit starts, travel fade + toast ──
  const [mapId, setMapId] = useState(() => (MAPS[state.map] ? state.map : 'clearing'))
  const [spawn, setSpawn] = useState([0, 0])
  const [fading, setFading] = useState(false)
  const [toast, setToast] = useState(null)
  const travelling = useRef(false)
  const toastTimer = useRef()

  // the assets she's placed in the map she's standing in (mapId lives just above)
  const placedHere = placed.filter((w) => w.map === mapId)

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
          />
        </Suspense>
      </Canvas>

      {/* ── HUD ── */}
      <GemCounter count={gems} innerRef={hudGemRef} />
      <SpeakerButton />
      <Minimap map={MAPS[mapId]} charPosRef={charPosRef} petPosRef={petPosRef} sparklesRef={sparklesRef} stationRef={stationRef} placed={placedHere} />
      {!moved && <MoveHint />}
      {toast && <MapToast name={toast} />}
      {teaser && <TeaserToast />}
      {note && <NoteToast text={note} />}

      {/* ── Phase 3: shop + placement HUD ── */}
      {!placing && !shopOpen && selectedId == null && (
        <ShopButton onOpen={() => setShopOpen(true)} />
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
      {!placing && selectedId != null && (
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
          onBuy={handleBuy}
          onPlaceOwned={(o) => startPlacing({ id: o.id, asset: o.asset, pack: o.pack })}
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

function TeaserToast() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'max(120px, calc(env(safe-area-inset-top) + 104px))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        background: 'var(--star-gold)',
        color: '#4a3305',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 0.2,
        boxShadow: '0 4px 14px rgba(43,32,90,0.22)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {TEASER}
    </div>
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
