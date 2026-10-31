// Generates placeholder "proof" images (dashboards, site mockups, social grids…) as SVG.
// They are rasterised to PNG by sharp in the seed script. Replace them with real screenshots in the admin.

const W = 1600
const H = 1000
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

export type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; soft: string }

export const palettes: Record<string, Palette> = {
  blue: { bg: '#e9eef7', surface: '#ffffff', ink: '#0b1220', muted: '#6b7487', accent: '#0775fe', soft: '#dce9ff' },
  green: { bg: '#e8f0ea', surface: '#ffffff', ink: '#10201a', muted: '#66766d', accent: '#1f9d63', soft: '#d6efe1' },
  coral: { bg: '#f6ece6', surface: '#ffffff', ink: '#231510', muted: '#7d6a62', accent: '#e8603c', soft: '#fbe0d6' },
  violet: { bg: '#eeebf6', surface: '#ffffff', ink: '#171329', muted: '#726c88', accent: '#6b4de6', soft: '#e3dcff' },
  amber: { bg: '#f5efe2', surface: '#ffffff', ink: '#1f1a0e', muted: '#7a705b', accent: '#d9921a', soft: '#fbebc8' },
  teal: { bg: '#e5f0f1', surface: '#ffffff', ink: '#0d1f22', muted: '#62777a', accent: '#13899a', soft: '#d2eef1' },
  ink: { bg: '#0d1424', surface: '#141d31', ink: '#eef2f8', muted: '#8b96ab', accent: '#0775fe', soft: '#1c2942' },
  rose: { bg: '#f6e9ee', surface: '#ffffff', ink: '#24121a', muted: '#7d6670', accent: '#d23f74', soft: '#fadbe6' },
}

const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const text = (x: number, y: number, s: string, size: number, fill: string, weight = 400, anchor = 'start', extra = '') =>
  `<text x="${x}" y="${y}" ${extra.includes('font-family') ? '' : `font-family="${FONT}"`} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`

const wrap = (inner: string, bg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${inner}</svg>`

const shadow = `<defs><filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0b1220" flood-opacity="0.16"/></filter></defs>`

// Rising series with some realistic noise.
const series = (r: () => number, n: number, start: number, end: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const base = start + (end - start) * Math.pow(t, 1.35)
    return base * (0.9 + r() * 0.2)
  })

const linePath = (vals: number[], x: number, y: number, w: number, h: number, max: number) =>
  vals.map((v, i) => `${i ? 'L' : 'M'}${(x + (w * i) / (vals.length - 1)).toFixed(1)},${(y + h - (v / max) * h).toFixed(1)}`).join(' ')

/* ------------------------------------------------------------------ */

