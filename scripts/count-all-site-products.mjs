import fs from "node:fs";
import path from "node:path";

const pagesDir = "content/pages";
const linksPath = "data/product-links.generated.json";
const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith(".json"));
const uniqueAsinsInPages = new Set();
let totalSlotCount = 0;

for (const file of files) {
  const p = JSON.parse(fs.readFileSync(path.join(pagesDir, file), "utf8"));
  if (p.productPageIds) {
    for (const pid of p.productPageIds) {
      // Find entries in product-links.generated.json or CSV
      for (const [asin, data] of Object.entries(links)) {
        if (data.url && !isNaN(Number(asin))) {
          // Ignore legacy numeric indexes
          continue;
        }
        if (data.pageId === pid || asin.length === 10) {
          uniqueAsinsInPages.add(asin);
          totalSlotCount++;
        }
      }
    }
  }
}

console.log(`Total Content Files: ${files.length}`);
console.log(`Total Generated Product Links in product-links.generated.json: ${Object.keys(links).length}`);
console.log(`Unique ASINs: ${Object.keys(links).filter(k => k.length === 10 && isNaN(Number(k))).length}`);
