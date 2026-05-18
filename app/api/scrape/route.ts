import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const query = body?.query as string | undefined;

    const settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    if (!settings || settings.plan === 'FREE') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const todayScrapeCount = await prisma.job.count({
        where: {
          userId: user.id,
          createdAt: { gte: twentyFourHoursAgo },
        },
      });

      if (todayScrapeCount >= 50) {
        const oldestJob = await prisma.job.findFirst({
          where: { userId: user.id, createdAt: { gte: twentyFourHoursAgo } },
          orderBy: { createdAt: 'asc' },
        });

        const resetTime = oldestJob
          ? new Date(oldestJob.createdAt.getTime() + 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 60 * 60 * 1000);

        return NextResponse.json(
          {
            success: false,
            error: 'Daily limit reached (50 jobs/day).',
            resetTime: resetTime.toISOString(),
            isLimitReached: true,
          },
          { status: 403 },
        );
      }
    }

    const { runScraper } = await import('@/lib/scraper');
    const result = await runScraper(user.id, query);

    return NextResponse.json({
      success: true,
      message: `Scrape complete. Found ${result.jobsFound}, inserted ${result.jobsInserted}, duplicates ${result.jobsDuplicated}`,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scrape failed';
    console.error('[API /scrape]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
