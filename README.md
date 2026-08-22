# CounterCrave Kitchen Guides

CounterCrave is a decision-first kitchen appliance publication built with
Next.js-compatible Vinext and deployed on ChatGPT Sites.

## Included

- 47 long-form guides across 7 categories: air fryers, blenders, coffee makers,
  rice cookers, vacuum sealers, wine & beverage coolers and pizza ovens
- A generated product catalog (`app/data/product-catalog.json`) of 1,050
  Amazon-backed product listings (580 distinct models), each with a real
  product photo, short name, format, spec chips, fit line, pros and watch-outs
- Every top pick and every comparison card links to its Amazon listing with a
  "Buy Now" button (sponsored/nofollow)
- 7 category hubs with three buying checks, the most-recommended models and a
  fundamentals section
- Interactive kitchen match finder
- Article, FAQ, ItemList, Recipe and HowTo structured data
- Open Graph image, sitemap, robots file and canonical metadata
- About/methodology and affiliate-disclosure pages

## Content pipeline

- `app/data/source-product-listings.json` — raw Amazon search captures (one
  list per guide slug). Add a new capture here to create a new comparison.
- `scripts/guide-picks.json` — the pick ASINs for every guide (kept even if the
  filter would otherwise drop them).
- `scripts/build-product-catalog.py` — removes accessories, consumables and
  off-intent items, merges colour variants into one model, derives the
  per-product copy and writes `app/data/product-catalog.json` plus
  `scripts/catalog-audit.json` (every removal and merge, with a reason).

```bash
python3 scripts/build-product-catalog.py
```

Guide copy lives in `app/data/guide-data.ts`, `app/data/air-fryer-guide-additions.ts`,
`app/data/small-appliance-guide-additions.ts` and
`app/data/kitchen-guide-additions.ts`. Category hubs and the curated product
table live in `app/data/site-data.ts`. Model counts in titles are corrected
automatically from the catalog at build time.

## Local setup

Requirements: Node.js 22.13 or newer plus a Linux shell with `flock`, `curl`
and GNU `timeout`.

```bash
npm ci
npm run dev
```

Production checks:

```bash
npm run build
npm test
```

## Affiliate links

Amazon product URLs use sponsored/nofollow link attributes on every "Buy Now"
button. See the rendered `/disclosure` page for the full disclosure.
