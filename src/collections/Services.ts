import type { CollectionConfig } from 'payload'

import { allow, allowCreate, hiddenUnless, publicRead } from '../access/roles'
import { slugField } from '../fields/slug'

export const SERVICE_ICONS = [
  { label: 'Website', value: 'web' },
  { label: 'SEO', value: 'seo' },
  { label: 'Meta ads', value: 'meta' },
  { label: 'Google ads', value: 'google' },
  { label: 'Social media', value: 'social' },
  { label: 'Graphic design', value: 'design' },
  { label: 'Branding', value: 'brand' },
  { label: 'CRM & automation', value: 'crm' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'AI chatbot', value: 'chatbot' },
]

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    hidden: hiddenUnless('services'),
    defaultColumns: ['title', 'order', 'updatedAt'],
  },
  defaultSort: 'order',
  access: {
    read: publicRead('services'),
    create: allowCreate('services'),
    update: allow('services', 'edit'),
    delete: allow('services', 'full'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
    {
      name: 'icon',
      type: 'select',
      options: SERVICE_ICONS,
      defaultValue: 'web',
      admin: { position: 'sidebar' },
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
      admin: { description: 'One line shown on service cards.' },
    },
    { name: 'headline', type: 'text', admin: { description: 'Big heading on the service page.' } },
    { name: 'intro', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'deliverables',
      type: 'array',
      labels: { singular: 'Deliverable', plural: 'Deliverables' },
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    {
      name: 'process',
      type: 'array',
      labels: { singular: 'Step', plural: 'Process steps' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'faqs',
      type: 'array',
      labels: { singular: 'Question', plural: 'FAQs' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}
