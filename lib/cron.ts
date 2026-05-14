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
      const { prisma } = await import('./prisma');
      const users = await prisma.settings.findMany({ select: { userId: true } });

      for (const user of users) {
        try {
          const result = await runScraper(user.userId);
          console.log(`[CRON] Done for ${user.userId} — inserted: ${result.jobsInserted}`);
        } catch (err: any) {
          console.error(`[CRON] Failed for ${user.userId}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[CRON] Global error:', err);
    }
  });

}
