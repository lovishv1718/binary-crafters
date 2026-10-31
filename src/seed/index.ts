// Fills an empty database with demo content. Run with: npm run seed
// Safe to re-run: it stops if services already exist, so it never overwrites the client's real content.
import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

import * as art from './art'
import { categories, posts, results, services } from './content'

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'services' })
if (existing.totalDocs > 0) {
  payload.logger.info('Content already exists, skipping seed.')
  process.exit(0)
}

let imageCount = 0
async function upload(svg: string, alt: string) {
  const data = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
  imageCount++
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/png', name: `demo-${imageCount}.png`, size: data.length },
  })
  return doc.id
}

// Lexical rich-text helpers
const t = (text: string) => ({ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }
type Block = (typeof posts)[number]['body'][number]
const toLexical = (blocks: Block[]) => ({
  root: {
    type: 'root',
    ...base,
    children: blocks.map((b) => {
      const [kind, value] = b
      if (kind === 'ul')
        return {
          type: 'list',
          listType: 'bullet',
          start: 1,
          tag: 'ul',
          ...base,
          children: (value as string[]).map((v, i) => ({ type: 'listitem', value: i + 1, ...base, children: [t(v)] })),
        }
      if (kind === 'h2' || kind === 'h3') return { type: 'heading', tag: kind, ...base, children: [t(value as string)] }
      if (kind === 'quote') return { type: 'quote', ...base, children: [t(value as string)] }
      return { type: 'paragraph', textFormat: 0, ...base, children: [t(value as string)] }
    }),
  },
})

// Admin user for local development (credentials live in .env)
const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
if (email && password) {
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0) {
    await payload.create({ collection: 'users', data: { email, password, name: 'Binary Crafters Team' } })
    payload.logger.info(`Created admin user ${email}`)
  }
}

payload.logger.info('Seeding site settings…')
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    phone: '604-603-2201',
    email: 'info@binarycrafters.com',
    location: 'Vancouver, Canada',
    hours: 'Mon–Fri, 9am–6pm PT',
    facebook: 'https://www.facebook.com/share/14tRdAZwTky/',
    instagram: 'https://www.instagram.com/binarycrafters',
    twitter: '',
    heroEyebrow: 'Digital studio · Vancouver, BC',
    heroTitle: 'We build the websites and campaigns that bring in customers.',
    heroSubtitle:
      'Design, search, ads and automation from one senior team in Vancouver. One plan, clear targets, and results measured in leads and sales.',
    // Stats and testimonials are left empty on purpose: add only real, verifiable ones in the admin.
    stats: [],
  },
})

payload.logger.info('Seeding services…')
const serviceIds: Record<string, number> = {}
for (const [i, s] of services.entries()) {
  const cover = await upload(s.cover(), `${s.title} example`)
  const doc = await payload.create({
    collection: 'services',
    data: {
      title: s.title,
      slug: s.slug,
      order: i + 1,
      icon: s.icon,
      tagline: s.tagline,
      headline: s.headline,
      intro: s.intro,
      coverImage: cover,
      deliverables: s.deliverables.map((item) => ({ item })),
      process: s.process.map(([title, description]) => ({ title, description })),
      faqs: s.faqs.map(([question, answer]) => ({ question, answer })),
    },
  })
  serviceIds[s.slug] = doc.id
}

payload.logger.info('Seeding results…')
for (const r of results) {
  const cover = await upload(r.cover(), `${r.client}: ${r.title}`)
  const gallery = []
  for (const [make, caption] of r.gallery) gallery.push({ image: await upload(make(), `${r.client}: ${caption}`), caption })
  await payload.create({
    collection: 'results',
    data: {
      title: r.title,
      slug: r.slug,
      client: r.client,
      industry: r.industry,
      location: r.location,
      services: r.services.map((slug) => serviceIds[slug]),
      featured: r.featured,
      date: r.date,
      summary: r.summary,
      metrics: r.metrics.map(([value, label]) => ({ value, label })),
      coverImage: cover,
      gallery,
      challenge: r.challenge,
      approach: r.approach,
      outcome: r.outcome,
      quote: r.quote ? { text: r.quote[0], author: r.quote[1] } : undefined,
    },
  })
}

payload.logger.info('Seeding blog…')
const categoryIds: Record<string, number> = {}
for (const title of categories) {
  const doc = await payload.create({ collection: 'categories', data: { title } })
  categoryIds[title] = doc.id
}
for (const [i, p] of posts.entries()) {
  const cover = await upload(art.editorialCover({ label: p.category, title: p.title, palette: p.palette, seed: 1300 + i }), p.title)
  await payload.create({
    collection: 'posts',
    data: {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      category: categoryIds[p.category],
      coverImage: cover,
      publishedAt: p.date,
      author: 'Binary Crafters Team',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: toLexical(p.body) as any,
      _status: 'published',
    },
  })
}

payload.logger.info(`Seed complete: ${imageCount} demo images uploaded.`)
process.exit(0)
