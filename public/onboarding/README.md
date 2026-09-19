# Onboarding step images

Optional per-step art for the first-run "How to Play" walkthrough
(src/ui/Onboarding.jsx). Baked-in assets, NOT a runtime upload.

Drop a 16:9 image (JPG/PNG/GIF) here and set its path on the matching step's
`media` field in Onboarding.jsx, e.g. media: '/onboarding/step-1.jpg'.

Steps:
  1. Pick your character & map
  2. Explore & collect gems
  3. Build your world
  4. Add some sparkle
  (the 5th "What's next" step is text + feature cards — no image)

A step left as media:null simply shows text; the image box collapses, so
images can be added one at a time. Keep files small (the world-card art in
public/worlds/ is ~20-26KB at 900px wide via `sips -Z 900 -s formatOptions 82`).
