import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
await page.getByRole('tab', { name: 'The life cycle' }).click();
await page.locator('#lab').scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.locator('#lab').screenshot({ path: 'tests/screenshots/desktop-lifecycle.png' });
await page.getByRole('tab', { name: 'Inside the virus' }).click();
await page.getByRole('button', { name: '03 p24 capsid' }).click();
await page.waitForTimeout(800);
await page.locator('.lab-workspace').screenshot({ path: 'tests/screenshots/desktop-anatomy.png' });
await page.locator('#testing').scrollIntoViewIfNeeded();
await page.locator('#testing').screenshot({ path: 'tests/screenshots/desktop-testing.png' });
for (const width of [320, 390, 768, 1024]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(width);
  console.log(`PASS layout ${width}px: no horizontal overflow`);
  if (width === 390) {
    await page.locator('#lab').scrollIntoViewIfNeeded();
    await page.locator('#lab').screenshot({ path: 'tests/screenshots/mobile-lab.png' });
    await page.locator('#testing').scrollIntoViewIfNeeded();
    await page.locator('#testing').screenshot({ path: 'tests/screenshots/mobile-testing.png' });
  }
}
await browser.close();
