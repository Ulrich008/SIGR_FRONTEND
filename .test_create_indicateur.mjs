import { chromium } from 'playwright';
const BASE = 'http://localhost:4200';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('response', async res => {
  if (res.request().method() === 'POST' && res.url().includes('/api/')) {
    console.log('POST', res.url(), 'status:', res.status());
    if (res.status() >= 400) {
      try { console.log('body:', await res.text()); } catch {}
    }
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
await page.click('button:has-text("Nouvel indicateur")');
await page.waitForTimeout(800);

await page.fill('input[placeholder="Libellé de l\'indicateur"]', 'Test indicateur SUPER_ADMIN');

// select processus (first non-empty option)
const processusSelect = page.locator('select').filter({ hasText: 'Sélectionner un processus' }).first();
const procCount = await processusSelect.count();
console.log('processus select found:', procCount);
if (procCount > 0) {
  const options = await processusSelect.locator('option').allTextContents();
  console.log('processus options:', options);
  await processusSelect.selectOption({ index: 1 });
}

const freqSelect = page.locator('select').filter({ hasText: 'Sélectionner une fréquence' }).first();
if (await freqSelect.count() > 0) {
  const opts = await freqSelect.locator('option').allTextContents();
  console.log('freq options:', opts);
  await freqSelect.selectOption({ index: 1 });
}

await page.screenshot({ path: '/tmp/indicateur-form-filled.png' });

await page.click('button:has-text("Créer")');
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/indicateur-after-submit.png' });

console.log('current url:', page.url());

await browser.close();
