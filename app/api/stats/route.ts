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
    if (settings.scrapeIndeed !== false) activeSources.push('Indeed PH');
    if (settings.scrapeJobStreet !== false) activeSources.push('JobStreet PH');
    if (settings.scrapeOnlineJobs !== false) activeSources.push('OnlineJobs.ph');
    if (settings.scrapeUpwork !== false) activeSources.push('Upwork');
    if (settings.scrapeLinkedIn !== false) activeSources.push('LinkedIn');
    // @ts-ignore
    if (settings.scrapeRemoteOK) activeSources.push('RemoteOK');
    // @ts-ignore
    if (settings.scrapeWWR) activeSources.push('WWR');

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
      id: item.source,
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
