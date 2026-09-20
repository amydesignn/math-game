/*
 * avatar.js — turn a picked photo into a small, on-device avatar.
 *
 * PRIVACY (COPPA — Amy's call, 2026-09-20): the profile photo NEVER leaves the
 * device. This module is the whole reason that's true. It takes the File straight
 * from the OS photo picker, decodes it, centre-crops it to a small square, and
 * RE-ENCODES it to a JPEG data URL that the store keeps in localStorage. Two
 * things fall out of the re-encode, both deliberate:
 *   1. The bytes we keep are bare pixels — decoding + drawing to a canvas drops
 *      ALL EXIF metadata (camera model, timestamp, and crucially any GPS location
 *      a phone baked into the original). We never persist the file, only pixels.
 *   2. Nothing is uploaded. A child's photo is personal information under COPPA;
 *      we collect and transmit none of it. On-device only, by construction.
 *
 * The DOM-touching path (decode + canvas) only runs in the browser; the pure
 * `isImageFile` guard is what the unit tests exercise.
 */

export const AVATAR_SIZE = 256 // px — retina-crisp inside the 96px circle, ~20KB as JPEG
const QUALITY = 0.82

/** True for a File the OS picker could plausibly hand us as a photo. */
export function isImageFile(file) {
  return !!file && typeof file.type === 'string' && file.type.startsWith('image/')
}

/**
 * File → a square JPEG data URL (size²), EXIF stripped. Rejects anything that
 * isn't an image, or a file the browser can't decode.
 */
export async function fileToAvatar(file, size = AVATAR_SIZE, quality = QUALITY) {
  if (!isImageFile(file)) throw new Error('not-an-image')
  const img = await decode(file)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  if (!w || !h) throw new Error('empty-image')

  const side = Math.min(w, h) // centre cover-crop to a square
  const sx = (w - side) / 2
  const sy = (h - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
  if (img.close) img.close() // ImageBitmap — release it

  return canvas.toDataURL('image/jpeg', quality) // JPEG re-encode = EXIF gone
}

// Prefer createImageBitmap with EXIF orientation APPLIED, so a portrait phone
// photo comes out upright before we strip the orientation tag. Fall back to an
// <img>, which modern browsers also auto-orient when the image is drawn to a
// canvas. The bitmap/img is already fully decoded when this resolves, so the
// caller can draw it and (for img) the object URL is safe to revoke.
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* some engines reject the option — fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
