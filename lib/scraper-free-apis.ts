import axios from 'axios';
import * as cheerio from 'cheerio';
import type { ISettings } from './settings';
import type { ScrapedJob } from './scraper-shared';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

const axiosConfig = {
  headers: { 'User-Agent': UA, Accept: 'application/json,text/html' },
  timeout: 20000,
};

export function queryKeywordsFromSearch(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((k) => k.length > 2);
}

export function titleMatchesQuery(title: string, query: string): boolean {
  const keywords = queryKeywordsFromSearch(query);
  if (keywords.length === 0) return true;
  const lower = title.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export async function fetchRemoteOKApi(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data } = await axios.get<unknown[]>('https://remoteok.com/api', axiosConfig);
    if (!Array.isArray(data)) return jobs;

    for (const row of data.slice(1)) {
      if (!row || typeof row !== 'object') continue;
      const j = row as Record<string, unknown>;
      const title = String(j.position || '').trim();
      const company = String(j.company || '').trim();
      if (!title || !company || !titleMatchesQuery(title, query)) continue;

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
    console.log(`[Scraper] RemoteOK API: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper] RemoteOK API error:', err);
  }
  return jobs;
}

/** Free public API — https://remotive.com/api-documentation */
export async function fetchRemotiveApi(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data } = await axios.get<{ jobs?: Record<string, unknown>[] }>(
      'https://remotive.com/api/remote-jobs',
      {
        ...axiosConfig,
        params: { search: query },
      },
    );

    for (const j of data.jobs || []) {
      const title = String(j.title || '').trim();
      const company = String(j.company_name || '').trim();
      const link = String(j.url || '').trim();
      if (!title || !company || !link) continue;
      if (!titleMatchesQuery(title, query)) continue;

      jobs.push({
        title,
        company,
        link,
        source: 'Remotive',
        location: (j.candidate_required_location as string) || 'Remote',
        description: typeof j.description === 'string' ? j.description : undefined,
        salary: typeof j.salary === 'string' ? j.salary : undefined,
      });
    }
    console.log(`[Scraper] Remotive API: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper] Remotive API error:', err);
  }
  return jobs;
}

/** Free public API — https://www.arbeitnow.com/blog/job-board-api */
export async function fetchArbeitnowApi(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data } = await axios.get<{ data?: Record<string, unknown>[] }>(
      'https://www.arbeitnow.com/api/job-board-api',
      axiosConfig,
    );

    for (const j of data.data || []) {
      const title = String(j.title || '').trim();
      const company = String(j.company_name || '').trim();
      const slug = String(j.slug || '').trim();
      const link =
        String(j.url || '').trim() ||
        (slug ? `https://www.arbeitnow.com/jobs/${slug}` : '');
      if (!title || !company || !link) continue;
      if (!titleMatchesQuery(title, query)) continue;

      const tags = Array.isArray(j.tags) ? (j.tags as string[]).join(', ') : '';
      jobs.push({
        title,
        company,
        link,
        source: 'Arbeitnow',
        location: (j.location as string) || 'Remote',
        description: tags || undefined,
      });
    }
    console.log(`[Scraper] Arbeitnow API: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper] Arbeitnow API error:', err);
  }
  return jobs;
}

export async function fetchOnlineJobs(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://www.onlinejobs.ph/jobseekers/jobsearch?jobkeyword=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, {
      ...axiosConfig,
      headers: { ...axiosConfig.headers, Accept: 'text/html' },
    });
    const $ = cheerio.load(html);

    $('.jobpost-cat-box').each((_, el) => {
      const card = $(el);
      const title = card.find('h4').first().text().trim();
      const salary = card.find('dd').first().text().trim();
      let link = card.find('a').first().attr('href')?.trim() || '';

      if (!title || !link) return;
      if (!titleMatchesQuery(title, query)) return;
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
    console.log(`[Scraper] OnlineJobs.ph: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Scraper] OnlineJobs.ph error:', err);
  }
  return jobs;
}

