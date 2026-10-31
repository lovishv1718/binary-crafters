import type { MetadataRoute } from 'next'

import { getClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

// Lists every public page, including CMS content, so search engines can find it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getClient()
  const [services, results, posts] = await Promise.all([
    payload.find({ collection: 'services', limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'results', limit: 500, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const page = (path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    priority,
  })

  return [
    page('', 1),
    page('/services', 0.9),
    page('/results', 0.8),
    page('/blog', 0.7),
    page('/about', 0.6),
    page('/contact', 0.8),
    page('/privacy', 0.2),
    ...services.docs.map((s) => page(`/services/${s.slug}`, 0.9, s.updatedAt)),
    ...results.docs.map((r) => page(`/results/${r.slug}`, 0.6, r.updatedAt)),
    ...posts.docs.map((p) => page(`/blog/${p.slug}`, 0.6, p.updatedAt)),
  ]
}