export function adsDashboard(o: {
  platform: string
  client: string
  palette: Palette
  seed: number
  kpis: [string, string, string][]
  range?: string
}) {
  const p = o.palette
  const r = rng(o.seed)
  const cx = 80
  const cy = 70
  const cw = W - 160
  const ch = H - 140
  let s = shadow
  s += `<g filter="url(#sh)"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="22" fill="${p.surface}"/></g>`
  // header
  s += `<rect x="${cx}" y="${cy}" width="${cw}" height="76" rx="22" fill="${p.surface}"/>`
  s += `<line x1="${cx}" y1="${cy + 76}" x2="${cx + cw}" y2="${cy + 76}" stroke="${p.bg}" stroke-width="2"/>`
  s += `<circle cx="${cx + 44}" cy="${cy + 38}" r="15" fill="${p.accent}"/>`
  s += text(cx + 72, cy + 46, o.platform, 24, p.ink, 600)
  s += text(cx + 72 + o.platform.length * 13 + 24, cy + 46, `· ${o.client}`, 22, p.muted)
  s += `<rect x="${cx + cw - 300}" y="${cy + 18}" width="270" height="40" rx="10" fill="${p.bg}"/>`
  s += text(cx + cw - 165, cy + 44, o.range ?? 'Last 90 days', 19, p.ink, 500, 'middle')
  // KPI tiles
  const tiles = o.kpis.slice(0, 4)
  const tw = (cw - 60 - (tiles.length - 1) * 20) / tiles.length
  tiles.forEach(([label, value, delta], i) => {
    const x = cx + 30 + i * (tw + 20)
    const y = cy + 106
    s += `<rect x="${x}" y="${y}" width="${tw}" height="150" rx="16" fill="${i === 0 ? p.accent : p.bg}"/>`
    const fg = i === 0 ? '#ffffff' : p.ink
    const mg = i === 0 ? 'rgba(255,255,255,0.78)' : p.muted
    s += text(x + 26, y + 44, label, 20, mg, 500)
    s += text(x + 26, y + 104, value, 46, fg, 700)
    s += `<rect x="${x + 26}" y="${y + 118}" width="${delta.length * 11 + 22}" height="24" rx="12" fill="${i === 0 ? 'rgba(255,255,255,0.2)' : p.soft}"/>`
    s += text(x + 37, y + 136, delta, 16, i === 0 ? '#fff' : p.accent, 600)
  })
  // chart
  const gx = cx + 30
  const gy = cy + 290
  const gw = cw - 60
  const gh = ch - 330
  s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="16" fill="${p.surface}" stroke="${p.bg}" stroke-width="2"/>`
  s += text(gx + 28, gy + 46, 'Conversions', 21, p.ink, 600)
  s += `<circle cx="${gx + 190}" cy="${gy + 39}" r="6" fill="${p.accent}"/>` + text(gx + 204, gy + 46, 'This period', 17, p.muted)
  s += `<circle cx="${gx + 330}" cy="${gy + 39}" r="6" fill="${p.muted}" opacity="0.5"/>` + text(gx + 344, gy + 46, 'Previous', 17, p.muted)
  const px = gx + 70
  const py = gy + 80
  const pw = gw - 110
  const ph = gh - 130
  for (let i = 0; i <= 4; i++) {
    const ly = py + (ph * i) / 4
    s += `<line x1="${px}" y1="${ly}" x2="${px + pw}" y2="${ly}" stroke="${p.bg}" stroke-width="2"/>`
  }
  const now = series(r, 26, 18, 100)
  const prev = series(r, 26, 16, 34)
  const max = 115
  const pathNow = linePath(now, px, py, pw, ph, max)
  s += `<path d="${pathNow} L${px + pw},${py + ph} L${px},${py + ph} Z" fill="${p.accent}" opacity="0.1"/>`
  s += `<path d="${linePath(prev, px, py, pw, ph, max)}" fill="none" stroke="${p.muted}" stroke-opacity="0.45" stroke-width="3" stroke-dasharray="8 8"/>`
  s += `<path d="${pathNow}" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`
  const lx = px + pw
  const ly = py + ph - (now[now.length - 1] / max) * ph
  s += `<circle cx="${lx}" cy="${ly}" r="10" fill="${p.surface}" stroke="${p.accent}" stroke-width="5"/>`
  const months = ['Week 1', 'Week 4', 'Week 8', 'Week 12']
  months.forEach((m, i) => (s += text(px + (pw * i) / 3, py + ph + 36, m, 16, p.muted, 400, i === 0 ? 'start' : i === 3 ? 'end' : 'middle')))
  return wrap(s, p.bg)
}

export function searchConsole(o: { site: string; palette: Palette; seed: number; clicks: string; impressions: string; position: string; keywords: [string, number][] }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = shadow
  const cx = 80
  const cy = 70
  const cw = W - 160
  const ch = H - 140
  s += `<g filter="url(#sh)"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="22" fill="${p.surface}"/></g>`
  s += text(cx + 40, cy + 62, 'Search performance', 30, p.ink, 600)
  s += text(cx + 40, cy + 96, o.site, 19, p.muted)
  const stats: [string, string, string][] = [
    ['Total clicks', o.clicks, p.accent],
    ['Total impressions', o.impressions, '#7a5af8'],
    ['Average position', o.position, '#e8603c'],
  ]
  stats.forEach(([l, v, c], i) => {
    const x = cx + 40 + i * 300
    s += `<rect x="${x}" y="${cy + 126}" width="280" height="110" rx="14" fill="${c}"/>`
    s += text(x + 22, cy + 162, l, 18, 'rgba(255,255,255,0.85)', 500)
    s += text(x + 22, cy + 214, v, 40, '#fff', 700)
  })
  const px = cx + 40
  const py = cy + 280
  const pw = 880
  const ph = 520
  for (let i = 0; i <= 5; i++) s += `<line x1="${px}" y1="${py + (ph * i) / 5}" x2="${px + pw}" y2="${py + (ph * i) / 5}" stroke="${p.bg}" stroke-width="2"/>`
  const imp = series(r, 40, 20, 92)
  const clk = series(r, 40, 8, 70)
  s += `<path d="${linePath(imp, px, py, pw, ph, 100)}" fill="none" stroke="#7a5af8" stroke-width="4" stroke-linejoin="round"/>`
  s += `<path d="${linePath(clk, px, py, pw, ph, 100)}" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round"/>`
  // keyword table
  const tx = cx + 970
  const tw = cw - 1010
  s += `<rect x="${tx}" y="${cy + 126}" width="${tw}" height="${ch - 166}" rx="16" fill="${p.bg}"/>`
  s += text(tx + 24, cy + 168, 'Top queries', 20, p.ink, 600)
  s += text(tx + tw - 24, cy + 168, 'Position', 16, p.muted, 500, 'end')
  o.keywords.slice(0, 8).forEach(([k, pos], i) => {
    const y = cy + 220 + i * 74
    s += `<rect x="${tx + 14}" y="${y - 34}" width="${tw - 28}" height="60" rx="10" fill="${p.surface}"/>`
    s += text(tx + 32, y + 4, k, 18, p.ink, 500)
    s += `<rect x="${tx + tw - 84}" y="${y - 18}" width="56" height="30" rx="15" fill="${pos <= 3 ? p.soft : p.bg}"/>`
    s += text(tx + tw - 56, y + 3, String(pos), 17, pos <= 3 ? p.accent : p.muted, 700, 'middle')
  })
  return wrap(s, p.bg)
}

