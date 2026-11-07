// Adds the starting team roles (Website Designer, SEO Specialist, …) and, if no owner exists yet,
// makes every existing login an owner so nobody is locked out. Safe to re-run.
//   npm run seed:roles
import config from '@payload-config'
import { getPayload } from 'payload'

import { createPresetRoles } from '../access/presets'

const payload = await getPayload({ config })

const owners = await payload.count({ collection: 'users', where: { owner: { equals: true } } })
if (owners.totalDocs === 0) {
  const { docs } = await payload.update({ collection: 'users', where: { id: { exists: true } }, data: { owner: true } })
  payload.logger.info(`No owner yet: made ${docs.length} existing login(s) owner.`)
}

const created = await createPresetRoles(payload)
payload.logger.info(`Added ${created} preset role(s).`)
process.exit(0)
