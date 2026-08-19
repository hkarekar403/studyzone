import type { Metadata, Viewport } from "next"
import { Baloo_2, Nunito } from "next/font/google"
import Script from "next/script"
import { Analytics } from '@vercel/analytics/next'
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
  title: "Free Class 4 Maths Practice - CBSE, ICSE & IGCSE",
  description: "Free interactive Class 4 maths practice: addition, subtraction, multiplication, division, fractions, geometry and more. No login needed. CBSE, ICSE & IGCSE.",
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
    title: "Free Class 4 Maths Practice - CBSE, ICSE & IGCSE",
    description: "Practice maths the fun way! 22 topics, 3 difficulty levels, instant feedback. Free for all Class 4 students.",
    type: "website",
    locale: "en_IN",
    siteName: "StudyZone",
    url: "https://studyzone.co.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Class 4 Maths Practice - CBSE, ICSE & IGCSE",
    description: "Practice maths the fun way! 22 topics, 3 difficulty levels, instant feedback.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'application-name': 'StudyZone',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
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
  "description": "Free interactive maths practice for Class 4 students. 22 topics including fractions, geometry, multiplication, division and more. Supports CBSE, ICSE and IGCSE curricula. Instant feedback, PDF reports and printable worksheets.",
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
    "22 maths topics",
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
    "@type": "Organization",
    "name": "StudyZone",
    "url": "https://studyzone.co.in"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://studyzone.co.in",
    "query-input": "required name=search_term_string"
  },
}

// Profiles that verifiably belong to StudyZone. `sameAs` is how search engines
// and language models disambiguate an entity from others with the same name —
// pointing it at our own homepage (as this previously did) tells them nothing.
// Add each URL only once it is live and publicly reachable.
const PROFILE_URLS: string[] = [
  // e.g. 'https://github.com/<owner>/<repo>' once the repository is public
]

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://studyzone.co.in/#organization",
  "name": "StudyZone",
  "alternateName": "StudyZone Maths",
  "url": "https://studyzone.co.in",
  "description": "A free mathematics practice platform for primary school students, built and maintained independently by a parent. Supports CBSE, ICSE and IGCSE Cambridge Primary.",
  "email": "hkarekar01cloud@gmail.com",
  "foundingDate": "2026",
  "areaServed": { "@type": "Country", "name": "India" },
  "knowsLanguage": "en-IN",
  "isAccessibleForFree": true,
  ...(PROFILE_URLS.length > 0 ? { sameAs: PROFILE_URLS } : {}),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${baloo2.variable} ${nunito.variable}`}>
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', background: '#eff6ff', minHeight: '100vh' }}>
            <h1>StudyZone — Class 4 Maths Practice</h1>
            <p>This website requires JavaScript to work.</p>
            <p>Please enable JavaScript in your browser settings and reload the page.</p>
            <p>If you are on a school device, please ask your teacher or IT administrator to enable JavaScript for studyzone.co.in</p>
          </div>
        </noscript>
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
        <Analytics />
      </body>
    </html>
  )
}
