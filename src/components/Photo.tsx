import Image from 'next/image'
import React from 'react'

import type { Media } from '@/payload-types'

import { Img } from './Img'

// A photo the client can replace in the admin; falls back to the default stock image.
export function Photo({
  media,
  fallback,
  sizes = '100vw',
  priority,
}: {
  media: Media | null | undefined
  fallback: { src: string; alt: string }
  sizes?: string
  priority?: boolean
}) {
  if (media?.url) return <Img media={media} sizes={sizes} priority={priority} />
  return <Image src={fallback.src} alt={fallback.alt} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover' }} />
}
