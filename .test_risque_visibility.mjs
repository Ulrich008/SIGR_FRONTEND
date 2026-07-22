import { chromium } from 'playwright';
const BASE = 'http://localhost:4200';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('response', async res => {
  const url = res.url();
  if (url.includes('/api/risques') || url.includes('/api/auth/login')) {
    console.log(res.request().method(), url, '->', res.status());
  }
});

// Login as RESPONSABLE_RISQUES (matricule from earlier known seed data)
await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
await page.fill('#matricule', 'RR_DRH_40001');
await page.fill('#password', 'admin123');
await page.click('button[type=submit]');
try {
  await page.waitForURL('**/dashboard', { timeout: 8000 });
  console.log('LOGIN OK as RR_DRH_40001');
} catch {
  console.log('LOGIN FAILED for RR_DRH_40001, current url:', page.url());
  const errText = await page.locator('.sigr-shake, [class*="error"]').first().textContent().catch(() => null);
  console.log('error text:', errText);
}

await browser.close();
