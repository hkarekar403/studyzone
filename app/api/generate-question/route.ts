import { NextRequest, NextResponse } from 'next/server';
import { getGenerator } from '@/lib/generatorSingleton';

const VALID_CURRICULA = ['CBSE', 'ICSE', 'IGCSE']
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Random']

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { difficulty = 'Easy', topic, curriculum = 'CBSE' } = body;
  if (!VALID_CURRICULA.includes(curriculum))
    return NextResponse.json({ error: 'Invalid curriculum' }, { status: 400 })
  if (!VALID_DIFFICULTIES.includes(difficulty))
    return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
  const question = getGenerator(curriculum).generate(difficulty, topic);
  return NextResponse.json({ ...question, curriculum });
}
