"use client"

import { useState, useEffect } from "react"
import { CLASSES } from "@/lib/topicConfigs"

export default function SiteFooter() {
  const cls = CLASSES[0]
  const [visitorCount, setVisitorCount] = useState(0)

  // Counts a visitor once per browser session, on whichever page they land on.
  useEffect(() => {
    const run = async () => {
      try {
        const firstVisit = !sessionStorage.getItem("visited_this_session")
        if (firstVisit) sessionStorage.setItem("visited_this_session", "1")
        const res = await fetch("/api/visitor-count", { method: firstVisit ? "POST" : "GET" })
        const data = await res.json()
        setVisitorCount(data.count ?? 0)
      } catch {
        // KV unavailable — the count simply stays hidden
      }
    }
    run()
  }, [])
  return (
    <footer className="pb-6 px-1 flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Built with ❤️ for curious minds · Class 4 Mathematics
        </p>
        {visitorCount > 0 && (
          <p className="text-sm text-gray-500 tabular-nums">
            🎯 {visitorCount} students have practised here
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
        StudyZone is a practice tool only. It does not assess or reflect a child&apos;s academic capability.
        Real evaluation should be done by qualified teachers. Topics are designed to align with{" "}
        <a
          href="https://ncert.nic.in/textbook.php"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          NCERT Class 4 Maths guidelines
        </a>.
      </p>
      <p className="text-xs text-gray-500">
        <a href={`/${cls.slug}/topics`} className="hover:text-gray-600 underline underline-offset-2 transition-colors">All Topics</a>
        {" "}|{" "}
        <a href="/teachers" className="hover:text-gray-600 underline underline-offset-2 transition-colors">For Teachers</a>
        {" "}|{" "}
        <a href="/privacy" className="hover:text-gray-600 underline underline-offset-2 transition-colors">Privacy Policy</a>
        {" "}|{" "}
        <a href="/about" className="hover:text-gray-600 underline underline-offset-2 transition-colors">About</a>
      </p>
      <p className="text-xs text-gray-500 flex items-center gap-3">
        <span>Share StudyZone:</span>
        <a
          href="https://wa.me/?text=Free%20Class%204%20maths%20practice%20on%20StudyZone%3A%20https%3A%2F%2Fstudyzone.co.in"
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
          className="hover:text-gray-700 underline underline-offset-2 transition-colors"
        >
          WhatsApp
        </a>
        <a
          href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fstudyzone.co.in&text=Free%20Class%204%20maths%20practice%20on%20StudyZone"
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X (Twitter)"
          className="hover:text-gray-700 underline underline-offset-2 transition-colors"
        >
          X
        </a>
        <a
          href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fstudyzone.co.in"
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Facebook"
          className="hover:text-gray-700 underline underline-offset-2 transition-colors"
        >
          Facebook
        </a>
      </p>
    </footer>
  )
}
