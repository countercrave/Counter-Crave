import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csv-utils.mjs";

const root = process.cwd();
const inputPath = path.join(root, "data", "product-import-template.csv");
const outputPath = path.join(root, "data", "product-links.generated.json");
const associateTag =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "visitbest07-20";

const allowedImageHosts = new Set([
  "m.media-amazon.com",
  "images-na.ssl-images-amazon.com",
]);

function normalizeAsin(value) {
  const asin = String(value || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    throw new Error(`Invalid ASIN: ${value}`);
  }
  return asin;
}

function buildAmazonUrl(asin) {
  const url = new URL(`https://www.amazon.com/dp/${asin}/ref=nosim`);
  url.searchParams.set("tag", associateTag);
  return url.toString();
}

function validateImageUrl(value) {
  if (!value) return "";
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error(`Image URL must use HTTPS: ${value}`);
  }
  if (!allowedImageHosts.has(url.hostname)) {
    throw new Error(
      `Image host is not in the Amazon media allowlist: ${url.hostname}`,
    );
  }
  return url.toString();
}

const rows = parseCsv(fs.readFileSync(inputPath, "utf8"));
const products = [];
const errors = [];

for (const [index, row] of rows.entries()) {
  if (!String(row.asin || "").trim()) continue;

  try {
    const asin = normalizeAsin(row.asin);
    const imageUrl = validateImageUrl(row.imageUrl);

    products.push({
      pageId: row.pageId,
      pageTitle: row.pageTitle,
      pageSlug: row.pageSlug,
      pageType: row.pageType,
      slotId: row.slotId,
      slotLabel: row.slotLabel,
      productName: row.productName || asin,
      asin,
      affiliateUrl: buildAmazonUrl(asin),
      imageUrl,
      imageWidth: row.imageWidth ? Number(row.imageWidth) : null,
      imageHeight: row.imageHeight ? Number(row.imageHeight) : null,
      imageAlt: row.imageAlt || row.productName || asin,
      imageSource: row.imageSource || "Creators API or SiteStripe",
      checkedAt: row.checkedAt || "",
      trackingKey: `${row.pageId}:${row.slotId}:${asin}`,
    });
  } catch (error) {
    errors.push(`CSV row ${index + 2}: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

fs.writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`);
console.log(
  `Generated ${products.length} tagged product links using ${associateTag}.`,
);
