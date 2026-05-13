import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture ALL network activity
const allUrls = [];
page.on('request', req => { allUrls.push(req.url()); });
page.on('response', async (r) => {
  const url = r.url();
  if (url.includes('sfp.gov.py') && !url.match(/\.(js|css|png|jpg|woff|svg|ico|html|php)/) && r.status() !== 204) {
    try {
      const ct = r.headers()['content-type'] || '';
      const body = await r.text();
      console.log(`${r.status()} ${ct.substring(0, 30)} | size: ${body.length} | ${url.substring(0, 120)}`);
      if (body.length < 3000 && body.length > 10) console.log('  ', body.substring(0, 400));
    } catch {}
  }
});

// Try accessing the funcionarios dataset
console.log('Accessing funcionarios...');
await page.goto('https://datos.sfp.gov.py/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Click on "Lista de Datos"
await page.click('a[href="./data"]');
await page.waitForTimeout(3000);

// Try to find funcionarios link
const links = await page.$$('a');
for (const l of links) {
  const text = await l.textContent();
  const href = await l.getAttribute('href');
  if (text && text.toLowerCase().includes('funcionari')) {
    console.log('FOUND FUNCIONARIOS LINK:', text.trim(), href);
    await l.click();
    await page.waitForTimeout(5000);
    break;
  }
}

await browser.close();
