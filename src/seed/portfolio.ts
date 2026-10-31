// Replaces every result with Binary Crafters' real website portfolio.
// Screenshots come from scripts/portfolio-shots.mjs (cover.png, long-1.png, long-2.png, phones.png per site).
//   SHOTS_DIR=path/to/shots npm run seed:portfolio
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import sharp from 'sharp'

const SHOTS_DIR = process.env.SHOTS_DIR
if (!SHOTS_DIR) throw new Error('Set SHOTS_DIR to the folder produced by scripts/portfolio-shots.mjs')

type Project = {
  host: string
  slug: string
  title: string
  client: string
  industry: string
  location: string
  featured: boolean
  summary: string
  challenge: string
  approach: string
  outcome: string
}

const projects: Project[] = [
  {
    host: 'crystallights.ca',
    slug: 'crystal-lights-website',
    title: 'A night-time showcase for permanent outdoor lighting',
    client: 'Crystal Lights',
    industry: 'Permanent outdoor LED lighting',
    location: 'Surrey, BC',
    featured: true,
    summary:
      'A bold, dark-themed website that shows homeowners exactly how permanent LED lighting looks on a real BC home, then makes booking a free design consult effortless.',
    challenge:
      'Permanent lighting is a visual product that is hard to explain in words. Crystal Lights needed a site that could show the effect at night, cover the Lower Mainland, Vancouver Island and the Okanagan, and turn interest into quote requests.',
    approach:
      'We designed a dramatic night-themed site with an interactive "Colour Studio" where visitors switch scenes and colours, a real-home gallery, a simple step-by-step install process, warranty and feature sections, and quote calls to action throughout.',
    outcome:
      'A fast, mobile-first site that sells the product visually, explains the process clearly and puts the free design consult one tap away on every page.',
  },
  {
    host: 'exploremajesticbanff.ca',
    slug: 'majestic-banff-experiences-website',
    title: 'A booking-ready tour website for the Canadian Rockies',
    client: 'Majestic Banff Experiences',
    industry: 'Guided tours',
    location: 'Banff & Calgary, AB',
    featured: true,
    summary:
      'An immersive tour website for small-group and private Rocky Mountain day trips, with tour listings, an interactive route map and booking built into every page.',
    challenge:
      'Visitors compare many Banff tour companies at once. Majestic Banff needed a site that feels premium, shows every tour clearly with pickup points in Calgary, Canmore and Banff, and makes booking quick on a phone.',
    approach:
      'We built an editorial, photo-led design with tour cards for Moraine Lake, Lake Louise, the Icefields Parkway and more, a shared-versus-private comparison, an interactive "every stop on one map" section, guest reviews, travel tips and a clear booking flow.',
    outcome:
      'A destination-quality website that lets travellers explore every tour, understand pickups and pricing, and book in a few taps from anywhere.',
  },
  {
    host: 'maplefreshcleaning.ca',
    slug: 'maple-fresh-cleaning-website',
    title: 'A fresh, trustworthy website for a Surrey cleaning company',
    client: 'Maple Fresh Cleaning Services',
    industry: 'Residential & commercial cleaning',
    location: 'Surrey, BC',
    featured: true,
    summary:
      'A warm, modern website for an eco-friendly cleaning company, with a room-by-room cleaning checklist that shows customers exactly what they are paying for.',
    challenge:
      'Customers choosing a cleaner want to trust who is coming into their home. Maple Fresh needed a site that feels local and reliable, explains each of its cleaning services and gets visitors to request a free quote.',
    approach:
      'We designed an elegant layout with real photography, service cards for residential, commercial, deep, move-in/move-out and post-construction cleaning, an interactive room-by-room checklist, a four-step process, reviews and a Surrey service-area section.',
    outcome:
      'A polished, mobile-friendly site that builds trust quickly and keeps the free quote and call-or-text buttons in reach on every screen.',
  },
  {
    host: 'cozzyairhvac.ca',
    slug: 'cozzyair-hvac-website',
    title: 'A clean, professional website for an HVAC contractor',
    client: 'Cozzyair HVAC Solutions',
    industry: 'Heating, cooling & ventilation',
    location: '',
    featured: false,
    summary:
      'A modern website for a residential and commercial HVAC company, covering everything from furnaces and heat pumps to rooftop units and ductwork.',
    challenge:
      'Cozzyair serves both homeowners and commercial builders, two very different audiences. The site needed to explain a wide range of HVAC services clearly while making emergency calls and free estimates easy.',
    approach:
      'We built a bold hero with an interactive thermostat, image-led service cards, a "why choose us" section, separate residential and commercial paths, a four-step process and a strong call-to-action band with the phone number front and centre.',
    outcome:
      'A professional, easy-to-navigate site that speaks to both homeowners and businesses and puts "call now" and "free quote" one tap away.',
  },
  {
    host: 'primelinemechanical.ca',
    slug: 'prime-line-mechanical-website',
    title: 'A premium website for a plumbing, heating and gas contractor',
    client: 'Prime Line Mechanical',
    industry: 'Mechanical, plumbing & heating',
    location: 'Surrey, BC',
    featured: false,
    summary:
      'An upscale website for a licensed mechanical contractor serving homes, businesses and new builds across BC and Alberta.',
    challenge:
      'Prime Line works with homeowners, property managers and builders. They needed a website that looks as high-end as their work and shows the full range of mechanical services in one place.',
    approach:
      'We designed a refined layout with an interactive comfort-control hero, image-led service cards, a room-by-room "what we handle" section, a recent projects showcase, builder partners, testimonials and a clear quote process.',
    outcome:
      'A premium, credible web presence that supports bids with builders and makes it simple for homeowners to call or request a quote.',
  },
  {
    host: 'hansgasheating.ca',
    slug: 'hans-gas-heating-website',
    title: 'A warm, modern website for a Metro Vancouver heating company',
    client: 'Hans Gas & Heating',
    industry: 'Heating, cooling & gas fitting',
    location: 'Metro Vancouver, BC',
    featured: false,
    summary:
      'A modern website for a licensed gas fitting and heating company serving Vancouver, Surrey, Burnaby, Richmond, Langley and the Fraser Valley.',
    challenge:
      'Homeowners often do not know whether they need a furnace repair, a heat pump or a gas line. Hans Gas needed a site that guides people to the right service and books visits quickly.',
    approach:
      'We built an interactive thermostat hero, service cards for furnaces, heat pumps, air conditioning, gas fitting and more, a "not sure what you need? start here" guide, a licensed-insured-bonded section, a Lower Mainland service-area map and reviews.',
    outcome:
      'A friendly, helpful site that guides homeowners to the right service and makes booking a visit or calling the owner effortless.',
  },
]

