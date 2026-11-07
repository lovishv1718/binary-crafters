import type { CollectionConfig, Field } from 'payload'

import { hiddenUnlessOwner, isOwner, ownerOnly, type Section } from '../access/roles'

const levels = [
  { label: 'No access', value: 'none' },
  { label: 'View only', value: 'read' },
  { label: 'Add & edit', value: 'edit' },
  { label: 'Add, edit & delete', value: 'full' },
]

const level = (name: Section, label: string, description: string, options = levels): Field => ({
  name,
  label,
  type: 'select',
  required: true,
  defaultValue: 'none',
  options,
  admin: { description, width: '50%' },
})

// Roles the owner creates for staff (e.g. "Website Designer") with what each one may do.
export const Roles: CollectionConfig = {
  slug: 'roles',
  labels: { singular: 'Role', plural: 'Roles' },
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'services', 'updatedAt'],
    description:
      'Make a role for each kind of team member, choose what it can do, then give it to their login under Users.',
    hidden: hiddenUnlessOwner,
  },
  access: {
    // Staff can read their own role (so the admin knows what to show them); only owners manage roles.
    read: ({ req }) => {
      if (!req.user) return false
      if (isOwner(req.user)) return true
      const role = (req.user as { role?: number | { id: number } | null }).role
      const id = role && typeof role === 'object' ? role.id : role
      return id ? { id: { equals: id } } : false
    },
    create: ownerOnly,
    update: ownerOnly,
    delete: ownerOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, admin: { placeholder: 'Website Designer' } },
    { name: 'description', type: 'textarea', admin: { description: 'Optional note on who this role is for.' } },
    {
      name: 'services',
      label: 'Limit to these services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description:
          'Optional. When set, this role only sees and edits Results, Service pages and Enquiries for these services. Leave empty for all services.',
      },
    },
    {
      name: 'permissions',
      label: 'What this role can do',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            level('results', 'Results (our work)', 'Client projects, screenshots and numbers.'),
            level(
              'services',
              'Service pages',
              'Text, photos, FAQs on each service page. Roles limited to services cannot add new ones.',
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            level('posts', 'Blog posts', 'Write, edit and publish articles.'),
            level('categories', 'Blog categories', 'The topics that filter the blog.'),
          ],
        },
        {
          type: 'row',
          fields: [
            level('testimonials', 'Testimonials', 'Client quotes on the home page.'),
            level(
              'media',
              'Media (images)',
              'Anyone who can edit content can already upload images. Set this to let them manage or delete all images.',
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            level('leads', 'Enquiries', 'Messages from the contact form.'),
            level('siteSettings', 'Site settings', 'Phone, email, social links, home page text and analytics.', levels.slice(0, 3)),
          ],
        },
      ],
    },
  ],
}
