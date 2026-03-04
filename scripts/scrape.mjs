/**
 * Authenticated scraper: login → scrape list page(s) → normalize → write JSON.
 * Run: npm run scrape (requires .env with SCRAPE_LOGIN_URL, SCRAPE_USER, SCRAPE_PASSWORD).
 * Configure selectors in scripts/scrape-config.json; optional SCRAPE_LIST_URL in .env.
 */
import { chromium } from '@playwright/test';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

config({ path: join(ROOT, '.env') });

const LOGIN_URL = process.env.SCRAPE_LOGIN_URL;
const USER = process.env.SCRAPE_USER;
const PASSWORD = process.env.SCRAPE_PASSWORD;
const BASE_URL = process.env.SCRAPE_BASE_URL || (LOGIN_URL ? new URL(LOGIN_URL).origin : '');
const LIST_URL_ENV = process.env.SCRAPE_LIST_URL;

function loadScrapeConfig() {
  const path = join(__dirname, 'scrape-config.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32) || 'item';
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}

/** Normalize scraped row to catalog product shape */
function normalizeRow(row, index) {
  const name = (row.name || row.provider || '').trim() || `Item ${index + 1}`;
  const id = `${slugify(name)}-${simpleHash(name + (row.provider || ''))}`;
  let tags = row.tags;
  if (typeof tags === 'string') {
    tags = tags.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
  }
  if (!Array.isArray(tags)) tags = [];

  return {
    id,
    name: (row.name || name).trim(),
    provider: (row.provider || '').trim() || '—',
    integrationType: (row.integrationType || '').trim() || '—',
    timeline: (row.timeline || '').trim() || '—',
    tags,
    logo: (row.logo || slugify(row.provider || name)).trim() || 'default',
  };
}

/** Normalize detail-page scrape to catalog shape + description, tagLine */
function normalizeDetailRow(row, index) {
  const name = (row.solutionName || row.providerName || '').trim() || `Item ${index + 1}`;
  const id = `${slugify(name)}-${simpleHash(name + (row.providerName || ''))}`;
  let tags = row.tags;
  if (typeof tags === 'string') {
    tags = tags.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
  }
  if (!Array.isArray(tags)) tags = [];

  return {
    id,
    name: (row.solutionName || name).trim(),
    provider: (row.providerName || '').trim() || '—',
    description: (row.description || '').trim() || '',
    tagLine: (row.tagLine || '').trim() || '',
    integrationType: '—',
    timeline: '—',
    tags,
    logo: slugify(row.providerName || name) || 'default',
  };
}

async function extractText(page, selector, scope) {
  const loc = scope ? scope.locator(selector) : page.locator(selector);
  const first = loc.first();
  const count = await loc.count().catch(() => 0);
  if (!count) return '';
  return first.innerText().catch(() => '');
}

/** Try multiple selectors (comma-separated or array), return first non-empty */
async function extractWithSelectors(page, selectorString, scope) {
  const selectors = typeof selectorString === 'string'
    ? selectorString.split(',').map((s) => s.trim())
    : selectorString;
  for (const sel of selectors) {
    if (!sel) continue;
    const text = await extractText(page, sel, scope);
    if (text && text.trim()) return text.trim();
  }
  return '';
}

/** Extract multiple elements (e.g. tags) as array of strings */
async function extractTextList(page, selector, scope) {
  const loc = scope ? scope.locator(selector) : page.locator(selector);
  const count = await loc.count().catch(() => 0);
  if (!count) return [];
  const texts = [];
  for (let i = 0; i < count; i++) {
    const t = await loc.nth(i).innerText().catch(() => '');
    if (t && t.trim()) texts.push(t.trim());
  }
  return texts;
}

/** Collect product detail page URLs from listing page (optional: multi-page via multiple listUrls or Next button) */
async function getProductLinks(page, listUrl, baseUrl, cfg, options = {}) {
  const linkSelector = cfg.list?.productLinkSelector || "a[href*='/en-US/apps/'], a[href*='/profile/'], a[href*='/apps/']";
  const attr = cfg.list?.productLinkAttr || 'href';
  const maxProducts = cfg.list?.maxProducts ?? 50;
  const nextPageSel = options.singlePage ? null : cfg.list?.nextPageSelector;
  const base = new URL(listUrl).origin;
  const allResolved = new Set();

  let currentUrl = listUrl;

  while (true) {
    await page.goto(currentUrl, { waitUntil: 'load', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));

    const waitSel = cfg.list?.waitForSelector;
    if (waitSel) {
      await page.locator(waitSel).first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => null);
      await new Promise((r) => setTimeout(r, 1500));
    }

    const links = await page.locator(linkSelector).evaluateAll((els, attrName) => {
      const seen = new Set();
      const out = [];
      for (const el of els) {
        const href = el.getAttribute(attrName);
        if (!href || href === '#' || seen.has(href)) continue;
        seen.add(href);
        out.push(href);
      }
      return out;
    }, attr);

    for (const href of links) {
      try {
        const url = new URL(href, base);
        if (url.pathname && url.pathname !== '/') allResolved.add(url.href);
      } catch (_) {}
    }

    if (allResolved.size >= maxProducts) break;
    if (!nextPageSel) break;

    const nextBtn = page.locator(nextPageSel).first();
    const visible = await nextBtn.isVisible().catch(() => false);
    const disabled = await nextBtn.getAttribute('aria-disabled').then((a) => a === 'true').catch(() => false);
    if (!visible || disabled) break;

    await nextBtn.click();
    await new Promise((r) => setTimeout(r, 2000));
    currentUrl = page.url();
  }

  return [...allResolved].slice(0, maxProducts);
}

