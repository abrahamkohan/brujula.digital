import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture ALL XHR/fetch requests
const xhrCalls = [];
page.on('request', (req) => {
  if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
    xhrCalls.push({ url: req.url(), method: req.method() });
  }
});
page.on('response', async (r) => {
  const url = r.url();
  if (url.includes('sfp.gov.py') && !url.match(/\.(js|css|png|jpg|woff|svg|ico|html)/)) {
    try { 
      const ct = r.headers()['content-type'] || '';
      if (ct.includes('json')) {
        const body = await r.text();
        console.log('JSON:', url.substring(0, 120), '| size:', body.length, '| preview:', body.substring(0, 200));
      }
    } catch {}
  }
});

await page.goto('https://datos.sfp.gov.py/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

console.log('\nXHR/Fetch requests:', xhrCalls.length);
xhrCalls.forEach(c => console.log(' ', c.method, c.url.substring(0, 150)));

// Try clicking on something to trigger data load
const links = await page.$$('a');
console.log('\nLinks found:', links.length);
for (const link of links.slice(0, 20)) {
  const href = await link.getAttribute('href');
  const text = await link.textContent();
  if (href) console.log(' ', text?.trim().substring(0, 50), '->', href.substring(0, 80));
}

await browser.close();
