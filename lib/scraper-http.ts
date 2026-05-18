import prisma from './prisma';
import { getAppSettings } from './settings';
import {
  type ScrapeResult,
  finalizeScrape,
  markScrapeFailed,
} from './scraper-shared';
import { collectFreeApiJobs } from './scraper-free-apis';
import {
  fetchJobsFromWorker,
  needsWorker,
  workerSourcesFromSettings,
} from './scraper-worker-client';

export async function runHttpScraper(userId: string, query?: string): Promise<ScrapeResult> {
  const settings = await getAppSettings(userId);

  const searchQuery =
    typeof query === 'string' && query.trim().length > 0
      ? query
      : settings.scraperQuery || 'react developer';
  const keywords = settings.keywordFilters || [];

  const log = await prisma.scraperLog.create({
    data: {
      userId,
      startedAt: new Date(),
      status: 'running',
      source: process.env.SCRAPE_WORKER_URL ? 'free-apis+worker' : 'free-apis',
      keywords,
    },
  });

  try {
    console.log(`[Scraper] Production scrape for ${userId}: "${searchQuery}"`);

    const freeJobs = await collectFreeApiJobs(settings, searchQuery);

    let workerJobs: Awaited<ReturnType<typeof fetchJobsFromWorker>> = [];
    if (needsWorker(settings)) {
      if (process.env.SCRAPE_WORKER_URL) {
        workerJobs = await fetchJobsFromWorker(
          searchQuery,
          workerSourcesFromSettings(settings),
        );
      } else {
        console.warn(
          '[Scraper] Indeed/JobStreet/LinkedIn need SCRAPE_WORKER_URL (free home PC + Cloudflare Tunnel). Using free APIs only.',
        );
      }
    }

    const allJobs = [...freeJobs, ...workerJobs];
    return await finalizeScrape(userId, log.id, allJobs, searchQuery, keywords);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await markScrapeFailed(log.id, userId, message);
    throw err;
  }
}
