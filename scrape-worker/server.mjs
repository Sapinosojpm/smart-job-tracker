/**
 * Free scrape worker — run on home PC, Oracle Cloud free VM, etc.
 * Best anti-block for Indeed/JobStreet: home residential IP + Cloudflare Tunnel (free).
 *
 *   cd scrape-worker && npm install && npm start
 *   cloudflared tunnel --url http://localhost:3100
 *
 * Then set in Vercel:
 *   SCRAPE_WORKER_URL=https://your-tunnel.trycloudflare.com
 *   SCRAPE_WORKER_SECRET=your-long-random-secret
 */
import express from 'express';
import { scrapeWithPlaywright } from './scrape.mjs';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3100;
const SECRET = process.env.SCRAPE_WORKER_SECRET;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/scrape', async (req, res) => {
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!SECRET || auth !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = String(req.body?.query || 'developer').trim();
  const sources = req.body?.sources || {};

  try {
    const jobs = await scrapeWithPlaywright(query, {
      indeed: Boolean(sources.indeed),
      jobstreet: Boolean(sources.jobstreet),
      linkedin: Boolean(sources.linkedin),
    });
    res.json({ jobs });
  } catch (err) {
    console.error('[worker]', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Scrape failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[worker] Listening on http://localhost:${PORT}`);
  if (!SECRET) {
    console.warn('[worker] WARNING: Set SCRAPE_WORKER_SECRET in .env');
  }
});
