'use server'

import { getClient } from '@/lib/payload'

export type ContactState = { ok: boolean; error?: string }

const clean = (v: FormDataEntryValue | null, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function submitEnquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (clean(formData.get('website'))) return { ok: true }

  const name = clean(formData.get('name'), 120)
  const email = clean(formData.get('email'), 200)
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please add your name and a valid email address.' }
  }

  try {
    const payload = await getClient()
    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name,
        email,
        phone: clean(formData.get('phone'), 40),
        company: clean(formData.get('company'), 160),
        service: clean(formData.get('service'), 120),
        budget: clean(formData.get('budget'), 60),
        message: clean(formData.get('message'), 5000),
      },
    })
    return { ok: true }
  } catch (err) {
    console.error('Failed to save enquiry', err)
    return { ok: false, error: 'Something went wrong. Please call or email us instead.' }
  }
}
