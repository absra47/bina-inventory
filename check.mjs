import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const DIR = '/Users/air/Downloads/bina-inventory';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// Log console errors
page.on('console', m => { if (m.type() === 'error') console.log('  CONSOLE ERROR:', m.text()); });
page.on('pageerror', e => console.log('  PAGE ERROR:', e.message));

async function shot(name) {
  try { await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: true }); }
  catch(e) { console.log(`  (screenshot failed: ${e.message.slice(0, 80)})`); }
}

// 1. Root → redirect to login
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle');
console.log('1. Login page URL:', page.url());
await shot('01-login');

// 2. Log in — wait for navigation away from /login
await page.fill('#email', 'admin@bina.et');
await page.fill('#password', 'admin123');

const [response] = await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle', timeout: 12000 }).catch(e => ({ timedOut: true, err: e.message })),
  page.click('button[type="submit"]'),
]);
console.log('2. After login:', page.url(), response?.timedOut ? '(nav timed out)' : '');

// Check for error message on page
const errMsg = await page.locator('[style*="--red"]').textContent().catch(() => null);
if (errMsg) console.log('   Login error shown:', errMsg);

await page.waitForLoadState('networkidle');
await shot('02-dashboard');
const dashHeading = await page.locator('h1, h2').first().textContent().catch(() => '(none)');
console.log('   Heading:', dashHeading);

// 3. Received Items Report
console.log('\n3. Navigating to /reports/received ...');
await page.goto(`${BASE}/reports/received`, { waitUntil: 'networkidle' });
console.log('   URL:', page.url());
await shot('03-received');
console.log('   Heading:', await page.locator('h1,h2').first().textContent().catch(() => '(none)'));

// 4. Inventory report
console.log('\n4. Navigating to /reports/inventory ...');
await page.goto(`${BASE}/reports/inventory`, { waitUntil: 'networkidle' });
console.log('   URL:', page.url());
await shot('04-inventory');
console.log('   Heading:', await page.locator('h1,h2').first().textContent().catch(() => '(none)'));

// 5. Items
console.log('\n5. Navigating to /items ...');
await page.goto(`${BASE}/items`, { waitUntil: 'networkidle' });
console.log('   URL:', page.url());
await shot('05-items');
console.log('   Heading:', await page.locator('h1,h2').first().textContent().catch(() => '(none)'));

// 6. Branches
console.log('\n6. Navigating to /branches ...');
await page.goto(`${BASE}/branches`, { waitUntil: 'networkidle' });
console.log('   URL:', page.url());
await shot('06-branches');
console.log('   Heading:', await page.locator('h1,h2').first().textContent().catch(() => '(none)'));

await browser.close();
console.log('\nDone. Screenshots saved in project directory.');
