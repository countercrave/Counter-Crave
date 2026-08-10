import fs from "node:fs";

const catalogPath = "scripts/expand-max-products.mjs";
const csvPath = "data/product-import-template.csv";

function cleanString(str) {
  return str.replace(/https:\/\/[^\s"',]+/g, (url) => {
    return url.replace(/\.\./g, ".").replace(/\._\./g, ".");
  });
}

let catalog = fs.readFileSync(catalogPath, "utf8");
let csv = fs.readFileSync(csvPath, "utf8");

catalog = cleanString(catalog);
csv = cleanString(csv);

fs.writeFileSync(catalogPath, catalog, "utf8");
fs.writeFileSync(csvPath, csv, "utf8");

console.log("Completely cleaned all invalid double-dot URLs in CATALOG and CSV!");
