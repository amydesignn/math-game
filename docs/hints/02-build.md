# 02 — BUILD (spending gems): build-scout findings
Source: /Users/amy/projects/math-game-explore/src (origin/main, read-only). Paths relative to src/.

## 1. Entry points and costs
- **Gem Shop** (the ONE hub for shop, heroes, wardrobe, companions, sparkle, size tiers): a single HUD button,
  `RoundHudButton aria="Open the Gem Shop"`, a white 50px circle with only the emoji 🛍️ (no label) — App.jsx:1038-1040
  (component App.jsx:1308-1330). `onTap -> setShopOpen(true)`. Free to open.
- There is NO second entry. Heroes, Hats/Staffs, Companions, Magic and Size are all SECTIONS inside the same bottom sheet
  (ui/Shop.jsx), in this order: Your things (only if owned.length>0, :64) -> Heroes (:88) -> Hats/Staffs (:138, ONLY if
  character===PLAYER 'sorcerer') -> Companions (:200) -> Magic sparkle (:247) -> "How big?" (:285) -> 1 shelf per theme
  (forest, market, arcade, skate, dungeon, castle: SHOP_CATEGORIES, :313). So the buildable items are at the very BOTTOM of a
  72%-height scrolling sheet, below ~13 hero tiles, 8 gear tiles, companions and 5 sparkles. Big discoverability issue.
- The Door (hub) has no shop entry (grep: no Shop in Door.jsx). The Merry Market MAP is not a shop: Market.jsx is
  purely procedural decor (awnings, fountain, bunting, crates, planters via MARKET_FX). Nothing in-world opens the shop.
- Shop button and Exit hide while `placing`, `shopOpen`, `selectedId!=null`, `meadow`; button also absent in Together meadow
  (replaced by HomeButton). Mobile (<=600px): `.hud-left` drops below the top row, 48px (index.css:337-341).
- Prices (config.js): SHOP assets 2-8 gems (forest 2-6, market 3-4, arcade 5-6, skate 2-6, dungeon 2-5, castle 2-8, SHOP at
  :131-183); size multiplies price x1/x2/x3 (SIZES :197; "Normal / Big x2 / Huge x3"); Hats/Staffs: first colour free, others
  10; Companions: Cat free, Sproutling 50 (:31-34); Heroes: Sorcerer, Sunny, Bookworm free; 10 others 50 each (:63-77);
  Sparkle 15-min trail 2/2/3/3/4 (:231+). A new kid's first assets are affordable after ~1-2 solved problems; 50-gem
  items are the "save up" tier.

## 2. Placing flow (what happens, step by step)
1. Shop sheet -> scroll to a themed shelf -> tap tile: selects it (3px iris outline) and the price swaps to a pill
   "Buy 💎N" (Shop.jsx:326-343). Unaffordable tile does nothing (`affordable && setSelected`, :328).
2. Tap the pill (tile-inside-a-tile; `<span onClick>` with stopPropagation, :336) -> `handleBuy(item,size)` App.jsx:413.
   `buyAsset()` store.js:844 deducts gems, pushes `{id,asset,pack,size}` to `state.owned`. Then `startPlacing()` (App.jsx:403):
   `setShopOpen(false)`, `setPlacing({id,asset,pack,size})`. Shop closes automatically; no "bought!" toast.
3. Placement mode: translucent Ghost (3D, world/Ghost.jsx) appears at char pos + (1.8,1.8) (Scene.jsx:192). Bottom-center
   ActionBar (App.jsx:1082-1090, comp :1485) with hint "Tap a spot for it ✨" and 3 buttons: ↻ (aria "Rotate", 45deg) /
   "✓ Place" (aria "Confirm", primary) / ✕ (aria "Cancel"). Tapping the ground moves the ghost instead of walking
   (Scene.jsx:208). Walking/other HUD is hidden during `placing`.
4. Confirm -> `confirmPlace` (App.jsx:421): rejects within 2.4 of a gate with NoteToast "Too close to the gate — pick another spot ✨";
   else `placeAsset(id,mapId,x,z,rot)` store.js:854, `setPlacing(null)`. Cancel keeps the item in "Your things".
5. Editing later: tap a placed asset in the world (Scene.jsx:401, 3D group onPointerDown) -> `selectedId` -> gold ring + ActionBar
   "Your decoration": ✥ Move (aria "Move") / ↻ (aria "Rotate") / 📦 (aria "Put away", back to inventory, no refund) / "✓ Done" (aria "Done").
   Tapping ground = done editing (Scene.jsx:214).
