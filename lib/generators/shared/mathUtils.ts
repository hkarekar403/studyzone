/** Inclusive random integer in [min, max] */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick one element from array uniformly at random */
export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Greatest common divisor (always positive) */
export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/** Reduce fraction to lowest terms; denominator always positive */
export function reduceFraction(num: number, den: number): [number, number] {
  if (den === 0) throw new Error('Zero denominator');
  const g = gcd(Math.abs(num), Math.abs(den));
  const sign = den < 0 ? -1 : 1;
  return [(sign * num) / g, (sign * den) / g];
}

/** Add two fractions, return reduced result */
export function addFractions(
  n1: number, d1: number, n2: number, d2: number
): [number, number] {
  return reduceFraction(n1 * d2 + n2 * d1, d1 * d2);
}

/** Round to n decimal places */
export function round(value: number, places: number): number {
  const f = Math.pow(10, places);
  return Math.round(value * f) / f;
}

/** Format fraction for display, e.g. "-3/4" or "5" if den===1 */
export function formatFraction(num: number, den: number): string {
  if (den === 1) return String(num);
  return `${num}/${den}`;
}

/** Naive primality test (fine for numbers < 10,000) */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/** Prime factorisation as [prime, exponent][] pairs */
export function primeFactors(n: number): [number, number][] {
  const result: [number, number][] = [];
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      let exp = 0;
      while (n % p === 0) { exp++; n = n / p; }
      result.push([p, exp]);
    }
  }
  if (n > 1) result.push([n, 1]);
  return result;
}
