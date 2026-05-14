const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch();
    console.log('Browser launched successfully');
    await browser.close();
  } catch (err) {
    console.error('Failed to launch browser:', err.message);
    process.exit(1);
  }
})();
