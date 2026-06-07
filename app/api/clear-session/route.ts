import { NextResponse } from 'next/server';
import { cbseGenerator, icseGenerator, igcseGenerator } from '@/lib/generatorSingleton';

export async function POST() {
  cbseGenerator.clearSession();
  icseGenerator.clearSession();
  igcseGenerator.clearSession();
  return NextResponse.json({ ok: true });
}