const payload = await getPayload({ config })

// 1. Remove existing (demo) results and the images only they used.
const existing = await payload.find({ collection: 'results', limit: 500, depth: 0 })
const mediaIds = new Set<number>()
for (const r of existing.docs) {
  if (typeof r.coverImage === 'number') mediaIds.add(r.coverImage)
  for (const g of r.gallery ?? []) if (typeof g.image === 'number') mediaIds.add(g.image)
}
for (const r of existing.docs) await payload.delete({ collection: 'results', id: r.id })
for (const id of mediaIds) await payload.delete({ collection: 'media', id }).catch(() => {})
payload.logger.info(`Removed ${existing.docs.length} results and ${mediaIds.size} images.`)

// 2. Create the real projects.
const websiteService = await payload.find({
  collection: 'services',
  where: { slug: { equals: 'website-design-development' } },
  limit: 1,
})
const serviceId = websiteService.docs[0]?.id
if (!serviceId) throw new Error('Website Design & Development service not found')

const upload = async (file: string, alt: string, name: string) => {
  const data = await sharp(file).jpeg({ quality: 84, mozjpeg: true }).toBuffer()
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: `${name}.jpg`, size: data.length },
  })
  return doc.id
}

const now = Date.now()
for (const [i, p] of projects.entries()) {
  const dir = path.join(SHOTS_DIR, p.host)
  const shot = (f: string) => path.join(dir, f)
  const cover = await upload(shot('cover.png'), `${p.client} website homepage`, `${p.slug}-cover`)
  const gallery = [
    { image: await upload(shot('phones.png'), `${p.client} website on mobile`, `${p.slug}-mobile`), caption: 'Mobile design' },
    { image: await upload(shot('long-1.png'), `${p.client} homepage design`, `${p.slug}-desktop-1`), caption: 'Homepage, desktop' },
  ]
  if (fs.existsSync(shot('long-2.png')))
    gallery.push({
      image: await upload(shot('long-2.png'), `${p.client} website sections`, `${p.slug}-desktop-2`),
      caption: 'Further down the page',
    })

  await payload.create({
    collection: 'results',
    data: {
      title: p.title,
      slug: p.slug,
      client: p.client,
      industry: p.industry,
      location: p.location,
      website: `https://${p.host}/`,
      services: [serviceId],
      featured: p.featured,
      // Only used for ordering (newest first); not shown on the site.
      date: new Date(now - i * 60_000).toISOString(),
      summary: p.summary,
      coverImage: cover,
      gallery,
      challenge: p.challenge,
      approach: p.approach,
      outcome: p.outcome,
    },
  })
  payload.logger.info(`Added ${p.client}`)
}

payload.logger.info('Portfolio import complete.')
process.exit(0)
