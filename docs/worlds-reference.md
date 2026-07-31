# The five worlds — reference for the door's world cards

_Written 2026-07-30 by Nathan, for Oscar. Values read from `src/maps.js`._

**Decided (Amy, 2026-07-30):** the existing worlds keep their names. The sketch's
world names (Number Reef, Crystal Caves, Frost Peak, Mushroom Hollow) were vibe,
not a rename — so these five are what the door's cards should show.

---

## The ring

The five worlds form a **loop**, and a player discovers them by *walking into
gates* — never from a menu. Each world has exactly two gates, west and east, so
"onward" always finds somewhere new and eventually brings you home.

```
Forest Clearing ⇄ Sunny Town ⇄ Rosy Garden ⇄ Merry Market ⇄ Star Arcade ⇄ (back to Clearing)
```

**Colour is the signpost.** A gate glows in the colour of the world it leads to —
there is no text on a gate. That's worth preserving in the door's cards: if a card
uses its world's `gate` colour as its accent, the door and the world teach the
same colour language.

---

## The palettes

Every value is live in `src/maps.js`.

| World | id | Ground | Outside | Sky | Gate accent |
|---|---|---|---|---|---|
| **Forest Clearing** | `clearing` | `#c7e6b8` | `#aec49e` | `#eae6f7` | `#5fbf63` |
| **Sunny Town** | `town` | `#f9d9a8` | `#ddba85` | `#fdeedd` | `#f0a03c` |
| **Rosy Garden** | `garden` | `#fad4e6` | `#d8abc4` | `#fbe9f3` | `#ef7fb5` |
| **Merry Market** | `market` | `#fdf0b8` | `#dcc98c` | `#fdf6e3` | `#f2c530` |
| **Star Arcade** | `arcade` | `#ddcef6` | `#b4a3d8` | `#efe8fb` | `#8f6fe8` |

- **Ground** — the playable floor
- **Outside** — the same land beyond the boundary, deliberately muted so "the edge
  of the world" is visible in-world rather than an invisible wall
- **Sky** — the background
- **Gate accent** — how gates *leading to* this world glow. The card accent.

> ⚠️ **Don't eyedropper a screenshot and expect these hexes.** The scene is lit
> with a lilac ground-light, which visibly shifts everything — greens go sage,
> yellows drift toward dijon. Two of the values in the code carry comments saying
> they were deliberately over-brightened to survive it. **The hex table is the
> intent; a render is the result.** For flat card art, work from these values.

---

## What's actually in each world

**Forest Clearing** — `clearing` · the first world, where everyone begins.
Tall and short trees, rocks, stones, small plants, a flag, and a tent in the
south-west corner. Open, uncluttered, campsite-ish. *The one Ivy sees first.*

**Sunny Town** — `town` · warm orange ground.
Four little houses (composed from a building kit, each with a door facing a
different way and some with round windows), a pavilion, open stairs, a fenced run
along the south path, two thin columns marking the square like lampposts, and a
patch of dirt with a few plants. *A small settlement you can walk between.*

**Rosy Garden** — `garden` · pink ground.
A ruined colonnade wandering the west side, flower beds with border edging and
plants inside, and soft forest touches. *Prettiest and most still of the five.*

**Merry Market** — `market` · bright yellow ground.
Fruit and bread stalls facing the spawn, a continuous aisle of shelves behind
them, a frozen corner, a checkout, and stray carts and a basket left around the
square. Entrance framing and a bit of green. *The busiest and most "shop"-like.*

**Star Arcade** — `arcade` · violet ground.
A row of arcade cabinets with screens facing the spawn, big machines (claw,
dance, pinball) in their own spots, a prize corner, snacks and pillars.
*The most toy-like; a slot machine in the source pack was deliberately left out.*

---

## Two things that affect how they should be drawn

**Scale is deliberately small.** The characters are Kenney "mini" figures, and the
market/arcade/forest packs are designed 1:1 with them — they're placed at scale 1
on purpose. The one exception is the building kit in Sunny Town, dropped to 0.8,
because full-size kit walls tower about 3× over a mini character. If a card's art
makes props feel monumental next to the character, that's the opposite of how the
worlds actually read.

**The camera is a steep 3/4 top-down** (offset `[0, 9, 6.5]`), close behind the
character. A player never sees a whole world at once — they see their character,
their pet, and a few props at a time. A card showing a sweeping vista would be
lovely, but it's a promise the camera doesn't keep.

---

## About screenshots

Amy's plan was to screenshot the worlds for the cards. That's the right call, and
**capturing them from a real device beats anything automated**: the browser-pane
harness freezes animation between frames and injects phantom taps, so driving it
headlessly produces stiff, badly-framed shots at the default zoom.

Two minutes on the Mac or the iPad gets far better material — walk into each
world, pinch out a little, and capture. Live shots also catch the things that
make the worlds feel alive (a sparkle, a station ring, the pet trailing behind)
which a cold capture never will.

⚠️ **Screenshots go stale.** Worlds change — new props, placed assets, station
rings. If a world is reworked, its card art needs re-shooting. The palette table
above doesn't have that problem, which is why it's here.
