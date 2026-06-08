import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | StudyZone",
  description: "Privacy policy for StudyZone — free Class 4 maths practice platform.",
  robots: { index: true, follow: true },
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-full flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚀</span>
            <span className="font-heading text-xl font-bold text-blue-700">StudyZone</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto mt-8 mb-12 bg-white/60 rounded-2xl p-8">
          <h1 className="font-heading text-4xl font-bold text-blue-700 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: June 2026</p>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              StudyZone (studyzone.co.in) is a free educational mathematics practice platform for Class 4 students.
              We are committed to protecting your privacy. This policy explains what information we collect and how we use it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We collect minimal information to operate this service:
            </p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-2">
              <li>
                <strong>Visitor count:</strong> We track the total number of visitors using an anonymous counter.
                No personal information is collected.
              </li>
              <li>
                <strong>Session data:</strong> Quiz sessions are stored temporarily in your browser&apos;s session
                storage and are cleared when you close the browser tab. We do not store session data on our servers.
              </li>
              <li>
                <strong>No cookies:</strong> We do not use tracking cookies or advertising cookies.
              </li>
              <li>
                <strong>No registration:</strong> We do not require you to create an account or provide any
                personal information.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">3. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              StudyZone is designed for use by children aged 9–10 years under parental or teacher supervision.
              We do not knowingly collect any personal information from children. We comply with the Children&apos;s
              Online Privacy Protection Act (COPPA) and similar regulations. If you believe we have inadvertently
              collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">4. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-2">
              <li><strong>Vercel:</strong> Our hosting provider. Subject to Vercel&apos;s privacy policy.</li>
              <li><strong>Upstash:</strong> Used for anonymous visitor counting. No personal data is stored.</li>
              <li><strong>Google Fonts:</strong> Used to load fonts. Subject to Google&apos;s privacy policy.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use only essential browser storage:
            </p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-2">
              <li>
                <strong>localStorage:</strong> To remember your sound and dark mode preferences, and PWA install
                banner dismissal.
              </li>
              <li>
                <strong>sessionStorage:</strong> To track your current quiz session and prevent duplicate visitor
                counts.
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              No advertising or tracking cookies are used.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We take reasonable measures to protect the limited data we collect. Since we do not collect personal
              information, the risk to users is minimal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">7. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an
              updated date.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">8. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:{" "}
              <a href="https://studyzone.co.in" className="text-blue-600 hover:underline">
                studyzone.co.in
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
