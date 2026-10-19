/*
 * onboardingCopy.js — the words of the first-run Onboarding + How to Play,
 * in ONE place, built from the game's own config so they can't drift from it.
 * (Trail crew job 1, 2026-10-18 — docs/onboarding/proposal.md + decisions.md.)
 *
 * Truth rules (Amy, non-negotiable — tests in onboarding-copy.test.js):
 *   · every number/name comes from config: seeds every GARDEN.seedEveryGems,
 *     the garden town's name, the free-hero count, the grade range;
 *   · no "coming soon" in the game (marketing may tease; a kid reads the game
 *     as "available now");
 *   · no beta result, no age, no "gym" line (that's marketing's — Heron);
 *   · a 7-year-old's reading load: short lines, images do the work.
 *
 * Messaging is Heron's (Marketing leads in-game wording, Amy 2026-10-18).
 *
 * Two entries, one card: 'first' = About + the 3 steps (first run, once);
 * 'howto' = the 3 steps only (Settings → How to Play).
 */
import { GARDEN, HEROES } from './config'
import { MAPS } from './maps'
import { TOPICS } from './math'

// The garden lives in Sunny Town (town.gardenPlot) — named, never just "the
// garden": Rosy Garden is the playtest's decoy.
export const GARDEN_TOWN = MAPS.town.name
export const FREE_HEROES = HEROES.filter((h) => !h.price).length

/** The grade range the live topics actually serve ("4–5" until division's
 *  Phase 2 flip makes it "4–6" by itself). */
export function gradeRange(topics = TOPICS) {
  const g = Object.values(topics).map((t) => t.grade).filter(Number.isFinite)
  const lo = Math.min(...g)
  const hi = Math.max(...g)
  return lo === hi ? `${lo}` : `${lo}–${hi}`
}

export const ABOUT = {
  title: 'Welcome',
  lines: [
    'Solve math to earn gems 💎.',
    'Build your world. Grow a garden 🌱.',
    'Get one wrong? We show you how.',
  ],
  // Parent small print (Heron). One tagline, no comparisons, no age.
  small: `× ÷ + practice for grades ${gradeRange()} · teaches the method, step by step · no account needed`,
}

// `clip` = a short muted loop Amy recorded in the real game (2026-10-18, cut
// to ~10s: public/onboarding/<id>.webm + .mp4); `media` = its still poster,
// shown first and kept for reduced motion. Recording brief:
// docs/onboarding/recording-brief.md.
export const STEPS = [
  {
    id: 'hero',
    title: 'Meet your hero',
    // Hero-neutral on purpose: the default hero will change (Amy 2026-10-19 —
    // the Sorcerer is Ivy's pick; the clip plays as Sunny).
    body: `Play as your hero, with your cat. Swap heroes in the 🛍️ shop. ${FREE_HEROES} are free.`,
    media: '/onboarding/hero.jpg',
    clip: '/onboarding/hero',
  },
  {
    id: 'gems',
    title: 'Earn gems, then build',
    body: 'Tap a glowing gem 💎 to solve a problem. Spend gems in the 🛍️ shop to build.',
    media: '/onboarding/gems.jpg',
    clip: '/onboarding/gems',
  },
  {
    id: 'garden',
    title: 'Grow a garden 🌱',
    // "a seed", not "your seed": a new save starts with none — her first seed
    // comes with the lucky station's welcome gift (PR #68).
    body: `Plant a seed in ${GARDEN_TOWN}. Water it with gems, then pick your flowers 🧺. You earn a new seed every ${GARDEN.seedEveryGems} gems.`,
    media: '/onboarding/garden.jpg',
    clip: '/onboarding/garden',
  },
]

/** The pages for an entry: 'first' opens on About; 'howto' skips it. */
export function onboardingPages(entry) {
  const steps = STEPS.map((s) => ({ kind: 'step', ...s }))
  return entry === 'first' ? [{ kind: 'about', id: 'about', ...ABOUT }, ...steps] : steps
}
