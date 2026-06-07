import { NextRequest, NextResponse } from 'next/server'
import { getGenerator } from '@/lib/generatorSingleton'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { difficulty = 'Easy', topic, count = 10, curriculum = 'CBSE' } = body
  const gen = getGenerator(curriculum)
  const target = Math.min(Math.max(1, count), 20)

  const questions: { number: number; question: string; answer: string; working: string }[] = []
  let attempts = 0
  const maxAttempts = target * 8

  while (questions.length < target && attempts < maxAttempts) {
    attempts++
    const q = gen.generate(difficulty, topic)
    if (q.question.includes('[[TALLY_SVG]]')) continue
    questions.push({
      number: questions.length + 1,
      question: q.question,
      answer: q.answer,
      working: q.working,
    })
  }

  return NextResponse.json({ questions })
}
