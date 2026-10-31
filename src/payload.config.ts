import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Results } from './collections/Results'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Testimonials } from './collections/Testimonials'
import { Leads } from './collections/Leads'
import { SiteSettings } from './globals/SiteSettings'

import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Local development uses a SQLite file; hosting uses Neon Postgres when a postgres:// URL is set.
// The Neon serverless driver talks over HTTPS/WebSockets (port 443), because GoDaddy blocks port 5432.
const databaseUrl = process.env.DATABASE_URL || ''
const usePostgres = /^postgres(ql)?:\/\//.test(databaseUrl)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Binary Crafters',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/icon.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/AdminLogo',
        Icon: '/components/admin/AdminIcon',
      },
    },
  },
  collections: [Posts, Categories, Results, Services, Testimonials, Media, Leads, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // Outgoing email (enquiry alerts, password resets). Configure SMTP_* in the environment;
  // without it Payload just logs emails to the console.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || 'info@binarycrafters.com',
        defaultFromName: 'Binary Crafters Website',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: usePostgres
    ? vercelPostgresAdapter({
        pool: { connectionString: databaseUrl },
        migrationDir: path.resolve(dirname, 'migrations'),
        // Schema changes ship as migrations and run automatically on deploy.
        push: false,
        prodMigrations: migrations,
      })
    : sqliteAdapter({
        client: {
          url: databaseUrl,
        },
      }),
  sharp,
  plugins: [
    // Uploaded images go to Vercel Blob when a token is configured; otherwise the local media/ folder.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
