// Sets each service's cover to a real photo (Unsplash licence) and deletes the old demo mockup.
//   PHOTOS_DIR=path/with/web.jpg,seo.jpg,... npm run seed:service-photos
// File names match the service icon keys: web, seo, google, meta, social, design, brand, crm, ecommerce, chatbot.
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

const PHOTOS_DIR = process.env.PHOTOS_DIR
if (!PHOTOS_DIR) throw new Error('Set PHOTOS_DIR to the folder of service photos')

const payload = await getPayload({ config })
const { docs: services } = await payload.find({ collection: 'services', limit: 50, depth: 0 })

for (const service of services) {
  const file = path.join(PHOTOS_DIR, `${service.icon}.jpg`)
  if (!fs.existsSync(file)) {
    payload.logger.warn(`No photo for ${service.title} (${service.icon}.jpg), skipped`)
    continue
  }
  const data = fs.readFileSync(file)
  const media = await payload.create({
    collection: 'media',
    data: { alt: `${service.title} by Binary Crafters` },
    file: { data, mimetype: 'image/jpeg', name: `service-${service.slug}.jpg`, size: data.length },
  })
  const old = service.coverImage
  await payload.update({ collection: 'services', id: service.id, data: { coverImage: media.id } })
  if (typeof old === 'number') await payload.delete({ collection: 'media', id: old }).catch(() => {})
  payload.logger.info(`Updated ${service.title}`)
}

process.exit(0)
