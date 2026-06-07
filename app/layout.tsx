import type { Metadata, Viewport } from "next"
import { Baloo_2, Nunito } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import PWAInstall from "./components/PWAInstall"

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo2",
  weight: ["400", "500", "600", "700", "800"],
})

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://studyzone.co.in'),
  title: "Free Class 4 Maths Practice | Addition, Fractions, Geometry & More",
  description: "Interactive maths quiz for Class 4 students. Practice addition, subtraction, multiplication, division, fractions, geometry, time, money and more. Free, instant, no login required.",
  keywords: "class 4 maths, grade 4 mathematics, maths practice, maths quiz, primary school maths, fractions, geometry, multiplication, division, free maths practice",
  category: 'education',
  alternates: {
    canonical: 'https://studyzone.co.in',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StudyZone',
  },
  openGraph: {
    title: "Free Class 4 Maths Practice | Interactive Quiz",
    description: "Practice maths the fun way! 19 topics, 3 difficulty levels, instant feedback. Free for all Class 4 students.",
    type: "website",
    locale: "en_IN",
    siteName: "Class 4 Maths Practice",
  },
  twitter: {
    card: "summary",
    title: "Free Class 4 Maths Practice | Interactive Quiz",
    description: "Practice maths the fun way! 19 topics, 3 difficulty levels, instant feedback.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "StudyZone - Class 4 Maths Practice",
  "alternateName": "StudyZone",
  "url": "https://studyzone.co.in",
  "description": "Free interactive maths practice for Class 4 students. 19 topics including fractions, geometry, multiplication, division and more. Supports CBSE, ICSE and IGCSE curricula. Instant feedback, PDF reports and printable worksheets.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Any",
  "isAccessibleForFree": true,
  "inLanguage": "en-IN",
  "educationalLevel": "Grade 4",
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "student",
    "audienceType": "Children aged 9-10"
  },
  "about": {
    "@type": "Thing",
    "name": "Class 4 Mathematics",
    "description": "CBSE, ICSE and IGCSE Class 4 Mathematics curriculum"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "featureList": [
    "19 maths topics",
    "CBSE, ICSE and IGCSE curricula",
    "3 difficulty levels",
    "Instant feedback",
    "PDF session report",
    "Printable worksheets with answer key",
    "No login required",
    "Works on mobile",
    "Dark mode",
    "Installable as PWA"
  ],
  "provider": {
    "@type": "Person",
    "name": "Harshad Karekar"
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${baloo2.variable} ${nunito.variable}`}>
        {/* Inline script runs synchronously before first paint to prevent theme flash */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          try {
            if (localStorage.getItem('theme') === 'dark') {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          } catch(e) {}
        `}</Script>
        {children}
        <PWAInstall />
      </body>
    </html>
  )
}
