import type { Metadata } from 'next'
import React from 'react'

import { PageHero } from '@/components/PageHero'
import { getSettings, telHref } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Binary Crafters collects, uses and protects personal information.',
}

// Plain-language policy written for Canada (PIPEDA). Have it reviewed before relying on it legally.
const LAST_UPDATED = 'October 31, 2026'

export default async function PrivacyPage() {
  const settings = await getSettings()

  return (
    <>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Privacy Policy' }]}
        eyebrow="Legal"
        title="Privacy Policy"
        lead={`Last updated ${LAST_UPDATED}. This policy explains what personal information Binary Crafters collects through this website, why, and how we protect it.`}
      />
      <section className="section">
        <div className="container">
          <div className="prose">
            <h2>Who we are</h2>
            <p>
              Binary Crafters is a digital agency based in {settings.location}. In this policy, &quot;we&quot;,
              &quot;us&quot; and &quot;our&quot; mean Binary Crafters. We follow Canada&apos;s Personal Information
              Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy laws.
            </p>

            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Information you give us:</strong> when you use our contact or quote form, we collect your
                name, email address and, if you choose to provide them, your phone number, business name, the
                service you are interested in, your budget range and your message.
              </li>
              <li>
                <strong>Information collected automatically:</strong> like most websites, our hosting provider
                records basic technical data such as your IP address, browser type and the pages you visit. If we
                use website analytics (such as Google Analytics), it collects anonymous usage information through
                cookies to help us understand how the site is used.
              </li>
            </ul>

            <h2>How we use it</h2>
            <ul>
              <li>To reply to your enquiry and prepare a quote or proposal.</li>
              <li>To provide and improve our services and this website.</li>
              <li>To keep records of our communication with you.</li>
            </ul>
            <p>
              We do not sell, rent or trade your personal information. We will not add you to a marketing list
              without your consent, and you can unsubscribe from any email we send at any time.
            </p>

            <h2>Who we share it with</h2>
            <p>
              We only share information with trusted service providers that help us run this website and our
              business, such as our website host, database and email providers, and analytics tools. They may
              store data on servers outside Canada, including in the United States, and must protect it in line
              with this policy. We may also disclose information if required by law.
            </p>

            <h2>Cookies</h2>
            <p>
              We use only the cookies needed for the website to work and, where enabled, analytics cookies. You
              can block or delete cookies in your browser settings; the site will still work.
            </p>

            <h2>How long we keep it</h2>
            <p>
              We keep enquiry information for as long as needed to respond and to maintain business records, and
              then delete it securely.
            </p>

            <h2>How we protect it</h2>
            <p>
              We use secure (HTTPS) connections, password-protected systems and access limited to the people who
              need it. No method of transmission over the internet is completely secure, but we take reasonable
              steps to protect your information.
            </p>

            <h2>Your rights</h2>
            <p>
              You can ask to see the personal information we hold about you, ask us to correct it, or withdraw
              your consent and ask us to delete it, subject to legal requirements. To make a request or ask a
              question about this policy, contact us:
            </p>
            <ul>
              <li>
                Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li>
                Phone: <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
            </ul>
            <p>
              If you are not satisfied with our response, you can contact the Office of the Privacy Commissioner
              of Canada at <a href="https://www.priv.gc.ca">priv.gc.ca</a>.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The latest version will always be on this page with
              the date it was last updated.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
