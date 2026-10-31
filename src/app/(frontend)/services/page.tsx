import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { ServiceCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'
import { getServices } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Website design, SEO, Google and Meta ads, social media, branding, CRM automation, e-commerce and AI chatbots from one Vancouver team.',
}

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="One team for every part of your growth."
        lead="Pick a single service or let us run the whole thing. Either way you get senior people, clear targets and monthly reporting you can actually read."
      />
      <section className="section section--soft">
        <div className="container">
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
      <CtaBand />
    </>
  )
}
