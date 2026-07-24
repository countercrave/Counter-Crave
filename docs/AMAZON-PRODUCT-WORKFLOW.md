# Amazon product and image workflow

## Affiliate links

The project builds a simple ASIN link in Amazon's documented format:

```text
https://www.amazon.com/dp/ASIN/ref=nosim?tag=visitbest07-20
```

Use `AmazonLink` in React or run `npm run products:generate` for CSV-based
product cards. Do not manually create competing link formats across the site.

## Product input

Open `data/product-import-template.csv`.

Required for a live product card:

- `pageId`
- `slotId`
- `slotLabel`
- `productName`
- `asin`

Recommended:

- `imageUrl`
- `imageWidth`
- `imageHeight`
- `imageAlt`
- `imageSource`
- `checkedAt`

## Images

Do not scrape Amazon HTML or download/re-host Amazon product images.

Use one of these workflows:

1. the current Amazon Creators API, after the account has access;
2. a link/image tool supplied inside Associates Central, such as SiteStripe,
   when available for the account and locale;
3. original product photography;
4. properly licensed manufacturer/editorial photography.

The project displays approved external Amazon media URLs directly with a normal
HTML image element. It does not download them into the repository.

Amazon's older PA-API documentation states that PA-API was deprecated on
May 15, 2026 and points users to Creators API. Confirm the current API and
license terms inside Associates Central before implementation.

## Generate and validate

```bash
npm run products:generate
npm run validate
```

The script:

- validates a 10-character ASIN;
- adds `visitbest07-20`;
- validates HTTPS image URLs;
- accepts known Amazon media hosts;
- creates a stable tracking key;
- refuses to generate output when a row is malformed.

## Refresh policy

Before publishing or refreshing a page:

- verify the exact model and variant;
- verify the ASIN;
- confirm availability;
- confirm the image is still permitted and live;
- update `checkedAt`;
- remove unavailable products promptly;
- never copy Amazon customer reviews or star ratings.
