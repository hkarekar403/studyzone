const steps = [
  { step: '1', emoji: '🎯', title: 'Pick a Topic', desc: 'Choose from 22 maths topics or go Random. Select Easy, Medium or Hard.' },
  { step: '2', emoji: '✏️', title: 'Answer Questions', desc: 'Type your answer and press Enter. Get instant feedback with audio and confetti!' },
  { step: '3', emoji: '📄', title: 'Track Progress', desc: 'View your session history, export a PDF report, or download a printable worksheet.' },
]

export default function HowItWorks({ sectionRef }: { sectionRef?: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={sectionRef} id="how-it-works" className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
      <h2 className="font-heading text-2xl font-bold text-blue-700 text-center mb-6">How it works</h2>
      <div className="flex flex-col sm:flex-row gap-6">
        {steps.map((s) => (
          <div key={s.step} className="relative flex-1 bg-white rounded-xl p-5 shadow-sm text-center">
            <span className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {s.step}
            </span>
            <p className="text-4xl mb-2">{s.emoji}</p>
            <p className="font-bold text-blue-700 mb-1">{s.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
