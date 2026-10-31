import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { ResultCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { asMedia, asServices, getClient } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

async function getResult(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'results',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getResult((await params).slug)
  if (!result) return {}
  const cover = asMedia(result.coverImage)
  return {
    title: `${result.title} · ${result.client}`,
    description: result.summary,
    openGraph: cover?.url ? { images: [cover.url] } : undefined,
  }
}

export default async function ResultPage({ params }: Props) {
  const result = await getResult((await params).slug)
  if (!result) notFound()

  const services = asServices(result.services)
  const payload = await getClient()
  const more = await payload.find({
    collection: 'results',
    where: {
      and: [
        { id: { not_equals: result.id } },
        ...(services[0] ? [{ services: { contains: services[0].id } }] : []),
      ],
    },
    limit: 3,
    depth: 1,
  })

  const story = [
    { label: 'The challenge', text: result.challenge },
    { label: 'What we did', text: result.approach },
    { label: 'The outcome', text: result.outcome },
  ].filter((s) => s.text)

  return (
    <>
      <PageHero
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/results', label: 'Results' },
          { label: result.client },
        ]}
        eyebrow={[result.client, result.industry, result.location].filter(Boolean).join(' · ')}
        title={result.title}
        lead={result.summary}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
          {services.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`} className="tag">
              {s.title}
            </Link>
          ))}
        </div>
        {result.website ? (
          <div className="hero__actions">
            <a
              href={result.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--lg"
            >
              Visit Live Website <Icon name="arrow-up-right" size={18} />
            </a>
            <Link href="/contact" className="btn btn--ghost-light btn--lg">
              Get a Site Like This
            </Link>
          </div>
        ) : null}
        {result.metrics && result.metrics.length > 0 ? (
          <div className="result-hero-metrics" style={{ paddingBottom: 'clamp(56px, 7vw, 96px)' }}>
            {result.metrics.map((m) => (
              <div key={m.id}>
                <span className="metric__value">{m.value}</span>
                <span className="metric__label">{m.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="result-cover">
            <Img
              media={asMedia(result.coverImage)}
              sizes="(min-width: 1240px) 1240px, 100vw"
              priority
            />
          </div>

          {story.length > 0 ? (
            <div className="story" style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}>
              {story.map((s, i) => (
                <div key={s.label} data-reveal style={{ ['--d' as string]: `${i * 0.08}s` }}>
                  <h3>{s.label}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {result.gallery && result.gallery.length > 0 ? (
        <section className="section section--soft">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-reveal>
                The work
              </span>
              <h2 data-reveal>Desktop and mobile screens.</h2>
            </div>
            <div className="gallery">
              {result.gallery.map((g) => (
                <figure key={g.id} data-reveal>
                  <div className="gallery__img">
                    <Img media={asMedia(g.image)} sizes="(min-width: 760px) 60vw, 100vw" natural />
                  </div>
                  {g.caption ? <figcaption>{g.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {result.quote?.text ? (
        <section className="section">
          <div className="container pull-quote" data-reveal>
            <span className="quote__mark">
              <Icon name="quote" size={40} />
            </span>
            <blockquote>{result.quote.text}</blockquote>
            {result.quote.author ? (
              <p className="lead" style={{ margin: '0 auto' }}>
                {result.quote.author}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {more.docs.length > 0 ? (
        <section className="section section--ink">
          <div className="container">
            <div className="section-head section-head--split">
              <h2 data-reveal>More of our work.</h2>
              <div data-reveal style={{ justifySelf: 'start' }}>
                <Link href="/results" className="btn btn--ghost-light btn--sm">
                  All Projects <Icon name="arrow" size={17} />
                </Link>
              </div>
            </div>
            <div className="results-grid results-grid--3">
              {more.docs.map((r, i) => (
                <ResultCard key={r.id} result={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand title="Let's make your business the next one on this page." />
    </>
  )
}
