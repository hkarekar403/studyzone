import Link from "next/link"
import type { TopicConfig } from "@/lib/topicConfigs"
import { TOPIC_CONFIGS } from "@/lib/topicConfigs"
import {
  generateEducationalSchema,
  generateBreadcrumbSchema,
  quizDeepLink,
} from "@/lib/schemaGenerator"

const difficultyStyles: Record<string, string> = {
  // Red is reserved for incorrect feedback, so Hard uses purple — see CLAUDE.md §5.
  Easy: "bg-blue-200 text-blue-700",
  Medium: "bg-amber-200 text-amber-700",
  Hard: "bg-purple-100 text-purple-700",
}

const difficultyBorder: Record<string, string> = {
  Easy: "border-blue-400",
  Medium: "border-amber-400",
  Hard: "border-purple-500",
}

/**
 * Server-rendered landing page for one maths topic. Everything a crawler needs —
 * sample questions, answers, objectives — is in the initial HTML, not fetched
 * client-side.
 */
export default function TopicLandingPage({ topic }: { topic: TopicConfig }) {
  const related = TOPIC_CONFIGS.filter((t) => t.slug !== topic.slug).slice(0, 6)

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateEducationalSchema(topic) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateBreadcrumbSchema(topic) }}
      />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚀</span>
            <span className="font-heading text-xl font-bold text-blue-700">StudyZone</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/topics" className="text-gray-600 hover:text-blue-700 transition-colors">
              All Topics
            </Link>
            <Link href="/teachers" className="text-gray-600 hover:text-blue-700 transition-colors">
              For Teachers
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* BREADCRUMB */}
          <nav aria-label="Breadcrumb" className="mt-4 mb-6 text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-blue-700 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/topics" className="hover:text-blue-700 transition-colors">
                  Topics
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-700 font-semibold" aria-current="page">
                {topic.title}
              </li>
            </ol>
          </nav>

          {/* HERO */}
          <header className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-8 md:p-10 mb-8 text-white">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              Class 4 {topic.title} Practice
            </h1>
            <p className="text-blue-50 text-lg leading-relaxed mb-5 max-w-2xl">{topic.description}</p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {topic.curriculums.map((c) => (
                <span
                  key={c}
                  className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-sm font-semibold"
                >
                  {c}
                </span>
              ))}
              <span className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-sm font-semibold">
                Ages 9–10
              </span>
              <span className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-sm font-semibold">
                Free · No login
              </span>
            </div>
            <Link
              href={quizDeepLink(topic)}
              className="inline-block bg-white text-blue-700 font-heading font-bold text-lg rounded-xl px-6 py-3 hover:bg-blue-50 transition-colors"
            >
              Start practising {topic.title} →
            </Link>
          </header>

          {/* INTRO */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-3">
              What Class 4 {topic.title.toLowerCase()} covers
            </h2>
            <p className="text-gray-600 leading-relaxed">{topic.intro}</p>
          </section>

          {/* LEARNING OBJECTIVES */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-4">Learning objectives</h2>
            <ul className="space-y-2">
              {topic.learningObjectives.map((obj) => (
                <li key={obj} className="flex gap-3 text-gray-600 leading-relaxed">
                  <span className="text-green-600 font-bold" aria-hidden="true">
                    ✓
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* SAMPLE QUESTIONS — visible in HTML source, not behind the app */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-2">
              Sample {topic.title.toLowerCase()} questions
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Examples of what the practice generator produces. Answers are shown so parents and
              teachers can judge the level before starting.
            </p>
            <ol className="space-y-4">
              {topic.sampleQuestions.map((q, i) => (
                <li
                  key={q.text}
                  className={`bg-white rounded-xl p-5 border-l-4 ${difficultyBorder[q.difficulty]}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="font-semibold text-gray-800 leading-relaxed">
                      {i + 1}. {q.text}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${difficultyStyles[q.difficulty]}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-green-700">Answer:</span> {q.answer}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-6 text-center">
              <Link
                href={quizDeepLink(topic)}
                className="inline-block bg-blue-600 text-white font-heading font-bold rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                Try more {topic.title.toLowerCase()} questions free →
              </Link>
              <p className="text-gray-500 text-xs mt-3">
                Questions are generated fresh each time, so they never run out.
              </p>
            </div>
          </section>

          {/* TEACHER RESOURCES */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-4">
              For teachers and parents
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white rounded-xl p-5">
                <p className="font-heading font-bold text-gray-800 mb-1">Printable worksheets</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Generate a {topic.title.toLowerCase()} worksheet of 5–20 questions with a separate
                  teacher answer key, ready to print for a class or for homework.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5">
                <p className="font-heading font-bold text-gray-800 mb-1">Three difficulty levels</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Easy, Medium and Hard run side by side, so a mixed-ability class can work on the
                  same topic at the level that suits each child.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5">
                <p className="font-heading font-bold text-gray-800 mb-1">Instant feedback</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Children get up to three attempts with step-by-step working revealed afterwards —
                  no marking needed for practice sessions.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5">
                <p className="font-heading font-bold text-gray-800 mb-1">Nothing to set up</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No accounts, no logins, no data collected from children. Open the page on any
                  school device and start.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <Link
                href="/teachers"
                className="text-blue-700 font-semibold hover:underline"
              >
                See the full teacher guide →
              </Link>
            </div>
          </section>

          {/* RELATED TOPICS */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-4">
              Other Class 4 maths topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="bg-white rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {t.title}
                </Link>
              ))}
              <Link
                href="/topics"
                className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                All topics →
              </Link>
            </div>
          </section>

          {/* DISCLAIMER — same framing as /about */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 mb-8">
            <p className="font-bold text-amber-800 mb-2">
              StudyZone is a fun practice tool, not an assessment platform.
            </p>
            <p className="text-amber-900 leading-relaxed text-sm">
              Questions are randomly generated and are not a substitute for formal evaluation. A
              child&apos;s performance here does not reflect their academic ability or school
              readiness.
            </p>
          </div>

          {/* FOOTER */}
          <footer className="text-center text-sm text-gray-500 pb-8">
            <p className="mb-2">
              <Link href="/" className="hover:text-blue-700 transition-colors">
                Home
              </Link>
              {" · "}
              <Link href="/topics" className="hover:text-blue-700 transition-colors">
                Topics
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
