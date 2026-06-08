import { NextRequest, NextResponse } from 'next/server';

// --- unit / symbol stripping ---
function stripUnits(value: string): string {
  return value
    .replace(/\bsq(?:uare)?\s*(?:cm|m|km|mm)\b/g, '')
    .replace(/\bcm²|m²|km²|mm²/g, '')
    .replace(/\bcm\b|\bm\b|\bkm\b|\bmm\b/g, '')
    .replace(/\bkg\b|\bmg\b|\bg\b/g, '')
    .replace(/\bml\b|\bl\b|\blitre[s]?\b|\bliter[s]?\b/g, '')
    .replace(/₹|\brs\.?\b|\brupees?\b/g, '')
    .replace(/°|\bdegrees?\b/g, '')
    .replace(/\bhrs?\b|\bhours?\b|\bmins?\b|\bminutes?\b|\bseconds?\b|\bsecs?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// "2:30" → "2 30",  "3:00" → "3"
function normalizeTimeFormat(value: string): string {
  return value.replace(/\b(\d+):(\d{2})\b/g, (_, h, m) => {
    const minutes = parseInt(m, 10);
    return minutes === 0 ? h : `${h} ${minutes}`;
  });
}

// "5.00" → "5",  "5.50" stays "5.50"
function stripTrailingZeroDecimals(value: string): string {
  return value.replace(/\b(\d+)\.00\b/g, '$1');
}

// Sort space-separated tokens when all are fractions — handles ordered-list questions
function normalizeOrderedAnswer(value: string): string {
  if (!value.includes('/')) return value;
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return value;
  return [...parts].sort().join(' ');
}

// "three hundred forty two" etc. → number string (handles 0-999999)
const ones = ['zero','one','two','three','four','five','six','seven','eight','nine',
               'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
               'seventeen','eighteen','nineteen'];
const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

function wordsToNumber(words: string): number | null {
  const w = words.toLowerCase().trim().replace(/-/g, ' ');
  let total = 0;
  let current = 0;
  const tokens = w.split(/\s+/);
  for (const t of tokens) {
    const oi = ones.indexOf(t);
    if (oi >= 0) { current += oi; continue; }
    const ti = tens.indexOf(t);
    if (ti >= 0) { current += ti * 10; continue; }
    if (t === 'hundred') { current *= 100; continue; }
    if (t === 'thousand') { total += (current || 1) * 1000; current = 0; continue; }
    if (t === 'lakh') { total += (current || 1) * 100000; current = 0; continue; }
    if (t === 'and') continue;
    return null; // unknown token
  }
  return total + current;
}

// Normalise mixed-number spelling:  "3 and 2/5"  "3-2/5"  "3 2/5"  → "3 2/5"
function normalizeMixedNumber(value: string): string {
  return value
    .replace(/(\d+)\s+and\s+(\d+\/\d+)/g, '$1 $2')
    .replace(/(\d+)-(\d+\/\d+)/g, '$1 $2');
}

// "they are equal" / "equal" / "same" → "equal"
function normalizeEqualPhrase(value: string): string {
  if (/\bthey are equal\b|\bthey're equal\b/.test(value)) return 'equal';
  if (/^same$/.test(value)) return 'equal';
  return value;
}

// Comma-separated number lists: strip spaces around commas, sort tokens so order doesn't matter
function normalizeNumberList(value: string): string {
  // Only treat as a list when value looks like purely numbers/commas
  if (!/^[\d\s,]+$/.test(value)) return value;
  const parts = value.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) return value;
  return parts.map(Number).sort((a, b) => a - b).join(',');
}

// "profit of rs 60" / "profit rs60" / "profit 60" all → "profit 60"
// "loss of rs 40"  / "loss 40"                      → "loss 40"
function normalizeProfitLoss(value: string): string {
  return value
    .replace(/\b(profit|loss)\s+of\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)/g, '$1 $2')
    .replace(/\b(profit|loss)\s+(?:rs\.?\s*)(\d+(?:\.\d+)?)/g, '$1 $2');
}

// "30%" / "30 percent" / "30" (when context is purely a number) are all kept as-is after
// unit stripping because "%" and "percent" are stripped — they already compare equal.

// Transformation aliases
function normalizeTransformation(value: string): string {
  if (/\breflect|\bflip\b/.test(value)) return 'reflection';
  if (/\btranslat|\bslide\b/.test(value)) return 'translation';
  if (/\brotat/.test(value)) return 'rotation';
  return value;
}

// Place names: strip trailing "place" word, e.g. "thousands place" → "thousands"
function normalizePlaceName(value: string): string {
  return value.replace(/\bplace\b/g, '').replace(/\s+/g, ' ').trim();
}

// Quotient/Remainder canonical form
// Accepts: "quot 5 rem 2", "q=5 r=2", "quotient=5, remainder=2", etc.
function normalizeQuotientRemainder(value: string): string {
  // Already in canonical form?
  if (/^quotient=\d+ remainder=\d+$/.test(value)) return value;

  // Flexible: words starting with quot/rem followed by optional = and number
  const qm = value.match(/\bquot\w*\s*[=:]\s*(\d+)/);
  const rm = value.match(/\brem\w*\s*[=:]\s*(\d+)/);
  if (qm && rm) return `quotient=${qm[1]} remainder=${rm[1]}`;

  // "quotient 5 remainder 2" without = sign
  const qm2 = value.match(/\bquot\w*\s+(\d+)/);
  const rm2 = value.match(/\brem\w*\s+(\d+)/);
  if (qm2 && rm2) return `quotient=${qm2[1]} remainder=${rm2[1]}`;

  return value;
}

function normalizeAnswer(value: string): string {
  let s = value.toLowerCase().trim();

  // Collapse whitespace, but preserve commas for list detection
  s = s.replace(/\s+/g, ' ');

  // Equal / same phrase
  s = normalizeEqualPhrase(s);

  // Quotient / remainder (before stripping units so "rem" isn't confused)
  s = normalizeQuotientRemainder(s);

  // Transformation names
  s = normalizeTransformation(s);

  // Place name suffix
  s = normalizePlaceName(s);

  // Profit / loss normalisation (before stripping Rs/₹)
  s = normalizeProfitLoss(s);

  // Mixed numbers: "3 and 2/5" → "3 2/5"
  s = normalizeMixedNumber(s);

  // "4 / 10" → "4/10"
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2');

  // Time: "2:30" → "2 30"
  s = normalizeTimeFormat(s);

  // Strip trailing zero decimals: "5.00" → "5"
  s = stripTrailingZeroDecimals(s);

  // Strip unit words / symbols
  s = stripUnits(s);

  // Percentage: strip % / "percent" (already handled by stripUnits for "percent";
  // add % sign stripping here)
  s = s.replace(/%/g, '').replace(/\bpercent\b/g, '').trim();

  // Number-word detection: if entire string is English number words, convert to digits
  const asNum = wordsToNumber(s);
  if (asNum !== null) s = String(asNum);

  // Comma-separated number list: sort so order doesn't matter
  s = normalizeNumberList(s);

  // Sorted fraction list (ascending/descending order questions)
  s = normalizeOrderedAnswer(s);

  // Final whitespace collapse
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { user_answer = '', correct_answer = '' } = body;

  // Open-ended questions accept any answer
  if (correct_answer.trim().toLowerCase().startsWith('any')) {
    return NextResponse.json({ is_correct: true });
  }

  const normalUser = normalizeAnswer(user_answer);
  const normalCorrect = normalizeAnswer(correct_answer);

  let is_correct = normalUser === normalCorrect;

  // Profit/loss partial match: if correct answer is "profit N" or "loss N",
  // accept if user supplies just the number (and correct type keyword matches)
  if (!is_correct) {
    const plMatch = normalCorrect.match(/^(profit|loss)\s+(\d+(?:\.\d+)?)$/);
    if (plMatch) {
      is_correct = normalUser === plMatch[2] || normalUser === `${plMatch[1]} ${plMatch[2]}`;
    }
  }

  return NextResponse.json({ is_correct });
}
