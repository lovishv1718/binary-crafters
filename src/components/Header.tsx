'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Icon } from './Icon'

type NavService = { slug: string; title: string; tagline: string; icon: string }

const links = [
  { href: '/results', label: 'Results' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header({ services, phone, tel }: { services: NavService[]; phone: string; tel: string }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // After picking a page from the Services menu, keep it shut until the "Services" link is
  // pointed at (or focused) again; otherwise hover/focus would hold it open over the new page.
  const [megaClosed, setMegaClosed] = useState(false)

  const closeMega = () => {
    setMegaClosed(true)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'))

  return (
    <>
      <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container header__inner">
          <Link href="/" className="brand" aria-label="Binary Crafters home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-dark.png" alt="" width={52} height={30} />
            <span>Binary Crafters</span>
          </Link>

          <nav className="nav" aria-label="Main">
            <Link href="/" className={`nav__link${isActive('/') ? ' is-active' : ''}`}>
              Home
            </Link>
            <div className={`nav__item${megaClosed ? ' is-closed' : ''}`}>
              <Link
                href="/services"
                className={`nav__link${isActive('/services') ? ' is-active' : ''}`}
                onClick={closeMega}
                onMouseEnter={() => setMegaClosed(false)}
                onFocus={() => setMegaClosed(false)}
              >
                Services <Icon name="chevron" size={16} />
              </Link>
              <div className="mega">
                {services.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="mega__link" onClick={closeMega}>
                    <span className="mega__icon">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <span>
                      <span className="mega__title">{s.title}</span>
                      <span className="mega__desc">{s.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`nav__link${isActive(l.href) ? ' is-active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <a href={tel} className="phone-block">
              <span className="phone-block__icon">
                <Icon name="phone" size={18} />
              </span>
              <span>
                <small>Call us today</small>
                <strong>{phone}</strong>
              </span>
            </a>
            <Link href="/contact" className="btn btn--primary btn--sm header__cta">
              Free Quote <Icon name="arrow" size={17} />
            </Link>
            <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <div className="drawer__top">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-dark.png" alt="" width={52} height={30} />
            <span>Binary Crafters</span>
          </Link>
          <button className="burger" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="drawer__nav" aria-label="Mobile">
          <Link href="/">
            Home <Icon name="arrow" />
          </Link>
          <Link href="/services">
            Services <Icon name="arrow" />
          </Link>
          <div className="drawer__services">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`}>
                {s.title}
              </Link>
            ))}
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label} <Icon name="arrow" />
            </Link>
          ))}
        </nav>
        <div className="drawer__foot">
          <Link href="/contact" className="btn btn--primary">
            Get a Free Quote <Icon name="arrow" size={18} />
          </Link>
          <a href={tel} className="btn btn--ghost">
            <Icon name="phone" size={18} /> {phone}
          </a>
        </div>
      </div>
    </>
  )
}
