import { NextRequest, NextResponse } from 'next/server';
import { generator } from '@/lib/generatorSingleton';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { difficulty = 'Easy', topic } = body;
  const question = generator.generate(difficulty, topic);
  return NextResponse.json(question);
}