export function website(o: { brand: string; headline: string; sub: string; cta: string; palette: Palette; seed: number; dark?: boolean }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = shadow
  const bx = 110
  const by = 70
  const bw = W - 220
  const bh = H - 70
  s += `<g filter="url(#sh)"><rect x="${bx}" y="${by}" width="${bw}" height="${bh + 40}" rx="20" fill="${p.surface}"/></g>`
  // chrome
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="56" rx="20" fill="${p.ink === '#eef2f8' ? '#0b1120' : '#f1f2f4'}"/>`
  s += `<rect x="${bx}" y="${by + 36}" width="${bw}" height="20" fill="${p.ink === '#eef2f8' ? '#0b1120' : '#f1f2f4'}"/>`
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => (s += `<circle cx="${bx + 30 + i * 24}" cy="${by + 28}" r="7" fill="${c}"/>`))
  s += `<rect x="${bx + bw / 2 - 260}" y="${by + 13}" width="520" height="30" rx="15" fill="${p.ink === '#eef2f8' ? '#141d31' : '#ffffff'}"/>`
  s += text(bx + bw / 2, by + 34, `${o.brand.toLowerCase().replace(/[^a-z]/g, '')}.ca`, 15, p.muted, 400, 'middle')
  const top = by + 56
  // site nav
  s += `<rect x="${bx}" y="${top}" width="${bw}" height="${bh - 56}" fill="${p.surface}"/>`
  s += text(bx + 60, top + 62, o.brand, 26, p.ink, 700)
  ;['Services', 'About', 'Reviews', 'Contact'].forEach((n, i) => (s += text(bx + bw - 640 + i * 110, top + 60, n, 18, p.muted, 500)))
  s += `<rect x="${bx + bw - 170}" y="${top + 30}" width="120" height="44" rx="22" fill="${p.accent}"/>`
  s += text(bx + bw - 110, top + 58, 'Book now', 17, '#fff', 600, 'middle')
  // hero text
  const hx = bx + 60
  const lines = o.headline.split('\n')
  lines.forEach((l, i) => (s += text(hx, top + 200 + i * 74, l, 66, p.ink, 700, 'start', 'letter-spacing="-2"')))
  const sy = top + 200 + lines.length * 74 + 10
  s += text(hx, sy, o.sub, 22, p.muted)
  s += `<rect x="${hx}" y="${sy + 40}" width="220" height="60" rx="30" fill="${p.accent}"/>`
  s += text(hx + 110, sy + 77, o.cta, 20, '#fff', 600, 'middle')
  s += `<rect x="${hx + 240}" y="${sy + 40}" width="200" height="60" rx="30" fill="none" stroke="${p.muted}" stroke-opacity="0.4" stroke-width="2"/>`
  s += text(hx + 340, sy + 77, 'Our work', 20, p.ink, 600, 'middle')
  // hero visual
  const vx = bx + bw - 640
  const vy = top + 120
  s += `<rect x="${vx}" y="${vy}" width="580" height="470" rx="26" fill="${p.soft}"/>`
  s += `<circle cx="${vx + 380}" cy="${vy + 200}" r="150" fill="${p.accent}" opacity="0.9"/>`
  s += `<rect x="${vx + 70}" y="${vy + 250}" width="260" height="170" rx="18" fill="${p.surface}"/>`
  s += `<rect x="${vx + 100}" y="${vy + 284}" width="${120 + r() * 80}" height="14" rx="7" fill="${p.ink}" opacity="0.8"/>`
  s += `<rect x="${vx + 100}" y="${vy + 314}" width="170" height="10" rx="5" fill="${p.muted}" opacity="0.4"/>`
  s += `<rect x="${vx + 100}" y="${vy + 336}" width="140" height="10" rx="5" fill="${p.muted}" opacity="0.4"/>`
  const star = (cx: number, cy: number, R: number) =>
    Array.from({ length: 10 }, (_, k) => {
      const rad = k % 2 ? R * 0.45 : R
      const a = -Math.PI / 2 + (k * Math.PI) / 5
      return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`
    }).join(' ')
  ;[0, 1, 2, 3, 4].forEach((i) => (s += `<polygon points="${star(vx + 112 + i * 30, vy + 386, 12)}" fill="#f5b400"/>`))
  // cards row
  const cyy = top + 640
  for (let i = 0; i < 3; i++) {
    const x = hx + i * ((bw - 120) / 3)
    const w = (bw - 120) / 3 - 24
    s += `<rect x="${x}" y="${cyy}" width="${w}" height="200" rx="18" fill="${p.bg}"/>`
    s += `<rect x="${x + 28}" y="${cyy + 30}" width="48" height="48" rx="12" fill="${p.accent}" opacity="${0.5 + i * 0.25}"/>`
    s += `<rect x="${x + 28}" y="${cyy + 104}" width="${140 + r() * 80}" height="16" rx="8" fill="${p.ink}" opacity="0.75"/>`
    s += `<rect x="${x + 28}" y="${cyy + 136}" width="${w - 80}" height="10" rx="5" fill="${p.muted}" opacity="0.35"/>`
    s += `<rect x="${x + 28}" y="${cyy + 156}" width="${w - 140}" height="10" rx="5" fill="${p.muted}" opacity="0.35"/>`
  }
  return wrap(s, p.bg)
}

