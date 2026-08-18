# CounterCrave Static Rebuild

Generated: 2026-08-18
Amazon Associates tag: `visitbest07-20`

## What is included
- Modern responsive static homepage
- 12 category hubs
- 72 original article pages generated from category-specific decision frameworks
- 61 catalog product records
- Interactive Product Finder
- Same-category product comparison tool + custom comparison mode
- Amazon Associate links with `rel="sponsored nofollow noopener"`
- Real Amazon-hosted product images where a current image URL was verified during the rebuild; graceful fallback elsewhere
- About, methodology, disclosure, privacy, terms, contact
- robots.txt + sitemap.xml
- Article and product inventory CSVs
- Product JSON data file used by the tools

## Deploy
This is a static site. Upload the folder contents to your web root (or deploy to Netlify, Cloudflare Pages, GitHub Pages, S3/CloudFront, etc.). Preserve folder structure.

For local testing, do not double-click files for the interactive tools because browsers may block JSON fetches from `file://`. Run a local server instead:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Important production checks
1. **Amazon image/compliance:** Amazon-hosted image URLs can change and Amazon Associates has specific rules governing use of product advertising content. Before production, prefer Amazon SiteStripe / Product Advertising API for product images and keep usage compliant with your Associates agreement. The rebuild does not download or redistribute Amazon image files.
2. **ASIN verification:** Exact ASIN links are used where verified during this rebuild. Other catalog entries use tagged Amazon search URLs so the site does not invent an ASIN.
3. **Prices:** The site intentionally avoids hard-coded live prices. Use Amazon for the current price, seller, coupon and stock.
4. **Legal pages:** Privacy/terms are starter language and should be reviewed for the services and jurisdictions you actually use.
5. **Email/contact:** Add your real business mailbox before launch.
6. **Claims:** The articles are research-led and explicitly avoid claiming hands-on testing unless you later add documented testing.

## Content architecture
Each category has six distinct guide intents: overall, small-space, family/batch, value, buying guide, and comparison guide. Article pages include a quick answer, comparison table, detailed product trade-offs, decision rules, methodology, FAQs and related links.

## Editing products
Update `data/products.json` and product definitions if you regenerate the site. The comparison/finder tools read the JSON at runtime.

## Affiliate ID
All generated Amazon destinations use `visitbest07-20`.


## Product image verification update — 2026-08-18

All 61 catalog records now include an exact ASIN, an Amazon-hosted product image matched to that product identity, and a direct Amazon affiliate URL carrying `visitbest07-20`. Product names were tightened to explicit model numbers where the prior label was ambiguous. A machine-readable audit is included at `data/product-image-verification.csv`.

Amazon product advertising content, including images, is governed by the Amazon Associates program and may change. Before production deployment, use the image/link delivery method permitted by your current Associates agreement (for example, approved SiteStripe or Product Advertising API workflows where applicable) and periodically revalidate product availability and images.


## v3 expansion changelog (2026-08-18)
- Articles: 72 -> 108. Every category now has nine guide intents; the three new ones are a cleaning-and-maintenance guide, a seven-mistakes buying guide, and a premium-vs-budget value analysis, each written from category-specific frameworks.
- Products: 61 -> 85. The 24 new products carry exact ASINs verified against Amazon product-page URLs and independent price trackers on 2026-08-18, with direct tagged /dp/ links (tag `visitbest07-20`).
- Images: the original 61 verified Amazon-hosted images are unchanged. The 24 new products intentionally ship with clean category-artwork fallbacks instead of guessed image URLs, because Amazon blocks automated image verification. Before production, attach their images via Amazon SiteStripe or the Product Advertising API (which is also the Associates-compliant way to serve product media long-term); `data/product-image-verification.csv` lists each pending item.
- Hubs, article index, homepage KPIs, sitemap.xml, product JSON (used by the Finder and Comparison tools), inventories and this manifest were all rewired for the new totals.
