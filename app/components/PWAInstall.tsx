'use client'

import { useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstall() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }

    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches

    if (ios && !standalone) {
      const sessionDismissed = sessionStorage.getItem('pwa-ios-dismissed')
      if (!sessionDismissed) {
        setIsIOS(true)
        setShowBanner(true)
      }
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    deferredPrompt.current = null
    setShowBanner(false)
  }

  const handleDismiss = () => {
    if (isIOS) {
      sessionStorage.setItem('pwa-ios-dismissed', 'true')
    } else {
      localStorage.setItem('pwa-dismissed', 'true')
    }
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b] text-white p-4 shadow-lg flex items-center gap-3">
      <span className="flex-1 text-sm">
        {isIOS
          ? "📱 Tap the Share button then 'Add to Home Screen' to install StudyZone"
          : "📱 Add StudyZone to your home screen for quick access!"}
      </span>
      {!isIOS && (
        <button
          onClick={handleInstall}
          className="bg-[#2563eb] text-white rounded-lg px-4 py-2 text-sm font-medium shrink-0"
        >
          Install
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="text-gray-400 shrink-0 text-lg leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
