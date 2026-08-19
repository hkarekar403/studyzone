import { kv } from "@vercel/kv"
import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, tooManyRequests } from "@/lib/rateLimit"

const KEY = "visitor_count"

export async function GET() {
  try {
    const count = await kv.get<number>(KEY)
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

export async function POST(request: NextRequest) {
  const rl = await checkRateLimit(request, "visitor")
  if (!rl.ok) return tooManyRequests(rl)
  try {
    const count = await kv.incr(KEY)
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
