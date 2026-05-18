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
          scrapeWeWorkRemotely: true,
          scrapeWellfound: true,
          scrapeWorkingNomads: true,
          scrapeRemoteCo: true,
          scrapeJobspresso: true,
          scrapeNoDesk: true,
          scrapeSkipTheDrive: true,
          scrapeRemoteRocketship: true,
          scrapeDailyRemote: true,
          scrapeOtta: true,
          scrapeOnlineJobs: true,
          scrapeUpwork: false,
          scrapeRemoteOK: true,
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
      scrapeWeWorkRemotely: true,
      scrapeWellfound: true,
      scrapeWorkingNomads: true,
      scrapeRemoteCo: true,
      scrapeJobspresso: true,
      scrapeNoDesk: true,
      scrapeSkipTheDrive: true,
      scrapeRemoteRocketship: true,
      scrapeDailyRemote: true,
      scrapeOtta: true,
      scrapeOnlineJobs: true,
      scrapeUpwork: false,
      scrapeRemoteOK: true,
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
