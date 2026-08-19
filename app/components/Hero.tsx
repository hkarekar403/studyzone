import { CLASSES } from "@/lib/topicConfigs"

export default function Hero({
  onStartPractising,
  onGetWorksheet,
  onMockExam,
}: {
  onStartPractising: () => void
  onGetWorksheet: () => void
  onMockExam: () => void
}) {
  // Derived so the headline figure cannot drift from the actual topic list,
  // which is exactly how it came to claim 19.
  const stats = [
    { value: String(CLASSES[0].topics.length), label: 'Topics covered' },
    { value: '3', label: 'Difficulty levels' },
    { value: '∞', label: 'Questions' },
    { value: '📄', label: 'PDF export' },
  ]

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="rounded-2xl p-8 bg-gradient-to-r from-[#2563eb] to-[#7c3aed]">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-block mb-3 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
              ✨ Free for all students
            </span>
            <h1 className="font-heading text-4xl font-bold text-white mb-3 leading-tight">
              Make Class 4 Maths Fun!
            </h1>
            <p className="text-white/80 text-lg mb-6 leading-relaxed">
              Interactive, fun maths practice for Class 4 · CBSE · ICSE · IGCSE
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStartPractising}
                className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
              >
                Start Practising →
              </button>
              <button
                onClick={onGetWorksheet}
                className="bg-transparent text-white font-bold px-5 py-2.5 rounded-xl border-2 border-white hover:bg-white/10 transition-colors"
              >
                Get Worksheet
              </button>
              <button
                onClick={onMockExam}
                className="bg-white/15 text-white font-bold px-5 py-2.5 rounded-xl border border-white/40 hover:bg-white/25 transition-colors"
              >
                Mock Exam 📝
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/15 rounded-xl p-4 text-center min-w-[110px]">
                <p className="text-3xl font-bold text-white leading-none mb-1 tabular-nums">{stat.value}</p>
                <p className="text-white/70 text-xs font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
