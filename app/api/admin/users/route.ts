import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const ADMIN_EMAILS = ['sapinosojpm@gmail.com', 'sapinosomille@gmail.com'];

async function isAdminAuthorized() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return false;

    const envAdminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);

    const email = user.email.toLowerCase();
    return (
      envAdminEmails.includes(email) || 
      email === 'sapinosojpm@gmail.com' || 
      email === 'sapinosomille@gmail.com' || 
      ADMIN_EMAILS.includes(email)
    );
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const planFilter = searchParams.get('plan');
    const searchFilter = searchParams.get('search');

    // Build query conditions
    const where: any = {};
    if (planFilter && ['FREE', 'PRO', 'TEAM'].includes(planFilter)) {
      where.plan = planFilter;
    }
    if (searchFilter) {
      where.OR = [
        { userId: { contains: searchFilter, mode: 'insensitive' } },
        { scraperQuery: { contains: searchFilter, mode: 'insensitive' } },
        { emailTo: { contains: searchFilter, mode: 'insensitive' } }
      ];
    }

    const usersSettings = await prisma.settings.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const userIds = usersSettings.map(u => u.userId);

    // Fetch aggregates for all these users in exactly 3 fast grouped queries
    const [jobCounts, appCounts, logCounts] = await Promise.all([
      prisma.job.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      prisma.application.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      prisma.scraperLog.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      })
    ]);

    // Convert groups to easy lookup maps
    const jobCountMap = Object.fromEntries(jobCounts.map(g => [g.userId, g._count._all]));
    const appCountMap = Object.fromEntries(appCounts.map(g => [g.userId, g._count._all]));
    const logCountMap = Object.fromEntries(logCounts.map(g => [g.userId, g._count._all]));

    const usersData = usersSettings.map((setting) => ({
      id: setting.id,
      userId: setting.userId,
      plan: setting.plan,
      scraperQuery: setting.scraperQuery,
      keywordFilters: setting.keywordFilters,
      emailTo: setting.emailTo,
      scrapeIndeed: setting.scrapeIndeed,
      scrapeJobStreet: setting.scrapeJobStreet,
      scrapeOnlineJobs: setting.scrapeOnlineJobs,
      scrapeUpwork: setting.scrapeUpwork,
      scrapeLinkedIn: setting.scrapeLinkedIn,
      scrapeRemoteOK: setting.scrapeRemoteOK,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      jobCount: jobCountMap[setting.userId] || 0,
      applicationCount: appCountMap[setting.userId] || 0,
      logCount: logCountMap[setting.userId] || 0
    }));

    return NextResponse.json({
      success: true,
      data: usersData
    });
  } catch (error: any) {
    console.error('[ADMIN_USERS_API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
