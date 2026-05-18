# Free scrape worker (Indeed / JobStreet / LinkedIn)

Vercel cannot scrape these sites (403). This small server runs **Playwright on your machine** — free, no proxy fees.

## Best free setup (residential IP)

1. On your **home PC** (laptop that stays on during scrapes):

```bash
cd scrape-worker
cp .env.example .env
# Edit .env — set SCRAPE_WORKER_SECRET to a long random string
npm install
npm start
```

2. Expose to the internet with **Cloudflare Tunnel** (free):

```bash
# Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
cloudflared tunnel --url http://localhost:3100
```

Copy the `https://….trycloudflare.com` URL.

3. In **Vercel** → Project → Environment Variables:

```
SCRAPE_WORKER_URL=https://xxxx.trycloudflare.com
SCRAPE_WORKER_SECRET=same-secret-as-.env
```

Redeploy JobScoutAI. "Scrape now" on production will call your home PC.

## Oracle Cloud free VM (optional)

Same steps on a free ARM instance if you do not want to keep your PC on. Note: cloud IPs may still get 403 sometimes; home IP works best.

## Health check

```bash
curl http://localhost:3100/health
```
