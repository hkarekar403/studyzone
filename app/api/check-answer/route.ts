import { NextRequest, NextResponse } from 'next/server';

function normalizeAnswer(value: string): string {
  let cleaned = value.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace('quotient =', 'quotient=').replace('remainder =', 'remainder=');
  return cleaned;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_answer = '', correct_answer = '' } = body;
  const is_correct = normalizeAnswer(user_answer) === normalizeAnswer(correct_answer);
  return NextResponse.json({ is_correct });
}
