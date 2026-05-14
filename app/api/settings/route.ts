import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const settings = await prisma.settings.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ success: true, data: settings });
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
      scrapeIndeed, 
      scrapeJobStreet, 
      scrapeOnlineJobs, 
      scrapeUpwork, 
      scrapeLinkedIn, 
      scrapeRemoteOK, 
      telegramBotToken, 
      telegramChatId, 
      plan 
    } = body;
    const currentSettings = await prisma.settings.findUnique({ where: { userId: user.id } });
    const userPlan = plan || currentSettings?.plan || 'FREE';
    let finalKeywords = keywordFilters || [];
    if (userPlan === 'FREE' && finalKeywords.length > 1) finalKeywords = [finalKeywords[0]];
    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: {
        scraperQuery,
        keywordFilters: finalKeywords,
        scrapeIndeed,
        scrapeJobStreet,
        scrapeOnlineJobs,
        scrapeUpwork,
        scrapeLinkedIn,
        scrapeRemoteOK,
        telegramBotToken,
        telegramChatId,
        plan: userPlan
      },
      create: {
        userId: user.id,
        scraperQuery,
        keywordFilters: finalKeywords,
        scrapeIndeed,
        scrapeJobStreet,
        scrapeOnlineJobs,
        scrapeUpwork,
        scrapeLinkedIn,
        scrapeRemoteOK,
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
