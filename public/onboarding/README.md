# Onboarding step clips

The How to Play steps (src/onboardingCopy.js → src/ui/Onboarding.jsx) each show a
short muted loop that Amy recorded in the real game (2026-10-18, sources in
luxi-marketing/recordings/Recording Sun Oct 18/Onboarding video/).

Per step id (hero · gems · garden):
  <id>.webm  VP9, 960×540, ~10s, no audio (first choice)
  <id>.mp4   H.264, same cut (Safari / fallback)
  <id>.jpg   still poster: shown before the first frame and for reduced motion

To swap a clip, follow docs/onboarding/recording-brief.md, then cut it like this:
  ffmpeg -ss <start> -to <end> -i src.mp4 -an -vf "setpts=PTS/1.5,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,fps=30" -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart <id>.mp4
  ffmpeg -i <id>.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 -an <id>.webm
Keep each pair under ~400KB.
