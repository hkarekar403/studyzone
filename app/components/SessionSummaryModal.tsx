"use client"

import { useState } from "react"
import { X, Download, Share2, Play } from "lucide-react"

export type Weakness = { strong: string[]; weak: string[]; neutral: string[] }

/**
 * End-of-session summary. This is the artifact a child shows an adult, so it
 * reads session data but owns none of it — everything below is a prop.
 */
export default function SessionSummaryModal({
  questionsGenerated,
  correctAnswers,
  streak,
  curriculum,
  difficulty,
  currentDifficulty,
  pdfExporting,
  sessionStartedAt,
  sessionEndTime,
  weakness,
  onExportPDF,
  onStartNewSession,
  onClose,
}: {
  questionsGenerated: number
  correctAnswers: number
  streak: number
  curriculum: string
  difficulty: string
  currentDifficulty: string
  pdfExporting: boolean
  sessionStartedAt: Date
  sessionEndTime: Date | null
  weakness: Weakness
  onExportPDF: () => void
  onStartNewSession: () => void
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const exportPDF = onExportPDF

    const accuracy = questionsGenerated > 0 ? Math.round((correctAnswers / questionsGenerated) * 100) : 0
    const passed = accuracy >= 70
    const endTime = sessionEndTime ?? new Date()
    const elapsedSecs = Math.round((endTime.getTime() - sessionStartedAt.getTime()) / 1000)
    const mins = Math.floor(elapsedSecs / 60)
    const secs = elapsedSecs % 60
    const { strong, weak } = weakness

    const scoreColor = accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'
    const scoreBg = accuracy >= 70 ? 'bg-green-50 border-green-200' : accuracy >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

    const handleShare = async () => {
      const shareText = `I scored ${correctAnswers}/${questionsGenerated} (${accuracy}%) in Class 4 ${curriculum} Maths on StudyZone! 🎯`
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
      if (nav.share) {
        try {
          await nav.share({ title: "My Maths Score on StudyZone", text: shareText, url: "https://studyzone.co.in" })
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          if ((err as DOMException)?.name !== "AbortError") {
            navigator.clipboard.writeText(`${shareText} studyzone.co.in`).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            })
          }
        }
      } else {
        navigator.clipboard.writeText(`${shareText} studyzone.co.in`).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }
    }



  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 w-full max-w-md mx-4">
          {/* Header */}
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-gray-800 mb-1">
              {passed ? 'Session Complete! 🎉' : 'Good effort! 💪'}
            </h2>
            <p className="text-gray-500 text-sm">Here&apos;s how you did today</p>
          </div>

          {/* Score card */}
          <div className={`rounded-2xl border-2 p-6 text-center ${scoreBg}`}>
            <p className={`font-heading text-6xl font-bold ${scoreColor} mb-1`}>
              {correctAnswers} / {questionsGenerated}
            </p>
            <p className={`text-2xl font-bold ${scoreColor} mb-4`}>{accuracy}%</p>
            <div className="flex justify-center gap-6 text-sm text-gray-600 flex-wrap">
              <span>⏱ {mins}m {secs}s</span>
              <span>🔥 Best streak: {streak}</span>
            </div>
          </div>

          {/* Curriculum & difficulty badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{curriculum}</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              currentDifficulty === 'Easy' ? 'bg-blue-100 text-blue-700' :
              currentDifficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>{difficulty === 'Random' ? `Random (${currentDifficulty})` : currentDifficulty}</span>
          </div>

          {/* Topic insights */}
          {(strong.length > 0 || weak.length > 0) && (
            <div className="flex flex-col gap-2">
              {strong.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-green-700 w-28 flex-shrink-0">💪 Strong:</span>
                  {strong.map((t) => (
                    <span key={t} className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              {weak.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-amber-700 w-28 flex-shrink-0">📚 Needs practice:</span>
                  {weak.map((t) => (
                    <span key={t} className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={exportPDF}
              disabled={pdfExporting}
              className="w-full py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pdfExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Shared! ✓' : 'Share Score'}
            </button>
            {!(navigator as Navigator & { share?: unknown }).share && (
              <div className="flex flex-col items-center gap-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I scored ${correctAnswers}/${questionsGenerated} (${accuracy}%) in Class 4 ${curriculum} Maths on StudyZone! 🎯 Try it free at https://studyzone.co.in`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Opens WhatsApp in a new tab"
                  className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Share on WhatsApp 💬
                </a>
                <span className="text-xs text-gray-500 text-center">↗ Opens WhatsApp</span>
              </div>
            )}
            <button
              onClick={onStartNewSession}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>
      </div>
  )
}
