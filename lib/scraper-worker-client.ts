import axios from 'axios';
import type { ISettings } from './settings';
import type { ScrapedJob } from './scraper-shared';

export interface WorkerScrapeSources {
  indeed: boolean;
  jobstreet: boolean;
  linkedin: boolean;
}

export function workerSourcesFromSettings(settings: ISettings): WorkerScrapeSources {
  return {
    indeed: false,
    jobstreet: false,
    linkedin: false,
  };
}

export function needsWorker(settings: ISettings): boolean {
  return false;
}

/**
 * Calls your free scrape worker (home PC + Cloudflare Tunnel, Oracle free VM, etc.).
 * Set SCRAPE_WORKER_URL and SCRAPE_WORKER_SECRET in Vercel env.
 */
export async function fetchJobsFromWorker(
  query: string,
  sources: WorkerScrapeSources,
): Promise<ScrapedJob[]> {
  const baseUrl = process.env.SCRAPE_WORKER_URL?.replace(/\/$/, '');
  const secret = process.env.SCRAPE_WORKER_SECRET;

  if (!baseUrl || !secret) {
    return [];
  }

  if (!sources.indeed && !sources.jobstreet && !sources.linkedin) {
    return [];
  }

  try {
    const { data } = await axios.post<{ jobs?: ScrapedJob[]; error?: string }>(
      `${baseUrl}/scrape`,
      { query, sources },
      {
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      },
    );

    const jobs = data.jobs || [];
    console.log(`[Scraper] Worker returned ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error('[Scraper] Worker request failed:', err);
    return [];
  }
}
