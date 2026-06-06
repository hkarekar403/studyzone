"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, CheckCircle, Eye, Play, Download, ChevronDown, ChevronUp, Share2, X, Volume2, VolumeX } from "lucide-react"
import jsPDF from "jspdf"
import { QRCodeSVG } from "qrcode.react"
import confetti from "canvas-confetti"

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
}

export default function MathQuiz() {
  const [difficulty, setDifficulty] = useState("Easy")
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
  const [questionLocked, setQuestionLocked] = useState<boolean>(false)
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([])
  const [sessionStartedAt] = useState<Date>(new Date())
  const [currentRecord, setCurrentRecord] = useState<SessionRecord | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [visitorCount, setVisitorCount] = useState<number>(0)

  const [streak, setStreak] = useState<number>(0)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)

  // UI-only state
  const [historyOpen, setHistoryOpen] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled')
    if (saved !== null) setSoundEnabled(saved === 'true')
  }, [])

  useEffect(() => {
    const trackVisit = async () => {
      try {
        if (!sessionStorage.getItem("visited_this_session")) {
          const res = await fetch("/api/visitor-count", { method: "POST" })
          const data = await res.json()
          sessionStorage.setItem("visited_this_session", "1")
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
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics')
        if (response.ok) {
          const data = await response.json()
          setAvailableTopics(["Random", ...data.topics])
        }
      } catch {
        setAvailableTopics(["Random"])
      }
    }
    fetchTopics()
    fetch('/api/clear-session', { method: 'POST' }).catch(() => {})
  }, [])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
      setQuestionLocked(true)
      setFeedback("Time Up")
      setFeedbackColor("#ff5a36")
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
  }

  const generateQuestion = async () => {
    if (questionLocked && feedback !== "Correct") {
      setStreak(0)
    }
    setIsGenerating(true)
    setApiError(null)
    try {
      const requestBody: any = { difficulty }
      if (topic !== "Random") {
        requestBody.topic = topic
      }

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
      setFeedback("")
      setFeedbackColor("")
      setCurrentAttempts(0)
      setQuestionLocked(false)
      const timerDuration = difficulty === 'Easy' ? 45 : difficulty === 'Medium' ? 90 : 120
      setTimerDuration(timerDuration)
      setTimeLeft(timerDuration)
      setTimerActive(true)

      const newRecord: SessionRecord = {
        number: questionsGenerated + 1,
        difficulty,
        topic: questionData.topic || "General",
        question: questionData.question,
        kidAnswer: "",
        attempts: [],
        correctAnswer: questionData.answer,
        working: questionData.working,
        isCorrect: null,
        generatedAt: new Date(),
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

  const checkAnswer = async () => {
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

    if (!userAnswer.trim()) {
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
          user_answer: userAnswer,
          correct_answer: currentAnswer,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check answer')
      }

      const data = await response.json()
      const isCorrect = data.is_correct

      if (currentRecord) {
        const updatedRecord = { ...currentRecord, kidAnswer: userAnswer }
        if (isCorrect) {
          updatedRecord.isCorrect = true
          updatedRecord.attempts.push({ answer: userAnswer, result: "Correct" })
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
          updatedRecord.attempts.push({ answer: userAnswer, result: "Incorrect" })
          setCurrentRecord(updatedRecord)
          setSessionRecords((prev) => prev.map((r) => (r.number === currentRecord.number ? updatedRecord : r)))
          setStreak(0)
          if (soundEnabled) playSound("incorrect")

          if (currentAttempts + 1 >= 3) {
            setQuestionLocked(true)
            setTimerActive(false)
            setFeedback("Incorrect - Showing Answer")
            setFeedbackColor("#d62828")
            setShowAnswer(true)
          } else {
            const attemptsLeft = 3 - (currentAttempts + 1)
            const attemptWord = attemptsLeft === 1 ? "attempt" : "attempts"
            setFeedback(`Incorrect - ${attemptsLeft} ${attemptWord} left`)
            setFeedbackColor("#d62828")
          }
        }
      }
    } catch {
      setApiError("Couldn't check your answer. Please try again.")
    }
  }

  const handleShowAnswer = () => {
    if (currentAnswer) {
      setShowAnswer(true)
    }
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const endedAt = new Date()

    doc.setFontSize(20)
    doc.text("Class 4 Mathematics Practice Session Report", 20, 20)

    doc.setFontSize(12)
    doc.text(`Session Start: ${sessionStartedAt.toLocaleString()}`, 20, 35)
    doc.text(`Session End: ${endedAt.toLocaleString()}`, 20, 45)
    doc.text(`Questions Generated: ${questionsGenerated}`, 20, 55)
    doc.text(`Correct Answers: ${correctAnswers}`, 20, 65)

    let yPosition = 80
    sessionRecords.forEach((record) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text(`Question ${record.number} - ${record.difficulty} - ${record.topic}`, 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      const questionLines = doc.splitTextToSize(record.question, 170)
      doc.text(questionLines, 20, yPosition)
      yPosition += questionLines.length * 5 + 5

      doc.text(`Child's Answer: ${record.kidAnswer || "No answer entered"}`, 20, yPosition)
      yPosition += 7

      const resultText = record.isCorrect === true ? "Correct" : record.isCorrect === false ? "Incorrect" : "Not checked"
      doc.text(`Result: ${resultText}`, 20, yPosition)
      yPosition += 7

      if (record.attempts.length > 0) {
        doc.text("Attempts:", 20, yPosition)
        yPosition += 5
        record.attempts.forEach((attempt, idx) => {
          doc.text(`  Attempt ${idx + 1}: ${attempt.answer} (${attempt.result})`, 20, yPosition)
          yPosition += 5
        })
      }

      doc.setFillColor(255, 247, 214)
      doc.rect(20, yPosition, 170, 20, "F")
      doc.setTextColor(15, 81, 50)
      let answerText = `Answer: ${record.correctAnswer}`
      if (record.difficulty === "Hard") {
        answerText += `\n\n${record.working}`
      }
      const answerLines = doc.splitTextToSize(answerText, 160)
      doc.text(answerLines, 25, yPosition + 5)
      doc.setTextColor(0, 0, 0)
      yPosition += 25
    })

    doc.save(`math_session_${endedAt.getTime()}.pdf`)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-float inline-block">🚀</span>
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-blue-700 leading-tight">
              Maths Practice
            </h1>
            <p className="text-gray-500 text-sm font-semibold tracking-wide mt-0.5">
              Class 4 · Interactive Quiz
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-shrink-0">
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
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-300 tracking-widest uppercase">
            BETA
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">

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
                className="w-full p-2 text-base font-semibold rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-200 cursor-pointer"
              >
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
                <p className={`mt-1 font-bold text-amber-600 ${streak >= 5 ? "text-base animate-pulse" : "text-sm"}`}>
                  🔥 {streak} streak!
                </p>
              )}
            </div>

            {/* Timer with progress bar */}
            <div className="rounded-xl shadow-sm bg-gray-50 border border-gray-200 p-3">
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
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
                    difficulty === "Easy"
                      ? "border-blue-400 bg-blue-50"
                      : difficulty === "Medium"
                      ? "border-amber-400 bg-amber-50"
                      : "border-red-400 bg-red-50"
                  } ${feedback === "Correct" ? "animate-celebrate" : ""}`}
                >
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        difficulty === "Easy"
                          ? "bg-blue-200 text-blue-700"
                          : difficulty === "Medium"
                          ? "bg-amber-200 text-amber-700"
                          : "bg-red-200 text-red-700"
                      }`}
                    >
                      {difficulty}
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
                          const svgEndIdx = svgAndAfter.indexOf('</svg>') + 6;
                          return (
                            <>
                              <span className="whitespace-pre-wrap">{textBefore}</span>
                              <div className="my-4 inline-block" dangerouslySetInnerHTML={{ __html: svgAndAfter.substring(0, svgEndIdx) }} />
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

              {/* Answer input */}
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") checkAnswer() }}
                placeholder="Type your answer and press Enter..."
                disabled={questionLocked || !currentQuestion || isGenerating}
                className={`w-full p-4 text-lg font-semibold border-2 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed mb-4 shadow-sm transition-colors ${
                  feedback.startsWith("Incorrect") && !questionLocked
                    ? "border-red-400 focus:ring-red-300 animate-shake"
                    : "border-blue-300 focus:ring-blue-400"
                }`}
              />

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
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
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
                    {difficulty === "Hard"
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

              <button
                onClick={checkAnswer}
                disabled={!currentQuestion || questionLocked || isGenerating}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
              >
                <CheckCircle className="w-5 h-5" />
                Check Answer
              </button>

              <button
                onClick={handleShowAnswer}
                disabled={!currentQuestion || isGenerating}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
              >
                <Eye className="w-5 h-5" />
                Show Answer
              </button>

              <button
                onClick={exportPDF}
                disabled={sessionRecords.length === 0}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
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
                      {record.isCorrect === true
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

        {/* FOOTER */}
        <footer className="pb-6 flex items-center justify-between flex-wrap gap-2 px-1">
          <p className="text-sm text-gray-400">
            Built with ❤️ for curious minds · Class 4 Mathematics
          </p>
          {visitorCount > 0 && (
            <p className="text-sm text-gray-400">
              🎯 {visitorCount} students have practised here
            </p>
          )}
        </footer>
      </div>

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
              bgColor="#ffffff"
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
