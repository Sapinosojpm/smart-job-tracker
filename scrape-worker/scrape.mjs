import { chromium } from 'playwright';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function scrapeJobStreet(page, query) {
  const jobs = [];
  const url = `https://ph.jobstreet.com/en/job-search/${encodeURIComponent(query).replace(/%20/g, '-')}-jobs/`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  for (const selector of [
    'article[data-automation="jobCard"]',
    '[data-automation="job-card"]',
  ]) {
    const cards = await page.$$(selector);
    if (cards.length === 0) continue;

    for (const card of cards) {
      const titleEl = await card.$('[data-automation="jobTitle"]');
      const companyEl = await card.$('[data-automation="jobCompany"]');
      const locationEl = await card.$('[data-automation="jobLocation"]');
      const title = (await titleEl?.innerText())?.trim();
      const company = (await companyEl?.innerText())?.trim();
      const location = (await locationEl?.innerText())?.trim();
      const link = (await (await titleEl?.getProperty('href'))?.jsonValue()) ?? '';
      if (title && company && link) {
        jobs.push({
          title,
          company,
          link: link.startsWith('http') ? link : `https://ph.jobstreet.com${link}`,
          source: 'JobStreet PH',
          location: location || undefined,
        });
      }
    }
    break;
  }
  return jobs;
}

async function scrapeIndeed(page, query) {
  const jobs = [];
  const url = `https://ph.indeed.com/jobs?q=${encodeURIComponent(query)}&l=Philippines`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('#mosaic-provider-jobcards', { timeout: 15000 }).catch(() => {});

  for (const card of await page.$$('.job_seen_beacon')) {
    const titleEl = await card.$('.jobTitle a');
    const companyEl = await card.$('[data-testid="company-name"]');
    const locationEl = await card.$('[data-testid="text-location"]');
    const title = (await titleEl?.innerText())?.trim();
    const company = (await companyEl?.innerText())?.trim();
    const location = (await locationEl?.innerText())?.trim();
    const link = (await (await titleEl?.getProperty('href'))?.jsonValue()) ?? '';
    if (title && company && link) {
      jobs.push({
        title,
        company,
        link: link.startsWith('http') ? link : `https://ph.indeed.com${link}`,
        source: 'Indeed PH',
        location: location || undefined,
      });
    }
  }
  return jobs;
}

async function scrapeLinkedIn(page, query) {
  const jobs = [];
  const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=Philippines&f_TPR=r86400`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  for (const card of await page.$$(
    '.base-card, .job-search-card, .base-search-card, [data-entity-urn]',
  )) {
    const titleEl = await card.$('.base-search-card__title, .job-search-card__title, h3, h4');
    const companyEl = await card.$(
      '.base-search-card__subtitle, .job-search-card__subtitle, .hidden-nested-link',
    );
    const locationEl = await card.$('.job-search-card__location, .base-search-card__metadata');
    const linkEl = await card.$('a.base-card__full-link, a.job-search-card__link, a');
    const title = (await titleEl?.innerText())?.trim();
    const company = (await companyEl?.innerText())?.trim();
    const location = (await locationEl?.innerText())?.trim();
    const link = (await (await linkEl?.getProperty('href'))?.jsonValue()) ?? '';
    if (title && company && link) {
      jobs.push({
        title,
        company,
        link: String(link).split('?')[0],
        source: 'LinkedIn',
        location: location || undefined,
      });
    }
  }
  return jobs;
}

export async function scrapeWithPlaywright(query, sources) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({ userAgent: UA });
    const page = await context.newPage();
    const all = [];

    if (sources.jobstreet) {
      console.log('[worker] JobStreet…');
      all.push(...(await scrapeJobStreet(page, query)));
      await page.waitForTimeout(2000);
    }
    if (sources.indeed) {
      console.log('[worker] Indeed…');
      all.push(...(await scrapeIndeed(page, query)));
      await page.waitForTimeout(2000);
    }
    if (sources.linkedin) {
      console.log('[worker] LinkedIn…');
      all.push(...(await scrapeLinkedIn(page, query)));
    }

    console.log(`[worker] Total raw jobs: ${all.length}`);
    return all;
  } finally {
    await browser.close();
  }
}
