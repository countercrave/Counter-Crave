import fs from "node:fs";

const fixedMap = JSON.parse(
  fs.readFileSync("data/fixed-images-map.json", "utf8")
);

// Read expand-max-products.mjs
let catalogContent = fs.readFileSync("scripts/expand-max-products.mjs", "utf8");

let replacedCount = 0;

for (const [asin, imageUrl] of Object.entries(fixedMap)) {
  // Regex to match CATALOG[asin].imageUrl
  const reg = new RegExp(`(${asin}:\\s*{[\\s\\S]*?imageUrl:\\s*")[^"]+(")`, "g");
  if (reg.test(catalogContent)) {
    catalogContent = catalogContent.replace(reg, `$1${imageUrl}$2`);
    replacedCount++;
    console.log(`[CATALOG UPDATED] ${asin} -> ${imageUrl}`);
  }
}

console.log(`Updated ${replacedCount} CATALOG entries in scripts/expand-max-products.mjs`);
fs.writeFileSync("scripts/expand-max-products.mjs", catalogContent);
