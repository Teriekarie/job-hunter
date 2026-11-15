import { NextResponse } from 'next/server';
import { anonDb } from '@/lib/supabase/server';
import { doRun } from '@/lib/run-server';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// The daily automatic search. Vercel calls this once a day and proves itself with CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'not allowed' }, { status: 401 });
  try {
    return NextResponse.json(await doRun(anonDb(), 'daily', secret));
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 500 });
  }
}
