import { AnswerSpec } from './types';
import { gcd, reduceFraction } from './mathUtils';

/**
 * Returns true if the raw string input from the student
 * is a correct answer given the AnswerSpec.
 *
 * Fraction inputs accepted as "a/b" or "a" (integer shorthand).
 * Fraction correctness: cross-multiply so equivalent fractions pass,
 * THEN check it is already in lowest terms (Class 8 policy).
 */
export function validateAnswer(raw: string, spec: AnswerSpec): boolean {
  const s = raw.trim();

  switch (spec.kind) {
    case 'integer': {
      const n = parseInt(s, 10);
      return !isNaN(n) && n === spec.value;
    }

    case 'decimal': {
      const n = parseFloat(s);
      return !isNaN(n) && Math.abs(n - spec.value) <= spec.tolerance;
    }

    case 'fraction': {
      // Accept "3/4" or bare integer "2"
      let num: number, den: number;
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length !== 2) return false;
        num = parseInt(parts[0], 10);
        den = parseInt(parts[1], 10);
        if (isNaN(num) || isNaN(den) || den === 0) return false;
      } else {
        num = parseInt(s, 10);
        den = 1;
        if (isNaN(num)) return false;
      }
      // Must already be in lowest terms
      const g = gcd(Math.abs(num), Math.abs(den));
      if (g !== 1) return false;               // not simplified → reject
      if (den < 0) return false;               // denominator must be positive
      // Equivalent to spec?
      return num * spec.denominator === spec.numerator * den;
    }

    case 'mcq': {
      const idx = parseInt(s, 10);
      return !isNaN(idx) && idx === spec.correctIndex;
    }

    case 'multi_value': {
      // Comma-separated, order-independent
      const parts = s.split(',').map(p => parseFloat(p.trim()));
      if (parts.length !== spec.values.length) return false;
      const sorted1 = [...parts].sort((a, b) => a - b);
      const sorted2 = [...spec.values].sort((a, b) => a - b);
      return sorted1.every((v, i) => Math.abs(v - sorted2[i]) < 0.001);
    }
  }
}
