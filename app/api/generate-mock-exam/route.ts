import { NextRequest, NextResponse } from 'next/server'
import { getGenerator } from '@/lib/generatorSingleton'
import { MOCK_EXAM_STRUCTURE } from '@/lib/questionGenerator'

const VALID_CURRICULA = ['CBSE', 'ICSE', 'IGCSE']
const VALID_TOTAL_MARKS = [25, 50]

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { curriculum = 'CBSE', topics = [], totalMarks = 50 } = body

  if (!VALID_CURRICULA.includes(curriculum))
    return NextResponse.json({ error: 'Invalid curriculum' }, { status: 400 })
  if (!VALID_TOTAL_MARKS.includes(totalMarks))
    return NextResponse.json({ error: 'totalMarks must be 25 or 50' }, { status: 400 })
  if (!Array.isArray(topics))
    return NextResponse.json({ error: 'topics must be an array' }, { status: 400 })

  const gen = getGenerator(curriculum)
  const structure = MOCK_EXAM_STRUCTURE[totalMarks as 25 | 50]
  const sections = gen.getMockExamQuestions(topics, totalMarks as 25 | 50)

  const totalTime = Math.round(totalMarks * 1.2)

  return NextResponse.json({ sections, structure, totalMarks, totalTime, curriculum })
}
