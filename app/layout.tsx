import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'West Forsyth Lost & Found',
  description: 'Lost and Found portal for West Forsyth High School students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
