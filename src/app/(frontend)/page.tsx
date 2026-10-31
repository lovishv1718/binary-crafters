import Link from 'next/link'
import React from 'react'

import { PostCard, ResultCard, ServiceCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { Photo } from '@/components/Photo'
import { asMedia, getClient, getServices, getSettings, telHref } from '@/lib/payload'
import { stockPhotos } from '@/lib/photos'

const features = [
  {
    icon: 'eye',
    title: 'Honest reporting',
    text: 'Monthly reports in plain language: leads, sales and cost per customer. No vanity numbers.',
  },
  {
    icon: 'handshake',
    title: 'No long contracts',
    text: 'Month-to-month after the first 90 days. We keep clients by getting results, not paperwork.',
  },
  {
    icon: 'target',
    title: 'You own everything',
    text: 'Your website, domain, ad accounts and data belong to you from day one.',
  },
  {
    icon: 'bolt',
    title: 'Fast, direct support',
    text: 'Talk to the people doing the work. Most messages get a reply the same business day.',
  },
]

const steps = [
  { title: 'Free Strategy Call', text: 'Tell us about your business, goals and what has or has not worked so far.' },
  { title: 'Plan & Quote', text: 'You get a clear written plan with targets, a timeline and a fixed price.' },
  { title: 'Build & Launch', text: 'We design, build and launch, with a weekly update so you always know where things are.' },
  { title: 'Grow & Report', text: 'We track every lead and sale, keep improving, and report back each month.' },
]

export default async function HomePage() {
  const payload = await getClient()
  const [settings, services, featured, testimonials, posts] = await Promise.all([
    getSettings(),
    getServices(),
    payload.find({ collection: 'results', where: { featured: { equals: true } }, sort: '-date', limit: 3, depth: 1 }),
    payload.find({ collection: 'testimonials', sort: 'order', limit: 3, depth: 1 }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 3,
      depth: 1,
    }),
  ])

  const title = settings.heroTitle ?? ''
  // The closing phrase of the headline ("bring in customers.") is shown in brand blue on its own line.
  const splitAt = title.lastIndexOf(' that ')
  const titleNode =
    splitAt > 0 ? (
      <>
        {title.slice(0, splitAt + 5)} <em>{title.slice(splitAt + 6)}</em>
      </>
    ) : (
      title
    )
  const showcase = featured.docs[0]
  const showcaseMetric = showcase?.metrics?.[0]
  const tel = telHref(settings.phone)

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero">
        <div className="hero__bg">
          <Photo media={asMedia(settings.heroImage)} fallback={stockPhotos.hero} priority />
        </div>
        <div className="container hero__inner">
          <div>
            <span className="hero-pill">
              <b>Vancouver</b> Web, SEO & Ads Agency
            </span>
            <h1>{titleNode}</h1>
            <p className="lead">{settings.heroSubtitle}</p>
            <div className="hero__actions">
              <Link href="/contact" className="btn btn--primary btn--lg">
                Get a Free Quote <Icon name="arrow" size={18} />
              </Link>
              <Link href="/services" className="btn btn--ghost-light btn--lg">
                Explore Services
              </Link>
            </div>
            <div className="trust">
              <span>
                <Icon name="check" size={18} strokeWidth={2.2} /> Free strategy call
              </span>
              <span>
                <Icon name="check" size={18} strokeWidth={2.2} /> No long-term contracts
              </span>
              <span>
                <Icon name="check" size={18} strokeWidth={2.2} /> Local Vancouver team
              </span>
            </div>
          </div>

          {showcase ? (
            <Link href={`/results/${showcase.slug}`} className="hero-card">
              <div className="hero-badge">
                <span className="topbar__dot" />
                <span>
                  <strong>Live client project</strong>
                  Recent work
                </span>
              </div>
              <div className="hero-card__img">
                <Img media={asMedia(showcase.coverImage)} sizes="400px" priority />
              </div>
              <div className="hero-card__body">
                {showcaseMetric ? (
                  <>
                    <span className="hero-card__metric">{showcaseMetric.value}</span>
                    <span className="hero-card__label">
                      <b>{showcaseMetric.label}</b>
                      {showcase.client}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hero-card__label" style={{ flex: 1 }}>
                      <b>{showcase.client}</b>
                      {[showcase.industry, 'website by Binary Crafters'].filter(Boolean).join(' · ')}
                    </span>
                    <span className="hero-card__go">
                      <Icon name="arrow-up-right" size={18} />
                    </span>
                  </>
                )}
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[...services, ...services].map((s, i) => (
            <span key={`${s.id}-${i}`} className="ticker__item">
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------- About */}
      <section className="section">
        <div className="container split">
          <div className="split__media" data-reveal>
            <div className="photo">
              <Photo media={asMedia(settings.aboutImage)} fallback={stockPhotos.about} sizes="(min-width: 960px) 50vw, 100vw" />
            </div>
            <div className="stat-badge">
              <strong>{services.length}</strong>
              <span>digital services under one roof</span>
            </div>
          </div>
          <div data-reveal>
            <span className="eyebrow">Who we are</span>
            <h2>
              Your one team for websites, search <em>&amp; ads.</em>
            </h2>
            <p className="lead">
              Binary Crafters is a Vancouver digital agency for growing businesses. Instead of juggling a web
              designer, an SEO company and an ads freelancer, you get one senior team that plans, builds and
              markets everything together, and measures it in leads and sales.
            </p>
            <ul className="checklist checklist--2">
              {['Custom websites, no templates', 'Google & Meta certified ads', 'Clear monthly reporting', 'Vancouver-based team'].map(
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
            <div className="btn-row">
              <Link href="/about" className="btn btn--dark">
                More About Us <Icon name="arrow" size={18} />
              </Link>
              <a href={tel} className="btn btn--ghost">
                <Icon name="phone" size={18} /> {settings.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section className="section section--soft">
        <div className="container">
          <div className="section-head section-head--split">
            <div data-reveal>
              <span className="eyebrow">What we do</span>
              <h2 style={{ marginTop: 14 }}>Everything you need to grow online.</h2>
            </div>
            <p className="lead" data-reveal>
              Pick one service or let us handle it all. Every project gets senior people, clear targets and
              reporting you can actually understand.
            </p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
            <div className="svc-cta" data-reveal>
              <h3 style={{ fontSize: '1.5rem' }}>Not sure what you need?</h3>
              <p>Get a free audit of your website and marketing. We will tell you exactly what to fix first.</p>
              <Link href="/contact" className="btn btn--primary">
                Get a Free Audit <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Results */}
      {featured.docs.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section-head section-head--split">
              <div data-reveal>
                <span className="eyebrow">Our work</span>
                <h2 style={{ marginTop: 14 }}>Websites we&apos;ve built for local businesses.</h2>
              </div>
              <div data-reveal style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
                <p className="lead">
                  Real client sites, live today. Each one is custom designed, mobile-first and built to turn
                  visitors into calls and bookings.
                </p>
                <Link href="/results" className="btn btn--ghost btn--sm">
                  View All Projects <Icon name="arrow" size={17} />
                </Link>
              </div>
            </div>
            <div className="results-grid results-grid--3">
              {featured.docs.map((r, i) => (
                <ResultCard key={r.id} result={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------------- Why us */}
      <section className="section section--ink">
        <div className="container">
          <div className="section-head section-head--split">
            <div data-reveal>
              <span className="eyebrow">Why Binary Crafters</span>
              <h2 style={{ marginTop: 14 }}>Built on strategy. Backed by results.</h2>
            </div>
            <p className="lead" data-reveal>
              We treat your budget like our own: every page, campaign and dollar is planned around getting
              you more customers.
            </p>
          </div>
          <div className="features" data-reveal>
            {features.map((f) => (
              <div key={f.title} className="feature">
                <span className="feature__icon">
                  <Icon name={f.icon} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          {settings.stats && settings.stats.length > 0 ? (
            <div className="stats-row" data-reveal>
              {settings.stats.map((s) => (
                <div key={s.id}>
                  <span className="stat__value">{s.value}</span>
                  <span className="stat__label">{s.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------------------- Process */}
      <section className="section section--soft">
        <div className="container">
          <div className="section-head section-head--center" data-reveal>
            <span className="eyebrow">How it works</span>
            <h2>Simple from first call to launch.</h2>
            <p className="lead">A clear, four-step process so you always know what is happening and what comes next.</p>
          </div>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title} className="step" data-reveal style={{ ['--d' as string]: `${i * 0.08}s` }}>
                <span className="step__num">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- Testimonials */}
      {testimonials.docs.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section-head section-head--center" data-reveal>
              <span className="eyebrow">Testimonials</span>
              <h2>What our clients say.</h2>
            </div>
            <div className="tcards">
              {testimonials.docs.map((t, i) => {
                const photo = asMedia(t.photo)
                return (
                  <figure key={t.id} className="tcard" data-reveal style={{ margin: 0, ['--d' as string]: `${i * 0.08}s` }}>
                    <span className="stars">
                      {Array.from({ length: 5 }, (_, k) => (
                        <Icon key={k} name="star" size={17} strokeWidth={0} />
                      ))}
                    </span>
                    <blockquote>“{t.quote}”</blockquote>
                    <figcaption className="tcard__who">
                      <span className="avatar">{photo ? <Img media={photo} sizes="46px" /> : t.name.charAt(0)}</span>
                      <span>
                        <span className="quote__name">{t.name}</span>
                        <span className="quote__role">{[t.role, t.company].filter(Boolean).join(', ')}</span>
                      </span>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- Blog */}
      {posts.docs.length > 0 ? (
        <section className="section section--soft">
          <div className="container">
            <div className="section-head section-head--split">
              <div data-reveal>
                <span className="eyebrow">From the blog</span>
                <h2 style={{ marginTop: 14 }}>Tips to grow your business online.</h2>
              </div>
              <div data-reveal style={{ justifySelf: 'start' }}>
                <Link href="/blog" className="btn btn--ghost btn--sm">
                  All Articles <Icon name="arrow" size={17} />
                </Link>
              </div>
            </div>
            <div className="posts-grid">
              {posts.docs.map((p, i) => (
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
