import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const pageDir = path.join(root, "content", "pages");
const staticDir = path.join(root, "content", "static");

const pageFiles = fs.readdirSync(pageDir).filter((f) => f.endsWith(".json"));
const staticFiles = fs.readdirSync(staticDir).filter((f) => f.endsWith(".json"));

const allPages = [];
for (const f of pageFiles) {
  const p = JSON.parse(fs.readFileSync(path.join(pageDir, f), "utf8"));
  allPages.push({ ...p, sourceFile: f });
}
for (const f of staticFiles) {
  const p = JSON.parse(fs.readFileSync(path.join(staticDir, f), "utf8"));
  allPages.push({ ...p, sourceFile: f });
}

const publishedPages = allPages.filter((p) => !p.draft);
console.log(`Auditing ${publishedPages.length} published pages (${allPages.length} total)...`);

const auditResults = {
  duplicateTitles: [],
  duplicateSlugs: [],
  duplicateDescriptions: [],
  duplicateCanonicalPaths: [],
  missingSummaries: [],
  missingAuthors: [],
  duplicateSectionText: [],
  brokenLinks: [],
  seoWarnings: [],
};

// 1. Check uniqueness of Slugs, Titles, Canonicals, Descriptions
const titles = new Map();
const slugs = new Map();
const canonicals = new Map();
const descriptions = new Map();

for (const p of publishedPages) {
  // Title
  if (titles.has(p.title)) {
    auditResults.duplicateTitles.push({
      title: p.title,
      files: [titles.get(p.title), p.sourceFile],
    });
  } else {
    titles.set(p.title, p.sourceFile);
  }

  // Slug
  const cleanSlug = p.slug.replace(/^\/|\/$/g, "");
  if (slugs.has(cleanSlug)) {
    auditResults.duplicateSlugs.push({
      slug: cleanSlug,
      files: [slugs.get(cleanSlug), p.sourceFile],
    });
  } else {
    slugs.set(cleanSlug, p.sourceFile);
  }

  // Canonical Path
  if (canonicals.has(p.canonicalPath)) {
    auditResults.duplicateCanonicalPaths.push({
      canonical: p.canonicalPath,
      files: [canonicals.get(p.canonicalPath), p.sourceFile],
    });
  } else {
    canonicals.set(p.canonicalPath, p.sourceFile);
  }

  // Description
  if (descriptions.has(p.description)) {
    auditResults.duplicateDescriptions.push({
      description: p.description,
      files: [descriptions.get(p.description), p.sourceFile],
    });
  } else {
    descriptions.set(p.description, p.sourceFile);
  }

  // E-E-A-T checks
  if (!p.summary || p.summary.length < 30) {
    auditResults.missingSummaries.push(p.sourceFile);
  }
  if (!p.author) {
    auditResults.missingAuthors.push(p.sourceFile);
  }

  // Check section duplicate writeups
  const sectionText = JSON.stringify(p.sections || []);
  if (/best overall|runner-up|buy if:|skip if:/i.test(sectionText) && p.pageType !== "Hub" && p.pageType !== "Static") {
    // Check if sections contain product headings duplicating ProductCards
    for (const sec of p.sections || []) {
      if (/^\d+\.\s*(best|runner|pick|rank)/i.test(sec.heading || "")) {
        auditResults.duplicateSectionText.push({ file: p.sourceFile, heading: sec.heading });
      }
    }
  }
}

// 2. Audit Internal Links for 404s
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
  "icon.png",
  "apple-icon.png",
  "favicon.png",
  "logo.png",
]);

for (const p of publishedPages) {
  validRoutes.add(p.slug.replace(/^\/|\/$/g, ""));
}

const ignoreTargets = new Set([
  "images", "heroes", "bake", "roast", "reheat", "dehydrate", "air-fry", "fry", "cook", "clean", "pro", "con", "spec"
]);

for (const p of publishedPages) {
  const contentStr = JSON.stringify(p);
  const matches = contentStr.match(/href=\\"\/([^\\"]+)\\"/gi) || [];
  for (const m of matches) {
    const clean = m
      .replace(/^href=\\"\/|^\//i, "")
      .replace(/\/\\"|\\"|\/$/gi, "")
      .replace(/\/$/, "")
      .toLowerCase();
    if (
      clean &&
      !clean.startsWith("http") &&
      !clean.startsWith("#") &&
      !clean.includes("?") &&
      !clean.includes(".jpg") &&
      !clean.includes(".png") &&
      !clean.includes(".svg") &&
      !ignoreTargets.has(clean) &&
      !validRoutes.has(clean)
    ) {
      auditResults.brokenLinks.push({ file: p.sourceFile, target: clean });
    }
  }
}

console.log("=== FULL SITE AUDIT REPORT ===");
console.log(`1. Duplicate Titles: ${auditResults.duplicateTitles.length}`);
console.log(`2. Duplicate Slugs: ${auditResults.duplicateSlugs.length}`);
console.log(`3. Duplicate Canonical Paths: ${auditResults.duplicateCanonicalPaths.length}`);
console.log(`4. Duplicate Meta Descriptions: ${auditResults.duplicateDescriptions.length}`);
console.log(`5. Missing Page Summaries: ${auditResults.missingSummaries.length}`);
console.log(`6. Missing E-E-A-T Authors: ${auditResults.missingAuthors.length}`);
console.log(`7. Duplicate Product Section Headings: ${auditResults.duplicateSectionText.length}`);
console.log(`8. Broken 404 Internal Links: ${auditResults.brokenLinks.length}`);

if (auditResults.duplicateTitles.length > 0) console.log("Duplicate Titles:", auditResults.duplicateTitles);
if (auditResults.duplicateSlugs.length > 0) console.log("Duplicate Slugs:", auditResults.duplicateSlugs);
if (auditResults.duplicateCanonicalPaths.length > 0) console.log("Duplicate Canonicals:", auditResults.duplicateCanonicalPaths);
if (auditResults.duplicateDescriptions.length > 0) console.log("Duplicate Descriptions Sample:", auditResults.duplicateDescriptions.slice(0, 5));
if (auditResults.duplicateSectionText.length > 0) console.log("Duplicate Section Headings Sample:", auditResults.duplicateSectionText.slice(0, 5));
if (auditResults.brokenLinks.length > 0) console.log("Broken Links Sample:", auditResults.brokenLinks.slice(0, 5));
