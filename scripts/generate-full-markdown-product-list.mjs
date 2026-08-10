import fs from "node:fs";

const catalogPath = "scripts/expand-max-products.mjs";
const linksPath = "data/product-links.generated.json";
const csvPath = "data/product-import-template.csv";
const artifactPath = "C:/Users/PC/.gemini/antigravity/brain/3b52eb5c-fbbe-4056-a417-94f9909f84f5/full_product_list.md";

const catalogRaw = fs.readFileSync(catalogPath, "utf8");
const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));
const csvRaw = fs.readFileSync(csvPath, "utf8");

const catalogEntries = {};

const asinReg = /([A-Z0-9]{10}):\s*{\s*name:\s*"([^"]+)"[\s\S]*?cluster:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"/g;
let m;
while ((m = asinReg.exec(catalogRaw)) !== null) {
  catalogEntries[m[1]] = {
    asin: m[1],
    name: m[2],
    cluster: m[3],
    imageUrl: m[4],
  };
}

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

const sortedAsins = Array.from(allAsins).sort();

const lines = [
  "# CounterCrave Full Product Catalog (111 Products)",
  "",
  "Below is the complete, clickable list of all **111 unique products** currently published on CounterCrave.",
  "",
  "- 📥 **[Download CSV Sheet (Workspace Root)](file:///c:/Users/PC/Desktop/Affilate%20Work/countercrave-upload-tmp/countercrave-nextjs/countercrave-all-products.csv)**",
  "- 📥 **[Download CSV Sheet (Artifacts)](file:///C:/Users/PC/.gemini/antigravity/brain/3b52eb5c-fbbe-4056-a417-94f9909f84f5/countercrave-all-products.csv)**",
  "",
  "| # | ASIN | Product Name & Amazon Link | Category | Current Image URL | Image Preview |",
  "| :--- | :--- | :--- | :--- | :--- | :--- |"
];

sortedAsins.forEach((asin, idx) => {
  const cat = catalogEntries[asin] || {};
  const linkData = links[asin] || {};
  const csvData = csvProducts[asin] || {};

  const name = cat.name || linkData.title || csvData.name || asin;
  const cluster = cat.cluster || "Kitchen & Home";
  const imageUrl = cat.imageUrl || csvData.imageUrl || `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
  const affiliateUrl = linkData.url || `https://www.amazon.com/dp/${asin}?tag=visitbest07-20`;

  lines.push(`| ${idx + 1} | \`${asin}\` | [${name.replace(/\|/g, "-")}](${affiliateUrl}) | ${cluster} | [Image Link](${imageUrl}) | <img src="${imageUrl}" width="60" height="60" style="object-fit:contain" alt="${name}" /> |`);
});

fs.writeFileSync(artifactPath, lines.join("\n"), "utf8");
console.log(`Generated full_product_list.md with ${sortedAsins.length} products!`);
