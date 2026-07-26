/**
 * Wire AF-R27 Best Large Air Fryer.
 * Capacity-first ranking from sheet large-fit fields.
 *
 * Usage: node scripts/wire-large-air-fryers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "large-air-fryers.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R27";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0CGMFGX87: "Best overall large Chefman oven",
  B09B7SB46R: "Best XXL French-door Emeril",
  B0GC66KNNZ: "Best dual-zone 12 qt",
  B0BNDJN73L: "Best Gourmia 14 qt rotisserie",
  B0GTBN7CS2: "Best Chefman 14 qt multifunctional",
  B08DKYBTPH: "Best value Chefman 8 qt Hi-Fry",
  B0FZF445YL: "Best Chefman TurboFry 9 qt",
  B0D6NM91VZ: "Best Ninja DoubleStack XL",
  B0FJSDQRR8: "Best Philips dual basket large",
};

const PREFERRED = [
  "B0CGMFGX87",
  "B09B7SB46R",
  "B0GC66KNNZ",
  "B0BNDJN73L",
  "B0GTBN7CS2",
  "B0D1BGLW25",
  "B0GF9N8CKZ",
  "B08DKYBTPH",
  "B0FZF445YL",
  "B0D6NM91VZ",
  "B0FJSDQRR8",
  "B09MR7QWKZ",
  "B0C768SVRN",
  "B0BZ52FLKC",
  "B09K6MK5VN",
  "B0DZ9VFWYN",
  "B08DL8WH9V",
  "B0GVT7MWY4",
  "B07NLHMYH4",
  "B0FPP4RCV3",
  "B0D1GW9GMJ",
  "B0CS3V8M9H",
  "B0C33CHG99",
  "B07VHFMZHJ",
  "B07VM1FT8W",
  "B0936FGLQS",
  "B0CNY1YVDD",
  "B0CH3XC7NP",
  "B0D5NKX2HF",
];

function normalizeRating(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : "";
}

function normalizeReviews(value) {
  return String(value || "").trim().replace(/[^\d,]/g, "");
}

function normalizePrice(value) {
  const text = String(value || "").trim();
  if (!text || /unavailable|high price/i.test(text)) return "";
  if (text.startsWith("$")) return text;
  const num = text.replace(/[^\d.]/g, "");
  return num ? `$${num}` : "";
}

function imageOf(row) {
  const raw = String(row["Main Image URL"] || row.imageUrl || "").trim();
  if (!/^https:\/\/(m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\//.test(raw)) {
    return "";
  }
  if (raw.includes("images-na.ssl-images-amazon.com")) return raw;
  if (raw.includes("._AC_")) {
    return raw.replace(/\._AC_[A-Z0-9,]+_\./, "._AC_SL1500_.");
  }
  return raw.replace(/\.(jpg|jpeg|png)$/i, "._AC_SL1500_.$1");
}

function titleOf(row) {
  return String(row.Title || "")
    .split("|")[0]
    .trim();
}

function aboutOf(row) {
  return String(row["About this item"] || "")
    .split(/\s*\|\s*|\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part && !/see more product details/i.test(part))
    .slice(0, 8)
    .join(" | ");
}

function splitList(value) {
  return String(value || "")
    .split(/\s*\|\s*|\n+|;\s*/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseQt(row) {
  const text = `${row.Capacity || ""} ${row.Title || ""}`;
  const qt = text.match(/(\d+(?:\.\d+)?)\s*(?:qt|quart)/i);
  if (qt) return Number(qt[1]);
  const liter = text.match(/(\d+(?:\.\d+)?)\s*L\b/i);
  if (liter) return Number(liter[1]) * 1.06;
  return null;
}

