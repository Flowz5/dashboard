const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', err => {
    console.log('Page error:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  await page.goto('http://localhost:5173/board/UnmDd6WFXqCDO9EiuHp8', { waitUntil: 'networkidle2' });
  await browser.close();
})();
