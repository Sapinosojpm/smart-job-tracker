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
    if (settings.scrapeIndeed !== false) activeSources.push('Indeed PH');
    if (settings.scrapeJobStreet !== false) activeSources.push('JobStreet PH');
    if (settings.scrapeOnlineJobs !== false) activeSources.push('OnlineJobs.ph');
    if (settings.scrapeUpwork !== false) activeSources.push('Upwork');
    if (settings.scrapeLinkedIn !== false) activeSources.push('LinkedIn');
    // @ts-ignore
    if (settings.scrapeRemoteOK) activeSources.push('RemoteOK');
    // @ts-ignore
    if (settings.scrapeWWR) activeSources.push('WWR');

    // 2. Build the query
    const where: any = {
      userId: user.id,
      source: { in: activeSources }, // Only show jobs from active sources
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