function largeScore(row) {
  let score = Number(row["Comparison Score"]) || 0;
  const fit = String(row["Large-Capacity Fit"] || "");
  const servings = String(row["Estimated Servings"] || "");
  const qt = parseQt(row);
  if (/excellent/i.test(fit)) score += 20;
  else if (/very good/i.test(fit)) score += 14;
  else if (/^good$/i.test(fit.trim())) score += 8;
  else if (/limited/i.test(fit)) score -= 12;
  if (/8\+|party|6–8|6-8|5–7|5-7/i.test(servings)) score += 8;
  if (qt != null) {
    if (qt >= 12) score += 16;
    else if (qt >= 8) score += 12;
    else if (qt >= 6.5) score += 4;
    else score -= 10;
  }
  if (/dual|french.?door|doublestack|xl|rotisserie|oven/i.test(row.Title || "")) score += 4;
  return score;
}

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Estimated Servings"]) {
    parts.push(`Servings: ${String(row["Estimated Servings"]).slice(0, 50)}`);
  }
  if (row["Large-Capacity Fit"]) {
    parts.push(`Large fit: ${String(row["Large-Capacity Fit"]).slice(0, 50)}`);
  }
  if (row["Family Size Fit"]) {
    parts.push(`Family: ${String(row["Family Size Fit"]).slice(0, 50)}`);
  }
  if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const qt = parseQt(row);
  const isLarge = qt == null || qt >= 7.5 || /excellent|very good/i.test(row["Large-Capacity Fit"] || "");
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    (isLarge
      ? `${brand} shoppers needing a large-capacity air fryer for family meals`
      : `${brand} shoppers comparing mid-size vs true XL capacity`);
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (isLarge
      ? "You cook for a family or want fewer batches for big meals."
      : "You mainly want everyday capacity and will compare against larger picks.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    (isLarge
      ? "A compact fryer fits your counter and portion size better."
      : "True XL / dual-zone capacity is your main filter — pick larger ranked models.");
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const ls = largeScore(row);
  const score = Math.min(9.6, Math.max(7.0, 7.2 + ls / 40)).toFixed(1);

  let shortVerdict = about;
  if (row.Capacity || row["Large-Capacity Fit"]) {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — ${
      isLarge ? "large-capacity pick for family or party cooking" : "included as a mid-size capacity comparison"
    }. ${about ? about.slice(0, 140) : row["Estimated Servings"] || "Confirm footprint on Amazon before buying."}`;
  } else if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = `${brand} air fryer for larger batches. Confirm capacity and dimensions on the live Amazon page before buying.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          isLarge ? "Large capacity for fewer batches" : `${brand} mid-size comparison pick`,
          row.Capacity ? `${row.Capacity} capacity` : "Confirm capacity on Amazon",
          row["Estimated Servings"]
            ? String(row["Estimated Servings"]).slice(0, 50)
            : "Good for larger households when capacity fits",
        ],
    cons: cons.length
      ? cons
      : [
          isLarge ? "Needs more counter clearance than mini fryers" : "Not a true XL capacity pick",
          "Listing capacity and accessories can change",
        ],
    buyIf: buyIf.slice(0, 180),
    skipIf: skipIf.slice(0, 180),
    score,
  };
}

function orderedRows(rows) {
  const byAsin = Object.fromEntries(rows.map((r) => [r.ASIN, r]));
  const seen = new Set();
  const out = [];
  for (const asin of PREFERRED) {
    if (!asin || seen.has(asin) || !byAsin[asin]) continue;
    seen.add(asin);
    out.push(byAsin[asin]);
  }
  const rest = rows
    .filter((r) => r.ASIN && !seen.has(r.ASIN))
    .sort((a, b) => largeScore(b) - largeScore(a));
  return [...out, ...rest];
}

const rows = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
let catalog = parseCsv(fs.readFileSync(csvPath, "utf8"));
const baseHeaders = Object.keys(catalog[0] || {});
const headers = [
  ...baseHeaders.filter((h) => !EXTRA_COLS.includes(h) && h !== "notes"),
  ...EXTRA_COLS,
  "notes",
].filter((h, i, arr) => arr.indexOf(h) === i);

const existingImageByAsin = {};
for (const row of catalog) {
  if (row.asin && /^https:\/\/m\.media-amazon\.com\//.test(row.imageUrl || "")) {
    existingImageByAsin[row.asin] = row.imageUrl;
  }
}

catalog = catalog
  .filter((row) => row.pageId !== PAGE_ID)
  .map((row) => {
    const next = {};
    for (const header of headers) next[header] = row[header] ?? "";
    return next;
  });

let rank = 0;
for (const source of orderedRows(rows)) {
  const asin = source.ASIN;
  let image = imageOf(source) || existingImageByAsin[asin] || "";
  if (!image) {
    console.warn(`${PAGE_ID}: skip ${asin} (no image)`);
    continue;
  }
  rank += 1;
  const editorial = editorialFromRow(source);
  const slotLabel =
    LABELS[asin] || (rank === 1 ? "Best overall large air fryer" : `Pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Large Air Fryers",
    pageSlug: "best-large-air-fryer",
    pageType: "Roundup",
    slotId: `rank-${rank}`,
    slotLabel,
    rank: String(rank),
    productName: titleOf(source),
    asin,
    bestFor: editorial.bestFor,
    shortVerdict: editorial.shortVerdict,
    editorialScore: editorial.score,
    keySpecs: specsOf(source),
    aboutThisItem: aboutOf(source),
    pros: editorial.pros.join(" | "),
    cons: editorial.cons.join(" | "),
    imageUrl: image,
    imageWidth: "1500",
    imageHeight: "1500",
    imageAlt: titleOf(source),
    imageSource: "Amazon CDN",
    checkedAt: today,
    listPrice: normalizePrice(source.Price),
    amazonRating: normalizeRating(source.Rating),
    ratingCount: normalizeReviews(source["Rating Count"]),
    notes: `buyIf: ${editorial.buyIf} || skipIf: ${editorial.skipIf}`,
  });
}

fs.writeFileSync(csvPath, toCsv(catalog));
console.log(`${PAGE_ID}: wired ${rank} large air fryers. CSV total ${catalog.length}`);
