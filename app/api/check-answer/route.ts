import { NextRequest, NextResponse } from 'next/server';

function stripUnits(value: string): string {
  // Order matters: longer/more-specific patterns must come before shorter ones
  // to avoid partial stripping (e.g. "cm²" before "cm", "km²" before "km")
  return value
    .replace(/\bsq(?:uare)?\s*(?:cm|m|km|mm)\b/g, '')
    .replace(/\bcm²|m²|km²|mm²/g, '')
    .replace(/\bcm\b|\bm\b|\bkm\b|\bmm\b/g, '')
    .replace(/\bkg\b|\bmg\b|\bg\b/g, '')
    .replace(/\bml\b|\bl\b|\blitre[s]?\b|\bliter[s]?\b/g, '')
    .replace(/₹|\brs\b|\brupees?\b/g, '')
    .replace(/°|\bdegrees?\b/g, '')
    .replace(/\bhrs?\b|\bhours?\b|\bmins?\b|\bminutes?\b|\bseconds?\b|\bsecs?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAnswer(value: string): string {
  let cleaned = value.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace('quotient =', 'quotient=').replace('remainder =', 'remainder=');
  cleaned = stripUnits(cleaned);
  return cleaned;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_answer = '', correct_answer = '' } = body;
  const is_correct = normalizeAnswer(user_answer) === normalizeAnswer(correct_answer);
  return NextResponse.json({ is_correct });
}
