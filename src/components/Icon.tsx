import React from 'react'

// Hand-drawn line icon set (24px grid, 1.6 stroke) so every icon shares one visual voice.
const paths: Record<string, React.ReactNode> = {
  web: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 8.5h18M6.5 6.3h.01M9 6.3h.01" />
      <path d="M7 12.5h6M7 15.5h10" />
    </>
  ),
  seo: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
      <path d="m7.5 12 2-2.2 1.8 1.6 2.4-3" />
    </>
  ),
  meta: (
    <>
      <path d="M3.5 15.2c0-4.6 2.1-8.2 4.6-8.2 3.4 0 5.6 10 8.6 10 1.9 0 3.8-2.4 3.8-5.4 0-2.8-1.5-4.6-3.2-4.6-3 0-5.2 7.8-8.6 7.8-2.2.1-5.2-.8-5.2.4Z" />
    </>
  ),
  google: (
    <>
      <path d="M4 18 10 6" />
      <path d="m14 6 6 12" />
      <circle cx="17" cy="16" r="2.4" />
      <path d="M7 18h.01" />
    </>
  ),
  social: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3.5" />
      <circle cx="12" cy="11" r="3.4" />
      <path d="M16.4 6.6h.01M8 17.5h8" />
    </>
  ),
  design: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.6-1.2-2.8 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z" />
      <circle cx="7.5" cy="11" r="1.1" />
      <circle cx="10.5" cy="7" r="1.1" />
      <circle cx="15" cy="7.5" r="1.1" />
    </>
  ),
  brand: (
    <>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" />
    </>
  ),
  crm: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="9.5" y="4" width="5" height="11" rx="1.5" />
      <rect x="16" y="4" width="5" height="7" rx="1.5" />
    </>
  ),
  ecommerce: (
    <>
      <path d="M4 5h2l1.8 10.2a1.5 1.5 0 0 0 1.5 1.3h7.9a1.5 1.5 0 0 0 1.4-1.1L20 9H7" />
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="17" cy="20" r="1.2" />
    </>
  ),
  chatbot: (
    <>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  phone: (
    <path d="M6.6 3.5h2.6l1.4 4.1-2 1.4a12 12 0 0 0 6.4 6.4l1.4-2 4.1 1.4v2.6a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  trend: <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />,
  quote: (
    <path
      d="M10 7H6.5A2.5 2.5 0 0 0 4 9.5V13h5v5H4m16-11h-3.5A2.5 2.5 0 0 0 14 9.5V13h5v5h-5"
      strokeLinejoin="round"
    />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  handshake: (
    <path d="m11 7-2.5-2L3 9l5 6.5 1.5-1M13 7l2.5-2L21 9l-5 6.5-2.5 2a1.5 1.5 0 0 1-2.1-2.1l-1.8 1.4a1.5 1.5 0 0 1-2-2.2L11 10l2-2" />
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />,
  star: (
    <path
      fill="currentColor"
      d="M12 2.8l2.75 5.9 6.45.75-4.77 4.42 1.27 6.38L12 17.05 6.3 20.25l1.27-6.38L2.8 9.45l6.45-.75L12 2.8Z"
    />
  ),
  facebook: <path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5Z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>
  ),
  x: <path d="m4 4 16 16M20 4 4 20" />,
}

export type IconName = keyof typeof paths

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.6,
  className,
}: {
  name: string
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name] ?? paths.web}
    </svg>
  )
}
