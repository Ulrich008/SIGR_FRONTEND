import { chromium } from 'playwright';
const BASE = 'http://localhost:4200';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERR:', msg.text()); });
page.on('response', async res => {
  if (res.url().includes('/api/indicateurs') && res.request().method() === 'POST') {
    console.log('POST /api/indicateurs status:', res.status());
    try { console.log('body:', await res.text()); } catch {}
  }
});

await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
await page.fill('#matricule', 'ADMIN001');
await page.fill('#password', 'admin123');
await page.click('button[type=submit]');
await page.waitForURL('**/dashboard', { timeout: 15000 });
await page.waitForTimeout(1000);

await page.goto(`${BASE}/indicateurs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/indicateurs-list-superadmin.png' });

// check create button presence/disabled state
const createBtnCount = await page.locator('button:has-text("Nouvel")').count();
console.log('create button count (SUPER_ADMIN):', createBtnCount);

await browser.close();
