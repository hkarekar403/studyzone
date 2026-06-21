import { NextRequest, NextResponse } from 'next/server'
import { getGenerator } from '@/lib/generatorSingleton'

const VALID_CURRICULA = ['CBSE', 'ICSE', 'IGCSE']

const EXAM_STRUCTURE = {
  50: {
    VSA: { count: 10, marksEach: 1, difficulty: 'Easy' },
    SA1: { count: 5,  marksEach: 2, difficulty: 'Medium' },
    SA2: { count: 5,  marksEach: 3, difficulty: 'Medium' },
    LA:  { count: 3,  marksEach: 5, difficulty: 'Hard' },
  },
  25: {
    VSA: { count: 5,  marksEach: 1, difficulty: 'Easy' },
    SA1: { count: 3,  marksEach: 2, difficulty: 'Medium' },
    SA2: { count: 3,  marksEach: 3, difficulty: 'Medium' },
    LA:  { count: 1,  marksEach: 5, difficulty: 'Hard' },
  },
} as const

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { curriculum = 'CBSE', topic, totalMarks = 50 } = body

  if (!VALID_CURRICULA.includes(curriculum))
    return NextResponse.json({ error: 'Invalid curriculum' }, { status: 400 })
  if (totalMarks !== 25 && totalMarks !== 50)
    return NextResponse.json({ error: 'totalMarks must be 25 or 50' }, { status: 400 })

  const gen = getGenerator(curriculum)
  const structure = EXAM_STRUCTURE[totalMarks as 25 | 50]
  const topicParam: string | undefined = topic && topic !== 'Random' ? topic : undefined

  type QItem = { question: string; answer: string; working: string }

  const generateSection = (difficulty: string, count: number): QItem[] => {
    const questions: QItem[] = []
    let attempts = 0
    const maxAttempts = count * 8
    while (questions.length < count && attempts < maxAttempts) {
      attempts++
      const q = gen.generate(difficulty, topicParam)
      if (q.question.includes('[[TALLY_SVG]]')) continue
      questions.push({ question: q.question, answer: q.answer, working: q.working })
    }
    return questions
  }

  const sections = {
    VSA: generateSection(structure.VSA.difficulty, structure.VSA.count),
    SA1: generateSection(structure.SA1.difficulty, structure.SA1.count),
    SA2: generateSection(structure.SA2.difficulty, structure.SA2.count),
    LA:  generateSection(structure.LA.difficulty,  structure.LA.count),
  }

  return NextResponse.json({ sections, structure, totalMarks, curriculum })
}
