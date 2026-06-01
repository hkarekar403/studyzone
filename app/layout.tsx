import type { Metadata } from "next"
import { Baloo_2, Nunito } from "next/font/google"
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
  title: "Class 4 Mathematics Practice",
  description: "Interactive math practice for Class 4 students",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} ${nunito.variable}`}>{children}</body>
    </html>
  )
}
