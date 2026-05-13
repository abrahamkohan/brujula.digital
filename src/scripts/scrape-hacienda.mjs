import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => { if (msg.type() === 'error') console.log('Console:', msg.text().substring(0, 200)); });

console.log('Navigating to Hacienda nómina...');
try {
  await page.goto('https://datos.hacienda.gov.py/data/nomina', { 
    waitUntil: 'domcontentloaded', timeout: 60000 
  });
  await page.waitForTimeout(5000);
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  
  // Check if we got through Cloudflare or got blocked
  const content = await page.content();
  console.log('Content length:', content.length);
  console.log('First 500 chars:', content.substring(0, 500));
  
  // Look for any data elements
  const tables = await page.$$('table');
  console.log('Tables found:', tables.length);
  
  // Check for download links
  const links = await page.$$('a');
  for (const l of links.slice(0, 20)) {
    const href = await l.getAttribute('href');
    const text = await l.textContent();
    if (href && (href.includes('csv') || href.includes('download') || href.includes('data'))) {
      console.log('DOWNLOAD LINK:', text?.trim(), href);
    }
  }
} catch(e) { console.log('Error:', e.message); }
await browser.close();