export async function fetchWeWorkRemotely(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const res = await axios.get<any>('https://weworkremotely.com/api/v1/jobs', axiosConfig);
    const allJobs = res.data?.jobs || [];
    for (const j of allJobs) {
      const title = String(j.title || '').trim();
      const company = String(j.company || '').trim();
      const link = String(j.url || '').trim();
      if (!title || !company || !link) continue;
      if (!titleMatchesQuery(title, query)) continue;

      jobs.push({
        title,
        company,
        link,
        source: 'We Work Remotely',
        location: j.location || 'Remote',
        description: j.description || undefined,
        salary: j.salary || undefined
      });
    }
    console.log(`[Scraper] We Work Remotely: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] We Work Remotely API failed, trying RSS feed...');
    try {
      const { data: xml } = await axios.get<string>('https://weworkremotely.com/remote-jobs.rss', axiosConfig);
      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').each((_, el) => {
        const item = $(el);
        const title = item.find('title').text().trim();
        const link = item.find('link').text().trim();
        const description = item.find('description').text().trim();
        const company = title.split(':')[0]?.trim() || 'WWR Employer';
        const jobTitle = title.split(':').slice(1).join(':')?.trim() || title;

        if (!title || !link || !titleMatchesQuery(jobTitle, query)) return;
        jobs.push({
          title: jobTitle,
          company,
          link,
          source: 'We Work Remotely',
          location: 'Remote',
          description: description || undefined
        });
      });
      console.log(`[Scraper] We Work Remotely RSS fallback: ${jobs.length} jobs`);
    } catch (rssErr) {
      console.error('[Scraper] We Work Remotely RSS failed:', rssErr);
    }
  }
  return jobs;
}

export async function fetchWellfound(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://wellfound.com/role/l/remote/${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);
    $('.styles_component__W_c9a, [class*="JobCard"]').each((_, el) => {
      const card = $(el);
      const title = card.find('.styles_title__U2_jE, h3, h4').first().text().trim();
      const company = card.find('.styles_name__S4wOa, [class*="companyName"]').first().text().trim();
      const link = card.find('a').first().attr('href') || '';
      if (!title || !company) return;
      jobs.push({
        title,
        company,
        link: link.startsWith('http') ? link : `https://wellfound.com${link}`,
        source: 'Wellfound',
        location: 'Remote',
      });
    });
    console.log(`[Scraper] Wellfound: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] Wellfound blocked or error:', err);
  }
  return jobs;
}

export async function fetchWorkingNomads(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data: xml } = await axios.get<string>('https://www.workingnomads.com/feed', axiosConfig);
    const $ = cheerio.load(xml, { xmlMode: true });
    $('item').each((_, el) => {
      const item = $(el);
      const title = item.find('title').text().trim();
      const link = item.find('link').text().trim();
      const description = item.find('description').text().trim();
      const creator = item.find('dc\\:creator, creator').text().trim() || 'Working Nomads Employer';
      
      if (!title || !link) return;
      if (!titleMatchesQuery(title, query)) return;

      jobs.push({
        title,
        company: creator,
        link,
        source: 'Working Nomads',
        location: 'Remote',
        description: description || undefined
      });
    });
    console.log(`[Scraper] Working Nomads RSS: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] Working Nomads RSS failed, trying HTML parse...');
    try {
      const url = `https://www.workingnomads.com/jobs?tag=${encodeURIComponent(query)}`;
      const { data: html } = await axios.get<string>(url, axiosConfig);
      const $ = cheerio.load(html);
      $('.job, [class*="job"]').each((_, el) => {
        const card = $(el);
        const title = card.find('.title h2, h2, h3').first().text().trim();
        const company = card.find('.company, [class*="company"]').first().text().trim();
        const link = card.find('a').first().attr('href') || '';
        if (!title || !link) return;
        jobs.push({
          title,
          company: company || 'Working Nomads Employer',
          link: link.startsWith('http') ? link : `https://www.workingnomads.com${link}`,
          source: 'Working Nomads',
          location: 'Remote'
        });
      });
      console.log(`[Scraper] Working Nomads HTML fallback: ${jobs.length} jobs`);
    } catch (htmlErr) {
      console.error('[Scraper] Working Nomads HTML failed:', htmlErr);
    }
  }
  return jobs;
}

export async function fetchRemoteCo(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data: xml } = await axios.get<string>('https://remote.co/remote-jobs/feed', axiosConfig);
    const $ = cheerio.load(xml, { xmlMode: true });
    $('item').each((_, el) => {
      const item = $(el);
      const title = item.find('title').text().trim();
      const link = item.find('link').text().trim();
      const description = item.find('description').text().trim();
      
      if (!title || !link) return;
      if (!titleMatchesQuery(title, query)) return;

      const company = title.split('is hiring a')[0]?.replace(':', '')?.trim() || 'Remote.co Employer';
      const cleanTitle = title.split('is hiring a')[1]?.trim() || title;

      jobs.push({
        title: cleanTitle,
        company,
        link,
        source: 'Remote.co',
        location: 'Remote',
        description: description || undefined
      });
    });
    console.log(`[Scraper] Remote.co RSS: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] Remote.co RSS failed, trying HTML parse...');
    try {
      const url = `https://remote.co/?s=${encodeURIComponent(query)}`;
      const { data: html } = await axios.get<string>(url, axiosConfig);
      const $ = cheerio.load(html);
      $('.card, [class*="JobCard"]').each((_, el) => {
        const card = $(el);
        const title = card.find('.card-title, h3, h4').first().text().trim();
        const company = card.find('.card-text, [class*="company"]').first().text().trim();
        const link = card.find('a').first().attr('href') || '';
        if (!title || !link) return;
        jobs.push({
          title,
          company: company || 'Remote.co Employer',
          link: link.startsWith('http') ? link : `https://remote.co${link}`,
          source: 'Remote.co',
          location: 'Remote'
        });
      });
      console.log(`[Scraper] Remote.co HTML fallback: ${jobs.length} jobs`);
    } catch (htmlErr) {
      console.error('[Scraper] Remote.co HTML failed:', htmlErr);
    }
  }
  return jobs;
}

