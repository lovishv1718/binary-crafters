import { APIError, type CollectionConfig, type FieldAccess, type Validate } from 'payload'

import { hiddenUnlessOwner, isOwner, ownerOnly } from '../access/roles'

const ownerField: FieldAccess = ({ req }) => isOwner(req.user)

const countOwners = async (req: Parameters<FieldAccess>[0]['req']) =>
  (await req.payload.count({ collection: 'users', where: { owner: { equals: true } }, overrideAccess: true, req }))
    .totalDocs

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'email', 'owner', 'role'],
    description: 'Team logins. Owners can do everything; everyone else only gets what their role allows.',
    hidden: hiddenUnlessOwner,
  },
  // Loads the role with the user, so the admin panel knows what to show.
  auth: { depth: 1 },
  access: {
    // Owners manage everyone; staff can only see and update their own account (name, email, password).
    read: ({ req }) => (isOwner(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: ownerOnly,
    update: ({ req }) => (isOwner(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    delete: ownerOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // The very first account is always the owner.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) data.owner = true
        }
        // Never leave the site without an owner.
        if (operation === 'update' && originalDoc?.owner && data.owner === false && (await countOwners(req)) <= 1) {
          throw new APIError('There must always be at least one owner.', 400, undefined, true)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({ collection: 'users', id, depth: 0, overrideAccess: true, req })
        if (user?.owner && (await countOwners(req)) <= 1) {
          throw new APIError('You cannot delete the last owner.', 400, undefined, true)
        }
      },
    ],
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Shown as the author on blog posts.' },
    },
    {
      name: 'owner',
      type: 'checkbox',
      defaultValue: false,
      access: { create: ownerField, update: ownerField },
      admin: {
        position: 'sidebar',
        description: 'Owners can do everything, including adding team members and roles.',
      },
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      access: { create: ownerField, update: ownerField },
      admin: {
        position: 'sidebar',
        description: 'What this person can see and edit. Create roles under Settings → Roles.',
        condition: (data) => !data?.owner,
      },
      // Scripts and the very first sign-up run without a signed-in user; the first account becomes owner.
      validate: ((value, { req, siblingData }) =>
        !req.user || (siblingData as { owner?: boolean })?.owner || value
          ? true
          : 'Choose a role, or tick Owner.') as Validate,
    },
  ],
}
