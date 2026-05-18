import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { getAppSettings } from '@/lib/settings';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch stats and settings in parallel
    const [settingsData, total, applicationCount, newJobs, sourcesData] = await Promise.all([
      getAppSettings(user.id),
      prisma.job.count({ where: { userId: user.id } }),
      prisma.application.count({ where: { userId: user.id } }),
      prisma.job.count({ where: { userId: user.id, isApplied: false } }),
      prisma.job.groupBy({
        by: ['source'],
        where: { userId: user.id },
        _count: { _all: true },
        orderBy: { _count: { source: 'desc' } },
      }),
    ]);

    const sources = sourcesData.map(item => ({
      source: item.source,
      count: item._count._all,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total,
          applied: applicationCount,
          new: newJobs,
          sources,
        },
        settings: settingsData,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[API /dashboard]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
