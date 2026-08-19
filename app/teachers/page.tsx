import Link from "next/link"
import type { Metadata } from "next"
import { CLASSES } from "@/lib/topicConfigs"

export const metadata: Metadata = {
  title: "StudyZone for Teachers | Free Class 4 Maths Worksheets & Practice",
  description:
    "Free Class 4 maths resources for teachers: printable worksheets with answer keys, 22 topics across CBSE, ICSE and IGCSE, three difficulty levels for mixed-ability classes. No accounts, no student data collected.",
  keywords:
    "class 4 maths worksheets for teachers, free printable maths worksheets grade 4, cbse class 4 maths resources, mixed ability maths class, maths homework generator, primary maths teaching resources",
  category: "education",
  alternates: { canonical: "https://studyzone.co.in/teachers" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "StudyZone for Teachers | Free Class 4 Maths Worksheets",
    description:
      "Printable worksheets with answer keys, 22 topics, three difficulty levels. Free, no accounts, no student data collected.",
    type: "website",
    locale: "en_IN",
    siteName: "StudyZone",
    url: "https://studyzone.co.in/teachers",
  },
}

const teacherFaqs = [
  {
    q: "How do I use StudyZone in a classroom?",
    a: "Two common ways. For a whole-class starter, open the quiz on the board, pick a topic and work through questions together — the timer can be switched off so there is no pressure. For independent or homework use, generate a printable worksheet with the answer key and hand it out. Nothing needs installing and there is no class code to set up.",
  },
  {
    q: "Can I track individual student progress?",
    a: "No, and deliberately so. StudyZone stores nothing about a child on any server — no accounts, no logins, no progress database. A child can export a PDF of their own session at the end, which they can show you or take home, but that report never leaves their device unless they choose to share it.",
  },
  {
    q: "Does it work offline?",
    a: "Partly. StudyZone can be installed as an app on a phone or tablet and previously visited pages will open without a connection, but generating new questions and worksheets needs internet access. For an unreliable connection, print worksheets in advance.",
  },
  {
    q: "Which curriculum does it follow?",
    a: "Three: CBSE, ICSE, and IGCSE Cambridge Primary Stage 4. Each has its own topic list and question style, selectable at the top of the quiz. Topics common to all three, like fractions and division, share the same question bank.",
  },
  {
    q: "Is it suitable for a mixed-ability class?",
    a: "That is what the three difficulty levels are for. The same topic runs at Easy, Medium and Hard side by side, so every child can work on fractions at the level that suits them. A mixed worksheet draws roughly 30% Easy, 50% Medium and 20% Hard.",
  },
  {
    q: "Is it really free, and is there a catch?",
    a: "Free, with no ads, no login and no subscription. It was built by a parent for their own child and made public. There is no upsell and no paid tier.",
  },
  {
    q: "Are the questions checked for accuracy?",
    a: "Questions are produced by a generator with fixed rules rather than written one by one, and the answer key is derived from the same calculation that builds the question. It is a practice tool, not an assessment instrument — please do use your own judgement, and there is a feedback form on the home page if you spot anything wrong.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: teacherFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

const lessonPlans = [
  {
    title: "10-minute lesson starter",
    duration: "10 min",
    steps: [
      "Project the quiz and select one topic at Easy.",
      "Switch the timer off so nobody is rushed.",
      "Work three questions as a class, asking a different child to explain each one.",
      "Finish with one Medium question for the class to try in pairs.",
    ],
  },
  {
    title: "Mixed-ability practice carousel",
    duration: "30 min",
    steps: [
      "Generate three worksheets on the same topic — one Easy, one Medium, one Hard.",
      "Print the matching answer keys for yourself only.",
      "Give each group the level that fits, so everyone is working on the same topic.",
      "Regroup at the end and compare methods rather than answers.",
    ],
  },
  {
    title: "Homework pack",
    duration: "Weekly",
    steps: [
      "Generate a 10-question mixed-difficulty worksheet on the week's topic.",
      "Print without the answer key for students, with the key for marking.",
      "Point families at the topic page so children can practise more of the same online.",
    ],
  },
  {
    title: "Reasoning and error-spotting session",
    duration: "20 min",
    steps: [
      "Choose the Explain & Reason topic, which asks children to justify or correct an answer.",
      "Have children write their explanation before revealing the model answer.",
      "Compare their wording with the model — the gap is where the teaching point sits.",
    ],
  },
  {
    title: "Pre-assessment topic sweep",
    duration: "25 min",
    steps: [
      "Set the quiz to Random topic, Medium difficulty, and give each child 15 minutes.",
      "Ask them to end the session, which produces a Performance Insights breakdown by topic.",
      "Use the strong/weak topic split to decide what to reteach — the data stays on their device.",
    ],
  },
]

const class4 = CLASSES[0]

export default function Teachers() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚀</span>
            <span className="font-heading text-xl font-bold text-blue-700">StudyZone</span>
          </Link>
          <Link href={`/${class4.slug}/topics`} className="text-sm text-gray-600 hover:text-blue-700 transition-colors">
            All Topics
          </Link>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" className="mt-4 mb-6 text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-blue-700 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-700 font-semibold" aria-current="page">
                For Teachers
              </li>
            </ol>
          </nav>

          {/* HERO */}
          <header className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-8 md:p-10 mb-8 text-white">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              StudyZone for Teachers
            </h1>
            <p className="text-blue-50 text-lg leading-relaxed mb-6 max-w-2xl">
              Free Class 4 maths practice and printable worksheets for CBSE, ICSE and IGCSE. No
              accounts to create, no student data collected, nothing to pay for — open it and use
              it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/?worksheet=open&utm_source=teachers_page&utm_medium=organic"
                className="inline-block bg-white text-blue-700 font-heading font-bold rounded-xl px-6 py-3 hover:bg-blue-50 transition-colors"
              >
                Generate a worksheet →
              </Link>
              <Link
                href={`/${class4.slug}/topics`}
                className="inline-block bg-white/20 border border-white/30 text-white font-heading font-bold rounded-xl px-6 py-3 hover:bg-white/30 transition-colors"
              >
                Browse {class4.topics.length} topics
              </Link>
            </div>
          </header>

          {/* FEATURES */}
          <section className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-4">What you get</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white/60 rounded-2xl p-6">
                <p className="font-heading text-lg font-bold text-gray-800 mb-2">
                  📄 Worksheet generator
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Build a printable question paper of 5, 10, 15 or 20 questions on any topic and
                  difficulty. Every worksheet comes with a suggested completion time, a name and
                  score field, and ruled answer space. A separate teacher copy carries the full
                  answer key with working.
                </p>
              </div>
              <div className="bg-white/60 rounded-2xl p-6">
                <p className="font-heading text-lg font-bold text-gray-800 mb-2">
                  📊 Three difficulty levels
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Easy, Medium and Hard for every topic, so a mixed-ability class can work on one
                  topic at three levels. Mixed worksheets blend roughly 30% Easy, 50% Medium and 20%
                  Hard.
                </p>
              </div>
              <div className="bg-white/60 rounded-2xl p-6">
                <p className="font-heading text-lg font-bold text-gray-800 mb-2">
                  🎯 Curriculum alignment
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  CBSE, ICSE and IGCSE Cambridge Primary Stage 4, each with its own topic list and
                  question style — including rupee-based money questions for CBSE and ICSE, and
                  international contexts for IGCSE.
                </p>
              </div>
              <div className="bg-white/60 rounded-2xl p-6">
                <p className="font-heading text-lg font-bold text-gray-800 mb-2">
                  ⚡ Instant feedback
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Children get up to three attempts, then see step-by-step working. Reasoning
                  questions are self-assessed against a model answer, which is often a better
                  discussion prompt than a mark.
                </p>
              </div>
              <div className="bg-white/60 rounded-2xl p-6">
                <p className="font-heading text-lg font-bold text-gray-800 mb-2">
                  🔒 No student data
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No accounts, no logins, nothing about a child stored on any server. Session data
                  lives in the browser and disappears when the tab closes. Safe to use on shared
                  school devices.
                </p>
              </div>
              <div className="bg-white/60 rounded-2xl p-6">
                <p className="font-heading text-lg font-bold text-gray-800 mb-2">
                  🧘 Classroom-friendly pacing
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The per-question timer can be switched off entirely for a relaxed session, and a
                  break reminder appears after 20 minutes of continuous practice.
                </p>
              </div>
            </div>
          </section>

          {/* LESSON PLANS */}
          <section className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-2">
              Ready-made lesson ideas
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              Five short templates you can run as they are, or adapt.
            </p>
            <div className="space-y-4">
              {lessonPlans.map((plan) => (
                <div key={plan.title} className="bg-white/60 rounded-2xl p-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="font-heading text-lg font-bold text-gray-800">{plan.title}</h3>
                    <span className="shrink-0 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-bold">
                      {plan.duration}
                    </span>
                  </div>
                  <ol className="space-y-2">
                    {plan.steps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                        <span className="shrink-0 font-bold text-blue-600">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {/* WORKSHEET CTA */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-2">
              Make a worksheet now
            </h2>
            <p className="text-gray-600 text-sm mb-5 max-w-xl mx-auto">
              Pick a topic, a difficulty and a question count. You get a printable PDF plus a
              matching teacher answer key — no email address required.
            </p>
            <Link
              href="/?worksheet=open&utm_source=teachers_page&utm_medium=organic"
              className="inline-block bg-blue-600 text-white font-heading font-bold rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors"
            >
              Open the worksheet generator →
            </Link>
          </section>

          {/* POPULAR TOPICS */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-4">
              Popular topics with teachers
            </h2>
            <div className="flex flex-wrap gap-2">
              {["fractions", "division", "multiplication", "word-problems", "geometry", "measurement", "explain-and-reason"].map(
                (slug) => {
                  const t = class4.topics.find((x) => x.slug === slug)
                  if (!t) return null
                  return (
                    <Link
                      key={slug}
                      href={`/${class4.slug}/topics/${slug}`}
                      className="bg-white rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      {t.title}
                    </Link>
                  )
                }
              )}
              <Link
                href={`/${class4.slug}/topics`}
                className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                All topics →
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/60 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-blue-700 mb-5">
              Questions teachers ask
            </h2>
            <div className="space-y-5">
              {teacherFaqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-heading font-bold text-gray-800 mb-1.5">{f.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* DISCLAIMER */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 mb-8">
            <p className="font-bold text-amber-800 mb-2">
              StudyZone is a practice tool, not an assessment platform.
            </p>
            <p className="text-amber-900 leading-relaxed text-sm">
              Questions are randomly generated and are not a substitute for formal evaluation.
              StudyZone is not affiliated with, endorsed by, or approved by CBSE, CISCE, Cambridge
              Assessment International Education or any examination board. Curriculum names describe
              the question style only.
            </p>
          </div>

          <footer className="text-center text-sm text-gray-500 pb-8">
            <p className="mb-2">
              <Link href="/" className="hover:text-blue-700 transition-colors">
                Home
              </Link>
              {" · "}
              <Link href={`/${class4.slug}/topics`} className="hover:text-blue-700 transition-colors">
                Topics
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
