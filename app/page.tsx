"use client"

import { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from "react"
import { Clock, CheckCircle, Eye, Play, Download, ChevronDown, ChevronUp, Share2, X, Volume2, VolumeX, FileText, LogOut, Moon, Sun, Send, Star } from "lucide-react"
import jsPDF from "jspdf"
import { QRCodeSVG } from "qrcode.react"
import confetti from "canvas-confetti"
import FocusTrap from "focus-trap-react"
import { buildMCQOptions } from "@/lib/questionGenerator"

type SelfGrade = 'correct' | 'partial' | 'review'

interface SessionRecord {
  number: number
  difficulty: string
  topic: string
  question: string
  kidAnswer: string
  attempts: { answer: string; result: string }[]
  correctAnswer: string
  working: string
  isCorrect: boolean | null
  generatedAt: Date
  selfAssess?: boolean
  modelAnswer?: string
  selfGrade?: SelfGrade | null
}

export default function MathQuiz() {
  const [difficulty, setDifficulty] = useState("Random")
  const [currentDifficulty, setCurrentDifficulty] = useState("Easy")
  const [topic, setTopic] = useState<string>("Random")
  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [currentTopic, setCurrentTopic] = useState<string>("")
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [currentAnswer, setCurrentAnswer] = useState<string>("")
  const [currentWorking, setCurrentWorking] = useState<string>("")
  const [userAnswer, setUserAnswer] = useState<string>("")
  const [showAnswer, setShowAnswer] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<string>("")
  const [feedbackColor, setFeedbackColor] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [timerDuration, setTimerDuration] = useState<number>(60)
  const [timerActive, setTimerActive] = useState<boolean>(false)
  const [questionsGenerated, setQuestionsGenerated] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [currentAttempts, setCurrentAttempts] = useState<number>(0)
  const [topicCorrect, setTopicCorrect] = useState<Record<string, number>>({})
  const [topicAttempted, setTopicAttempted] = useState<Record<string, number>>({})
  const [questionLocked, setQuestionLocked] = useState<boolean>(false)
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([])
  const sessionStartedAt = useRef<Date>(new Date())
  const [currentRecord, setCurrentRecord] = useState<SessionRecord | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [visitorCount, setVisitorCount] = useState<number>(0)

  const [streak, setStreak] = useState<number>(0)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [curriculum, setCurriculum] = useState<'CBSE' | 'ICSE' | 'IGCSE'>('CBSE')

  // Self-assessment mode ("Explain & Reason" questions) — no auto-grading;
  // the student writes an explanation, reveals a model answer, and self-grades.
  const [currentSelfAssess, setCurrentSelfAssess] = useState<boolean>(false)
  const [currentModelAnswer, setCurrentModelAnswer] = useState<string>("")
  const [selfAssessText, setSelfAssessText] = useState<string>("")
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false)
  const [selfGrade, setSelfGrade] = useState<SelfGrade | null>(null)

  // Guaranteed Explain & Reason cadence (every 6th question, when topic is Random)
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(true)

  // MCQ mode
  const [mcqMode, setMcqMode] = useState<boolean>(false)
  const [mcqOptions, setMcqOptions] = useState<string[]>([])
  const [mcqSelected, setMcqSelected] = useState<string | null>(null)
  const [mcqWrongOptions, setMcqWrongOptions] = useState<string[]>([])
  const mcqOptionRefs = useRef<(HTMLButtonElement | null)[]>([])

  // UI-only state
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null)
  const [copiedScore, setCopiedScore] = useState(false)
  const [showWorksheetModal, setShowWorksheetModal] = useState(false)
  const [worksheetLoading, setWorksheetLoading] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)
  const [inlineShareFeedback, setInlineShareFeedback] = useState("")

  // Feedback form
  const [feedbackName, setFeedbackName] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [feedbackTouched, setFeedbackTouched] = useState(false)
  const [timerDisabled, setTimerDisabled] = useState(false)
  const [sessionStartWarning, setSessionStartWarning] = useState(false)
  const [wseDifficulty, setWseDifficulty] = useState("Random")
  const [wseTopic, setWseTopic] = useState("Random")
  const [wseCount, setWseCount] = useState(10)
  const [worksheetCurriculum, setWorksheetCurriculum] = useState<'CBSE' | 'ICSE' | 'IGCSE'>(curriculum)

  // Mock exam modal
  const [showMockExamModal, setShowMockExamModal] = useState(false)
  const [mockExamLoading, setMockExamLoading] = useState(false)
  const [mockExamCurriculum, setMockExamCurriculum] = useState<'CBSE' | 'ICSE' | 'IGCSE'>(curriculum)
  const [mockExamTopics, setMockExamTopics] = useState<string[]>(['All Topics'])
  const [mockExamTotalMarks, setMockExamTotalMarks] = useState<25 | 50>(50)
  const mockExamModalRef = useRef<HTMLDivElement>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const quizRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (showSummary) {
      const accuracy = questionsGenerated > 0
        ? Math.round((correctAnswers / questionsGenerated) * 100) : 0
      if (accuracy >= 70) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#7c3aed', '#f59e0b', '#16a34a']
        })
      }
    }
  }, [showSummary])

  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled')
    if (saved !== null) setSoundEnabled(saved === 'true')
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('timer-disabled')
    if (saved !== null) setTimerDisabled(saved === 'true')
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mcq-mode')
    if (saved !== null) setMcqMode(saved === 'true')
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('reasoning-enabled')
    if (saved !== null) setReasoningEnabled(saved === 'true')
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (new Date().getTime() - sessionStartedAt.current.getTime()) / 1000 / 60
      if (elapsed >= 20 && !sessionStartWarning) {
        setSessionStartWarning(true)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [sessionStartWarning])

  useEffect(() => {
    const dark = localStorage.getItem('theme') === 'dark'
    setIsDarkMode(dark)
    if (dark) document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  useEffect(() => {
    const trackVisit = async () => {
      try {
        if (!sessionStorage.getItem("visited_this_session")) {
          sessionStorage.setItem("visited_this_session", "1")
          const res = await fetch("/api/visitor-count", { method: "POST" })
          const data = await res.json()
          setVisitorCount(data.count ?? 0)
        } else {
          const res = await fetch("/api/visitor-count")
          const data = await res.json()
          setVisitorCount(data.count ?? 0)
        }
      } catch {
        // KV unavailable — leave count at 0
      }
    }
    trackVisit()
  }, [])

  useEffect(() => {
    fetch('/api/clear-session', { method: 'POST' }).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`/api/topics?curriculum=${curriculum}`)
        if (response.ok) {
          const data = await response.json()
          setAvailableTopics(["Random", ...data.topics])
        }
      } catch {
        setAvailableTopics(["Random"])
      }
    }
    fetchTopics()
    setTopic("Random")
    setCurrentQuestion("")
    setCurrentAnswer("")
    setCurrentTopic("")
    setTimerActive(false)
    setCurrentSelfAssess(false)
    setShowModelAnswer(false)
  }, [curriculum])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
      setQuestionLocked(true)
      setFeedback("Time's up — let's see the answer!")
      setFeedbackColor("#d97706")
      setShowAnswer(true)
      setStreak(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerActive, timeLeft])

  const playSound = (type: "correct" | "incorrect") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    if (type === "correct") {
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } else {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.2)
    }
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  const generateQuestion = async () => {
    if (questionLocked && feedback !== "Correct") {
      setStreak(0)
    }
    setIsGenerating(true)
    setApiError(null)
    try {
      const resolvedDifficulty = difficulty === 'Random'
        ? (['Easy', 'Medium', 'Hard'] as const)[Math.floor(Math.random() * 3)]
        : difficulty
      // Guaranteed cadence: every 6th question is an Explain & Reason question,
      // unless the user picked a specific topic (their choice wins) or turned the
      // toggle off. Explain & Reason only exists in the Hard pool.
      const isForcedReasoning = reasoningEnabled && topic === 'Random' && (questionsGenerated + 1) % 6 === 0
      const effectiveDifficulty = isForcedReasoning ? 'Hard' : resolvedDifficulty
      interface GenerateQuestionRequest {
        difficulty: string
        curriculum: string
        topic?: string
      }
      const requestBody: GenerateQuestionRequest = { difficulty: effectiveDifficulty, curriculum }
      if (topic !== 'Random') requestBody.topic = topic
      else if (isForcedReasoning) requestBody.topic = 'Explain & Reason'

      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to generate question')
      }

      const questionData = await response.json()
      setCurrentQuestion(questionData.question)
      setCurrentAnswer(questionData.answer)
      setCurrentWorking(questionData.working)
      setCurrentTopic(questionData.topic || "General")
      setUserAnswer("")
      setShowAnswer(false)
      const isSelfAssess = questionData.selfAssess === true
      setCurrentSelfAssess(isSelfAssess)
      setCurrentModelAnswer(questionData.modelAnswer || "")
      setSelfAssessText("")
      setShowModelAnswer(false)
      setSelfGrade(null)
      if (mcqMode) {
        const options = buildMCQOptions({
          question: questionData.question,
          answer: questionData.answer,
          working: questionData.working,
          selfAssess: questionData.selfAssess,
        })
        setMcqOptions(options ?? [])
      } else {
        setMcqOptions([])
      }
      setMcqSelected(null)
      setMcqWrongOptions([])
      setFeedback("")
      setFeedbackColor("")
      setCurrentAttempts(0)
      setQuestionLocked(false)
      setCurrentDifficulty(effectiveDifficulty)
      const timerDuration = effectiveDifficulty === 'Easy' ? 45 : effectiveDifficulty === 'Medium' ? 90 : 120
      setTimerDuration(timerDuration)
      setTimeLeft(timerDuration)
      // Self-assess questions involve writing an explanation, which takes longer
      // than the fixed per-difficulty timer allows — simplest fix is to disable
      // the timer entirely for these rather than special-casing a longer duration.
      if (!timerDisabled && !isSelfAssess) setTimerActive(true)

      const newRecord: SessionRecord = {
        number: questionsGenerated + 1,
        difficulty: effectiveDifficulty,
        topic: questionData.topic || "General",
        question: questionData.question,
        kidAnswer: "",
        attempts: [],
        correctAnswer: questionData.answer,
        working: questionData.working,
        isCorrect: null,
        generatedAt: new Date(),
        selfAssess: isSelfAssess,
        modelAnswer: questionData.modelAnswer || "",
        selfGrade: null,
      }
      setCurrentRecord(newRecord)
      setSessionRecords((prev) => [...prev, newRecord])
      setQuestionsGenerated((prev) => prev + 1)
    } catch {
      setApiError("Oops! Couldn't load a question. Please tap Try Again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const checkAnswer = async (answerOverride?: string) => {
    const answerToCheck = answerOverride ?? userAnswer

    if (!currentAnswer) {
      setFeedback("Generate a question first.")
      setFeedbackColor("#d62828")
      return
    }

    if (questionLocked) {
      setFeedback("Generate a new question to continue")
      setFeedbackColor("#d62828")
      return
    }

    if (!answerToCheck.trim()) {
      setFeedback("Please enter an answer.")
      setFeedbackColor("#d62828")
      return
    }

    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_answer: answerToCheck,
          correct_answer: currentAnswer,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check answer')
      }

      const data = await response.json()
      const isCorrect = data.is_correct

      setTopicAttempted((prev) => ({ ...prev, [currentTopic]: (prev[currentTopic] ?? 0) + 1 }))
      if (isCorrect) {
        setTopicCorrect((prev) => ({ ...prev, [currentTopic]: (prev[currentTopic] ?? 0) + 1 }))
      }

      if (currentRecord) {
        const updatedRecord = { ...currentRecord, kidAnswer: answerToCheck }
        if (isCorrect) {
          updatedRecord.isCorrect = true
          updatedRecord.attempts.push({ answer: answerToCheck, result: "Correct" })
          setCurrentRecord(updatedRecord)
          setSessionRecords((prev) => prev.map((r) => (r.number === currentRecord.number ? updatedRecord : r)))
          setCorrectAnswers((prev) => prev + 1)
          setQuestionLocked(true)
          setTimerActive(false)
          setFeedback("Correct")
          setFeedbackColor("#1f9d46")
          setStreak((prev) => prev + 1)
          if (soundEnabled) playSound("correct")
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#7c3aed', '#f59e0b', '#16a34a'],
          })
        } else {
          setCurrentAttempts((prev) => prev + 1)
          updatedRecord.isCorrect = false
          updatedRecord.attempts.push({ answer: answerToCheck, result: "Not quite" })
          setCurrentRecord(updatedRecord)
          setSessionRecords((prev) => prev.map((r) => (r.number === currentRecord.number ? updatedRecord : r)))
          setStreak(0)
          if (soundEnabled) playSound("incorrect")
          if (mcqMode) setMcqWrongOptions((prev) => [...prev, answerToCheck])

          if (currentAttempts + 1 >= 3) {
            setQuestionLocked(true)
            setTimerActive(false)
            setFeedback("Let's look at the answer together")
            setFeedbackColor("#d97706")
            setShowAnswer(true)
          } else {
            const attemptsLeft = 3 - (currentAttempts + 1)
            setFeedback(`Not quite — ${attemptsLeft} more ${attemptsLeft === 1 ? 'try' : 'tries'}!`)
            setFeedbackColor("#d97706")
          }
        }
      }
    } catch {
      setApiError("Couldn't check your answer. Please try again.")
    }
  }

  const handleMcqSelect = (option: string) => {
    if (questionLocked || mcqWrongOptions.includes(option) || isGenerating) return
    setMcqSelected(option)
    setUserAnswer(option)
    checkAnswer(option)
  }

  const handleMcqKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (questionLocked) return
    const focusedIndex = mcqOptionRefs.current.findIndex((el) => el === document.activeElement)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = ((focusedIndex >= 0 ? focusedIndex : -1) + 1 + mcqOptions.length) % mcqOptions.length
      mcqOptionRefs.current[next]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = ((focusedIndex >= 0 ? focusedIndex : 0) - 1 + mcqOptions.length) % mcqOptions.length
      mcqOptionRefs.current[prev]?.focus()
    } else {
      const letterIndex = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase())
      if (letterIndex >= 0 && letterIndex < mcqOptions.length) {
        e.preventDefault()
        handleMcqSelect(mcqOptions[letterIndex])
      }
    }
  }

  const handleSelfGrade = (grade: SelfGrade) => {
    if (questionLocked || !currentRecord) return

    setSelfGrade(grade)
    setTopicAttempted((prev) => ({ ...prev, [currentTopic]: (prev[currentTopic] ?? 0) + 1 }))

    if (grade === 'correct') {
      setTopicCorrect((prev) => ({ ...prev, [currentTopic]: (prev[currentTopic] ?? 0) + 1 }))
      setCorrectAnswers((prev) => prev + 1)
      setStreak((prev) => prev + 1)
      if (soundEnabled) playSound("correct")
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#7c3aed', '#f59e0b', '#16a34a'],
      })
    } else if (grade === 'review') {
      // Breaks the streak and (via the accuracy-based weakness analysis) surfaces
      // this topic as "needs practice" since it's attempted but not correct.
      setStreak(0)
    }
    // 'partial' is deliberately gentle: attempted, not correct, but no streak break.

    const updatedRecord: SessionRecord = {
      ...currentRecord,
      kidAnswer: selfAssessText,
      isCorrect: grade === 'correct' ? true : grade === 'review' ? false : null,
      selfGrade: grade,
    }
    setCurrentRecord(updatedRecord)
    setSessionRecords((prev) => prev.map((r) => (r.number === currentRecord.number ? updatedRecord : r)))
    setQuestionLocked(true)
    setTimerActive(false)
  }

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleShowAnswer = () => {
    if (currentAnswer) {
      setShowAnswer(true)
    }
  }

  // Rasterizes an inline SVG string to a PNG data URL via an off-screen canvas,
  // so jsPDF can embed it as an image (jsPDF has no native SVG support). Renders
  // at 3x the SVG's declared size for crisper output at print resolution.
  const svgToPngDataUrl = (svgString: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const svg64 = btoa(unescape(encodeURIComponent(svgString)))
        const img = new Image()
        img.onload = () => {
          try {
            const scale = 3
            const width = img.naturalWidth || img.width || 300
            const height = img.naturalHeight || img.height || 100
            const canvas = document.createElement('canvas')
            canvas.width = width * scale
            canvas.height = height * scale
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              reject(new Error('Canvas 2D context unavailable'))
              return
            }
            // White background — SVGs have no fill of their own and jsPDF images are opaque.
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/png'))
          } catch (err) {
            reject(err instanceof Error ? err : new Error('SVG rasterization failed'))
          }
        }
        img.onerror = () => reject(new Error('SVG failed to load as an image'))
        img.src = `data:image/svg+xml;base64,${svg64}`
      } catch (err) {
        reject(err instanceof Error ? err : new Error('SVG encoding failed'))
      }
    })
  }

  // Writes a question's text to the PDF, rendering any embedded [[TALLY_SVG]]
  // diagram as an actual image (never as raw markup). Falls back to a note if
  // the SVG can't be parsed or rasterized. Returns the updated yPosition.
  const writeQuestionWithDiagram = async (doc: jsPDF, question: string, yStart: number): Promise<number> => {
    let yPosition = yStart
    const sentinel = '[[TALLY_SVG]]'
    const sentinelIdx = question.indexOf(sentinel)

    if (sentinelIdx === -1) {
      const questionLines = doc.splitTextToSize(sanitizePDFText(question), 170)
      doc.text(questionLines, 20, yPosition)
      return yPosition + questionLines.length * 5 + 5
    }

    const textBefore = sanitizePDFText(question.slice(0, sentinelIdx).trim())
    const svgAndAfter = question.slice(sentinelIdx + sentinel.length)
    const svgCloseIdx = svgAndAfter.indexOf('</svg>')

    if (textBefore) {
      const beforeLines = doc.splitTextToSize(textBefore, 170)
      doc.text(beforeLines, 20, yPosition)
      yPosition += beforeLines.length * 5 + 5
    }

    if (svgCloseIdx === -1) {
      doc.setFont('helvetica', 'italic')
      doc.text('(diagram could not be included)', 20, yPosition)
      doc.setFont('helvetica', 'normal')
      return yPosition + 7
    }

    const rawSvg = svgAndAfter.slice(0, svgCloseIdx + 6)
    const textAfter = sanitizePDFText(svgAndAfter.slice(svgCloseIdx + 6).trim())
    const safeSvg = sanitizeSVG(rawSvg)

    let embedded = false
    if (safeSvg) {
      try {
        const pngDataUrl = await svgToPngDataUrl(safeSvg)
        const dims = safeSvg.match(/width="([\d.]+)"\s+height="([\d.]+)"/)
        const svgW = dims ? parseFloat(dims[1]) : 300
        const svgH = dims ? parseFloat(dims[2]) : 100
        const maxWidthPt = 120
        const imgWidthPt = Math.min(maxWidthPt, svgW)
        const imgHeightPt = imgWidthPt * (svgH / svgW)

        if (yPosition + imgHeightPt > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.addImage(pngDataUrl, 'PNG', 20, yPosition, imgWidthPt, imgHeightPt)
        yPosition += imgHeightPt + 8
        embedded = true
      } catch {
        embedded = false
      }
    }

    if (!embedded) {
      doc.setFont('helvetica', 'italic')
      doc.text('(diagram could not be included)', 20, yPosition)
      doc.setFont('helvetica', 'normal')
      yPosition += 7
    }

    if (textAfter) {
      const afterLines = doc.splitTextToSize(textAfter, 170)
      doc.text(afterLines, 20, yPosition)
      yPosition += afterLines.length * 5 + 5
    }

    return yPosition
  }

  const exportPDF = async () => {
    setPdfExporting(true)
    try {
      const doc = new jsPDF()
      const endedAt = new Date()

      doc.setFontSize(20)
      doc.text("Class 4 Mathematics Practice Session Report", 20, 20)

      doc.setFontSize(12)
      doc.text(`Session Start: ${sessionStartedAt.current.toLocaleString()}`, 20, 35)
      doc.text(`Session End: ${endedAt.toLocaleString()}`, 20, 45)
      doc.text(`Questions Generated: ${questionsGenerated}`, 20, 55)
      doc.text(`Correct Answers: ${correctAnswers}`, 20, 65)

      let yPosition = 80
      for (const record of sessionRecords) {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.text(`Question ${record.number} - ${record.difficulty} - ${record.topic}`, 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        yPosition = await writeQuestionWithDiagram(doc, record.question, yPosition)

        if (yPosition > 260) {
          doc.addPage()
          yPosition = 20
        }

        if (record.selfAssess) {
          const explanationLines = doc.splitTextToSize(
            `Your explanation: ${sanitizePDFText(record.kidAnswer || "No explanation written")}`,
            170,
          )
          doc.text(explanationLines, 20, yPosition)
          yPosition += explanationLines.length * 5 + 5

          const selfGradeText =
            record.selfGrade === "correct"
              ? "Self-graded: I got it right"
              : record.selfGrade === "partial"
              ? "Self-graded: Partly right"
              : record.selfGrade === "review"
              ? "Self-graded: I need to review this"
              : "Self-graded: Not graded"
          doc.text(selfGradeText, 20, yPosition)
          yPosition += 7

          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }

          const modelAnswerLines = doc.splitTextToSize(sanitizePDFText(record.modelAnswer || ""), 160)
          const boxHeight = Math.max(20, modelAnswerLines.length * 5 + 10)
          doc.setFillColor(255, 247, 214)
          doc.rect(20, yPosition, 170, boxHeight, "F")
          doc.setTextColor(15, 81, 50)
          doc.text("Model Answer:", 25, yPosition + 6)
          doc.text(modelAnswerLines, 25, yPosition + 12)
          doc.setTextColor(0, 0, 0)
          yPosition += boxHeight + 5
          continue
        }

        doc.text(`Child's Answer: ${sanitizePDFText(record.kidAnswer || "No answer entered")}`, 20, yPosition)
        yPosition += 7

        const resultText = record.isCorrect === true ? "Correct" : record.isCorrect === false ? "Incorrect" : "Not checked"
        doc.text(`Result: ${resultText}`, 20, yPosition)
        yPosition += 7

        if (record.attempts.length > 0) {
          doc.text("Attempts:", 20, yPosition)
          yPosition += 5
          record.attempts.forEach((attempt, idx) => {
            doc.text(`  Attempt ${idx + 1}: ${sanitizePDFText(attempt.answer)} (${attempt.result})`, 20, yPosition)
            yPosition += 5
          })
        }

        let answerText = `Answer: ${sanitizePDFText(record.correctAnswer)}`
        if (record.difficulty === "Hard") {
          answerText += `\n\n${sanitizePDFText(record.working)}`
        }
        const answerLines = doc.splitTextToSize(answerText, 160)
        const answerBoxHeight = Math.max(20, answerLines.length * 5 + 10)

        if (yPosition + answerBoxHeight > 280) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFillColor(255, 247, 214)
        doc.rect(20, yPosition, 170, answerBoxHeight, "F")
        doc.setTextColor(15, 81, 50)
        doc.text(answerLines, 25, yPosition + 5)
        doc.setTextColor(0, 0, 0)
        yPosition += answerBoxHeight + 5
      }

      doc.save(`math_session_${endedAt.getTime()}.pdf`)
    } finally {
      setPdfExporting(false)
    }
  }

  const getWeaknessAnalysis = () => {
    const strong: string[] = []
    const weak: string[] = []
    const neutral: string[] = []
    for (const topic of Object.keys(topicAttempted)) {
      if (topicAttempted[topic] < 2) continue
      const accuracy = (topicCorrect[topic] ?? 0) / topicAttempted[topic]
      if (accuracy >= 0.75) strong.push(topic)
      else if (accuracy < 0.5) weak.push(topic)
      else neutral.push(topic)
    }
    return { strong, weak, neutral }
  }

  const sanitizePDFText = (text: string) =>
    text
      .replace(/₹/g, 'Rs.')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/°/g, ' degrees')
      .replace(/×/g, 'x')
      .replace(/÷/g, '/')
      .replace(/[−–—]/g, '-')
      .replace(/≤/g, '<=')
      .replace(/≥/g, '>=')
      .replace(/≠/g, '!=')
      .replace(/π/g, 'pi')
      .replace(/∞/g, 'Infinite')
      .replace(/½/g, '1/2')
      .replace(/¼/g, '1/4')
      .replace(/¾/g, '3/4')

  const buildWorksheetPDF = (
    questions: { number: number; question: string; answer: string; working: string }[],
    wsDifficulty: string,
    wsTopic: string,
    wsCurriculum: string,
  ) => {
    const doc = new jsPDF()
    const dateStr = new Date().toLocaleDateString()
    const safeDateStr = new Date().toISOString().split('T')[0]
    const footer = 'Maths Practice — studyzone.co.in'
    const count = questions.length

    const perQuestionTime =
      wsDifficulty === 'Easy' ? 0.75 :
      wsDifficulty === 'Medium' ? 1.5 :
      wsDifficulty === 'Hard' ? 2 :
      1.375 // Mixed: (0.3×0.75) + (0.5×1.5) + (0.2×2)
    const totalMinutes = Math.ceil(count * perQuestionTime / 5) * 5

    const sanitizeText = sanitizePDFText

    // ── PAGE 1: Question sheet ──────────────────────────────────────
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Class 4 Mathematics Worksheet', 105, 20, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Curriculum: ${wsCurriculum} | Difficulty: ${wsDifficulty} | Topic: ${wsTopic} | Time: ${totalMinutes} mins | Date: ${dateStr}`, 105, 30, { align: 'center' })

    doc.setDrawColor(200, 200, 200)
    doc.line(15, 34, 195, 34)

    doc.text(`Name: _________________ Class: _______ Score: ___ / ${count}`, 15, 42)
    doc.line(15, 46, 195, 46)

    let y = 56
    questions.forEach((q) => {
      if (y > 258) { doc.addPage(); y = 20 }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`${q.number}.`, 15, y)
      doc.setFont('helvetica', 'normal')
      const qLines = doc.splitTextToSize(sanitizeText(q.question), 163)
      doc.text(qLines, 24, y)
      y += qLines.length * 6

      doc.setDrawColor(210, 210, 210)
      for (let i = 0; i < 3; i++) {
        y += 9
        doc.line(24, y, 190, y)
      }
      y += 10
    })

    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text(footer, 105, 290, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    doc.save(`worksheet_${wsDifficulty}_${safeDateStr}.pdf`)
  }

  const buildAnswerKeyPDF = (
    questions: { number: number; question: string; answer: string; working: string }[],
    wsDifficulty: string,
    wsTopic: string,
    wsCurriculum: string,
  ) => {
    const doc = new jsPDF()
    const dateStr = new Date().toLocaleDateString()
    const safeDateStr = new Date().toISOString().split('T')[0]

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Answer Key — Class 4 Mathematics Worksheet', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Curriculum: ${wsCurriculum} | Difficulty: ${wsDifficulty} | Topic: ${wsTopic} | Date: ${dateStr}`,
      105, 30, { align: 'center' },
    )

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 0, 0)
    doc.text('TEACHER COPY — NOT FOR STUDENTS', 105, 40, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    doc.setDrawColor(200, 200, 200)
    doc.line(15, 44, 195, 44)

    let y = 54
    questions.forEach((q) => {
      if (y > 270) { doc.addPage(); y = 20 }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Q${q.number}: `, 15, y)
      doc.setFont('helvetica', 'normal')
      const ansLines = doc.splitTextToSize(sanitizePDFText(q.answer), 155)
      doc.text(ansLines, 30, y)
      y += Math.max(ansLines.length * 6, 7)

      if (wsDifficulty === 'Hard' && q.working) {
        doc.setFontSize(9)
        doc.setTextColor(120, 120, 120)
        const workLines = doc.splitTextToSize(sanitizePDFText(q.working), 160)
        doc.text(workLines, 30, y)
        doc.setTextColor(0, 0, 0)
        y += workLines.length * 5 + 3
      }

      y += 4
    })

    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('StudyZone — studyzone.co.in', 105, 290, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    doc.save(`answer_key_${wsDifficulty}_${safeDateStr}.pdf`)
  }

  const generateWorksheet = async (withAnswerKey = false) => {
    setWorksheetLoading(true)
    try {
      type WQuestion = { number: number; question: string; answer: string; working: string }
      let questions: WQuestion[]
      const topicParam = wseTopic === 'Random' ? undefined : wseTopic

      if (wseDifficulty === 'Random') {
        const easyCount = Math.round(wseCount * 0.3)
        const mediumCount = Math.round(wseCount * 0.5)
        const hardCount = wseCount - easyCount - mediumCount

        const post = (difficulty: string, count: number) =>
          fetch('/api/generate-worksheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ difficulty, topic: topicParam, count, curriculum: worksheetCurriculum }),
          }).then((r) => { if (!r.ok) throw new Error('Failed'); return r.json() })

        const [easyData, mediumData, hardData] = await Promise.all([
          post('Easy', easyCount),
          post('Medium', mediumCount),
          post('Hard', hardCount),
        ])

        const combined: WQuestion[] = [...easyData.questions, ...mediumData.questions, ...hardData.questions]
        for (let i = combined.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [combined[i], combined[j]] = [combined[j], combined[i]]
        }
        questions = combined.map((q, idx) => ({ ...q, number: idx + 1 }))
      } else {
        const response = await fetch('/api/generate-worksheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ difficulty: wseDifficulty, topic: topicParam, count: wseCount, curriculum: worksheetCurriculum }),
        })
        if (!response.ok) throw new Error('Failed')
        const data = await response.json()
        questions = data.questions
      }

      const displayDifficulty = wseDifficulty === 'Random' ? 'Mixed' : wseDifficulty
      buildWorksheetPDF(questions, displayDifficulty, wseTopic, worksheetCurriculum)
      if (withAnswerKey) buildAnswerKeyPDF(questions, displayDifficulty, wseTopic, worksheetCurriculum)
      setShowWorksheetModal(false)
    } catch {
      // leave modal open so user can retry
    } finally {
      setWorksheetLoading(false)
    }
  }

  type MockQuestion = { question: string; answer: string; working: string; options?: string[] }
  type MockSections = { VSA: MockQuestion[]; SA1: MockQuestion[]; SA2: MockQuestion[]; LA: MockQuestion[] }
  type MockSectionMeta = { count: number; marksEach: number; minutesEach: number }
  type MockStructure = { VSA: MockSectionMeta; SA1: MockSectionMeta; SA2: MockSectionMeta; LA: MockSectionMeta }

  const buildMockExamPDF = (
    sections: MockSections,
    structure: MockStructure,
    totalMarks: number,
    totalTime: number,
    examCurriculum: string,
  ) => {
    const doc = new jsPDF()
    const safeDateStr = new Date().toISOString().split('T')[0]
    const footerText = 'StudyZone — studyzone.co.in'
    let y = 0
    let pageNum = 1

    const addFooter = () => {
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(footerText, 105, 290, { align: 'center' })
      doc.text(`Page ${pageNum}`, 195, 290, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }

    const checkPage = (needed = 20) => {
      if (y + needed > 270) {
        addFooter()
        doc.addPage()
        pageNum++
        y = 20
      }
    }

    // SVG-sentinel questions can't render in jsPDF — filtered server-side already,
    // but re-filtered here defensively (mirrors app/api/generate-worksheet).
    const clean = (qs: MockQuestion[]) => qs.filter((q) => !q.question.includes('[[TALLY_SVG]]'))
    const secVSA = clean(sections.VSA)
    const secSA1 = clean(sections.SA1)
    const secSA2 = clean(sections.SA2)
    const secLA = clean(sections.LA)

    // ── Header ──
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('StudyZone Mock Examination', 105, 20, { align: 'center' })

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.text(`Class 4 Mathematics — ${examCurriculum}`, 105, 28, { align: 'center' })

    doc.setDrawColor(180, 180, 180)
    doc.line(15, 33, 195, 33)

    doc.setFontSize(11)
    doc.text('Name: ________________________', 15, 41)
    doc.text('Date: ___________', 105, 41)
    doc.text(`Time: ${totalTime} minutes`, 15, 48)
    doc.text(`Maximum Marks: ${totalMarks}`, 105, 48)

    doc.setDrawColor(180, 180, 180)
    doc.line(15, 53, 195, 53)
    y = 60

    // ── Instructions box ──
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('General Instructions:', 15, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const instructions = [
      '1. All questions are compulsory.',
      `2. Section A carries ${structure.VSA.marksEach} mark each.`,
      `3. Section B carries ${structure.SA1.marksEach} marks each.`,
      `4. Section C carries ${structure.SA2.marksEach} marks each.`,
      `5. Section D carries ${structure.LA.marksEach} marks each.`,
      '6. Show your working where required.',
    ]
    instructions.forEach((line) => { doc.text(line, 15, y); y += 5.5 })
    y += 3
    doc.setDrawColor(180, 180, 180)
    doc.line(15, y, 195, y)
    y += 9

    const sectionHeader = (label: string, total: number) => {
      checkPage(20)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(label, 15, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`${total} marks total`, 195, y, { align: 'right' })
      doc.setTextColor(0, 0, 0)
      y += 7
    }

    const renderSection = (
      label: string,
      questions: MockQuestion[],
      marksEach: number,
      blankLines: number,
      startNumber: number,
      mcqSection = false,
    ) => {
      sectionHeader(label, questions.length * marksEach)
      if (mcqSection) {
        checkPage(8)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.text('Choose the correct option and write its letter (A/B/C/D).', 15, y)
        doc.setFont('helvetica', 'normal')
        y += 7
      }
      questions.forEach((q, i) => {
        const hasOptions = mcqSection && !!q.options && q.options.length > 0
        checkPage(16 + (hasOptions ? 12 : blankLines * 7))
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`${startNumber + i}.`, 15, y)
        doc.setFont('helvetica', 'normal')
        const qLines = doc.splitTextToSize(sanitizePDFText(q.question), 148)
        doc.text(qLines, 24, y)
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text(`[${marksEach} mark${marksEach > 1 ? 's' : ''}]`, 195, y, { align: 'right' })
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        y += qLines.length * 5 + 3
        if (hasOptions) {
          const letters = ['A', 'B', 'C', 'D']
          const optText = q.options!.map((opt, oi) => `(${letters[oi]}) ${sanitizePDFText(opt)}`).join('     ')
          const optLines = doc.splitTextToSize(optText, 166)
          doc.text(optLines, 24, y)
          y += optLines.length * 5 + 6
          doc.text('Answer: ______', 24, y)
          y += 8
        } else {
          doc.setDrawColor(210, 210, 210)
          for (let ln = 0; ln < blankLines; ln++) {
            y += 7
            doc.line(24, y, 190, y)
          }
          y += 8
        }
      })
    }

    renderSection('SECTION A — Very Short Answer (VSA)', secVSA, structure.VSA.marksEach, 1, 1, true)
    renderSection('SECTION B — Short Answer I (SA1)', secSA1, structure.SA1.marksEach, 2, secVSA.length + 1)
    renderSection('SECTION C — Short Answer II (SA2)', secSA2, structure.SA2.marksEach, 3, secVSA.length + secSA1.length + 1)
    renderSection('SECTION D — Long Answer (LA)', secLA, structure.LA.marksEach, 5, secVSA.length + secSA1.length + secSA2.length + 1)

    addFooter()
    doc.save(`mock_exam_${examCurriculum}_${safeDateStr}.pdf`)
  }

  const buildMockExamAnswerKey = (
    sections: MockSections,
    structure: MockStructure,
    totalMarks: number,
    examCurriculum: string,
  ) => {
    const doc = new jsPDF()
    const safeDateStr = new Date().toISOString().split('T')[0]
    let y = 20
    let pageNum = 1

    const addFooter = () => {
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text('StudyZone — studyzone.co.in', 105, 290, { align: 'center' })
      doc.text(`Page ${pageNum}`, 195, 290, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }

    const checkPage = (needed = 16) => {
      if (y + needed > 270) {
        addFooter()
        doc.addPage()
        pageNum++
        y = 20
      }
    }

    const clean = (qs: MockQuestion[]) => qs.filter((q) => !q.question.includes('[[TALLY_SVG]]'))
    const secVSA = clean(sections.VSA)
    const secSA1 = clean(sections.SA1)
    const secSA2 = clean(sections.SA2)
    const secLA = clean(sections.LA)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 0, 0)
    doc.text('Answer Key — TEACHER COPY', 105, y, { align: 'center' })
    y += 7
    doc.setFontSize(11)
    doc.text('NOT FOR STUDENTS', 105, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 9

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Class 4 Mathematics — ${examCurriculum} Mock Examination Answer Key`, 105, y, { align: 'center' })
    y += 6
    doc.setFontSize(10)
    doc.text(`Total Marks: ${totalMarks}`, 105, y, { align: 'center' })
    y += 5
    doc.setDrawColor(180, 180, 180)
    doc.line(15, y, 195, y)
    y += 8

    const akSection = (
      label: string,
      marksEach: number,
      questions: MockQuestion[],
      startNumber: number,
      showWorking: boolean,
      mcqSection = false,
    ) => {
      checkPage(16)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}  (${questions.length * marksEach} marks)`, 15, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      questions.forEach((q, i) => {
        checkPage(showWorking ? 20 : 10)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`Q${startNumber + i} [${marksEach} mark${marksEach > 1 ? 's' : ''}]:`, 15, y)
        doc.setFont('helvetica', 'normal')
        let answerDisplay = q.answer
        if (mcqSection && q.options && q.options.length > 0) {
          const letters = ['A', 'B', 'C', 'D']
          const idx = q.options.findIndex((o) => o === q.answer)
          if (idx >= 0) answerDisplay = `(${letters[idx]}) ${q.answer}`
        }
        const ansLines = doc.splitTextToSize(sanitizePDFText(answerDisplay), 128)
        doc.text(ansLines, 64, y)
        y += Math.max(ansLines.length * 5, 5) + 2
        if (showWorking && q.working) {
          doc.setFontSize(9)
          doc.setTextColor(100, 100, 100)
          const workLines = doc.splitTextToSize(sanitizePDFText(q.working), 160)
          doc.text(workLines, 24, y)
          doc.setTextColor(0, 0, 0)
          y += workLines.length * 4.5 + 3
        }
        y += 2
      })
      y += 4
      doc.setDrawColor(220, 220, 220)
      doc.line(15, y, 195, y)
      y += 6
    }

    akSection('Section A (VSA)', structure.VSA.marksEach, secVSA, 1, false, true)
    akSection('Section B (SA1)', structure.SA1.marksEach, secSA1, secVSA.length + 1, false)
    akSection('Section C (SA2)', structure.SA2.marksEach, secSA2, secVSA.length + secSA1.length + 1, true)
    akSection('Section D (LA)', structure.LA.marksEach, secLA, secVSA.length + secSA1.length + secSA2.length + 1, true)

    addFooter()
    doc.save(`mock_exam_answer_key_${examCurriculum}_${safeDateStr}.pdf`)
  }

  const generateMockExam = async (withAnswerKey: boolean) => {
    setMockExamLoading(true)
    try {
      const topicsParam = mockExamTopics.includes('All Topics') ? [] : mockExamTopics
      const response = await fetch('/api/generate-mock-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculum: mockExamCurriculum, topics: topicsParam, totalMarks: mockExamTotalMarks }),
      })
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      buildMockExamPDF(data.sections, data.structure, data.totalMarks, data.totalTime, data.curriculum)
      if (withAnswerKey) buildMockExamAnswerKey(data.sections, data.structure, data.totalMarks, data.curriculum)
      setShowMockExamModal(false)
    } catch {
      // leave modal open so user can retry
    } finally {
      setMockExamLoading(false)
    }
  }

  const toggleMockExamTopic = (t: string) => {
    if (t === 'All Topics') {
      setMockExamTopics(['All Topics'])
      return
    }
    setMockExamTopics((prev) => {
      const withoutAll = prev.filter((p) => p !== 'All Topics')
      const next = withoutAll.includes(t) ? withoutAll.filter((p) => p !== t) : [...withoutAll, t]
      return next.length === 0 ? ['All Topics'] : next
    })
  }

  const handleFeedbackSubmit = async () => {
    setFeedbackSubmitting(true)
    setFeedbackError("")
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedbackName,
          rating: feedbackRating,
          message: feedbackMessage,
          curriculum,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedbackSubmitted(true)
        setTimeout(() => {
          setFeedbackSubmitted(false)
          setFeedbackName("")
          setFeedbackRating(0)
          setFeedbackMessage("")
          setHoverRating(0)
        }, 5000)
      } else {
        setFeedbackError(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setFeedbackError("Something went wrong. Please try again.")
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const sanitizeSVG = (svg: string): string => {
    const start = svg.indexOf('<svg')
    const end = svg.indexOf('</svg>') + 6
    if (start === -1 || end === 5) return ''
    const svgContent = svg.substring(start, end)
    return svgContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\bon\w+\s*=/gi, 'data-removed=')
      .replace(/javascript:/gi, '')
  }

  const handleInlineShare = async () => {
    const inlineAccuracy = questionsGenerated > 0 ? Math.round((correctAnswers / questionsGenerated) * 100) : 0
    const shareText = `I scored ${correctAnswers}/${questionsGenerated} (${inlineAccuracy}%) in Class 4 ${curriculum} Maths on StudyZone! 🎯`
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title: "My Maths Score on StudyZone", text: shareText, url: "https://studyzone.co.in" })
        setInlineShareFeedback("Shared! ✓")
        setTimeout(() => setInlineShareFeedback(""), 2000)
      } catch (err) {
        if ((err as DOMException)?.name !== "AbortError") {
          navigator.clipboard.writeText(`${shareText} studyzone.co.in`)
          setInlineShareFeedback("Copied! ✓")
          setTimeout(() => setInlineShareFeedback(""), 2000)
        }
      }
    } else {
      navigator.clipboard.writeText(`${shareText} studyzone.co.in`).then(() => {
        setInlineShareFeedback("Copied! ✓")
        setTimeout(() => setInlineShareFeedback(""), 2000)
      })
    }
  }

  return (
    <div className="min-h-screen">
      <a
        href="#quiz-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-blue-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-bold"
      >
        Skip to quiz
      </a>
      {/* BREAK REMINDER */}
      {sessionStartWarning && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-amber-50 border-b border-amber-200 py-2 px-4 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            👋 You&apos;ve been practising for 20 minutes — great effort! Consider taking a short break.
          </p>
          <button
            onClick={() => setSessionStartWarning(false)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex-shrink-0"
          >
            Got it ✓
          </button>
        </div>
      )}

      {/* STICKY NAVBAR */}
      <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="font-heading text-xl font-bold text-blue-700">MathsQuiz</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5"
            >
              How it works
            </button>
            <button
              onClick={() => faqRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5"
            >
              FAQ
            </button>
            <button
              onClick={() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5"
            >
              Feedback
            </button>
            <a
              href="/privacy"
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5"
            >
              Privacy
            </a>
            <a
              href="/about"
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5"
            >
              About
            </a>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={() => {
                const next = !soundEnabled
                setSoundEnabled(next)
                localStorage.setItem('soundEnabled', String(next))
              }}
              title="Toggle sound"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white shadow-sm"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleDarkMode}
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

      <div className="p-4 md:p-8">

        {/* HERO */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="rounded-2xl p-8 bg-gradient-to-r from-[#2563eb] to-[#7c3aed]">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="inline-block mb-3 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                  ✨ Free for all students
                </span>
                <h2 className="font-heading text-4xl font-bold text-white mb-3 leading-tight">
                  Make Maths Fun!
                </h2>
                <p className="text-white/80 text-lg mb-6 leading-relaxed">
                  Interactive practice for Class 4 · CBSE · ICSE · IGCSE
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => quizRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Start Practising →
                  </button>
                  <button
                    onClick={() => {
                      quizRef.current?.scrollIntoView({ behavior: 'smooth' })
                      setWorksheetCurriculum(curriculum)
                      setTimeout(() => setShowWorksheetModal(true), 400)
                    }}
                    className="bg-transparent text-white font-bold px-5 py-2.5 rounded-xl border-2 border-white hover:bg-white/10 transition-colors"
                  >
                    Get Worksheet
                  </button>
                  <button
                    onClick={() => {
                      quizRef.current?.scrollIntoView({ behavior: 'smooth' })
                      setMockExamCurriculum(curriculum)
                      setTimeout(() => setShowMockExamModal(true), 400)
                    }}
                    className="bg-white/15 text-white font-bold px-5 py-2.5 rounded-xl border border-white/40 hover:bg-white/25 transition-colors"
                  >
                    Mock Exam 📝
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                {[
                  { value: '19', label: 'Topics covered' },
                  { value: '3', label: 'Difficulty levels' },
                  { value: '∞', label: 'Questions' },
                  { value: '📄', label: 'PDF export' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/15 rounded-xl p-4 text-center min-w-[110px]">
                    <p className="text-3xl font-bold text-white leading-none mb-1">{stat.value}</p>
                    <p className="text-white/70 text-xs font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div ref={howItWorksRef} className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
          <h3 className="font-heading text-2xl font-bold text-blue-700 text-center mb-6">How it works</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            {[
              { step: '1', emoji: '🎯', title: 'Pick a Topic', desc: 'Choose from 19 maths topics or go Random. Select Easy, Medium or Hard.' },
              { step: '2', emoji: '✏️', title: 'Answer Questions', desc: 'Type your answer and press Enter. Get instant feedback with audio and confetti!' },
              { step: '3', emoji: '📄', title: 'Track Progress', desc: 'View your session history, export a PDF report, or download a printable worksheet.' },
            ].map((s) => (
              <div key={s.step} className="relative flex-1 bg-white rounded-xl p-5 shadow-sm text-center">
                <span className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {s.step}
                </span>
                <p className="text-4xl mb-2">{s.emoji}</p>
                <p className="font-bold text-blue-700 mb-1">{s.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div ref={faqRef} className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
          <h3 className="font-heading text-2xl font-bold text-blue-700 text-center mb-2">Frequently Asked Questions</h3>
          <p className="text-center text-sm text-gray-500 mb-6">Everything parents and teachers need to know</p>
          <div>
            {[
              { q: "Is this completely free?", a: "Yes, completely free. No login, no subscription, no hidden fees. Just open and start practising." },
              { q: "Which syllabus does this follow?", a: "Supports three curricula — CBSE, ICSE and IGCSE Cambridge Primary Stage 4. Switch between them using the Curriculum selector. Each curriculum has its own topic set and question style." },
              { q: "Does my child need to create an account?", a: "No account or login required. Just open the website, pick a topic and start answering questions instantly." },
              { q: "Can teachers use this in the classroom?", a: "Absolutely. Use the Worksheet Generator to create printable question papers with mixed difficulty levels. Each worksheet includes a suggested completion time." },
              { q: "How many questions are available?", a: "The app generates questions randomly from a large pool across 19 topics and 3 difficulty levels. Questions never repeat within a session so students always get fresh practice." },
              { q: "What age group is this for?", a: "This app is designed for Class 4 students, typically aged 9-10 years. The Easy difficulty is suitable for beginners while Hard questions challenge advanced learners." },
              { q: "Can I track my child's progress?", a: "Yes. The Session History panel shows every question attempted with the child's answer and whether it was correct. You can also export a full PDF report at the end of each session." },
              { q: "Does it work on mobile?", a: "Yes, the app is fully responsive and works on phones, tablets and desktops. No app download needed — just open the website in any browser." },
            ].map((faq, idx, arr) => (
              <div key={idx} className={idx < arr.length - 1 ? "border-b border-gray-200" : ""}>
                <button
                  className="w-full flex items-center justify-between py-4 text-left gap-4"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  aria-expanded={openFaqIndex === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className="font-bold text-blue-700 text-sm sm:text-base">{faq.q}</span>
                  {openFaqIndex === idx
                    ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                <div className={`grid transition-all duration-300 ${openFaqIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div id={`faq-answer-${idx}`} className="overflow-hidden">
                    <p className="text-sm text-gray-600 pb-4 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEEDBACK */}
        <div ref={feedbackRef} className="max-w-6xl mx-auto mb-8 bg-white/60 rounded-2xl p-6">
          <div className="flex justify-center mb-3">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-300">
              👨‍👩‍👧 For Parents &amp; Teachers Only
            </span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-center mb-1" style={{ color: '#2563eb' }}>
            💬 Share Your Feedback
          </h3>
          <p className="text-center text-sm text-gray-500 mb-6">Help us improve StudyZone for students everywhere</p>

          {feedbackSubmitted ? (
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
                    const filled = star <= (hoverRating || feedbackRating)
                    return (
                      <button
                        key={star}
                        onClick={() => { setFeedbackRating(star); setFeedbackTouched(true) }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                        aria-label={`${star} ${star === 1 ? 'star' : 'stars'} out of 5`}
                        aria-checked={feedbackRating === star}
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
                {feedbackTouched && feedbackRating === 0 && (
                  <p className="text-xs text-amber-600 font-semibold">Please select a rating</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="feedback-name" className="sr-only">Your name</label>
                <input
                  id="feedback-name"
                  type="text"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
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
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="What do you think of StudyZone? Any suggestions for improvement?"
                  rows={4}
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 resize-none"
                />
              </div>

              {feedbackError && (
                <p className="text-sm font-semibold text-red-600 text-center" aria-live="polite">{feedbackError}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackMessage.trim() || feedbackRating === 0 || feedbackSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {feedbackSubmitting ? (
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

        <div className="max-w-6xl mx-auto">
        {/* MAIN CARD */}
        <div ref={quizRef} id="quiz-section" className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">

          {/* CURRICULUM SELECTOR */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              Curriculum
            </label>
            <div className="flex gap-2" role="group" aria-label="Select curriculum">
              {(['CBSE', 'ICSE', 'IGCSE'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurriculum(c)}
                  aria-pressed={curriculum === c}
                  className={`rounded-full px-4 py-2 font-bold text-sm transition ${
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

          {/* MCQ MODE TOGGLE */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Answer Mode</span>
            <div
              className="inline-flex rounded-full border border-blue-200 bg-blue-50 p-1"
              title="Switch between typing answers and choosing from options"
            >
              <button
                onClick={() => {
                  setMcqMode(false)
                  localStorage.setItem('mcq-mode', 'false')
                }}
                aria-pressed={!mcqMode}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  !mcqMode ? 'bg-[#2563eb] text-white' : 'text-blue-700'
                }`}
              >
                ✏️ Typed
              </button>
              <button
                onClick={() => {
                  setMcqMode(true)
                  localStorage.setItem('mcq-mode', 'true')
                  if (currentQuestion && currentAnswer && !questionLocked) {
                    const options = buildMCQOptions({ question: currentQuestion, answer: currentAnswer, working: currentWorking })
                    setMcqOptions(options ?? [])
                    setMcqSelected(null)
                    setMcqWrongOptions([])
                  }
                }}
                aria-pressed={mcqMode}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  mcqMode ? 'bg-[#2563eb] text-white' : 'text-blue-700'
                }`}
              >
                🔘 Multiple Choice
              </button>
            </div>
          </div>

          {/* REASONING CADENCE TOGGLE */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">🧠 Reasoning Questions</span>
            <div
              className="inline-flex rounded-full border border-blue-200 bg-blue-50 p-1"
              title="Every 6th question asks you to explain your thinking"
            >
              <button
                onClick={() => {
                  setReasoningEnabled(true)
                  localStorage.setItem('reasoning-enabled', 'true')
                }}
                aria-pressed={reasoningEnabled}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  reasoningEnabled ? 'bg-[#2563eb] text-white' : 'text-blue-700'
                }`}
              >
                On
              </button>
              <button
                onClick={() => {
                  setReasoningEnabled(false)
                  localStorage.setItem('reasoning-enabled', 'false')
                }}
                aria-pressed={!reasoningEnabled}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  !reasoningEnabled ? 'bg-[#2563eb] text-white' : 'text-blue-700'
                }`}
              >
                Off
              </button>
            </div>
          </div>

          {/* CONTROLS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            {/* Difficulty selector */}
            <div className="rounded-xl shadow-sm border-l-4 border-blue-500 bg-blue-50 p-3">
              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                aria-label="Select difficulty level"
                className="w-full p-2 text-base font-semibold rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-200 cursor-pointer"
              >
                <option value="Random">Random</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Topic selector */}
            <div className="rounded-xl shadow-sm border-l-4 border-purple-500 bg-purple-50 p-3">
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Select topic"
                className="w-full p-2 text-base font-semibold rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-purple-200 cursor-pointer"
              >
                {availableTopics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Score display */}
            <div className="rounded-xl shadow-sm bg-amber-50 border border-amber-200 p-3 flex flex-col justify-center text-center">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Score</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg">⭐</span>
                <span className="text-lg font-bold text-amber-700">
                  {correctAnswers} / {questionsGenerated} correct
                </span>
              </div>
              {streak >= 3 && (
                <p className={`mt-1 font-bold text-amber-600 ${streak >= 5 ? "text-base" : "text-sm"}`}>
                  🔥 {streak} streak!
                </p>
              )}
              {correctAnswers > 0 && (
                <button
                  onClick={handleInlineShare}
                  className="mt-2 text-xs font-bold px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-500 text-white transition-colors self-center"
                >
                  {inlineShareFeedback || "Share 📤"}
                </button>
              )}
            </div>

            {/* Timer with progress bar */}
            <div className="rounded-xl shadow-sm bg-gray-50 border border-gray-200 p-3">
              <div aria-live="polite" className="sr-only">
                {timeLeft === 20 && timerActive ? 'Warning: 20 seconds remaining' : ''}
                {timeLeft === 10 && timerActive ? 'Warning: 10 seconds remaining' : ''}
                {timeLeft === 0 ? 'Time is up' : ''}
              </div>
              {timerDisabled || currentSelfAssess ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-gray-500">
                    {currentSelfAssess && !timerDisabled ? "Take your time ✍️" : "Relaxed mode"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span
                    className={`text-xl font-bold tabular-nums ${
                      timeLeft <= 10
                        ? "text-red-600"
                        : timeLeft <= 20
                        ? "text-amber-600"
                        : "text-gray-700"
                    }`}
                  >
                    {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
              {!timerDisabled && !currentSelfAssess && (
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                      timeLeft > 30
                        ? "bg-green-500"
                        : timeLeft > 15
                        ? "bg-amber-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  const next = !timerDisabled
                  setTimerDisabled(next)
                  localStorage.setItem('timer-disabled', String(next))
                  if (next) setTimerActive(false)
                }}
                title="Some children need more time. Toggle timer off for a relaxed practice session."
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors text-center"
              >
                ⏱️ Timer {timerDisabled ? 'Off' : 'On'}
              </button>
            </div>
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: Question + Input + Feedback */}
            <div className="lg:col-span-2">

              {/* Question area */}
              {apiError ? (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 mb-4 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <span className="text-5xl mb-3">😕</span>
                  <p className="font-heading text-xl font-bold text-amber-800 mb-2">{apiError}</p>
                  <button
                    onClick={() => {
                      setApiError(null)
                      generateQuestion()
                    }}
                    className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-2xl text-base transition-all duration-200 shadow-md hover:scale-105"
                  >
                    Try Again
                  </button>
                </div>
              ) : !currentQuestion && !isGenerating ? (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 mb-4 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <span className="text-5xl mb-3">🎯</span>
                  <p className="font-heading text-2xl font-bold text-blue-700 mb-1">Ready to start?</p>
                  <p className="text-gray-500 mb-5 text-sm">
                    Choose difficulty and topic, then click New Question!
                  </p>
                  <span className="text-3xl animate-bounce">👇</span>
                </div>
              ) : (
                <div
                  className={`rounded-2xl p-6 mb-4 border-l-8 transition-all ${
                    currentDifficulty === "Easy"
                      ? "border-blue-400 bg-blue-50"
                      : currentDifficulty === "Medium"
                      ? "border-amber-400 bg-amber-50"
                      : "border-purple-500 bg-purple-50"
                  } ${feedback === "Correct" ? "animate-celebrate" : ""}`}
                >
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        currentDifficulty === "Easy"
                          ? "bg-blue-200 text-blue-700"
                          : currentDifficulty === "Medium"
                          ? "bg-amber-200 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {currentDifficulty}
                    </span>
                    {currentTopic && (
                      <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {currentTopic}
                      </span>
                    )}
                  </div>
                  <div className="min-h-[160px] flex items-center">
                    {isGenerating ? (
                      <p className="text-xl md:text-2xl font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">
                        ✨ Generating question...
                      </p>
                    ) : currentQuestion.includes('[[TALLY_SVG]]') ? (
                      <div className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed w-full">
                        {(() => {
                          const [textBefore, svgAndAfter] = currentQuestion.split('[[TALLY_SVG]]');
                          const svgCloseIdx = svgAndAfter.indexOf('</svg>');
                          if (svgCloseIdx === -1) {
                            return <p className="whitespace-pre-wrap">{currentQuestion.replace('[[TALLY_SVG]]', '')}</p>;
                          }
                          const svgEndIdx = svgCloseIdx + 6;
                          const safeSvg = sanitizeSVG(svgAndAfter.substring(0, svgEndIdx));
                          return (
                            <>
                              <span className="whitespace-pre-wrap">{textBefore}</span>
                              {safeSvg && <div className="my-4 inline-block" dangerouslySetInnerHTML={{ __html: safeSvg }} />}
                              <span className="whitespace-pre-wrap">{svgAndAfter.substring(svgEndIdx)}</span>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xl md:text-2xl font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {currentQuestion}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Answer input: self-assess / MCQ options / typed input */}
              {currentSelfAssess && currentQuestion ? (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-3">
                    ✍️ This one is about your thinking — write how you would solve it, then compare with the model answer.
                  </p>
                  <textarea
                    rows={4}
                    value={selfAssessText}
                    onChange={(e) => setSelfAssessText(e.target.value)}
                    aria-label="Your explanation"
                    placeholder="Write your explanation here..."
                    disabled={questionLocked || isGenerating}
                    className="w-full p-4 text-base font-medium border-2 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed mb-3 shadow-sm transition-colors resize-none border-blue-300"
                  />

                  {!showModelAnswer ? (
                    <button
                      type="button"
                      onClick={() => setShowModelAnswer(true)}
                      disabled={selfAssessText.trim().length < 10 || isGenerating}
                      title={selfAssessText.trim().length < 10 ? "Write your explanation first" : undefined}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                    >
                      <Eye className="w-5 h-5" />
                      Show Model Answer
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your explanation</p>
                        <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{selfAssessText}</p>
                      </div>
                      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-2xl p-4">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Model Answer</p>
                        <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{currentModelAnswer}</p>
                      </div>

                      {!questionLocked ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2 text-center">How did you do?</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelfGrade('correct')}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-3 rounded-xl text-sm transition-colors"
                            >
                              ✅ I got it right
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelfGrade('partial')}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-3 rounded-xl text-sm transition-colors"
                            >
                              🤔 Partly right
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelfGrade('review')}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-3 rounded-xl text-sm transition-colors"
                            >
                              📚 I need to review this
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-sm font-semibold text-gray-500">
                          {selfGrade === 'correct'
                            ? "✅ Recorded — great job!"
                            : selfGrade === 'partial'
                            ? "🤔 Recorded — partly right."
                            : "📚 Recorded — added to topics to review."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : mcqMode && currentQuestion && mcqOptions.length > 0 ? (
                <div
                  role="radiogroup"
                  aria-label="Answer options"
                  onKeyDown={handleMcqKeyDown}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
                >
                  {mcqOptions.map((opt, i) => {
                    const isCorrectOpt = opt === currentAnswer
                    const isWrongPick = mcqWrongOptions.includes(opt)
                    const revealCorrect = questionLocked && isCorrectOpt
                    return (
                      <button
                        key={opt}
                        ref={(el) => { mcqOptionRefs.current[i] = el }}
                        type="button"
                        role="radio"
                        aria-checked={mcqSelected === opt}
                        aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                        disabled={questionLocked || isWrongPick || isGenerating}
                        onClick={() => handleMcqSelect(opt)}
                        className={`min-h-[44px] rounded-xl border-2 px-4 py-3 text-left text-lg font-semibold shadow-sm transition-colors disabled:cursor-not-allowed ${
                          revealCorrect
                            ? "border-green-500 bg-green-100 text-green-800"
                            : isWrongPick
                            ? "border-red-400 bg-red-100 text-red-700 animate-shake"
                            : "border-blue-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <>
                  {mcqMode && currentQuestion && !isGenerating && (
                    <p className="text-sm italic text-gray-500 mb-2">Type your answer for this one</p>
                  )}
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") checkAnswer() }}
                    aria-label="Your answer"
                    placeholder="Type your answer and press Enter..."
                    disabled={questionLocked || !currentQuestion || isGenerating}
                    className={`w-full p-4 text-lg font-semibold border-2 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed mb-4 shadow-sm transition-colors ${
                      feedback.startsWith("Incorrect") && !questionLocked
                        ? "border-red-400 focus:ring-red-300 animate-shake"
                        : "border-blue-300 focus:ring-blue-400"
                    }`}
                  />
                </>
              )}

              {/* Format hint — inferred from the correct answer shape */}
              {!mcqMode && !currentSelfAssess && !questionLocked && currentQuestion && (() => {
                const ans = currentAnswer.toLowerCase();
                if (/\bquotient\b/.test(ans)) {
                  return <p className="text-sm italic text-gray-500 mt-1 mb-3">💡 Write as: Quotient = [number], Remainder = [number]</p>;
                }
                if (/\bprofit\b|\bloss\b/.test(ans)) {
                  return <p className="text-sm italic text-gray-500 mt-1 mb-3">💡 Write as: Profit of Rs.[amount] or Loss of Rs.[amount]</p>;
                }
                if (/\d+\s+\d+\/\d+/.test(ans)) {
                  return <p className="text-sm italic text-gray-500 mt-1 mb-3">💡 Mixed number format: whole number then fraction, e.g. 3 2/5</p>;
                }
                if (ans.includes('/')) {
                  return <p className="text-sm italic text-gray-500 mt-1 mb-3">💡 Write as a fraction, e.g. 3/5</p>;
                }
                if (ans.includes(',') && /^[\d\s,]+$/.test(ans)) {
                  return <p className="text-sm italic text-gray-500 mt-1 mb-3">💡 Write all numbers separated by commas, e.g. 1, 2, 3, 6</p>;
                }
                return null;
              })()}

              {/* Feedback */}
              {feedback && (
                <div className="mb-4">
                  {feedback === "Correct" ? (
                    <div className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-2xl py-4 px-6">
                      <span className="text-3xl">✅</span>
                      <p className="font-heading text-2xl font-bold text-green-600">
                        Correct! Well done!
                      </p>
                    </div>
                  ) : feedback === "Time Up" ? (
                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center">
                      <p className="text-xl font-bold text-amber-700">
                        ⏰ Time&apos;s up! Check the answer below.
                      </p>
                    </div>
                  ) : feedback.startsWith("Incorrect") && !questionLocked ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                      <p className="text-lg font-bold text-red-600 mb-2">{feedback}</p>
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="text-xl">
                            {i < currentAttempts ? "⚫" : "⚪"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center" aria-live="assertive" aria-atomic="true">
                      <p className="text-lg font-bold" style={{ color: feedbackColor }}>
                        {feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Show answer panel */}
              {showAnswer && currentAnswer && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-5 min-h-[120px]">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                    Answer
                  </p>
                  <p className="text-lg font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {currentDifficulty === "Hard"
                      ? `Answer: ${currentAnswer}\n\n${currentWorking}`
                      : `Answer: ${currentAnswer}`}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={generateQuestion}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
              >
                <Play className="w-5 h-5" />
                {isGenerating ? "Generating..." : "New Question"}
              </button>

              {!currentSelfAssess && !(mcqMode && mcqOptions.length > 0) && (
                <button
                  onClick={() => checkAnswer()}
                  disabled={!currentQuestion || questionLocked || isGenerating}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  Check Answer
                </button>
              )}

              {/* Self-assess questions use their own "Show Model Answer" flow inline. */}
              {!currentSelfAssess && (
                <button
                  onClick={handleShowAnswer}
                  disabled={!currentQuestion || isGenerating}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                >
                  <Eye className="w-5 h-5" />
                  Show Answer
                </button>
              )}

              <button
                onClick={exportPDF}
                disabled={sessionRecords.length === 0 || pdfExporting}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
              >
                {pdfExporting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Export PDF
                  </>
                )}
              </button>

              <button
                onClick={() => { setWorksheetCurriculum(curriculum); setShowWorksheetModal(true) }}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Worksheet
              </button>

              <button
                onClick={() => { setMockExamCurriculum(curriculum); setShowMockExamModal(true) }}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Mock Exam
              </button>

              {questionsGenerated >= 3 && (
                <button
                  onClick={() => {
                    const endTime = new Date()
                    setSessionEndTime(endTime)
                    setTimerActive(false)
                    setShowSummary(true)
                    setSessionStartWarning(false)
                  }}
                  className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg"
                >
                  <LogOut className="w-5 h-5" />
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SESSION HISTORY — collapsible, collapsed by default */}
        {sessionRecords.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-heading text-lg font-bold text-gray-700">
                Session History ({sessionRecords.length} question
                {sessionRecords.length !== 1 ? "s" : ""})
              </span>
              {historyOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {historyOpen && (
              <div className="border-t border-gray-100">
                {sessionRecords.map((record, idx) => (
                  <div
                    key={record.number}
                    className={`flex items-center gap-3 px-5 py-3 text-sm ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <span className="font-bold text-gray-400 w-6 text-right flex-shrink-0">
                      #{record.number}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        record.difficulty === "Easy"
                          ? "bg-blue-100 text-blue-700"
                          : record.difficulty === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.topic}
                    </span>
                    <span className="flex-1 text-gray-700 truncate min-w-0">
                      {record.question.length > 60
                        ? record.question.slice(0, 60) + "…"
                        : record.question}
                    </span>
                    <span className="text-gray-500 flex-shrink-0 text-xs">
                      {record.kidAnswer || "—"}
                    </span>
                    <span className="flex-shrink-0 text-base">
                      {record.selfAssess
                        ? record.selfGrade === 'correct'
                          ? "✅"
                          : record.selfGrade === 'partial'
                          ? "🤔"
                          : record.selfGrade === 'review'
                          ? "📚"
                          : "⏳"
                        : record.isCorrect === true
                        ? "✅"
                        : record.isCorrect === false
                        ? "❌"
                        : "⏳"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Performance Insights panel */}
        {(() => {
          const { strong, weak, neutral } = getWeaknessAnalysis()
          const totalWithData = strong.length + weak.length + neutral.length
          if (totalWithData === 0) return null
          const totalAttempted = Object.values(topicAttempted).reduce((a, b) => a + b, 0)
          const totalCorrect = Object.values(topicCorrect).reduce((a, b) => a + b, 0)
          const overallPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0
          return (
            <div className="bg-white/60 rounded-2xl p-6 mb-4">
              <h3 className="font-heading text-lg font-bold text-gray-700 mb-4">📊 Performance Insights</h3>
              <div className="flex flex-col gap-3">
                {strong.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-green-700 w-36 flex-shrink-0">💪 Strong topics:</span>
                    {strong.map((t) => (
                      <span key={t} className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
                {weak.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-red-700 w-36 flex-shrink-0">📚 Needs practice:</span>
                    {weak.map((t) => (
                      <span key={t} className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
                {neutral.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-gray-600 w-36 flex-shrink-0">➡️ Keep going:</span>
                    {neutral.map((t) => (
                      <span key={t} className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Overall: {totalCorrect} correct out of {totalAttempted} attempted ({overallPct}%)
              </p>
            </div>
          )
        })()}

        {/* FOOTER */}
        <footer className="pb-6 px-1 flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              Built with ❤️ for curious minds · Class 4 Mathematics
            </p>
            {visitorCount > 0 && (
              <p className="text-sm text-gray-500">
                🎯 {visitorCount} students have practised here
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
            StudyZone is a practice tool only. It does not assess or reflect a child&apos;s academic capability.
            Real evaluation should be done by qualified teachers.
          </p>
          <p className="text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-600 underline underline-offset-2 transition-colors">Privacy Policy</a>
            {" "}|{" "}
            <a href="/about" className="hover:text-gray-600 underline underline-offset-2 transition-colors">About</a>
          </p>
        </footer>
      </div>
      </div>

      {/* SESSION SUMMARY MODAL */}
      {showSummary && (() => {
        const accuracy = questionsGenerated > 0 ? Math.round((correctAnswers / questionsGenerated) * 100) : 0
        const passed = accuracy >= 70
        const endTime = sessionEndTime ?? new Date()
        const elapsedSecs = Math.round((endTime.getTime() - sessionStartedAt.current.getTime()) / 1000)
        const mins = Math.floor(elapsedSecs / 60)
        const secs = elapsedSecs % 60
        const { strong, weak } = getWeaknessAnalysis()

        const scoreColor = accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'
        const scoreBg = accuracy >= 70 ? 'bg-green-50 border-green-200' : accuracy >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

        const handleShare = async () => {
          const shareText = `I scored ${correctAnswers}/${questionsGenerated} (${accuracy}%) in Class 4 ${curriculum} Maths on StudyZone! 🎯`
          const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
          if (nav.share) {
            try {
              await nav.share({ title: "My Maths Score on StudyZone", text: shareText, url: "https://studyzone.co.in" })
              setCopiedScore(true)
              setTimeout(() => setCopiedScore(false), 2000)
            } catch (err) {
              if ((err as DOMException)?.name !== "AbortError") {
                navigator.clipboard.writeText(`${shareText} studyzone.co.in`).then(() => {
                  setCopiedScore(true)
                  setTimeout(() => setCopiedScore(false), 2000)
                })
              }
            }
          } else {
            navigator.clipboard.writeText(`${shareText} studyzone.co.in`).then(() => {
              setCopiedScore(true)
              setTimeout(() => setCopiedScore(false), 2000)
            })
          }
        }

        const handleNewSession = () => {
          setQuestionsGenerated(0)
          setCorrectAnswers(0)
          setStreak(0)
          setSessionRecords([])
          setTopicCorrect({})
          setTopicAttempted({})
          setCurrentQuestion("")
          setCurrentAnswer("")
          setCurrentWorking("")
          setUserAnswer("")
          setFeedback("")
          setFeedbackColor("")
          setQuestionLocked(false)
          setShowAnswer(false)
          setCurrentRecord(null)
          setCurrentAttempts(0)
          setTimerActive(false)
          setShowSummary(false)
          setSessionEndTime(null)
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
                  {copiedScore ? 'Shared! ✓' : 'Share Score'}
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
                  onClick={handleNewSession}
                  className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  New Session
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* WORKSHEET MODAL */}
      {showWorksheetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !worksheetLoading && setShowWorksheetModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5 w-[380px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWorksheetModal(false)}
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
                      onClick={() => setWorksheetCurriculum(c)}
                      disabled={worksheetLoading}
                      className={`rounded-full px-4 py-2 font-bold text-sm transition disabled:opacity-60 ${
                        worksheetCurriculum === c
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
                onClick={() => generateWorksheet(false)}
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
                onClick={() => generateWorksheet(true)}
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
                onClick={() => setShowWorksheetModal(false)}
                disabled={worksheetLoading}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK EXAM MODAL */}
      {showMockExamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !mockExamLoading && setShowMockExamModal(false)}
        >
          <FocusTrap
            active={showMockExamModal}
            focusTrapOptions={{
              onDeactivate: () => !mockExamLoading && setShowMockExamModal(false),
              clickOutsideDeactivates: true,
              escapeDeactivates: !mockExamLoading,
            }}
          >
            <div
              ref={mockExamModalRef}
              className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5 w-[380px] max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMockExamModal(false)}
                disabled={mockExamLoading}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                aria-label="Close mock exam dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h2 className="font-heading text-xl font-bold text-gray-800">Generate Mock Examination</h2>
                <p className="text-sm text-gray-500 mt-1">Competency-weighted exam paper: Sections A–D (VSA/SA1/SA2/LA)</p>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Curriculum</label>
                  <div className="flex gap-2">
                    {(['CBSE', 'ICSE', 'IGCSE'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setMockExamCurriculum(c)}
                        disabled={mockExamLoading}
                        className={`rounded-full px-4 py-2 font-bold text-sm transition disabled:opacity-60 ${
                          mockExamCurriculum === c
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
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Topics</label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mockExamTopics.includes('All Topics')}
                        onChange={() => toggleMockExamTopic('All Topics')}
                        disabled={mockExamLoading}
                      />
                      All Topics
                    </label>
                    {availableTopics.filter((t) => t !== 'Explain & Reason').map((t) => (
                      <label key={t} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mockExamTopics.includes(t)}
                          onChange={() => toggleMockExamTopic(t)}
                          disabled={mockExamLoading}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Total Marks</label>
                  <div className="flex gap-2">
                    {([50, 25] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMockExamTotalMarks(m)}
                        disabled={mockExamLoading}
                        className={`flex-1 rounded-full py-2 font-bold text-sm transition disabled:opacity-60 ${
                          mockExamTotalMarks === m
                            ? 'bg-violet-600 text-white'
                            : 'bg-white border border-violet-600 text-violet-600'
                        }`}
                      >
                        {m} marks
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {mockExamTotalMarks === 50
                      ? 'A(10×1) + B(5×2) + C(5×3) + D(3×5) = 50 marks · ~50 mins'
                      : 'A(5×1) + B(3×2) + C(3×3) + D(1×5) = 25 marks · ~25 mins'
                    }
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => generateMockExam(false)}
                  disabled={mockExamLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mockExamLoading ? (
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
                      📝 Question Paper
                    </>
                  )}
                </button>
                <button
                  onClick={() => generateMockExam(true)}
                  disabled={mockExamLoading}
                  className="w-full py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mockExamLoading ? (
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
                      🔑 Question Paper + Answer Key
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowMockExamModal(false)}
                  disabled={mockExamLoading}
                  className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQRModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQRModal(false)}
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
                setCopiedLink(true)
                setTimeout(() => setCopiedLink(false), 2000)
              }}
              className="mt-2 w-full py-2.5 rounded-xl border-2 border-blue-500 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              {copiedLink ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
