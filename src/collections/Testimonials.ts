import type { CollectionConfig } from 'payload'

import { allow, allowCreate, hiddenUnless } from '../access/roles'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    hidden: hiddenUnless('testimonials'),
    defaultColumns: ['name', 'company', 'order'],
  },
  defaultSort: 'order',
  access: {
    read: () => true,
    create: allowCreate('testimonials'),
    update: allow('testimonials', 'edit'),
    delete: allow('testimonials', 'full'),
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'company', type: 'text' },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar' },
    },
  ],
}