export function socialGrid(o: { handle: string; palette: Palette; seed: number; followers: string; posts: string }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = shadow
  // decorative blocks behind phone
  s += `<rect x="140" y="160" width="420" height="560" rx="40" fill="${p.soft}"/>`
  s += `<circle cx="1340" cy="300" r="170" fill="${p.accent}" opacity="0.18"/>`
  s += text(140, 820, `@${o.handle}`, 44, p.ink, 700)
  s += text(140, 870, `${o.followers} followers · ${o.posts} posts`, 24, p.muted)
  const fx = 620
  const fy = 40
  const fw = 460
  const fh = 940
  s += `<g filter="url(#sh)"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="56" fill="#0b0f19"/></g>`
  s += `<rect x="${fx + 14}" y="${fy + 14}" width="${fw - 28}" height="${fh - 28}" rx="44" fill="#ffffff"/>`
  const ix = fx + 34
  s += `<circle cx="${ix + 46}" cy="${fy + 120}" r="44" fill="${p.accent}"/>`
  s += text(ix + 46, fy + 132, o.handle.charAt(0).toUpperCase(), 36, '#fff', 700, 'middle')
  ;[
    [o.posts, 'Posts'],
    [o.followers, 'Followers'],
    ['312', 'Following'],
  ].forEach(([v, l], i) => {
    s += text(ix + 160 + i * 90, fy + 118, v, 22, '#111', 700, 'middle')
    s += text(ix + 160 + i * 90, fy + 142, l, 14, '#777', 400, 'middle')
  })
  s += text(ix, fy + 200, o.handle.replace(/[._]/g, ' '), 18, '#111', 700)
  s += `<rect x="${ix}" y="${fy + 218}" width="${fw - 68}" height="40" rx="10" fill="${p.accent}"/>`
  s += text(fx + fw / 2, fy + 244, 'Follow', 16, '#fff', 600, 'middle')
  const gx = fx + 14
  const gy = fy + 280
  const cell = (fw - 28 - 4) / 3
  const tones = [p.accent, p.soft, p.ink, p.bg, '#f5b400', p.muted]
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 3; col++) {
      const x = gx + col * (cell + 2)
      const y = gy + row * (cell + 2)
      const t = tones[Math.floor(r() * tones.length)]
      s += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${t}"/>`
      const k = r()
      if (k < 0.33) s += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * 0.24}" fill="#fff" opacity="0.85"/>`
      else if (k < 0.66) s += `<rect x="${x + cell * 0.2}" y="${y + cell * 0.55}" width="${cell * 0.6}" height="${cell * 0.1}" rx="4" fill="#fff" opacity="0.9"/><rect x="${x + cell * 0.2}" y="${y + cell * 0.7}" width="${cell * 0.4}" height="${cell * 0.08}" rx="4" fill="#fff" opacity="0.6"/>`
      else s += `<path d="M${x + cell * 0.2},${y + cell * 0.75} L${x + cell * 0.45},${y + cell * 0.4} L${x + cell * 0.62},${y + cell * 0.6} L${x + cell * 0.72},${y + cell * 0.5} L${x + cell * 0.85},${y + cell * 0.75}Z" fill="#fff" opacity="0.8"/>`
    }
  // engagement card
  s += `<g filter="url(#sh)"><rect x="1150" y="560" width="330" height="190" rx="22" fill="#fff"/></g>`
  s += text(1180, 610, 'Reach, last 30 days', 19, p.muted, 500)
  s += text(1180, 676, '+284%', 54, p.accent, 700)
  s += text(1180, 718, 'vs. previous period', 17, p.muted)
  return wrap(s, p.bg)
}

