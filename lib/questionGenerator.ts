export interface Question {
  question: string;
  answer: string;
  working: string;
  topic?: string;
  selfAssess?: boolean;
  modelAnswer?: string;
  options?: string[];
}

// Competency tiers for the Mock Exam generator, mirroring a school exam's
// VSA / SA1 / SA2 / LA section structure (see BOOK_ANALYSIS.md Section 6).
export type Competency = 'VSA' | 'SA1' | 'SA2' | 'LA';

export const MOCK_EXAM_STRUCTURE: Record<25 | 50, Record<Competency, { count: number; marksEach: number; minutesEach: number }>> = {
  50: {
    VSA: { count: 10, marksEach: 1, minutesEach: 1 },
    SA1: { count: 5, marksEach: 2, minutesEach: 2 },
    SA2: { count: 5, marksEach: 3, minutesEach: 2.5 },
    LA: { count: 3, marksEach: 5, minutesEach: 4.5 },
  },
  25: {
    VSA: { count: 5, marksEach: 1, minutesEach: 1 },
    SA1: { count: 3, marksEach: 2, minutesEach: 2 },
    SA2: { count: 3, marksEach: 3, minutesEach: 2.5 },
    LA: { count: 1, marksEach: 5, minutesEach: 4.5 },
  },
};

// --- MCQ distractor engine ---
// Detects the "shape" of an answer string and produces 1-3 plausible wrong
// answers of the same shape. Order matters: more specific patterns (exact
// word pools) are checked before the generic numeric-with-affix fallback,
// since some pool words (e.g. shape names) contain no digits and would
// never hit the numeric branch anyway, but keeping specific checks first
// makes the intent obvious.
// Kept as separate 2D/3D pools (rather than one combined list) so distractors
// never mix dimensionality — a 2D-shape question only offers other 2D shapes.
const SHAPE_POOL_2D = ['Triangle', 'Square', 'Rectangle', 'Pentagon', 'Hexagon', 'Circle'];
const SHAPE_POOL_3D = ['Cube', 'Cuboid', 'Sphere', 'Cylinder', 'Cone', 'Triangular Prism', 'Square Pyramid'];
const ANGLE_POOL = ['Acute', 'Right', 'Obtuse', 'Reflex'];
// A triangle's interior angle can never be reflex (all three must sum to
// 180°), so triangle-classification questions get a 3-option pool matching
// the "Acute, Right, or Obtuse" wording in the question text itself.
const ANGLE_POOL_TRIANGLE = ['Acute', 'Right', 'Obtuse'];
const TRANSFORM_POOL = ['Reflection', 'Translation', 'Rotation'];
const LIKELIHOOD_POOL = ['Impossible', 'Unlikely', 'Even chance', 'Likely', 'Certain'];
const PLACE_NAME_POOL = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'lakhs'];
const COMPARISON_POOL = ['<', '>', '='];
const PROBABILITY_BAG_POOL = ['Bag A', 'Bag B', 'Equally likely'];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Matches the correct answer's capitalisation style onto a pool word, so
// e.g. a lowercase "cube" answer gets lowercase distractors like "sphere".
function matchCase(template: string, value: string): string {
  if (template === template.toUpperCase()) return value.toUpperCase();
  if (template[0] === template[0]?.toLowerCase()) return value.charAt(0).toLowerCase() + value.slice(1);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function poolDistractors(correct: string, pool: string[], max: number): string[] {
  const lower = correct.toLowerCase();
  const others = pool.filter(p => p.toLowerCase() !== lower);
  return shuffleArray(others).slice(0, max).map(v => matchCase(correct, v));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function digitLength(n: number): number {
  return Math.trunc(Math.abs(n)).toString().length;
}

// Generates near-miss numeric candidates: off-by-small-amounts, off-by-ten,
// digit swaps/substitutions — the common mistakes a student actually makes,
// rather than wildly random numbers. A ×10/÷10 slip is deliberately excluded:
// it changes the digit-length so visibly (e.g. 1150 → 11500) that a student
// can eliminate it on length alone without doing any maths.
function numericNearMiss(correct: number, isDecimal: boolean, allowNegative: boolean, need: number): number[] {
  const correctLen = digitLength(correct);
  const withinLength = (n: number) => Math.abs(digitLength(n) - correctLen) <= 1;

  const candidates = new Set<number>();
  const baseDeltas = isDecimal
    ? [0.1, -0.1, 0.5, -0.5, 1, -1, 0.2, -0.2, 2, -2]
    : [1, -1, 2, -2, 10, -10, 3, -3, 5, -5, 20, -20];

  for (const d of baseDeltas) candidates.add(round2(correct + d));

  if (!isDecimal) {
    const absStr = Math.trunc(Math.abs(correct)).toString();

    // Digit transposition (e.g. 1150 → 1510) — same digit-length by construction.
    if (absStr.length >= 2) {
      const arr = absStr.split('');
      [arr[0], arr[1]] = [arr[1], arr[0]];
      if (arr[0] !== '0') {
        candidates.add(parseInt(arr.join(''), 10) * (correct < 0 ? -1 : 1));
      }
    }

    // Single-digit substitution (e.g. 1150 → 1250) — a tight, same-length
    // near-miss that mimics a simple misreading/miscopying error.
    for (let attempt = 0; attempt < 6 && candidates.size < need * 4; attempt++) {
      const pos = absStr.length > 1 ? 1 + Math.floor(Math.random() * (absStr.length - 1)) : 0;
      const arr = absStr.split('');
      const newDigit = Math.floor(Math.random() * 10).toString();
      if (newDigit === arr[pos] || (pos === 0 && newDigit === '0')) continue;
      arr[pos] = newDigit;
      candidates.add(parseInt(arr.join(''), 10) * (correct < 0 ? -1 : 1));
    }
  }

  candidates.delete(correct);
  let pool = Array.from(candidates).filter(n => Number.isFinite(n) && withinLength(n));
  if (!allowNegative) pool = pool.filter(n => n >= 0);

  // Widen further on the rare occasion the above didn't yield enough options
  // (e.g. correct answer is 0 or 1 with negatives disallowed) — still bounded
  // by the same digit-length guard so nothing wildly-off slips through.
  let widen = 1;
  while (pool.length < need && widen < 30) {
    const delta = (isDecimal ? widen * 0.3 : widen * 7) * (widen % 2 === 0 ? 1 : -1);
    const candidate = isDecimal ? round2(correct + delta) : Math.round(correct + delta);
    if (candidate !== correct && (allowNegative || candidate >= 0) && withinLength(candidate) && !pool.includes(candidate)) pool.push(candidate);
    widen++;
  }

  return shuffleArray(pool).slice(0, need);
}

function fractionDistractors(n: number, d: number, need: number): string[] {
  const candidates = new Set<string>();
  const addFrac = (nn: number, dd: number) => {
    if (nn > 0 && dd > 0 && !(nn === n && dd === d)) candidates.add(`${nn}/${dd}`);
  };
  let widen = 1;
  while (candidates.size < need * 2 && widen < 10) {
    addFrac(n + widen, d);
    addFrac(Math.max(1, n - widen), d);
    addFrac(n, d + widen);
    addFrac(n, Math.max(1, d - widen));
    if (widen === 1) addFrac(d, n);
    widen++;
  }
  return shuffleArray(Array.from(candidates)).slice(0, need);
}

function mixedNumberDistractors(w: number, n: number, d: number, need: number): string[] {
  const candidates = new Set<string>();
  const addMixed = (ww: number, nn: number, dd: number) => {
    if (ww >= 0 && nn > 0 && dd > 0 && nn < dd && !(ww === w && nn === n && dd === d)) candidates.add(`${ww} ${nn}/${dd}`);
  };
  let widen = 1;
  while (candidates.size < need * 2 && widen < 10) {
    addMixed(w + widen, n, d);
    addMixed(Math.max(0, w - widen), n, d);
    addMixed(w, Math.min(d - 1, n + widen), d);
    addMixed(w, Math.max(1, n - widen), d);
    widen++;
  }
  return shuffleArray(Array.from(candidates)).slice(0, need);
}

// Returns false for questions that fundamentally cannot become MCQ: answers
// that require free-form self-assessment, or open-ended "any valid answer"
// prompts where there is no fixed set of wrong answers to offer.
export function canBeMCQ(question: Question): boolean {
  if (question.selfAssess) return false;
  if (/^any\b/i.test(question.answer.trim())) return false;
  return true;
}

// Produces up to 3 plausible wrong answers matching the shape of correctAnswer.
// Returns an empty array when the answer's format can't be confidently
// detected (compound phrases, word-form numbers, ordered lists, etc.) —
// callers should fall back to a typed input in that case.
export function generateDistractors(correctAnswer: string, questionContext?: string): string[] {
  const a = correctAnswer.trim();
  if (a.length === 0 || /^any\b/i.test(a)) return [];

  if (/^(yes|no)$/i.test(a)) {
    return [matchCase(a, /^yes$/i.test(a) ? 'No' : 'Yes')];
  }

  if (/^(odd|even)$/i.test(a)) {
    return [matchCase(a, /^odd$/i.test(a) ? 'Even' : 'Odd')];
  }

  if (/^(prime|composite)$/i.test(a)) {
    return [matchCase(a, /^prime$/i.test(a) ? 'Composite' : 'Prime')];
  }

  if (/^[<>=]$/.test(a)) {
    return COMPARISON_POOL.filter(s => s !== a);
  }

  if (SHAPE_POOL_2D.some(s => s.toLowerCase() === a.toLowerCase())) {
    return poolDistractors(a, SHAPE_POOL_2D, 3);
  }

  if (SHAPE_POOL_3D.some(s => s.toLowerCase() === a.toLowerCase())) {
    return poolDistractors(a, SHAPE_POOL_3D, 3);
  }

  if (ANGLE_POOL.some(s => s.toLowerCase() === a.toLowerCase())) {
    // Triangle-classification questions can never have a reflex interior
    // angle — restrict to the 3-option pool that matches the question text.
    const isTriangleContext = /\btriangle\b/i.test(questionContext ?? '');
    const pool = isTriangleContext ? ANGLE_POOL_TRIANGLE : ANGLE_POOL;
    return poolDistractors(a, pool, pool.length - 1);
  }

  if (TRANSFORM_POOL.some(s => s.toLowerCase() === a.toLowerCase())) {
    return poolDistractors(a, TRANSFORM_POOL, 2);
  }

  if (LIKELIHOOD_POOL.some(s => s.toLowerCase() === a.toLowerCase())) {
    return poolDistractors(a, LIKELIHOOD_POOL, 3);
  }

  if (PROBABILITY_BAG_POOL.some(s => s.toLowerCase() === a.toLowerCase())) {
    return poolDistractors(a, PROBABILITY_BAG_POOL, 2);
  }

  if (PLACE_NAME_POOL.some(s => s.toLowerCase() === a.toLowerCase())) {
    return poolDistractors(a, PLACE_NAME_POOL, 3);
  }

  const qr = a.match(/^Quotient\s*=\s*(\d+),\s*Remainder\s*=\s*(\d+)$/i);
  if (qr) {
    const q = parseInt(qr[1], 10);
    const r = parseInt(qr[2], 10);
    const cands = new Set<string>();
    const add = (qq: number, rr: number) => { if (qq >= 0 && rr >= 0 && !(qq === q && rr === r)) cands.add(`Quotient = ${qq}, Remainder = ${rr}`); };
    add(q + 1, r);
    add(Math.max(0, q - 1), r);
    add(q, r + 1);
    if (r > 0) add(q, r - 1);
    add(q + 1, Math.max(0, r - 1));
    add(Math.max(0, q - 1), r + 1);
    return shuffleArray(Array.from(cands)).slice(0, 3);
  }

  const mixed = a.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return mixedNumberDistractors(parseInt(mixed[1], 10), parseInt(mixed[2], 10), parseInt(mixed[3], 10), 3);
  }

  const frac = a.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    return fractionDistractors(parseInt(frac[1], 10), parseInt(frac[2], 10), 3);
  }

  // Generic "text + one number + text" shape — covers plain integers,
  // currency-prefixed (₹45, Rs.150, $45), unit-suffixed (24 cm, 24 cm², 45°,
  // 35%, 5 days), and prefixed phrases (Profit of ₹120). The prefix/suffix
  // text is preserved verbatim on every distractor.
  const generic = a.match(/^([^\d]*)(-?\d+(?:\.\d+)?)([^\d]*)$/);
  if (generic) {
    const [, prefix, numStr, suffix] = generic;
    const correctNum = parseFloat(numStr);
    const isDecimal = numStr.includes('.');
    const allowNegative = correctNum < 0;
    const decimalPlaces = numStr.split('.')[1]?.length ?? 1;
    const nearMiss = numericNearMiss(correctNum, isDecimal, allowNegative, 3);
    return nearMiss.map(n => `${prefix}${isDecimal ? n.toFixed(decimalPlaces) : n}${suffix}`);
  }

  return [];
}

// Combines canBeMCQ + generateDistractors into the final options array
// (correct answer + distractors, shuffled), or null if this question can't
// be turned into MCQ — either because it's inherently open-ended, or because
// no distractor pattern matched its answer format.
export function buildMCQOptions(question: Question): string[] | null {
  if (!canBeMCQ(question)) return null;
  const distractors = generateDistractors(question.answer, question.question);
  if (distractors.length < 1) return null;

  const seen = new Set<string>();
  const options: string[] = [];
  for (const opt of [question.answer, ...distractors]) {
    const key = opt.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(opt);
  }
  if (options.length < 2) return null;
  return shuffleArray(options);
}

export class MathQuestionGenerator {
  private askedQuestions: Set<string> = new Set();
  private curriculum: string = 'CBSE';

  private generators: Record<string, (() => Question)[]> = {
    Easy: [
      this.easyAddition,
      this.easySubtraction,
      this.easyMultiplication,
      this.easyPlaceValue,
      this.easyOddEven,
      this.easyFraction,
      this.easyTallyChart,
      this.easyProbability,
      this.easy2DShapes,
      this.likelihoodQuestions,
    ],
    Medium: [
      this.mediumWordProblem,
      this.mediumMultiplication,
      this.mediumDivision,
      this.mediumFactorsMultiples,
      this.mediumPrimeComposite,
      this.mediumSquareCube,
      this.mediumFractionAddition,
      this.mediumPerimeter,
      this.mediumMoney,
      this.mediumTime,
      this.mediumBarGraph,
      this.medium3DShapes,
      this.numberLineQuestions,
      this.percentageGridQuestions,
      this.likelihoodQuestions,
      this.fractionWallQuestions,
    ],
    Hard: [
      this.hardMultiStep,
      this.hardDivisionRemainder,
      this.hardMeasurement,
      this.hardFractionUnlike,
      this.hardGeometryAngles,
      this.hardPatterns,
      this.hardAlgebra,
      this.hardArea,
      this.hardSymmetry,
      this.hardProbability,
      this.hardWorkerDays,
      this.hardShopkeeperChallenge,
      this.hardMisleadingContext,
      this.hardInverseProblems,
      this.hardEstimateFirst,
      this.hardFindAllSolutions,
      this.hardSpotTheError,
      this.hardLogicalReasoning,
      this.hardMisleadingInfo,
      this.numberLineQuestions,
      this.hardExplainReasoning,
    ],
  };

  private topicGenerators: Record<string, (() => Question)[]> = {
    "Addition": [this.easyAddition],
    "Subtraction": [this.easySubtraction],
    "Multiplication": [this.easyMultiplication, this.mediumMultiplication, this.hardMultiStep],
    "Division": [this.mediumDivision, this.hardDivisionRemainder],
    "Place Value": [this.easyPlaceValue],
    "Odd/Even": [this.easyOddEven],
    "Fractions": [this.easyFraction, this.mediumFractionAddition, this.hardFractionUnlike, this.fractionWallQuestions, this.percentageGridQuestions],
    "Factors & Multiples": [this.mediumFactorsMultiples, this.hardFindAllSolutions],
    "Prime/Composite": [this.mediumPrimeComposite],
    "Squares & Cubes": [this.mediumSquareCube],
    "Geometry": [this.hardGeometryAngles, this.hardSymmetry, this.medium3DShapes],
    "Perimeter & Area": [this.mediumPerimeter, this.hardArea],
    "Money": [this.mediumMoney, this.hardShopkeeperChallenge],
    "Time": [this.mediumTime],
    "Patterns": [this.hardPatterns],
    "Algebra": [this.hardAlgebra],
    "Measurement": [this.hardMeasurement],
    "Data Handling": [this.easyTallyChart, this.easyProbability, this.mediumBarGraph, this.hardProbability, this.likelihoodQuestions],
    "2D Shapes": [this.easy2DShapes],
    "Number Line": [this.numberLineQuestions],
    "Word Problems": [
      this.mediumWordProblem,
      this.hardMultiStep,
      this.hardWorkerDays,
      this.hardMisleadingContext,
      this.hardInverseProblems,
      this.hardEstimateFirst,
      this.hardSpotTheError,
      this.hardLogicalReasoning,
      this.hardMisleadingInfo,
    ],
    "Explain & Reason": [this.hardExplainReasoning],
  };

  // Maps each generator function to its display topic when randomly selected.
  // Uses prototype method references (stable, not affected by minification).
  private detectTopicMap: Map<() => Question, string> = new Map([
    [this.easyAddition, "Addition"],
    [this.easySubtraction, "Subtraction"],
    [this.easyMultiplication, "Multiplication"],
    [this.easyPlaceValue, "Place Value"],
    [this.easyOddEven, "Odd/Even"],
    [this.easyFraction, "Fractions"],
    [this.easyTallyChart, "Data Handling"],
    [this.easyProbability, "Data Handling"],
    [this.easy2DShapes, "2D Shapes"],
    [this.mediumWordProblem, "Word Problems"],
    [this.mediumMultiplication, "Multiplication"],
    [this.mediumDivision, "Division"],
    [this.mediumFactorsMultiples, "Factors & Multiples"],
    [this.mediumPrimeComposite, "Prime/Composite"],
    [this.mediumSquareCube, "Squares & Cubes"],
    [this.mediumFractionAddition, "Fractions"],
    [this.mediumPerimeter, "Perimeter & Area"],
    [this.mediumMoney, "Money"],
    [this.mediumTime, "Time"],
    [this.mediumBarGraph, "Data Handling"],
    [this.medium3DShapes, "Geometry"],
    [this.hardMultiStep, "Word Problems"],
    [this.hardDivisionRemainder, "Division"],
    [this.hardMeasurement, "Measurement"],
    [this.hardFractionUnlike, "Fractions"],
    [this.hardGeometryAngles, "Geometry"],
    [this.hardPatterns, "Patterns"],
    [this.hardAlgebra, "Algebra"],
    [this.hardArea, "Perimeter & Area"],
    [this.hardSymmetry, "Geometry"],
    [this.hardProbability, "Data Handling"],
    [this.hardWorkerDays, "Word Problems"],
    [this.hardShopkeeperChallenge, "Money"],
    [this.hardMisleadingContext, "Word Problems"],
    [this.hardInverseProblems, "Word Problems"],
    [this.hardEstimateFirst, "Word Problems"],
    [this.hardFindAllSolutions, "Factors & Multiples"],
    [this.hardSpotTheError, "Word Problems"],
    [this.hardLogicalReasoning, "Word Problems"],
    [this.hardMisleadingInfo, "Word Problems"],
    [this.igcseInverseProblems, "Word Problems"],
    [this.igcseEstimateFirst, "Word Problems"],
    [this.igcseSpotTheError, "Word Problems"],
    [this.igcseLogicalReasoning, "Word Problems"],
    [this.igcseMisleadingInfo, "Word Problems"],
    [this.igcseShopkeeperChallenge, "Money"],
    [this.igcseMisleadingContext, "Word Problems"],
    [this.numberLineQuestions, "Number Line"],
    [this.percentageGridQuestions, "Fractions"],
    [this.likelihoodQuestions, "Data Handling"],
    [this.fractionWallQuestions, "Fractions"],
    [this.icseNumbers, "Numbers"],
    [this.icseFactorsMultiples, "Factors & Multiples"],
    [this.icseMixedNumbers, "Mixed Numbers"],
    [this.icseDecimals, "Decimals"],
    [this.icseWordProblems, "Word Problems"],
    [this.igcseNumberSense, "Number Sense"],
    [this.igcseDecimals, "Decimals & Percentages"],
    [this.igcseNumberLine, "Number Line"],
    [this.igcse3DShapes, "3D Shapes"],
    [this.igcseTransformations, "Transformations"],
    [this.igcseDataReasoning, "Data & Reasoning"],
    [this.igcseReasoning, "Reasoning"],
    [this.hardExplainReasoning, "Explain & Reason"],
  ]);

