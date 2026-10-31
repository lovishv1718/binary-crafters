import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media, Service } from '@/payload-types'

export const getClient = cache(() => getPayload({ config }))

export const getSettings = cache(async () => {
  const payload = await getClient()
  return payload.findGlobal({ slug: 'site-settings' })
})

export const getServices = cache(async () => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'services', sort: 'order', limit: 50, depth: 1 })
  return docs
})

export const asMedia = (value: number | Media | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

export const asServices = (value: (number | Service)[] | null | undefined): Service[] =>
  (value ?? []).filter((s): s is Service => typeof s === 'object' && s !== null)

export const formatDate = (iso?: string | null, opts: Intl.DateTimeFormatOptions = {}) =>
  iso
    ? new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric', ...opts }).format(
        new Date(iso),
      )
    : ''

export const telHref = (phone?: string | null) => `tel:+1${(phone ?? '').replace(/\D/g, '')}`
