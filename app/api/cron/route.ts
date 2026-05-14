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
    const { prisma } = await import('@/lib/prisma');

    // Fetch all users who have settings (active users)
    const users = await prisma.settings.findMany({
      select: { userId: true }
    });

    const results = [];
    for (const user of users) {
      try {
        const result = await runScraper(user.userId);
        results.push({ userId: user.userId, success: true, result });
      } catch (err: any) {
        console.error(`[CRON] Failed for user ${user.userId}:`, err.message);
        results.push({ userId: user.userId, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedUsers: users.length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cron job failed';
    console.error('[CRON]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

