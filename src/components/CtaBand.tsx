import Link from 'next/link'
import React from 'react'

import { getSettings, telHref } from '@/lib/payload'

import { Icon } from './Icon'

export async function CtaBand({
  eyebrow = 'Ready when you are',
  title = 'Ready to grow your business?',
  text = 'Book a free 30-minute strategy call. We will review your website, ads and numbers, and tell you honestly what we would do first.',
}: {
  eyebrow?: string
  title?: string
  text?: string
}) {
  const settings = await getSettings()
  return (
    <section className="section--tight">
      <div className="container">
        <div className="cta-box" data-reveal>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="cta-box__side">
            <small>Call Binary Crafters</small>
            <a href={telHref(settings.phone)} className="cta-box__phone">
              {settings.phone}
            </a>
            <Link href="/contact" className="btn btn--primary btn--lg">
              Get a Free Quote <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
