#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(__dirname, '../src/data/catalog-products.json');

const INTEGRATION_TYPES = ['SAML SSO', 'OIDC SSO', 'Aspects', 'API Catalog', 'Other'];
const TIMELINES = [
  '2 - 3 days est. integration time',
  '3 - 5 days est. integration time',
  '1 - 2 week est. integration time',
  '2 - 3 week est. integration time',
  '2 - 4 week est. integration time',
  '3 - 5 week est. integration time',
  '4 - 6 week est. integration time',
  '4 - 8 week est. integration time',
];

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

catalog.forEach((product, i) => {
  product.integrationType = INTEGRATION_TYPES[i % INTEGRATION_TYPES.length];
  product.timeline = TIMELINES[i % TIMELINES.length];
});

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`Updated ${catalog.length} products with integrationType and timeline.`);
