import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAppSettings } from '@/lib/settings';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    // 1. Get user settings to know which sources are active
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

    const allowedWorkModes: string[] = [];
    if (settings.filterRemote !== false) allowedWorkModes.push('Remote');
    if (settings.filterHybrid !== false) allowedWorkModes.push('Hybrid');
    if (settings.filterOnsite === true) allowedWorkModes.push('Onsite');
    
    if (allowedWorkModes.length === 0) {
      allowedWorkModes.push('Remote', 'Hybrid');
    }

    // 2. Build the query
    const where: any = {
      userId: user.id,
      source: { in: activeSources }, // Only show jobs from active sources
      workMode: { in: allowedWorkModes }, // Only show selected work modes
    };

    if (filter === 'new') where.isNewListing = true;
    if (filter === 'applied') where.isApplied = true;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    await prisma.job.delete({
      where: { id, userId: user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
