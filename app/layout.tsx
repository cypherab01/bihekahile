import type { Metadata } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { APP_NAME_LATIN, APP_TAGLINE, DOMAIN } from '@/lib/brand'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const notoDeva = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-deva',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(`https://${DOMAIN}`),
  title: `${APP_NAME_LATIN} — ${APP_TAGLINE}`,
  description:
    "Find out how many proposals you'd get this Dashain. Spicy AI roasts from a stereotypical Nepali aunty.",
  openGraph: {
    title: `${APP_NAME_LATIN} — ${APP_TAGLINE}`,
    description: "Aunty's official approval calculator. Spicy AI roasts.",
    url: `https://${DOMAIN}`,
    siteName: APP_NAME_LATIN,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoDeva.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-07ZW1JB97H" />
    </html>
  )
}