export function brandSheet(o: { name: string; tagline: string; palette: Palette; colors: string[]; seed: number }) {
  const p = o.palette
  let s = shadow
  s += `<g filter="url(#sh)"><rect x="80" y="70" width="900" height="860" rx="24" fill="${p.accent}"/></g>`
  // monogram
  s += `<circle cx="530" cy="400" r="150" fill="none" stroke="#fff" stroke-width="16"/>`
  s += text(530, 450, o.name.charAt(0), 150, '#fff', 800, 'middle')
  s += text(530, 660, o.name, 62, '#fff', 700, 'middle', 'letter-spacing="-1"')
  s += text(530, 712, o.tagline.toUpperCase(), 20, 'rgba(255,255,255,0.75)', 600, 'middle', 'letter-spacing="5"')
  // swatches
  const sx = 1030
  o.colors.slice(0, 5).forEach((c, i) => {
    const y = 70 + i * 138
    s += `<rect x="${sx}" y="${y}" width="490" height="122" rx="18" fill="${c}"/>`
    const light = ['#f', '#e', '#d'].some((k) => c.toLowerCase().startsWith(k))
    s += text(sx + 28, y + 72, c.toUpperCase(), 24, light ? '#111' : '#fff', 600, 'start', `font-family="Consolas, monospace"`)
  })
  s += `<rect x="${sx}" y="770" width="490" height="160" rx="18" fill="${p.surface}"/>`
  s += text(sx + 28, 880, 'Aa', 92, p.ink, 700)
  s += text(sx + 190, 840, 'Primary typeface', 20, p.muted)
  s += text(sx + 190, 880, 'Bold · Regular', 26, p.ink, 600)
  return wrap(s, p.bg)
}

