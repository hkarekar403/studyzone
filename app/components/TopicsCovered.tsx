import { CLASSES } from "@/lib/topicConfigs"

/**
 * Topic grid on the home page. Each card links to that topic's landing page,
 * which is where the crawlable detail lives — this section is the internal
 * link hub that makes those 22 pages discoverable from the root.
 */
export default function TopicsCovered({ sectionRef }: { sectionRef?: React.RefObject<HTMLDivElement> }) {
  const cls = CLASSES[0]
  return (
    <div ref={sectionRef} id="topics-covered" className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
      <h2 className="font-heading text-2xl font-bold text-blue-700 text-center mb-2">Topics Covered</h2>
      <p className="text-center text-sm text-gray-500 mb-6 max-w-2xl mx-auto">
        StudyZone covers the full Class 4 maths syllabus with unlimited practice questions across
        CBSE, ICSE and IGCSE curricula. Every topic below is available in Easy, Medium and Hard
        difficulty, so students can start with the basics and work up to exam-level word problems.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cls.topics.map((t) => (
          <a
            key={t.slug}
            href={`/${cls.slug}/topics/${t.slug}`}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow block"
          >
            <p className="font-bold text-blue-700 text-sm mb-1">{t.title}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>
          </a>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        <a href={`/${cls.slug}/topics`} className="text-blue-700 font-semibold hover:underline">
          Browse all topic guides
        </a>
        {" · "}
        <a href="/teachers" className="text-blue-700 font-semibold hover:underline">
          Resources for teachers
        </a>
      </p>
    </div>
  )
}
