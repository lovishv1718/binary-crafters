import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import Script from 'next/script'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Icon } from '@/components/Icon'
import { RevealObserver } from '@/components/RevealObserver'
import { getServices, getSettings, telHref } from '@/lib/payload'

import './styles.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Binary Crafters | Web Design, SEO & Ads Agency in Vancouver',
    template: '%s | Binary Crafters',
  },
  description:
    'Binary Crafters is a Vancouver digital agency building websites, SEO, Google and Meta ad campaigns, branding and automation for growing businesses.',
  icons: { icon: '/brand/icon.png', apple: '/brand/icon.png' },
  openGraph: { siteName: 'Binary Crafters', type: 'website', locale: 'en_CA' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()])
  const tel = telHref(settings.phone)
  const gaId = /^G-[A-Z0-9]{4,}$/.test(settings.gaMeasurementId?.trim() ?? '') ? settings.gaMeasurementId!.trim() : null

  return (
    <html lang="en" className={`no-js ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }} />
      </head>
      <body>
        <div className="topbar">
          <div className="container topbar__inner">
            <div className="topbar__group">
              <span className="topbar__item">
                <span className="topbar__dot" /> Free strategy call for new clients
              </span>
              <span className="topbar__item topbar__hide-sm">
                <Icon name="pin" size={15} /> {settings.location}
              </span>
            </div>
            <div className="topbar__group">
              <a className="topbar__item topbar__hide-sm" href={`mailto:${settings.email}`}>
                <Icon name="mail" size={15} /> {settings.email}
              </a>
              <a className="topbar__item" href={tel}>
                <Icon name="phone" size={15} /> {settings.phone}
              </a>
            </div>
          </div>
        </div>

        <Header
          phone={settings.phone ?? ''}
          tel={tel}
          services={services.map((s) => ({
            slug: s.slug ?? '',
            title: s.title,
            tagline: s.tagline,
            icon: s.icon ?? 'web',
          }))}
        />

        <main>{children}</main>

        <Footer settings={settings} services={services} />

        <a href={tel} className="call-fab" aria-label={`Call ${settings.phone}`}>
          <Icon name="phone" size={24} />
        </a>
        <RevealObserver />

        {/* Google Analytics, only when a Measurement ID is set in Site settings → Analytics */}
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  )
}
