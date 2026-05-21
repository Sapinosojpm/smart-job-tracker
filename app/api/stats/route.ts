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

    // 1. Get active sources from user settings
    const settings = await getAppSettings(user.id);
    const activeSources: string[] = [];
    if (settings.scrapeWeWorkRemotely) activeSources.push('We Work Remotely');
    if (settings.scrapeWellfound) activeSources.push('Wellfound');
    if (settings.scrapeWorkingNomads) activeSources.push('Working Nomads');
    if (settings.scrapeRemoteCo) activeSources.push('Remote.co');
    if (settings.scrapeJobspresso) activeSources.push('Jobspresso');
    if (settings.scrapeNoDesk) activeSources.push('NoDesk');
    if (settings.scrapeSkipTheDrive) activeSources.push('SkipTheDrive');
    if (settings.scrapeRemoteRocketship) activeSources.push('Remote Rocketship');
    if (settings.scrapeDailyRemote) activeSources.push('DailyRemote');
    if (settings.scrapeOtta) activeSources.push('Otta');
    if (settings.scrapeOnlineJobs !== false) activeSources.push('OnlineJobs.ph');
    if (settings.scrapeUpwork) activeSources.push('Upwork');
    if (settings.scrapeRemoteOK) {
      activeSources.push('RemoteOK');
      activeSources.push('Remotive');
      activeSources.push('Arbeitnow');
      activeSources.push('Himalayas');
      activeSources.push('Jobicy');
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    // 2. Build the where clause for general filtering
    const baseWhere: any = { 
      userId: user.id,
      source: { in: activeSources } // Filter by active sources
    };

    let dateWhere: any = { ...baseWhere };
    if (since) {
      dateWhere.createdAt = { gte: new Date(since) };
    }

    const [total, applicationCount, newJobs, sourcesData] = await Promise.all([
      prisma.job.count({ where: baseWhere }),
      prisma.application.count({ 
        where: { userId: user.id } // Show all applications regardless of active sources
      }),
      prisma.job.count({ where: { ...dateWhere, isApplied: false } }),
      prisma.job.groupBy({
        by: ['source'],
        where: baseWhere,
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            source: 'desc',
          },
        },
      }),
    ]);

    // Format sources to match UI expectations
    const sources = sourcesData.map(item => ({
      source: item.source,
      count: item._count._all
    }));

    return NextResponse.json({
      success: true,
      data: {
        total,
        applied: applicationCount,
        new: newJobs,
        sources,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
