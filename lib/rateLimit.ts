import { Ratelimit } from "@upstash/ratelimit"
import { kv } from "@vercel/kv"
import { createHash } from "crypto"
import type { NextRequest } from "next/server"

/**
 * IP-based rate limiting for the API routes.
 *
 * Two principles shape this:
 *
 * 1. It must fail open. Every service in this app degrades gracefully when its
 *    env vars are absent (local development has none), and a child being unable
 *    to practise because a Redis call failed would be a worse outcome than an
 *    unthrottled request. If KV is unreachable, requests are allowed.
 *
 * 2. It must not put raw IP addresses in our own store. The site's whole
 *    position is that nothing identifying a child is retained, so the address
 *    is hashed with a salt before it is ever used as a key, and entries expire
 *    with the window. We can still count requests per visitor; we cannot read
 *    back who they were.
 */

const KV_CONFIGURED = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

// Not a secret — it only needs to be stable and site-specific so hashes are not
// comparable against a precomputed table of IP addresses.
const HASH_SALT = "studyzone-ratelimit-v1"

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
  return createHash("sha256").update(HASH_SALT + ip).digest("hex").slice(0, 32)
}

/** Limits are per IP. Generous where a child is simply working, tight where a request costs money or sends mail. */
const LIMITS = {
  // A fast child answering questions back to back stays well under this.
  question: { requests: 60, window: "1 m" },
  answer: { requests: 90, window: "1 m" },
  // Each of these fans out into up to 160 generator calls, so they are capped harder.
  worksheet: { requests: 10, window: "1 m" },
  mockExam: { requests: 5, window: "1 m" },
  // Sends an email through Resend. The one route where abuse costs real money.
  feedback: { requests: 3, window: "1 h" },
  // Cheap, but no reason for a burst.
  visitor: { requests: 10, window: "1 m" },
} as const

export type LimitName = keyof typeof LIMITS

const limiters = new Map<LimitName, Ratelimit>()

function getLimiter(name: LimitName): Ratelimit {
  let limiter = limiters.get(name)
  if (!limiter) {
    const { requests, window } = LIMITS[name]
    limiter = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `rl:${name}`,
      analytics: false,
    })
    limiters.set(name, limiter)
  }
  return limiter
}

export type RateLimitResult = {
  ok: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Returns `ok: false` only when the caller has genuinely exceeded the limit.
 * Missing configuration or a failed Redis call returns `ok: true`.
 */
export async function checkRateLimit(
  request: NextRequest,
  name: LimitName
): Promise<RateLimitResult> {
  const allowed: RateLimitResult = { ok: true, limit: LIMITS[name].requests, remaining: -1, reset: 0 }
  if (!KV_CONFIGURED) return allowed

  try {
    const { success, limit, remaining, reset } = await getLimiter(name).limit(clientKey(request))
    return { ok: success, limit, remaining, reset }
  } catch {
    // Redis unavailable — fail open rather than block practice.
    return allowed
  }
}

/** Standard rate-limit headers, so a client can back off rather than guess. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = { "X-RateLimit-Limit": String(result.limit) }
  if (result.remaining >= 0) headers["X-RateLimit-Remaining"] = String(result.remaining)
  if (result.reset) {
    headers["X-RateLimit-Reset"] = String(result.reset)
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    headers["Retry-After"] = String(retryAfter)
  }
  return headers
}

/** The 429 body every route returns, worded for whoever ends up reading it. */
export function tooManyRequests(result: RateLimitResult) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: rateLimitHeaders(result) }
  )
}
