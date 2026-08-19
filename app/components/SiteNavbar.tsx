"use client"

import { Share2, Volume2, VolumeX, Moon, Sun } from "lucide-react"

type NavLink = { href: string; label: string; ref?: React.RefObject<HTMLDivElement> }

export default function SiteNavbar({
  howItWorksRef,
  topicsRef,
  faqRef,
  feedbackRef,
  onShare,
  soundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleDarkMode,
}: {
  howItWorksRef?: React.RefObject<HTMLDivElement>
  topicsRef?: React.RefObject<HTMLDivElement>
  faqRef?: React.RefObject<HTMLDivElement>
  feedbackRef?: React.RefObject<HTMLDivElement>
  onShare: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}) {
  const links: NavLink[] = [
    { href: "#how-it-works", label: "How it works", ref: howItWorksRef },
    { href: "#topics-covered", label: "Topics", ref: topicsRef },
    { href: "#faq", label: "FAQ", ref: faqRef },
    { href: "#feedback", label: "Feedback", ref: feedbackRef },
    { href: "/privacy", label: "Privacy" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="font-heading text-xl font-bold text-blue-700">StudyZone</span>
        </div>
        <div className="flex items-center gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={l.ref ? (e) => { e.preventDefault(); l.ref?.current?.scrollIntoView({ behavior: 'smooth' }) } : undefined}
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={onToggleSound}
            title="Toggle sound"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white shadow-sm"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleDarkMode}
            title="Toggle dark mode"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white shadow-sm"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-300 tracking-widest uppercase">
            BETA
          </span>
        </div>
      </div>
    </nav>
  )
}
