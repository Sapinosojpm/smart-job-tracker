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

    // Populate each user settings with their dynamic action/activity counts
    const usersData = await Promise.all(
      usersSettings.map(async (setting) => {
        const [jobCount, applicationCount, logCount] = await Promise.all([
          prisma.job.count({ where: { userId: setting.userId } }),
          prisma.application.count({ where: { userId: setting.userId } }),
          prisma.scraperLog.count({ where: { userId: setting.userId } })
        ]);

        return {
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
          jobCount,
          applicationCount,
          logCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: usersData
    });
  } catch (error: any) {
    console.error('[ADMIN_USERS_API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
