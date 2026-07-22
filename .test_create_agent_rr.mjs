import { chromium } from 'playwright';
const BASE = 'http://localhost:4200';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('response', async res => {
  if (res.request().method() === 'POST' && res.url().includes('/api/agents')) {
    console.log('POST agents ->', res.status());
    if (res.status() >= 400) console.log('body:', await res.text().catch(()=>''));
  }
});

await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
await page.fill('#matricule', 'ADMIN001');
await page.fill('#password', 'admin123');
await page.click('button[type=submit]');
await page.waitForURL('**/dashboard', { timeout: 15000 });
await page.waitForTimeout(800);

await page.goto(`${BASE}/agents/nouveau`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

await page.fill('input[formcontrolname="nom"]', 'TESTRR');
await page.fill('input[formcontrolname="prenoms"]', 'Debug');
await page.selectOption('select[formcontrolname="role"]', 'AGENT');
await page.waitForTimeout(300);

// ministere select
const ministereOptions = await page.locator('select[formcontrolname="codeMinistere"] option').allTextContents();
console.log('ministere options:', ministereOptions);
await page.selectOption('select[formcontrolname="codeMinistere"]', { index: 1 });
await page.waitForTimeout(500);

const profilOptions = await page.locator('select[formcontrolname="codeProfil"] option').allTextContents();
console.log('profil options:', profilOptions);
// select RESPONSABLE_RISQUES
await page.selectOption('select[formcontrolname="codeProfil"]', 'RESPONSABLE_RISQUES');

const uniteOptions = await page.locator('select[formcontrolname="codeUnite"] option').allTextContents();
console.log('unite options:', uniteOptions);
await page.selectOption('select[formcontrolname="codeUnite"]', { index: 1 });

await page.fill('input[formcontrolname="dateNaissance"]', '1990-01-01');
await page.fill('input[formcontrolname="datePriseService"]', '2020-01-01');
await page.fill('input[formcontrolname="password"]', 'Test1234');
await page.fill('input[formcontrolname="confirmPassword"]', 'Test1234');

await page.screenshot({ path: '/tmp/new-agent-form-filled.png' });
await page.click('button[type=submit]');
await page.waitForTimeout(1500);
console.log('after submit url:', page.url());
await page.screenshot({ path: '/tmp/new-agent-after-submit.png' });

await browser.close();
