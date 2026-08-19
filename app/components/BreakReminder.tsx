/** Wellbeing banner shown after 20 minutes of continuous practice. */
export default function BreakReminder({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-amber-50 border-b border-amber-200 py-2 px-4 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-800">
        👋 You&apos;ve been practising for 20 minutes — great effort! Consider taking a short break.
      </p>
      <button
        onClick={onDismiss}
        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex-shrink-0"
      >
        Got it ✓
      </button>
    </div>
  )
}
