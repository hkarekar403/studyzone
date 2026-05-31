import { NextResponse } from 'next/server';
import { MathQuestionGenerator } from '@/lib/questionGenerator';

const generator = new MathQuestionGenerator();

export function GET() {
  return NextResponse.json({ topics: generator.getTopics() });
}