/** Extract product fields from AppDirect/Candescent window.dataStore if present */
async function extractFromDataStore(page) {
  return page.evaluate(() => {
    const ds = window.dataStore;
    if (!ds) return null;
    const app = ds.application || ds.page?.profile?.orderable || ds.orderable;
    if (!app) return null;
    const summary = app.summary || app;
    const vendor = app.vendor || app.vendorSummary || {};
    const vendorName = typeof vendor === 'string' ? vendor : (vendor.name || vendor.companyName || '');
    const desc = summary.longDescription || summary.description || app.description || '';
    const tagline = summary.tagline || app.tagline || '';
    let tags = [];
    if (Array.isArray(app.categories)) tags = app.categories.map((c) => (c && (c.name || c.displayName)) || String(c));
    else if (Array.isArray(summary.categories)) tags = summary.categories.map((c) => (c && (c.name || c.displayName)) || String(c));
    return {
      solutionName: summary.title || app.title || '',
      providerName: vendorName,
      description: desc,
      tagLine: tagline,
      tags,
    };
  });
}

/** Get meta tag content (e.g. description) */
async function extractMetaContent(page, selector) {
  const el = page.locator(selector).first();
  const count = await el.count().catch(() => 0);
  if (!count) return '';
  return el.getAttribute('content').catch(() => '') || '';
}

/** Get first matching img src (tries comma-separated selectors) */
async function extractImageSrc(page, selectorString) {
  const selectors = typeof selectorString === 'string'
    ? selectorString.split(',').map((s) => s.trim())
    : selectorString;
  for (const sel of selectors) {
    if (!sel) continue;
    const loc = page.locator(sel).first();
    const count = await loc.count().catch(() => 0);
    if (!count) continue;
    const src = await loc.getAttribute('src').catch(() => '');
    if (src && src.startsWith('http')) return src;
  }
  return '';
}

/** Download image from URL to filepath using Playwright request (keeps session/cookies) */
async function downloadImage(request, imageUrl, filepath) {
  try {
    const resp = await request.get(imageUrl, { timeout: 15000 });
    if (!resp.ok()) return;
    const buf = await resp.body();
    mkdirSync(dirname(filepath), { recursive: true });
    writeFileSync(filepath, buf);
  } catch (_) {
    // ignore
  }
}

function imageExtFromUrl(url) {
  const pathname = new URL(url).pathname || '';
  const match = pathname.match(/\.(png|jpe?g|gif|webp)$/i);
  return (match && match[1].toLowerCase()) || 'png';
}

/** Scrape a single product detail page for solution name, provider, description, tagLine, tags */
async function scrapeDetailPage(page, productUrl, cfg) {
  await page.goto(productUrl, { waitUntil: 'load', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));

  const detail = cfg.detail || {};
  const row = { solutionName: '', providerName: '', description: '', tagLine: '', tags: [] };

  const fromStore = await extractFromDataStore(page);
  if (fromStore) {
    row.solutionName = fromStore.solutionName || '';
    row.providerName = fromStore.providerName || '';
    row.description = fromStore.description || '';
    row.tagLine = fromStore.tagLine || '';
    row.tags = Array.isArray(fromStore.tags) ? fromStore.tags : [];
  }

  if (!row.solutionName) row.solutionName = await extractWithSelectors(page, detail.solutionName || 'h1.sr-only, h1');
  if (!row.providerName) row.providerName = await extractWithSelectors(page, detail.providerName || '[data-provider]');
  if (!row.description) {
    row.description = await extractMetaContent(page, "meta[name='description']");
            if (!row.description) row.description = await extractWithSelectors(page, detail.description || '.product-description, .description');
  }
  if (!row.tagLine) row.tagLine = await extractWithSelectors(page, detail.tagLine || '.tagline');

  if (!row.tags || row.tags.length === 0) {
    const tagsSelector = detail.tags || '.product-tag, .tag-list span, .product-tags span';
    const tagsArr = await extractTextList(page, tagsSelector);
    row.tags = tagsArr.length ? tagsArr : await extractWithSelectors(page, detail.tags).then((t) => (t ? [t] : []));
  }

  row.logoUrl = await extractImageSrc(page, detail.logoImageSelector || "img.productCard_0_0_366_image, img[data-testid='productCard_0_0_366:image']");
  row.heroUrl = await extractImageSrc(page, detail.heroImageSelector || "img.productImageViewer_slideImage, img[data-testid='productImageViewer:slideImage']");

  return row;
}

