/**
 * Wire AF-R25 Best Air Fryer for Chicken Breast.
 * Batch / chicken-breast-fit ranking from sheet fields.
 *
 * Usage: node scripts/wire-air-fryer-chicken-breast.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "air-fryer-chicken-breast.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R25";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0C33CHG99: "Best overall for chicken breast",
  B0CNY1YVDD: "Best value Chefman 6 qt",
  B08DKYBTPH: "Best meal-prep Hi-Fry XL",
  B0CSZ7WBYW: "Best for couples Ninja Pro",
  B0FJSDQRR8: "Best dual-basket Philips",
  B07S76WBGF: "Best grill-style Foodi",
  B07VHFMZHJ: "Best Instant Vortex Plus",
  B0CS3V8M9H: "Best Ninja MaxCrisp XL",
};

const PREFERRED = [
  "B0C33CHG99",
  "B0CNY1YVDD",
  "B07VHFMZHJ",
  "B0CSZ7WBYW",
  "B08DKYBTPH",
  "B09BZVP4VW",
  "B0G36T6J5V",
  "B0FH32D8HQ",
  "B0BYF8PT3L",
  "B0CS3V8M9H",
  "B0D5NR7JPS",
  "B0D5NKX2HF",
  "B0DDDD8WD6",
  "B0H2N44S2R",
  "B0FZWZ545Y",
  "B0H4LW7WKK",
  "B08DL8WH9V",
  "B0FJSDQRR8",
  "B07S76WBGF",
  "B0CZS6SS3Y",
  "B0FPPP568C",
  "B0GTBN7CS2",
  "B0BDFRZX3F",
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

function breastScore(row) {
  let score = Number(row["Chicken Breast Comparison Score"]) || Number(row["Comparison Score"]) || 0;
  const fit = String(row["Chicken Breast Fit"] || "");
  const batch = String(row["Estimated Chicken Breasts per Batch"] || "");
  const feats = String(row["Chicken-Specific Useful Features"] || "");
  if (/meal prep|even browning|single.?layer|juicy|weeknight/i.test(fit)) score += 12;
  if (/probe|thermometer|hi-fry|maxcrisp|grill|dual/i.test(`${feats} ${row.Title || ""}`)) score += 8;
  if (/4–5|4-5|3–5|3-5|5\+|meal/i.test(batch)) score += 8;
  if (/2–3|2-3|1–2|1-2/i.test(batch)) score += 4;
  if (/2\.1|lite|personal|mini/i.test(row.Title || "") && /1–2|1-2|1 breast/i.test(batch)) score -= 4;
  return score;
}

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Estimated Chicken Breasts per Batch"]) {
    parts.push(`Breasts/batch: ${String(row["Estimated Chicken Breasts per Batch"]).slice(0, 60)}`);
  }
  if (row["Chicken Breast Fit"]) {
    parts.push(`Fit: ${String(row["Chicken Breast Fit"]).slice(0, 70)}`);
  }
  if (row["Max Listed Temperature"]) {
    parts.push(`Max temp: ${row["Max Listed Temperature"]}`);
  }
  if (row["Chicken-Specific Useful Features"]) {
    parts.push(`Features: ${String(row["Chicken-Specific Useful Features"]).slice(0, 70)}`);
  }
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const fit = String(row["Chicken Breast Fit"] || "").trim();
  const batch = String(row["Estimated Chicken Breasts per Batch"] || "").trim();
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    `${brand} shoppers cooking juicy chicken breast in an air fryer`;
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (batch
      ? `You want capacity for about ${batch.replace(/\.$/, "")}.`
      : "You want even, weeknight chicken breast without a skillet.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    "Another ranked pick fits your batch size or counter space better.";
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const bs = breastScore(row);
  const score = Math.min(9.6, Math.max(7.2, 7.4 + bs / 45)).toFixed(1);

  let shortVerdict = about;
  if (fit || batch) {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — ${fit || "practical for chicken breast"}${batch ? `. Est. ${batch}` : ""}. ${about ? about.slice(0, 130) : "Use a thermometer for doneness — thickness varies."}`;
  } else if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = `${brand} air fryer for everyday chicken breast. Confirm capacity on Amazon and cook to a safe internal temperature.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          fit ? fit.slice(0, 60) : `${brand} air fryer for chicken breast`,
          batch ? `Batch: ${batch.slice(0, 50)}` : row.Capacity || "Confirm capacity on Amazon",
          "Faster weeknight protein than oven preheat",
        ],
    cons: cons.length
      ? cons
      : [
          "Overcrowding causes uneven cooking — use one layer when possible",
          "Presets are guides — verify with a food thermometer",
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
    .sort((a, b) => breastScore(b) - breastScore(a));
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
    LABELS[asin] || (rank === 1 ? "Best overall for chicken breast" : `Pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Air Fryers for Chicken Breast",
    pageSlug: "best-air-fryer-for-chicken-breast",
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
console.log(`${PAGE_ID}: wired ${rank} chicken-breast air fryers. CSV total ${catalog.length}`);
