# GitHub and Vercel deployment

## Local checks

```bash
npm install
npm run products:generate
npm run validate
npm run lint
npm run build
npm run dev
```

## GitHub

Create an empty repository, then run:

```bash
git init
git add .
git commit -m "Initial CounterCrave site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/countercrave.git
git push -u origin main
```

The included GitHub Actions workflow validates content, affiliate product data,
linting and the production build.

## Vercel environment variables

```text
NEXT_PUBLIC_SITE_URL=https://countercrave.com
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=visitbest07-20
NEXT_PUBLIC_GA_MEASUREMENT_ID=
SHOW_DRAFTS=false
SHOW_CONTENT_PLAN=false
```

`visitbest07-20` is already the code fallback, but setting it in Vercel keeps
the configuration explicit.

## Production checks

- production uses one canonical hostname;
- HTTPS works;
- draft content returns 404;
- `/content-plan/` returns 404;
- sitemap contains only published URLs;
- robots references the production sitemap;
- every affiliate link contains `tag=visitbest07-20`;
- disclosure appears before the first affiliate link;
- outbound click events appear in analytics;
- Amazon image URLs were obtained through a permitted workflow;
- no price, rating or hands-on claim is unverified.
