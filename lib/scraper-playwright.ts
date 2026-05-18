import type { Browser, Page } from 'playwright';
import prisma from './prisma';
import { getAppSettings } from './settings';
import {
  type ScrapedJob,
  type ScrapeResult,
  finalizeScrape,
  markScrapeFailed,
} from './scraper-shared';

async function scrapeJobStreet(page: Page, query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://ph.jobstreet.com/en/job-search/${encodedQuery.replace(/%20/g, '-')}-jobs/`;

    console.log(`[Scraper] Visiting JobStreet: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const cardSelectors = [
      'article[data-automation="jobCard"]',
      'motion.div[data-automation="job-card"]',
      'motion.div[data-automation="jobCard"]',
      'div[data-automation="jobCard"]',
      'article',
      '[data-automation="job-card"]',
    ];

    let jobCards: Awaited<ReturnType<Page['$$']>> = [];
    for (const selector of cardSelectors) {
      jobCards = await page.$$(selector);
      if (jobCards.length > 0) break;
    }

    if (jobCards.length === 0) return [];

    for (const card of jobCards) {
      const titleEl = await card.$('[data-automation="jobTitle"]');
      const companyEl = await card.$('[data-automation="jobCompany"]');
      const locationEl = await card.$('[data-automation="jobLocation"]');
      const salaryEl = await card.$('[data-automation="jobSalary"]');

      const title = (await titleEl?.innerText())?.trim();
      const company = (await companyEl?.innerText())?.trim();
      const location = (await locationEl?.innerText())?.trim();
      const salary = (await salaryEl?.innerText())?.trim();
      const link = (await (await titleEl?.getProperty('href'))?.jsonValue()) as string;

      if (title && company && link) {
        jobs.push({
          title,
          company,
          link,
          source: 'JobStreet PH',
          location: location || undefined,
          salary: salary || undefined,
        });
      }
    }
  } catch (err) {
    console.error('[Scraper] JobStreet PH error:', err);
  }
  return jobs;
}

async function scrapeIndeed(page: Page, query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://ph.indeed.com/jobs?q=${encodedQuery}&l=Philippines`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#mosaic-provider-jobcards', { timeout: 10000 }).catch(() => {});

    const jobCards = await page.$$('.job_seen_beacon');

    for (const card of jobCards) {
      const titleEl = await card.$('.jobTitle a');
      const companyEl = await card.$('[data-testid="company-name"]');
      const locationEl = await card.$('[data-testid="text-location"]');
      const salaryEl = await card.$('.salary-section, .estimated-salary');

      const title = (await titleEl?.innerText())?.trim();
      const company = (await companyEl?.innerText())?.trim();
      const location = (await locationEl?.innerText())?.trim();
      const salary = (await salaryEl?.innerText())?.trim();
      const link = (await (await titleEl?.getProperty('href'))?.jsonValue()) as string;

      if (title && company && link) {
        jobs.push({
          title,
          company,
          link,
          source: 'Indeed PH',
          location: location || undefined,
          salary: salary || undefined,
        });
      }
    }
  } catch (err) {
    console.error('[Scraper] Indeed PH error:', err);
  }
  return jobs;
}

async function scrapeOnlineJobs(page: Page, query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.onlinejobs.ph/jobseekers/jobsearch?jobkeyword=${encodedQuery}`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const jobCards = await page.$$('.jobpost-cat-box');

    for (const card of jobCards) {
      const titleEl = await card.$('h4');
      const salaryEl = await card.$('dd');
      const linkEl = await card.$('a');

      const title = (await titleEl?.innerText())?.trim();
      const salary = (await salaryEl?.innerText())?.trim();
      let link = (await (await linkEl?.getProperty('href'))?.jsonValue()) as string;

      if (title && link) {
        if (!link.startsWith('http')) {
          link = `https://www.onlinejobs.ph${link}`;
        }

        jobs.push({
          title,
          company: 'Private Employer',
          link,
          source: 'OnlineJobs.ph',
          salary: salary || undefined,
          location: 'Remote',
        });
      }
    }
  } catch (err) {
    console.error('[Scraper] OnlineJobs.ph error:', err);
  }
  return jobs;
}

