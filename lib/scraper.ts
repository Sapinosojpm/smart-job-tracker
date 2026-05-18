import type { ScrapeResult } from './scraper-shared';

export type { ScrapedJob, ScrapeResult } from './scraper-shared';

/** Runs HTTP scrapers on Vercel; Playwright scrapers when running locally. */
export async function runScraper(userId: string, query?: string): Promise<ScrapeResult> {
  if (process.env.VERCEL === '1') {
    const { runHttpScraper } = await import('./scraper-http');
    return runHttpScraper(userId, query);
  }
  const { runPlaywrightScraper } = await import('./scraper-playwright');
  return runPlaywrightScraper(userId, query);
}
