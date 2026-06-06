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

// "2:30" → "2 30", "3:00" → "3"
// Runs before stripUnits so "2 hours 30 minutes" and "2:30" both reduce to "2 30"
function normalizeTimeFormat(value: string): string {
  return value.replace(/\b(\d+):(\d{2})\b/g, (_, h, m) => {
    const minutes = parseInt(m, 10);
    return minutes === 0 ? h : `${h} ${minutes}`;
  });
}

// "5.00" → "5", but "5.50" stays "5.50"
function stripTrailingZeroDecimals(value: string): string {
  return value.replace(/\b(\d+)\.00\b/g, '$1');
}

// When the answer is a list of fractions (ascending/descending order questions),
// sort the parts so "3/10 1/10 4/10" matches "1/10 3/10 4/10"
function normalizeOrderedAnswer(value: string): string {
  if (!value.includes('/')) return value;
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return value;
  return [...parts].sort().join(' ');
}

function normalizeAnswer(value: string): string {
  // Remove commas (handles "1,234" → "1234" and list separators), collapse whitespace
  let cleaned = value.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
  // "quotient = 5 remainder = 2" and "quotient=5 remainder=2" → same form
  cleaned = cleaned.replace(/quotient\s*=\s*/g, 'quotient=').replace(/remainder\s*=\s*/g, 'remainder=');
  // "4 / 10" → "4/10"
  cleaned = cleaned.replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2');
  cleaned = normalizeTimeFormat(cleaned);
  cleaned = stripTrailingZeroDecimals(cleaned);
  cleaned = stripUnits(cleaned);
  cleaned = normalizeOrderedAnswer(cleaned);
  return cleaned;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_answer = '', correct_answer = '' } = body;

  // Open-ended questions accept any answer
  if (correct_answer.trim().toLowerCase().startsWith('any')) {
    return NextResponse.json({ is_correct: true });
  }

  const is_correct = normalizeAnswer(user_answer) === normalizeAnswer(correct_answer);
  return NextResponse.json({ is_correct });
}
