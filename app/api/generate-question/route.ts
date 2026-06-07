import { NextRequest, NextResponse } from 'next/server';
import { getGenerator } from '@/lib/generatorSingleton';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { difficulty = 'Easy', topic, curriculum = 'CBSE' } = body;
  const question = getGenerator(curriculum).generate(difficulty, topic);
  return NextResponse.json({ ...question, curriculum });
}
