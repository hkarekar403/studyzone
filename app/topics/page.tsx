import Link from "next/link"
import type { Metadata } from "next"
import { TOPIC_CONFIGS } from "@/lib/topicConfigs"
import { generateTopicListSchema } from "@/lib/schemaGenerator"

export const metadata: Metadata = {
  title: "All Class 4 Maths Topics | CBSE, ICSE & IGCSE | StudyZone",
  description:
    "Every Class 4 maths topic you can practise free on StudyZone — fractions, division, geometry, word problems and more. Sample questions, learning objectives and printable worksheets for each.",
  keywords:
    "class 4 maths topics, grade 4 maths syllabus, cbse class 4 maths, icse class 4 maths, igcse primary maths, free maths practice topics",
  category: "education",
  alternates: { canonical: "https://studyzone.co.in/topics" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "All Class 4 Maths Topics | StudyZone",
    description:
      "Every Class 4 maths topic you can practise free — fractions, division, geometry, word problems and more.",
    type: "website",
    locale: "en_IN",
    siteName: "StudyZone",
    url: "https://studyzone.co.in/topics",
  },
}

export default function TopicsIndex() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateTopicListSchema(TOPIC_CONFIGS) }}
      />

      <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚀</span>
            <span className="font-heading text-xl font-bold text-blue-700">StudyZone</span>
          </Link>
          <Link href="/teachers" className="text-sm text-gray-600 hover:text-blue-700 transition-colors">
            For Teachers
          </Link>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <nav aria-label="Breadcrumb" className="mt-4 mb-6 text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-blue-700 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-700 font-semibold" aria-current="page">
                Topics
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-blue-700 mb-3">
              Class 4 Maths Topics
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {TOPIC_CONFIGS.length} topics across CBSE, ICSE and IGCSE Cambridge Primary Stage 4.
              Each page has sample questions with answers, learning objectives, and a link straight
              into free interactive practice.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {TOPIC_CONFIGS.map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className="bg-white/60 rounded-2xl p-5 hover:bg-white transition-colors block"
              >
                <h2 className="font-heading text-lg font-bold text-blue-700 mb-2">{t.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{t.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.curriculums.map((c) => (
                    <span
                      key={c}
                      className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <footer className="text-center text-sm text-gray-500 pb-8">
            <p className="mb-2">
              <Link href="/" className="hover:text-blue-700 transition-colors">
                Home
              </Link>
              {" · "}
              <Link href="/teachers" className="hover:text-blue-700 transition-colors">
                For Teachers
              </Link>
              {" · "}
              <Link href="/about" className="hover:text-blue-700 transition-colors">
                About
              </Link>
              {" · "}
              <Link href="/privacy" className="hover:text-blue-700 transition-colors">
                Privacy
              </Link>
            </p>
            <p>Free Class 4 maths practice · No login · No ads</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
