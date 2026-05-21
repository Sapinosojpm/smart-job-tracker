import prisma from './prisma';
import { sendNewJobsEmail } from './email';
import { sendTelegramNotification } from './telegram';
import { detectScam } from './scam-detector';
import { parseSalary } from './salary-parser';

export interface ScrapedJob {
  title: string;
  company: string;
  link: string;
  source: string;
  location?: string;
  description?: string;
  salary?: string;
  postedAt?: Date;
  workMode?: string;
}

export function classifyWorkMode(title: string, location?: string, description?: string): string {
  const text = `${title} ${location || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('hybrid') || text.includes('semi-remote') || text.includes('partially remote') || text.includes('flexible location') || text.includes('flexi-place') || text.includes('office or remote')) {
    return 'Hybrid';
  }
  if (text.includes('onsite') || text.includes('on-site') || text.includes('office-based') || text.includes('in-office') || text.includes('in office') || text.includes('physical office') || text.includes('report to office')) {
    return 'Onsite';
  }
  
  return 'Remote';
}

export interface ScrapeResult {
  jobsFound: number;
  jobsInserted: number;
  jobsDuplicated: number;
  newJobs: Awaited<ReturnType<typeof prisma.job.create>>[];
  logId: string;
}

export function matchesKeywords(job: ScrapedJob, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const searchable = `${job.title} ${job.company} ${job.description || ''}`.toLowerCase();
  return keywords.some((kw) => searchable.includes(kw.toLowerCase()));
}

export async function insertUniqueJobs(userId: string, jobs: ScrapedJob[]): Promise<{
  insertedCount: number;
  duplicates: number;
  insertedJobs: Awaited<ReturnType<typeof prisma.job.create>>[];
}> {
  let insertedCount = 0;
  let duplicates = 0;
  const insertedJobs: Awaited<ReturnType<typeof prisma.job.create>>[] = [];

  if (jobs.length === 0) {
    return { insertedCount, duplicates, insertedJobs };
  }

  // 1. Extract all job links
  const links = jobs.map((job) => job.link).filter(Boolean);

  // 2. Query all existing records in a single bulk operation
  const existingRecords = await prisma.job.findMany({
    where: {
      userId,
      link: { in: links },
    },
    select: {
      link: true,
    },
  });

  const existingLinksSet = new Set(existingRecords.map((r) => r.link));

  // 3. Separate new jobs from duplicates and run inserts concurrently
  const jobsToInsert = jobs.filter((job) => {
    if (existingLinksSet.has(job.link)) {
      duplicates++;
      return false;
    }
    return true;
  });

  if (jobsToInsert.length > 0) {
    const insertPromises = jobsToInsert.map(async (job) => {
      try {
        const scamCheck = detectScam(job.title, job.description || '');
        const salaryData = parseSalary(job.salary || null);
        const workMode = job.workMode || classifyWorkMode(job.title, job.location, job.description);

        const newJob = await prisma.job.create({
          data: {
            ...job,
            userId,
            isNewListing: true,
            isScam: scamCheck.isScam,
            scamScore: scamCheck.score,
            scamReason: scamCheck.reasons.join(', '),
            salaryMin: salaryData.min,
            salaryMax: salaryData.max,
            currency: salaryData.currency,
            workMode,
          },
        });
        return newJob;
      } catch (err) {
        console.error('[DB] Concurrent insert error:', err);
        return null;
      }
    });

    const results = await Promise.all(insertPromises);
    for (const newJob of results) {
      if (newJob) {
        insertedJobs.push(newJob);
        insertedCount++;
      }
    }
  }

  return { insertedCount, duplicates, insertedJobs };
}

export async function finalizeScrape(
  userId: string,
  logId: string,
  allJobs: ScrapedJob[],
  searchQuery: string,
  keywords: string[],
): Promise<ScrapeResult> {
  const queryKeywords = searchQuery
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((k) => k.length > 2);

  console.log(`[Scraper] Filtering ${allJobs.length} jobs with keywords:`, queryKeywords);

  const matchedJobs = allJobs.filter((job) => {
    const title = job.title.toLowerCase();
    const matchesQuery =
      queryKeywords.length === 0 || queryKeywords.some((kw) => title.includes(kw));
    return matchesQuery && matchesKeywords(job, keywords);
  });

  console.log(`[Scraper] Filtered down to ${matchedJobs.length} matching jobs.`);

  const uniqueLinks = new Set<string>();
  const deduplicatedJobs = matchedJobs.filter((job) => {
    if (!job.link || uniqueLinks.has(job.link)) return false;
    uniqueLinks.add(job.link);
    return true;
  });

  const { insertedCount, duplicates, insertedJobs } = await insertUniqueJobs(
    userId,
    deduplicatedJobs,
  );

  await prisma.scraperLog.update({
    where: { id: logId },
    data: {
      finishedAt: new Date(),
      status: 'success',
      jobsFound: deduplicatedJobs.length,
      jobsInserted: insertedCount,
      jobsDuplicated: duplicates,
    },
  });

  if (insertedJobs.length > 0) {
    sendNewJobsEmail(userId, insertedJobs as Parameters<typeof sendNewJobsEmail>[1]).catch(
      console.error,
    );
    sendTelegramNotification(
      userId,
      insertedJobs as Parameters<typeof sendTelegramNotification>[1],
    ).catch(console.error);
  }

  return {
    jobsFound: deduplicatedJobs.length,
    jobsInserted: insertedCount,
    jobsDuplicated: duplicates,
    newJobs: insertedJobs,
    logId,
  };
}

export async function markScrapeFailed(logId: string, userId: string, message: string) {
  await prisma.scraperLog.update({
    where: { id: logId },
    data: {
      finishedAt: new Date(),
      status: 'error',
      error: message,
      userId,
    },
  });
}
