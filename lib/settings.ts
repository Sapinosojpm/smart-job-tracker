import prisma from './prisma';

export interface ISettings {
  id: string;
  userId: string;
  scraperQuery: string;
  keywordFilters: string[];
  scrapeIndeed: boolean;
  scrapeJobStreet: boolean;
  scrapeOnlineJobs: boolean;
  scrapeUpwork: boolean;
  scrapeLinkedIn: boolean;
  scrapeRemoteOK: boolean;
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
          scrapeIndeed: true,
          scrapeJobStreet: true,
          scrapeOnlineJobs: true,
          scrapeUpwork: false,
          scrapeLinkedIn: true,
          scrapeRemoteOK: true,
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
      scrapeIndeed: true,
      scrapeJobStreet: true,
      scrapeOnlineJobs: true,
      scrapeUpwork: false,
      scrapeLinkedIn: true,
      scrapeRemoteOK: true,
      emailUser: null,
      emailPass: null,
      emailTo: null,
      telegramBotToken: null,
      telegramChatId: null,
      plan: 'FREE',
    };
  }
}
