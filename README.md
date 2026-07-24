# CounterCrave

GitHub-ready Next.js 16.2.11 affiliate content site generated from the approved
CounterCrave master workbook.

## Included

- Next.js App Router source for Vercel
- 228 editorial page briefs as local JSON files
- 7 complete trust/legal starter pages
- draft-safe robots and sitemap logic
- Amazon ASIN link generator using `visitbest07-20`
- GA4-ready outbound affiliate click tracking
- product image fields for Creators API or SiteStripe URLs
- responsive editorial design
- structured data helpers
- Cursor and coding-agent rules
- content/product validation scripts
- GitHub Actions quality workflow

## Run locally

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run products:generate
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/content-plan/` for all 228 local editorial briefs

Draft pages are visible locally. They are automatically excluded from production,
the sitemap and indexing until their JSON file is completed and `draft` is set
to `false`.

## Amazon Associate tag

The default tag is:

```text
visitbest07-20
```

A valid ASIN is converted to this format:

```text
https://www.amazon.com/dp/ASIN/ref=nosim?tag=visitbest07-20
```

The tag can be overridden in Vercel with:

```text
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
```

## Add products and images

1. Open `data/product-import-template.csv`.
2. Add the current product name and 10-character ASIN.
3. Add an Amazon-provided image URL from the current Creators API or SiteStripe,
   or use an original/licensed image.
4. Add image dimensions and a meaningful alt description.
5. Run:

```bash
npm run products:generate
npm run validate
```

The generator creates `data/product-links.generated.json`, automatically adds
the Associate tag and rejects malformed ASINs or unexpected image hosts.

Do not scrape Amazon product pages, customer reviews, ratings, prices or images.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial CounterCrave site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/countercrave.git
git push -u origin main
```

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Framework preset: Next.js.
3. Add the environment variables from `.env.example`.
4. Deploy the preview.
5. Verify `/robots.txt`, `/sitemap.xml`, `/llms.txt`, canonical URLs and outbound
   Amazon link tracking.
6. Connect `countercrave.com` only after the preview passes QA.

See `docs/GITHUB-VERCEL.md` and `docs/AMAZON-PRODUCT-WORKFLOW.md`.
