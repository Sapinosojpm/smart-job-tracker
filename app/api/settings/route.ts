import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const settings = await prisma.settings.findUnique({ where: { userId: user.id } });
    
    // Calculate daily scrape count and limit
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayScrapeCount = await prisma.job.count({
      where: {
        userId: user.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    const isFree = !settings || settings.plan === 'FREE';

    return NextResponse.json({ 
      success: true, 
      data: settings ? {
        ...settings,
        todayScrapeCount,
        scrapeLimit: isFree ? 50 : null
      } : {
        plan: 'FREE',
        todayScrapeCount,
        scrapeLimit: 50
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { 
      scraperQuery, 
      keywordFilters, 
      scrapeWeWorkRemotely,
      scrapeWellfound,
      scrapeWorkingNomads,
      scrapeRemoteCo,
      scrapeJobspresso,
      scrapeNoDesk,
      scrapeSkipTheDrive,
      scrapeRemoteRocketship,
      scrapeDailyRemote,
      scrapeOtta,
      scrapeOnlineJobs,
      scrapeUpwork,
      scrapeRemoteOK, 
      filterRemote,
      filterHybrid,
      filterOnsite,
      telegramBotToken, 
      telegramChatId, 
      plan 
    } = body;
    const currentSettings = await prisma.settings.findUnique({ where: { userId: user.id } });
    
    // Security: Only allow keeping the same plan or downgrading to FREE
    // Upgrading must happen through payment webhooks
    let userPlan = currentSettings?.plan || 'FREE';
    if (plan === 'FREE') {
      userPlan = 'FREE';
    }
    let finalKeywords = keywordFilters || [];
    if (userPlan === 'FREE' && finalKeywords.length > 1) finalKeywords = [finalKeywords[0]];
    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: {
        scraperQuery,
        keywordFilters: finalKeywords,
        scrapeWeWorkRemotely,
        scrapeWellfound,
        scrapeWorkingNomads,
        scrapeRemoteCo,
        scrapeJobspresso,
        scrapeNoDesk,
        scrapeSkipTheDrive,
        scrapeRemoteRocketship,
        scrapeDailyRemote,
        scrapeOtta,
        scrapeOnlineJobs,
        scrapeUpwork,
        scrapeRemoteOK,
        filterRemote,
        filterHybrid,
        filterOnsite,
        telegramBotToken,
        telegramChatId,
        plan: userPlan
      },
      create: {
        userId: user.id,
        scraperQuery,
        keywordFilters: finalKeywords,
        scrapeWeWorkRemotely,
        scrapeWellfound,
        scrapeWorkingNomads,
        scrapeRemoteCo,
        scrapeJobspresso,
        scrapeNoDesk,
        scrapeSkipTheDrive,
        scrapeRemoteRocketship,
        scrapeDailyRemote,
        scrapeOtta,
        scrapeOnlineJobs,
        scrapeUpwork,
        scrapeRemoteOK,
        filterRemote,
        filterHybrid,
        filterOnsite,
        telegramBotToken,
        telegramChatId,
        plan: userPlan
      }
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
