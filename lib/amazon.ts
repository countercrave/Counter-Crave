import { siteConfig } from "@/lib/site";

const ASIN_PATTERN = /^[A-Z0-9]{10}$/i;

export function normalizeAsin(asin: string): string {
  const normalized = asin.trim().toUpperCase();
  if (!ASIN_PATTERN.test(normalized)) {
    throw new Error(`Invalid Amazon ASIN: ${asin}`);
  }
  return normalized;
}

export type AmazonMarketplace = "com" | "in";

export function detectMarketplaceFromPrice(listPrice?: string): AmazonMarketplace {
  return /₹|rs\.?|inr/i.test(String(listPrice || "")) ? "in" : "com";
}

export function buildAmazonProductUrl(
  asin: string,
  associateTag = siteConfig.amazonAssociateTag,
  marketplace: AmazonMarketplace = "com",
): string {
  const normalizedAsin = normalizeAsin(asin);
  const host =
    marketplace === "in" ? "https://www.amazon.in" : "https://www.amazon.com";
  const url = new URL(`${host}/dp/${normalizedAsin}/ref=nosim`);
  if (associateTag) {
    url.searchParams.set("tag", associateTag);
  }
  return url.toString();
}
