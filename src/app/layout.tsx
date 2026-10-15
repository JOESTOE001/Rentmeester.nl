import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { LandeigenaarPopup } from '@/components/landeigenaar-popup'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: 'Bakker Rentmeesters',
  description: 'Specialist op het gebied van landelijk gelegen vastgoed. Meer dan 30 jaar ervaring als rentmeester in Nederland.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: '/logo.svg',
  },
}

export const viewport = {
  themeColor: '#6B4226',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-EE6F6XKEGJ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-EE6F6XKEGJ');`}
      </Script>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <LandeigenaarPopup />
        <Analytics />
      </body>
    </html>
  )
}
