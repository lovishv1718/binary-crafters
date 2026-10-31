import Link from 'next/link'
import React from 'react'

import type { Category, Post, Result, Service } from '@/payload-types'
import { asMedia, asServices, formatDate } from '@/lib/payload'

import { Icon } from './Icon'
import { Img } from './Img'

const delay = (index: number) => ({ ['--d' as string]: `${(index % 3) * 0.08}s` })

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <Link href={`/services/${service.slug}`} className="svc-card" data-reveal style={delay(index)}>
      <div className="svc-card__media">
        <span className="num-badge">{String(index + 1).padStart(2, '0')}</span>
        <Img media={asMedia(service.coverImage)} sizes="(min-width: 1040px) 33vw, (min-width: 680px) 50vw, 100vw" />
      </div>
      <div className="svc-card__body">
        <span className="svc-card__icon">
          <Icon name={service.icon ?? 'web'} size={22} />
        </span>
        <h3>{service.title}</h3>
        <p>{service.tagline}</p>
        <span className="link-arrow">
          Learn more <Icon name="arrow" size={17} />
        </span>
      </div>
    </Link>
  )
}

export function ResultCard({ result, index = 0, priority }: { result: Result; index?: number; priority?: boolean }) {
  const services = asServices(result.services)
  return (
    <Link href={`/results/${result.slug}`} className="result-card" data-reveal style={delay(index)}>
      <div className="result-card__media">
        <div className="result-card__tags">
          {services.slice(0, 2).map((s) => (
            <span key={s.id} className="tag">
              {s.title}
            </span>
          ))}
        </div>
        <Img media={asMedia(result.coverImage)} sizes="(min-width: 1100px) 33vw, (min-width: 760px) 50vw, 100vw" priority={priority} />
      </div>
      <div className="result-card__body">
        <span className="result-card__meta">
          {result.client}
          {result.location ? ` · ${result.location}` : ''}
        </span>
        <h3>{result.title}</h3>
        {result.metrics && result.metrics.length > 0 ? (
          <div className="metrics">
            {result.metrics.slice(0, 3).map((m) => (
              <div key={m.id}>
                <span className="metric__value">{m.value}</span>
                <span className="metric__label">{m.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="result-card__summary">{result.summary}</p>
            <span className="link-arrow result-card__more">
              View project <Icon name="arrow" size={17} />
            </span>
          </>
        )}
      </div>
    </Link>
  )
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const category = typeof post.category === 'object' ? (post.category as Category | null) : null
  return (
    <Link href={`/blog/${post.slug}`} className="post-card" data-reveal style={delay(index)}>
      <div className="post-card__media">
        <Img media={asMedia(post.coverImage)} sizes="(min-width: 1080px) 33vw, (min-width: 720px) 50vw, 100vw" />
      </div>
      <div className="post-card__body">
        <div className="post-card__meta">
          {category ? <span className="tag">{category.title}</span> : null}
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="link-arrow" style={{ marginTop: 'auto', paddingTop: 6 }}>
          Read article <Icon name="arrow" size={17} />
        </span>
      </div>
    </Link>
  )
}
