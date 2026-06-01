import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

const KEY = "visitor_count"

export async function GET() {
  try {
    const count = await kv.get<number>(KEY)
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

export async function POST() {
  try {
    const count = await kv.incr(KEY)
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