export function crmPipeline(o: { palette: Palette; seed: number; title: string }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = shadow
  s += `<g filter="url(#sh)"><rect x="70" y="60" width="${W - 140}" height="${H - 120}" rx="22" fill="${p.surface}"/></g>`
  s += text(110, 128, o.title, 30, p.ink, 600)
  s += `<rect x="${W - 400}" y="92" width="290" height="46" rx="23" fill="${p.accent}"/>`
  s += text(W - 255, 122, 'Automation: ON', 18, '#fff', 600, 'middle')
  const cols = ['New lead', 'Contacted', 'Quote sent', 'Won']
  const colW = (W - 220 - 60) / 4
  const names = ['Sarah M.', 'Daniel K.', 'Priya S.', 'Owen L.', 'Maya R.', 'Jordan T.', 'Aiden P.', 'Chloe W.', 'Noah B.', 'Emma G.', 'Liam C.', 'Ava H.']
  let n = 0
  cols.forEach((c, i) => {
    const x = 110 + i * (colW + 20)
    s += `<rect x="${x}" y="170" width="${colW}" height="${H - 280}" rx="16" fill="${p.bg}"/>`
    s += `<circle cx="${x + 26}" cy="206" r="7" fill="${i === 3 ? '#1f9d63' : p.accent}" opacity="${0.4 + i * 0.2}"/>`
    s += text(x + 42, 213, c, 19, p.ink, 600)
    const count = 4 - Math.floor(i / 2)
    s += text(x + colW - 22, 213, String(count + Math.floor(r() * 4)), 17, p.muted, 600, 'end')
    for (let k = 0; k < count; k++) {
      const y = 240 + k * 150
      s += `<rect x="${x + 14}" y="${y}" width="${colW - 28}" height="132" rx="12" fill="${p.surface}"/>`
      s += text(x + 34, y + 38, names[n++ % names.length], 19, p.ink, 600)
      s += text(x + 34, y + 66, `$${(1 + Math.floor(r() * 9)) * 500}`, 17, p.muted)
      const tag = i === 0 ? 'Website form' : i === 1 ? 'Auto SMS sent' : i === 2 ? 'Follow-up day 3' : 'Paid'
      s += `<rect x="${x + 34}" y="${y + 86}" width="${tag.length * 9 + 24}" height="28" rx="14" fill="${i === 3 ? '#d6efe1' : p.soft}"/>`
      s += text(x + 46, y + 106, tag, 14, i === 3 ? '#1f9d63' : p.accent, 600)
    }
  })
  return wrap(s, p.bg)
}

