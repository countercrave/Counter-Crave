import fs from "node:fs";

const csvPath = "c:/Users/PC/Desktop/Affilate Work/countercrave-upload-tmp/countercrave-nextjs/countercrave-full-site-products.csv";
const csvRaw = fs.readFileSync(csvPath, "utf8");

const lines = csvRaw.split("\r\n").filter(Boolean);
const headers = lines[0].split(",");

const uniqueAsinMap = {};

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  if (parts.length >= 10) {
    const asin = parts[4]?.replace(/^"|"$/g, "").trim();
    const name = parts[5]?.replace(/^"|"$/g, "").trim();
    const category = parts[6]?.replace(/^"|"$/g, "").trim();
    const imageUrl = parts[7]?.replace(/^"|"$/g, "").trim();
    const affiliateUrl = parts[8]?.replace(/^"|"$/g, "").trim();
    const directUrl = parts[9]?.replace(/^"|"$/g, "").trim();

    if (asin && /^[A-Z0-9]{10}$/i.test(asin) && !uniqueAsinMap[asin]) {
      uniqueAsinMap[asin] = {
        asin,
        name,
        category,
        imageUrl,
        affiliateUrl,
        directUrl,
      };
    }
  }
}

const uniqueList = Object.values(uniqueAsinMap);
console.log(`Total Unique Product ASIN URLs: ${uniqueList.length}`);

// Category breakdown
const catCounts = {};
for (const p of uniqueList) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}

console.log("\nUnique ASINs by Category:");
console.log(JSON.stringify(catCounts, null, 2));
