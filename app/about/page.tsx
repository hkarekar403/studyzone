import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | StudyZone",
  description: "About StudyZone — a free Class 4 maths practice platform built by a parent, for children everywhere.",
  alternates: {
    canonical: 'https://studyzone.co.in/about',
  },
  robots: { index: true, follow: true },
}

export default function About() {
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
          <h1 className="font-heading text-4xl font-bold text-blue-700 mb-8">About StudyZone</h1>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">1. What is StudyZone?</h2>
            <p className="text-gray-600 leading-relaxed">
              StudyZone is a free, interactive mathematics practice platform for Class 4 students. It supports CBSE,
              ICSE and IGCSE curricula with 19 topics, 3 difficulty levels, instant feedback, printable worksheets —
              and it costs nothing. No login. No subscription. No ads.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-2">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">2. Who made this?</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              StudyZone was built by a parent, for children everywhere. Not a company. Not a startup. Just someone who
              wanted their child to have a good free maths practice tool and couldn&apos;t find one they trusted.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The platform is built with care, maintained by one person, and will always be free.
            </p>
          </section>

          {/* Disclaimer box */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 my-6">
            <p className="font-heading text-lg font-bold text-amber-900 mb-3">⚠️ Important for Parents and Teachers</p>
            <p className="font-bold text-amber-800 mb-3">StudyZone is a fun practice tool, not an assessment platform.</p>
            <p className="text-amber-900 leading-relaxed mb-3 text-sm">
              Questions are randomly generated and are not a substitute for formal evaluation. A child&apos;s performance
              on StudyZone does not reflect their academic ability, intelligence, or school readiness.
            </p>
            <p className="text-amber-900 leading-relaxed text-sm">
              Real assessment of a child&apos;s capability should always be done by qualified teachers and schools using
              proper evaluation methods. StudyZone is meant to make maths practice enjoyable — nothing more, nothing less.
            </p>
          </div>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">3. Is it safe for my child?</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Yes. Here is what makes it safe:</p>
            <ul className="space-y-2">
              {[
                "No personal information is collected during normal use",
                "No login or registration required",
                "No advertising of any kind",
                "No social features — children cannot contact each other",
                "Quiz sessions exist only in your child's browser",
                "The feedback form is for parents and teachers only",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Read our full{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                Privacy Policy
              </Link>{" "}
              for complete details.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">
              4. Is this affiliated with any school or board?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              No. StudyZone is completely independent. It is not affiliated with CBSE, ICSE, Cambridge International
              Education, the Australian Curriculum, or any school, government, or educational authority.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The curriculum alignment is based on publicly available syllabus documents and our own research. If you
              find a question that is incorrect or inappropriate, please email us at{" "}
              <a href="mailto:hkarekar01cloud@gmail.com" className="text-blue-600 hover:underline">
                hkarekar01cloud@gmail.com
              </a>{" "}
              — we take content accuracy seriously.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-4">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">5. How can I contact you?</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-1">
                Email:{" "}
                <a href="mailto:hkarekar01cloud@gmail.com" className="underline hover:no-underline">
                  hkarekar01cloud@gmail.com
                </a>
              </p>
              <p className="text-blue-700 text-sm">We read every message. Response within 7 days.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
