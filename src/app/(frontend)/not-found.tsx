import Link from 'next/link'
import React from 'react'

import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'

export default function NotFound() {
  return (
    <PageHero eyebrow="404" title="This page took a wrong turn." lead="The link may be old or mistyped. Let's get you back on track.">
      <div className="hero__actions">
        <Link href="/" className="btn btn--primary">
          Back to home <Icon name="arrow" size={18} />
        </Link>
        <Link href="/contact" className="btn btn--ghost-light">
          Contact us
        </Link>
      </div>
    </PageHero>
  )
}
