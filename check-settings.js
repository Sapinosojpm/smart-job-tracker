import connectDB from './lib/db.js';
import Settings from './models/Settings.js';

async function check() {
  await connectDB();
  const settings = await Settings.findOne();
  console.log('Current Keywords:', JSON.stringify(settings?.keywordFilters));
  process.exit(0);
}

check();
