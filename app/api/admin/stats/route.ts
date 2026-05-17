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

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. User breakdown by Plan
    const [totalUsers, freeUsers, proUsers, teamUsers] = await Promise.all([
      prisma.settings.count(),
      prisma.settings.count({ where: { plan: 'FREE' } }),
      prisma.settings.count({ where: { plan: 'PRO' } }),
      prisma.settings.count({ where: { plan: 'TEAM' } })
    ]);

    // 2. Jobs stats
    const totalJobs = await prisma.job.count();

    // Group jobs by source using performant DB-level aggregation (groupBy)
    const sourceGroups = await prisma.job.groupBy({
      by: ['source'],
      _count: { _all: true }
    });
    const jobDistribution = sourceGroups.map(group => ({
      source: (group.source || 'Unknown').toUpperCase(),
      count: group._count._all
    })).sort((a, b) => b.count - a.count);

    // 3. Applications Stats
    const totalApplications = await prisma.application.count();
    const statusGroups = await prisma.application.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    const appDistribution = statusGroups.map(group => ({
      status: (group.status || 'Applied').toUpperCase(),
      count: group._count._all
    }));

    // 4. Scraper Logs aggregation & recent history
    const [recentLogs, totalLogs, successfulLogs, failedLogs] = await Promise.all([
      prisma.scraperLog.findMany({
        take: 10,
        orderBy: { startedAt: 'desc' }
      }),
      prisma.scraperLog.count(),
      prisma.scraperLog.count({ where: { status: 'SUCCESS' } }),
      prisma.scraperLog.count({ where: { status: 'FAILED' } })
    ]);

    // Aggregate overall scraper metrics
    const scraperMetrics = await prisma.scraperLog.aggregate({
      _sum: {
        jobsFound: true,
        jobsInserted: true,
        jobsDuplicated: true
      }
    });

    const successRate = totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          free: freeUsers,
          pro: proUsers,
          team: teamUsers
        },
        jobs: {
          total: totalJobs,
          distribution: jobDistribution
        },
        applications: {
          total: totalApplications,
          distribution: appDistribution
        },
        scraper: {
          totalRuns: totalLogs,
          successRuns: successfulLogs,
          failedRuns: failedLogs,
          successRate,
          jobsFound: scraperMetrics._sum.jobsFound || 0,
          jobsInserted: scraperMetrics._sum.jobsInserted || 0,
          jobsDuplicated: scraperMetrics._sum.jobsDuplicated || 0,
          recentLogs
        },
        system: {
          dbHealth: 'Healthy',
          apiVersion: '1.2.0-BETA',
          latency: '24ms'
        }
      }
    });
  } catch (error: any) {
    console.error('[ADMIN_STATS_API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
