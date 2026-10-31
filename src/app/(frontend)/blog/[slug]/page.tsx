import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { PostCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { asMedia, formatDate, getClient } from '@/lib/payload'
import type { Category } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })
  return docs[0]
}

const wordCount = (node: unknown): number => {
  if (!node || typeof node !== 'object') return 0
  const n = node as { text?: string; children?: unknown[]; root?: unknown }
  if (n.root) return wordCount(n.root)
  const own = typeof n.text === 'string' ? n.text.split(/\s+/).filter(Boolean).length : 0
  return own + (n.children ?? []).reduce<number>((sum, c) => sum + wordCount(c), 0)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  const cover = asMedia(post.coverImage)
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    openGraph: { type: 'article', images: cover?.url ? [cover.url] : undefined },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  const category = typeof post.category === 'object' ? (post.category as Category | null) : null
  const minutes = Math.max(1, Math.round(wordCount(post.content) / 220))

  const payload = await getClient()
  const related = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { id: { not_equals: post.id } },
        ...(category ? [{ category: { equals: category.id } }] : []),
      ],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  })

  return (
    <>
      <PageHero
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/blog', label: 'Blog' },
          ...(category ? [{ href: `/blog?category=${category.slug}`, label: category.title }] : []),
        ]}
        title=""
      >
        <div className="article-head" style={{ paddingBottom: 'clamp(56px, 7vw, 96px)' }}>
          <h1 style={{ margin: '28px 0 24px' }}>{post.title}</h1>
          <p className="lead">{post.excerpt}</p>
          <div className="author-row" style={{ marginTop: 32 }}>
            <span>{post.author}</span>
            <span>{formatDate(post.publishedAt, { month: 'long' })}</span>
            <span>{minutes} min read</span>
          </div>
        </div>
      </PageHero>

      <article className="section">
        <div className="container">
          {asMedia(post.coverImage) ? (
            <div className="article-cover">
              <Img media={asMedia(post.coverImage)} sizes="(min-width: 1240px) 1240px, 100vw" priority />
            </div>
          ) : null}
          <div className="prose" style={{ marginTop: 'clamp(48px, 6vw, 80px)' }}>
            <RichText data={post.content} disableContainer />
          </div>
          <div className="prose" style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
            <p>
              Want help putting this into practice? <Link href="/contact">Book a free call with our team</Link>.
            </p>
          </div>
        </div>
      </article>

      {related.docs.length > 0 ? (
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Keep reading</span>
              <h2>More from the journal.</h2>
            </div>
            <div className="posts-grid">
              {related.docs.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  )
}
