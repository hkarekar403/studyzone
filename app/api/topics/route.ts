import { NextRequest, NextResponse } from 'next/server';
import { getGenerator } from '@/lib/generatorSingleton';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const curriculum = searchParams.get('curriculum') || 'CBSE';
  return NextResponse.json({ topics: getGenerator(curriculum).getTopics() });
}