export async function fetchJobspresso(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data: xml } = await axios.get<string>('https://jobspresso.co/feed', axiosConfig);
    const $ = cheerio.load(xml, { xmlMode: true });
    $('item').each((_, el) => {
      const item = $(el);
      const title = item.find('title').text().trim();
      const link = item.find('link').text().trim();
      const description = item.find('description').text().trim();
      
      if (!title || !link) return;
      if (!titleMatchesQuery(title, query)) return;

      jobs.push({
        title,
        company: 'Jobspresso Employer',
        link,
        source: 'Jobspresso',
        location: 'Remote',
        description: description || undefined
      });
    });
    console.log(`[Scraper] Jobspresso RSS: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] Jobspresso RSS failed, trying HTML parse...');
    try {
      const url = `https://jobspresso.co/?s=${encodeURIComponent(query)}`;
      const { data: html } = await axios.get<string>(url, axiosConfig);
      const $ = cheerio.load(html);
      $('.job_listing, [class*="job_listing"]').each((_, el) => {
        const card = $(el);
        const title = card.find('.job_listing-title, h3, h4').first().text().trim();
        const company = card.find('.job_listing-company, [class*="company"]').first().text().trim();
        const link = card.find('a').first().attr('href') || '';
        if (!title || !link) return;
        jobs.push({
          title,
          company: company || 'Jobspresso Employer',
          link,
          source: 'Jobspresso',
          location: 'Remote'
        });
      });
      console.log(`[Scraper] Jobspresso HTML fallback: ${jobs.length} jobs`);
    } catch (htmlErr) {
      console.error('[Scraper] Jobspresso HTML failed:', htmlErr);
    }
  }
  return jobs;
}

export async function fetchNoDesk(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data: xml } = await axios.get<string>('https://nodesk.co/feed.xml', axiosConfig);
    const $ = cheerio.load(xml, { xmlMode: true });
    $('item').each((_, el) => {
      const item = $(el);
      const title = item.find('title').text().trim();
      const link = item.find('link').text().trim();
      const description = item.find('description').text().trim();
      
      if (!title || !link) return;
      if (!titleMatchesQuery(title, query)) return;

      jobs.push({
        title,
        company: 'NoDesk Employer',
        link,
        source: 'NoDesk',
        location: 'Remote',
        description: description || undefined
      });
    });
    console.log(`[Scraper] NoDesk RSS: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] NoDesk RSS failed, trying HTML parse...');
    try {
      const url = 'https://nodesk.co/remote-jobs/';
      const { data: html } = await axios.get<string>(url, axiosConfig);
      const $ = cheerio.load(html);
      $('.job-list-item, tr').each((_, el) => {
        const card = $(el);
        const title = card.find('.job-title, td a').first().text().trim();
        const company = card.find('.job-company, td').eq(1).text().trim();
        const link = card.find('a').first().attr('href') || '';
        if (!title || !link || !titleMatchesQuery(title, query)) return;
        jobs.push({
          title,
          company: company || 'NoDesk Employer',
          link: link.startsWith('http') ? link : `https://nodesk.co${link}`,
          source: 'NoDesk',
          location: 'Remote'
        });
      });
      console.log(`[Scraper] NoDesk HTML fallback: ${jobs.length} jobs`);
    } catch (htmlErr) {
      console.error('[Scraper] NoDesk HTML failed:', htmlErr);
    }
  }
  return jobs;
}

