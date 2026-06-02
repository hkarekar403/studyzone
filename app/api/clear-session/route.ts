import { NextResponse } from 'next/server';
import { generator } from '@/lib/generatorSingleton';

export async function POST() {
  generator.clearSession();
  return NextResponse.json({ ok: true });
}
