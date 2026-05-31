"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, CheckCircle, XCircle, Eye, Play, Download } from "lucide-react"
import jsPDF from "jspdf"

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
  const [timerActive, setTimerActive] = useState<boolean>(false)
  const [questionsGenerated, setQuestionsGenerated] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [currentAttempts, setCurrentAttempts] = useState<number>(0)
  const [questionLocked, setQuestionLocked] = useState<boolean>(false)
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([])
  const [sessionStartedAt] = useState<Date>(new Date())
  const [currentRecord, setCurrentRecord] = useState<SessionRecord | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics')
        if (response.ok) {
          const data = await response.json()
          setAvailableTopics(["Random", ...data.topics])
        }
      } catch (error) {
        console.error('Error fetching topics:', error)
      }
    }
    fetchTopics()
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
    setIsGenerating(true)
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
      setTimeLeft(60)
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
    } catch (error) {
      console.error('Error generating question:', error)
      setFeedback("Failed to generate question. Please try again.")
      setFeedbackColor("#d62828")
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
          playSound("correct")
        } else {
          setCurrentAttempts((prev) => prev + 1)
          updatedRecord.isCorrect = false
          updatedRecord.attempts.push({ answer: userAnswer, result: "Incorrect" })
          setCurrentRecord(updatedRecord)
          setSessionRecords((prev) => prev.map((r) => (r.number === currentRecord.number ? updatedRecord : r)))
          playSound("incorrect")

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
    } catch (error) {
      console.error('Error checking answer:', error)
      setFeedback("Failed to check answer. Please try again.")
      setFeedbackColor("#d62828")
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
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#143a66] mb-8">
          Class 4 Mathematics Practice
        </h1>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-lg font-bold text-[#143a66] mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 text-lg font-semibold border-2 border-[#4aa3df] rounded-xl bg-white text-[#143a66] focus:outline-none focus:ring-2 focus:ring-[#4aa3df]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-lg font-bold text-[#143a66] mb-2">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 text-lg font-semibold border-2 border-[#7cb342] rounded-xl bg-white text-[#143a66] focus:outline-none focus:ring-2 focus:ring-[#7cb342]"
              >
                {availableTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <div className="bg-[#dff4ff] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#143a66]">
                  Questions Generated: {questionsGenerated} | Correct Answers: {correctAnswers}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-[#fef3c7] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#b22222] flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Left: {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-[#e6f7ff] border-2 border-white rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-bold text-[#143a66]">Difficulty: {difficulty}</p>
                  {currentTopic && (
                    <p className="text-lg font-bold text-[#7cb342] bg-[#f1f8e9] px-4 py-1 rounded-lg">
                      Topic: {currentTopic}
                    </p>
                  )}
                </div>
                <div className="min-h-[200px] flex items-center">
                  <p className="text-xl md:text-2xl font-semibold text-[#0f2f57] whitespace-pre-wrap">
                    {isGenerating
                      ? "Generating question..."
                      : currentQuestion || "Choose a difficulty level, select a topic (or Random), and click Generate Question."}
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer() }}
                placeholder="Write your answer here"
                disabled={questionLocked || !currentQuestion || isGenerating}
                className="w-full p-4 text-lg font-semibold border-2 border-[#4aa3df] rounded-xl bg-white text-[#0f5132] focus:outline-none focus:ring-2 focus:ring-[#4aa3df] disabled:bg-gray-100 disabled:cursor-not-allowed mb-4"
              />

              {feedback && (
                <div className="text-center mb-4">
                  <p
                    className="text-3xl font-extrabold animate-pulse"
                    style={{ color: feedbackColor }}
                  >
                    {feedback}
                  </p>
                </div>
              )}

              {showAnswer && currentAnswer && (
                <div className="bg-[#fff7d6] rounded-xl p-4 min-h-[150px]">
                  <p className="text-lg font-bold text-[#143a66] mb-2">Answer</p>
                  <p className="text-lg font-semibold text-[#0f5132] whitespace-pre-wrap">
                    {difficulty === "Hard" ? `Answer: ${currentAnswer}\n\n${currentWorking}` : `Answer: ${currentAnswer}`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={generateQuestion}
                disabled={isGenerating}
                className="bg-[#1e90ff] hover:bg-[#1a7fd4] text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:bg-[#9bb8c8] disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                {isGenerating ? "Generating..." : "Generate Question"}
              </button>

              <button
                onClick={checkAnswer}
                disabled={!currentQuestion || questionLocked || isGenerating}
                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:bg-[#9bb8c8] disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Check Answer
              </button>

              <button
                onClick={handleShowAnswer}
                disabled={!currentQuestion || isGenerating}
                className="bg-[#ff6b4a] hover:bg-[#e55a3b] text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:bg-[#9bb8c8] disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <Eye className="w-5 h-5" />
                Show Answer
              </button>

              {sessionRecords.length > 0 && (
                <button
                  onClick={exportPDF}
                  className="bg-[#4b5d6f] hover:bg-[#3a4a5a] text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Export Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
