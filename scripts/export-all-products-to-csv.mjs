import fs from "node:fs";

const catalogPath = "scripts/expand-max-products.mjs";
const linksPath = "data/product-links.generated.json";
const csvPath = "data/product-import-template.csv";
const outputPath = "c:/Users/PC/Desktop/Affilate Work/countercrave-upload-tmp/countercrave-nextjs/countercrave-all-products.csv";
const artifactPath = "C:/Users/PC/.gemini/antigravity/brain/3b52eb5c-fbbe-4056-a417-94f9909f84f5/countercrave-all-products.csv";

const catalogRaw = fs.readFileSync(catalogPath, "utf8");
const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));
const csvRaw = fs.readFileSync(csvPath, "utf8");

const catalogEntries = {};

// Regex match for ASIN blocks in expand-max-products.mjs
const asinReg = /([A-Z0-9]{10}):\s*{\s*name:\s*"([^"]+)"[\s\S]*?cluster:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"/g;
let m;
while ((m = asinReg.exec(catalogRaw)) !== null) {
  const asin = m[1];
  catalogEntries[asin] = {
    asin: m[1],
    name: m[2],
    cluster: m[3],
    imageUrl: m[4],
  };
}

// Parse CSV rows
const csvLines = csvRaw.split("\n").filter(Boolean);
const csvProducts = {};

for (let i = 1; i < csvLines.length; i++) {
  const parts = csvLines[i].split(",");
  if (parts.length >= 4) {
    const asin = parts[1]?.trim();
    if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
      csvProducts[asin] = {
        pageId: parts[0]?.trim(),
        asin: asin,
        name: parts[2]?.trim().replace(/^"|"$/g, ""),
        imageUrl: parts[3]?.trim(),
      };
    }
  }
}

// Filter for valid 10-character Amazon ASINs only (starting with B or numbers, but 10 alphanumeric chars)
const allAsins = new Set();

for (const k of Object.keys(catalogEntries)) {
  if (/^[A-Z0-9]{10}$/i.test(k)) allAsins.add(k.toUpperCase());
}
for (const k of Object.keys(csvProducts)) {
  if (/^[A-Z0-9]{10}$/i.test(k)) allAsins.add(k.toUpperCase());
}
for (const k of Object.keys(links)) {
  if (/^[A-Z0-9]{10}$/i.test(k) && isNaN(Number(k))) allAsins.add(k.toUpperCase());
}

function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const header = ["ASIN", "Product Name", "Category / Cluster", "Image URL", "Amazon Affiliate URL"];
const rows = [header.join(",")];

const sortedAsins = Array.from(allAsins).sort();

for (const asin of sortedAsins) {
  const cat = catalogEntries[asin] || {};
  const linkData = links[asin] || {};
  const csvData = csvProducts[asin] || {};

  const name = cat.name || linkData.title || csvData.name || asin;
  const cluster = cat.cluster || "Kitchen & Home";
  const imageUrl = cat.imageUrl || csvData.imageUrl || `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
  const affiliateUrl = linkData.url || `https://www.amazon.com/dp/${asin}?tag=visitbest07-20`;

  rows.push([
    escapeCsv(asin),
    escapeCsv(name),
    escapeCsv(cluster),
    escapeCsv(imageUrl),
    escapeCsv(affiliateUrl),
  ].join(","));
}

const csvOutput = rows.join("\r\n");

fs.writeFileSync(outputPath, csvOutput, "utf8");
fs.writeFileSync(artifactPath, csvOutput, "utf8");

console.log(`Successfully exported ${sortedAsins.length} valid product ASINs to CSV sheet!`);
