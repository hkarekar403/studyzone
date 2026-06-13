import { NextRequest, NextResponse } from 'next/server';
import { CLASS8_TOPICS } from '@/lib/generators/class8';

export function GET(request: NextRequest) {
  const topics = CLASS8_TOPICS.map(t => ({ id: t.id, label: t.label }));
  return NextResponse.json({ topics });
}
