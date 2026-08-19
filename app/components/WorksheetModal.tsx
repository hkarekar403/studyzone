"use client"

import { useState } from "react"
import { X, Download, FileText } from "lucide-react"
import type { Curriculum } from "@/lib/topicConfigs"

export type WorksheetConfig = {
  difficulty: string
  topic: string
  count: number
  curriculum: Curriculum
}

/**
 * Worksheet generator dialog. These four settings exist only to configure one
 * download, so they live here rather than among the quiz session state. The
 * caller receives the finished config and does the PDF work.
 */
export default function WorksheetModal({
  initialCurriculum,
  availableTopics,
  loading,
  onGenerate,
  onClose,
}: {
  initialCurriculum: Curriculum
  availableTopics: string[]
  loading: boolean
  onGenerate: (withAnswerKey: boolean, config: WorksheetConfig) => void
  onClose: () => void
}) {
  const [wseDifficulty, setWseDifficulty] = useState("Random")
  const [wseTopic, setWseTopic] = useState("Random")
  const [wseCount, setWseCount] = useState(10)
  const [curriculum, setCurriculum] = useState<Curriculum>(initialCurriculum)
  const worksheetLoading = loading

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => !worksheetLoading && onClose()}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5 w-[380px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onClose()}
            disabled={worksheetLoading}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <h2 className="font-heading text-xl font-bold text-gray-800">Generate Printable Worksheet</h2>
            <p className="text-sm text-gray-500 mt-1">Download a questions PDF, or both questions and answer key</p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Curriculum</label>
              <div className="flex gap-2">
                {(['CBSE', 'ICSE', 'IGCSE'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurriculum(c)}
                    disabled={worksheetLoading}
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
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Difficulty</label>
              <select
                value={wseDifficulty}
                onChange={(e) => setWseDifficulty(e.target.value)}
                disabled={worksheetLoading}
                className="w-full p-2.5 text-sm font-semibold rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-200 cursor-pointer disabled:opacity-60"
              >
                <option value="Random">Random (Mixed)</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Topic</label>
              <select
                value={wseTopic}
                onChange={(e) => setWseTopic(e.target.value)}
                disabled={worksheetLoading}
                className="w-full p-2.5 text-sm font-semibold rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-200 cursor-pointer disabled:opacity-60"
              >
                {availableTopics.filter((t) => t !== 'Explain & Reason').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Number of Questions</label>
              <select
                value={wseCount}
                onChange={(e) => setWseCount(Number(e.target.value))}
                disabled={worksheetLoading}
                className="w-full p-2.5 text-sm font-semibold rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-200 cursor-pointer disabled:opacity-60"
              >
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
                <option value={20}>20 questions</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onGenerate(false, { difficulty: wseDifficulty, topic: wseTopic, count: wseCount, curriculum })}
              disabled={worksheetLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {worksheetLoading ? (
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
                  📄 Questions PDF
                </>
              )}
            </button>
            <button
              onClick={() => onGenerate(true, { difficulty: wseDifficulty, topic: wseTopic, count: wseCount, curriculum })}
              disabled={worksheetLoading}
              className="w-full py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {worksheetLoading ? (
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
                  🔑 Questions + Answer Key
                </>
              )}
            </button>
            <button
              onClick={() => onClose()}
              disabled={worksheetLoading}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  )
}
