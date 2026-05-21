import prisma from './prisma';

export interface ISettings {
  id: string;
  userId: string;
  scraperQuery: string;
  keywordFilters: string[];
  scrapeWeWorkRemotely: boolean;
  scrapeWellfound: boolean;
  scrapeWorkingNomads: boolean;
  scrapeRemoteCo: boolean;
  scrapeJobspresso: boolean;
  scrapeNoDesk: boolean;
  scrapeSkipTheDrive: boolean;
  scrapeRemoteRocketship: boolean;
  scrapeDailyRemote: boolean;
  scrapeOtta: boolean;
  scrapeOnlineJobs: boolean;
  scrapeUpwork: boolean;
  scrapeRemoteOK: boolean;
  filterRemote: boolean;
  filterHybrid: boolean;
  filterOnsite: boolean;
  emailUser: string | null;
  emailPass: string | null;
  emailTo: string | null;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  plan: 'FREE' | 'PRO' | 'TEAM';
}

export async function getAppSettings(userId: string): Promise<ISettings> {
  try {
    let settings = await prisma.settings.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId,
          scraperQuery: 'react developer',
          keywordFilters: [],
          // ✅ SAFE from Vercel (no Cloudflare/bot protection)
          scrapeRemoteOK: true,          // RemoteOK + Remotive + Arbeitnow JSON APIs
          scrapeWeWorkRemotely: true,    // RSS feed works
          scrapeOnlineJobs: true,        // No bot protection
          // ❌ BLOCKED from Vercel server IPs — enable only via scrape-worker
          scrapeWellfound: false,
          scrapeWorkingNomads: false,
          scrapeRemoteCo: false,
          scrapeJobspresso: false,
          scrapeNoDesk: false,
          scrapeSkipTheDrive: false,
          scrapeRemoteRocketship: false,
          scrapeDailyRemote: false,
          scrapeOtta: false,
          scrapeUpwork: false,
          filterRemote: true,
          filterHybrid: true,
          filterOnsite: false,
          plan: 'FREE',
        }
      });
    }

    return settings as unknown as ISettings;
  } catch (err) {
    console.error('[SETTINGS_LIB] Error fetching settings:', err);
    // Return defaults if DB fails
    return {
      id: 'temp',
      userId,
      scraperQuery: 'react developer',
      keywordFilters: [],
      // Safe defaults — only Vercel-compatible sources
      scrapeRemoteOK: true,
      scrapeWeWorkRemotely: true,
      scrapeOnlineJobs: true,
      // Blocked from Vercel — off by default
      scrapeWellfound: false,
      scrapeWorkingNomads: false,
      scrapeRemoteCo: false,
      scrapeJobspresso: false,
      scrapeNoDesk: false,
      scrapeSkipTheDrive: false,
      scrapeRemoteRocketship: false,
      scrapeDailyRemote: false,
      scrapeOtta: false,
      scrapeUpwork: false,
      filterRemote: true,
      filterHybrid: true,
      filterOnsite: false,
      emailUser: null,
      emailPass: null,
      emailTo: null,
      telegramBotToken: null,
      telegramChatId: null,
      plan: 'FREE',
    };
  }
}
