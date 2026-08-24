import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:4200/auth/login', { waitUntil: 'networkidle' });
await page.fill('#matricule', 'ADMIN001');
await page.fill('#password', 'admin123');
await page.click('button:has-text("Se connecter")');
await page.waitForURL('**/dashboard', { timeout: 15000 });
await page.waitForTimeout(1000);

await page.goto('http://localhost:4200/agents', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'shots/check-agents-fullpage.png', fullPage: true });

await page.goto('http://localhost:4200/ministeres', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'shots/check-ministeres-fullpage.png', fullPage: true });

await browser.close();
