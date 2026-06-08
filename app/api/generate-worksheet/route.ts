import { NextRequest, NextResponse } from 'next/server'
import { getGenerator } from '@/lib/generatorSingleton'

const VALID_CURRICULA = ['CBSE', 'ICSE', 'IGCSE']
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Random']

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { difficulty = 'Easy', topic, count = 10, curriculum = 'CBSE' } = body
  if (!VALID_CURRICULA.includes(curriculum))
    return NextResponse.json({ error: 'Invalid curriculum' }, { status: 400 })
  if (!VALID_DIFFICULTIES.includes(difficulty))
    return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
  if (!Number.isInteger(count) || count < 1 || count > 20)
    return NextResponse.json({ error: 'Invalid count' }, { status: 400 })
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