  // Maps each generator function to its Mock Exam competency tier (VSA/SA1/SA2/LA).
  // VSA = single-step recall/fact; SA1 = conceptual/visual (charts, diagrams, scales);
  // SA2 = direct computation; LA = multi-step narrative word problems.
  private competencyMap: Map<() => Question, Competency> = new Map([
    // VSA — recall / single-step
    [this.easyAddition, "VSA"],
    [this.easySubtraction, "VSA"],
    [this.easyMultiplication, "VSA"],
    [this.easyPlaceValue, "VSA"],
    [this.easyOddEven, "VSA"],
    [this.easyFraction, "VSA"],
    [this.mediumPrimeComposite, "VSA"],
    [this.mediumSquareCube, "VSA"],
    [this.easy2DShapes, "VSA"],
    [this.medium3DShapes, "VSA"],
    [this.igcse3DShapes, "VSA"],
    [this.igcseTransformations, "VSA"],

    // SA1 — conceptual / visual (charts, diagrams, scales).
    // Note: generators that ALWAYS embed an [[TALLY_SVG]] diagram (easyTallyChart,
    // mediumBarGraph, numberLineQuestions, percentageGridQuestions, likelihoodQuestions,
    // fractionWallQuestions) are deliberately left untagged here — jsPDF can't render
    // inline SVG, so a Mock Exam PDF can never use them; tagging them would starve
    // this section (see getMockExamQuestions' per-attempt SVG filter).
    [this.easyProbability, "SA1"],
    [this.hardSymmetry, "SA1"],
    [this.igcseDataReasoning, "SA1"],
    [this.igcseNumberLine, "SA1"],

    // SA2 — direct computation
    [this.mediumWordProblem, "SA2"],
    [this.mediumMultiplication, "SA2"],
    [this.mediumDivision, "SA2"],
    [this.mediumFactorsMultiples, "SA2"],
    [this.mediumFractionAddition, "SA2"],
    [this.mediumPerimeter, "SA2"],
    [this.mediumMoney, "SA2"],
    [this.mediumTime, "SA2"],
    [this.hardDivisionRemainder, "SA2"],
    [this.hardMeasurement, "SA2"],
    [this.hardFractionUnlike, "SA2"],
    [this.hardGeometryAngles, "SA2"],
    [this.hardPatterns, "SA2"],
    [this.hardAlgebra, "SA2"],
    [this.hardArea, "SA2"],
    [this.hardProbability, "SA2"],
    [this.icseNumbers, "SA2"],
    [this.icseFactorsMultiples, "SA2"],
    [this.icseMixedNumbers, "SA2"],
    [this.icseDecimals, "SA2"],
    [this.igcseNumberSense, "SA2"],
    [this.igcseDecimals, "SA2"],

    // LA — multi-step narrative word problems
    [this.hardMultiStep, "LA"],
    [this.hardWorkerDays, "LA"],
    [this.hardShopkeeperChallenge, "LA"],
    [this.hardMisleadingContext, "LA"],
    [this.hardInverseProblems, "LA"],
    [this.hardEstimateFirst, "LA"],
    [this.hardFindAllSolutions, "LA"],
    [this.hardSpotTheError, "LA"],
    [this.hardLogicalReasoning, "LA"],
    [this.hardMisleadingInfo, "LA"],
    [this.igcseShopkeeperChallenge, "LA"],
    [this.igcseMisleadingContext, "LA"],
    [this.igcseInverseProblems, "LA"],
    [this.igcseEstimateFirst, "LA"],
    [this.igcseSpotTheError, "LA"],
    [this.igcseLogicalReasoning, "LA"],
    [this.igcseMisleadingInfo, "LA"],
    [this.icseWordProblems, "LA"],
    [this.igcseReasoning, "LA"],
  ]);

  constructor(curriculum: 'CBSE' | 'ICSE' | 'IGCSE' = 'CBSE') {
    this.curriculum = curriculum
  }

  getTopics(): string[] {
    return Object.keys(this.getTopicGenerators()).sort();
  }

  private getTopicGenerators(): Record<string, (() => Question)[]> {
    if (this.curriculum === 'ICSE') {
      return {
        "Numbers": [this.icseNumbers],
        "Factors & Multiples": [this.icseFactorsMultiples],
        "Mixed Numbers": [this.icseMixedNumbers],
        "Decimals": [this.icseDecimals],
        "Word Problems": [this.icseWordProblems],
        "Addition": [this.easyAddition],
        "Subtraction": [this.easySubtraction],
        "Multiplication": [this.mediumMultiplication],
        "Division": [this.mediumDivision],
        "Fractions": [this.easyFraction, this.mediumFractionAddition, this.fractionWallQuestions, this.percentageGridQuestions],
        "Geometry": [this.easy2DShapes, this.medium3DShapes],
        "Measurement": [this.hardMeasurement],
        "Time": [this.mediumTime],
        "Money": [this.mediumMoney],
        "Data Handling": [this.easyTallyChart, this.mediumBarGraph, this.likelihoodQuestions],
        "Patterns": [this.hardPatterns],
        "Number Line": [this.numberLineQuestions],
        "Explain & Reason": [this.hardExplainReasoning],
      };
    }
    if (this.curriculum === 'IGCSE') {
      return {
        "Number Sense": [this.igcseNumberSense],
        "Decimals & Percentages": [this.igcseDecimals, this.percentageGridQuestions],
        "Number Line": [this.igcseNumberLine, this.numberLineQuestions],
        "3D Shapes": [this.igcse3DShapes],
        "Transformations": [this.igcseTransformations],
        "Data & Reasoning": [this.igcseDataReasoning, this.likelihoodQuestions],
        "Reasoning": [this.igcseReasoning],
        "Addition": [this.easyAddition],
        "Subtraction": [this.easySubtraction],
        "Multiplication": [this.mediumMultiplication],
        "Division": [this.mediumDivision],
        "Fractions": [this.easyFraction, this.fractionWallQuestions],
        "Geometry": [this.easy2DShapes, this.hardGeometryAngles],
        "Measurement": [this.hardMeasurement],
        "Patterns": [this.hardPatterns],
        "Algebra": [this.hardAlgebra],
        "Word Problems": [
          this.igcseInverseProblems,
          this.igcseEstimateFirst,
          this.hardFindAllSolutions,
          this.igcseSpotTheError,
          this.igcseLogicalReasoning,
          this.igcseMisleadingInfo,
          this.igcseShopkeeperChallenge,
          this.igcseMisleadingContext,
        ],
        "Explain & Reason": [this.hardExplainReasoning],
      };
    }
    return this.topicGenerators;
  }

  // Returns the difficulty-random generator pool, swapping in international-context
  // variants of the Batch A "cognitive difficulty" generators for IGCSE's Hard tier
  // (same question shapes, dollars/international names instead of rupees/Indian names).
  private getDifficultyGenerators(difficulty: string): (() => Question)[] {
    const base = this.generators[difficulty] || this.generators.Easy;
    if (this.curriculum === 'IGCSE' && difficulty === 'Hard') {
      const swapMap = new Map<() => Question, () => Question>([
        [this.hardInverseProblems, this.igcseInverseProblems],
        [this.hardEstimateFirst, this.igcseEstimateFirst],
        [this.hardSpotTheError, this.igcseSpotTheError],
        [this.hardLogicalReasoning, this.igcseLogicalReasoning],
        [this.hardMisleadingInfo, this.igcseMisleadingInfo],
        [this.hardShopkeeperChallenge, this.igcseShopkeeperChallenge],
        [this.hardMisleadingContext, this.igcseMisleadingContext],
      ]);
      return base.map(fn => swapMap.get(fn) || fn);
    }
    return base;
  }

  // Resolves the candidate generator functions for a Mock Exam topic filter.
  // Empty/["All Topics"] falls back to every generator function this curriculum knows about.
  // Self-assess generators (e.g. hardExplainReasoning / "Explain & Reason") are excluded
  // here — a mock exam paper needs a fixed, printable mark scheme, which self-assess
  // questions don't have. If a topic filter resolves to nothing but self-assess
  // generators, this falls back to the full (non-self-assess) pool rather than an
  // empty set.
  private getCandidateFunctionsForTopics(topics: string[]): (() => Question)[] {
    const topicGens = this.getTopicGenerators();
    const allFns = new Set<() => Question>();
    Object.values(topicGens).forEach(fns => fns.forEach(fn => { if (fn !== this.hardExplainReasoning) allFns.add(fn) }));

    if (!topics || topics.length === 0 || topics.includes('All Topics')) {
      return Array.from(allFns);
    }

    const filtered = new Set<() => Question>();
    for (const t of topics) {
      const fns = topicGens[t];
      if (fns) fns.forEach(fn => { if (fn !== this.hardExplainReasoning) filtered.add(fn) });
    }
    return filtered.size > 0 ? Array.from(filtered) : Array.from(allFns);
  }

  // Builds a competency-weighted Mock Exam paper: VSA/SA1/SA2/LA sections sized per
  // MOCK_EXAM_STRUCTURE, drawn from the topic-filtered candidate pool, deduplicated
  // within the exam, and never including SVG-based questions (can't render in jsPDF).
  getMockExamQuestions(topics: string[], totalMarks: 25 | 50): Record<Competency, Question[]> {
    const structure = MOCK_EXAM_STRUCTURE[totalMarks];
    const candidates = this.getCandidateFunctionsForTopics(topics);

    const bySection: Record<Competency, (() => Question)[]> = { VSA: [], SA1: [], SA2: [], LA: [] };
    for (const fn of candidates) {
      const competency = this.competencyMap.get(fn);
      if (competency) bySection[competency].push(fn);
    }

    const generateSection = (count: number, competencyFns: (() => Question)[], mcqOnly = false): Question[] => {
      const pool = competencyFns.length > 0 ? competencyFns : candidates;
      const questions: Question[] = [];
      const seenInExam = new Set<string>();
      const usedFns = new Set<() => Question>();
      const topicCounts = new Map<string, number>();
      const maxAttempts = count * 40;
      let attempts = 0;

      const topicOf = (fn: () => Question): string => this.detectTopicMap.get(fn) || 'General';

      // Prefer a topic that has appeared least often in this section so far (spreading
      // across topics, not just generator functions), then within that topic prefer a
      // generator FUNCTION not yet used, so the same question template can't repeat
      // until every unique generator for that topic has already been used.
      const pickFn = (): (() => Question) => {
        const minCount = Math.min(...pool.map(fn => topicCounts.get(topicOf(fn)) ?? 0));
        const leastUsedTopicFns = pool.filter(fn => (topicCounts.get(topicOf(fn)) ?? 0) === minCount);
        const unused = leastUsedTopicFns.filter(fn => !usedFns.has(fn));
        const choices = unused.length > 0 ? unused : leastUsedTopicFns;
        return choices[Math.floor(Math.random() * choices.length)];
      };

      const record = (fn: () => Question, raw: Question, options?: string[]) => {
        usedFns.add(fn);
        const topic = topicOf(fn);
        topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
        questions.push({ ...raw, topic, ...(options ? { options } : {}) });
      };

      while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        const fn = pickFn();
        const raw = fn.call(this) as Question;
        if (raw.question.includes('[[TALLY_SVG]]')) continue;
        if (raw.selfAssess) continue;
        if (seenInExam.has(raw.question)) continue;
        let options: string[] | undefined;
        if (mcqOnly) {
          options = buildMCQOptions(raw) ?? undefined;
          if (!options) continue;
        }
        seenInExam.add(raw.question);
        record(fn, raw, options);
      }

      // Guarantee the exact requested count even if the pool ran out of unique,
      // non-SVG variety — repeats are preferable to a short exam paper. For MCQ-only
      // sections, also retry (bounded) for a question whose answer can become MCQ;
      // if that budget runs out, accept it without options rather than loop forever.
      while (questions.length < count) {
        const fn = pickFn();
        let raw = fn.call(this) as Question;
        let tries = 0;
        let options: string[] | undefined;
        while (tries < 20) {
          if (raw.question.includes('[[TALLY_SVG]]') || raw.selfAssess) {
            raw = fn.call(this) as Question;
            tries++;
            continue;
          }
          if (mcqOnly) {
            options = buildMCQOptions(raw) ?? undefined;
            if (!options) {
              raw = fn.call(this) as Question;
              tries++;
              continue;
            }
          }
          break;
        }
        record(fn, raw, options);
      }

      return questions;
    };

