import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { ResultCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { asMedia, getClient } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

async function getService(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug)
  if (!service) return {}
  return { title: service.title, description: service.intro ?? service.tagline }
}

export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).slug)
  if (!service) notFound()

  const payload = await getClient()
  const results = await payload.find({
    collection: 'results',
    where: { services: { contains: service.id } },
    sort: '-date',
    limit: 6,
    depth: 1,
  })

  return (
    <>
      <PageHero
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/services', label: 'Services' },
          { label: service.title },
        ]}
      >
        <div className="service-hero">
          <div>
            <span className="service-hero__icon">
              <Icon name={service.icon ?? 'web'} size={28} />
            </span>
            <h1>{service.headline || service.title}</h1>
            <p className="lead">{service.intro}</p>
            <div className="hero__actions">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="btn btn--primary btn--lg"
              >
                Get a Free Quote <Icon name="arrow" size={18} />
              </Link>
              {results.totalDocs > 0 ? (
                <a href="#results" className="btn btn--ghost-light btn--lg">
                  See Results
                </a>
              ) : null}
            </div>
          </div>
          <div className="service-hero__media">
            <Img
              media={asMedia(service.coverImage)}
              sizes="(min-width: 1000px) 45vw, 100vw"
              priority
            />
          </div>
        </div>
      </PageHero>

      {service.deliverables && service.deliverables.length > 0 ? (
        <section className="section">
          <div className="container two-col">
            <div className="two-col__sticky" data-reveal>
              <span className="eyebrow">What&apos;s included</span>
              <h2>Everything you get with {service.title}.</h2>
              <p className="lead" style={{ marginTop: 16 }}>
                A complete service, handled by senior people from start to finish.
              </p>
            </div>
            <ul className="deliver" data-reveal>
              {service.deliverables.map((d) => (
                <li key={d.id}>
                  <span className="checklist__tick">
                    <Icon name="check" size={14} strokeWidth={2.4} />
                  </span>
                  {d.item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {service.process && service.process.length > 0 ? (
        <section className="section section--soft">
          <div className="container">
            <div className="section-head section-head--center" data-reveal>
              <span className="eyebrow">Our process</span>
              <h2>How we deliver it.</h2>
            </div>
            <div className="process">
              {service.process.map((p, i) => (
                <div
                  key={p.id}
                  className="process__step"
                  data-reveal
                  style={{ ['--d' as string]: `${i * 0.08}s` }}
                >
                  <span className="process__num">0{i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Shown only once this service has real results added in the admin. */}
      {results.docs.length > 0 ? (
        <section className="section" id="results">
          <div className="container">
            <div className="section-head section-head--split">
              <div data-reveal>
                <span className="eyebrow">Our {service.title} work</span>
                <h2 style={{ marginTop: 14 }}>Recent projects.</h2>
              </div>
              <div data-reveal style={{ justifySelf: 'start' }}>
                <Link href={`/results?service=${service.slug}`} className="btn btn--ghost btn--sm">
                  View All Projects <Icon name="arrow" size={17} />
                </Link>
              </div>
            </div>
            <div className="results-grid results-grid--3">
              {results.docs.map((r, i) => (
                <ResultCard key={r.id} result={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.faqs && service.faqs.length > 0 ? (
        <section className="section section--soft">
          <div className="container two-col">
            <div className="two-col__sticky" data-reveal>
              <span className="eyebrow">FAQ</span>
              <h2>Questions we hear a lot.</h2>
            </div>
            <div className="faq" data-reveal>
              {service.faqs.map((f) => (
                <details key={f.id}>
                  <summary>
                    {f.question}
                    <span className="faq__plus">
                      <Icon name="plus" size={16} />
                    </span>
                  </summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand title={`Ready to get started with ${service.title}?`} />
    </>
  )
}
