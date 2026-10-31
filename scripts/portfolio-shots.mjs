// Captures portfolio screenshots of client websites for the Results section.
//   cover.png      desktop hero (1440x900)
//   long-1.png     desktop page, screens 1-3 stitched (1440x2700)
//   long-2.png     desktop page, screens 4-6 stitched
//   phones.png     three consecutive mobile screens in phone frames (1600x1000)
//
// Usage: SHOTS_DIR=out [CHROME_PATH=...] node scripts/portfolio-shots.mjs example.ca other.ca
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.env.SHOTS_DIR || 'shots'
const sites = process.argv.slice(2)

// Walk the page so lazy images load and reveal animations fire, then freeze everything visible.
async function prepare(page) {
  for (let attempt = 0; ; attempt++) {
    try {
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
      await page.waitForTimeout(1200)
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < height; y += 500) {
        await page.evaluate((v) => window.scrollTo(0, v), y)
        await page.waitForTimeout(110)
      }
      break
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  await page.addStyleTag({
    content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;scroll-behavior:auto!important}',
  })
  await page.evaluate(() => {
    const vw = window.innerWidth
    const isFixedLayer = (el) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (getComputedStyle(n).position === 'fixed') return true
      }
      return false
    }
    document.querySelectorAll('body *').forEach((el) => {
      const cs = getComputedStyle(el)
      // Floating widgets and overlays (chat panels, call buttons, closed menus, lightboxes) would cover the design.
      if (cs.position === 'fixed') {
        const r = el.getBoundingClientRect()
        const isTopBar = r.top < 60 && r.width > vw * 0.7 && r.height < 220
        if (!isTopBar) el.style.setProperty('visibility', 'hidden', 'important')
        else el.setAttribute('data-shot-bar', '')
        return
      }
      // Scroll-reveal content that never animated in: show it (but never inside fixed layers).
      if (cs.opacity === '0' && el.getBoundingClientRect().height > 0 && !el.closest('[aria-hidden="true"]') && !isFixedLayer(el)) {
        el.style.opacity = '1'
        el.style.transform = 'none'
      }
    })
    document.querySelectorAll('iframe').forEach((f) => f.style.setProperty('visibility', 'hidden', 'important'))
    // Sticky headers are marked so they can be hidden after the first screen.
    document.querySelectorAll('header, nav, body > div').forEach((el) => {
      if (getComputedStyle(el).position === 'sticky' && el.getBoundingClientRect().top < 60) el.setAttribute('data-shot-bar', '')
    })
  })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(800)
}

// Consecutive viewport screenshots; the sticky header only appears on the first one.
async function screens(page, count) {
  const vh = page.viewportSize().height
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  const shots = []
  for (let i = 0; i < count; i++) {
    const y = Math.min(i * vh, max)
    if (i > 0 && y === Math.min((i - 1) * vh, max)) break
    await page.evaluate(
      ([v, hide]) => {
        window.scrollTo(0, v)
        document.querySelectorAll('[data-shot-bar]').forEach((el) => {
          el.style.setProperty('visibility', hide ? 'hidden' : 'visible', 'important')
        })
      },
      [y, i > 0],
    )
    await page.waitForTimeout(600)
    shots.push(await page.screenshot())
  }
  return shots
}

async function stack(buffers, file) {
  const metas = await Promise.all(buffers.map((b) => sharp(b).metadata()))
  const width = metas[0].width
  const height = metas.reduce((sum, m) => sum + m.height, 0)
  let top = 0
  const layers = buffers.map((input, i) => {
    const layer = { input, left: 0, top }
    top += metas[i].height
    return layer
  })
  await sharp({ create: { width, height, channels: 3, background: '#ffffff' } }).composite(layers).png().toFile(file)
}

async function phoneTrio(buffers, file) {
  const W = 1600
  const H = 1000
  const phoneH = 820
  const meta = await sharp(buffers[0]).metadata()
  const phoneW = Math.round((phoneH * meta.width) / meta.height)
  const gap = 70
  const startX = Math.round((W - (phoneW * 3 + gap * 2)) / 2)
  const top = Math.round((H - phoneH) / 2)
  const radius = 44
  const mask = Buffer.from(`<svg width="${phoneW}" height="${phoneH}"><rect width="${phoneW}" height="${phoneH}" rx="${radius}" fill="#fff"/></svg>`)
  const frame = Buffer.from(
    `<svg width="${phoneW + 24}" height="${phoneH + 24}"><rect width="${phoneW + 24}" height="${phoneH + 24}" rx="${radius + 12}" fill="#0a1628"/></svg>`,
  )
  const layers = []
  for (const [i, b] of buffers.slice(0, 3).entries()) {
    const img = await sharp(b).resize(phoneW, phoneH, { fit: 'cover', position: 'top' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
    const x = startX + i * (phoneW + gap)
    layers.push({ input: frame, left: x - 12, top: top - 12 }, { input: img, left: x, top })
  }
  await sharp({ create: { width: W, height: H, channels: 4, background: '#eef2f8' } }).composite(layers).png().toFile(file)
}

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
for (const host of sites) {
  const dir = path.join(OUT, host)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const url = `https://${host}/`

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await desktop.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await prepare(desktop)
  const d = await screens(desktop, 6)
  fs.writeFileSync(path.join(dir, 'cover.png'), d[0])
  await stack(d.slice(0, 3), path.join(dir, 'long-1.png'))
  if (d.length > 3) await stack(d.slice(3, 6), path.join(dir, 'long-2.png'))
  await desktop.close()

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await mobile.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await prepare(mobile)
  await phoneTrio(await screens(mobile, 3), path.join(dir, 'phones.png'))
  await mobile.close()
  console.log('done', host)
}
await browser.close()
