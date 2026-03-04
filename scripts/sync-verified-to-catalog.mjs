/**
 * Sync verified products from scraped-products.json into catalog-products.json.
 * - Verified source: src/data/scraped-products.json (ingest target; do not edit for app UI).
 * - App source: src/data/catalog-products.json (what the UI reads; may include placeholders).
 *
 * Merge strategy:
 * - Every product in scraped-products is written/updated in catalog with source: "verified".
 * - Products that exist only in catalog are left as-is (source: "placeholder").
 * - Run after ingesting new verified data to refresh the app catalog.
 *
 * Usage: npm run sync-catalog
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VERIFIED_PATH = join(ROOT, 'src', 'data', 'scraped-products.json');
const CATALOG_PATH = join(ROOT, 'src', 'data', 'catalog-products.json');

function loadJson(path, defaultVal = []) {
  if (!existsSync(path)) return defaultVal;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sync() {
  const verified = loadJson(VERIFIED_PATH, []);
  const catalog = loadJson(CATALOG_PATH, []);

  const verifiedById = new Map(verified.filter((p) => p && p.id).map((p) => [p.id, p]));
  const catalogById = new Map(catalog.filter((p) => p && p.id).map((p) => [p.id, p]));

  // Apply verified data: insert or overwrite with source "verified"
  for (const p of verified) {
    if (!p || !p.id) continue;
    catalogById.set(p.id, { ...p, source: 'verified' });
  }

  // Preserve catalog-only entries (placeholders); ensure they have source "placeholder"
  for (const [id, p] of catalogById) {
    if (!verifiedById.has(id) && p.source !== 'placeholder') {
      catalogById.set(id, { ...p, source: 'placeholder' });
    }
  }

  const merged = Array.from(catalogById.values());
  merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  writeFileSync(CATALOG_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(
    `Synced ${verified.length} verified product(s) into catalog (${merged.length} total).`
  );
}

sync();