export async function fetchSkipTheDrive(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://www.skipthedrive.com/jobs/?s=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);
    $('.post, .job-listing, [class*="JobCard"]').each((_, el) => {
      const card = $(el);
      const title = card.find('h2, .entry-title, h3').first().text().trim();
      const link = card.find('a').first().attr('href') || '';
      if (!title || !link) return;
      jobs.push({
        title,
        company: 'SkipTheDrive Employer',
        link,
        source: 'SkipTheDrive',
        location: 'Remote'
      });
    });
    console.log(`[Scraper] SkipTheDrive: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] SkipTheDrive failed:', err);
  }
  return jobs;
}

export async function fetchRemoteRocketship(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://www.remoterocketship.com/jobs?q=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);
    $('.job-card, [class*="JobCard"]').each((_, el) => {
      const card = $(el);
      const title = card.find('h3, [class*="title"]').first().text().trim();
      const company = card.find('[class*="company"]').first().text().trim();
      const link = card.find('a').first().attr('href') || '';
      if (!title || !link) return;
      jobs.push({
        title,
        company: company || 'Remote Rocketship Employer',
        link: link.startsWith('http') ? link : `https://www.remoterocketship.com${link}`,
        source: 'Remote Rocketship',
        location: 'Remote'
      });
    });
    console.log(`[Scraper] Remote Rocketship: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] Remote Rocketship failed:', err);
  }
  return jobs;
}

export async function fetchDailyRemote(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://dailyremote.com/remote-jobs?q=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);
    $('.job-card, [data-testid="job-card"]').each((_, el) => {
      const card = $(el);
      const title = card.find('.job-title, h2, h3').first().text().trim();
      const company = card.find('.company-name, .company').first().text().trim();
      const link = card.find('a').first().attr('href') || '';
      if (!title || !link) return;
      jobs.push({
        title,
        company: company || 'DailyRemote Employer',
        link: link.startsWith('http') ? link : `https://dailyremote.com${link}`,
        source: 'DailyRemote',
        location: 'Remote'
      });
    });
    console.log(`[Scraper] DailyRemote: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] DailyRemote failed:', err);
  }
  return jobs;
}

export async function fetchOtta(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `https://otta.com/jobs?q=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get<string>(url, axiosConfig);
    const $ = cheerio.load(html);
    $('[class*="JobCard"], .job-card').each((_, el) => {
      const card = $(el);
      const title = card.find('h3, h4').first().text().trim();
      const company = card.find('[class*="CompanyName"]').first().text().trim();
      const link = card.find('a').first().attr('href') || '';
      if (!title || !link) return;
      jobs.push({
        title,
        company: company || 'Otta Employer',
        link: link.startsWith('http') ? link : `https://otta.com${link}`,
        source: 'Otta',
        location: 'Remote'
      });
    });
    console.log(`[Scraper] Otta: ${jobs.length} jobs`);
  } catch (err) {
    console.warn('[Scraper] Otta failed:', err);
  }
  return jobs;
}

/** Free JSON/RSS sources that work from Vercel (no browser, no proxy). */
export async function collectFreeApiJobs(
  settings: ISettings,
  searchQuery: string,
): Promise<ScrapedJob[]> {
  const tasks: Promise<ScrapedJob[]>[] = [];

  // Replaced Indeed/JobStreet/LinkedIn with the 10 remote boards
  if (settings.scrapeWeWorkRemotely) {
    tasks.push(fetchWeWorkRemotely(searchQuery));
  }
  if (settings.scrapeWellfound) {
    tasks.push(fetchWellfound(searchQuery));
  }
  if (settings.scrapeWorkingNomads) {
    tasks.push(fetchWorkingNomads(searchQuery));
  }
  if (settings.scrapeRemoteCo) {
    tasks.push(fetchRemoteCo(searchQuery));
  }
  if (settings.scrapeJobspresso) {
    tasks.push(fetchJobspresso(searchQuery));
  }
  if (settings.scrapeNoDesk) {
    tasks.push(fetchNoDesk(searchQuery));
  }
  if (settings.scrapeSkipTheDrive) {
    tasks.push(fetchSkipTheDrive(searchQuery));
  }
  if (settings.scrapeRemoteRocketship) {
    tasks.push(fetchRemoteRocketship(searchQuery));
  }
  if (settings.scrapeDailyRemote) {
    tasks.push(fetchDailyRemote(searchQuery));
  }
  if (settings.scrapeOtta) {
    tasks.push(fetchOtta(searchQuery));
  }

  // Kept RemoteOK & OnlineJobs.ph per instructions
  if (settings.scrapeRemoteOK) {
    tasks.push(fetchRemoteOKApi(searchQuery));
    tasks.push(fetchRemotiveApi(searchQuery));
    tasks.push(fetchArbeitnowApi(searchQuery));
  }
  if (settings.scrapeOnlineJobs !== false) {
    tasks.push(fetchOnlineJobs(searchQuery));
  }

  const batches = await Promise.all(tasks);
  return batches.flat();
}
