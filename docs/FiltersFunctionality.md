# Catalog Filters — Functionality Summary

Concise reference for the catalog filter logic. Implementation lives in `src/pages/Catalog.jsx`.

---

## Filter types and combination

All filters are **AND**ed together. A product is shown only if it passes every active filter.

| Filter | Type | Behavior |
|--------|------|----------|
| **Search** | Text | Product included if query matches **name**, **provider**, or any **tag** (case-insensitive substring). |
| **Status** | Single choice | One of: All statuses, Available, Coming soon. Status is derived from `timeline` (contains "month" → "Coming soon", else "Available"). |
| **Integration type** | Multi-select | Product must have `integrationType` in the selected set. Empty selection = no filter. |
| **Tags** | Multi-select (chips) | Product must have **at least one** of the selected tags in its `tags` array. Empty selection = no filter. |

**Order of application in code:** search → status → integration types → tags.

---

## State

- `searchQuery` — search input
- `statusFilter` — `'all' | 'Available' | 'Coming soon'`
- `integrationTypes` — array of selected integration type strings
- `selectedTags` — array of selected tag strings

**Clear vs Reset:** Clear removes status, integration type, and tag filters (dropdown + chips). Reset also clears search and closes the filter dropdown.

---

## Filter pipeline

1. **`productsWithStatus`** — source list with `status` added (`deriveStatus()`).
2. **`filteredProducts`** — result of applying search, status, integration types, and tags (see combination rules above).
3. **`sortedProducts`** — `filteredProducts` sorted by current sort option (name, provider, integration type, timeline).
4. **`displayProducts`** — same as `sortedProducts`; used for rendering. `totalFiltered = sortedProducts.length`.

---

## Count (N) next to each option

Each filter option shows **(N)**. Meaning depends on whether the option is selected.

| Option state | Meaning of (N) |
|--------------|----------------|
| **Unselected** | How many products would be visible **if** this option were selected (with all other current filters applied). |
| **Selected** | How many products in the **current** result set have this tag or integration type — i.e. this filter’s **contribution** to the current list. |

**Data used:**

- **Unselected counts** — `statusCounts`, `integrationTypeCounts`, `tagCounts`: count over `productsWithStatus` with current filters *except* the one being counted (so “if I turn this on, how many?”).
- **Selected counts** — `tagContributionCounts`, `integrationTypeContributionCounts`: count over `filteredProducts` that have that tag or integration type.

**UI:** Count uses class `catalog-filter-count` (color `#656565`). On active (blue) tag chips it is overridden to white via `.catalog-chip-active .catalog-filter-count`.

---

## Helpers (for reference)

- **`deriveStatus(product)`** — `timeline` contains "month" → `"Coming soon"`, else `"Available"`.
- **`getAllTags(products)`** — unique, sorted list of all tag strings.
- **`getAllIntegrationTypes(products)`** — unique, sorted list of `integrationType` (excludes `'—'`).
- **`toggleTag(tag)`** / **`toggleIntegrationType(type)`** — add/remove from `selectedTags` / `integrationTypes`.

---

## Product data expectations

- **`tags`** — array of strings (may be empty).
- **`integrationType`** — string (e.g. "OIDC SSO", "SAML SSO"); filtered out if `'—'`.
- **`timeline`** — string; used only for status derivation.
- **`name`**, **`provider`** — strings; used for search.
