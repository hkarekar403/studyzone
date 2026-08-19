"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import SiteNavbar from "./components/SiteNavbar"
import SiteFooter from "./components/SiteFooter"
import Hero from "./components/Hero"
import HowItWorks from "./components/HowItWorks"
import TopicsCovered from "./components/TopicsCovered"
import FaqSection from "./components/FaqSection"
import FeedbackForm from "./components/FeedbackForm"
import QRShareModal from "./components/QRShareModal"

/**
 * Landing page.
 *
 * The quiz used to live here, below four adult-facing sections, so a returning
 * child had to scroll past an explainer, a topic directory, an FAQ written for
 * parents and a feedback form addressed to teachers before reaching it. The
 * practice app now has its own route; this page explains the product to the
 * adult evaluating it, and gets the child to /practice as fast as possible.
 */
export default function Home() {
  const router = useRouter()

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [hasPractisedBefore, setHasPractisedBefore] = useState(false)
  const [curriculum, setCurriculum] = useState("CBSE")

  const howItWorksRef = useRef<HTMLDivElement>(null)
  const topicsRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled')
    if (saved !== null) setSoundEnabled(saved === 'true')

    const dark = localStorage.getItem('theme') === 'dark'
    setIsDarkMode(dark)
    if (dark) document.documentElement.setAttribute('data-theme', 'dark')

    // A returning child gets a direct way back in rather than the full pitch.
    setHasPractisedBefore(localStorage.getItem('has-practised') === 'true')

    const savedCurriculum = localStorage.getItem('curriculum')
    if (savedCurriculum) setCurriculum(savedCurriculum)
  }, [])

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen">
      <a
        href="/practice"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-blue-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-bold"
      >
        Skip to practice
      </a>

      <SiteNavbar
        howItWorksRef={howItWorksRef}
        topicsRef={topicsRef}
        faqRef={faqRef}
        feedbackRef={feedbackRef}
        onShare={() => setShowQRModal(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled
          setSoundEnabled(next)
          localStorage.setItem('soundEnabled', String(next))
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <div className="p-4 md:p-8">
        {hasPractisedBefore && (
          <div className="max-w-6xl mx-auto mb-4">
            <a
              href="/practice"
              className="flex items-center justify-between gap-4 bg-blue-600 text-white rounded-2xl px-6 py-4 hover:bg-blue-700 transition-colors"
            >
              <span className="font-heading font-bold text-lg">👋 Welcome back — carry on practising</span>
              <span className="font-bold text-xl" aria-hidden="true">→</span>
            </a>
          </div>
        )}

        <Hero
          onStartPractising={() => router.push('/practice')}
          onGetWorksheet={() => router.push('/practice?worksheet=open')}
          onMockExam={() => router.push('/practice?mockexam=open')}
        />

        <HowItWorks sectionRef={howItWorksRef} />

        <TopicsCovered sectionRef={topicsRef} />

        <FaqSection sectionRef={faqRef} />

        <FeedbackForm curriculum={curriculum} sectionRef={feedbackRef} />

        <SiteFooter />
      </div>

      {showQRModal && <QRShareModal isDarkMode={isDarkMode} onClose={() => setShowQRModal(false)} />}
    </div>
  )
}
