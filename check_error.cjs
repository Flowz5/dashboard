const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('error', err => console.log('ERROR:', err.message));

  try {
    await page.goto('http://localhost:5173/board/UnmDd6WFXqCDO9EluHp8', { waitUntil: 'networkidle0', timeout: 5000 });
  } catch (e) {
    console.log('GOTO ERROR:', e.message);
  }
  
  // Wait a bit just in case
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
