import type { CollectionConfig } from 'payload'

import { allow, allowCreate, hiddenUnless } from '../access/roles'
import { slugField } from '../fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Blog category', plural: 'Blog categories' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    hidden: hiddenUnless('categories'),
  },
  access: {
    read: () => true,
    create: allowCreate('categories'),
    update: allow('categories', 'edit'),
    delete: allow('categories', 'full'),
  },
  fields: [{ name: 'title', type: 'text', required: true }, slugField()],
}
