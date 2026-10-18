# Camera trial: how often is something to do on screen at arrival?

Clover, 2026-10-18. This is a measurement only. No source was changed. The dev server ran on 5180 from this worktree, in headless Chrome (swiftshader) driven over CDP with Node's global WebSocket. playwright-core isn't installed here, so I used the same approach without npm. The script is `camera/measure.mjs`.

## Method
- **The spawn rules are the game's own,** copied from `Scene.spawnSparkles` and `stations.pickSpot`, with a seeded RNG: 3 gems per visit, and a station on a map 50% of the time (2–3 of 5 maps a day). There are 400 seeds per spawn point on each of the 5 maps. Every gate arrival (`arrivalPoint`) is included.
- **The camera is the game's camera:** fov 42, `camOffset [0,7,8]` × zoom, looking at the spawn point.
- **The maths is checked against the real game.** My projection of her silhouette matches the game's own `__hintAvoid()` box to the pixel at 1×, 1.4× and 1.8× (iPad: 312.7/388.7/455.3/613.8 for both). The 1× iPad screenshot also agrees: none of the 3 live gems is in view, as predicted.
- **"On screen"** means the gem (at y 0.9) or the station projects at least 16 px inside the viewport.
- **"Clear of HUD"** also means it isn't under a measured HUD rect (every `[data-hint]`, button and the minimap + its label, with 8 px of slack). That column counts gems only.

## Headline: first arrival (Play from the Door = map centre), share of arrivals with a gem or station on screen
| Screen | 1× (today) | 1.4× | 1.8× | 2.2× (max) |
|---|---|---|---|---|
| **375×812 phone** | **8%** (gem clear of HUD 1%) | 28% (9%) | 40% (24%) | 50% (36%) |
| **768×1024 iPad portrait** | **13%** (8%) | 45% (28%) | 64% (55%) | 78% (71%) |
| **1024×768 iPad landscape** | **30%** (20%) | 77% (61%) | 92% (85%) | 98% (96%) |

Arriving through a gate is worse at every zoom. On iPad portrait it's 15 / 34 / 46 / 55%, and on the phone 10 / 23 / 32 / 38%: she faces into the map with the gate behind her.

**By map, iPad portrait, centre arrival:**
- Forest Clearing (the first card, which the playtest kid picked): **2% → 38% → 59%**.
- Sunny Town is best: 36% → 66% → 81%.

**Side-to-side view at her feet** (± world units; gems spawn ≥ 4 away):
| Screen | 1× | 1.4× | 1.8× | 2.2× |
|---|---|---|---|---|
| 375 phone | ±1.9 | ±2.6 | ±3.4 | ±4.1 |
| 768 iPad portrait | ±3.1 | ±4.3 | ±5.5 | ±6.7 |
| 1024 iPad landscape | ±5.4 | ±7.6 | ±9.8 | ±12 |

These confirm Linden's paper numbers.

## What it means
1. **Linden and Rowan were both right.** It's a camera-shape problem: on portrait, the first view almost never contains a gem. A wider camera helps a lot on iPad. But **wider alone can't fix the phone**: even at the 2.2 max, only half of phone arrivals show something, and a third show a gem clear of the HUD. Rowan's warning holds: gems spawn anywhere in ±15.5, and a camera can't guarantee one.
2. **The minimap eats gems on the phone.** At 1.8× the phone shot has a gem peeking out from *under* the minimap (`camera/phone-z18.png`, top right). The "clear of HUD" column drops hardest on the phone for that reason.
3. **zoomMax:** no trial level is blocked (1.4 and 1.8 sit under the 2.2 cap). But pinch-out headroom shrinks: 1.57× left at 1.4, only 1.22× at 1.8, and none at Linden's 375 pick of 2.2. If we start at 1.8 or more, `zoomMax` should rise too.
4. **A new option for the crew (not decided):** a **spawn rule** that puts *one* of the 3 gems inside the first view would make it 100% at any zoom and on every screen, without shrinking her. It's the same idea as the parked guided first station, but needs no arrow and no UI. It could pair with a modest 1.4× on portrait. Rowan and Linden should weigh in before this goes to Amy.

## Linden's look check (Forest Clearing, centre arrival)
| Shot | Hero (feet → hat tip) | Cat | HUD |
|---|---|---|---|
| `camera/phone-z1.png` | 178 px = **22%** of the height | clears her, lower right | none on her. A gem is cut off at the top edge |
| `camera/phone-z14.png` | 126 px = 16% | clears her | none on her |
| `camera/phone-z18.png` | 97 px = **12%** | clears her | none on her. A gem sits **under the minimap** |
| `camera/ipad-z1.png` | 225 px = **22%** | clears her (big, close, right side) | none. No gem in view |
| `camera/ipad-z14.png` | 159 px = 16% | clears her | none |
| `camera/ipad-z18.png` | 123 px = **12%** | clears her | none. A neighbour comes into view, still no gem in this seed |

- **Her size today is about 22%, not ~40%** (Linden's estimate probably counted the cat). At 1.4× she's 16%, and her face and hat still read clearly. At 1.8× she's 12%, readable but small: Amy should look at this one, since she chose the Sorcerer's size.
- The steep angle never changes, so the cat clears her at every zoom.

## Suggested trial (for the crew, then Amy)
- **Start at 1.4× on portrait only** (iPad: 13% → 45%; she stays at 16%). Desktop and landscape stay at 1×.
- **Plus "one gem in the first view"** as the spawn rule, to reach ~100% without shrinking her further.
- **Re-run job 3's hint pairing QA** at the new start zoom.
- **Re-run this script** after any change, and measure time to the first gem tap in a cold playtest.
