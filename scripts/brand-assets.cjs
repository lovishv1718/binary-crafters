// Builds transparent logo variants from the client's original logo (dark background).
const sharp = require('sharp')
const path = require('path')

const SRC = path.join(__dirname, '../public/brand/logo-source.png')
const OUT = path.join(__dirname, '../public/brand')
const BG = [7, 13, 29]

;(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const light = Buffer.alloc(width * height * 4)
  const dark = Buffer.alloc(width * height * 4)
  let minX = width, minY = height, maxX = 0, maxY = 0
  for (let i = 0; i < width * height; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]
    const dist = Math.max(Math.abs(r - BG[0]), Math.abs(g - BG[1]), Math.abs(b - BG[2]))
    const a = Math.min(255, Math.max(0, (dist - 12) * 2.2))
    const isBlue = b > 150 && r < 120
    // Light variant (for dark backgrounds): pure white + brand blue.
    const lc = isBlue ? [7, 117, 254] : [255, 255, 255]
    // Dark variant (for light backgrounds): ink + brand blue.
    const dc = isBlue ? [7, 117, 254] : [7, 13, 29]
    light.set([...lc, a], i * 4)
    dark.set([...dc, a], i * 4)
    if (a > 40) {
      const x = i % width, y = Math.floor(i / width)
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
  }
  const crop = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
  const raw = { raw: { width, height, channels: 4 } }
  await sharp(light, raw).extract(crop).png().toFile(path.join(OUT, 'mark.png'))
  await sharp(dark, raw).extract(crop).png().toFile(path.join(OUT, 'mark-dark.png'))
  // Square app icon on the brand ink colour.
  const markBuf = await sharp(light, raw).extract(crop).resize(360, 360, { fit: 'inside' }).png().toBuffer()
  await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 7, g: 13, b: 29, alpha: 1 } } })
    .composite([{ input: markBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(OUT, 'icon.png'))
  console.log('crop', crop)
})()
