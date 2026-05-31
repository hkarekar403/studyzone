import { NextRequest, NextResponse } from 'next/server';
import { MathQuestionGenerator } from '@/lib/questionGenerator';

const generator = new MathQuestionGenerator();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { difficulty = 'Easy', topic } = body;
  const question = generator.generate(difficulty, topic);
  return NextResponse.json(question);
}
