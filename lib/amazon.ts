import { siteConfig } from "@/lib/site";

const ASIN_PATTERN = /^[A-Z0-9]{10}$/i;

export function normalizeAsin(asin: string): string {
  const normalized = asin.trim().toUpperCase();
  if (!ASIN_PATTERN.test(normalized)) {
    throw new Error(`Invalid Amazon ASIN: ${asin}`);
  }
  return normalized;
}

export function buildAmazonProductUrl(
  asin: string,
  associateTag = siteConfig.amazonAssociateTag,
): string {
  const normalizedAsin = normalizeAsin(asin);
  const url = new URL(
    `https://www.amazon.com/dp/${normalizedAsin}/ref=nosim`,
  );
  url.searchParams.set("tag", associateTag);
  return url.toString();
}
