'use client'

import { useState } from 'react'

const badgeSnippet = `<a href="https://studyzone.co.in" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:#eff6ff;border:1px solid #93c5fd;color:#1e3a5f;font-family:sans-serif;font-size:13px;font-weight:600;text-decoration:none;">
  🚀 Free Class 4 Maths Practice — StudyZone
</a>`

export default function BadgeEmbed() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(badgeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
      <a
        href="https://studyzone.co.in"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: '#eff6ff',
          border: '1px solid #93c5fd',
          color: '#1e3a5f',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        🚀 Free Class 4 Maths Practice — StudyZone
      </a>
      <button
        onClick={handleCopy}
        className="py-2 px-4 rounded-xl border-2 border-blue-500 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
      >
        {copied ? 'Copied! ✓' : '📋 Copy badge code'}
      </button>
    </div>
  )
}