export function storefront(o: { brand: string; palette: Palette; seed: number }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = shadow
  s += `<g filter="url(#sh)"><rect x="90" y="60" width="${W - 180}" height="${H - 60}" rx="22" fill="${p.surface}"/></g>`
  s += text(140, 128, o.brand, 30, p.ink, 700)
  ;['Shop', 'New in', 'Best sellers', 'About'].forEach((t, i) => (s += text(560 + i * 150, 124, t, 19, p.muted, 500)))
  s += `<circle cx="${W - 170}" cy="116" r="24" fill="${p.bg}"/>` + text(W - 170, 123, '3', 18, p.ink, 700, 'middle')
  s += `<rect x="140" y="170" width="${W - 280}" height="200" rx="20" fill="${p.accent}"/>`
  s += text(190, 260, 'Free shipping across Canada', 44, '#fff', 700)
  s += text(190, 310, 'On every order over $75', 22, 'rgba(255,255,255,0.85)')
  const cw = (W - 280 - 60) / 4
  const names = ['Everyday Tote', 'Linen Shirt', 'Ceramic Mug', 'Wool Beanie']
  for (let i = 0; i < 4; i++) {
    const x = 140 + i * (cw + 20)
    s += `<rect x="${x}" y="400" width="${cw}" height="330" rx="18" fill="${p.bg}"/>`
    const cxx = x + cw / 2
    const k = i % 3
    if (k === 0) s += `<rect x="${cxx - 70}" y="470" width="140" height="170" rx="20" fill="${p.accent}" opacity="0.8"/>`
    else if (k === 1) s += `<circle cx="${cxx}" cy="560" r="90" fill="${p.ink}" opacity="0.8"/>`
    else s += `<path d="M${cxx - 90},640 L${cxx},470 L${cxx + 90},640Z" fill="${p.accent}" opacity="0.6"/>`
    if (i === 1) s += `<rect x="${x + 16}" y="416" width="64" height="30" rx="15" fill="${p.ink}"/>` + text(x + 48, 437, 'NEW', 14, '#fff', 700, 'middle')
    s += text(x + 4, 770, names[i], 21, p.ink, 600)
    s += text(x + 4, 802, `$${(24 + Math.floor(r() * 60)).toFixed(0)}.00`, 19, p.muted)
    s += `<rect x="${x + cw - 140}" y="776" width="140" height="40" rx="20" fill="${p.ink}"/>`
    s += text(x + cw - 70, 802, 'Add to cart', 15, '#fff', 600, 'middle')
  }
  return wrap(s, p.bg)
}

export function chatWidget(o: { brand: string; palette: Palette; messages: [('bot' | 'user'), string][] }) {
  const p = o.palette
  let s = shadow
  // blurred website behind
  s += `<rect x="80" y="80" width="820" height="840" rx="24" fill="${p.surface}" opacity="0.7"/>`
  s += text(130, 170, o.brand, 34, p.ink, 700)
  ;[0, 1, 2, 3, 4, 5].forEach((i) => (s += `<rect x="130" y="${240 + i * 60}" width="${600 - i * 60}" height="22" rx="11" fill="${p.muted}" opacity="0.18"/>`))
  s += `<rect x="130" y="640" width="320" height="200" rx="18" fill="${p.soft}"/>`
  s += `<rect x="480" y="640" width="320" height="200" rx="18" fill="${p.soft}"/>`
  // widget
  const x = 860
  const y = 70
  const w = 620
  const h = 860
  s += `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#ffffff"/></g>`
  s += `<rect x="${x}" y="${y}" width="${w}" height="120" rx="28" fill="${p.accent}"/><rect x="${x}" y="${y + 90}" width="${w}" height="30" fill="${p.accent}"/>`
  s += `<circle cx="${x + 64}" cy="${y + 60}" r="30" fill="#fff"/>`
  s += text(x + 64, y + 70, 'AI', 22, p.accent, 800, 'middle')
  s += text(x + 112, y + 54, `${o.brand} assistant`, 23, '#fff', 600)
  s += `<circle cx="${x + 118}" cy="${y + 80}" r="6" fill="#4ade80"/>` + text(x + 132, y + 87, 'Online · replies instantly', 16, 'rgba(255,255,255,0.85)')
  let cy = y + 170
  o.messages.forEach(([who, msg]) => {
    const words = msg.split(' ')
    const lines: string[] = []
    let cur = ''
    words.forEach((wd) => {
      if ((cur + ' ' + wd).trim().length > 34) {
        lines.push(cur.trim())
        cur = wd
      } else cur += ' ' + wd
    })
    if (cur.trim()) lines.push(cur.trim())
    const bh = 30 + lines.length * 30
    const bw = Math.min(440, Math.max(...lines.map((l) => l.length)) * 11.5 + 44)
    const bx = who === 'bot' ? x + 30 : x + w - 30 - bw
    s += `<rect x="${bx}" y="${cy}" width="${bw}" height="${bh}" rx="20" fill="${who === 'bot' ? '#f1f3f7' : p.accent}"/>`
    lines.forEach((l, i) => (s += text(bx + 22, cy + 38 + i * 30, l, 19, who === 'bot' ? '#111827' : '#fff')))
    cy += bh + 18
  })
  s += `<rect x="${x + 24}" y="${y + h - 90}" width="${w - 48}" height="62" rx="31" fill="#f1f3f7"/>`
  s += text(x + 56, y + h - 51, 'Type your question…', 18, '#9aa1ad')
  s += `<circle cx="${x + w - 58}" cy="${y + h - 59}" r="24" fill="${p.accent}"/>`
  return wrap(s, p.bg)
}