async function scrapePage(page, url, cfg) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector(cfg.list.rowSelector, { timeout: 15000 }).catch(() => null);

  const rows = await page.locator(cfg.list.rowSelector).all();
  const fields = cfg.list.fields || {};
  const results = [];

  for (let i = 0; i < rows.length; i++) {
    const rowEl = rows[i];
    const row = {};
    for (const [key, selector] of Object.entries(fields)) {
      row[key] = await extractText(page, selector, rowEl);
    }
    results.push(normalizeRow(row, results.length));
  }

  return results;
}

async function main() {
  if (!LOGIN_URL || !USER || !PASSWORD) {
    console.error('Missing .env: set SCRAPE_LOGIN_URL, SCRAPE_USER, SCRAPE_PASSWORD');
    process.exit(1);
  }

  const scrapeConfig = loadScrapeConfig();
  const listUrls = scrapeConfig.list?.listUrls?.length
    ? scrapeConfig.list.listUrls
    : LIST_URL_ENV
      ? [LIST_URL_ENV]
      : [];

  if (!listUrls.length) {
    console.error('No list URLs. Set list.listUrls in scripts/scrape-config.json or SCRAPE_LIST_URL in .env');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  try {
    await page.goto(LOGIN_URL, { waitUntil: 'load', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));

    const login = scrapeConfig.login || {};
    const signInLink = login.signInLinkSelector;
    if (signInLink) {
      const link = page.locator(signInLink).first();
      await link.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      if (await link.isVisible()) {
        await link.click();
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    const unSel = login.usernameSelector || "input[type='email'], input[name='username']";
    const pwSel = login.passwordSelector || "input[type='password'], input[name='password']";
    const subSel = login.submitSelector || "button[type='submit'], input[type='submit']";

    const usernameLoc = page.locator(unSel).first();
    await usernameLoc.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
      throw new Error(
        'Login form not found. The site may use a "Sign in" link that opens the form: add login.signInLinkSelector in scrape-config.json (e.g. "a[href*=\'login\'], button:has-text(\'Sign in\')"). Or set SCRAPE_LOGIN_URL to the actual login page URL.'
      );
    });
    await usernameLoc.fill(USER);
    await page.locator(pwSel).first().fill(PASSWORD);
    await page.locator(subSel).first().click();
    await page.waitForURL(/\/(?!login|signin|auth)/i, { timeout: 15000 }).catch(() => null);
    await new Promise((r) => setTimeout(r, 1500));

    let all = [];
    const useDetailFlow = scrapeConfig.detail && scrapeConfig.list?.productLinkSelector;

    if (useDetailFlow) {
      const singlePage = listUrls.length > 1;
      const allProductUrls = new Set();
      for (const listUrl of listUrls) {
        const resolved = listUrl.startsWith('http') ? listUrl : new URL(listUrl, BASE_URL).href;
        const productUrls = await getProductLinks(page, resolved, BASE_URL, scrapeConfig, { singlePage });
        productUrls.forEach((u) => allProductUrls.add(u));
        console.log(`Found ${productUrls.length} links on page → ${allProductUrls.size} total unique`);
      }
      const uniqueUrls = [...allProductUrls];
      const assetsDir = join(ROOT, 'public', 'product-assets');
      mkdirSync(assetsDir, { recursive: true });

      for (let i = 0; i < uniqueUrls.length; i++) {
        const productUrl = uniqueUrls[i];
        process.stdout.write(`  [${i + 1}/${uniqueUrls.length}] ${productUrl.slice(-50)}…\n`);
        const row = await scrapeDetailPage(page, productUrl, scrapeConfig);
        const obj = normalizeDetailRow(row, all.length);

        const request = context.request || page.request;
        if (row.logoUrl && request) {
          const ext = imageExtFromUrl(row.logoUrl);
          const logoPath = join(assetsDir, `${obj.id}-logo.${ext}`);
          await downloadImage(request, row.logoUrl, logoPath);
          obj.logoPath = `/product-assets/${obj.id}-logo.${ext}`;
        }
        if (row.heroUrl && request) {
          const ext = imageExtFromUrl(row.heroUrl);
          const heroPath = join(assetsDir, `${obj.id}-hero.${ext}`);
          await downloadImage(request, row.heroUrl, heroPath);
          obj.heroPath = `/product-assets/${obj.id}-hero.${ext}`;
        }

        all.push(obj);
      }
    } else {
      for (const listUrl of listUrls) {
        const resolved = listUrl.startsWith('http') ? listUrl : new URL(listUrl, BASE_URL).href;
        const items = await scrapePage(page, resolved, scrapeConfig);
        all = all.concat(items);
      }
    }

    const outPath = join(ROOT, 'src', 'data', 'scraped-products.json');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');
    console.log(`Wrote ${all.length} products to ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
