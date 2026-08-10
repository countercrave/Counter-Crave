import fs from "node:fs";

const linksPath = "data/product-links.generated.json";
const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));

const uniqueAsins = new Set();
const asinCounts = {};
const categoryCounts = {};

for (const item of links) {
  if (item.asin) {
    uniqueAsins.add(item.asin);
    asinCounts[item.asin] = (asinCounts[item.asin] || 0) + 1;
    
    const cat = item.cluster || item.pageId.split("-")[0] || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
}

console.log(`Total Product Slots Across All Articles: ${links.length}`);
console.log(`Total Unique Physical Product Models (ASINs): ${uniqueAsins.size}`);
console.log("\nCategory breakdown of product slots:");
console.log(JSON.stringify(categoryCounts, null, 2));
