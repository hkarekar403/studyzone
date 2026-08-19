"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqItems = [
  { q: "Is this completely free?", a: "Yes, completely free. No login, no subscription, no hidden fees. Just open and start practising." },
  { q: "Which syllabus does this follow?", a: "Supports three curricula — CBSE, ICSE and IGCSE Cambridge Primary Stage 4. Switch between them using the Curriculum selector. Each curriculum has its own topic set and question style." },
  { q: "Does my child need to create an account?", a: "No account or login required. Just open the website, pick a topic and start answering questions instantly." },
  { q: "Can teachers use this in the classroom?", a: "Absolutely. Use the Worksheet Generator to create printable question papers with mixed difficulty levels. Each worksheet includes a suggested completion time." },
  { q: "How many questions are available?", a: "The app generates questions randomly from a large pool across 22 topics and 3 difficulty levels. Questions never repeat within a session so students always get fresh practice." },
  { q: "What age group is this for?", a: "This app is designed for Class 4 students, typically aged 9-10 years. The Easy difficulty is suitable for beginners while Hard questions challenge advanced learners." },
  { q: "Can I track my child's progress?", a: "Yes. The Session History panel shows every question attempted with the child's answer and whether it was correct. You can also export a full PDF report at the end of each session." },
  { q: "Does it work on mobile?", a: "Yes, the app is fully responsive and works on phones, tablets and desktops. No app download needed — just open the website in any browser." },
]


const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map((faq) => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": { "@type": "Answer", "text": faq.a },
  })),
}

/**
 * FAQ accordion. Also emits the FAQPage structured data, which stays with the
 * questions it describes rather than drifting apart in a separate file.
 */
export default function FaqSection({ sectionRef }: { sectionRef?: React.RefObject<HTMLDivElement> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div ref={sectionRef} id="faq" className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="font-heading text-2xl font-bold text-blue-700 text-center mb-2">Frequently Asked Questions</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Everything parents and teachers need to know</p>
      <div>
        {faqItems.map((faq, idx, arr) => (
          <div key={idx} className={idx < arr.length - 1 ? "border-b border-gray-200" : ""}>
            <button
              className="w-full flex items-center justify-between py-4 text-left gap-4"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-answer-${idx}`}
            >
              <span className="font-bold text-blue-700 text-sm sm:text-base">{faq.q}</span>
              {openIndex === idx
                ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
            <div className={`grid transition-all duration-300 ${openIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div id={`faq-answer-${idx}`} className="overflow-hidden">
                <p className="text-sm text-gray-600 pb-4 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
