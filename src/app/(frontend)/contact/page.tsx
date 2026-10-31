import type { Metadata } from 'next'
import React from 'react'

import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'
import { getServices, getSettings, telHref } from '@/lib/payload'

import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Book a free strategy call with Binary Crafters in Vancouver. Call 604-603-2201 or send us a message.',
}

type Props = { searchParams: Promise<{ service?: string }> }

export default async function ContactPage({ searchParams }: Props) {
  const { service } = await searchParams
  const [settings, services] = await Promise.all([getSettings(), getServices()])
  const titles = services.map((s) => s.title)

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your next customers."
        lead="Tell us a bit about your business. We will come back with honest advice and, if we are a fit, a clear plan and quote."
      />
      <section className="section">
        <div className="container contact">
          <div>
            <span className="eyebrow">Reach us directly</span>
            <h2 style={{ marginTop: 18, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              Prefer to talk? We pick up the phone.
            </h2>
            <ul className="contact-list">
              <li>
                <span className="mega__icon">
                  <Icon name="phone" />
                </span>
                <div>
                  <small>Call or text</small>
                  <a href={telHref(settings.phone)}>
                    <strong>{settings.phone}</strong>
                  </a>
                </div>
              </li>
              <li>
                <span className="mega__icon">
                  <Icon name="mail" />
                </span>
                <div>
                  <small>Email</small>
                  <a href={`mailto:${settings.email}`}>
                    <strong>{settings.email}</strong>
                  </a>
                </div>
              </li>
              <li>
                <span className="mega__icon">
                  <Icon name="pin" />
                </span>
                <div>
                  <small>Studio</small>
                  <strong>{settings.location}</strong>
                </div>
              </li>
              {settings.hours ? (
                <li>
                  <span className="mega__icon">
                    <Icon name="clock" />
                  </span>
                  <div>
                    <small>Hours</small>
                    <strong>{settings.hours}</strong>
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
          <ContactForm services={titles} preset={titles.includes(service ?? '') ? service : undefined} />
        </div>
      </section>
    </>
  )
}
