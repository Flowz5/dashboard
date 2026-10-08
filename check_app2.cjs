const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  await page.goto('http://localhost:5173/board/UnmDd6WFXqCDO9EiuHp8', { waitUntil: 'networkidle2' });
  const content = await page.content();
  console.log('HTML length:', content.length);
  await browser.close();
})();
