"use client"

import { useState } from "react"
import { Send, Star } from "lucide-react"

/**
 * Feedback form for parents and teachers.
 *
 * Owns all of its own state — none of it relates to the quiz session, which is
 * why it lived awkwardly among the quiz state in page.tsx. `curriculum` is the
 * only thing it needs from outside, and it is sent as context with the message.
 */
export default function FeedbackForm({
  curriculum,
  sectionRef,
}: {
  curriculum: string
  sectionRef?: React.RefObject<HTMLDivElement>
}) {
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [touched, setTouched] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, message, curriculum }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setName("")
          setRating(0)
          setMessage("")
          setHoverRating(0)
        }, 5000)
      } else {
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={sectionRef} id="feedback" className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
      <div className="flex justify-center mb-3">
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-300">
          👨‍👩‍👧 For Parents &amp; Teachers Only
        </span>
      </div>
      <h2 className="font-heading text-2xl font-bold text-center mb-1" style={{ color: '#2563eb' }}>
        💬 Share Your Feedback
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">Help us improve StudyZone for students everywhere</p>

      {submitted ? (
        <div className="flex flex-col items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-2xl py-10 px-6 text-center">
          <span className="text-5xl">🎉</span>
          <p className="font-heading text-xl font-bold text-green-700">Thank you for your feedback!</p>
          <p className="text-sm text-gray-600">Your response helps us make StudyZone better for students everywhere.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          {/* Star rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-gray-600">Rate your experience</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rate your experience, 1 to 5 stars">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating)
                return (
                  <button
                    key={star}
                    onClick={() => { setRating(star); setTouched(true) }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${star} ${star === 1 ? 'star' : 'stars'} out of 5`}
                    aria-checked={rating === star}
                  >
                    <Star
                      className="w-8 h-8 transition-colors"
                      fill={filled ? '#f59e0b' : 'none'}
                      stroke={filled ? '#f59e0b' : '#d1d5db'}
                    />
                  </button>
                )
              })}
            </div>
            {touched && rating === 0 && (
              <p className="text-xs text-amber-600 font-semibold">Please select a rating</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="feedback-name" className="sr-only">Your name</label>
            <input
              id="feedback-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name — parent or teacher (optional)"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
            />
          </div>

          {/* Curriculum (read-only) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Curriculum:</span>
            <span className="font-bold text-blue-700">{curriculum}</span>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="feedback-message" className="sr-only">Your feedback message</label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you think of StudyZone? Any suggestions for improvement?"
              rows={4}
              className="w-full p-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600 text-center" aria-live="polite">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || rating === 0 || submitting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Feedback
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
