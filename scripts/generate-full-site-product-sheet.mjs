import fs from "node:fs";
import path from "node:path";

const linksPath = "data/product-links.generated.json";
const pagesDir = "content/pages";
const catalogPath = "scripts/expand-max-products.mjs";
const csvPath = "data/product-import-template.csv";

const outputPath = "c:/Users/PC/Desktop/Affilate Work/countercrave-upload-tmp/countercrave-nextjs/countercrave-full-site-products.csv";
const artifactPath = "C:/Users/PC/.gemini/antigravity/brain/3b52eb5c-fbbe-4056-a417-94f9909f84f5/countercrave-full-site-products.csv";

const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));
const catalogRaw = fs.readFileSync(catalogPath, "utf8");

// Map catalog images
const catalogImages = {};
const catalogMatch = catalogRaw.match(/CATALOG\s*=\s*{([\s\S]*?)};\s*\n\s*const TARGET_PRODUCTS/);
if (catalogMatch) {
  const block = catalogMatch[1];
  const asinReg = /([A-Z0-9]{10}):\s*{[\s\S]*?imageUrl:\s*"([^"]+)"/g;
  let m;
  while ((m = asinReg.exec(block)) !== null) {
    catalogImages[m[1]] = m[2];
  }
}

// Map page canonical paths & titles
const pageInfo = {};
const pageFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".json"));
for (const f of pageFiles) {
  try {
    const page = JSON.parse(fs.readFileSync(path.join(pagesDir, f), "utf8"));
    if (page.pageId) {
      pageInfo[page.pageId] = {
        title: page.title || "",
        canonicalPath: page.canonicalPath || `/${page.slug}/`,
        slug: page.slug || "",
        cluster: page.cluster || "",
      };
    }
  } catch (e) {}
}

function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const headers = [
  "Page ID",
  "Page Title",
  "Page Path / URL",
  "Slot Rank",
  "ASIN",
  "Product Name",
  "Category / Cluster",
  "Current Image URL",
  "Amazon Affiliate Link (With Tag)",
  "Amazon Direct Link (Without Tag)",
  "Best For",
  "Short Verdict"
];

const rows = [headers.join(",")];
let count = 0;

for (const item of links) {
  if (!item.asin) continue;

  const page = pageInfo[item.pageId] || {};
  const asin = item.asin.trim().toUpperCase();
  const pageTitle = item.pageTitle || page.title || "";
  const pagePath = item.pageSlug ? `/${item.pageSlug}/` : page.canonicalPath || "";
  const fullPageUrl = `https://countercrave.com${pagePath.startsWith("/") ? "" : "/"}${pagePath}`;
  const slotRank = item.rank || item.slotId || "";
  const productName = item.productName || item.title || "";
  const category = page.cluster || item.cluster || "Kitchen & Home";
  const imageUrl = catalogImages[asin] || item.imageUrl || `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
  const affiliateUrl = item.affiliateUrl || item.url || `https://www.amazon.com/dp/${asin}?tag=visitbest07-20`;
  const directUrl = `https://www.amazon.com/dp/${asin}`;
  const bestFor = item.bestFor || "";
  const shortVerdict = item.shortVerdict || "";

  rows.push([
    escapeCsv(item.pageId),
    escapeCsv(pageTitle),
    escapeCsv(fullPageUrl),
    escapeCsv(slotRank),
    escapeCsv(asin),
    escapeCsv(productName),
    escapeCsv(category),
    escapeCsv(imageUrl),
    escapeCsv(affiliateUrl),
    escapeCsv(directUrl),
    escapeCsv(bestFor),
    escapeCsv(shortVerdict)
  ].join(","));

  count++;
}

const csvOutput = rows.join("\r\n");

fs.writeFileSync(outputPath, csvOutput, "utf8");
fs.writeFileSync(artifactPath, csvOutput, "utf8");

console.log(`Successfully generated full site product CSV with ${count} total product entries!`);
console.log(`Saved to workspace: ${outputPath}`);
console.log(`Saved to artifacts: ${artifactPath}`);
