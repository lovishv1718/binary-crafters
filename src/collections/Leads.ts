import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { allow, hiddenUnless } from '../access/roles'

const escape = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// Emails the business whenever a new enquiry arrives. Never blocks saving the enquiry.
const notifyNewLead: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  try {
    const settings = await req.payload.findGlobal({ slug: 'site-settings', req })
    const to = process.env.LEADS_NOTIFY_TO || settings.email
    if (!to) return doc
    const rows: [string, unknown][] = [
      ['Name', doc.name],
      ['Email', doc.email],
      ['Phone', doc.phone],
      ['Business', doc.company],
      ['Service', doc.service],
      ['Budget', doc.budget],
    ]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
    await req.payload.sendEmail({
      to,
      replyTo: doc.email,
      subject: `New enquiry from ${doc.name}${doc.service ? ` · ${doc.service}` : ''}`,
      html: `
        <h2 style="font-family:Arial,sans-serif">New website enquiry</h2>
        <table style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">
          ${rows
            .filter(([, v]) => v)
            .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#5b6b80">${k}</td><td style="padding:6px 0"><b>${escape(v)}</b></td></tr>`)
            .join('')}
        </table>
        ${doc.message ? `<p style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-line;margin-top:16px">${escape(doc.message)}</p>` : ''}
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#5b6b80;margin-top:24px">
          Reply to this email to answer them directly.${siteUrl ? ` View all enquiries: ${siteUrl}/admin/collections/leads` : ''}
        </p>`,
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Could not send new enquiry email' })
  }
  return doc
}

// Enquiries from the contact form. Created by the server action, never publicly readable.
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'name',
    group: 'Inbox',
    hidden: hiddenUnless('leads'),
    defaultColumns: ['name', 'email', 'service', 'status', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    // Staff only see enquiries if their role allows it, and only for their services when limited.
    read: allow('leads', 'read'),
    create: () => false,
    update: allow('leads', 'edit'),
    delete: allow('leads', 'full'),
  },
  hooks: {
    afterChange: [notifyNewLead],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'company', type: 'text' },
        { name: 'service', type: 'text' },
        { name: 'budget', type: 'text' },
      ],
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Won', value: 'won' },
        { label: 'Not a fit', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
