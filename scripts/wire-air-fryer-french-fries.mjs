/**
 * Wire AF-R17 Best Air Fryer for French Fries.
 * Fry-batch / crisp-fit ranking from sheet fields.
 *
 * Usage: node scripts/wire-air-fryer-french-fries.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "air-fryer-french-fries.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R17";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0936FGLQS: "Best overall Cosori for fries",
  B0C33CHG99: "Best TurboBlaze crispy fries",
  B08DKYBTPH: "Best Chefman Hi-Fry XL",
  B089TQWJKK: "Best DualZone for fry batches",
  B0FWTG4DJP: "Best Chefman TurboFry 9 qt",
  B0CH3XC7NP: "Best compact Gourmia",
  B0CSZ7WBYW: "Best Ninja Pro 5 qt",
  B0BDFRZX3F: "Best mini for snack fries",
};

const PREFERRED = [
  "B0936FGLQS",
  "B0C33CHG99",
  "B08DKYBTPH",
  "B089TQWJKK",
  "B0FWTG4DJP",
  "B0CH3XC7NP",
  "B0CSZ7WBYW",
  "B09BZVP4VW",
  "B0FH32D8HQ",
  "B0G36T6J5V",
  "B0CNY1YVDD",
  "B09MR49K1D",
  "B07VHFMZHJ",
  "B0FB13MRPY",
  "B0DZ9VFWYN",
  "B0D5NR7JPS",
  "B0D5NKX2HF",
  "B0BYF8PT3L",
  "B0FSZVSPJL",
  "B0BDFRZX3F",
  "B0H376TY2J",
  "B0H4LW7WKK",
  "B0FZWZ545Y",
  "B0DD3QTMV5",
  "B09B7SB46R",
  "B0CNXYKXZP",
  "B0FP4PDD8V",
  "B0FM5KF34G",
  "B0GY7NWYJB",
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

function fryScore(row) {
  let score = Number(row["Comparison Score"]) || 0;
  const fit = String(row["French Fry Cooking Fit"] || "");
  const batch = String(row["Estimated Fry Batch"] || "");
  if (/extra-?crispy|hi-fry|maxcrisp|fryforce|crispy fries|fast/i.test(fit)) score += 18;
  if (/dual.?zone|two baskets|family|large batch/i.test(fit)) score += 10;
  if (/large|family|2–3|2-3|3–4|3-4/i.test(batch)) score += 8;
  if (/medium|1\.5|1-2|1–2/i.test(batch)) score += 4;
  if (/dualzone|hi-fry|turboblaze|fryforce|turbofry/i.test(row.Title || "")) score += 6;
  return score;
}

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Estimated Fry Batch"]) {
    parts.push(`Fries: ${String(row["Estimated Fry Batch"]).slice(0, 70)}`);
  }
  if (row["French Fry Cooking Fit"]) {
    parts.push(`Fit: ${String(row["French Fry Cooking Fit"]).slice(0, 70)}`);
  }
  if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
  if (row["Cooking Functions"]) {
    parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 70)}`);
  }
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const fit = String(row["French Fry Cooking Fit"] || "").trim();
  const batch = String(row["Estimated Fry Batch"] || "").trim();
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    `${brand} shoppers making crispy french fries at home`;
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (batch
      ? `You want an air fryer sized for ${batch.replace(/\.$/, "")}.`
      : "You want crispy fries with less oil than deep frying.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    "Another ranked pick fits your fry batch size or counter space better.";
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const fsScore = fryScore(row);
  const score = Math.min(9.6, Math.max(7.2, 7.4 + fsScore / 45)).toFixed(1);

  let shortVerdict = about;
  if (fit || batch) {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — ${fit || "practical for french fries"}${batch ? `. Est. ${batch}` : ""}. ${about ? about.slice(0, 140) : "Shake halfway for even browning."}`;
  } else if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = `${brand} air fryer for everyday crispy fries. Confirm capacity and presets on the live Amazon page before buying.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          fit ? fit.slice(0, 60) : `${brand} air fryer for fries`,
          batch ? batch.slice(0, 60) : row.Capacity || "Confirm capacity on Amazon",
          "Crispier snack fries with less oil",
        ],
    cons: cons.length
      ? cons
      : ["Overcrowding softens fries — cook in batches if needed", "Listing capacity and presets can change"],
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
    .sort((a, b) => fryScore(b) - fryScore(a));
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
    LABELS[asin] || (rank === 1 ? "Best overall for french fries" : `Pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Air Fryers for French Fries",
    pageSlug: "best-air-fryer-for-french-fries",
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
console.log(`${PAGE_ID}: wired ${rank} french-fry air fryers. CSV total ${catalog.length}`);