What a kid must FIGURE OUT unaided: (a) that 🛍️ is the shop; (b) scroll far down for decor; (c) two taps to buy (select then
pill); (d) the ghost needs a TAP to move and a separate confirm; (e) rotate exists; (f) that placed items are tappable to
move/rotate/put away (the only hint is "Your decoration" AFTER selecting; nothing says "tap what you placed"); (g) size tiers
x1/x2/x3 are chosen BEFORE buying and scale price; (h) cancelled/unplaced items live in "Your things — tap to place".

## 3. Locked vs free, afford cues
- No level-gates anywhere. Everything is gem-priced only; free = price 0 (Cat, Sorcerer, Sunny, Bookworm, blue hat, purple staff).
- Affordability is computed per tile in Shop.jsx: unaffordable = grey emoji/thumb (`grayscale(1)`, opacity .5), neutral surface,
  secondary text colour, `aria-disabled`, tap does nothing (no message). Affordable = lilac tile, primary text. Heroes locked
  show "🔒 💎50" always (even affordable); unaffordable gear/companion just "💎 N" in grey. No "need N more" text, no
  progress-to-goal, no shake/toast on tapping a greyed tile. Gem balance is in the sheet header ("💎 {gems}", :57).
- Size note appears only when size>1: "{n}x bigger — so everything costs {n}x more ✨" (:306). Owned + equipped: "Playing 💜" /
  "Wearing 💜" / "With you 💜". Owned unequipped: "Play" / "Wear" / "Choose" (one tap, free swap).
- Buying hero/pet/gear applies immediately (store.buyHero/buyPet/buyGear set character/pet/gear); only assets go to placement.
- Gem cap retired (config.js:256), balance is uncapped.

## 4. What explains building today (and weak spots)
- Onboarding.jsx (first-run once + Settings > "How to Play"): 6 cards. Only step 3 "Build your world — Spend your gems on assets to build a
  world that's entirely your own." (CORE[2], :46, images /onboarding/step-3.jpg) and step 4 "Add some sparkle". Never says WHERE the shop is,
  names no button, no mention of tap-to-place, heroes, companions, wardrobe. Shown over the Door BEFORE she has ever seen the world HUD
  (App.jsx:81, `!state.seenOnboarding`), so it's an abstract slideshow. Step 1 mentions "character and a companion" with no how.
- MoveHint (App.jsx:1553): "Tap anywhere to walk there ✨" until `moved` — the only in-world HUD hint, about walking.
- Shop.jsx header comment (:14-21) documents the flow for devs; in the UI only: section labels ("Your things — tap to place", "How big?"),
  ActionBar hints ("Tap a spot for it ✨", "Tap where it should go", "Your decoration"), NoteToast. No coach marks, no first-time tips.
- Gaps in explanation: shop button is emoji-only; no "you have N gems, you can buy X" nudge; nothing after the first solved
  problem says "spend your gems"; nothing tells a kid they can swap hero/pet for free; hats/staffs only show for the Sorcerer
  (swapping hero silently removes those shelves); Sparkle trail is 15 minutes then vanishes (consumable, buys feel risky);
  travel gates are glowing rings with a colour but no label/explanation (Gate.jsx comment: "learn pink glow = pink world without text").

## 5. Hook points (exact names)
No event bus. State is a module singleton in store.js (`getState()` store.js:459; `save()` :451); App.jsx mirrors to React state via
`setGems(getState().gems)` and `refreshAssets()` (sets `placed`, `owned`). `metrics.js` exports `enteredWorld, travelled, leftWorld,
answered, gardenEvent, questDone` (no shop events). No subscribe/listener API.
Derivable moments (App.jsx handlers, add a one-line `guide.notify(...)` in each):
- shop opened: `setShopOpen(true)` at App.jsx:1039; closed: `onClose={() => setShopOpen(false)}` :1126. React state `shopOpen`.
- first asset purchase: `handleBuy` App.jsx:413 (after `buyAsset` returns id). Store signal: `getState().owned.length>0 || world.length>0`.
- placement started: `startPlacing` :403 / `placing` state; confirmed: `confirmPlace` :421 (store `placeAsset` :854, `world.push`);
  cancelled: `cancelPlace` :434; moved: `startMove` :440 -> `moveAsset` :862; rotated: `rotateAsset` :873 / `setGhostRot`; put away: `pickupAsset` :882.
