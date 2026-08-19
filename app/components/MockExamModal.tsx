"use client"

import { useState, useRef } from "react"
import { X, FileText, Download } from "lucide-react"
import FocusTrap from "focus-trap-react"
import type { Curriculum } from "@/lib/topicConfigs"

export type MockExamConfig = {
  curriculum: Curriculum
  topics: string[]
  totalMarks: 25 | 50
}

/**
 * Mock exam paper builder. Like the worksheet dialog, its settings only ever
 * configure one download, so they live here and travel to the caller as a
 * config object rather than being read out of page state.
 */
export default function MockExamModal({
  initialCurriculum,
  availableTopics,
  loading,
  onGenerate,
  onClose,
}: {
  initialCurriculum: Curriculum
  availableTopics: string[]
  loading: boolean
  onGenerate: (withAnswerKey: boolean, config: MockExamConfig) => void
  onClose: () => void
}) {
  const [curriculum, setCurriculum] = useState<Curriculum>(initialCurriculum)
  const [topics, setTopics] = useState<string[]>(['All Topics'])
  const [totalMarks, setTotalMarks] = useState<25 | 50>(50)
  const modalRef = useRef<HTMLDivElement>(null)

  const toggleTopic = (t: string) => {
    if (t === 'All Topics') {
      setTopics(['All Topics'])
      return
    }
    setTopics((prev) => {
      const withoutAll = prev.filter((p) => p !== 'All Topics')
      const next = withoutAll.includes(t) ? withoutAll.filter((p) => p !== t) : [...withoutAll, t]
      return next.length === 0 ? ['All Topics'] : next
    })
  }

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      >
        <FocusTrap
          active={true}
          focusTrapOptions={{
            onDeactivate: () => !loading && onClose(),
            clickOutsideDeactivates: true,
            escapeDeactivates: !loading,
          }}
        >
          <div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5 w-[380px] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onClose()}
              disabled={loading}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
              aria-label="Close mock exam dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-heading text-xl font-bold text-gray-800">Generate Mock Examination</h2>
              <p className="text-sm text-gray-500 mt-1">Competency-weighted exam paper: Sections A–D (VSA/SA1/SA2/LA)</p>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Curriculum</label>
                <div className="flex gap-2">
                  {(['CBSE', 'ICSE', 'IGCSE'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurriculum(c)}
                      disabled={loading}
                      className={`rounded-full px-4 py-2 font-bold text-sm transition disabled:opacity-60 ${
                        curriculum === c
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-white border border-[#2563eb] text-[#2563eb]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Topics</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={topics.includes('All Topics')}
                      onChange={() => toggleTopic('All Topics')}
                      disabled={loading}
                    />
                    All Topics
                  </label>
                  {availableTopics.filter((t) => t !== 'Explain & Reason').map((t) => (
                    <label key={t} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={topics.includes(t)}
                        onChange={() => toggleTopic(t)}
                        disabled={loading}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Total Marks</label>
                <div className="flex gap-2">
                  {([50, 25] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTotalMarks(m)}
                      disabled={loading}
                      className={`flex-1 rounded-full py-2 font-bold text-sm transition disabled:opacity-60 ${
                        totalMarks === m
                          ? 'bg-violet-600 text-white'
                          : 'bg-white border border-violet-600 text-violet-600'
                      }`}
                    >
                      {m} marks
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {totalMarks === 50
                    ? 'A(10×1) + B(5×2) + C(5×3) + D(3×5) = 50 marks · ~50 mins'
                    : 'A(5×1) + B(3×2) + C(3×3) + D(1×5) = 25 marks · ~25 mins'
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onGenerate(false, { curriculum, topics, totalMarks })}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    📝 Question Paper
                  </>
                )}
              </button>
              <button
                onClick={() => onGenerate(true, { curriculum, topics, totalMarks })}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    🔑 Question Paper + Answer Key
                  </>
                )}
              </button>
              <button
                onClick={() => onClose()}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        </FocusTrap>
      </div>
  )
}
