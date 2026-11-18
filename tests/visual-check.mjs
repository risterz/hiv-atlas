import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('tests/screenshots', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'tests/screenshots/desktop-home.png', fullPage: false });
await page.screenshot({ path: 'tests/screenshots/desktop-full.png', fullPage: true });
console.log(JSON.stringify({ title: await page.title(), viewport: await page.evaluate(() => [innerWidth, innerHeight]), scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), canvases: await page.locator('canvas').count(), errors }, null, 2));
await browser.close();
