import Link from 'next/link'
import React from 'react'

import type { Service, SiteSetting } from '@/payload-types'
import { telHref } from '@/lib/payload'

import { Icon } from './Icon'

export function Footer({ settings, services }: { settings: SiteSetting; services: Service[] }) {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mark.png" alt="" width={52} height={30} />
              <span>Binary Crafters</span>
            </Link>
            <p className="footer__about">
              A Vancouver digital agency. Websites, SEO, ads and automation for businesses that want more
              customers.
            </p>
            <div className="socials">
              {settings.facebook ? (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Icon name="facebook" size={18} />
                </a>
              ) : null}
              {settings.instagram ? (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Icon name="instagram" size={18} />
                </a>
              ) : null}
              {settings.twitter ? (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <Icon name="x" size={16} />
                </a>
              ) : (
                <span title="X (Twitter): coming soon" aria-label="X (Twitter) coming soon">
                  <Icon name="x" size={16} />
                </span>
              )}
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <ul>
              {services.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>More services</h4>
            <ul>
              {services.slice(5).map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Get in touch</h4>
            <ul className="footer__contact">
              <li>
                <Icon name="phone" size={17} />
                <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
              <li>
                <Icon name="mail" size={17} />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li>
                <Icon name="pin" size={17} />
                <span>{settings.location}</span>
              </li>
              {settings.hours ? (
                <li>
                  <Icon name="clock" size={17} />
                  <span>{settings.hours}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} Binary Crafters. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <Link href="/results">Results</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
