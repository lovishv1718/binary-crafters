import type { CollectionConfig } from 'payload'

import { allow, allowCreate, enforceServiceScope, hiddenUnless, publicRead } from '../access/roles'
import { slugField } from '../fields/slug'

export const Results: CollectionConfig = {
  slug: 'results',
  labels: { singular: 'Result', plural: 'Results' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    hidden: hiddenUnless('results'),
    defaultColumns: ['title', 'client', 'services', 'featured', 'date'],
    description:
      'Client wins with screenshots and numbers. Tag each result with its services and it appears on those service pages automatically.',
  },
  defaultSort: '-date',
  access: {
    read: publicRead('results'),
    create: allowCreate('results'),
    update: allow('results', 'edit'),
    delete: allow('results', 'full'),
  },
  hooks: {
    beforeChange: [enforceServiceScope],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "3.4x more booked calls in 90 days"' },
    },
    slugField(),
    {
      type: 'row',
      fields: [
        { name: 'client', type: 'text', required: true },
        { name: 'industry', type: 'text' },
        { name: 'location', type: 'text' },
      ],
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Live site address, e.g. https://example.ca. Shown as a "Visit website" button.',
        placeholder: 'https://',
      },
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show on the home page.' },
    },
    {
      name: 'date',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' } },
    },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'metrics',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Metric', plural: 'Key numbers' },
      admin: { description: 'Optional. Only add real, verifiable numbers.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { placeholder: '+212%' } },
            { name: 'label', type: 'text', required: true, admin: { placeholder: 'Organic traffic' } },
          ],
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Main screenshot or photo for this result.' },
    },
    {
      name: 'gallery',
      type: 'array',
      labels: { singular: 'Image', plural: 'Result images' },
      admin: { description: 'Add as many proof screenshots, before/after shots or photos as you like.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    { name: 'challenge', type: 'textarea' },
    { name: 'approach', type: 'textarea' },
    { name: 'outcome', type: 'textarea' },
    {
      name: 'quote',
      type: 'group',
      label: 'Client quote (optional)',
      fields: [
        { name: 'text', type: 'textarea' },
        { name: 'author', type: 'text' },
      ],
    },
  ],
}
