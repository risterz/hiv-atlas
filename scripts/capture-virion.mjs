import { chromium } from '@playwright/test';

const url = process.env.TARGET_URL || 'http://localhost:5173/';
const prefix = process.env.OUT_PREFIX || 'virion';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => Boolean(document.querySelector('.scene-explorer[data-ready="true"]')), { timeout: 30000 });
await page.locator('a[href="#lab"]').first().click();
await page.waitForTimeout(2600);
const viewer = page.locator('.lab-viewer');
await viewer.screenshot({ path: `${prefix}-cutaway.png` });

await page.getByRole('button', { name: 'Exterior' }).click();
await page.waitForTimeout(900);
await viewer.screenshot({ path: `${prefix}-exterior.png` });

await page.getByRole('button', { name: 'Cutaway' }).click();
const rnaButton = page.locator('.layer-buttons button', { hasText: 'RNA' });
await rnaButton.click();
await page.waitForTimeout(900);
await viewer.screenshot({ path: `${prefix}-rna-selected.png` });

console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
