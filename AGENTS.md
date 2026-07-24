# CounterCrave agent instructions

This repository uses Next.js 16.2.11 with the App Router.

Before changing framework code, read the version-matched documentation bundled
inside `node_modules/next/dist/docs/`. Do not rely on remembered APIs when the
local documentation answers the question.

## Non-negotiable rules

1. Keep primary content server-rendered.
2. Do not publish a page while `draft` is true.
3. Do not invent hands-on testing, product ownership, prices, ratings, quotes,
   safety claims, ASINs or image URLs.
4. All Amazon links must be generated through `AmazonLink` or
   `buildAmazonProductUrl`.
5. The Associate tag is `visitbest07-20` unless an environment override is
   intentionally configured.
6. Do not scrape Amazon pages or download/re-host Amazon images.
7. Product images must come from a permitted Amazon workflow such as the
   current Creators API or SiteStripe, or from original/licensed photography.
8. Keep comparison tables accessible and useful on 320px-wide screens.
9. Schema must match visible content.
10. Run `npm run validate`, `npm run lint` and `npm run build` before merging.
