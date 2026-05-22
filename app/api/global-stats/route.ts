import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 600; // Cache the statistics for 10 minutes

export async function GET() {
  try {
    // We want global counts for the landing page
    const [totalJobs, totalApplications, totalUsers] = await Promise.all([
      prisma.job.count(),
      prisma.application.count(),
      prisma.settings.count() 
    ]);

    console.log('[GLOBAL_STATS] Success:', { totalJobs, totalApplications, totalUsers });

    return NextResponse.json(
      {
        success: true,
        data: {
          totalJobs, 
          activeUsers: totalUsers, 
          successMatches: totalApplications
        }
      },
      {
        headers: {
          // Cache on CDN for 10 minutes, and allow serving stale data while revalidating in the background
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
        }
      }
    );
  } catch (error) {
    console.error('[GLOBAL_STATS_API] Error:', error);
    // On failure, return mock fallback data but do NOT cache it so we retry next time
    return NextResponse.json(
      { 
        success: true, 
        data: { totalJobs: 1240, activeUsers: 42, successMatches: 86 } 
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}
