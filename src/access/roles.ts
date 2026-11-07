// Role-based access for the admin panel.
//
// - An Owner (users.owner) can do everything, including managing users and roles.
// - Everyone else gets a Role (collection "roles") that sets a level per section:
//   none → read (view only) → edit (add & edit) → full (add, edit & delete).
// - A role can be limited to some services: then Results, Service pages and Enquiries
//   only show (and only accept) items for those services.
//
// The public website reads content through the Local API without a user, so none of this
// changes what visitors see.
import { APIError } from 'payload'
import type { Access, CollectionBeforeChangeHook, PayloadRequest, Where } from 'payload'

import type { Role, Service } from '../payload-types'

export type Level = 'none' | 'read' | 'edit' | 'full'
export type Section =
  | 'posts'
  | 'categories'
  | 'results'
  | 'services'
  | 'testimonials'
  | 'media'
  | 'leads'
  | 'siteSettings'

const RANK: Record<Level, number> = { none: 0, read: 1, edit: 2, full: 3 }

// Sections whose items belong to a service, so a role limited to services only sees its own.
const SCOPED: Section[] = ['results', 'services', 'leads']

// Anyone who can add or edit content needs to upload images for it.
const CONTENT: Section[] = ['posts', 'results', 'services', 'testimonials']

type UserLike = { id?: number | string; owner?: boolean | null; role?: number | Role | null } | null | undefined

export const isOwner = (user: unknown): boolean => Boolean(user && (user as { owner?: boolean }).owner)

const idOf = (v: number | { id: number } | null | undefined) => (v && typeof v === 'object' ? v.id : v)
export const ids = (list: unknown): number[] =>
  Array.isArray(list) ? list.map((v) => idOf(v as number | Service)).filter((v): v is number => typeof v === 'number') : []

// The signed-in user's role. Normally already populated on req.user; otherwise loaded once per request.
export async function getRole(req: PayloadRequest): Promise<Role | null> {
  const user = req.user as UserLike
  if (!user?.role) return null
  if (typeof user.role === 'object') return user.role
  const key = `__role:${user.role}`
  if (!(key in req.context)) {
    req.context[key] = await req.payload
      .findByID({ collection: 'roles', id: user.role, depth: 0, overrideAccess: true, req })
      .catch(() => null)
  }
  return req.context[key] as Role | null
}

export function levelOf(role: Role | null | undefined, section: Section): Level {
  const own = ((role?.permissions as Record<string, Level | null> | undefined)?.[section] ?? 'none') as Level
  if (section !== 'media') return own
  const canEditContent = CONTENT.some((s) => RANK[levelOf(role, s)] >= RANK.edit)
  return canEditContent && RANK[own] < RANK.edit ? 'edit' : own
}

export const scopeOf = (role: Role | null | undefined): number[] => ids(role?.services)

async function scopeWhere(req: PayloadRequest, section: Section, role: Role | null): Promise<true | Where> {
  const scope = scopeOf(role)
  if (!SCOPED.includes(section) || scope.length === 0) return true
  if (section === 'results') return { services: { in: scope } }
  if (section === 'services') return { id: { in: scope } }
  // Enquiries store the service by its title (that is what the contact form sends).
  const { docs } = await req.payload.find({
    collection: 'services',
    where: { id: { in: scope } },
    depth: 0,
    limit: scope.length,
    overrideAccess: true,
    req,
  })
  return { service: { in: docs.map((s) => s.title) } }
}

// Signed-in users who reach `need` on `section`; limited to their services where that applies.
export const allow =
  (section: Section, need: Level): Access =>
  async ({ req }) => {
    if (!req.user) return false
    if (isOwner(req.user)) return true
    const role = await getRole(req)
    if (RANK[levelOf(role, section)] < RANK[need]) return false
    return scopeWhere(req, section, role)
  }

// Creating can't be limited by a query, so a role limited to services may still create results
// (the service check in `enforceServiceScope` keeps them honest) but not new service pages.
export const allowCreate =
  (section: Section): Access =>
  async ({ req }) => {
    if (!req.user) return false
    if (isOwner(req.user)) return true
    const role = await getRole(req)
    if (RANK[levelOf(role, section)] < RANK.edit) return false
    return !(section === 'services' && scopeOf(role).length > 0)
  }

// Content that is public on the website: visitors and staff can always read it; staff with
// access only see their own services in the admin lists.
export const publicRead =
  (section: Section): Access =>
  async (args) => {
    if (!args.req.user || isOwner(args.req.user)) return true
    const result = await allow(section, 'read')(args)
    return result === false ? true : result
  }

export const ownerOnly: Access = ({ req }) => isOwner(req.user)

// Staff limited to some services can only tag results with those services. Tags that were already
// on the result (e.g. a project that was website + SEO) are kept as they are.
export const enforceServiceScope: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  if (!req.user || isOwner(req.user) || !data?.services) return data
  const scope = scopeOf(await getRole(req))
  if (scope.length === 0) return data
  const before = new Set(ids(originalDoc?.services))
  const outside = ids(data.services).filter((id) => !before.has(id) && !scope.includes(id))
  if (outside.length) {
    throw new APIError('You can only tag results with the services your role covers.', 403, undefined, true)
  }
  return data
}

// Hides a section from the admin menu for staff whose role has no access to it.
export const hiddenUnless =
  (section: Section) =>
  ({ user }: { user: unknown }): boolean => {
    if (!user || isOwner(user)) return false
    const role = (user as UserLike)?.role
    if (role && typeof role !== 'object') return false
    return levelOf(typeof role === 'object' ? role : null, section) === 'none'
  }

export const hiddenUnlessOwner = ({ user }: { user: unknown }): boolean => !isOwner(user)
