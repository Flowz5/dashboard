const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  
  // Go to local dev server (assuming it runs on 5173 or we can start one)
  // Let's first start the server in the background and then run this.
  await browser.close();
})();
