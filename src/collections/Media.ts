import type { CollectionConfig } from 'payload'

import { allow, allowCreate, hiddenUnless } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    hidden: hiddenUnless('media'),
    description: 'Every image on the site: result screenshots, blog covers, team photos.',
  },
  access: {
    read: () => true,
    create: allowCreate('media'),
    update: allow('media', 'edit'),
    delete: allow('media', 'full'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Short description of the image, for accessibility and Google.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    // Shrinks big uploads (e.g. 8 MB phone photos) before saving: capped at 2400px wide and
    // re-encoded as WebP at high quality, typically 85–95% smaller with no visible difference.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumb', width: 480, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'wide', width: 1800, formatOptions: { format: 'webp', options: { quality: 82 } } },
    ],
  },
}
