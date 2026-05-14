import { NextRequest, NextResponse } from 'next/server';

// Vercel cron job endpoint — add to vercel.json:
// { "crons": [{ "path": "/api/cron", "schedule": "*/10 * * * *" }] }
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Dynamic import to avoid issues with non-Node environments
    const { runScraper } = await import('@/lib/scraper');
    const result = await runScraper();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cron job failed';
    console.error('[CRON]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