    return {
      VSA: generateSection(structure.VSA.count, bySection.VSA, true),
      SA1: generateSection(structure.SA1.count, bySection.SA1),
      SA2: generateSection(structure.SA2.count, bySection.SA2),
      LA: generateSection(structure.LA.count, bySection.LA),
    };
  }

  clearSession(): void {
    this.askedQuestions.clear();
  }

  generate(difficulty: string, topic?: string): Question {
    let question: Question | null = null;

    for (let attempt = 0; attempt < 6; attempt++) {
      let q: Question;
      if (topic && topic in this.getTopicGenerators()) {
        const fns = this.getTopicGenerators()[topic];
        const fn = fns[Math.floor(Math.random() * fns.length)];
        q = { ...fn.call(this), topic };
      } else {
        const generators = this.getDifficultyGenerators(difficulty);
        const fn = generators[Math.floor(Math.random() * generators.length)];
        const result = fn.call(this) as Question;
        q = { ...result, topic: this.detectTopicMap.get(fn) || "General" };
      }

      if (!this.askedQuestions.has(q.question)) {
        question = q;
        break;
      }

      if (attempt === 5) {
        question = q;
      }
    }

    this.askedQuestions.add(question!.question);
    return question!;
  }

  private easyAddition(): Question {
    const a = Math.floor(Math.random() * 90) + 10;
    let b = Math.floor(Math.random() * 90) + 10;
    while (b === a) b = Math.floor(Math.random() * 90) + 10;
    const total = a + b;
    const t = Math.floor(Math.random() * 4);
    const shopItems = ['pens', 'books', 'chocolates', 'mangoes', 'apples', 'biscuits'];
    const item = shopItems[Math.floor(Math.random() * shopItems.length)];
    switch (t) {
      case 0:
        return { question: `What is ${a} + ${b}?`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
      case 1:
        return { question: `A shop has ${a} red ${item} and ${b} blue ${item}. How many ${item} in total?`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
      case 2:
        return { question: `Find the sum of ${a} and ${b}.`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
      default:
        return { question: `${a} students are in class A and ${b} in class B. How many students altogether?`, answer: total.toString(), working: `Working:\n${a} + ${b} = ${total}` };
    }
  }

  private easySubtraction(): Question {
    const a = Math.floor(Math.random() * 91) + 30;
    const b = Math.floor(Math.random() * (a - 10)) + 10;
    const difference = a - b;
    const t = Math.floor(Math.random() * 4);
    const fruits = ['mangoes', 'apples', 'oranges', 'bananas'];
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const animalContexts = [
      { animal: 'birds', place: 'a tree', action: 'fly away' },
      { animal: 'fish', place: 'a pond', action: 'swim away' },
      { animal: 'cows', place: 'a field', action: 'wander off' },
      { animal: 'butterflies', place: 'a garden', action: 'fly away' },
    ];
    const ctx = animalContexts[Math.floor(Math.random() * animalContexts.length)];
    switch (t) {
      case 0:
        return { question: `What is ${a} - ${b}?`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
      case 1:
        return { question: `A basket has ${a} ${fruit}. ${b} are eaten. How many are left?`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
      case 2:
        return { question: `Find the difference between ${a} and ${b}.`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
      default:
        return { question: `There are ${a} ${ctx.animal} in ${ctx.place}. ${b} ${ctx.action}. How many remain?`, answer: difference.toString(), working: `Working:\n${a} - ${b} = ${difference}` };
    }
  }

  private easyMultiplication(): Question {
    const a = Math.floor(Math.random() * 11) + 2;
    const b = Math.floor(Math.random() * 9) + 2;
    const product = a * b;
    const t = Math.floor(Math.random() * 4);
    const rowItems = ['apples', 'mangoes', 'oranges', 'chocolates'];
    const rowItem = rowItems[Math.floor(Math.random() * rowItems.length)];
    const handItems = ['pencils', 'notebooks', 'books', 'pens'];
    const handItem = handItems[Math.floor(Math.random() * handItems.length)];
    switch (t) {
      case 0:
        return { question: `What is ${a} × ${b}?`, answer: product.toString(), working: `Working:\n${a} × ${b} = ${product}` };
      case 1:
        return { question: `A box has ${a} rows of ${b} ${rowItem}. How many ${rowItem} in total?`, answer: product.toString(), working: `Working:\n${a} rows × ${b} = ${product} ${rowItem}` };
      case 2:
        return { question: `Find the product of ${a} and ${b}.`, answer: product.toString(), working: `Working:\n${a} × ${b} = ${product}` };
      default:
        return { question: `${a} children each have ${b} ${handItem}. How many ${handItem} altogether?`, answer: product.toString(), working: `Working:\n${a} × ${b} = ${product}` };
    }
  }

  private mediumWordProblem(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const boxes = Math.floor(Math.random() * 7) + 3;
      const pencils = Math.floor(Math.random() * 5) + 4;
      return {
        question: `A shopkeeper has ${boxes} boxes. Each box has ${pencils} pencils.\nHow many pencils are there in all?`,
        answer: (boxes * pencils).toString(),
        working: `Working:\n${boxes} boxes × ${pencils} pencils = ${boxes * pencils} pencils`,
      };
    } else if (t === 1) {
      const coaches = Math.floor(Math.random() * 8) + 3;
      const seats = Math.floor(Math.random() * 12) + 8;
      return {
        question: `A train has ${coaches} coaches. Each coach has ${seats} seats.\nHow many seats are there in total?`,
        answer: (coaches * seats).toString(),
        working: `Working:\n${coaches} coaches × ${seats} seats = ${coaches * seats} seats`,
      };
    } else if (t === 2) {
      const rows = Math.floor(Math.random() * 6) + 3;
      const perRow = Math.floor(Math.random() * 7) + 4;
      const students = rows * perRow;
      return {
        question: `${students} students sit in ${rows} equal rows.\nHow many students are in each row?`,
        answer: perRow.toString(),
        working: `Working:\n${students} ÷ ${rows} = ${perRow} students per row`,
      };
    } else {
      const rows = Math.floor(Math.random() * 6) + 3;
      const perRow = Math.floor(Math.random() * 8) + 4;
      const trees = rows * perRow;
      return {
        question: `A farmer plants ${trees} trees in ${rows} equal rows.\nHow many trees are in each row?`,
        answer: perRow.toString(),
        working: `Working:\n${trees} ÷ ${rows} = ${perRow} trees per row`,
      };
    }
  }

  private mediumMultiplication(): Question {
    const a = Math.floor(Math.random() * 19) + 11;
    const b = Math.floor(Math.random() * 7) + 3;
    const product = a * b;
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      return {
        question: `Find the product:\n${a} × ${b} = ?`,
        answer: product.toString(),
        working: `Working:\n${a} × ${b} = ${product}`,
      };
    } else if (t === 1) {
      return {
        question: `Multiply ${a} by ${b}.`,
        answer: product.toString(),
        working: `Working:\n${a} × ${b} = ${product}`,
      };
    } else if (t === 2) {
      return {
        question: `A rectangle is ${a} cm long and ${b} cm wide.\nWhat is its area?`,
        answer: `${product} cm²`,
        working: `Working:\nArea = length × width\n= ${a} × ${b}\n= ${product} cm²`,
      };
    } else {
      return {
        question: `${a} packets each contain ${b} biscuits.\nHow many biscuits are there in total?`,
        answer: product.toString(),
        working: `Working:\n${a} × ${b} = ${product} biscuits`,
      };
    }
  }

  private mediumDivision(): Question {
    const divisor = Math.floor(Math.random() * 7) + 3;
    const quotient = Math.floor(Math.random() * 9) + 4;
    const dividend = divisor * quotient;
    const t = Math.floor(Math.random() * 4);
    const shareItems = ['chocolates', 'mangoes', 'apples', 'biscuits'];
    const shareItem = shareItems[Math.floor(Math.random() * shareItems.length)];
    const arrangeItems = ['books', 'notebooks', 'pencils', 'pens'];
    const arrangeItem = arrangeItems[Math.floor(Math.random() * arrangeItems.length)];
    switch (t) {
      case 0:
        return { question: `What is ${dividend} ÷ ${divisor}?`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
      case 1:
        return { question: `${dividend} ${shareItem} are shared equally among ${divisor} children. How many does each child get?`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
      case 2:
        return { question: `Find the quotient when ${dividend} is divided by ${divisor}.`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
      default:
        return { question: `${dividend} ${arrangeItem} are arranged in ${divisor} equal rows. How many ${arrangeItem} per row?`, answer: quotient.toString(), working: `Working:\n${dividend} ÷ ${divisor} = ${quotient}` };
    }
  }

  private hardMultiStep(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const rows = Math.floor(Math.random() * 5) + 3;
      const perRow = Math.floor(Math.random() * 7) + 6;
      const extra = Math.floor(Math.random() * 16) + 10;
      const total = rows * perRow + extra;
      return {
        question: `There are ${rows} rows of chairs with ${perRow} chairs in each row.\n${extra} extra chairs are added later. How many chairs are there now?`,
        answer: total.toString(),
        working: `Working:\nChairs in rows = ${rows} × ${perRow} = ${rows * perRow}\nAdd extra chairs = ${rows * perRow} + ${extra} = ${total}`,
      };
    } else if (t === 1) {
      const sold = Math.floor(Math.random() * 30) + 10;
      const added = Math.floor(Math.random() * 20) + 5;
      const initial = sold + Math.floor(Math.random() * 20) + 15;
      const result = initial - sold + added;
      return {
        question: `A shopkeeper had ${initial} items. He sold ${sold} items and then received ${added} new ones.\nHow many items does he have now?`,
        answer: result.toString(),
        working: `Working:\nStart: ${initial}\nAfter selling: ${initial} - ${sold} = ${initial - sold}\nAfter receiving: ${initial - sold} + ${added} = ${result}`,
      };
    } else if (t === 2) {
      const initial = Math.floor(Math.random() * 20) + 30;
      const left = Math.floor(Math.random() * 10) + 5;
      const joined = Math.floor(Math.random() * 10) + 5;
      const result = initial - left + joined;
      return {
        question: `A class has ${initial} students. ${left} students left and then ${joined} new students joined.\nHow many students are there now?`,
        answer: result.toString(),
        working: `Working:\nStart: ${initial}\nAfter leaving: ${initial} - ${left} = ${initial - left}\nAfter joining: ${initial - left} + ${joined} = ${result}`,
      };
    } else {
      const used = Math.floor(Math.random() * 30) + 10;
      const added = Math.floor(Math.random() * 20) + 5;
      const initial = used + Math.floor(Math.random() * 20) + 15;
      const result = initial - used + added;
      return {
        question: `A tank holds ${initial} litres of water. ${used} litres are used, then ${added} litres are added.\nHow many litres remain in the tank?`,
        answer: result.toString(),
        working: `Working:\nStart: ${initial} litres\nAfter using: ${initial} - ${used} = ${initial - used} litres\nAfter adding: ${initial - used} + ${added} = ${result} litres`,
      };
    }
  }

  private hardDivisionRemainder(): Question {
    const divisor = Math.floor(Math.random() * 6) + 4;
    const quotient = Math.floor(Math.random() * 7) + 8;
    const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
    const dividend = divisor * quotient + remainder;

    if (Math.random() < 0.5) {
      return {
        question: `Divide ${dividend} by ${divisor}.\nWrite the answer as quotient and remainder.`,
        answer: `Quotient = ${quotient}, Remainder = ${remainder}`,
        working: `Working:\n${divisor} x ${quotient} = ${divisor * quotient}\n${divisor * quotient} + ${remainder} = ${dividend}\nSo quotient = ${quotient} and remainder = ${remainder}`,
      };
    } else {
      // Inverse direction: reconstruct the dividend from divisor, quotient and remainder.
      return {
        question: `When a number is divided by ${divisor}, the quotient is ${quotient} and the remainder is ${remainder}.\nWhat is the number?`,
        answer: dividend.toString(),
        working: `Working:\nnumber = divisor × quotient + remainder\n= ${divisor} × ${quotient} + ${remainder}\n= ${divisor * quotient} + ${remainder}\n= ${dividend}`,
      };
    }
  }

  private hardMeasurement(): Question {
    const metres = Math.floor(Math.random() * 7) + 2;
    const centimetres = Math.floor(Math.random() * 86) + 10;
    const totalCm = metres * 100 + centimetres;
    return {
      question: `Convert this length into centimetres:\n${metres} m ${centimetres} cm = ?`,
      answer: `${totalCm} cm`,
      working: `Working:\n${metres} m = ${metres} x 100 = ${metres * 100} cm\n${metres * 100} cm + ${centimetres} cm = ${totalCm} cm`,
    };
  }

  private easyPlaceValue(): Question {
    const num = Math.floor(Math.random() * 900000) + 100000;
    const numStr = num.toString();
    const t = Math.floor(Math.random() * 5);

    if (t === 0) {
      const digitIndex = Math.floor(Math.random() * numStr.length);
      const digit = numStr[digitIndex];
      const placeValue = parseInt(digit) * Math.pow(10, numStr.length - digitIndex - 1);
      return {
        question: `What is the place value of ${digit} in the number ${num}?`,
        answer: placeValue.toString(),
        working: `Working:\nThe digit ${digit} is in the ${this.getPlaceName(numStr.length - digitIndex - 1)} position.\nPlace value = ${digit} × ${Math.pow(10, numStr.length - digitIndex - 1)} = ${placeValue}`,
      };
    } else if (t === 1) {
      const placeIndex = Math.floor(Math.random() * numStr.length);
      const placeName = this.getPlaceName(numStr.length - placeIndex - 1);
      const digit = numStr[placeIndex];
      return {
        question: `In the number ${num}, which digit is in the ${placeName} place?`,
        answer: digit,
        working: `Working:\n${num} has digits: ${numStr.split('').join(', ')}\nThe digit in the ${placeName} place is ${digit}.`,
      };
    } else if (t === 2) {
      const parts = numStr.split('').map((d, i) => parseInt(d) * Math.pow(10, numStr.length - i - 1)).filter(v => v > 0);
      const answer = parts.join(' + ');
      const workingLines = numStr.split('').map((d, i) => `${d} × ${Math.pow(10, numStr.length - i - 1)} = ${parseInt(d) * Math.pow(10, numStr.length - i - 1)}`);
      return {
        question: `Write the expanded form of ${num}.`,
        answer: answer,
        working: `Working:\n${workingLines.join('\n')}\nExpanded form = ${answer}`,
      };
    } else if (t === 3) {
      const digitIndex = Math.floor(Math.random() * numStr.length);
      const digit = numStr[digitIndex];
      return {
        question: `What is the face value of ${digit} in the number ${num}?`,
        answer: digit,
        working: `Working:\nFace value of a digit is the digit itself, regardless of its position.\nFace value of ${digit} = ${digit}`,
      };
    } else {
      // Inverse/repeated-scaling reasoning: work backwards through two ×10 steps.
      const name = this.randomIndianName();
      const finalValue = (Math.floor(Math.random() * 90) + 10) * 100;
      const original = finalValue / 100;
      return {
        question: `${name} multiplies a number by 10, then multiplies the result by 10 again.\n${name} ends up with ${finalValue}. What number did ${name} start with?`,
        answer: original.toString(),
        working: `Working:\nMultiplying by 10 twice is the same as multiplying by 100.\n${finalValue} ÷ 100 = ${original}\n${name} started with ${original}.`,
      };
    }
  }

  private easyOddEven(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const num = Math.floor(Math.random() * 200) + 1;
      const isOdd = num % 2 === 1;
      const answer = isOdd ? "Odd" : "Even";
      return {
        question: `Is ${num} an odd or even number?`,
        answer: answer,
        working: `Working:\n${num} ÷ 2 = ${Math.floor(num / 2)}${isOdd ? " remainder 1" : " exactly"}\nTherefore, ${num} is ${answer}.`,
      };
    } else if (t === 1) {
      const oddNum = Math.floor(Math.random() * 50) * 2 + 1;
      let even1 = Math.floor(Math.random() * 50) * 2 + 2;
      let even2 = Math.floor(Math.random() * 50) * 2 + 2;
      while (even2 === even1) even2 = Math.floor(Math.random() * 50) * 2 + 2;
      const nums = [oddNum, even1, even2].sort(() => Math.random() - 0.5);
      return {
        question: `Which of these is an odd number?\n${nums.join(', ')}`,
        answer: oddNum.toString(),
        working: `Working:\nA number is odd if it cannot be divided equally by 2.\n${nums.map(n => `${n}: ${n % 2 === 0 ? 'Even' : 'Odd'}`).join(', ')}\nThe odd number is ${oddNum}.`,
      };
    } else if (t === 2) {
      const num = Math.floor(Math.random() * 100) + 1;
      const nextEven = num % 2 === 0 ? num + 2 : num + 1;
      return {
        question: `What is the next even number after ${num}?`,
        answer: nextEven.toString(),
        working: `Working:\nEven numbers are multiples of 2.\n${num % 2 === 0 ? `${num} is even, so the next even number is ${num} + 2 = ${nextEven}.` : `${num} is odd, so the next even number is ${num} + 1 = ${nextEven}.`}`,
      };
    } else {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = a + Math.floor(Math.random() * 10) + 5;
      const odds = [];
      for (let i = a + 1; i < b; i++) { if (i % 2 !== 0) odds.push(i); }
      return {
        question: `How many odd numbers are there between ${a} and ${b}?`,
        answer: odds.length.toString(),
        working: `Working:\nOdd numbers between ${a} and ${b}: ${odds.length > 0 ? odds.join(', ') : 'none'}\nCount = ${odds.length}`,
      };
    }
  }

  private easyFraction(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const num1 = Math.floor(Math.random() * 8) + 1;
      const num2 = Math.floor(Math.random() * 8) + 1;
      if (num1 === num2) {
        return { question: `Which fraction is greater: ${num1}/10 or ${num2}/10?`, answer: `They are equal`, working: `Working:\nBoth fractions have denominator 10.\nCompare numerators: ${num1} = ${num2}\nTherefore, ${num1}/10 = ${num2}/10` };
      }
      const greater = Math.max(num1, num2);
      const lesser = Math.min(num1, num2);
      return { question: `Which fraction is greater: ${num1}/10 or ${num2}/10?`, answer: `${greater}/10`, working: `Working:\nBoth fractions have denominator 10.\nCompare numerators: ${greater} > ${lesser}\nTherefore, ${greater}/10 > ${lesser}/10` };
    } else if (t === 1) {
      const num = Math.floor(Math.random() * 7) + 1;
      const greaterNum = num + Math.floor(Math.random() * (9 - num)) + 1;
      return { question: `Write a fraction greater than ${num}/10.`, answer: `Any valid answer, e.g. ${greaterNum}/10`, working: `Working:\nA fraction with denominator 10 is greater if its numerator is larger.\n${num}/10 < ${greaterNum}/10 because ${num} < ${greaterNum}` };
    } else if (t === 2) {
      let n1 = Math.floor(Math.random() * 8) + 1;
      let n2 = Math.floor(Math.random() * 8) + 1;
      let n3 = Math.floor(Math.random() * 8) + 1;
      while (n2 === n1) n2 = Math.floor(Math.random() * 8) + 1;
      while (n3 === n1 || n3 === n2) n3 = Math.floor(Math.random() * 8) + 1;
      const sorted = [n1, n2, n3].sort((a, b) => a - b);
      return { question: `Arrange these fractions in ascending order:\n${n1}/10, ${n2}/10, ${n3}/10`, answer: sorted.map(n => `${n}/10`).join(', '), working: `Working:\nAll have denominator 10, so compare numerators.\nSmallest to largest: ${sorted[0]}, ${sorted[1]}, ${sorted[2]}\nAscending order: ${sorted.map(n => `${n}/10`).join(', ')}` };
    } else {
      const total = (Math.floor(Math.random() * 4) + 2) * (Math.floor(Math.random() * 3) + 2);
      const part = Math.floor(Math.random() * (total - 1)) + 1;
      return { question: `What fraction of ${total} is ${part}?`, answer: `${part}/${total}`, working: `Working:\nFraction = part ÷ total\n= ${part}/${total}` };
    }
  }

  private mediumFactorsMultiples(): Question {
    const type = Math.random() > 0.5 ? 'factors' : 'multiples';

    if (type === 'factors') {
      const num = (Math.floor(Math.random() * 12) + 2) * (Math.floor(Math.random() * 4) + 2);
      const factor = Math.floor(Math.random() * (num - 1)) + 1;
      const isFactorYes = num % factor === 0;
      return {
        question: `Is ${factor} a factor of ${num}?`,
        answer: isFactorYes ? "Yes" : "No",
        working: `Working:\n${num} ÷ ${factor} = ${num / factor}${isFactorYes ? " exactly" : " with remainder"}\nTherefore, ${factor} is ${isFactorYes ? "" : "not "} a factor of ${num}.`,
      };
    } else {
      const num = Math.floor(Math.random() * 12) + 2;
      const multiple = Math.floor(Math.random() * 6) + 1;
      const multipleOrdinal = this.ordinal(multiple);
      return {
        question: `What is the ${multipleOrdinal} multiple of ${num}?`,
        answer: (num * multiple).toString(),
        working: `Working:\n${multipleOrdinal} multiple of ${num} = ${num} × ${multiple} = ${num * multiple}`,
      };
    }
  }

  private mediumPrimeComposite(): Question {
    const allPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20];
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const pool = [...allPrimes.slice(0, 11), ...composites];
      const num = pool[Math.floor(Math.random() * pool.length)];
      const isPrime = allPrimes.includes(num);
      return {
        question: `Is ${num} a prime or composite number?`,
        answer: isPrime ? "Prime" : "Composite",
        working: `Working:\n${isPrime ? `${num} has only 2 factors: 1 and ${num}. It is PRIME.` : `${num} has more than 2 factors. It is COMPOSITE.`}`,
      };
    } else if (t === 1) {
      const ranges: [number, number][] = [[1, 20], [10, 30], [20, 40], [1, 15]];
      const [a, b] = ranges[Math.floor(Math.random() * ranges.length)];
      const inRange = allPrimes.filter(p => p > a && p < b);
      return {
        question: `List all prime numbers between ${a} and ${b}.`,
        answer: inRange.join(', '),
        working: `Working:\nPrime numbers have exactly 2 factors: 1 and themselves.\nPrimes between ${a} and ${b}: ${inRange.join(', ')}`,
      };
    } else if (t === 2) {
      const startOptions = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
      const startNum = startOptions[Math.floor(Math.random() * startOptions.length)];
      const nextPrime = allPrimes.find(p => p > startNum)!;
      return {
        question: `What is the smallest prime number greater than ${startNum}?`,
        answer: nextPrime.toString(),
        working: `Working:\nChecking numbers after ${startNum}...\n${nextPrime} has only 2 factors: 1 and ${nextPrime}.\nIt is the smallest prime greater than ${startNum}.`,
      };
    } else {
      const upToOptions = [10, 15, 20, 25, 30];
      const upTo = upToOptions[Math.floor(Math.random() * upToOptions.length)];
      const primesUpTo = allPrimes.filter(p => p <= upTo);
      return {
        question: `How many prime numbers are there between 1 and ${upTo}?`,
        answer: primesUpTo.length.toString(),
        working: `Working:\nPrimes up to ${upTo}: ${primesUpTo.join(', ')}\nCount = ${primesUpTo.length}`,
      };
    }
  }

  private mediumSquareCube(): Question {
    const type = Math.random() > 0.5 ? 'square' : 'cube';
    const num = Math.floor(Math.random() * 8) + 2;

    if (type === 'square') {
      const result = num * num;
      return {
        question: `Find the square of ${num}.\n${num}² = ?`,
        answer: result.toString(),
        working: `Working:\n${num}² = ${num} × ${num} = ${result}`,
      };
    } else {
      const result = num * num * num;
      return {
        question: `Find the cube of ${num}.\n${num}³ = ?`,
        answer: result.toString(),
        working: `Working:\n${num}³ = ${num} × ${num} × ${num} = ${result}`,
      };
    }
  }

  private mediumFractionAddition(): Question {
    const denom = Math.floor(Math.random() * 6) + 4;
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom - num1)) + 1;
      const sum = num1 + num2;
      return {
        question: `Add the fractions:\n${num1}/${denom} + ${num2}/${denom} = ?`,
        answer: `${sum}/${denom}`,
        working: `Working:\nBoth fractions have the same denominator.\n${num1}/${denom} + ${num2}/${denom} = (${num1} + ${num2})/${denom} = ${sum}/${denom}`,
      };
    } else if (t === 1) {
      const bigger = Math.floor(Math.random() * (denom - 2)) + 2;
      const smaller = Math.floor(Math.random() * (bigger - 1)) + 1;
      const diff = bigger - smaller;
      return {
        question: `Subtract the fractions:\n${bigger}/${denom} - ${smaller}/${denom} = ?`,
        answer: `${diff}/${denom}`,
        working: `Working:\nBoth fractions have the same denominator.\n${bigger}/${denom} - ${smaller}/${denom} = (${bigger} - ${smaller})/${denom} = ${diff}/${denom}`,
      };
    } else if (t === 2) {
      const num1 = Math.floor(Math.random() * Math.floor(denom / 2)) + 1;
      const num2 = Math.floor(Math.random() * (denom - num1 - 1)) + 1;
      const sum = num1 + num2;
      return {
        question: `A pizza is cut into ${denom} slices. Ravi ate ${num1} slices and Meena ate ${num2} slices.\nWhat fraction of the pizza was eaten?`,
        answer: `${sum}/${denom}`,
        working: `Working:\nRavi ate ${num1}/${denom}, Meena ate ${num2}/${denom}\nTotal eaten = (${num1} + ${num2})/${denom} = ${sum}/${denom}`,
      };
    } else {
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const complement = denom - num1;
      return {
        question: `What fraction must be added to ${num1}/${denom} to make 1 whole?`,
        answer: `${complement}/${denom}`,
        working: `Working:\n1 whole = ${denom}/${denom}\n${denom}/${denom} - ${num1}/${denom} = ${complement}/${denom}`,
      };
    }
  }

  private mediumPerimeter(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const length = Math.floor(Math.random() * 8) + 3;
      const width = Math.floor(Math.random() * 6) + 2;
      const perimeter = 2 * (length + width);
      return {
        question: `Find the perimeter of a rectangle with length ${length} cm and width ${width} cm.`,
        answer: `${perimeter} cm`,
        working: `Working:\nPerimeter of rectangle = 2 × (length + width)\n= 2 × (${length} + ${width})\n= 2 × ${length + width}\n= ${perimeter} cm`,
      };
    } else if (t === 1) {
      const side = Math.floor(Math.random() * 12) + 3;
      return {
        question: `A square has a side of ${side} cm. Find its perimeter.`,
        answer: `${4 * side} cm`,
        working: `Working:\nPerimeter of square = 4 × side\n= 4 × ${side}\n= ${4 * side} cm`,
      };
    } else if (t === 2) {
      const width = Math.floor(Math.random() * 6) + 2;
      const length = Math.floor(Math.random() * 8) + 3;
      const perimeter = 2 * (length + width);
      return {
        question: `The perimeter of a rectangle is ${perimeter} cm and its length is ${length} cm.\nFind its width.`,
        answer: `${width} cm`,
        working: `Working:\nPerimeter = 2 × (length + width)\n${perimeter} = 2 × (${length} + width)\n${perimeter / 2} = ${length} + width\nwidth = ${perimeter / 2} - ${length} = ${width} cm`,
      };
    } else {
      const length = Math.floor(Math.random() * 20) + 10;
      const width = Math.floor(Math.random() * 10) + 5;
      const perimeter = 2 * (length + width);
      return {
        question: `A park is ${length} m long and ${width} m wide.\nHow much fencing is needed to go all the way around it?`,
        answer: `${perimeter} m`,
        working: `Working:\nFencing needed = Perimeter = 2 × (length + width)\n= 2 × (${length} + ${width})\n= 2 × ${length + width}\n= ${perimeter} m`,
      };
    }
  }

  private mediumMoney(): Question {
    const t = Math.floor(Math.random() * 4);
    const shopItems = ['pen', 'book', 'chocolate', 'mango', 'apple', 'biscuit'];

    if (t === 0) {
      const item1 = shopItems[Math.floor(Math.random() * shopItems.length)];
      const item2 = shopItems.filter(i => i !== item1)[Math.floor(Math.random() * (shopItems.length - 1))];
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 30) + 10;
      return { question: `A ${item1} costs ₹${a} and a ${item2} costs ₹${b}. How much do both cost?`, answer: `₹${a + b}`, working: `Working:\n₹${a} + ₹${b} = ₹${a + b}` };
    } else if (t === 1) {
      const a = Math.floor(Math.random() * 50) + 30;
      const b = Math.floor(Math.random() * (a - 10)) + 10;
      return { question: `You have ₹${a} and spend ₹${b}. How much is left?`, answer: `₹${a - b}`, working: `Working:\n₹${a} - ₹${b} = ₹${a - b}` };
    } else if (t === 2) {
      const item = shopItems[Math.floor(Math.random() * shopItems.length)];
      const qty = Math.floor(Math.random() * 5) + 2;
      const price = Math.floor(Math.random() * 15) + 5;
      return { question: `Find the total cost of ${qty} ${item}s at ₹${price} each.`, answer: `₹${qty * price}`, working: `Working:\n${qty} × ₹${price} = ₹${qty * price}` };
    } else {
      const friends = Math.floor(Math.random() * 4) + 2;
      const totalAmount = friends * (Math.floor(Math.random() * 10) + 5);
      return { question: `Share ₹${totalAmount} equally among ${friends} friends. How much does each get?`, answer: `₹${totalAmount / friends}`, working: `Working:\n₹${totalAmount} ÷ ${friends} = ₹${totalAmount / friends}` };
    }
  }

  private mediumTime(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const h1 = Math.floor(Math.random() * 6) + 9;
      const m1 = Math.floor(Math.random() * 6) * 10;
      const durationMins = Math.floor(Math.random() * 90) + 30;
      const totalMins = h1 * 60 + m1 + durationMins;
      const h2 = Math.floor(totalMins / 60);
      const m2 = totalMins % 60;
      const dh = Math.floor(durationMins / 60);
      const dm = durationMins % 60;
      const durationStr = dh > 0 ? `${dh} hour${dh > 1 ? 's' : ''}${dm > 0 ? ` ${dm} minutes` : ''}` : `${durationMins} minutes`;
      return { question: `A movie starts at ${h1}:${m1.toString().padStart(2, '0')} and ends at ${h2}:${m2.toString().padStart(2, '0')}. How long is it?`, answer: durationStr, working: `Working:\nEnd time: ${h2}:${m2.toString().padStart(2, '0')}\nStart time: ${h1}:${m1.toString().padStart(2, '0')}\nDuration = ${durationMins} minutes = ${durationStr}` };
    } else if (t === 1) {
      const h = Math.floor(Math.random() * 10) + 7;
      const m = Math.floor(Math.random() * 6) * 10;
      const n = Math.floor(Math.random() * 5) + 1;
      const newH = h + n;
      return { question: `What time is ${n} hour${n > 1 ? 's' : ''} after ${h}:${m.toString().padStart(2, '0')}?`, answer: `${newH}:${m.toString().padStart(2, '0')}`, working: `Working:\nStart: ${h}:${m.toString().padStart(2, '0')}\nAdd ${n} hour${n > 1 ? 's' : ''}\nAnswer: ${newH}:${m.toString().padStart(2, '0')}` };
    } else if (t === 2) {
      const n = Math.floor(Math.random() * 5) + 1;
      return { question: `How many minutes are in ${n} hour${n > 1 ? 's' : ''}?`, answer: `${n * 60} minutes`, working: `Working:\n1 hour = 60 minutes\n${n} × 60 = ${n * 60} minutes` };
    } else {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.floor(Math.random() * 6) * 10;
      const addMinutes = Math.floor(Math.random() * 40) + 10;
      const endMinute = minute + addMinutes;
      const endHour = hour + Math.floor(endMinute / 60);
      const finalMinute = endMinute % 60;
      return { question: `A train leaves at ${hour}:${minute.toString().padStart(2, '0')} and arrives ${addMinutes} minutes later. What time does it arrive?`, answer: `${endHour}:${finalMinute.toString().padStart(2, '0')}`, working: `Working:\nLeave: ${hour}:${minute.toString().padStart(2, '0')}\nAdd ${addMinutes} minutes\nArrive: ${endHour}:${finalMinute.toString().padStart(2, '0')}` };
    }
  }

  private hardFractionUnlike(): Question {
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const denom1 = Math.floor(Math.random() * 4) + 2;
      const denom2 = Math.floor(Math.random() * 4) + 2;
      const num1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom2 - 1)) + 1;
      const lcm = this.lcm(denom1, denom2);
      const newNum1 = num1 * (lcm / denom1);
      const newNum2 = num2 * (lcm / denom2);
      const sumNum = newNum1 + newNum2;

      return {
        question: `Add: ${num1}/${denom1} + ${num2}/${denom2} = ?`,
        answer: `${sumNum}/${lcm}`,
        working: `Working:\nLCM of ${denom1} and ${denom2} = ${lcm}\n${num1}/${denom1} = ${newNum1}/${lcm}\n${num2}/${denom2} = ${newNum2}/${lcm}\n${newNum1}/${lcm} + ${newNum2}/${lcm} = ${sumNum}/${lcm}`,
      };
    } else if (t === 1) {
      const denomA = Math.floor(Math.random() * 4) + 2;
      const denomB = Math.floor(Math.random() * 4) + 2;
      const numA = Math.floor(Math.random() * (denomA - 1)) + 1;
      const numB = Math.floor(Math.random() * (denomB - 1)) + 1;
      const lcm = this.lcm(denomA, denomB);
      const lcmA = numA * (lcm / denomA);
      const lcmB = numB * (lcm / denomB);
      const bigger = lcmA >= lcmB ? { num: numA, denom: denomA, lcmVal: lcmA } : { num: numB, denom: denomB, lcmVal: lcmB };
      const smaller = lcmA >= lcmB ? { num: numB, denom: denomB, lcmVal: lcmB } : { num: numA, denom: denomA, lcmVal: lcmA };
      const diffNum = bigger.lcmVal - smaller.lcmVal;
      const answer = diffNum === 0 ? '0' : `${diffNum}/${lcm}`;

      return {
        question: `Subtract: ${bigger.num}/${bigger.denom} - ${smaller.num}/${smaller.denom} = ?`,
        answer,
        working: `Working:\nLCM of ${bigger.denom} and ${smaller.denom} = ${lcm}\n${bigger.num}/${bigger.denom} = ${bigger.lcmVal}/${lcm}\n${smaller.num}/${smaller.denom} = ${smaller.lcmVal}/${lcm}\n${bigger.lcmVal}/${lcm} - ${smaller.lcmVal}/${lcm} = ${answer}`,
      };
    } else if (t === 2) {
      // Multiply a unit fraction by a whole number.
      const denom = Math.floor(Math.random() * 8) + 3;
      const whole = Math.floor(Math.random() * 6) + 2;
      const g = this.gcd(whole, denom);
      const simplifiedNum = whole / g;
      const simplifiedDenom = denom / g;
      const answer = simplifiedDenom === 1 ? String(simplifiedNum) : `${simplifiedNum}/${simplifiedDenom}`;

      return {
        question: `Multiply: 1/${denom} × ${whole} = ?`,
        answer,
        working: `Working:\n1/${denom} × ${whole} = ${whole}/${denom}\n${g > 1 ? `Simplify by dividing top and bottom by ${g}: ${answer}` : `Already in simplest form: ${answer}`}`,
      };
    } else {
      // Divide a unit fraction by a whole number.
      const denom = Math.floor(Math.random() * 6) + 2;
      const whole = Math.floor(Math.random() * 6) + 2;
      const newDenom = denom * whole;

      return {
        question: `Divide: 1/${denom} ÷ ${whole} = ?`,
        answer: `1/${newDenom}`,
        working: `Working:\nDividing by a whole number multiplies the denominator.\n1/${denom} ÷ ${whole} = 1/(${denom} × ${whole}) = 1/${newDenom}`,
      };
    }
  }

  private hardGeometryAngles(): Question {
    const types = ['angle_sum', 'classify_triangle', 'straight_line', 'vertically_opposite'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'angle_sum') {
      const angle1 = Math.floor(Math.random() * 70) + 20;
      const angle2 = Math.floor(Math.random() * 70) + 20;
      const angle3 = 180 - angle1 - angle2;
      return {
        question: `In a triangle, two angles are ${angle1}° and ${angle2}°. What is the third angle?\n\n[[TALLY_SVG]]${this.generateShapeSVG('Triangle')}`,
        answer: `${angle3}°`,
        working: `Working:\nSum of angles in a triangle = 180°\n${angle1}° + ${angle2}° + ? = 180°\n? = 180° - ${angle1}° - ${angle2}° = ${angle3}°`,
      };
    } else if (type === 'classify_triangle') {
      // Two given angles bounded so the derived third angle is always positive (20-140°).
      const angle1 = Math.floor(Math.random() * 61) + 20;
      const angle2 = Math.floor(Math.random() * 61) + 20;
      const angle3 = 180 - angle1 - angle2;
      const maxAngle = Math.max(angle1, angle2, angle3);
      const classification = maxAngle === 90 ? 'Right' : maxAngle > 90 ? 'Obtuse' : 'Acute';
      return {
        question: `A triangle has two angles of ${angle1}° and ${angle2}°.\nFind the third angle, then classify the triangle as Acute, Right, or Obtuse.`,
        answer: classification,
        working: `Working:\nThird angle = 180° - ${angle1}° - ${angle2}° = ${angle3}°\nThe three angles are ${angle1}°, ${angle2}° and ${angle3}°.\nThe largest angle is ${maxAngle}°, so the triangle is ${classification}.`,
      };
    } else if (type === 'straight_line') {
      const useThree = Math.random() < 0.5;
      if (useThree) {
        const a = Math.floor(Math.random() * 60) + 20;
        const b = Math.floor(Math.random() * 60) + 20;
        const c = 180 - a - b;
        return {
          question: `Three angles lie on a straight line: ${a}°, ${b}°, and an unknown angle.\nFind the unknown angle.`,
          answer: `${c}°`,
          working: `Working:\nAngles on a straight line add up to 180°\n${a}° + ${b}° + ? = 180°\n? = 180° - ${a}° - ${b}° = ${c}°`,
        };
      } else {
        const a = Math.floor(Math.random() * 150) + 15;
        const b = 180 - a;
        return {
          question: `Two angles lie on a straight line.\n\n[[TALLY_SVG]]${this.generateAngleSVG(a)}\n\nOne angle is ${a}°. Find the other angle.`,
          answer: `${b}°`,
          working: `Working:\nAngles on a straight line add up to 180°\n${a}° + ? = 180°\n? = 180° - ${a}° = ${b}°`,
        };
      }
    } else {
      const a = Math.floor(Math.random() * 150) + 15;
      const b = 180 - a;
      return {
        question: `Two straight lines cross at a point, forming four angles.\nOne of the angles is ${a}°.\nFind the other three angles (list all three).`,
        answer: `${a}, ${b}, ${b}`,
        working: `Working:\nThe angle vertically opposite ${a}° is also ${a}° (vertically opposite angles are equal).\nThe two angles adjacent to it lie on a straight line with it: 180° - ${a}° = ${b}° each.\nThe other three angles are ${a}°, ${b}° and ${b}°.`,
      };
    }
  }

  private hardPatterns(): Question {
    const t = Math.floor(Math.random() * 3);

    if (t === 0) {
      // Multiplicative rule: each term is multiplied by a fixed ratio (not a constant-difference sequence).
      const start = Math.floor(Math.random() * 4) + 2;
      const ratio = Math.floor(Math.random() * 2) + 2;
      const terms = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
      const answer = terms[3] * ratio;
      const steps = terms.map((v, i) => (i === 0 ? `${v}` : `${terms[i - 1]} × ${ratio} = ${v}`)).join('\n');
      return {
        question: `Find the next number in the sequence:\n${terms.join(', ')}, ?`,
        answer: answer.toString(),
        working: `Working:\nEach term is found by multiplying the previous term by ${ratio}.\n${steps}\n${terms[3]} × ${ratio} = ${answer}`,
      };
    } else if (t === 1) {
      // Two-step alternating rule: add x, then add y, then add x, then add y...
      const start = Math.floor(Math.random() * 10) + 1;
      const x = Math.floor(Math.random() * 6) + 2;
      const y = Math.floor(Math.random() * 6) + 8;
      const steps = [x, y, x, y];
      const terms = [start];
      for (const step of steps) terms.push(terms[terms.length - 1] + step);
      const answer = terms[terms.length - 1] + x;
      const workingSteps = terms.map((v, i) => (i === 0 ? `${v}` : `+ ${steps[i - 1]} → ${v}`)).join('\n');
      return {
        question: `Find the next number in the sequence:\n${terms.join(', ')}, ?`,
        answer: answer.toString(),
        working: `Working:\nThe rule alternates two steps: add ${x}, then add ${y}, repeating.\n${workingSteps}\n+ ${x} → ${answer}`,
      };
    } else {
      // Increasing-difference rule: the gap between consecutive terms grows by a fixed amount each step.
      const start = Math.floor(Math.random() * 5) + 1;
      const firstDiff = Math.floor(Math.random() * 3) + 1;
      const increase = Math.floor(Math.random() * 2) + 1;
      const diffs = [firstDiff, firstDiff + increase, firstDiff + 2 * increase, firstDiff + 3 * increase];
      const terms = [start];
      for (const d of diffs) terms.push(terms[terms.length - 1] + d);
      const nextDiff = firstDiff + 4 * increase;
      const answer = terms[terms.length - 1] + nextDiff;
      return {
        question: `Find the next number in the sequence:\n${terms.join(', ')}, ?`,
        answer: answer.toString(),
        working: `Working:\nLook at the differences between consecutive terms: ${diffs.join(', ')}\nThe differences increase by ${increase} each time, so the next difference is ${nextDiff}.\n${terms[terms.length - 1]} + ${nextDiff} = ${answer}`,
      };
    }
  }

  // Renders a coefficient*variable term, omitting the coefficient when it is 1 (e.g. "x" not "1x").
  private formatAlgebraTerm(coeff: number, varName: string = 'x'): string {
    return coeff === 1 ? varName : `${coeff}${varName}`;
  }

  private hardAlgebra(): Question {
    const x = Math.floor(Math.random() * 10) + 1;
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 20) + 5;
    const sum = a * x + b;
    const term = this.formatAlgebraTerm(a);
    const divisionStep = a === 1 ? '' : `\nx = ${sum - b} ÷ ${a}\nx = ${x}`;

    return {
      question: `Solve: ${term} + ${b} = ${sum}. Find the value of x.`,
      answer: x.toString(),
      working: `Working:\n${term} + ${b} = ${sum}\n${term} = ${sum} - ${b}\n${term} = ${sum - b}${divisionStep}`,
    };
  }

  private hardArea(): Question {
    const length = Math.floor(Math.random() * 12) + 5;
    const width = Math.floor(Math.random() * 8) + 3;
    const area = length * width;

    return {
      question: `Find the area of a rectangle with length ${length} cm and width ${width} cm.`,
      answer: `${area} cm²`,
      working: `Working:\nArea of rectangle = length × width\n= ${length} × ${width}\n= ${area} cm²`,
    };
  }

  private hardWorkerDays(): Question {
    const scenarios = [
      { w1: 6, d1: 8, w2: 4, noun: 'wall' },
      { w1: 4, d1: 9, w2: 6, noun: 'fence' },
      { w1: 3, d1: 8, w2: 6, noun: 'road' },
      { w1: 5, d1: 6, w2: 3, noun: 'bridge' },
      { w1: 8, d1: 5, w2: 4, noun: 'wall' },
      { w1: 6, d1: 4, w2: 3, noun: 'house' },
      { w1: 4, d1: 6, w2: 8, noun: 'road' },
      { w1: 6, d1: 10, w2: 4, noun: 'fence' },
      { w1: 5, d1: 8, w2: 10, noun: 'garden' },
      { w1: 9, d1: 4, w2: 3, noun: 'wall' },
    ];
    const s = scenarios[Math.floor(Math.random() * scenarios.length)];
    const totalWork = s.w1 * s.d1;
    const d2 = totalWork / s.w2;
    return {
      question: `${s.w1} workers can build a ${s.noun} in ${s.d1} days.\nHow many days will ${s.w2} workers take to build the same ${s.noun}?`,
      answer: `${d2} days`,
      working: `Working:\nTotal work = ${s.w1} workers × ${s.d1} days = ${totalWork} worker-days\n${s.w2} workers would need: ${totalWork} ÷ ${s.w2} = ${d2} days`,
    };
  }

  private hardShopkeeperChallenge(): Question {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) {
      const items = [
        { item: 'toys', qty: 8, cp: 25, sp: 30 },
        { item: 'books', qty: 6, cp: 40, sp: 50 },
        { item: 'pens', qty: 12, cp: 10, sp: 12 },
        { item: 'bottles', qty: 5, cp: 60, sp: 80 },
        { item: 'toys', qty: 8, cp: 30, sp: 20 },
        { item: 'mugs', qty: 6, cp: 50, sp: 40 },
      ];
      const sc = items[Math.floor(Math.random() * items.length)];
      const { item, qty, cp, sp } = sc;
      const totalCost = qty * cp;
      const totalRevenue = (qty - 1) * sp;
      const diff = totalRevenue - totalCost;
      const label = diff >= 0 ? 'Profit' : 'Loss';
      const absVal = Math.abs(diff);
      return {
        question: `A shopkeeper buys ${qty} ${item} at ₹${cp} each.\nOne ${item.slice(0, -1)} is damaged and cannot be sold.\nThe rest are sold at ₹${sp} each.\nFind the profit or loss.`,
        answer: `${label} of ₹${absVal}`,
        working: `Working:\nTotal cost = ${qty} × ₹${cp} = ₹${totalCost}\nItems sold = ${qty} − 1 = ${qty - 1}\nTotal revenue = ${qty - 1} × ₹${sp} = ₹${totalRevenue}\n${label} = ₹${Math.max(totalRevenue, totalCost)} − ₹${Math.min(totalRevenue, totalCost)} = ₹${absVal} (${label})`,
      };
    } else if (t === 1) {
      const scenarios = [
        { qty: 4, price: 50, disc: 10 },
        { qty: 5, price: 40, disc: 20 },
        { qty: 3, price: 100, disc: 25 },
        { qty: 6, price: 50, disc: 10 },
        { qty: 4, price: 75, disc: 20 },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const total = s.qty * s.price;
      const discount = (total * s.disc) / 100;
      const finalAmount = total - discount;
      return {
        question: `Rajan buys ${s.qty} notebooks at ₹${s.price} each.\nThe shopkeeper gives a ${s.disc}% discount on the total bill.\nHow much does Rajan pay?`,
        answer: `₹${finalAmount}`,
        working: `Working:\nTotal before discount = ${s.qty} × ₹${s.price} = ₹${total}\nDiscount = ${s.disc}% of ₹${total} = ₹${discount}\nAmount paid = ₹${total} − ₹${discount} = ₹${finalAmount}`,
      };
    } else {
      const scenarios = [
        { wage: 200, days: 5, bonus: 100, expense: 150 },
        { wage: 150, days: 6, bonus: 50, expense: 200 },
        { wage: 300, days: 4, bonus: 200, expense: 250 },
        { wage: 250, days: 3, bonus: 100, expense: 300 },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const totalEarned = s.wage * s.days + s.bonus;
      const remaining = totalEarned - s.expense;
      return {
        question: `Priya earns ₹${s.wage} per day and works for ${s.days} days.\nShe also receives a bonus of ₹${s.bonus}.\nShe spends ₹${s.expense} on groceries.\nHow much money does she have left?`,
        answer: `₹${remaining}`,
        working: `Working:\nWages = ${s.days} × ₹${s.wage} = ₹${s.wage * s.days}\nTotal earnings = ₹${s.wage * s.days} + ₹${s.bonus} = ₹${totalEarned}\nMoney left = ₹${totalEarned} − ₹${s.expense} = ₹${remaining}`,
      };
    }
  }

  private hardMisleadingContext(): Question {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) {
      const length = Math.floor(Math.random() * 10) + 8;
      const width = Math.floor(Math.random() * 6) + 4;
      const depth = Math.floor(Math.random() * 3) + 2;
      const perimeter = 2 * (length + width);
      return {
        question: `A rectangular garden is ${length} m long, ${width} m wide, and has a ${depth} m tall boundary wall.\nWhat is the perimeter of the garden?`,
        answer: `${perimeter} m`,
        working: `Working:\nThe wall height (${depth} m) is NOT needed for the perimeter.\nPerimeter = 2 × (length + width) = 2 × (${length} + ${width}) = ${perimeter} m`,
      };
    } else if (t === 1) {
      const trios = [['Arjun', 'Bhavi', 'Chetna'], ['Rahul', 'Seema', 'Tarun'], ['Pooja', 'Qasim', 'Riya']];
      const trio = trios[Math.floor(Math.random() * trios.length)];
      const scoreA = Math.floor(Math.random() * 20) + 60;
      const scoreB = Math.floor(Math.random() * 20) + 60;
      const scoreC = Math.floor(Math.random() * 20) + 60;
      const diff = Math.abs(scoreA - scoreB);
      const higher = scoreA >= scoreB ? trio[0] : trio[1];
      const lower = scoreA >= scoreB ? trio[1] : trio[0];
      return {
        question: `${trio[0]} scored ${scoreA} marks, ${trio[1]} scored ${scoreB} marks, and ${trio[2]} scored ${scoreC} marks.\nBy how many marks did ${higher} score more than ${lower}?`,
        answer: `${diff} marks`,
        working: `Working:\n${trio[2]}'s score (${scoreC}) is not needed for this question.\nDifference = ${Math.max(scoreA, scoreB)} − ${Math.min(scoreA, scoreB)} = ${diff} marks`,
      };
    } else {
      const scenarios = [
        { speed: 60, time: 3, detail: 'red car', extra: 'The car was bought 2 years ago for ₹3,00,000.' },
        { speed: 80, time: 2, detail: 'blue bus', extra: 'The bus seats 42 passengers.' },
        { speed: 50, time: 4, detail: 'green truck', extra: 'The truck is 5 years old.' },
        { speed: 45, time: 4, detail: 'school van', extra: 'The van carries 3 teachers and 15 students.' },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const distance = s.speed * s.time;
      return {
        question: `A ${s.detail} travels at ${s.speed} km/h for ${s.time} hours.\n${s.extra}\nHow far does the ${s.detail} travel?`,
        answer: `${distance} km`,
        working: `Working:\nThe extra information is not needed to find the distance.\nDistance = Speed × Time = ${s.speed} × ${s.time} = ${distance} km`,
      };
    }
  }

  // IGCSE variants of hardShopkeeperChallenge / hardMisleadingContext — dollars/international
  // names instead of rupees/Indian names, otherwise identical question shapes.
  private igcseShopkeeperChallenge(): Question {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) {
      const items = [
        { item: 'toys', qty: 8, cp: 25, sp: 30 },
        { item: 'books', qty: 6, cp: 40, sp: 50 },
        { item: 'pens', qty: 12, cp: 10, sp: 12 },
        { item: 'bottles', qty: 5, cp: 60, sp: 80 },
        { item: 'toys', qty: 8, cp: 30, sp: 20 },
        { item: 'mugs', qty: 6, cp: 50, sp: 40 },
      ];
      const sc = items[Math.floor(Math.random() * items.length)];
      const { item, qty, cp, sp } = sc;
      const totalCost = qty * cp;
      const totalRevenue = (qty - 1) * sp;
      const diff = totalRevenue - totalCost;
      const label = diff >= 0 ? 'Profit' : 'Loss';
      const absVal = Math.abs(diff);
      return {
        question: `A shopkeeper buys ${qty} ${item} at $${cp} each.\nOne ${item.slice(0, -1)} is damaged and cannot be sold.\nThe rest are sold at $${sp} each.\nFind the profit or loss.`,
        answer: `${label} of $${absVal}`,
        working: `Working:\nTotal cost = ${qty} × $${cp} = $${totalCost}\nItems sold = ${qty} − 1 = ${qty - 1}\nTotal revenue = ${qty - 1} × $${sp} = $${totalRevenue}\n${label} = $${Math.max(totalRevenue, totalCost)} − $${Math.min(totalRevenue, totalCost)} = $${absVal} (${label})`,
      };
    } else if (t === 1) {
      const scenarios = [
        { qty: 4, price: 50, disc: 10 },
        { qty: 5, price: 40, disc: 20 },
        { qty: 3, price: 100, disc: 25 },
        { qty: 6, price: 50, disc: 10 },
        { qty: 4, price: 75, disc: 20 },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const name = this.randomInternationalName();
      const total = s.qty * s.price;
      const discount = (total * s.disc) / 100;
      const finalAmount = total - discount;
      return {
        question: `${name} buys ${s.qty} notebooks at $${s.price} each.\nThe shop gives a ${s.disc}% discount on the total bill.\nHow much does ${name} pay?`,
        answer: `$${finalAmount}`,
        working: `Working:\nTotal before discount = ${s.qty} × $${s.price} = $${total}\nDiscount = ${s.disc}% of $${total} = $${discount}\nAmount paid = $${total} − $${discount} = $${finalAmount}`,
      };
    } else {
      const scenarios = [
        { wage: 200, days: 5, bonus: 100, expense: 150 },
        { wage: 150, days: 6, bonus: 50, expense: 200 },
        { wage: 300, days: 4, bonus: 200, expense: 250 },
        { wage: 250, days: 3, bonus: 100, expense: 300 },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const name = this.randomInternationalName();
      const totalEarned = s.wage * s.days + s.bonus;
      const remaining = totalEarned - s.expense;
      return {
        question: `${name} earns $${s.wage} per day and works for ${s.days} days.\n${name} also receives a bonus of $${s.bonus}.\n${name} spends $${s.expense} on groceries.\nHow much money does ${name} have left?`,
        answer: `$${remaining}`,
        working: `Working:\nWages = ${s.days} × $${s.wage} = $${s.wage * s.days}\nTotal earnings = $${s.wage * s.days} + $${s.bonus} = $${totalEarned}\nMoney left = $${totalEarned} − $${s.expense} = $${remaining}`,
      };
    }
  }

  private igcseMisleadingContext(): Question {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) {
      const length = Math.floor(Math.random() * 10) + 8;
      const width = Math.floor(Math.random() * 6) + 4;
      const depth = Math.floor(Math.random() * 3) + 2;
      const perimeter = 2 * (length + width);
      return {
        question: `A rectangular garden is ${length} m long, ${width} m wide, and has a ${depth} m tall boundary wall.\nWhat is the perimeter of the garden?`,
        answer: `${perimeter} m`,
        working: `Working:\nThe wall height (${depth} m) is NOT needed for the perimeter.\nPerimeter = 2 × (length + width) = 2 × (${length} + ${width}) = ${perimeter} m`,
      };
    } else if (t === 1) {
      const trios = [['Emma', 'Liam', 'Sofia'], ['Noah', 'Olivia', 'Ethan'], ['Ava', 'Oliver', 'Mia']];
      const trio = trios[Math.floor(Math.random() * trios.length)];
      const scoreA = Math.floor(Math.random() * 20) + 60;
      const scoreB = Math.floor(Math.random() * 20) + 60;
      const scoreC = Math.floor(Math.random() * 20) + 60;
      const diff = Math.abs(scoreA - scoreB);
      const higher = scoreA >= scoreB ? trio[0] : trio[1];
      const lower = scoreA >= scoreB ? trio[1] : trio[0];
      return {
        question: `${trio[0]} scored ${scoreA} marks, ${trio[1]} scored ${scoreB} marks, and ${trio[2]} scored ${scoreC} marks.\nBy how many marks did ${higher} score more than ${lower}?`,
        answer: `${diff} marks`,
        working: `Working:\n${trio[2]}'s score (${scoreC}) is not needed for this question.\nDifference = ${Math.max(scoreA, scoreB)} − ${Math.min(scoreA, scoreB)} = ${diff} marks`,
      };
    } else {
      const scenarios = [
        { speed: 60, time: 3, detail: 'red car', extra: 'The car was bought 2 years ago for $30,000.' },
        { speed: 80, time: 2, detail: 'blue bus', extra: 'The bus seats 42 passengers.' },
        { speed: 50, time: 4, detail: 'green truck', extra: 'The truck is 5 years old.' },
        { speed: 45, time: 4, detail: 'school van', extra: 'The van carries 3 teachers and 15 students.' },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const distance = s.speed * s.time;
      return {
        question: `A ${s.detail} travels at ${s.speed} km/h for ${s.time} hours.\n${s.extra}\nHow far does the ${s.detail} travel?`,
        answer: `${distance} km`,
        working: `Working:\nThe extra information is not needed to find the distance.\nDistance = Speed × Time = ${s.speed} × ${s.time} = ${distance} km`,
      };
    }
  }

  private randomIndianName(): string {
    const names = ['Aarav', 'Diya', 'Kabir', 'Anaya', 'Vihaan', 'Ishaan', 'Saanvi', 'Reyansh', 'Myra', 'Arjun'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private randomInternationalName(): string {
    const names = ['Emma', 'Liam', 'Sofia', 'Noah', 'Ava', 'Oliver', 'Mia', 'Lucas', 'Olivia', 'Ethan'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private hardInverseProblems(): Question {
    const t = Math.floor(Math.random() * 4);
    const name = this.randomIndianName();

    if (t === 0) {
      const a = Math.floor(Math.random() * 20) + 4;
      const b = Math.floor(Math.random() * 15) + 3;
      const product = a * b;
      return {
        question: `The product of two numbers is ${product}. One number is ${a}.\nFind the other number.`,
        answer: b.toString(),
        working: `Working:\nOther number = Product ÷ known number\n= ${product} ÷ ${a} = ${b}`,
      };
    } else if (t === 1) {
      const divisor = Math.floor(Math.random() * 9) + 4;
      const quotient = Math.floor(Math.random() * 25) + 6;
      const number = divisor * quotient;
      return {
        question: `A number divided by ${divisor} gives ${quotient}.\nWhat is the number?`,
        answer: number.toString(),
        working: `Working:\nNumber ÷ ${divisor} = ${quotient}\nSo the number = ${quotient} × ${divisor} = ${number}`,
      };
    } else if (t === 2) {
      const purchases = ['a cricket bat', 'new shoes', 'a birthday gift', 'a school bag', 'sweets for Diwali'];
      const purchase = purchases[Math.floor(Math.random() * purchases.length)];
      const left = Math.floor(Math.random() * 200) + 50;
      const spent = Math.floor(Math.random() * 300) + 100;
      const start = spent + left;
      return {
        question: `After spending ₹${spent} on ${purchase}, ${name} has ₹${left} left.\nHow much money did ${name} start with?`,
        answer: `₹${start}`,
        working: `Working:\nMoney at start = amount spent + amount left\n= ₹${spent} + ₹${left} = ₹${start}`,
      };
    } else {
      const n = Math.floor(Math.random() * 50) + 10;
      const sum = Math.floor(Math.random() * 200) + 100;
      const number = sum - n;
      return {
        question: `${n} is added to a number to get ${sum}.\nFind the number.`,
        answer: number.toString(),
        working: `Working:\nnumber + ${n} = ${sum}\nnumber = ${sum} - ${n} = ${number}`,
      };
    }
  }

  private hardEstimateFirst(): Question {
    const t = Math.floor(Math.random() * 3);

    if (t === 0) {
      const a = Math.floor(Math.random() * 700) + 150;
      const b = Math.floor(Math.random() * 700) + 150;
      const exact = a + b;
      const ra = Math.round(a / 100) * 100;
      const rb = Math.round(b / 100) * 100;
      const estimate = ra + rb;
      return {
        question: `Estimate ${a} + ${b} by rounding each number to the nearest 100, then find the exact answer.\nGive both your estimate and the exact answer.`,
        answer: `Estimate: ${estimate}, Exact: ${exact}`,
        working: `Working:\n${a} rounds to ${ra}\n${b} rounds to ${rb}\nEstimate = ${ra} + ${rb} = ${estimate}\nExact = ${a} + ${b} = ${exact}`,
      };
    } else if (t === 1) {
      let a = Math.floor(Math.random() * 700) + 300;
      let b = Math.floor(Math.random() * 400) + 100;
      if (b > a) { [a, b] = [b, a]; }
      const exact = a - b;
      const ra = Math.round(a / 100) * 100;
      const rb = Math.round(b / 100) * 100;
      const estimate = ra - rb;
      return {
        question: `Estimate ${a} - ${b} by rounding each number to the nearest 100, then find the exact answer.\nGive both your estimate and the exact answer.`,
        answer: `Estimate: ${estimate}, Exact: ${exact}`,
        working: `Working:\n${a} rounds to ${ra}\n${b} rounds to ${rb}\nEstimate = ${ra} - ${rb} = ${estimate}\nExact = ${a} - ${b} = ${exact}`,
      };
    } else {
      const items = ['mangoes', 'notebooks', 'bangles', 'story books', 'pencil boxes'];
      const item = items[Math.floor(Math.random() * items.length)];
      const qty = Math.floor(Math.random() * 6) + 4;
      const price = Math.floor(Math.random() * 40) + 12;
      const exact = qty * price;
      const rp = Math.round(price / 10) * 10;
      const estimate = qty * rp;
      return {
        question: `A shopkeeper sells ${item} at ₹${price} each. Estimate the cost of ${qty} ${item} by rounding the price to the nearest ₹10, then find the exact cost.\nGive both your estimate and the exact answer.`,
        answer: `Estimate: ₹${estimate}, Exact: ₹${exact}`,
        working: `Working:\n₹${price} rounds to ₹${rp}\nEstimate = ${qty} × ₹${rp} = ₹${estimate}\nExact = ${qty} × ₹${price} = ₹${exact}`,
      };
    }
  }

  private hardFindAllSolutions(): Question {
    const t = Math.floor(Math.random() * 3);

    if (t === 0) {
      const a = Math.floor(Math.random() * 10) + 3;
      const b = Math.floor(Math.random() * 10) + 3;
      const product = a * b;
      return {
        question: `Write two numbers that multiply together to give ${product}.`,
        answer: `Any valid answer, e.g. ${a} and ${b}`,
        working: `Working:\n${a} × ${b} = ${product}\nAny two factors of ${product} that multiply together to give ${product} are correct.`,
      };
    } else if (t === 1) {
      const candidates = [12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 48];
      const n = candidates[Math.floor(Math.random() * candidates.length)];
      const pairs: string[] = [];
      for (let i = 1; i * i <= n; i++) {
        if (n % i === 0) pairs.push(`${i}×${n / i}`);
      }
      return {
        question: `Find all the factor pairs of ${n}.\nHow many pairs did you find?`,
        answer: `Any valid answer, e.g. ${pairs[0]}`,
        working: `Working:\nAll factor pairs of ${n}: ${pairs.join(', ')}\nThere are ${pairs.length} factor pairs in total — that's how you know you found them all.`,
      };
    } else {
      const s = Math.floor(Math.random() * 10) + 4;
      const found: number[] = [];
      for (let num = 10; num <= 99; num++) {
        const d1 = Math.floor(num / 10);
        const d2 = num % 10;
        if (d1 + d2 === s) found.push(num);
      }
      return {
        question: `List all two-digit numbers whose digits add up to ${s}.`,
        answer: `Any valid answer, e.g. ${found[0]}`,
        working: `Working:\nTwo-digit numbers with digit sum ${s}: ${found.join(', ')}\nThere are ${found.length} such numbers in total.`,
      };
    }
  }

  private hardSpotTheError(): Question {
    const t = Math.floor(Math.random() * 2);
    const name = this.randomIndianName();

    if (t === 0) {
      const a = Math.floor(Math.random() * 11) + 4;
      const b = Math.floor(Math.random() * 9) + 3;
      const correct = a * b;
      const mistakes = [correct + a, correct - a, correct + b, correct - b];
      let wrong = mistakes[Math.floor(Math.random() * mistakes.length)];
      if (wrong === correct || wrong <= 0) wrong = correct + a;
      return {
        question: `${name} calculated ${a} × ${b} = ${wrong}.\nIs this correct? If not, what is the right answer?`,
        answer: `No, the correct answer is ${correct}`,
        working: `Working:\n${a} × ${b} = ${correct}\n${name}'s answer of ${wrong} is incorrect.\nThe correct answer is ${correct}.`,
      };
    } else {
      const a = Math.floor(Math.random() * 300) + 100;
      const b = Math.floor(Math.random() * 250) + 50;
      const correct = a + b;
      const delta = Math.floor(Math.random() * 15) + 1;
      const wrong = Math.random() < 0.5 ? correct + delta : correct - delta;
      return {
        question: `${name} added ${a} + ${b} and got ${wrong}.\nIs this correct? If not, what is the right answer?`,
        answer: `No, the correct answer is ${correct}`,
        working: `Working:\n${a} + ${b} = ${correct}\n${name}'s answer of ${wrong} is incorrect.\nThe correct answer is ${correct}.`,
      };
    }
  }

  private hardLogicalReasoning(): Question {
    const t = Math.floor(Math.random() * 2);

    if (t === 0) {
      const settings = ['a school wall', 'a village well', 'a new road', 'a community hall', 'a garden fence'];
      const setting = settings[Math.floor(Math.random() * settings.length)];
      const settingNoun = setting.replace(/^a\s+/, '');
      const w1 = Math.floor(Math.random() * 6) + 3;
      const d1 = Math.floor(Math.random() * 8) + 4;
      const totalWork = w1 * d1;
      const divisors: number[] = [];
      for (let i = 2; i <= 12; i++) { if (totalWork % i === 0 && i !== w1) divisors.push(i); }
      const w2 = divisors.length > 0 ? divisors[Math.floor(Math.random() * divisors.length)] : w1 * 2;
      const d2 = totalWork / w2;
      return {
        question: `${w1} workers can build ${setting} in ${d1} days.\nHow many days will ${w2} workers take to build the same ${settingNoun}?`,
        answer: `${d2} days`,
        working: `Working:\nTotal work = ${w1} workers × ${d1} days = ${totalWork} worker-days\n${w2} workers would take: ${totalWork} ÷ ${w2} = ${d2} days\n(More workers means fewer days — this is inverse proportion.)`,
      };
    } else {
      const itemPairs: [string, string][] = [
        ['mangoes', 'mango'], ['bangles', 'bangle'], ['notebooks', 'notebook'], ['oranges', 'orange'], ['pencils', 'pencil'],
      ];
      const [item, itemSingular] = itemPairs[Math.floor(Math.random() * itemPairs.length)];
      const items1 = Math.floor(Math.random() * 6) + 3;
      const unitCost = Math.floor(Math.random() * 8) + 2;
      const cost1 = items1 * unitCost;
      const items2 = Math.floor(Math.random() * 10) + 5;
      const cost2 = items2 * unitCost;
      return {
        question: `If ${items1} ${item} cost ₹${cost1}, how much do ${items2} ${item} cost?`,
        answer: `₹${cost2}`,
        working: `Working:\nCost of 1 ${itemSingular} = ₹${cost1} ÷ ${items1} = ₹${unitCost}\nCost of ${items2} ${item} = ${items2} × ₹${unitCost} = ₹${cost2}\n(More items means more cost — this is direct proportion.)`,
      };
    }
  }

  private hardMisleadingInfo(): Question {
    const t = Math.floor(Math.random() * 2);
    const name = this.randomIndianName();

    if (t === 0) {
      const itemPairs: [string, string][] = [
        ['marbles', 'stickers'], ['mangoes', 'oranges'], ['pencils', 'erasers'], ['stamps', 'coins'], ['bangles', 'ribbons'],
      ];
      const [item1, item2] = itemPairs[Math.floor(Math.random() * itemPairs.length)];
      const a = Math.floor(Math.random() * 30) + 20;
      const b = Math.floor(Math.random() * 25) + 10;
      const c = Math.floor(Math.random() * (a - 5)) + 1;
      const left = a - c;
      return {
        question: `${name} has ${a} ${item1} and ${b} ${item2}.\n${name} gives away ${c} ${item1} to a friend.\nHow many ${item1} does ${name} have left?`,
        answer: left.toString(),
        working: `Working:\nThe number of ${item2} (${b}) is not needed for this question.\n${item1} left = ${a} - ${c} = ${left}`,
      };
    } else {
      const items = ['toffees', 'story books', 'crayons', 'chocolates'];
      const item = items[Math.floor(Math.random() * items.length)];
      const price = Math.floor(Math.random() * 8) + 3;
      const qty = Math.floor(Math.random() * 8) + 4;
      const age = Math.floor(Math.random() * 6) + 8;
      const total = price * qty;
      return {
        question: `${name}, who is ${age} years old, buys ${qty} ${item} at ₹${price} each.\nHow much does ${name} spend in total?`,
        answer: `₹${total}`,
        working: `Working:\nThe age (${age}) is not needed for this question.\nTotal cost = ${qty} × ₹${price} = ₹${total}`,
      };
    }
  }

  // ── IGCSE variants of the Batch A "cognitive difficulty" generators ─────────
  // Same question shapes as their CBSE counterparts above, but using international
  // contexts (dollars, international names) instead of Indian rupees/names.

  private igcseInverseProblems(): Question {
    const t = Math.floor(Math.random() * 4);
    const name = this.randomInternationalName();

    if (t === 0) {
      const a = Math.floor(Math.random() * 20) + 4;
      const b = Math.floor(Math.random() * 15) + 3;
      const product = a * b;
      return {
        question: `The product of two numbers is ${product}. One number is ${a}.\nFind the other number.`,
        answer: b.toString(),
        working: `Working:\nOther number = Product ÷ known number\n= ${product} ÷ ${a} = ${b}`,
      };
    } else if (t === 1) {
      const divisor = Math.floor(Math.random() * 9) + 4;
      const quotient = Math.floor(Math.random() * 25) + 6;
      const number = divisor * quotient;
      return {
        question: `A number divided by ${divisor} gives ${quotient}.\nWhat is the number?`,
        answer: number.toString(),
        working: `Working:\nNumber ÷ ${divisor} = ${quotient}\nSo the number = ${quotient} × ${divisor} = ${number}`,
      };
    } else if (t === 2) {
      const purchases = ['a new bicycle', 'football boots', 'a birthday present', 'a school bag', 'holiday souvenirs'];
      const purchase = purchases[Math.floor(Math.random() * purchases.length)];
      const left = Math.floor(Math.random() * 200) + 50;
      const spent = Math.floor(Math.random() * 300) + 100;
      const start = spent + left;
      return {
        question: `After spending $${spent} on ${purchase}, ${name} has $${left} left.\nHow much money did ${name} start with?`,
        answer: `$${start}`,
        working: `Working:\nMoney at start = amount spent + amount left\n= $${spent} + $${left} = $${start}`,
      };
    } else {
      const n = Math.floor(Math.random() * 50) + 10;
      const sum = Math.floor(Math.random() * 200) + 100;
      const number = sum - n;
      return {
        question: `${n} is added to a number to get ${sum}.\nFind the number.`,
        answer: number.toString(),
        working: `Working:\nnumber + ${n} = ${sum}\nnumber = ${sum} - ${n} = ${number}`,
      };
    }
  }

  private igcseEstimateFirst(): Question {
    const t = Math.floor(Math.random() * 3);

    if (t === 0) {
      const a = Math.floor(Math.random() * 700) + 150;
      const b = Math.floor(Math.random() * 700) + 150;
      const exact = a + b;
      const ra = Math.round(a / 100) * 100;
      const rb = Math.round(b / 100) * 100;
      const estimate = ra + rb;
      return {
        question: `Estimate ${a} + ${b} by rounding each number to the nearest 100, then find the exact answer.\nGive both your estimate and the exact answer.`,
        answer: `Estimate: ${estimate}, Exact: ${exact}`,
        working: `Working:\n${a} rounds to ${ra}\n${b} rounds to ${rb}\nEstimate = ${ra} + ${rb} = ${estimate}\nExact = ${a} + ${b} = ${exact}`,
      };
    } else if (t === 1) {
      let a = Math.floor(Math.random() * 700) + 300;
      let b = Math.floor(Math.random() * 400) + 100;
      if (b > a) { [a, b] = [b, a]; }
      const exact = a - b;
      const ra = Math.round(a / 100) * 100;
      const rb = Math.round(b / 100) * 100;
      const estimate = ra - rb;
      return {
        question: `Estimate ${a} - ${b} by rounding each number to the nearest 100, then find the exact answer.\nGive both your estimate and the exact answer.`,
        answer: `Estimate: ${estimate}, Exact: ${exact}`,
        working: `Working:\n${a} rounds to ${ra}\n${b} rounds to ${rb}\nEstimate = ${ra} - ${rb} = ${estimate}\nExact = ${a} - ${b} = ${exact}`,
      };
    } else {
      const items = ['postcards', 'notebooks', 'badges', 'storybooks', 'pencil cases'];
      const item = items[Math.floor(Math.random() * items.length)];
      const qty = Math.floor(Math.random() * 6) + 4;
      const price = Math.floor(Math.random() * 40) + 12;
      const exact = qty * price;
      const rp = Math.round(price / 10) * 10;
      const estimate = qty * rp;
      return {
        question: `A shop sells ${item} at $${price} each. Estimate the cost of ${qty} ${item} by rounding the price to the nearest $10, then find the exact cost.\nGive both your estimate and the exact answer.`,
        answer: `Estimate: $${estimate}, Exact: $${exact}`,
        working: `Working:\n$${price} rounds to $${rp}\nEstimate = ${qty} × $${rp} = $${estimate}\nExact = ${qty} × $${price} = $${exact}`,
      };
    }
  }

  private igcseSpotTheError(): Question {
    const t = Math.floor(Math.random() * 2);
    const name = this.randomInternationalName();

    if (t === 0) {
      const a = Math.floor(Math.random() * 11) + 4;
      const b = Math.floor(Math.random() * 9) + 3;
      const correct = a * b;
      const mistakes = [correct + a, correct - a, correct + b, correct - b];
      let wrong = mistakes[Math.floor(Math.random() * mistakes.length)];
      if (wrong === correct || wrong <= 0) wrong = correct + a;
      return {
        question: `${name} calculated ${a} × ${b} = ${wrong}.\nIs this correct? If not, what is the right answer?`,
        answer: `No, the correct answer is ${correct}`,
        working: `Working:\n${a} × ${b} = ${correct}\n${name}'s answer of ${wrong} is incorrect.\nThe correct answer is ${correct}.`,
      };
    } else {
      const a = Math.floor(Math.random() * 300) + 100;
      const b = Math.floor(Math.random() * 250) + 50;
      const correct = a + b;
      const delta = Math.floor(Math.random() * 15) + 1;
      const wrong = Math.random() < 0.5 ? correct + delta : correct - delta;
      return {
        question: `${name} added ${a} + ${b} and got ${wrong}.\nIs this correct? If not, what is the right answer?`,
        answer: `No, the correct answer is ${correct}`,
        working: `Working:\n${a} + ${b} = ${correct}\n${name}'s answer of ${wrong} is incorrect.\nThe correct answer is ${correct}.`,
      };
    }
  }

  private igcseLogicalReasoning(): Question {
    const t = Math.floor(Math.random() * 2);

    if (t === 0) {
      const settings = ['a garden wall', 'a playground fence', 'a new footpath', 'a community hall', 'a bike shed'];
      const setting = settings[Math.floor(Math.random() * settings.length)];
      const settingNoun = setting.replace(/^a\s+/, '');
      const w1 = Math.floor(Math.random() * 6) + 3;
      const d1 = Math.floor(Math.random() * 8) + 4;
      const totalWork = w1 * d1;
      const divisors: number[] = [];
      for (let i = 2; i <= 12; i++) { if (totalWork % i === 0 && i !== w1) divisors.push(i); }
      const w2 = divisors.length > 0 ? divisors[Math.floor(Math.random() * divisors.length)] : w1 * 2;
      const d2 = totalWork / w2;
      return {
        question: `${w1} workers can build ${setting} in ${d1} days.\nHow many days will ${w2} workers take to build the same ${settingNoun}?`,
        answer: `${d2} days`,
        working: `Working:\nTotal work = ${w1} workers × ${d1} days = ${totalWork} worker-days\n${w2} workers would take: ${totalWork} ÷ ${w2} = ${d2} days\n(More workers means fewer days — this is inverse proportion.)`,
      };
    } else {
      const itemPairs: [string, string][] = [
        ['oranges', 'orange'], ['badges', 'badge'], ['notebooks', 'notebook'], ['postcards', 'postcard'], ['pencils', 'pencil'],
      ];
      const [item, itemSingular] = itemPairs[Math.floor(Math.random() * itemPairs.length)];
      const items1 = Math.floor(Math.random() * 6) + 3;
      const unitCost = Math.floor(Math.random() * 8) + 2;
      const cost1 = items1 * unitCost;
      const items2 = Math.floor(Math.random() * 10) + 5;
      const cost2 = items2 * unitCost;
      return {
        question: `If ${items1} ${item} cost $${cost1}, how much do ${items2} ${item} cost?`,
        answer: `$${cost2}`,
        working: `Working:\nCost of 1 ${itemSingular} = $${cost1} ÷ ${items1} = $${unitCost}\nCost of ${items2} ${item} = ${items2} × $${unitCost} = $${cost2}\n(More items means more cost — this is direct proportion.)`,
      };
    }
  }

  private igcseMisleadingInfo(): Question {
    const t = Math.floor(Math.random() * 2);
    const name = this.randomInternationalName();

    if (t === 0) {
      const itemPairs: [string, string][] = [
        ['marbles', 'stickers'], ['badges', 'postcards'], ['pencils', 'erasers'], ['stamps', 'coins'], ['ribbons', 'buttons'],
      ];
      const [item1, item2] = itemPairs[Math.floor(Math.random() * itemPairs.length)];
      const a = Math.floor(Math.random() * 30) + 20;
      const b = Math.floor(Math.random() * 25) + 10;
      const c = Math.floor(Math.random() * (a - 5)) + 1;
      const left = a - c;
      return {
        question: `${name} has ${a} ${item1} and ${b} ${item2}.\n${name} gives away ${c} ${item1} to a friend.\nHow many ${item1} does ${name} have left?`,
        answer: left.toString(),
        working: `Working:\nThe number of ${item2} (${b}) is not needed for this question.\n${item1} left = ${a} - ${c} = ${left}`,
      };
    } else {
      const items = ['sweets', 'storybooks', 'crayons', 'chocolate bars'];
      const item = items[Math.floor(Math.random() * items.length)];
      const price = Math.floor(Math.random() * 8) + 3;
      const qty = Math.floor(Math.random() * 8) + 4;
      const age = Math.floor(Math.random() * 6) + 8;
      const total = price * qty;
      return {
        question: `${name}, who is ${age} years old, buys ${qty} ${item} at $${price} each.\nHow much does ${name} spend in total?`,
        answer: `$${total}`,
        working: `Working:\nThe age (${age}) is not needed for this question.\nTotal cost = ${qty} × $${price} = $${total}`,
      };
    }
  }

  // "Explain your reasoning" prompts — self-assessed, never auto-graded. Every
  // branch must set selfAssess: true and a non-empty, child-friendly modelAnswer;
  // canBeMCQ() and the Mock Exam / worksheet generators key off selfAssess to
  // exclude these from anything that needs a fixed, gradable answer.
  private hardExplainReasoning(): Question {
    const t = Math.floor(Math.random() * 8);
    const currency = this.curriculum === 'IGCSE' ? '$' : '₹';
    const name = this.curriculum === 'IGCSE' ? this.randomInternationalName() : this.randomIndianName();

    if (t === 0) {
      const l = Math.floor(Math.random() * 10) + 4;
      const w = Math.floor(Math.random() * 8) + 3;
      return {
        question: `Explain how you would find the area of a rectangle that is ${l} cm long and ${w} cm wide.`,
        answer: 'SELF_ASSESS',
        working: `Working:\nArea = length × width = ${l} × ${w} = ${l * w} cm²`,
        selfAssess: true,
        modelAnswer: `To find the area, I multiply the length by the width: ${l} cm × ${w} cm = ${l * w} cm². I use multiplication, not addition, because area measures the space covered by a flat shape — it's like counting ${l} rows of ${w} little squares each.`,
      };
    } else if (t === 1) {
      const qty = Math.floor(Math.random() * 8) + 4;
      const cp = Math.floor(Math.random() * 30) + 20;
      const sp = cp + Math.floor(Math.random() * 15) + 5;
      return {
        question: `${name} buys ${qty} toys at ${currency}${cp} each and sells all of them at ${currency}${sp} each.\nExplain how you would find out whether ${name} made a profit or a loss, and by how much.`,
        answer: 'SELF_ASSESS',
        working: `Working:\nTotal cost = ${qty} × ${currency}${cp} = ${currency}${qty * cp}\nTotal revenue = ${qty} × ${currency}${sp} = ${currency}${qty * sp}\nProfit = ${currency}${qty * sp} - ${currency}${qty * cp} = ${currency}${qty * (sp - cp)}`,
        selfAssess: true,
        modelAnswer: `First, I'd find the total cost by multiplying the quantity by the cost price: ${qty} × ${currency}${cp}. Then I'd find the total money made by multiplying the quantity by the selling price: ${qty} × ${currency}${sp}. Since the selling price is higher than the cost price, there's a profit — I subtract the total cost from the total revenue to find how much.`,
      };
    } else if (t === 2) {
      const d1 = Math.floor(Math.random() * 4) + 2;
      const d2 = Math.floor(Math.random() * 4) + 2;
      return {
        question: `Explain how you would find the LCM of ${d1} and ${d2}, and then find it.`,
        answer: 'SELF_ASSESS',
        working: `Working:\nLCM of ${d1} and ${d2} = ${this.lcm(d1, d2)}`,
        selfAssess: true,
        modelAnswer: `I would list the multiples of both numbers: multiples of ${d1} and multiples of ${d2}. Then I'd look for the smallest number that appears in both lists. That smallest common number is the LCM, which is ${this.lcm(d1, d2)}.`,
      };
    } else if (t === 3) {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
      const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 21, 22];
      const isPrimeQ = Math.random() < 0.5;
      const num = isPrimeQ ? primes[Math.floor(Math.random() * primes.length)] : composites[Math.floor(Math.random() * composites.length)];
      return {
        question: `Explain why ${num} is a ${isPrimeQ ? 'prime' : 'composite'} number.`,
        answer: 'SELF_ASSESS',
        working: `Working:\n${isPrimeQ ? `${num} has only two factors: 1 and ${num}. It is prime.` : `${num} has more than two factors. It is composite.`}`,
        selfAssess: true,
        modelAnswer: isPrimeQ
          ? `A number is prime if it has exactly two factors: 1 and itself. When I check ${num}, no other whole number divides it evenly except 1 and ${num}, so it is a prime number.`
          : `A number is composite if it has more than two factors. When I check ${num}, I can find at least one other number besides 1 and ${num} that divides it evenly, so it is a composite number.`,
      };
    } else if (t === 4) {
      const b = [2, 3, 4, 5, 6, 9, 10][Math.floor(Math.random() * 7)];
      const multiplier = Math.floor(Math.random() * 15) + 5;
      const a = b * multiplier;
      return {
        question: `Explain how you would check if ${a} is divisible by ${b}.`,
        answer: 'SELF_ASSESS',
        working: `Working:\n${a} ÷ ${b} = ${a / b}, no remainder, so ${a} is divisible by ${b}.`,
        selfAssess: true,
        modelAnswer: `I would divide ${a} by ${b}. If it divides exactly with no remainder left over, then ${a} is divisible by ${b}. When I try it, ${a} ÷ ${b} = ${a / b} exactly, so yes — ${a} is divisible by ${b}.`,
      };
    } else if (t === 5) {
      const claims = [
        { claim: `all even numbers are multiples of 4`, why: `Even numbers only need to divide evenly by 2. For example, 6 is even, but 6 ÷ 4 leaves a remainder, so 6 is not a multiple of 4. Multiples of 4 are a smaller group inside the even numbers, like 4, 8, 12, 16.` },
        { claim: `1/4 is bigger than 1/3 because 4 is a bigger number than 3`, why: `When the top number (numerator) is 1, a bigger bottom number (denominator) means the whole is cut into more, smaller pieces. So 1/4 is actually smaller than 1/3 — sharing one chocolate bar between 4 people gives each person less than sharing it between 3.` },
        { claim: `multiplying two numbers always makes the answer bigger`, why: `Multiplying by 1 keeps a number the same, like 5 × 1 = 5, and multiplying by 0 makes it 0, like 5 × 0 = 0. So multiplying does not always make the answer bigger — it depends on the numbers used.` },
        { claim: `a number ending in 0, like 30, is a multiple of 10 but not a multiple of 5`, why: `Since 10 = 2 × 5, every multiple of 10 is automatically also a multiple of 5. So a number ending in 0, like 30, is both a multiple of 10 and a multiple of 5.` },
      ];
      const pick = claims[Math.floor(Math.random() * claims.length)];
      return {
        question: `A friend says "${pick.claim}". Explain why they are wrong.`,
        answer: 'SELF_ASSESS',
        working: `Working:\n${pick.why}`,
        selfAssess: true,
        modelAnswer: pick.why,
      };
    } else if (t === 6) {
      const num = Math.floor(Math.random() * 9000) + 1000;
      const numStr = num.toString();
      const idx = Math.floor(Math.random() * numStr.length);
      const digit = numStr[idx];
      const placeName = this.getPlaceName(numStr.length - idx - 1);
      const placeValue = parseInt(digit) * Math.pow(10, numStr.length - idx - 1);
      return {
        question: `Explain the difference between the place value and face value of ${digit} in ${num}.`,
        answer: 'SELF_ASSESS',
        working: `Working:\nFace value of ${digit} = ${digit}\nPlace value of ${digit} = ${digit} × ${Math.pow(10, numStr.length - idx - 1)} = ${placeValue} (it is in the ${placeName} place)`,
        selfAssess: true,
        modelAnswer: `The face value of a digit is just the digit itself, so the face value of ${digit} is ${digit}. The place value depends on where the digit sits in the number — since ${digit} is in the ${placeName} place, its place value is ${placeValue}. Face value never changes, but place value changes depending on the digit's position.`,
      };
    } else {
      const a = Math.floor(Math.random() * 400) + 100;
      const b = Math.floor(Math.random() * 400) + 100;
      const roundedA = Math.round(a / 10) * 10;
      const roundedB = Math.round(b / 10) * 10;
      return {
        question: `Explain how you would estimate ${a} + ${b} without calculating the exact answer.`,
        answer: 'SELF_ASSESS',
        working: `Working:\nRound ${a} to the nearest 10 = ${roundedA}\nRound ${b} to the nearest 10 = ${roundedB}\nEstimate = ${roundedA} + ${roundedB} = ${roundedA + roundedB}\n(Exact answer: ${a + b})`,
        selfAssess: true,
        modelAnswer: `To estimate, I round each number to the nearest 10 first: ${a} rounds to ${roundedA}, and ${b} rounds to ${roundedB}. Then I add the rounded numbers: ${roundedA} + ${roundedB} = ${roundedA + roundedB}. This gives me a quick answer that's close to the real total without doing the exact addition.`,
      };
    }
  }

  private getPlaceName(power: number): string {
    const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
    return places[power] || 'higher place';
  }

  // 1→1st, 2→2nd, 3→3rd, 4-20→th (including 11-13), 21→21st, 22→22nd, 23→23rd, ...
  private ordinal(n: number): string {
    const rem100 = n % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  }

  private lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private generateBarChartSVG(data: { label: string; count: number }[]): string {
    const BAR_H = 24;
    const GAP = 16;
    const LEFT_COL = 80;
    const BASELINE_X = 90;
    const SCALE = 8;
    const SVG_W = 300;
    const PAD_TOP = 8;
    const PAD_BOT = 8;
    const rowH = BAR_H + GAP;
    const totalH = PAD_TOP + data.length * rowH - GAP + PAD_BOT;

    const rows = data.map((d, i) => {
      const y = PAD_TOP + i * rowH;
      const barW = Math.max(d.count * SCALE, 4);
      const labelY = y + BAR_H / 2;
      return [
        `<text x="${LEFT_COL - 6}" y="${labelY}" dominant-baseline="middle" text-anchor="end" font-size="13" fill="#374151" font-family="inherit">${d.label}</text>`,
        `<rect x="${BASELINE_X}" y="${y}" width="${barW}" height="${BAR_H}" rx="4" fill="#2563eb"/>`,
        `<text x="${BASELINE_X + barW + 6}" y="${labelY}" dominant-baseline="middle" font-size="13" fill="#1e40af" font-family="inherit">${d.count}</text>`,
      ].join('');
    });

    const ariaLabel = `Bar chart: ${data.map(d => d.label + ' ' + d.count).join(', ')}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${totalH}" viewBox="0 0 ${SVG_W} ${totalH}" role="img" aria-label="${ariaLabel}"><title>Bar chart showing: ${data.map(d => d.label + ': ' + d.count).join(', ')}</title>${rows.join('')}</svg>`;
  }

  private generateTallySVG(count: number): string {
    const LS = 8;           // px between vertical lines within a group
    const GG = 12;          // px gap between groups
    const PAD = 6;          // left/right padding
    const H = 50;           // SVG height
    const YT = 5;           // y top of vertical lines
    const YB = 45;          // y bottom (40px tall lines)
    const STROKE = '#2563eb';
    const SW = 2.5;

    const fullGroups = Math.floor(count / 5);
    const partial = count % 5;
    const lines: string[] = [];
    let x = PAD;

    for (let g = 0; g < fullGroups; g++) {
      const gx = x;
      for (let i = 0; i < 4; i++) {
        lines.push(`<line x1="${gx + i * LS}" y1="${YT}" x2="${gx + i * LS}" y2="${YB}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`);
      }
      // diagonal strike-through: bottom-left to top-right across all 4 lines
      lines.push(`<line x1="${gx - 4}" y1="${YB - 4}" x2="${gx + 3 * LS + 4}" y2="${YT + 4}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`);
      x = gx + 3 * LS + GG;
    }

    for (let i = 0; i < partial; i++) {
      lines.push(`<line x1="${x + i * LS}" y1="${YT}" x2="${x + i * LS}" y2="${YB}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`);
    }

    const endX = partial > 0 ? x + (partial - 1) * LS : x - GG;
    const totalWidth = endX + PAD;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${H}" viewBox="0 0 ${totalWidth} ${H}" role="img" aria-label="Tally chart showing ${count} marks"><title>Tally chart showing ${count} marks</title>${lines.join('')}</svg>`;
  }

  private generateShapeSVG(shape: string): string {
    const fill = '#eff6ff';
    const stroke = '#2563eb';
    const sw = 2.5;
    const W = 120, H = 120;
    const cx = 60, cy = 60;

    const polyPoints = (n: number, r: number): string =>
      Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      }).join(' ');

    let shapeEl: string;
    switch (shape) {
      case 'Triangle':
        shapeEl = `<polygon points="${polyPoints(3, 52)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        break;
      case 'Square':
        shapeEl = `<rect x="20" y="20" width="80" height="80" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        break;
      case 'Rectangle':
        shapeEl = `<rect x="10" y="30" width="100" height="60" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        break;
      case 'Pentagon':
        shapeEl = `<polygon points="${polyPoints(5, 50)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        break;
      case 'Hexagon':
        shapeEl = `<polygon points="${polyPoints(6, 50)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        break;
      case 'Circle':
        shapeEl = `<circle cx="${cx}" cy="${cy}" r="45" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        break;
      default:
        shapeEl = `<circle cx="${cx}" cy="${cy}" r="45" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagram of a ${shape}"><title>${shape} diagram</title>${shapeEl}</svg>`;
  }

  private generateAngleSVG(degrees: number): string {
    const W = 150, H = 120;
    const ox = 75, oy = 95;
    const rayLen = 65;
    const arcR = 28;

    const rad = (degrees * Math.PI) / 180;
    const rayEndX = (ox + rayLen * Math.cos(rad)).toFixed(1);
    const rayEndY = (oy - rayLen * Math.sin(rad)).toFixed(1);
    const arcEndX = (ox + arcR * Math.cos(rad)).toFixed(1);
    const arcEndY = (oy - arcR * Math.sin(rad)).toFixed(1);
    const largeArc = degrees > 180 ? 1 : 0;

    const halfRad = (degrees / 2) * (Math.PI / 180);
    const labelX = (ox + (arcR + 18) * Math.cos(halfRad)).toFixed(1);
    const labelY = (oy - (arcR + 18) * Math.sin(halfRad)).toFixed(1);

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Angle diagram showing ${degrees} degrees"><title>Angle diagram: ${degrees} degrees</title>` +
      `<line x1="${ox}" y1="${oy}" x2="${ox + rayLen}" y2="${oy}" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>` +
      `<line x1="${ox}" y1="${oy}" x2="${rayEndX}" y2="${rayEndY}" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>` +
      `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#374151" font-family="inherit">${degrees}°</text>` +
      `</svg>`
    );
  }

  private generateNumberLineSVG(min: number, max: number, marks: number[], highlightValue?: number): string {
    const W = 320, H = 70;
    const PAD = 20;
    const y = 35;
    const scale = (W - 2 * PAD) / (max - min);
    const xOf = (v: number) => PAD + (v - min) * scale;

    const ticks = marks.map(m => {
      const x = xOf(m).toFixed(1);
      return `<line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}" stroke="#2563eb" stroke-width="2"/>` +
        `<text x="${x}" y="${y + 22}" text-anchor="middle" font-size="12" fill="#374151" font-family="inherit">${m}</text>`;
    }).join('');

    let highlight = '';
    if (highlightValue !== undefined) {
      const hx = xOf(highlightValue).toFixed(1);
      highlight = `<circle cx="${hx}" cy="${y}" r="6" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>`;
    }

    const ariaLabel = `Number line from ${min} to ${max}${highlightValue !== undefined ? `, with a marker at ${highlightValue}` : ''}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${ariaLabel}"><title>${ariaLabel}</title>` +
      `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>` +
      ticks + highlight +
      `</svg>`;
  }

  private generatePercentageGridSVG(percent: number): string {
    const CELL = 18;
    const COLS = 10, ROWS = 10;
    const W = CELL * COLS, H = CELL * ROWS;
    const filled = Math.max(0, Math.min(100, Math.round(percent)));

    const cells: string[] = [];
    for (let i = 0; i < 100; i++) {
      const x = (i % COLS) * CELL;
      const y = Math.floor(i / COLS) * CELL;
      const fill = i < filled ? '#2563eb' : '#eff6ff';
      cells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${fill}" stroke="#94a3b8" stroke-width="0.5"/>`);
    }

    const ariaLabel = `Percentage grid with ${filled} out of 100 squares shaded`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${ariaLabel}"><title>${ariaLabel}</title>${cells.join('')}</svg>`;
  }

  private generateLikelihoodScaleSVG(position: number): string {
    const W = 340, H = 70;
    const PAD = 20;
    const y = 32;
    const clamped = Math.max(0, Math.min(1, position));
    const labels = ['Impossible', 'Unlikely', 'Even chance', 'Likely', 'Certain'];

    const labelEls = labels.map((label, i) => {
      const lx = (PAD + (i / (labels.length - 1)) * (W - 2 * PAD)).toFixed(1);
      return `<line x1="${lx}" y1="${y - 5}" x2="${lx}" y2="${y + 5}" stroke="#2563eb" stroke-width="1.5"/>` +
        `<text x="${lx}" y="${y + 24}" text-anchor="middle" font-size="10" fill="#374151" font-family="inherit">${label}</text>`;
    }).join('');

    const markerX = PAD + clamped * (W - 2 * PAD);
    const marker = `<polygon points="${markerX.toFixed(1)},${y - 14} ${(markerX - 6).toFixed(1)},${y - 24} ${(markerX + 6).toFixed(1)},${y - 24}" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>`;

    const ariaLabel = `Likelihood scale from Impossible to Certain, with a marker showing the likelihood of this event`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${ariaLabel}"><title>${ariaLabel}</title>` +
      `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>` +
      labelEls + marker +
      `</svg>`;
  }

  private generateFractionWallSVG(denominator: number, shaded: number): string {
    const W = 300, H = 50;
    const cellW = W / denominator;

    const cells: string[] = [];
    for (let i = 0; i < denominator; i++) {
      const x = (i * cellW).toFixed(1);
      const fill = i < shaded ? '#2563eb' : '#eff6ff';
      cells.push(`<rect x="${x}" y="0" width="${cellW.toFixed(1)}" height="${H}" fill="${fill}" stroke="#1e3a5f" stroke-width="1.5"/>`);
    }

    const ariaLabel = `Fraction wall divided into ${denominator} equal parts, ${shaded} of them shaded`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${ariaLabel}"><title>${ariaLabel}</title>${cells.join('')}</svg>`;
  }

  private easyTallyChart(): Question {
    const items = ['Apples', 'Oranges', 'Bananas', 'Grapes'];
    const item1 = items[Math.floor(Math.random() * items.length)];
    const count1 = Math.floor(Math.random() * 15) + 5;
    const svg = this.generateTallySVG(count1);

    return {
      question: `A tally chart shows:\n${item1}:\n\n[[TALLY_SVG]]${svg}\n\nHow many ${item1.toLowerCase()} were counted?`,
      answer: count1.toString(),
      working: `Working:\nEach group of 5 tally marks represents 5.\nYou have ${Math.floor(count1 / 5)} complete group${Math.floor(count1 / 5) !== 1 ? 's' : ''} = ${Math.floor(count1 / 5) * 5}\nPlus ${count1 % 5} extra = ${count1}`,
    };
  }

  private easyProbability(): Question {
    const outcomes = ['certain', 'impossible', 'possible'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    let question = '';
    let answer = '';
    let working = '';

    if (outcome === 'certain') {
      question = `Is it CERTAIN that the sun will rise tomorrow?`;
      answer = "Yes";
      working = `Working:\nSomething is CERTAIN if it will always happen.\nThe sun always rises every day, so it is CERTAIN.`;
    } else if (outcome === 'impossible') {
      question = `Is it IMPOSSIBLE for a cat to fly without help?`;
      answer = "No";
      working = `Working:\nSomething is IMPOSSIBLE if it can never happen.\nCats cannot naturally fly, so it is IMPOSSIBLE — the answer is No, it is not possible.`;
    } else {
      question = `Is it POSSIBLE to roll a 6 on a die?`;
      answer = "Yes";
      working = `Working:\nSomething is POSSIBLE if it might happen.\nA die has 6 sides, so rolling a 6 is POSSIBLE.`;
    }

    return { question, answer, working };
  }

  private easy2DShapes(): Question {
    const shapes = [
      { name: 'Triangle', sides: 3, angles: 3 },
      { name: 'Square', sides: 4, angles: 4 },
      { name: 'Rectangle', sides: 4, angles: 4 },
      { name: 'Pentagon', sides: 5, angles: 5 },
      { name: 'Hexagon', sides: 6, angles: 6 },
    ];
    const reverseShapes = [
      { name: 'Triangle', sides: 3 },
      { name: 'Pentagon', sides: 5 },
      { name: 'Hexagon', sides: 6 },
    ];
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many sides does a ${shape.name} have?\n\n[[TALLY_SVG]]${this.generateShapeSVG(shape.name)}`,
        answer: shape.sides.toString(),
        working: `Working:\nA ${shape.name} has ${shape.sides} sides.`,
      };
    } else if (t === 1) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many angles does a ${shape.name} have?\n\n[[TALLY_SVG]]${this.generateShapeSVG(shape.name)}`,
        answer: shape.angles.toString(),
        working: `Working:\nA ${shape.name} has ${shape.angles} angles.`,
      };
    } else if (t === 2) {
      const shape = reverseShapes[Math.floor(Math.random() * reverseShapes.length)];
      return {
        question: `A shape has ${shape.sides} sides. What is it called?`,
        answer: shape.name,
        working: `Working:\nA polygon with ${shape.sides} sides is called a ${shape.name}.`,
      };
    } else {
      const shape = reverseShapes[Math.floor(Math.random() * reverseShapes.length)];
      return {
        question: `Which shape has ${shape.sides} sides and ${shape.sides} angles?`,
        answer: shape.name,
        working: `Working:\nA ${shape.name} has ${shape.sides} sides and ${shape.sides} angles.`,
      };
    }
  }

  private mediumBarGraph(): Question {
    const categories = ['Math', 'Science', 'English', 'Art'];
    const students: Record<string, number> = {};
    categories.forEach(cat => {
      students[cat] = Math.floor(Math.random() * 15) + 5;
    });
    const data = categories.map(cat => ({ label: cat, count: students[cat] }));
    const svg = this.generateBarChartSVG(data);
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nHow many students prefer ${category}?`,
        answer: students[category].toString(),
        working: `Working:\nLooking at the bar graph, ${category} has ${students[category]} students.`,
      };
    } else if (t === 1) {
      const maxCount = Math.max(...Object.values(students));
      const mostPopular = categories.find(c => students[c] === maxCount)!;
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nWhich subject is the most popular?`,
        answer: mostPopular,
        working: `Working:\n${categories.map(c => `${c}: ${students[c]}`).join(', ')}\nHighest count = ${maxCount} (${mostPopular})`,
      };
    } else if (t === 2) {
      let cat1 = categories[Math.floor(Math.random() * categories.length)];
      let cat2 = categories[Math.floor(Math.random() * categories.length)];
      while (cat2 === cat1) cat2 = categories[Math.floor(Math.random() * categories.length)];
      const moreCat = students[cat1] >= students[cat2] ? cat1 : cat2;
      const lessCat = students[cat1] >= students[cat2] ? cat2 : cat1;
      const diff = students[moreCat] - students[lessCat];
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nHow many more students prefer ${moreCat} than ${lessCat}?`,
        answer: diff.toString(),
        working: `Working:\n${moreCat}: ${students[moreCat]} students\n${lessCat}: ${students[lessCat]} students\nDifference = ${students[moreCat]} - ${students[lessCat]} = ${diff}`,
      };
    } else {
      const total = Object.values(students).reduce((sum, v) => sum + v, 0);
      return {
        question: `Based on the bar graph:\n\n[[TALLY_SVG]]${svg}\n\nWhat is the total number of students surveyed?`,
        answer: total.toString(),
        working: `Working:\n${categories.map(c => `${c}: ${students[c]}`).join('\n')}\nTotal = ${Object.values(students).join(' + ')} = ${total}`,
      };
    }
  }

  private medium3DShapes(): Question {
    const shapes = [
      { name: 'Cube', faces: 6, edges: 12, vertices: 8 },
      { name: 'Cuboid', faces: 6, edges: 12, vertices: 8 },
      { name: 'Cylinder', faces: 3, edges: 2, vertices: 0 },
      { name: 'Cone', faces: 2, edges: 1, vertices: 1 },
      { name: 'Sphere', faces: 1, edges: 0, vertices: 0 },
    ];
    const reverseShapes = [
      { name: 'Sphere', faces: 1 },
      { name: 'Cone', faces: 2 },
      { name: 'Cylinder', faces: 3 },
    ];
    const t = Math.floor(Math.random() * 4);

    if (t === 0) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many faces does a ${shape.name} have?`,
        answer: shape.faces.toString(),
        working: `Working:\nA ${shape.name} has ${shape.faces} face${shape.faces !== 1 ? 's' : ''}.`,
      };
    } else if (t === 1) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many edges does a ${shape.name} have?`,
        answer: shape.edges.toString(),
        working: `Working:\nA ${shape.name} has ${shape.edges} edge${shape.edges !== 1 ? 's' : ''}.`,
      };
    } else if (t === 2) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        question: `How many vertices does a ${shape.name} have?`,
        answer: shape.vertices.toString(),
        working: `Working:\nA ${shape.name} has ${shape.vertices} ${shape.vertices !== 1 ? 'vertices' : 'vertex'}.`,
      };
    } else {
      const shape = reverseShapes[Math.floor(Math.random() * reverseShapes.length)];
      return {
        question: `A 3D shape has ${shape.faces} face${shape.faces !== 1 ? 's' : ''}. What is this shape called?`,
        answer: shape.name,
        working: `Working:\nA shape with ${shape.faces} face${shape.faces !== 1 ? 's' : ''} is a ${shape.name}.`,
      };
    }
  }

  private hardSymmetry(): Question {
    // Inverse reasoning: given a lines-of-symmetry count (and a rotational-symmetry clue),
    // name a shape that fits — rather than looking up a fixed shape's symmetry count.
    const options: { n: number; example: string }[] = [
      { n: 2, example: 'a rectangle' },
      { n: 3, example: 'an equilateral triangle' },
      { n: 4, example: 'a square' },
      { n: 5, example: 'a regular pentagon' },
      { n: 6, example: 'a regular hexagon' },
    ];
    const choice = options[Math.floor(Math.random() * options.length)];

    return {
      question: `A shape has exactly ${choice.n} lines of symmetry, and it looks the same after being rotated part-way around its centre.\nName a shape it could be.`,
      answer: `Any valid answer, e.g. ${choice.example}`,
      working: `Working:\nA shape with ${choice.n} lines of symmetry that also has matching rotational symmetry is a regular ${choice.n}-sided figure (or, for 2, a non-square rectangle).\nOne example: ${choice.example}.`,
    };
  }

  private hardProbability(): Question {
    const t = Math.floor(Math.random() * 3);
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];

    if (t === 0) {
      const marbles: Record<string, number> = {};
      const totalMarbles = Math.floor(Math.random() * 15) + 15;
      let remaining = totalMarbles;

      colors.slice(0, 3).forEach((color, idx) => {
        if (idx === colors.length - 2) {
          marbles[color] = remaining;
        } else {
          const count = Math.floor(Math.random() * Math.floor(remaining / 2)) + 2;
          marbles[color] = count;
          remaining -= count;
        }
      });

      const colorList = Object.entries(marbles)
        .map(([color, count]) => `${count} ${color}`)
        .join(', ');
      const colorKeys = Object.keys(marbles);
      const targetColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      const targetCount = marbles[targetColor];
      const probability = `${targetCount}/${totalMarbles}`;

      return {
        question: `A bag contains: ${colorList}.\nIf you pick one marble without looking, what is the probability of picking a ${targetColor} marble?`,
        answer: probability,
        working: `Working:\nTotal marbles = ${totalMarbles}\n${targetColor} marbles = ${targetCount}\nProbability = ${targetCount}/${totalMarbles}`,
      };
    } else if (t === 1) {
      // Build-a-scenario: given the total and a target probability, work out how many of one colour are needed.
      const denomOptions = [4, 5, 10];
      const denom = denomOptions[Math.floor(Math.random() * denomOptions.length)];
      const numerator = Math.floor(Math.random() * (denom - 1)) + 1;
      const scale = Math.floor(Math.random() * 4) + 2;
      const total = denom * scale;
      const count = numerator * scale;
      const targetColor = colors[Math.floor(Math.random() * colors.length)];
      return {
        question: `A bag has ${total} marbles in total.\nYou want the probability of picking a ${targetColor} marble to be exactly ${numerator}/${denom}.\nHow many ${targetColor} marbles should be in the bag?`,
        answer: count.toString(),
        working: `Working:\n${numerator}/${denom} of ${total} marbles should be ${targetColor}.\n${targetColor} marbles = ${numerator}/${denom} × ${total} = ${count}`,
      };
    } else {
      // Comparison: which of two bags gives a better chance of drawing the target colour.
      const targetColor = colors[Math.floor(Math.random() * colors.length)];
      const bagATotal = Math.floor(Math.random() * 10) + 10;
      const bagACount = Math.floor(Math.random() * (bagATotal - 2)) + 1;
      const bagBTotal = Math.floor(Math.random() * 10) + 10;
      const bagBCount = Math.floor(Math.random() * (bagBTotal - 2)) + 1;
      const probA = bagACount / bagATotal;
      const probB = bagBCount / bagBTotal;
      const answer = Math.abs(probA - probB) < 1e-9 ? 'Equally likely' : (probA > probB ? 'Bag A' : 'Bag B');
      return {
        question: `Bag A has ${bagACount} ${targetColor} marbles out of ${bagATotal} in total.\nBag B has ${bagBCount} ${targetColor} marbles out of ${bagBTotal} in total.\nFrom which bag are you more likely to pick a ${targetColor} marble?`,
        answer,
        working: `Working:\nBag A: ${bagACount}/${bagATotal} = ${probA.toFixed(3)}\nBag B: ${bagBCount}/${bagBTotal} = ${probB.toFixed(3)}\n${answer === 'Equally likely' ? 'Both bags give the same probability.' : `${answer} gives the higher probability, so it is more likely.`}`,
      };
    }
  }

  private numberLineQuestions(): Question {
    const t = Math.floor(Math.random() * 2);

    if (t === 0) {
      const step = [2, 5, 10][Math.floor(Math.random() * 3)];
      const min = 0;
      const max = step * 10;
      const marks = Array.from({ length: 11 }, (_, i) => i * step);
      const highlightIndex = Math.floor(Math.random() * 9) + 1;
      const highlightValue = marks[highlightIndex];
      const svg = this.generateNumberLineSVG(min, max, marks, highlightValue);
      return {
        question: `Look at the number line.\n\n[[TALLY_SVG]]${svg}\n\nWhat number is the marker pointing to?`,
        answer: highlightValue.toString(),
        working: `Working:\nThe number line counts up in ${step}s from ${min} to ${max}.\nThe marker sits at ${highlightValue}.`,
      };
    } else {
      const half = Math.floor(Math.random() * 20) + 1;
      const a = half * 2;
      const gap = (Math.floor(Math.random() * 5) + 1) * 2;
      const b = a + gap;
      const mid = (a + b) / 2;
      const svg = this.generateNumberLineSVG(a, b, [a, b]);
      return {
        question: `Look at the number line from ${a} to ${b}.\n\n[[TALLY_SVG]]${svg}\n\nWhat number is halfway between ${a} and ${b}?`,
        answer: mid.toString(),
        working: `Working:\nHalfway = (${a} + ${b}) ÷ 2 = ${a + b} ÷ 2 = ${mid}`,
      };
    }
  }

  private percentageGridQuestions(): Question {
    const t = Math.floor(Math.random() * 2);
    const percent = (Math.floor(Math.random() * 18) + 1) * 5;
    const svg = this.generatePercentageGridSVG(percent);

    if (t === 0) {
      return {
        question: `What percentage of the grid is shaded?\n\n[[TALLY_SVG]]${svg}`,
        answer: `${percent}%`,
        working: `Working:\nThe grid has 100 equal squares.\n${percent} of them are shaded.\nPercentage shaded = ${percent}%`,
      };
    } else {
      const g = this.gcd(percent, 100);
      const simplNum = percent / g;
      const simplDen = 100 / g;
      const answer = `${simplNum}/${simplDen}`;
      return {
        question: `What fraction of the grid is shaded? Give your answer in simplest form.\n\n[[TALLY_SVG]]${svg}`,
        answer,
        working: `Working:\n${percent} out of 100 squares are shaded = ${percent}/100\nSimplify by dividing top and bottom by ${g}: ${answer}`,
      };
    }
  }

  private likelihoodQuestions(): Question {
    const events: { text: string; position: number; label: string }[] = [
      { text: 'Rolling a 7 on a standard six-sided die', position: 0, label: 'Impossible' },
      { text: 'The sun rising tomorrow', position: 1, label: 'Certain' },
      { text: 'Flipping a coin and it landing on heads', position: 0.5, label: 'Even chance' },
      { text: 'Picking a red ball from a bag of 9 red balls and 1 blue ball', position: 0.9, label: 'Likely' },
      { text: 'Picking a blue ball from a bag of 9 red balls and 1 blue ball', position: 0.1, label: 'Unlikely' },
      { text: 'It snowing in a desert in July', position: 0.05, label: 'Unlikely' },
      { text: 'A new day having 24 hours', position: 1, label: 'Certain' },
      { text: 'Rolling an even number on a standard six-sided die', position: 0.5, label: 'Even chance' },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    const svg = this.generateLikelihoodScaleSVG(event.position);
    return {
      question: `${event.text}.\nLook at the scale. Is this event impossible, unlikely, an even chance, likely, or certain?\n\n[[TALLY_SVG]]${svg}`,
      answer: event.label,
      working: `Working:\nThe marker sits at the "${event.label}" position on the scale.\n${event.text} is ${event.label.toLowerCase()}.`,
    };
  }

  private fractionWallQuestions(): Question {
    const denom = Math.floor(Math.random() * 7) + 4;
    const shaded = Math.floor(Math.random() * (denom - 1)) + 1;
    const svg = this.generateFractionWallSVG(denom, shaded);
    return {
      question: `What fraction of the bar is shaded?\n\n[[TALLY_SVG]]${svg}`,
      answer: `${shaded}/${denom}`,
      working: `Working:\nThe bar is divided into ${denom} equal parts.\n${shaded} of the ${denom} parts are shaded.\nFraction shaded = ${shaded}/${denom}`,
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private numberToWords(n: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (n === 0) return 'Zero';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) {
      const rem = n % 100;
      return ones[Math.floor(n / 100)] + ' Hundred' + (rem !== 0 ? ' and ' + this.numberToWords(rem) : '');
    }
    const th = Math.floor(n / 1000);
    const rem = n % 1000;
    return this.numberToWords(th) + ' Thousand' + (rem !== 0 ? ' ' + this.numberToWords(rem) : '');
  }

  // ── ICSE generators ────────────────────────────────────────────────────────

  private icseNumbers(): Question {
    const t = Math.floor(Math.random() * 4);
    if (t === 0) {
      const num = Math.floor(Math.random() * 89999) + 10000;
      return {
        question: `Write the number name for ${num}.`,
        answer: this.numberToWords(num),
        working: `Working:\n${num} = ${this.numberToWords(num)}`,
      };
    } else if (t === 1) {
      const num = Math.floor(Math.random() * 89999) + 10000;
      const rounded = Math.round(num / 1000) * 1000;
      const hundredsDigit = Math.floor((num % 1000) / 100);
      return {
        question: `Round ${num} to the nearest thousand.`,
        answer: String(rounded),
        working: `Working:\nHundreds digit is ${hundredsDigit}.\n${hundredsDigit >= 5 ? 'It is 5 or more, so round up.' : 'It is less than 5, so round down.'}\n${num} rounded to nearest thousand = ${rounded}`,
      };
    } else if (t === 2) {
      const a = Math.floor(Math.random() * 89000) + 10000;
      let b = Math.floor(Math.random() * 89000) + 10000;
      while (b === a) b = Math.floor(Math.random() * 89000) + 10000;
      const sym = a > b ? '>' : a < b ? '<' : '=';
      return {
        question: `Compare: ${a} ___ ${b}. Write >, < or =`,
        answer: sym,
        working: `Working:\nCompare digits from left to right.\n${a} ${sym} ${b}`,
      };
    } else {
      const num = Math.floor(Math.random() * 89999) + 10000;
      const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
      const pos = Math.floor(Math.random() * 5);
      const d = Math.floor(num / Math.pow(10, pos)) % 10;
      return {
        question: `What is the place value of ${d} in ${num}?`,
        answer: placeNames[pos],
        working: `Working:\nIn ${num}, the digit ${d} is in the ${placeNames[pos]} place.\nPlace value = ${placeNames[pos]}`,
      };
    }
  }

  private icseFactorsMultiples(): Question {
    const t = Math.floor(Math.random() * 5);
    if (t === 0) {
      const candidates = [12, 15, 16, 18, 20, 24, 28, 30, 36, 40, 42, 48, 50];
      const num = candidates[Math.floor(Math.random() * candidates.length)];
      const factors: number[] = [];
      for (let i = 1; i <= num; i++) { if (num % i === 0) factors.push(i); }
      return {
        question: `Find all factors of ${num}.`,
        answer: factors.join(', '),
        working: `Working:\nDivide ${num} by each whole number from 1 to ${num}.\nFactors of ${num}: ${factors.join(', ')}`,
      };
    } else if (t === 1) {
      const num = Math.floor(Math.random() * 11) + 2;
      const multiples = [1, 2, 3, 4, 5].map(i => i * num);
      return {
        question: `Find the first 5 multiples of ${num}.`,
        answer: multiples.join(', '),
        working: `Working:\n${[1, 2, 3, 4, 5].map(i => `${num} × ${i} = ${i * num}`).join('\n')}`,
      };
    } else if (t === 2) {
      const pairs = [[12, 18], [15, 25], [16, 24], [18, 27], [20, 30], [24, 36], [14, 21], [8, 12], [10, 15], [6, 9]];
      const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
      const h = this.gcd(a, b);
      const factorsA = Array.from({length: a}, (_, i) => i + 1).filter(i => a % i === 0);
      const factorsB = Array.from({length: b}, (_, i) => i + 1).filter(i => b % i === 0);
      const common = factorsA.filter(f => b % f === 0);
      return {
        question: `Find the HCF of ${a} and ${b}.`,
        answer: String(h),
        working: `Working:\nFactors of ${a}: ${factorsA.join(', ')}\nFactors of ${b}: ${factorsB.join(', ')}\nCommon factors: ${common.join(', ')}\nHCF = ${h}`,
      };
    } else if (t === 3) {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      const l = this.lcm(a, b);
      return {
        question: `Find the LCM of ${a} and ${b}.`,
        answer: String(l),
        working: `Working:\nMultiples of ${a}: ${[1,2,3,4,5,6].map(i => i*a).join(', ')}...\nMultiples of ${b}: ${[1,2,3,4,5,6].map(i => i*b).join(', ')}...\nLCM = ${l}`,
      };
    } else {
      const b = Math.floor(Math.random() * 40) + 12;
      const isYes = Math.random() < 0.5;
      let a: number;
      if (isYes) {
        const factors: number[] = [];
        for (let i = 2; i <= b; i++) { if (b % i === 0) factors.push(i); }
        a = factors[Math.floor(Math.random() * factors.length)] || 1;
      } else {
        do { a = Math.floor(Math.random() * 10) + 2; } while (b % a === 0);
      }
      return {
        question: `Is ${a} a factor of ${b}? Write Yes or No.`,
        answer: isYes ? 'Yes' : 'No',
        working: `Working:\n${b} ÷ ${a} = ${(b / a).toFixed(b % a !== 0 ? 2 : 0)}${b % a !== 0 ? ` (remainder ${b % a})` : ''}\n${b % a === 0 ? `${a} divides ${b} exactly, so ${a} IS a factor.` : `${a} does not divide ${b} exactly, so ${a} is NOT a factor.`}`,
      };
    }
  }

  private icseMixedNumbers(): Question {
    const t = Math.floor(Math.random() * 4);
    if (t === 0) {
      const whole = Math.floor(Math.random() * 5) + 1;
      const den = Math.floor(Math.random() * 6) + 5;
      const num = Math.floor(Math.random() * 4) + 1;
      const improper = whole * den + num;
      return {
        question: `Convert ${whole} ${num}/${den} to an improper fraction.`,
        answer: `${improper}/${den}`,
        working: `Working:\n(${whole} × ${den}) + ${num} = ${improper}\nImproper fraction = ${improper}/${den}`,
      };
    } else if (t === 1) {
      const den = Math.floor(Math.random() * 6) + 3;
      const improper = Math.floor(Math.random() * (den * 3)) + den + 1;
      const whole = Math.floor(improper / den);
      const remainder = improper % den;
      const answer = remainder === 0 ? String(whole) : `${whole} ${remainder}/${den}`;
      return {
        question: `Convert ${improper}/${den} to a mixed number.`,
        answer,
        working: `Working:\n${improper} ÷ ${den} = ${whole} remainder ${remainder}\nMixed number = ${answer}`,
      };
    } else if (t === 2) {
      const d = Math.floor(Math.random() * 6) + 5;
      const w1 = Math.floor(Math.random() * 4) + 1;
      const n1 = Math.floor(Math.random() * (d - 1)) + 1;
      const w2 = Math.floor(Math.random() * 3) + 1;
      const n2 = Math.floor(Math.random() * (d - 1)) + 1;
      const totalNum = n1 + n2;
      const carry = Math.floor(totalNum / d);
      const remNum = totalNum % d;
      const totalWhole = w1 + w2 + carry;
      const answer = remNum === 0 ? String(totalWhole) : `${totalWhole} ${remNum}/${d}`;
      return {
        question: `Add: ${w1} ${n1}/${d} + ${w2} ${n2}/${d} = ?`,
        answer,
        working: `Working:\nWhole: ${w1} + ${w2} = ${w1 + w2}\nFraction: ${n1}/${d} + ${n2}/${d} = ${totalNum}/${d}${carry > 0 ? ` = ${carry} ${remNum}/${d}` : ''}\nTotal = ${answer}`,
      };
    } else {
      const d = Math.floor(Math.random() * 6) + 5;
      const w1 = Math.floor(Math.random() * 3) + 1;
      const n1 = Math.floor(Math.random() * (d - 1)) + 1;
      const w2 = w1 + Math.floor(Math.random() * 3) + 1;
      const n2 = Math.floor(Math.random() * (d - 1)) + 1;
      let resNum = n2 - n1;
      let resWhole = w2 - w1;
      if (resNum < 0) { resNum += d; resWhole -= 1; }
      const answer = resNum === 0 ? String(resWhole) : `${resWhole} ${resNum}/${d}`;
      return {
        question: `Subtract: ${w2} ${n2}/${d} - ${w1} ${n1}/${d} = ?`,
        answer,
        working: `Working:\nFraction: ${n2}/${d} - ${n1}/${d}${n2 < n1 ? ` (borrow 1): ${n2 + d}/${d} - ${n1}/${d}` : ''} = ${resNum}/${d}\nWhole: ${w2} - ${w1}${n2 < n1 ? ' - 1 (borrowed)' : ''} = ${resWhole}\nAnswer = ${answer}`,
      };
    }
  }

  private icseDecimals(): Question {
    const t = Math.floor(Math.random() * 5);
    if (t === 0) {
      const num = Math.floor(Math.random() * 9) + 1;
      return {
        question: `Write ${num}/10 as a decimal.`,
        answer: `0.${num}`,
        working: `Working:\n${num}/10 = 0.${num}`,
      };
    } else if (t === 1) {
      const num = Math.floor(Math.random() * 99) + 1;
      const dec = (num / 100).toFixed(2);
      return {
        question: `Write ${num}/100 as a decimal.`,
        answer: dec,
        working: `Working:\n${num}/100 = ${dec}`,
      };
    } else if (t === 2) {
      const d1 = (Math.floor(Math.random() * 9) + 1) / 10;
      const d2 = (Math.floor(Math.random() * 9) + 1) / 10;
      const sum = Math.round((d1 + d2) * 10) / 10;
      return {
        question: `Add: ${d1.toFixed(1)} + ${d2.toFixed(1)} = ?`,
        answer: sum.toFixed(1),
        working: `Working:\n${d1.toFixed(1)} + ${d2.toFixed(1)} = ${sum.toFixed(1)}`,
      };
    } else if (t === 3) {
      const whole = Math.floor(Math.random() * 9) + 1;
      const frac = Math.floor(Math.random() * 9) + 1;
      const decimal = whole + frac / 10;
      const rounded = Math.round(decimal);
      return {
        question: `Round ${decimal.toFixed(1)} to the nearest whole number.`,
        answer: String(rounded),
        working: `Working:\nDecimal part is .${frac}.\n${frac >= 5 ? 'It is 5 or more, so round up.' : 'It is less than 5, so round down.'}\n${decimal.toFixed(1)} ≈ ${rounded}`,
      };
    } else {
      const nums = Array.from({length: 3}, () => (Math.floor(Math.random() * 9) + 1) / 10);
      const sorted = [...nums].sort((a, b) => a - b);
      return {
        question: `Arrange in ascending order: ${nums.map(n => n.toFixed(1)).join(', ')}`,
        answer: sorted.map(n => n.toFixed(1)).join(', '),
        working: `Working:\nSmallest to largest: ${sorted.map(n => n.toFixed(1)).join(' < ')}`,
      };
    }
  }

  private icseWordProblems(): Question {
    const t = Math.floor(Math.random() * 4);
    if (t === 0) {
      const qty = Math.floor(Math.random() * 8) + 3;
      const price = (Math.floor(Math.random() * 18) + 2) * 5;
      const isProfit = Math.random() < 0.5;
      const change = (Math.floor(Math.random() * 5) + 1) * 5;
      const sell = isProfit ? price + change : price - change;
      const diff = Math.abs(sell - price) * qty;
      const label = isProfit ? 'Profit' : 'Loss';
      return {
        question: `A shopkeeper bought ${qty} items at Rs.${price} each and sold them at Rs.${sell} each. Find his ${label.toLowerCase()}.`,
        answer: `${label} of Rs.${diff}`,
        working: `Working:\nCost price = ${qty} × Rs.${price} = Rs.${price * qty}\nSelling price = ${qty} × Rs.${sell} = Rs.${sell * qty}\n${label} = Rs.${diff}`,
      };
    } else if (t === 1) {
      const speed = (Math.floor(Math.random() * 8) + 3) * 10;
      const hours = Math.floor(Math.random() * 4) + 2;
      return {
        question: `A train travels at ${speed} km per hour. How far does it travel in ${hours} hours?`,
        answer: `${speed * hours} km`,
        working: `Working:\nDistance = Speed × Time\n= ${speed} × ${hours} = ${speed * hours} km`,
      };
    } else if (t === 2) {
      const l = Math.floor(Math.random() * 16) + 5;
      const w = Math.floor(Math.random() * 10) + 3;
      const rate = Math.floor(Math.random() * 9) + 2;
      const perimeter = 2 * (l + w);
      return {
        question: `A rectangular garden is ${l}m long and ${w}m wide. Find the cost of fencing it at Rs.${rate} per metre.`,
        answer: `Rs.${perimeter * rate}`,
        working: `Working:\nPerimeter = 2 × (${l} + ${w}) = 2 × ${l + w} = ${perimeter} m\nCost = ${perimeter} × Rs.${rate} = Rs.${perimeter * rate}`,
      };
    } else {
      const size = Math.floor(Math.random() * 8) + 3;
      const groups = Math.floor(Math.random() * 9) + 3;
      const leftover = Math.floor(Math.random() * (size - 1));
      const total = groups * size + leftover;
      return {
        question: `${total} students are divided into groups of ${size}. How many complete groups are there and how many students are left over?`,
        answer: `${groups} groups, ${leftover} left over`,
        working: `Working:\n${total} ÷ ${size} = ${groups} remainder ${leftover}\n${groups} complete groups, ${leftover} students left over`,
      };
    }
  }

  // ── IGCSE generators ───────────────────────────────────────────────────────

  private igcseNumberSense(): Question {
    const t = Math.floor(Math.random() * 5);
    if (t === 0) {
      const a = Math.floor(Math.random() * 900) + 100;
      const b = Math.floor(Math.random() * 900) + 100;
      const ra = Math.round(a / 100) * 100;
      const rb = Math.round(b / 100) * 100;
      return {
        question: `Estimate ${a} + ${b} by rounding both to the nearest 100.`,
        answer: String(ra + rb),
        working: `Working:\n${a} rounded to nearest 100 = ${ra}\n${b} rounded to nearest 100 = ${rb}\nEstimate = ${ra} + ${rb} = ${ra + rb}`,
      };
    } else if (t === 1) {
      const a = Math.floor(Math.random() * 98) + 2;
      return {
        question: `Use mental maths: ${a} × 10 = ?`,
        answer: String(a * 10),
        working: `Working:\nMultiplying by 10 adds a zero.\n${a} × 10 = ${a * 10}`,
      };
    } else if (t === 2) {
      const sum = (Math.floor(Math.random() * 9) + 1) * 100;
      const a = sum - (Math.floor(Math.random() * (sum / 2 - 10)) + 10);
      return {
        question: `Fill in the missing number: ${a} + ___ = ${sum}`,
        answer: String(sum - a),
        working: `Working:\n___ = ${sum} - ${a} = ${sum - a}`,
      };
    } else if (t === 3) {
      const num = Math.floor(Math.random() * 990) + 10;
      const rounded = Math.round(num / 10) * 10;
      return {
        question: `What is ${num} rounded to the nearest 10?`,
        answer: String(rounded),
        working: `Working:\nOnes digit is ${num % 10}.\n${num % 10 >= 5 ? 'It is 5 or more, so round up.' : 'It is less than 5, so round down.'}\n${num} rounded to nearest 10 = ${rounded}`,
      };
    } else {
      const num = Math.floor(Math.random() * 9900) + 100;
      const rounded = Math.round(num / 100) * 100;
      return {
        question: `What is ${num} rounded to the nearest 100?`,
        answer: String(rounded),
        working: `Working:\nTens digit is ${Math.floor((num % 100) / 10)}.\n${Math.floor((num % 100) / 10) >= 5 ? 'It is 5 or more, so round up.' : 'It is less than 5, so round down.'}\n${num} rounded to nearest 100 = ${rounded}`,
      };
    }
  }

  private igcseDecimals(): Question {
    const t = Math.floor(Math.random() * 6);
    if (t === 0) {
      const num = Math.floor(Math.random() * 9) + 1;
      return {
        question: `Write ${num}/10 as a decimal.`,
        answer: `0.${num}`,
        working: `Working:\n${num}/10 = 0.${num}`,
      };
    } else if (t === 1) {
      const num = Math.floor(Math.random() * 99) + 1;
      const dec = (num / 100).toFixed(2);
      return {
        question: `Write ${num}/100 as a decimal.`,
        answer: dec,
        working: `Working:\n${num}/100 = ${dec}`,
      };
    } else if (t === 2) {
      const n1 = Math.floor(Math.random() * 90) + 5;
      const n2 = Math.floor(Math.random() * (99 - n1)) + 1;
      const d1 = n1 / 100;
      const d2 = n2 / 100;
      const sum = Math.round((d1 + d2) * 100) / 100;
      return {
        question: `Add: ${d1.toFixed(2)} + ${d2.toFixed(2)} = ?`,
        answer: sum.toFixed(2),
        working: `Working:\n${d1.toFixed(2)} + ${d2.toFixed(2)} = ${sum.toFixed(2)}`,
      };
    } else if (t === 3) {
      const n1 = Math.floor(Math.random() * 8) + 2;
      const n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
      const d1 = n1 / 10;
      const d2 = n2 / 10;
      const diff = Math.round((d1 - d2) * 10) / 10;
      return {
        question: `Subtract: ${d1.toFixed(1)} - ${d2.toFixed(1)} = ?`,
        answer: diff.toFixed(1),
        working: `Working:\n${d1.toFixed(1)} - ${d2.toFixed(1)} = ${diff.toFixed(1)}`,
      };
    } else if (t === 4) {
      const total = Math.random() < 0.5 ? 10 : 100;
      const part = Math.floor(Math.random() * (total - 1)) + 1;
      const pct = (part / total) * 100;
      return {
        question: `What percentage is ${part} out of ${total}?`,
        answer: `${pct}%`,
        working: `Working:\n(${part} ÷ ${total}) × 100 = ${pct}%`,
      };
    } else {
      const nums = Array.from({length: 3}, () => (Math.floor(Math.random() * 90) + 5) / 100);
      const sorted = [...nums].sort((a, b) => a - b);
      return {
        question: `Order from smallest to largest: ${nums.map(n => n.toFixed(2)).join(', ')}`,
        answer: sorted.map(n => n.toFixed(2)).join(', '),
        working: `Working:\nCompare hundredths digits.\nSmallest to largest: ${sorted.map(n => n.toFixed(2)).join(' < ')}`,
      };
    }
  }

  private igcseNumberLine(): Question {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) {
      const half = Math.floor(Math.random() * 20) + 1;
      const a = half * 2;
      const gap = (Math.floor(Math.random() * 5) + 1) * 2;
      const b = a + gap;
      const mid = (a + b) / 2;
      return {
        question: `What number is halfway between ${a} and ${b}?`,
        answer: String(mid),
        working: `Working:\nHalfway = (${a} + ${b}) ÷ 2 = ${a + b} ÷ 2 = ${mid}`,
      };
    } else if (t === 1) {
      const parts = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
      const start = Math.floor(Math.random() * 10) * parts;
      const k = Math.floor(Math.random() * 5) + 1;
      const end = start + parts * k;
      const partWorth = k;
      return {
        question: `A number line goes from ${start} to ${end} in ${parts} equal parts. What is each part worth?`,
        answer: String(partWorth),
        working: `Working:\nTotal range = ${end} - ${start} = ${end - start}\nEach part = ${end - start} ÷ ${parts} = ${partWorth}`,
      };
    } else {
      const step = Math.floor(Math.random() * 9) + 2;
      const start = Math.floor(Math.random() * 20);
      const fifth = start + step * 4;
      return {
        question: `Count on by ${step}s from ${start}. What is the 5th number?`,
        answer: String(fifth),
        working: `Working:\n${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ${fifth}\nThe 5th number is ${fifth}.`,
      };
    }
  }

  private igcse3DShapes(): Question {
    const shapes = [
      { name: 'cube', faces: 6, edges: 12, vertices: 8 },
      { name: 'cuboid', faces: 6, edges: 12, vertices: 8 },
      { name: 'triangular prism', faces: 5, edges: 9, vertices: 6 },
      { name: 'square pyramid', faces: 5, edges: 8, vertices: 5 },
    ];
    const t = Math.floor(Math.random() * 5);
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    if (t === 0) {
      return {
        question: `How many faces does a ${shape.name} have?`,
        answer: String(shape.faces),
        working: `Working:\nA ${shape.name} has ${shape.faces} faces, ${shape.edges} edges and ${shape.vertices} vertices.`,
      };
    } else if (t === 1) {
      return {
        question: `How many edges does a ${shape.name} have?`,
        answer: String(shape.edges),
        working: `Working:\nA ${shape.name} has ${shape.faces} faces, ${shape.edges} edges and ${shape.vertices} vertices.`,
      };
    } else if (t === 2) {
      return {
        question: `How many vertices does a ${shape.name} have?`,
        answer: String(shape.vertices),
        working: `Working:\nA ${shape.name} has ${shape.faces} faces, ${shape.edges} edges and ${shape.vertices} vertices.`,
      };
    } else if (t === 3) {
      return {
        question: `A ${shape.name} is unfolded into a net. How many faces does the net show?`,
        answer: String(shape.faces),
        working: `Working:\nUnfolding a 3D shape shows all its faces.\nA ${shape.name} has ${shape.faces} faces, so the net shows ${shape.faces} faces.`,
      };
    } else {
      const unique = shapes.filter(s => s.name !== 'cube' && s.name !== 'cuboid');
      const target = unique[Math.floor(Math.random() * unique.length)];
      return {
        question: `Which 3D shape has ${target.faces} faces, ${target.edges} edges and ${target.vertices} vertices?\nChoose: cube, cuboid, triangular prism, square pyramid`,
        answer: target.name,
        working: `Working:\nTriangular prism: 5 faces, 9 edges, 6 vertices\nSquare pyramid: 5 faces, 8 edges, 5 vertices\nCube/Cuboid: 6 faces, 12 edges, 8 vertices\nAnswer: ${target.name}`,
      };
    }
  }

  private igcseTransformations(): Question {
    const templates = [
      {
        question: 'A shape is flipped over a mirror line. What type of transformation is this?',
        answer: 'Reflection',
        working: 'Working:\nFlipping a shape over a line = Reflection.\nThe shape keeps the same size but is mirrored.',
      },
      {
        question: 'A shape slides to the right without turning or flipping. What transformation is this?',
        answer: 'Translation',
        working: 'Working:\nSliding without turning = Translation.\nEvery point moves the same distance in the same direction.',
      },
      {
        question: 'A shape is turned 90° clockwise around a fixed point. What transformation is this?',
        answer: 'Rotation',
        working: 'Working:\nTurning a shape around a point = Rotation.',
      },
      {
        question: 'After a reflection, does the shape change size?',
        answer: 'No',
        working: 'Working:\nReflection keeps size and shape the same. Only the orientation changes.',
      },
      {
        question: 'A shape is moved 4 units right and 2 units up without rotating. What transformation is this?',
        answer: 'Translation',
        working: 'Working:\nMoving every point the same distance in the same direction = Translation.',
      },
      {
        question: 'Name the transformation: a shape is turned 180° about its centre.',
        answer: 'Rotation',
        working: 'Working:\nTurning (spinning) around a fixed point = Rotation.',
      },
    ];
    const tmpl = templates[Math.floor(Math.random() * templates.length)];
    return { question: tmpl.question, answer: tmpl.answer, working: tmpl.working };
  }

  private igcseDataReasoning(): Question {
    const t = Math.floor(Math.random() * 5);
    if (t === 0) {
      const mode = Math.floor(Math.random() * 8) + 2;
      const others = Array.from({length: 4}, () => { let n: number; do { n = Math.floor(Math.random() * 9) + 1; } while (n === mode); return n; });
      const data = [...others, mode, mode].sort(() => Math.random() - 0.5);
      return {
        question: `Find the mode of: ${data.join(', ')}`,
        answer: String(mode),
        working: `Working:\nThe mode is the most frequent value.\n${mode} appears ${data.filter(n => n === mode).length} times.\nMode = ${mode}`,
      };
    } else if (t === 1) {
      const nums = Array.from({length: 5}, () => Math.floor(Math.random() * 20) + 1);
      const range = Math.max(...nums) - Math.min(...nums);
      return {
        question: `Find the range of: ${nums.join(', ')}`,
        answer: String(range),
        working: `Working:\nRange = largest - smallest\n= ${Math.max(...nums)} - ${Math.min(...nums)} = ${range}`,
      };
    } else if (t === 2) {
      const nums = Array.from({length: 4}, () => Math.floor(Math.random() * 9) + 1);
      const sum = nums.reduce((a, b) => a + b, 0);
      const extra = (4 - (sum % 4)) % 4;
      nums[3] += extra;
      const total = nums.reduce((a, b) => a + b, 0);
      const mean = total / 4;
      return {
        question: `Find the mean of: ${nums.join(', ')}`,
        answer: String(mean),
        working: `Working:\nMean = sum ÷ count\n= (${nums.join(' + ')}) ÷ 4\n= ${total} ÷ 4 = ${mean}`,
      };
    } else if (t === 3) {
      const n = Math.floor(Math.random() * 9) + 2;
      const symbols = Math.floor(Math.random() * 6) + 2;
      const categories = ['Apples', 'Oranges', 'Mangoes', 'Bananas', 'Grapes'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      return {
        question: `A pictogram shows each symbol = ${n} items.\n${cat} has ${symbols} symbols. How many ${cat.toLowerCase()} is that?`,
        answer: String(n * symbols),
        working: `Working:\n${symbols} symbols × ${n} items each = ${n * symbols} ${cat.toLowerCase()}`,
      };
    } else {
      const total = Math.floor(Math.random() * 16) + 10;
      const num = Math.floor(Math.random() * (total - 1)) + 1;
      const options = ['football', 'cricket', 'swimming', 'tennis', 'hockey'];
      const option = options[Math.floor(Math.random() * options.length)];
      const g = this.gcd(num, total);
      const simplNum = num / g;
      const simplDen = total / g;
      const answer = simplDen === 1 ? String(simplNum) : `${simplNum}/${simplDen}`;
      return {
        question: `In a survey of ${total} students, ${num} chose ${option}. What fraction chose ${option}?`,
        answer,
        working: `Working:\nFraction = ${num}/${total}\nSimplify by dividing by ${g}: ${answer}`,
      };
    }
  }

  private igcseReasoning(): Question {
    const t = Math.floor(Math.random() * 3);
    if (t === 0) {
      const n = Math.floor(Math.random() * 8) + 2;
      const k = Math.floor(Math.random() * 9) + 2;
      const answer = n * k;
      const a = n * (k - 1);
      const b = n * (k + 1);
      return {
        question: `I am a number between ${a} and ${b}. I am a multiple of ${n}. What could I be? Give one answer.`,
        answer: String(answer),
        working: `Working:\nMultiples of ${n}: ..., ${a}, ${answer}, ${b}, ...\nThe only multiple of ${n} between ${a} and ${b} is ${answer}.`,
      };
    } else if (t === 1) {
      const evenN = [4, 6, 8, 10][Math.floor(Math.random() * 4)];
      const k = Math.floor(Math.random() * 6) + 3;
      const answer = evenN * k;
      const half = evenN / 2 + 1;
      const a = answer - half;
      const b = answer + half;
      return {
        question: `I am an even number. I am greater than ${a} and less than ${b}. I am a multiple of ${evenN}. What am I?`,
        answer: String(answer),
        working: `Working:\nEven multiples of ${evenN} near this range: ${answer}\n${answer} is between ${a} and ${b} and is a multiple of ${evenN}.\nAnswer = ${answer}`,
      };
    } else {
      const h = Math.floor(Math.random() * 9) + 1;
      const tens = Math.floor(Math.random() * 10);
      const u = Math.floor(Math.random() * 10);
      const number = h * 100 + tens * 10 + u;
      return {
        question: `A number has ${h} hundreds, ${tens} tens and ${u} ones. What is the number?`,
        answer: String(number),
        working: `Working:\n${h} hundreds = ${h * 100}\n${tens} tens = ${tens * 10}\n${u} ones = ${u}\nNumber = ${h * 100} + ${tens * 10} + ${u} = ${number}`,
      };
    }
  }
}
