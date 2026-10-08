const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Intercepter les erreurs de console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  await page.goto('http://localhost:5173/board/UnmDd6WFXqCDO9EiuHp8', { waitUntil: 'networkidle2' });
  
  // Check for vite error overlay
  const errorText = await page.evaluate(() => {
    const overlay = document.querySelector('vite-error-overlay');
    if (overlay) {
      return overlay.shadowRoot ? overlay.shadowRoot.textContent : overlay.textContent;
    }
    return null;
  });
  
  if (errorText) {
    console.log('VITE ERROR OVERLAY:', errorText.substring(0, 500));
  } else {
    console.log('No vite error overlay found.');
  }

  await browser.close();
})();
