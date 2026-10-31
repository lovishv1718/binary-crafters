import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            { name: 'phone', type: 'text', defaultValue: '604-603-2201' },
            { name: 'email', type: 'email', defaultValue: 'info@binarycrafters.com' },
            { name: 'location', type: 'text', defaultValue: 'Vancouver, Canada' },
            { name: 'hours', type: 'text', defaultValue: 'Mon–Fri, 9am–6pm PT' },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'gaMeasurementId',
              label: 'Google Analytics Measurement ID',
              type: 'text',
              admin: {
                placeholder: 'G-XXXXXXXXXX',
                description:
                  'From Google Analytics → Admin → Data streams → your website. Leave empty to turn analytics off.',
              },
              validate: (value: string | null | undefined) =>
                !value || /^G-[A-Z0-9]{4,}$/.test(value.trim()) ? true : 'Should look like G-XXXXXXXXXX',
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'instagram', type: 'text' },
            {
              name: 'twitter',
              type: 'text',
              admin: { description: 'Leave empty to show "coming soon".' },
            },
          ],
        },
        {
          label: 'Home page',
          fields: [
            { name: 'heroEyebrow', type: 'text', defaultValue: 'Digital studio · Vancouver' },
            {
              name: 'heroTitle',
              type: 'text',
              defaultValue: 'We build the websites and campaigns that bring in customers.',
            },
            { name: 'heroSubtitle', type: 'textarea' },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Background photo behind the home page headline. Leave empty to use the default photo.' },
            },
            {
              name: 'aboutImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Photo in the "Who we are" section and About page. Leave empty for the default.' },
            },
            {
              name: 'stats',
              type: 'array',
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'text', required: true },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
