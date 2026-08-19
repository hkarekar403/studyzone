"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { X } from "lucide-react"

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), { ssr: false })

export default function QRShareModal({
  isDarkMode,
  onClose,
}: {
  isDarkMode: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-heading text-2xl font-bold text-gray-800">Share this app</h2>
        <p className="text-sm text-gray-500">Scan to practise maths!</p>
        <QRCodeSVG
          value={typeof window !== "undefined" ? window.location.href : ""}
          size={200}
          bgColor={isDarkMode ? "#1e293b" : "#ffffff"}
          fgColor="#2563eb"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="mt-2 w-full py-2.5 rounded-xl border-2 border-blue-500 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
        >
          {copied ? "Copied! ✓" : "Copy Link"}
        </button>
      </div>
    </div>
  )
}
