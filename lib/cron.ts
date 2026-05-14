import cron from 'node-cron';
import { runScraper } from '@/lib/scraper';

let isScheduled = false;

export function initCronJob(): void {
  if (isScheduled) return;
  isScheduled = true;

  const schedule = process.env.CRON_SCHEDULE || '*/10 * * * *';

  console.log(`[CRON] Scheduling scraper: ${schedule}`);

  cron.schedule(schedule, async () => {
    console.log(`[CRON] Running scraper at ${new Date().toISOString()}`);
    try {
      const result = await runScraper();
      console.log(`[CRON] Done — inserted: ${result.jobsInserted}, duplicates: ${result.jobsDuplicated}`);
    } catch (err) {
      console.error('[CRON] Scraper error:', err);
    }
  });
}
