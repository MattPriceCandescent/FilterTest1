/**
 * Aggregate scraped products with static seed data: dedupe by id, scraped first.
 * Run: npm run aggregate
 * Reads: src/data/scraped-products.json, src/data/products.js
 * Writes: src/data/aggregated-products.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SCRAPED_PATH = join(ROOT, 'src', 'data', 'scraped-products.json');
const AGGREGATED_PATH = join(ROOT, 'src', 'data', 'aggregated-products.json');

function loadScraped() {
  if (!existsSync(SCRAPED_PATH)) return [];
  return JSON.parse(readFileSync(SCRAPED_PATH, 'utf8'));
}

async function loadStatic() {
  try {
    const mod = await import(pathToFileURL(join(ROOT, 'src', 'data', 'products.js')).href);
    return mod.products || [];
  } catch (_) {
    return [];
  }
}

async function aggregate() {
  const scraped = loadScraped();
  const staticProducts = await loadStatic();
  const byId = new Map();

  for (const p of scraped) {
    if (p && p.id) byId.set(p.id, p);
  }
  for (const p of staticProducts) {
    if (p && p.id && !byId.has(p.id)) byId.set(p.id, p);
  }

  const aggregated = Array.from(byId.values());
  mkdirSync(dirname(AGGREGATED_PATH), { recursive: true });
  writeFileSync(AGGREGATED_PATH, JSON.stringify(aggregated, null, 2), 'utf8');
  console.log(`Wrote ${aggregated.length} products to ${AGGREGATED_PATH}`);
}

aggregate();
