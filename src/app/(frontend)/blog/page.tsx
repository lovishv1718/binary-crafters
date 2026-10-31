import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { PostCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { asMedia, formatDate, getClient } from '@/lib/payload'
import type { Category } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical advice on websites, SEO, ads and marketing automation from the Binary Crafters team.',
}

type Props = { searchParams: Promise<{ category?: string; page?: string }> }

export default async function BlogPage({ searchParams }: Props) {
  const { category: categorySlug, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const payload = await getClient()

  const categories = await payload.find({ collection: 'categories', limit: 50, sort: 'title' })
  const active = categories.docs.find((c) => c.slug === categorySlug)

  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [{ _status: { equals: 'published' } }, ...(active ? [{ category: { equals: active.id } }] : [])],
    },
    sort: '-publishedAt',
    limit: 13,
    page,
    depth: 1,
  })

  const showFeature = page === 1 && !active && posts.docs.length > 0
  const [feature, ...rest] = showFeature ? posts.docs : [null, ...posts.docs]
  const featureCategory = feature && typeof feature.category === 'object' ? (feature.category as Category) : null
  const qs = (p: number) => `/blog?${new URLSearchParams({ ...(active ? { category: active.slug ?? '' } : {}), page: String(p) })}`

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Straight answers on getting more customers online."
        lead="Guides, breakdowns and lessons from campaigns we run every day. Written by the team, not a content farm."
      />
      <section className="section section--soft">
        <div className="container">
          {feature ? (
            <Link href={`/blog/${feature.slug}`} className="post-feature" data-reveal>
              <div className="post-card__media">
                <Img media={asMedia(feature.coverImage)} sizes="(min-width: 960px) 55vw, 100vw" priority />
              </div>
              <div className="post-feature__body">
                <div className="post-card__meta">
                  <span className="tag">Latest</span>
                  {featureCategory ? <span>{featureCategory.title}</span> : null}
                  <span>{formatDate(feature.publishedAt)}</span>
                </div>
                <h2>{feature.title}</h2>
                <p className="lead">{feature.excerpt}</p>
                <span className="link-arrow" style={{ marginTop: 28 }}>
                  Read article <Icon name="arrow" size={18} />
                </span>
              </div>
            </Link>
          ) : null}

          <nav className="filters" aria-label="Filter by category">
            <Link href="/blog" className={`filter${!active ? ' is-active' : ''}`} scroll={false}>
              All
            </Link>
            {categories.docs.map((c) => (
              <Link
                key={c.id}
                href={`/blog?category=${c.slug}`}
                className={`filter${active?.id === c.id ? ' is-active' : ''}`}
                scroll={false}
              >
                {c.title}
              </Link>
            ))}
          </nav>

          {rest.length > 0 ? (
            <div className="posts-grid">
              {rest.map((p, i) => (p ? <PostCard key={p.id} post={p} index={i} /> : null))}
            </div>
          ) : !feature ? (
            <p className="empty">No articles here yet.</p>
          ) : null}

          {posts.totalPages > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 64 }}>
              {posts.hasPrevPage ? (
                <Link href={qs(page - 1)} className="btn btn--ghost btn--sm">
                  Newer
                </Link>
              ) : null}
              <span className="filter is-active">
                {page} / {posts.totalPages}
              </span>
              {posts.hasNextPage ? (
                <Link href={qs(page + 1)} className="btn btn--ghost btn--sm">
                  Older
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
      <CtaBand />
    </>
  )
}
