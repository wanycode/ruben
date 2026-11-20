// Generates warm, graded placeholder artwork in the RWW palette.
// Replace every file in public/assets/img with the real photograph of the
// same name (section 4 of the brief) — no template changes needed.
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = '.'
mkdirSync(OUT, { recursive: true })

const palettes = {
  warm: ['#7d5638', '#4f3220', '#241309'],
  sand: ['#c8a97f', '#94714e', '#3d2617'],
  cool: ['#6b5c4d', '#3f3227', '#1a110a'],
  night: ['#4d3a2b', '#2c1e14', '#150d07'],
  light: ['#dbc7a9', '#b99a71', '#6c4a30'],
}

const images = [
  ['hero-home', 1600, 1000, 'warm', 1],
  ['hero-triathlon', 1600, 1000, 'cool', 2],
  ['hero-marathon', 1600, 1000, 'sand', 3],
  ['hero-ultra', 1600, 1000, 'night', 4],
  ['hero-coaching', 1200, 1500, 'warm', 5],
  ['about-hero', 1600, 1200, 'warm', 6, true],
  ['portrait-ruben', 1000, 1250, 'sand', 7, true],
  ['story-ruben', 1200, 900, 'warm', 8, true],
  ['race-haarlem', 1200, 800, 'light', 9],
  ['training-workout', 1200, 900, 'cool', 10],
  ['tile-triathlon', 1200, 900, 'cool', 11],
  ['tile-marathon', 1200, 900, 'sand', 12],
  ['tile-ultra', 1200, 900, 'night', 13],
  ['poster-1', 900, 1200, 'warm', 14, true],
  ['poster-2', 900, 1200, 'sand', 15, true],
  ['poster-3', 900, 1200, 'cool', 16, true],
  ['poster-4', 900, 1200, 'warm', 17, true],
  ['ultra-ruben', 1200, 900, 'night', 18, true],
]

function rng(seed) {
  let a = seed * 1831565813 + 0x6d2b79f5
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function curves(w, h, random) {
  let out = ''
  const count = 6
  for (let i = 0; i < count; i += 1) {
    const y = h * (0.16 + (i / count) * 0.78) + (random() - 0.5) * 40
    const amp = h * (0.05 + random() * 0.08)
    out += `<path d="M${-w * 0.1} ${y.toFixed(0)} C ${(w * 0.22).toFixed(0)} ${(y - amp).toFixed(0)}, ${(w * 0.55).toFixed(0)} ${(y + amp).toFixed(0)}, ${(w * 1.1).toFixed(0)} ${(y - amp * 0.6).toFixed(0)}" />`
  }
  return out
}

for (const [name, w, h, paletteKey, seed, subject] of images) {
  const [c1, c2, c3] = palettes[paletteKey]
  const random = rng(seed)
  const lightX = (0.28 + random() * 0.4).toFixed(2)
  const lightY = (0.18 + random() * 0.22).toFixed(2)
  const angle = Math.round(random() * 40 + 100)

  const subjectLayer = subject
    ? `<g filter="url(#blur)" opacity="0.55">
        <ellipse cx="${w * 0.5}" cy="${h * 0.46}" rx="${w * 0.17}" ry="${h * 0.2}" fill="${c3}" />
        <ellipse cx="${w * 0.5}" cy="${h * 0.86}" rx="${w * 0.34}" ry="${h * 0.24}" fill="${c3}" />
      </g>`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="base" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="0.58" stop-color="${c2}" />
      <stop offset="1" stop-color="${c3}" />
    </linearGradient>
    <radialGradient id="glow" cx="${lightX}" cy="${lightY}" r="0.78">
      <stop offset="0" stop-color="#f8f4ec" stop-opacity="0.5" />
      <stop offset="0.45" stop-color="#efe6d8" stop-opacity="0.16" />
      <stop offset="1" stop-color="#efe6d8" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.62" r="0.78">
      <stop offset="0.45" stop-color="#3b2416" stop-opacity="0" />
      <stop offset="1" stop-color="#3b2416" stop-opacity="0.62" />
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="${Math.round(w * 0.06)}" /></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#base)" />
  <rect width="${w}" height="${h}" fill="url(#glow)" />
  ${subjectLayer}
  <g fill="none" stroke="#efe6d8" stroke-opacity="0.09" stroke-width="1.4">${curves(w, h, random)}</g>
  <rect width="${w}" height="${h}" fill="url(#vignette)" />
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.13" style="mix-blend-mode:overlay" />
</svg>`

  writeFileSync(`${OUT}/${name}.svg`, svg)
}

console.log(`Wrote ${images.length} placeholder images to ${OUT}`)
