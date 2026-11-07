import type { Payload, PayloadRequest } from 'payload'

import type { Role } from '../payload-types'

type Preset = {
  name: string
  description: string
  services: string[] // service slugs
  permissions: Partial<NonNullable<Role['permissions']>>
}

// Starting roles the owner can use as-is, edit or delete.
export const PRESET_ROLES: Preset[] = [
  {
    name: 'Website Designer',
    description: 'Builds client websites: adds them to Results and keeps the website service pages up to date.',
    services: ['website-design-development', 'ecommerce-setup'],
    permissions: { results: 'full', services: 'edit', leads: 'read' },
  },
  {
    name: 'SEO Specialist',
    description: 'SEO results and service page, plus blog articles.',
    services: ['seo'],
    permissions: { results: 'full', services: 'edit', posts: 'edit', categories: 'edit', leads: 'read' },
  },
  {
    name: 'Ads Manager',
    description: 'Google Ads and Meta Ads results and service pages.',
    services: ['google-ads', 'meta-ads'],
    permissions: { results: 'full', services: 'edit', leads: 'read' },
  },
  {
    name: 'Social Media & Design',
    description: 'Social media, graphic design and branding results and service pages.',
    services: ['social-media-management', 'graphic-design', 'logo-branding'],
    permissions: { results: 'full', services: 'edit', leads: 'read' },
  },
  {
    name: 'Blog Writer',
    description: 'Writes and publishes blog articles. No access to anything else.',
    services: [],
    permissions: { posts: 'full', categories: 'edit' },
  },
]

// Adds any preset role that does not exist yet (matched by name). Never changes existing roles.
export async function createPresetRoles(payload: Payload, req?: Partial<PayloadRequest>) {
  const { docs: services } = await payload.find({ collection: 'services', limit: 100, depth: 0, req })
  const bySlug = new Map(services.map((s) => [s.slug, s.id]))
  let created = 0
  for (const preset of PRESET_ROLES) {
    const exists = await payload.count({ collection: 'roles', where: { name: { equals: preset.name } }, req })
    if (exists.totalDocs > 0) continue
    await payload.create({
      collection: 'roles',
      req,
      data: {
        name: preset.name,
        description: preset.description,
        services: preset.services.map((slug) => bySlug.get(slug)).filter((id): id is number => typeof id === 'number'),
        permissions: preset.permissions as Role['permissions'],
      },
    })
    created++
  }
  return created
}
