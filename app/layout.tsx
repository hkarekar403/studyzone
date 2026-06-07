import type { Metadata } from "next"
import { Baloo_2, Nunito } from "next/font/google"
import Script from "next/script"
import "./globals.css"

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
  title: "Free Class 4 Maths Practice | Addition, Fractions, Geometry & More",
  description: "Interactive maths quiz for Class 4 students. Practice addition, subtraction, multiplication, division, fractions, geometry, time, money and more. Free, instant, no login required.",
  keywords: "class 4 maths, grade 4 mathematics, maths practice, maths quiz, primary school maths, fractions, geometry, multiplication, division, free maths practice",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  )
}
