import fs from "node:fs";
import path from "node:path";

const file = path.join(
  process.cwd(),
  "data",
  "product-links.generated.json",
);
const tag =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "visitbest07-20";
const validTags = new Set([tag, "visitbest07-20"]);
const products = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];

for (const product of products) {
  if (!/^[A-Z0-9]{10}$/.test(product.asin)) {
    errors.push(`${product.trackingKey}: invalid ASIN`);
  }

  const url = new URL(product.affiliateUrl);
  if (url.hostname !== "www.amazon.com") {
    errors.push(`${product.trackingKey}: unexpected Amazon hostname`);
  }
  if (!validTags.has(url.searchParams.get("tag") || "")) {
    errors.push(`${product.trackingKey}: missing or wrong Associate tag`);
  }

  if (product.imageUrl) {
    const imageUrl = new URL(product.imageUrl);
    if (
      ![
        "m.media-amazon.com",
        "images-na.ssl-images-amazon.com",
      ].includes(imageUrl.hostname)
    ) {
      errors.push(`${product.trackingKey}: unapproved image host`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${products.length} generated product links.`);
