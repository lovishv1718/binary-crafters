import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { ResultCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { PageHero } from '@/components/PageHero'
import { getClient, getServices } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Results',
  description:
    'Client results from Binary Crafters: websites, SEO, Google Ads, Meta Ads, branding and more.',
}

type Props = { searchParams: Promise<{ service?: string }> }

export default async function ResultsPage({ searchParams }: Props) {
  const { service: serviceSlug } = await searchParams
  const payload = await getClient()

  // Only offer filters for services that actually have results.
  const tagged = await payload.find({
    collection: 'results',
    depth: 0,
    limit: 500,
    select: { services: true },
  })
  const usedIds = new Set(
    tagged.docs.flatMap((r) => (r.services ?? []).map((s) => (typeof s === 'object' ? s.id : s))),
  )
  const services = (await getServices()).filter((s) => usedIds.has(s.id))
  const active = services.find((s) => s.slug === serviceSlug)

  const results = await payload.find({
    collection: 'results',
    where: active ? { services: { contains: active.id } } : undefined,
    sort: '-date',
    limit: 60,
    depth: 1,
  })

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Websites and projects we've built for real businesses."
        lead="A selection of recent client work across British Columbia and Alberta. Click any project to see the full desktop and mobile design, or visit the live site."
      />
      <section className="section section--soft">
        <div className="container">
          {services.length > 1 ? (
            <nav className="filters" aria-label="Filter results by service">
              <Link
                href="/results"
                className={`filter${!active ? ' is-active' : ''}`}
                scroll={false}
              >
                All work
              </Link>
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`/results?service=${s.slug}`}
                  className={`filter${active?.id === s.id ? ' is-active' : ''}`}
                  scroll={false}
                >
                  {s.title}
                </Link>
              ))}
            </nav>
          ) : null}
          {results.docs.length > 0 ? (
            <div className="results-grid results-grid--3">
              {results.docs.map((r, i) => (
                <ResultCard key={r.id} result={r} index={i} priority={i < 3} />
              ))}
            </div>
          ) : (
            <p className="empty">No results for this service yet. Check back soon.</p>
          )}
        </div>
      </section>
      <CtaBand title="Want results like these?" />
    </>
  )
}