export function adCreative(o: { headline: string; sub: string; palette: Palette; seed: number; platform: string }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = shadow
  // three ad cards in a row
  for (let i = 0; i < 3; i++) {
    const w = 420
    const x = 110 + i * (w + 45)
    const y = 110 + (i === 1 ? -30 : 30)
    s += `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="760" rx="24" fill="#fff"/></g>`
    s += `<circle cx="${x + 46}" cy="${y + 46}" r="22" fill="${p.accent}"/>`
    s += text(x + 80, y + 42, o.platform, 18, '#111', 600)
    s += text(x + 80, y + 64, 'Sponsored', 14, '#888')
    const tone = [p.accent, p.ink, p.soft][i]
    s += `<rect x="${x}" y="${y + 92}" width="${w}" height="420" fill="${tone}"/>`
    if (i === 0) s += `<circle cx="${x + w / 2}" cy="${y + 300}" r="${120 + r() * 20}" fill="#fff" opacity="0.9"/>`
    if (i === 1) s += `<rect x="${x + 70}" y="${y + 180}" width="${w - 140}" height="240" rx="20" fill="${p.accent}"/>`
    if (i === 2) s += `<path d="M${x + 60},${y + 470} L${x + 180},${y + 230} L${x + 260},${y + 360} L${x + 300},${y + 300} L${x + 370},${y + 470}Z" fill="${p.accent}"/>`
    const head = [o.headline, 'Limited spots this month', 'Rated 4.9 by 300+ locals'][i]
    s += text(x + 28, y + 570, head, 22, '#111', 700)
    s += text(x + 28, y + 604, o.sub, 17, '#666')
    s += `<rect x="${x + 28}" y="${y + 650}" width="${w - 56}" height="56" rx="12" fill="#f1f2f4"/>`
    s += text(x + w / 2, y + 685, 'Learn more', 18, '#111', 600, 'middle')
  }
  return wrap(s, p.bg)
}

export function editorialCover(o: { label: string; title: string; palette: Palette; seed: number }) {
  const p = o.palette
  const r = rng(o.seed)
  let s = ''
  const variant = Math.floor(r() * 3)
  if (variant === 0) {
    s += `<circle cx="${1150 + r() * 120}" cy="${380}" r="${300}" fill="${p.accent}"/>`
    s += `<circle cx="${1150}" cy="${380}" r="${150}" fill="${p.bg}"/>`
  } else if (variant === 1) {
    for (let i = 0; i < 6; i++) s += `<rect x="${900 + i * 100}" y="${700 - (i + 1) * 90}" width="70" height="${(i + 1) * 90}" rx="10" fill="${p.accent}" opacity="${0.35 + i * 0.13}"/>`
  } else {
    s += `<rect x="960" y="120" width="460" height="460" rx="40" fill="${p.accent}" transform="rotate(12 1190 350)"/>`
    s += `<rect x="1040" y="200" width="300" height="300" rx="28" fill="${p.bg}" transform="rotate(12 1190 350)"/>`
  }
  s += `<rect x="100" y="110" width="${o.label.length * 15 + 44}" height="48" rx="24" fill="none" stroke="${p.ink}" stroke-width="2"/>`
  s += text(122, 142, o.label.toUpperCase(), 18, p.ink, 600, 'start', 'letter-spacing="2"')
  const words = o.title.split(' ')
  const lines: string[] = []
  let cur = ''
  words.forEach((w) => {
    if ((cur + ' ' + w).trim().length > 22) {
      lines.push(cur.trim())
      cur = w
    } else cur += ' ' + w
  })
  lines.push(cur.trim())
  const top = H - 110 - lines.length * 84
  lines.forEach((l, i) => (s += text(100, top + i * 84, l, 78, p.ink, 700, 'start', 'letter-spacing="-2.5"')))
  return wrap(s, p.bg)
}
