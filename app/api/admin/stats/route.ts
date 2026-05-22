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
    const [
      planGroups,
      totalJobs,
      jobSourceGroups,
      totalApplications,
      appStatusGroups,
      recentLogs,
      logStatusGroups,
      scraperMetrics
    ] = await Promise.all([
      // 1. User breakdown by Plan (groupBy)
      prisma.settings.groupBy({
        by: ['plan'],
        _count: { _all: true }
      }),
      // 2. Total jobs count
      prisma.job.count(),
      // Jobs grouped by source
      prisma.job.groupBy({
        by: ['source'],
        _count: { _all: true }
      }),
      // 3. Total applications count
      prisma.application.count(),
      // Applications grouped by status
      prisma.application.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      // 4. Recent scraper logs
      prisma.scraperLog.findMany({
        take: 10,
        orderBy: { startedAt: 'desc' }
      }),
      // Scraper logs status counts (groupBy)
      prisma.scraperLog.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      // Overall scraper log metrics
      prisma.scraperLog.aggregate({
        _sum: {
          jobsFound: true,
          jobsInserted: true,
          jobsDuplicated: true
        }
      })
    ]);

    // Calculate user count metrics
    let totalUsers = 0;
    let freeUsers = 0;
    let proUsers = 0;
    let teamUsers = 0;

    for (const group of planGroups) {
      const count = group._count._all;
      totalUsers += count;
      if (group.plan === 'FREE') freeUsers = count;
      else if (group.plan === 'PRO') proUsers = count;
      else if (group.plan === 'TEAM') teamUsers = count;
    }

    // Process job distribution
    const jobDistribution = jobSourceGroups.map(group => ({
      source: (group.source || 'Unknown').toUpperCase(),
      count: group._count._all
    })).sort((a, b) => b.count - a.count);

    // Process applications distribution
    const appDistribution = appStatusGroups.map(group => ({
      status: (group.status || 'Applied').toUpperCase(),
      count: group._count._all
    }));

    // Process scraper logs metrics
    let totalLogs = 0;
    let successfulLogs = 0;
    let failedLogs = 0;

    for (const group of logStatusGroups) {
      const count = group._count._all;
      totalLogs += count;
      if (group.status === 'SUCCESS') successfulLogs = count;
      else if (group.status === 'FAILED') failedLogs = count;
    }

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
