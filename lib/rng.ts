/**
 * Seedable random source for the question generators.
 *
 * The generators called `Math.random()` in 466 places, which made their output
 * impossible to assert on: you could not restructure a 3,700-line generator and
 * prove children still got the same questions afterwards. Routing every call
 * through `rng()` makes the whole library deterministic on demand.
 *
 * In production this is exactly `Math.random`. Only `withSeed` swaps it, and
 * only for the duration of a synchronous call — so there is no risk of one
 * request seeing another request's seeded sequence.
 */

let current: () => number = Math.random

/** Drop-in replacement for Math.random() inside generator code. */
export function rng(): number {
  return current()
}

/**
 * mulberry32 — small, fast, and good enough for question variety. The exact
 * algorithm matters only in that it must never change: golden snapshots are
 * recorded against this sequence, so swapping it would invalidate all of them.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Runs `fn` with a deterministic random sequence, then restores the previous
 * source. Synchronous by design — do not await inside `fn`, or concurrent work
 * will observe the seeded generator.
 */
export function withSeed<T>(seed: number, fn: () => T): T {
  const previous = current
  current = mulberry32(seed)
  try {
    return fn()
  } finally {
    current = previous
  }
}

/** True while a seeded sequence is active. Used by tests to assert isolation. */
export function isSeeded(): boolean {
  return current !== Math.random
}
