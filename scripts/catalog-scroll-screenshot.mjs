#!/usr/bin/env node
/**
 * Navigate to /products, hard refresh, take screenshots before and after scrolling the product grid.
 * Outputs: catalog-before-scroll.png, catalog-after-scroll.png
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SCROLL_PX = 800;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/products`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.catalog-scroll-area', { timeout: 5000 });

    // Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux) to clear cached CSS/JS
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Shift+r' : 'Control+Shift+r');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.catalog-scroll-area', { timeout: 5000 });

    // Screenshot 1: initial state
    await page.screenshot({ path: 'catalog-before-scroll.png', fullPage: false });
    console.log('Saved catalog-before-scroll.png');

    // Scroll the product grid area by 800px via JS (as user requested)
    await page.evaluate(({ selector, px }) => {
      const el = document.querySelector(selector);
      if (el) el.scrollTop = px;
    }, { selector: '.catalog-scroll-area', px: SCROLL_PX });

    await page.waitForTimeout(300);

    // Screenshot 2: after scroll
    await page.screenshot({ path: 'catalog-after-scroll.png', fullPage: false });
    console.log('Saved catalog-after-scroll.png');
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
