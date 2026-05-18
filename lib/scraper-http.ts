import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from './prisma';
import { getAppSettings, type ISettings } from './settings';
import {
  type ScrapedJob,
  type ScrapeResult,
  finalizeScrape,
  markScrapeFailed,
} from './scraper-shared';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

const axiosConfig = {
  headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/xml' },
  timeout: 20000,
};

async function fetchRemoteOKApi(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data } = await axios.get<unknown[]>('https://remoteok.com/api', {
      ...axiosConfig,
      headers: { ...axiosConfig.headers, Accept: 'application/json' },
    });
    if (!Array.isArray(data)) return jobs;

    const queryKeywords = query
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((k) => k.length > 2);

    for (const row of data.slice(1)) {
      if (!row || typeof row !== 'object') continue;
      const j = row as Record<string, unknown>;
      const title = String(j.position || '').trim();
      const company = String(j.company || '').trim();
      if (!title || !company) continue;

      const titleLower = title.toLowerCase();
      if (
        queryKeywords.length > 0 &&
        !queryKeywords.some((kw) => titleLower.includes(kw))
      ) {
        continue;
      }

      const slug = j.slug ? String(j.slug) : '';
      const link =
        (typeof j.url === 'string' && j.url) ||
        (slug ? `https://remoteok.com/remote-jobs/${slug}` : '');

      if (!link) continue;

      let salary: string | undefined;
      if (j.salary_min || j.salary_max) {
        const min = j.salary_min ? `$${j.salary_min}` : '';
        const max = j.salary_max ? `$${j.salary_max}` : '';
        salary = [min, max].filter(Boolean).join(' - ') || undefined;
      }

      jobs.push({
        title,
        company,
        link,
        source: 'RemoteOK',
        location: (j.location as string) || 'Remote',
        salary,
        description: typeof j.description === 'string' ? j.description : undefined,
      });
    }
    console.log(`[Scraper HTTP] RemoteOK API: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper HTTP] RemoteOK API error:', err);
  }
  return jobs;
}

async function fetchOnlineJobs(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://www.onlinejobs.ph/jobseekers/jobsearch?jobkeyword=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);

    $('.jobpost-cat-box').each((_, el) => {
      const card = $(el);
      const title = card.find('h4').first().text().trim();
      const salary = card.find('dd').first().text().trim();
      let link = card.find('a').first().attr('href')?.trim() || '';

      if (!title || !link) return;
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
    });
    console.log(`[Scraper HTTP] OnlineJobs.ph: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper HTTP] OnlineJobs.ph error:', err);
  }
  return jobs;
}

async function fetchIndeedRss(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://ph.indeed.com/rss?q=${encodeURIComponent(query)}&l=Philippines`;
    const { data: xml } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(xml, { xmlMode: true });

    $('item').each((_, el) => {
      const item = $(el);
      const title = item.find('title').first().text().trim();
      const link = item.find('link').first().text().trim();
      const description = item.find('description').first().text().trim();
      const company =
        item.find('source').first().text().trim() ||
        description.match(/company[:\s]+([^\n<]+)/i)?.[1]?.trim() ||
        'Unknown';

      if (title && link) {
        jobs.push({
          title,
          company,
          link,
          source: 'Indeed PH',
          description: description || undefined,
          location: 'Philippines',
        });
      }
    });
    console.log(`[Scraper HTTP] Indeed RSS: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper HTTP] Indeed RSS error:', err);
  }
  return jobs;
}

async function fetchJobStreet(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://ph.jobstreet.com/en/job-search/${encodedQuery.replace(/%20/g, '-')}-jobs/`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);

    const selectors = [
      'article[data-automation="jobCard"]',
      'motion.div[data-automation="job-card"]',
      '[data-automation="job-card"]',
    ];

    let cards = $();
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) {
        cards = found;
        break;
      }
    }

    cards.each((_, el) => {
      const card = $(el);
      const title =
        card.find('[data-automation="jobTitle"]').first().text().trim() ||
        card.find('a').first().text().trim();
      const company = card.find('[data-automation="jobCompany"]').first().text().trim();
      const location = card.find('[data-automation="jobLocation"]').first().text().trim();
      const salary = card.find('[data-automation="jobSalary"]').first().text().trim();
      let link =
        card.find('[data-automation="jobTitle"] a').attr('href') ||
        card.find('a[href*="/job/"]').first().attr('href') ||
        '';

      if (!title || !company || !link) return;
      if (!link.startsWith('http')) {
        link = `https://ph.jobstreet.com${link}`;
      }

      jobs.push({
        title,
        company,
        link,
        source: 'JobStreet PH',
        location: location || undefined,
        salary: salary || undefined,
      });
    });
    console.log(`[Scraper HTTP] JobStreet: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper HTTP] JobStreet error:', err);
  }
  return jobs;
}

async function collectHttpJobs(settings: ISettings, searchQuery: string): Promise<ScrapedJob[]> {
  const tasks: Promise<ScrapedJob[]>[] = [];

  if (settings.scrapeRemoteOK) {
    tasks.push(fetchRemoteOKApi(searchQuery));
  }
  if (settings.scrapeOnlineJobs !== false) {
    tasks.push(fetchOnlineJobs(searchQuery));
  }
  if (settings.scrapeIndeed !== false) {
    tasks.push(fetchIndeedRss(searchQuery));
  }
  if (settings.scrapeJobStreet !== false) {
    tasks.push(fetchJobStreet(searchQuery));
  }

  const batches = await Promise.all(tasks);
  return batches.flat();
}

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
      source: 'multi-source-http',
      keywords,
    },
  });

  try {
    console.log(`[Scraper HTTP] Starting for user ${userId}: "${searchQuery}"`);
    const allJobs = await collectHttpJobs(settings, searchQuery);
    return await finalizeScrape(userId, log.id, allJobs, searchQuery, keywords);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await markScrapeFailed(log.id, userId, message);
    throw err;
  }
}
