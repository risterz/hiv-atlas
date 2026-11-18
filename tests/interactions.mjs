import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('tests/screenshots', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
const check = async (name, fn) => { await fn(); console.log(`PASS ${name}`); };
await check('chapter opens, completes, and persists', async () => {
  await page.locator('.chapter-card').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Mark as learned' }).click();
  await expect(page.getByText('Chapter complete. Progress saved on this device.')).toBeVisible();
  await expect(page.locator('.progress-ring')).toContainText('1');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.progress-ring')).toContainText('1');
});
await check('3D layers update explanatory content', async () => {
  await page.getByRole('button', { name: '03 p24 capsid' }).click();
  await expect(page.locator('.layer-detail h3')).toHaveText('p24 capsid');
  await page.getByRole('tab', { name: 'The life cycle' }).click();
  await expect(page.locator('.lifecycle-info h3')).toHaveText('Binding');
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('.lifecycle-info h3')).toHaveText('Fusion');
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('.lifecycle-info h3')).toHaveText('Reverse transcription');
});
await check('transmission filters and accordion work', async () => {
  await page.getByRole('button', { name: 'No transmission', exact: true }).click();
  await expect(page.locator('.fact-item')).toHaveCount(4);
  await page.getByRole('button', { name: 'Insect bites' }).click();
  await expect(page.locator('#fact-7')).toBeVisible();
});
await check('prevention selection and emergency dialog work', async () => {
  await page.getByRole('button', { name: '03 PEP After exposure' }).click();
  await expect(page.locator('.prevention-detail h3')).toHaveText('PEP');
  await page.getByRole('button', { name: 'Open urgent care guide' }).click();
  await expect(page.getByRole('dialog', { name: 'A possible exposure in the last 72 hours?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
await check('testing window changes test and days', async () => {
  await page.getByRole('button', { name: 'NAT 10–33 days' }).click();
  await expect(page.locator('.test-result h4')).toContainText('within the test');
  await page.locator('#days-input').fill('5');
  await expect(page.locator('.test-result h4')).toContainText('may not detect');
  await page.locator('#days-input').fill('40');
  await expect(page.locator('.test-result h4')).toContainText('usually detect');
});
await check('quiz accepts answers and reaches score', async () => {
  await page.getByRole('button', { name: 'C No, everyday contact does not transmit HIV' }).click();
  await expect(page.getByText('That’s right.')).toBeVisible();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'A An undetectable viral load means zero risk of sexual HIV transmission' }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'B As soon as possible, and no later than 72 hours' }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'D Getting an HIV test' }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'C It prevents HIV when taken as prescribed, but not other STIs' }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'C Listen, respect privacy, and support access to care' }).click();
  await page.getByRole('button', { name: 'See my result' }).click();
  await expect(page.locator('.quiz-finish h3')).toHaveText('You got 6 out of 6.');
});
await check('glossary search filters terms', async () => {
  await page.getByRole('searchbox', { name: 'Search glossary' }).fill('viral load');
  await expect(page.locator('.glossary-list details')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Search glossary' }).fill('not-a-term');
  await expect(page.getByText('No matching term. Try “testing,” “ART,” or “viral load.”')).toBeVisible();
});
await check('PDF download is generated', async () => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('HIV-Atlas-fact-sheet.pdf');
  await download.saveAs('tests/HIV-Atlas-fact-sheet.pdf');
});
await check('mobile has no horizontal overflow', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  const widths = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.viewport);
  await page.screenshot({ path: 'tests/screenshots/mobile-home.png', fullPage: false });
});
await check('reduced motion shows fallback and no canvas', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.virus-fallback').first()).toBeVisible();
});
console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
