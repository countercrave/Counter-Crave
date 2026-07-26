/**
 * Wire AF-R22 Best Air Fryers 2026 from air-fryers-2026.source.json.
 * Uses sheet editorial fields when present. Keeps ALL products with images.
 * No deploy — content upload only.
 *
 * Usage: node scripts/wire-air-fryers-2026.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "air-fryers-2026.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R22";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0C33CHG99: "Best overall 2026",
  B089TQWJKK: "Best dual basket",
  B0CSZ7WBYW: "Best everyday Ninja",
  B07VHFMZHJ: "Best Instant Vortex Plus",
  B0BDFRZX3F: "Best compact / small kitchen",
  B08DKYBTPH: "Best XL value",
  B0CS3V8M9H: "Best MaxCrisp XL",
  B0CCS2TH8Q: "Best Cosori dual",
  B01N5UPTZS: "Best premium oven air fryer",
  B0DJFBDFZK: "Best glass Crispi",
};

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

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
  if (row["Cooking Functions"]) {
    parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 80)}`);
  }
  if (row.Footprint) parts.push(`Footprint: ${row.Footprint}`);
  if (row["Value Tier"]) parts.push(`Value tier: ${row["Value Tier"]}`);
  const feat = String(row["Features & Specs"] || "").trim();
  if (feat && !/not found|blocked/i.test(feat)) {
    for (const part of feat.split(/;|\|/)) {
      const trimmed = part.trim();
      if (!trimmed || parts.length >= 6) continue;
      if (/^[^:]{2,40}:\s*.+/.test(trimmed)) parts.push(trimmed);
    }
  }
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const title = titleOf(row);
  const brand = String(row.Brand || "").trim() || "This";
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    `${brand} shoppers comparing 2026 air fryers`;
  const buyIf = String(row["Who Should Buy"] || "").trim() ||
    `You want a ${row.Capacity || "practical"} ${row["Air Fryer Type"] || "air fryer"} for everyday cooking.`;
  const skipIf = String(row["Who Should Skip"] || "").trim() ||
    "Another ranked pick on this page fits your counter and budget better.";
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const scoreRaw = Number(row["Comparison Score"]);
  const score = Number.isFinite(scoreRaw)
    ? Math.min(9.7, Math.max(7.5, scoreRaw / 10)).toFixed(1)
    : "8.4";

  let shortVerdict = about;
  if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = `${brand}’s ${titleOf(row).replace(new RegExp(`^${brand}\\s*`, "i"), "")} is a ${row["Value Tier"] || "solid"} ${row["Air Fryer Type"] || "air fryer"}${row.Capacity ? ` (${row.Capacity})` : ""} for ${String(row["Best For"] || "everyday air frying").split(",")[0].trim()}.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          `${brand} air fryer`,
          row.Capacity ? `${row.Capacity} capacity` : "Confirm capacity on Amazon",
          row["Cooking Functions"]
            ? String(row["Cooking Functions"]).split(/,|\|/)[0].trim()
            : "Everyday air-fry cooking",
        ],
    cons: cons.length
      ? cons
      : [
          "Confirm basket size and footprint on Amazon",
          "Exact presets can vary by listing colorway",
        ],
    buyIf: buyIf.slice(0, 180),
    skipIf: skipIf.slice(0, 180),
    score,
  };
}

const rows = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
rows.sort(
  (a, b) =>
    Number(b["Comparison Score"] || 0) - Number(a["Comparison Score"] || 0),
);

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
for (const source of rows) {
  const asin = source.ASIN;
  if (!asin) continue;
  let image = imageOf(source) || existingImageByAsin[asin] || "";
  if (!image) {
    console.warn(`${PAGE_ID}: skip ${asin} (no image)`);
    continue;
  }
  rank += 1;
  const editorial = editorialFromRow(source);
  const slotLabel =
    LABELS[asin] ||
    (rank === 1 ? "Best overall 2026" : `2026 pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Air Fryers 2026",
    pageSlug: "best-air-fryers-2026",
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
console.log(
  `${PAGE_ID}: wired ${rank} air fryers for 2026. CSV total ${catalog.length}`,
);
