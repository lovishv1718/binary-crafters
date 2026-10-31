'use client'

import React, { useActionState, useEffect, useRef } from 'react'

import { Icon } from '@/components/Icon'

import { submitEnquiry, type ContactState } from './actions'

const budgets = ['Under $2k', '$2k – $5k', '$5k – $10k', '$10k+']

export function ContactForm({ services, preset }: { services: string[]; preset?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitEnquiry, { ok: false })
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.ok) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [state.ok])

  if (state.ok) {
    return (
      <div className="form-card form-success" ref={successRef}>
        <span className="service-hero__icon">
          <Icon name="check" size={30} strokeWidth={2} />
        </span>
        <h3 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)' }}>Thanks, we have got it.</h3>
        <p className="lead">
          Someone from the team will reply within one business day, usually much sooner. If it is urgent,
          give us a call.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="form-card">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Your name *</label>
          <input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="company">Business name</label>
          <input id="company" name="company" autoComplete="organization" />
        </div>
        <div className="field span-2">
          <label htmlFor="service">What do you need help with?</label>
          <select id="service" name="service" defaultValue={preset ?? ''}>
            <option value="">Not sure yet</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="field span-2" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Monthly budget</legend>
          <div className="chips">
            {budgets.map((b, i) => (
              <React.Fragment key={b}>
                <input type="radio" id={`budget-${i}`} name="budget" value={b} />
                <label htmlFor={`budget-${i}`}>{b}</label>
              </React.Fragment>
            ))}
          </div>
        </fieldset>
        <div className="field span-2">
          <label htmlFor="message">Tell us a little about the project</label>
          <textarea id="message" name="message" placeholder="Goals, timeline, links to your current site…" />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="span-2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? 'Sending…' : 'Send enquiry'} <Icon name="arrow" size={18} />
          </button>
          <span className="form-note">
            We only use your details to reply to you. See our{' '}
            <a href="/privacy" style={{ textDecoration: 'underline' }}>
              privacy policy
            </a>
            .
          </span>
        </div>
        {state.error ? (
          <p className="form-error span-2" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
