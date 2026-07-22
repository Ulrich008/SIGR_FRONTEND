import { chromium } from 'playwright';
const BASE = 'http://localhost:4200';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('response', async res => {
  const url = res.url();
  const method = res.request().method();
  if (url.includes('/api/agents') || url.includes('/api/risques') || url.includes('/api/processus')) {
    console.log(method, url, '->', res.status());
  }
});

// 1. Login as SUPER_ADMIN
await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
await page.fill('#matricule', 'ADMIN001');
await page.fill('#password', 'admin123');
await page.click('button[type=submit]');
await page.waitForURL('**/dashboard', { timeout: 15000 });
await page.waitForTimeout(800);

// 2. Check existing risques as SUPER_ADMIN
await page.goto(`${BASE}/risques`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const risqueRows = await page.locator('table tbody tr, [class*="risque"]').count();
console.log('SUPER_ADMIN sees risque-related elements:', risqueRows);
await page.screenshot({ path: '/tmp/risques-superadmin-before.png' });

// 3. Check existing agents to find a RESPONSABLE_RISQUES one
await page.goto(`${BASE}/agents`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/agents-list-current.png' });

await browser.close();
