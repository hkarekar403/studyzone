import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CLASSES, getClassBySlug } from "@/lib/topicConfigs"
import { generateTopicListSchema } from "@/lib/schemaGenerator"

export const dynamicParams = false

export function generateStaticParams() {
  return CLASSES.map((c) => ({ classLevel: c.slug }))
}

type Params = { params: { classLevel: string } }

export function generateMetadata({ params }: Params): Metadata {
  const cls = getClassBySlug(params.classLevel)
  if (!cls) return {}
  const url = `https://studyzone.co.in/${cls.slug}/topics`

  return {
    title: `All ${cls.label} Maths Topics | ${cls.curriculums.join(", ")} | StudyZone`,
    description: `Every ${cls.label} maths topic you can practise free on StudyZone — fractions, division, geometry, word problems and more. Sample questions, learning objectives and printable worksheets for each.`,
    keywords: `${cls.label.toLowerCase()} maths topics, grade ${cls.level} maths syllabus, cbse ${cls.label.toLowerCase()} maths, icse ${cls.label.toLowerCase()} maths, free maths practice topics`,
    category: "education",
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: `All ${cls.label} Maths Topics | StudyZone`,
      description: `Every ${cls.label} maths topic you can practise free — fractions, division, geometry, word problems and more.`,
      type: "website",
      locale: "en_IN",
      siteName: "StudyZone",
      url,
    },
  }
}

export default function TopicsIndex({ params }: Params) {
  const cls = getClassBySlug(params.classLevel)
  if (!cls) notFound()

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateTopicListSchema(cls) }}
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
                {cls.label}
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-blue-700 mb-3">
              {cls.label} Maths Topics
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {cls.topics.length} topics across {cls.curriculums.join(", ")}. Each page has sample
              questions with answers, learning objectives, and a link straight into free interactive
              practice.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {cls.topics.map((t) => (
              <Link
                key={t.slug}
                href={`/${cls.slug}/topics/${t.slug}`}
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
            <p>Free {cls.label} maths practice · No login · No ads</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
