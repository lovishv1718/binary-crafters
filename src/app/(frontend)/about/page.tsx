import type { Metadata } from 'next'
import React from 'react'

import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { PageHero } from '@/components/PageHero'
import { asMedia, getServices, getSettings } from '@/lib/payload'
import { stockPhotos } from '@/lib/photos'

export const metadata: Metadata = {
  title: 'About',
  description: 'Binary Crafters is a Vancouver digital agency of designers, developers and marketers.',
}

const values = [
  {
    icon: 'eye',
    title: 'Honest numbers',
    text: 'We report leads, sales and cost per customer. Not impressions dressed up as progress.',
  },
  {
    icon: 'handshake',
    title: 'You own everything',
    text: 'Your domain, website, ad accounts and data are yours from the first day, always.',
  },
  {
    icon: 'bolt',
    title: 'Fast and direct',
    text: 'Talk to the person doing the work. Most messages get a reply the same day.',
  },
  {
    icon: 'target',
    title: 'Built to convert',
    text: 'Good looks matter, but every page and ad is designed around one job: getting the enquiry.',
  },
]

export default async function AboutPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()])

  return (
    <>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { label: 'About' }]}
        eyebrow="About us"
        title="Designers, developers and marketers under one roof."
        lead="Binary Crafters started with a simple frustration: business owners paying three different agencies that never talked to each other. So we built one team that does all of it."
      />

      <section className="section">
        <div className="container split">
          <div className="split__media" data-reveal>
            <div className="photo">
              <Photo media={asMedia(settings.aboutImage)} fallback={stockPhotos.meeting} sizes="(min-width: 960px) 50vw, 100vw" />
            </div>
            <div className="stat-badge">
              <strong>{services.length}</strong>
              <span>services delivered by one team</span>
            </div>
          </div>
          <div data-reveal>
            <span className="eyebrow">Our story</span>
            <h2>
              A Vancouver agency built around <em>your results.</em>
            </h2>
            <p className="lead">
              We work with trades, clinics, restaurants, retailers and online stores across Canada. Our job is
              simple: build a strong online presence and fill it with the right customers.
            </p>
            <p className="lead" style={{ marginTop: 16 }}>
              Every project is run by senior people who plan, design, build and market together, so nothing
              gets lost between agencies and every dollar is tracked to a result.
            </p>
            <ul className="checklist checklist--2">
              {['Strategy before spend', 'Custom work, never templates', 'Clear monthly reports', 'Month-to-month terms'].map(
                (t) => (
                  <li key={t}>
                    <span className="checklist__tick">
                      <Icon name="check" size={14} strokeWidth={2.4} />
                    </span>
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {settings.stats && settings.stats.length > 0 ? (
        <section className="section section--ink section--tight">
          <div className="container">
            <div className="stats-row" style={{ marginTop: 0 }} data-reveal>
              {settings.stats.map((s) => (
                <div key={s.id}>
                  <span className="stat__value">{s.value}</span>
                  <span className="stat__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--soft">
        <div className="container">
          <div className="section-head section-head--center" data-reveal>
            <span className="eyebrow">How we operate</span>
            <h2>What you can count on.</h2>
          </div>
          <div className="values">
            {values.map((v, i) => (
              <div key={v.title} className="value" data-reveal style={{ ['--d' as string]: `${i * 0.08}s` }}>
                <span className="mega__icon">
                  <Icon name={v.icon} />
                </span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Let's talk about your goals." />
    </>
  )
}