- placed asset selected: `onSelectPlaced -> setSelectedId` (Scene.jsx:404, App.jsx:1001).
- hero/pet/gear: `handleBuyHero/ChooseHero/BuyPet/ChoosePet/BuyGear/WearGear` App.jsx:353-380 -> store `buyHero, setCharacter, buyPet,
  setPet, buyGear, setGear` (store.js:469-545). Sparkle: `handleBuySparkle` :351 / `buySparkle` store.js:721.
- affordability trigger: React `gems` (App) vs `SHOP[].price`; min asset price 2, min paid pet/hero 50. `lifetimeGems`/`gems` in store.
- first-run: `state.seenOnboarding`, `markOnboardingSeen()` store.js:563, `state.played`, `markPlayed()`; `showOnboarding`, `settingsOpen` React state.
- travel: `travel(toId)` App.jsx:829 (sets `mapId`, `setMap`, toast).
- Persisted guide-state could live in store.js freshState() (:15-85) like `seenOnboarding`; migration pattern at :364.
- Dev hooks only (DEV builds): `window.__walk`, `__dbg`, `__award(n)`, `__level`, `__sparkles`; none for shop. Useful for testing guide.

## 6. Pointable UI targets
DOM (HUD, `position:absolute` over the Canvas; zIndex unset except modal scrims 1000):
- 🛍️ Gem Shop: `button[aria-label="Open the Gem Shop"].hud-round` inside `div.hud-left` (top-left column, 16px from left, under Exit);
  50px (48 on phone, below the stat row). Exit: `button.hud-exit[aria-label="Exit to the Door"]`.
- Gem counter: `.lvlbar-pill` in `div.hud-stats` (top-right, left of 104px minimap); aria "Level N, x of y points. Tap to see your progress."
  (LevelBar.jsx:119-128); a `gemRef={hudGemRef}` exists for fly animation (App.jsx hudGemRef).
- Settings: `button[aria-label="Open Settings"]` in `.hud-stats`; How to Play row in Settings.jsx:264.
- Shop sheet: `div[role="dialog"][aria-label="Gem Shop"]`; close `button[aria-label="Close shop"]`. Tiles are unlabelled buttons (hero tiles
  have aria-label `Name, locked, N gems` or name; no ids/data-attrs on asset/pet/gear tiles; buy pill = a `span`). A guide must add `data-guide`
  attributes (e.g. on tile, size row, SectionLabel) to target reliably. Sheet scrolls (`overflowY:auto`), so pointer targets need scrollIntoView.
- Placement ActionBar: buttons `[aria-label="Rotate"]`, `[aria-label="Confirm"]`, `[aria-label="Cancel"]`; edit bar: `Move`, `Rotate`, `Put away`, `Done`.
  ActionBar is bottom-center fixed (App.jsx:1485).
- Minimap top-right (Minimap.jsx) shows placed things.
3D (inside R3F Canvas, no DOM, needs world->screen projection or a CSS overlay anchored by camera.project):
- Placement ghost (Ghost.jsx) at `ghostPosRef.current = [x,z]` (App ref, Scene.jsx:195/210).
- Placed assets (Scene.jsx:398-410), selection ring (gold). Character `charPosRef`, pet `petPosRef` refs (App) give world positions.
- Travel gates: `map.gates[].position` in maps.js (e.g. clearing east/west gates at x=+-16, z~2); Gate.jsx glow ring colour = destination.
- Merry Market stalls are decor, not shop targets (don't point there).

## Discoverability gaps (ranked)
1. Shop = one unlabelled 🛍️ circle; first-run onboarding never names it or shows the HUD. Strongest, simplest fix point.
2. Decor (the thing "build" means) is the LAST section in a long sheet after Heroes/Hats/Companions/Magic; a kid opening the shop sees heroes, not "build".
3. Two-tap buy (tile then small pill) is invisible; greyed tiles are silently dead (no "N more gems" or why).
4. After buy, shop vanishes into placement mode with no explanation beyond a small hint pill; ghost needs tap + Confirm; rotate/cancel are icon-only.
5. Editing placed things (move/rotate/put away) requires knowing to tap a placed asset; nothing teaches it. Also unplaced items hide in "Your things".
6. No trigger connects earning to spending: nothing fires when she first has enough gems for the cheapest item (2) or the first 50-gem tier.
7. Size tiers (x2/x3 cost multiplier) and free swaps (hero/companion/hat) are unexplained; hat/staff shelves vanish for non-Sorcerer heroes.
8. Gates/teleport: colour-coded rings, no label; Merry Market looks like a shop but isn't.
