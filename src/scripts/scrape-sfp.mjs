import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const apiCalls = [];
page.on('response', async (r) => {
  const url = r.url();
  if (url.includes('api') || url.includes('nomi') || url.includes('funcion')) {
    try { apiCalls.push({ url, status: r.status() }); } catch {}
  }
});

console.log('Navigating...');
await page.goto('https://datos.sfp.gov.py/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
console.log('API calls:', apiCalls.length);
apiCalls.forEach(c => console.log(' ', c.url, c.status));
console.log('Title:', await page.title());
await browser.close();