async function scrapeRemoteOK(page: Page, query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://remoteok.com/remote-jobs?q=${encodedQuery}`;
    console.log(`[Scraper] Visiting RemoteOK: ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const jobCards = await page.$$('tr.job');

    for (const card of jobCards) {
      const titleEl = await card.$('h2');
      const companyEl = await card.$('h3');
      const linkEl = await card.$('a.preventLink');
      const locations = await card.$$('.location');

      const title = (await titleEl?.innerText())?.trim();
      const company = (await companyEl?.innerText())?.trim();
      let link = (await (await linkEl?.getProperty('href'))?.jsonValue()) as string;

      let location = 'Remote';
      let salary: string | undefined;

      if (locations.length > 0) {
        location = (await locations[0].innerText())?.trim() || 'Remote';
        if (locations.length > 1) {
          const salText = (await locations[locations.length - 1].innerText())?.trim();
          if (salText?.includes('$')) salary = salText;
        }
      }

      if (title && company && link) {
        jobs.push({
          title,
          company,
          link,
          source: 'RemoteOK',
          location,
          salary,
        });
      }
    }

    console.log(`[Scraper] RemoteOK found ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper] RemoteOK error:', err);
  }
  return jobs;
}

async function scrapeLinkedIn(page: Page, query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodedQuery}&location=Philippines&f_TPR=r86400`;
    console.log(`[Scraper] Visiting LinkedIn: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const jobCards = await page.$$(
      '.base-card, .job-search-card, .base-search-card, [data-entity-urn]',
    );
    for (const card of jobCards) {
      const titleEl = await card.$(
        '.base-search-card__title, .job-search-card__title, h3, h4',
      );
      const companyEl = await card.$(
        '.base-search-card__subtitle, .job-search-card__subtitle, .hidden-nested-link, .base-search-card__subtitle-link',
      );
      const locationEl = await card.$('.job-search-card__location, .base-search-card__metadata');
      const linkEl = await card.$('a.base-card__full-link, a.job-search-card__link, a');

      const title = (await titleEl?.innerText())?.trim();
      const company = (await companyEl?.innerText())?.trim();
      const location = (await locationEl?.innerText())?.trim();
      const link = (await (await linkEl?.getProperty('href'))?.jsonValue()) as string;

      if (title && company && link) {
        jobs.push({
          title,
          company,
          link: link.split('?')[0],
          source: 'LinkedIn',
          location: location || undefined,
        });
      }
    }
  } catch (err) {
    console.error('[Scraper] LinkedIn error:', err);
  }
  return jobs;
}

export async function runPlaywrightScraper(userId: string, query?: string): Promise<ScrapeResult> {
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
      source: 'multi-source-playwright',
      keywords,
    },
  });

  let browser: Browser | null = null;
  try {
    console.log(`[Scraper] Starting Playwright scrape for User ${userId}: "${searchQuery}"`);

    const { chromium } = await import('playwright');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    let jobStreetJobs: ScrapedJob[] = [];
    let indeedJobs: ScrapedJob[] = [];
    let onlineJobs: ScrapedJob[] = [];
    let linkedInJobs: ScrapedJob[] = [];
    let remoteOKJobs: ScrapedJob[] = [];

    if (settings.scrapeJobStreet !== false) {
      jobStreetJobs = await scrapeJobStreet(page, searchQuery);
    }

    if (settings.scrapeIndeed !== false) {
      indeedJobs = await scrapeIndeed(page, searchQuery);
    }

    if (settings.scrapeOnlineJobs !== false) {
      onlineJobs = await scrapeOnlineJobs(page, searchQuery);
    }

    if (settings.scrapeLinkedIn !== false) {
      linkedInJobs = await scrapeLinkedIn(page, searchQuery);
    }

    if (settings.scrapeRemoteOK) {
      remoteOKJobs = await scrapeRemoteOK(page, searchQuery);
    }

    const allJobs = [
      ...jobStreetJobs,
      ...indeedJobs,
      ...onlineJobs,
      ...linkedInJobs,
      ...remoteOKJobs,
    ];

    return await finalizeScrape(userId, log.id, allJobs, searchQuery, keywords);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await markScrapeFailed(log.id, userId, message);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}
