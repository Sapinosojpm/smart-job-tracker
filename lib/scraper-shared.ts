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

  for (const job of jobs) {
    try {
      const existing = await prisma.job.findUnique({
        where: { link_userId: { link: job.link, userId } },
      });

      if (existing) {
        duplicates++;
        continue;
      }

      const scamCheck = detectScam(job.title, job.description || '');
      const salaryData = parseSalary(job.salary || null);

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
        },
      });
      insertedJobs.push(newJob);
      insertedCount++;
    } catch (err) {
      console.error('[DB] Insert error:', err);
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
