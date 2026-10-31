import React from 'react'

export default function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Ink mark for the light admin theme, white mark for the dark theme (toggled in custom.scss). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bc-mark bc-mark--light" src="/brand/mark-dark.png" alt="" width={56} height={33} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bc-mark bc-mark--dark" src="/brand/mark.png" alt="" width={56} height={33} />
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Binary Crafters</span>
    </div>
  )
}
