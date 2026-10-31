import Image from 'next/image'
import React from 'react'

import type { Media } from '@/payload-types'

// By default fills its (relatively positioned) parent and respects the focal point set in the admin.
// `natural` renders the whole image at its own aspect ratio, for proof screenshots that must not be cropped.
export function Img({
  media,
  sizes = '100vw',
  priority,
  alt,
  natural,
}: {
  media: Media | null | undefined
  sizes?: string
  priority?: boolean
  alt?: string
  natural?: boolean
}) {
  if (!media?.url) return null
  if (natural && media.width && media.height) {
    return (
      <Image
        src={media.url}
        alt={alt ?? media.alt ?? ''}
        width={media.width}
        height={media.height}
        sizes={sizes}
        style={{ width: '100%', height: 'auto' }}
      />
    )
  }
  const x = media.focalX ?? 50
  const y = media.focalY ?? 50
  return (
    <Image
      src={media.url}
      alt={alt ?? media.alt ?? ''}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: 'cover', objectPosition: `${x}% ${y}%` }}
    />
  )
}
