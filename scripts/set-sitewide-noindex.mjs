import fs from "node:fs";
import path from "node:path";

const pagesDir = "content/pages";
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".json"));

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

  json.noindex = true;

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");
  updatedCount++;
}

console.log(`Updated ${updatedCount} content files to noindex: true!`);
