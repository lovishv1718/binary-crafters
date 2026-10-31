import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { stockPhotos } from '@/lib/photos'

export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string
  title?: React.ReactNode
  lead?: React.ReactNode
  crumbs?: { href?: string; label: string }[]
  children?: React.ReactNode
}) {
  return (
    <section className="page-hero">
      <div className="page-hero__bg">
        <Image src={stockPhotos.hero.src} alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} />
      </div>
      <div className="container page-hero__inner">
        {crumbs ? (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <React.Fragment key={c.label}>
                {i > 0 ? <span aria-hidden>/</span> : null}
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
              </React.Fragment>
            ))}
          </nav>
        ) : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        {title ? <h1>{title}</h1> : null}
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
      </div>
    </section>
  )
}
