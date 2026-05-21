/**
 * 🔍 SCRAPER DIAGNOSTIC SCRIPT
 * Run with: node scripts/diagnose-scraper.js
 * 
 * This will call the /api/scrape endpoint and log the raw response
 * to help identify what causes the "Unexpected token 'A'" JSON error.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function diagnose() {
  console.log('\n==============================');
  console.log('  JobScoutAI Scraper Diagnostics');
  console.log('==============================\n');
  console.log(`Target: ${BASE_URL}/api/scrape`);
  console.log('Note: You must be logged in for this to work (cookie auth).\n');

  // Test 1: Basic connectivity
  console.log('[1/3] Testing API connectivity...');
  try {
    const res = await fetch(`${BASE_URL}/api/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const contentType = res.headers.get('content-type') || '';
    console.log(`  Status: ${res.status} ${res.statusText}`);
    console.log(`  Content-Type: ${contentType}`);

    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('\n❌ NON-JSON RESPONSE DETECTED — This is the JSON parse error!');
      console.error('  The server returned HTML or plain text instead of JSON.');
      console.error('\n  First 500 chars of response:');
      console.error('  ---');
      console.error('  ' + text.slice(0, 500).replace(/\n/g, '\n  '));
      console.error('  ---');
      console.log('\n  Likely causes:');
      console.log('  1. Middleware is blocking the route (auth redirect to login page)');
      console.log('  2. Vercel serverless function timed out (returns HTML error page)');
      console.log('  3. Import error in /lib/scraper.ts (Next.js returns error page)');
      console.log('  4. Missing environment variable causing a crash before JSON response');
    } else {
      const data = await res.json();
      console.log('\n✅ JSON response received:');
      console.log(JSON.stringify(data, null, 2));

      if (data.isLimitReached) {
        console.log('\n⚠️  DAILY LIMIT REACHED');
        console.log(`  Reset time: ${data.resetTime}`);
      } else if (!data.success) {
        console.log(`\n❌ Scrape failed: ${data.error}`);
      } else {
        console.log(`\n✅ Scrape succeeded!`);
        console.log(`  Jobs found: ${data.data?.jobsFound ?? 0}`);
        console.log(`  Jobs inserted: ${data.data?.jobsInserted ?? 0}`);
      }
    }
  } catch (err) {
    console.error('\n❌ Network/fetch error:');
    console.error(err.message);
  }

  // Test 2: Check middleware
  console.log('\n[2/3] Testing middleware / auth...');
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const contentType = res.headers.get('content-type') || '';
    console.log(`  /api/settings → ${res.status} | ${contentType}`);
    if (res.status === 302 || res.status === 307) {
      console.warn('  ⚠️  Redirect detected — middleware may be blocking API routes for unauthenticated requests');
    }
  } catch (err) {
    console.error('  Error:', err.message);
  }

  // Test 3: Environment check
  console.log('\n[3/3] Key environment variables:');
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'SCRAPE_WORKER_URL',
    'VERCEL',
  ];
  for (const key of envVars) {
    const val = process.env[key];
    console.log(`  ${key}: ${val ? `✅ SET (${val.slice(0, 30)}...)` : '❌ NOT SET'}`);
  }

  console.log('\n==============================\n');
}

diagnose();
