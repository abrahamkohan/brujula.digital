import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('response', async (r) => {
  const url = r.url();
  const ct = r.headers()['content-type'] || '';
  if ((url.includes('sfp.gov.py') || url.includes('api')) && ct.includes('json')) {
    try {
      const body = await r.text();
      console.log('JSON:', url.substring(0, 100), '| size:', body.length);
      if (body.length < 2000) console.log('  Body:', body.substring(0, 500));
    } catch {}
  }
});

// Navigate to data page
console.log('Going to /data...');
await page.goto('https://datos.sfp.gov.py/#/data', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Try to evaluate Angular scope/services to find data
try {
  const data = await page.evaluate(() => {
    const el = document.querySelector('[ng-view], [ui-view]');
    return el ? el.innerHTML.substring(0, 500) : 'no view found';
  });
  console.log('View content:', data.substring(0, 300));
} catch(e) { console.log('Eval error:', e.message); }

// Check for any global data
try {
  const hasData = await page.evaluate(() => {
    return typeof window.angular !== 'undefined' ? 'Angular found' : 'No Angular';
  });
  console.log('Framework:', hasData);
} catch(e) {}

await browser.close();
