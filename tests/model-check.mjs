import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

await mkdir('tests/screenshots', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect(page.locator('.scene-explorer[data-ready="true"]')).toBeVisible();
  await expect(page.locator('.scene-explorer canvas')).toHaveAttribute('data-env-trimers', '14');
  await expect(page.locator('.scene-explorer canvas')).toHaveAttribute('data-rna-molecules', '2');
  await page.locator('.lab-workspace').screenshot({ path: 'tests/screenshots/model-cutaway.png' });
  await page.getByRole('button', { name: '03 p24 capsid' }).click();
  await expect(page.locator('.layer-detail h3')).toHaveText('p24 capsid');
  await expect(page.getByRole('link', { name: 'Read the structural research' })).toHaveAttribute('href', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3729984/');
  await page.locator('.lab-workspace').screenshot({ path: 'tests/screenshots/model-closed-capsid.png' });
  await page.getByRole('button', { name: 'Exterior', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Exterior', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.scene-annotation')).toHaveCount(0);
  await page.locator('.lab-workspace').screenshot({ path: 'tests/screenshots/model-exterior.png' });
  await page.getByRole('button', { name: 'Cutaway', exact: true }).click();
  await page.getByRole('button', { name: '01 Lipid envelope', exact: true }).click();
  await page.getByRole('button', { name: 'Two RNA copies + NC', exact: true }).click();
  await expect(page.locator('.layer-detail h3')).toHaveText('RNA + nucleocapsid');
  const canvas = page.locator('.scene-explorer canvas');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance'))).toBeLessThan(8);
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance'))).toBeGreaterThan(8);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance'))).toBeCloseTo(8.352, 2);
  await page.getByRole('button', { name: 'Exterior', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-view', 'exterior');
  const bounds = await canvas.boundingBox();
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(page.locator('.layer-detail h3')).toHaveText('Lipid envelope');
  await expect(canvas).toHaveAttribute('data-view', 'cutaway');
  await canvas.focus();
  await canvas.press('ArrowRight');
  await canvas.press('+');
  await canvas.press('Home');
  for (const [name, heading] of [['04 p17 matrix', 'p17 matrix'], ['06 Reverse transcriptase', 'Reverse transcriptase'], ['07 Integrase', 'Integrase'], ['08 Protease', 'Protease']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('.layer-detail h3')).toHaveText(heading);
  }
  await page.getByRole('tab', { name: 'The life cycle', exact: true }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.locator('.lab-workspace').screenshot({ path: 'tests/screenshots/model-lifecycle.png' });
  await page.getByRole('tab', { name: 'Inside the virus', exact: true }).click();
  await expect(page.locator('.scene-explorer canvas')).toHaveAttribute('tabindex', '0');
  await page.getByRole('button', { name: 'Reset view' }).click();
  await page.getByRole('button', { name: '05 RNA + nucleocapsid' }).click();
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.lab-viewer').scrollIntoViewIfNeeded();
    await page.locator('.lab-workspace').screenshot({ path: `tests/screenshots/model-${width}.png` });
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width, `No overflow at ${width}px`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.scene-explorer .virus-fallback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  await page.getByRole('button', { name: 'Exterior', exact: true }).click();
  await expect(page.locator('.scene-explorer .virus-fallback')).toHaveAttribute('aria-label', /exterior/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('canvas')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
  await page.getByRole('button', { name: 'Reset view' }).click();
  const stableFrames = await page.locator('.scene-explorer').evaluate(async (element) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const before = Number(element.dataset.frames);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { before, after: Number(element.dataset.frames) };
  });
  assert.equal(stableFrames.after, stableFrames.before, 'Paused scene stops rendering when settled');
  await canvas.evaluate((element) => element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.locator('.scene-explorer .virus-fallback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  assert.deepEqual(errors, []);
  console.log('PASS model views, labels, component selection, source links, camera controls, lifecycle round-trip, and responsive widths');
} finally {
  await browser.close();
}
