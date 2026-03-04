# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Catalog data: verified vs app source

The app **does not** read from `scraped-products.json` directly. Two separate data locations:

| File | Purpose |
|------|--------|
| **`src/data/scraped-products.json`** | **Verified only.** Ingest target for new scraped data. Do not edit for the UI; keep as the single source of verified products. |
| **`src/data/catalog-products.json`** | **App data source.** What the catalog UI reads. Can mix verified products (synced from scraped) and placeholder products. Each product has `source: "verified"` or `source: "placeholder"`. |

### Workflow: port verified data into the app

1. **Ingest new verified data** into `scraped-products.json` (e.g. replace the file with new scrape output, or run `npm run scrape` if you use the scraper).
2. **Sync verified → catalog:** run `npm run sync-catalog`. This merges all products from `scraped-products.json` into `catalog-products.json` with `source: "verified"`. Any products that exist only in `catalog-products.json` are left as-is with `source: "placeholder"`.
3. The app shows both verified and placeholder products; list and cards display a **Verified** or **Placeholder** badge so you can tell them apart.

To add placeholder-only products: edit `catalog-products.json` and add entries with `"source": "placeholder"`. They will remain when you run `sync-catalog`; only products that appear in `scraped-products.json` are updated from the verified source.

### Authenticated scraping (optional)

To refresh verified data by scraping a site behind login:

1. Copy `.env.example` to `.env` and set `SCRAPE_LOGIN_URL`, `SCRAPE_USER`, `SCRAPE_PASSWORD`, and optionally `SCRAPE_LIST_URL` (or set `list.listUrls` in `scripts/scrape-config.json`).
2. Edit `scripts/scrape-config.json` with the target site’s selectors (login form and list rows/fields).
3. First time only: install the browser for Playwright: `npx playwright install chromium`.
4. Run `npm run scrape` to log in, scrape, and write `src/data/scraped-products.json`.
5. Run `npm run sync-catalog` to port the new verified data into the app catalog (`catalog-products.json`).

**Before committing publicly:** Never commit `.env` (it is gitignored). Use only placeholder values in `.env.example`. Set real credentials only in a local `.env` that you do not commit.

### Purging secrets before a public commit

1. **Ensure `.env` is not tracked:** Run `git status` and confirm `.env` does not appear. If it does, run `git rm --cached .env` and commit that change.
2. **If `.env` was ever committed in the past,** remove it from history (e.g. `git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty HEAD` or use [BFG Repo-Cleaner](https://rftc.org/bfg)).
3. **Rotate credentials:** After any exposure, change the password for the account used in `.env`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
