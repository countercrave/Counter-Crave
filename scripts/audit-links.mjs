import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// 1. Collect all valid published routes
const validRoutes = new Set([
  "",
  "about",
  "affiliate-disclosure",
  "contact",
  "content-plan",
  "privacy",
  "terms",
  "search",
  "llms.txt",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "icon.svg",
]);

// Add category hub routes
const categories = [
  "air-fryers",
  "blenders",
  "toaster-ovens",
  "food-processors",
  "mini-choppers",
  "rice-cookers",
  "electric-kettles",
  "coffee-grinders",
  "waffle-makers",
];
for (const cat of categories) {
  validRoutes.add(cat);
}

const pageDir = path.join(root, "content", "pages");
const staticDir = path.join(root, "content", "static");

const pageFiles = fs.readdirSync(pageDir).filter((f) => f.endsWith(".json"));
const staticFiles = fs.readdirSync(staticDir).filter((f) => f.endsWith(".json"));

for (const f of pageFiles) {
  const p = JSON.parse(fs.readFileSync(path.join(pageDir, f), "utf8"));
  if (!p.draft) {
    const slug = (p.slug || "").replace(/^\/|\/$/g, "");
    validRoutes.add(slug);
  }
}

for (const f of staticFiles) {
  const p = JSON.parse(fs.readFileSync(path.join(staticDir, f), "utf8"));
  if (!p.draft) {
    const slug = (p.slug || "").replace(/^\/|\/$/g, "");
    validRoutes.add(slug);
  }
}

console.log(`Total valid published routes: ${validRoutes.size}`);

// 2. Audit all published page contents for broken links
const brokenLinks = [];
let totalLinksChecked = 0;

for (const f of pageFiles) {
  const fullPath = path.join(pageDir, f);
  const rawStr = fs.readFileSync(fullPath, "utf8");
  const p = JSON.parse(rawStr);
  if (p.draft) continue;

  const matches = rawStr.match(/href=["']\/([^"']+)["']/gi) || [];
  for (const m of matches) {
    totalLinksChecked += 1;
    const clean = m
      .replace(/^href=["']\//i, "")
      .replace(/["']$/i, "")
      .replace(/^\/|\/$/g, "")
      .toLowerCase();

    if (
      clean &&
      !clean.startsWith("http") &&
      !clean.startsWith("#") &&
      !clean.includes("?") &&
      !clean.includes(".jpg") &&
      !clean.includes(".png") &&
      !clean.includes(".svg") &&
      !validRoutes.has(clean)
    ) {
      brokenLinks.push({ file: f, target: clean });
    }
  }
}

console.log(`Checked ${totalLinksChecked} internal link references.`);
console.log(`Found ${brokenLinks.length} broken links to drafted or non-existent pages.`);

if (brokenLinks.length > 0) {
  console.log("Sample broken links:", brokenLinks.slice(0, 20));
} else {
  console.log("SUCCESS: 0 404 / broken links found across published pages!");
}
