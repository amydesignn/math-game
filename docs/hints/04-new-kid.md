# 04 — The new kid: a cold first run of Luxi Math

**Tester:** newkid-tester (Team 1, Discovery) · **Date:** 2026-10-17 · **Build:** live math.luxi.land
**Setup:** guest only, fresh state (localStorage cleared, then a new tab). Desktop pass in a 1024×768 pane, tablet pass at 768×1024.
Nothing was signed up or submitted. Sound is on in Settings, but the pane plays no audio, so **audio was not assessed**.
Screenshots: `shots/` next to this file (named `NN-what.jpg`).

---

## 1. Timeline of the first run (desktop)

| t (approx) | What the kid sees | What they understand / miss |
|---|---|---|
| 0:00 | **Door** behind a blurred **Welcome** modal (`01`). A big gem and "What is Luxi Math?", with 2 sentences. 6 dots. | The gem is clear. The words "math practice game... spend them building a world" are a parent's pitch, not a kid's. |
| 0:10 | **How to Play 1** "Pick your character & map" | The Door has **no character picker**. Heroes are hidden in the Gem Shop. The promise doesn't match the screen. |
| 0:20 | **2** "Explore & collect gems... gem and bonus stations" (`02`) | The game never uses the words "gem station" or "bonus station". In-world they're called **Snack Time** and **Picnic quest**. |
| 0:25 | **3** "Build your world" (`03`) · **4** "Add some sparkle" (`04`, image box **empty** at first) | The images lag on a fast Next. Steps 1–3 showed the same picture in my shots, and step 4 was blank. The steps are text plus a still photo, with nothing to *do*. |
| 0:30 | **What's next**: "Meet friends SOON", "Lots more SOON" (`05`) | Two "coming soon" cards are the last thing a kid reads before playing. They teach nothing. |
| 0:35 | "Let's play" → **a second modal straight away**: Halloween "Trick or treat?" (`06`) | Two popups back to back before any play. Treat gives "some gems" with no number. Trick says "+3 gems", so the two branches don't match. |
| 0:45 | **Door** (`07`): 5 world cards, no gem count visible. "Today's Quest: Visit Merry Market +1" sits at the bottom-left. | A kid picks the first card, Forest Clearing ("Where every journey begins"). The quest is easy to miss, and on tablet it's below the fold. |
| 1:00 | **World** (`08`): very close camera, the cat **fills the foreground**, HUD icons with no labels | **No prompt, arrow or hint.** No gem or station is on screen. Tap-to-walk works, but nothing says so. |
| 1:00–2:30 | Wandered, got stuck behind a tent and at the tree line (the camera hides the character) | **Stuck #1 (~1.5 min).** I only found **scroll/pinch to zoom out** by accident. Once zoomed out, a teal diamond in a ring showed up. |
| 2:45 | Walked into the diamond → **"SNACK TIME — Your pet wants a snack!" 32 × 20** (`09`) | Surprise: the "gem" is framed as feeding the pet. The **first problem is 2-digit × 2-digit**, which is a hard cold open for a 7-year-old. |
| 3:00 | Correct → "Nice work! Yum! Your pet is happy. +1 💎" | **First earned gem ≈ 3 min.** The diamond vanished. The HUD shows two numbers side by side (points `4`, gems `4`), and nothing says which is which. |
| 3:30 | Walked onto an orange-glow gate → **teleported to Sunny Town** (`10`) | **Found by accident.** No label said "gate" or where it leads. A kid may not realise they changed world (only the small name under the minimap changed). |
| 4:00 | Snack: 99 ÷ 9 with **two boxes, "EACH SHARE" and "LEFT OVER"** | A 7-year-old needs to know remainders here. There's a "Show me how" link. |
| 4:30 | **"Picnic quest! ✨"** label + an apple → "Your pet is extra hungry — a whole picnic! 2 snacks to go" (`11`) | This is the only floating text label in the world, and it's the clearest call to action I saw. |
| 5:00 | Gave a wrong answer on purpose → **long-division walkthrough** "Let's share the candy" (`12`) | About 10 steps. The words DIVIDEND/DIVISOR/QUOTIENT are a heavy read, and it teaches **90 ÷ 9** when I was asked 20 ÷ 2. |
| 6:00 | Quest complete, +2 earned +1 bonus → **8 gems**. Opened the 🛍️ (I was guessing it's a shop). | **Gem Shop** (`13`) opens on **Heroes → Hats → Staffs → Companions → Magic**. Things to *build* start about 5 screens down. |
| 6:30 | First tap on a build item did nothing visible. A second tap showed **"Buy 💎5"**. | Two-tap buy. **Stuck #2 (short):** a tap on the card edge didn't select it. |
| 7:00 | Buy → "Tap a spot for it ✨" + ↻ / ✓ Place / ✕ bar (`14`) → placed a Basketball hoop (`15`) | Placement is clear. **First build ≈ 7 min.** But the object is tiny and there's **no celebration** when it lands. |
| 7:30 | Wanted "the garden". Rosy Garden on the Door looked like the obvious place. Tapped 🧺 bottom-left instead. | Basket says "**Grow flowers in Sunny Town** and pick them" (`16`). That is **the only clue to where the garden is.** |
| 8:30 | Walked to a bare dirt bed near the Sunny Town gate → "**Your garden 🌱** · Plant your seed" (`17`) | **Garden found ≈ 8.5 min, only because of the basket text.** The bed has no sign or glow from a distance. |
| 8:45 | Planted (free) → "💧 Water · 5 💎" **disabled**: "Water costs 5 💎 — solve a problem to earn more!" (`18`) | **Stuck #3.** I had spent on the hoop and had 3 gems. Nothing had warned me that the garden needs gems. |
| 9–12:00 | Walked across the map for 2 more snacks (4 → 5 gems), walked back, watered → sprouts (`19`). It asks for water again. | **No sign of how many waters are left** until bloom. 5 gems ≈ 2–5 problems per water, plus long walks between stations. |
| 12:30 | Tried Rosy Garden (`20`): flower beds, veg plots, a shed, a "Watering time! 💧" label | **Decoy.** It looks exactly like the place to garden, but tapping the plots does nothing. |

**Tablet (768×1024 portrait) differences**
- Door (`21`): the worlds grid comes first. The hero card, the "Today's Quest" bar and the Level card sit **below the fold**.
- World (`23`): the camera is even closer. The character is about 40% of the screen and the cat blocks the lower right. **No station is visible at spawn.** The kid has to pinch to zoom out, and nothing teaches that.
- HUD buttons (Exit, 🛍️, ⚙️, 🧺) are small, about 40px, in the four corners. The 🧺 sits bottom-left, far from the other buttons.
- Gem Shop: the hero thumbnails were **blank for about 1–2s** on first open (text-only tiles), then loaded.
- I skipped the Welcome with ✕. The Halloween popup still came right after, which is right for a promo but makes 2 modals before play.

---

## 2. The three core actions: what it took to find them

| Action | Found at | How | What blocked or confused |
|---|---|---|---|
| **Gain gems** | ~2:45 | By accident, after zooming out | No pointer to the first station. The camera hides it. It's framed as a pet snack, not a gem. The first problem is 32×20. |
| **Build** | ~7:00 | Guessed the 🛍️ icon | The shop opens on dress-up, and build items are far down. Two-tap buy. No celebration once placed. |
| **Grow** | ~8:30 find, ~12:00 first water | Only through the 🧺 basket's empty-state text | The garden lives in Sunny Town, not Rosy Garden. The bed has no beacon. Water costs gems the kid already spent. The number of waters is hidden. **Onboarding never mentions the garden.** |

The **gain → build → grow loop** is never shown as one loop. Each part is found on its own, and grow competes with build for the same gems with no warning.

---

## 3. Features found only by poking around

- **Heroes picker** (13 heroes, 10 locked 💎50): only in the Gem Shop. The Door's hero card isn't tappable, and the 🙂 avatar opens *photo upload*, not heroes.
- **Wardrobe** (Hats/Staffs, 💎10): in the Gem Shop, shown only while you play the Sorcerer.
- **Companions** (Cat, Sproutling 💎50) and **Magic sparkle trails** (2–4 💎 for 15 min): in the Gem Shop. Nothing in the world points to them.
- **Gates/teleport:** stone pillars with a coloured ring. I found one by walking into it. The colour is the only signpost, and a kid can't read it yet.
- **Zoom out** (scroll on desktop, pinch on iPad): never taught, and it changes the whole game. Before zooming you can't see anything to do.
- **Minimap:** looks like a button but tapping it does nothing. The station dots are 2–3px.
- **Level panel** (tap the Level pill): "points" vs "gems" and Warm-up / Challenge / Expert counts. Nobody would think to tap it.
- **Picnic quest / bonus stations:** only these have a floating label. Plain sparkles have none.
- **"Show me how"** on division: a helpful link in small underlined text.
- **Settings → How to Play:** replays the same 6-card onboarding. It still doesn't mention the garden, the basket or zoom.
- **Today's Quest** on the Door ("Visit Merry Market +1"): the only goal-shaped thing in the game. It's easy to miss and isn't repeated in-world.

---

## 4. Reading load (for a 7-year-old)

- **Before any play:** about 110 words across 7 modal screens (6 onboarding + Halloween), most at a Grade 3–4 level. Words like "assets", "companion", "entirely", "signed-in players" and "emoji" are hard for a 7-year-old.
- **Each problem:** a one-line framing ("Your pet wants a snack! Solve it to fill the bowl.") and a hint line. That's fine. The **division recovery** is the heaviest read in the game: about 10 caption cards plus DIVIDEND / DIVISOR / QUOTIENT labels.
- **Icon-only and clear:** ‹ Exit (it has a word), 💎 counter, keypad, ✓ Place / ↻ / ✕, 🌱 Plant, 💧 Water.
- **Icon-only and unclear:** 🛍️ (a kid might not read it as "shop"), 🧺 (no hint it's about the garden), ⚙️ (fine for adults), the two numbers in the Level pill (points vs gems look alike), the minimap, and the gate rings (colour only).
- **Text-only signposts:** "Grow flowers in Sunny Town" (basket) and "Water costs 5 💎 — solve a problem to earn more!" are the **only places the game explains the loop**, and both are text a pre-reader can't use.

---

## 5. What Onboarding.jsx *says* vs what I experienced

(Read-only skim of `math-game-explore/src/ui/Onboarding.jsx`, after playing.)
- It's a **6-step carousel**: an INTRO plus 4 CORE steps plus "What's next". The header comment still says "5-step". Every step is text plus an image, and there's no in-world step.
- **Step 1** promises "Choose your character and a companion, then pick a map". There is no such step in the flow. Characters and companions live in the shop.
- **Step 2** names "gem and bonus stations". The world calls them **Snack Time / Picnic quest**, and there's no shared word or icon tying the slide to the station.
- **Step 3** "Spend your gems on assets": "assets" is a dev word. Nothing says where the shop is (🛍️).
- **Step 4** "sparkle trail" is a 15-minute consumable. It gets a whole slide, while **the garden gets none and zoom gets none**.
- The **media** files exist and differ (`public/onboarding/step-1..4.jpg`, 10–26KB). They aren't preloaded, so on fast taps the old image or an empty box shows. Step 3's image is Merry Market, not the kid's own world.
- The design history in the comments ("players felt trapped", added ✕ plus scrim-dismiss) means a kid can also **skip the whole thing with one tap**. That's right, but then nothing teaches anything.

---

## 6. Proven kids'-game first-run patterns (GENERAL KNOWLEDGE, not observed here)

> This section is general industry knowledge from kids' and casual game design, not something I saw in Luxi Math.

1. **Teach by doing, one verb at a time.** Each mechanic is introduced the moment it's needed, with a prompt like "Tap the glowing gem!", never on upfront slides. 7–11-year-olds skip or forget slides. Doing it builds the memory. (Toca Boca, Prodigy, Nintendo's first-level design.)
2. **A pointing hand or bouncing arrow** on the one thing to tap next, plus dimming everything else ("spotlight"). It works for pre-readers and needs zero text.
3. **A guide character** who says the next step in a speech bubble, ideally with voice-over. Here, the pet is the natural one: it already "wants a snack". Kids follow a character more readily than a UI. (Animal Crossing's Tom Nook, Prodigy's guide.)
4. **A tiny quest chain with an instant reward at each step:** get 1 gem → buy 1 thing → place it → plant → water → pick. The core loop *is* the tutorial, and every step pays out. A checklist of 3–5 items with ticks gives a clear "what now".
5. **Guaranteed first success.** The first problem is the easiest one, the first station is on screen at spawn, and the first purchase is affordable. The first minute should never fail.
6. **Protect the loop's economy in the tutorial.** Give a free first watering or gate the shop until after the first plant, so a kid can't spend themselves into a dead end (what happened to me at 8:45).
7. **Show, don't tell:** beacons and particles on goals, a breadcrumb trail on the ground, and an off-screen indicator arrow at the screen edge pointing to the nearest station. These read faster than any minimap for ages 7–11.
8. **Minimal reading, plus audio.** Short word labels (max ~5 words) plus icons, with optional read-aloud. Many 7-year-olds read slowly, so audio cues (a chime near a station, a "ding" when affordable) carry meaning without text.
9. **Celebrate every first.** A big moment the first time you earn, build or bloom (confetti, a sound, the pet dancing) marks it as an achievement and makes it memorable.
10. **Progressive disclosure.** Hide or lock the advanced shelves (heroes, hats, sparkle) until the core loop is done once. Then unlock them with a "New!" badge so they're *discovered*, not buried.
