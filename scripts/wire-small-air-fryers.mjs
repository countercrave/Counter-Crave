/**
 * Wire AF-R24 Best Small Air Fryer.
 * Size-first ranking using sheet capacity / size class.
 *
 * Usage: node scripts/wire-small-air-fryers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "small-air-fryers.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R24";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0BDFRZX3F: "Best overall small Cosori Lite",
  B0815KPZVB: "Best Dash Tasti-Crisp value",
  B077W6TX88: "Best Dash compact 2 qt",
  B08R6KMBQT: "Best Instant Vortex Mini 4 qt",
  B07FDJMC9Q: "Best Ninja 4 qt classic",
  B0CYJDVT31: "Best slim 4 qt Bella",
  B0D98WLVTB: "Best Cuisinart compact",
  B0D86FNKDK: "Best COMFEE’ mini budget",
  B0936FGLQS: "Best step-up Cosori 5 qt",
};

const PREFERRED = [
  "B0BDFRZX3F",
  "B0815KPZVB",
  "B077W6TX88",
  "B0D98WLVTB",
  "B0D86FNKDK",
  "B08R6KMBQT",
  "B07FDJMC9Q",
  "B0CYJDVT31",
  "B0D384TSVC",
  "B08QQRH2Z9",
  "B07XYRKXHT",
  "B0F9B4YCZF",
  "B0F9B3ZV61",
  "B0D5FRXYMJ",
  "B07RRYKJH6",
  "B08FTLBL29",
  "B0GY6C7XXF",
  "B0GVPTLQYY",
  "B0936FGLQS",
  "B0CSZ7WBYW",
  "B0H2N44S2R",
  "B0F564YSJY",
  "B0C33CHG99",
  "B07VHFMZHJ",
  "B0D1KXH4K7",
  "B0FJSDSZJ6",
  "B08DKYBTPH",
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
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:qt|quart)/i);
  return match ? Number(match[1]) : null;
}

function sizeScore(row) {
  let score = Number(row["Comparison Score"]) || 0;
  const qt = parseQt(row);
  const sizeClass = String(row["Size Class"] || "").toLowerCase();
  if (/personal|mini|compact|small|slim/i.test(sizeClass)) score += 12;
  if (qt != null) {
    if (qt <= 2.6) score += 22;
    else if (qt <= 4) score += 14;
    else if (qt <= 5.5) score += 4;
    else score -= 12;
  }
  if (/lite|tasti-?crisp|compact|mini|slim|personal|2\.?1|2\.?6/i.test(row.Title || "")) {
    score += 6;
  }
  return score;
}

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Size Class"]) parts.push(`Size: ${row["Size Class"]}`);
  if (row["Estimated Servings"]) {
    parts.push(`Servings: ${String(row["Estimated Servings"]).slice(0, 50)}`);
  }
  if (row.Footprint) parts.push(`Footprint: ${String(row.Footprint).slice(0, 50)}`);
  if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
  if (row["Cooking Functions"]) {
    parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 70)}`);
  }
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const qt = parseQt(row);
  const isTrulySmall = qt != null && qt <= 4.2;
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    (isTrulySmall
      ? `${brand} shoppers needing a compact air fryer for 1–2 people`
      : `${brand} shoppers comparing small vs mid-size capacity`);
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (isTrulySmall
      ? "You want a compact footprint for dorms, RVs, or tight counters."
      : "You need more basket space than a mini and will accept a larger footprint.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    (isTrulySmall
      ? "You regularly cook family-size batches — look at larger comparison picks."
      : "A true 2–4 qt mini fits your kitchen better.");
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const ss = sizeScore(row);
  const score = Math.min(9.6, Math.max(7.0, 7.3 + ss / 40)).toFixed(1);

  let shortVerdict = about;
  if (row.Capacity || row["Size Class"]) {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — ${
      isTrulySmall
        ? "a compact pick for small kitchens and 1–2 servings"
        : "included as a capacity step-up vs true mini fryers"
    }. ${about ? about.slice(0, 150) : "Confirm footprint and servings on Amazon before buying."}`;
  } else if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = `${brand} air fryer for smaller kitchens. Confirm capacity and dimensions on the live Amazon page before buying.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          isTrulySmall ? "Compact footprint for tight counters" : `${brand} mid-size comparison pick`,
          row.Capacity ? `${row.Capacity} capacity` : "Confirm capacity on Amazon",
          row["Estimated Servings"]
            ? String(row["Estimated Servings"]).slice(0, 50)
            : "Good for smaller batches",
        ],
    cons: cons.length
      ? cons
      : [
          isTrulySmall
            ? "Not ideal for large family batches"
            : "Larger than a true mini — check counter space",
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
    .sort((a, b) => sizeScore(b) - sizeScore(a));
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
    LABELS[asin] || (rank === 1 ? "Best overall small air fryer" : `Pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Small Air Fryers",
    pageSlug: "best-small-air-fryer",
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
console.log(`${PAGE_ID}: wired ${rank} small air fryers. CSV total ${catalog.length}`);
