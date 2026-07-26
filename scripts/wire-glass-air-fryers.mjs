/**
 * Wire AF-R26 Best Glass Air Fryer.
 * Full-glass-vessel-first ranking from sheet fields.
 *
 * Usage: node scripts/wire-glass-air-fryers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "glass-air-fryers.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R26";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0DJFB6ZKM: "Best overall glass Crispi",
  B0H2N44S2R: "Best PFAS-free glass Kismile",
  B0FMX8VCKK: "Best value ClearView glass",
  B0GVPBSXXF: "Best compact Cuisinart glass",
  B0GXFXV8B4: "Best family NutriChef glass",
  B0FLG6D6Z3: "Best premium Crispi Pro",
  B0GZ53PH2F: "Best large glass Granitestone",
};

const PREFERRED = [
  "B0DJFB6ZKM",
  "B0H2N44S2R",
  "B0FMX8VCKK",
  "B0GVPBSXXF",
  "B0FV37TFGX",
  "B0GCHW5L6M",
  "B0F67CKD4J",
  "B0GCZKCGL4",
  "B0GXFXV8B4",
  "B0FLG6D6Z3",
  "B0GZ53PH2F",
  "B0F7R2YTZ1",
  "B0GFSBD6C9",
  "B0G12TJVFD",
  "B0D2Y7SG78",
  "B0H31K19CL",
  "B0H27K9RLR",
  "B0GTNF4HLT",
  "B0G1PYDNWJ",
  "B0H86SGZGF",
  "B0H2PWWWP2",
  "B0G5PXGS5S",
  "B0DZ9VFWYN",
  "B096N3FTZP",
  "B0C33CHG99",
  "B08DL8WH9V",
  "B0D5NR7JPS",
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

function isFullGlass(row) {
  return /^yes$/i.test(String(row["Full Glass Cooking Vessel"] || "").trim());
}

function isWindowOnly(row) {
  return /^yes$/i.test(String(row["Viewing Window Only"] || "").trim());
}

function glassScore(row) {
  let score = Number(row["Glass Air Fryer Comparison Score"]) || 0;
  if (isFullGlass(row)) score += 25;
  if (isWindowOnly(row)) score -= 8;
  if (!isFullGlass(row) && !isWindowOnly(row)) score -= 18;
  if (/pfas-?free/i.test(row["PFAS/PTFE/PFOA Claim"] || "")) score += 8;
  if (/glass basket|glass bowl|glass container|crispi|clearview/i.test(row.Title || "")) {
    score += 4;
  }
  return score;
}

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Glass Construction Type"]) {
    parts.push(`Glass: ${String(row["Glass Construction Type"]).slice(0, 60)}`);
  }
  if (row["Full Glass Cooking Vessel"]) {
    parts.push(`Full glass vessel: ${row["Full Glass Cooking Vessel"]}`);
  }
  if (row["PFAS/PTFE/PFOA Claim"]) {
    parts.push(`Materials claim: ${String(row["PFAS/PTFE/PFOA Claim"]).slice(0, 50)}`);
  }
  if (row["Estimated Household Size"]) {
    parts.push(`Household: ${String(row["Estimated Household Size"]).slice(0, 40)}`);
  }
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const full = isFullGlass(row);
  const windowOnly = isWindowOnly(row);
  const claim = String(row["PFAS/PTFE/PFOA Claim"] || "").trim();
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    (full
      ? `${brand} shoppers wanting a glass cooking vessel air fryer`
      : `${brand} shoppers comparing glass vs standard air fryers`);
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (full
      ? "You want a full glass basket/bowl and clearer cooking visibility."
      : windowOnly
        ? "You mainly want a viewing window, not a full glass vessel."
        : "You are comparing capacity/value alongside true glass models.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    (full
      ? "You want the lightest metal drawer or lowest-cost nonstick fryer."
      : "A full glass cooking vessel is your main priority — pick ranked glass models above.");
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const gs = glassScore(row);
  const score = Math.min(9.6, Math.max(7.0, 7.2 + gs / 40)).toFixed(1);

  let shortVerdict = about;
  if (full) {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — full glass cooking vessel${claim && /pfas/i.test(claim) ? " with PFAS-free listing language" : ""}. ${about ? about.slice(0, 140) : "Handle glass carefully and confirm care instructions on Amazon."}`;
  } else if (windowOnly) {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — viewing-window style for monitoring food, not a full glass vessel. Included for comparison.`;
  } else {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — non-glass comparison pick. Prefer full glass models above if glass cookware is your filter.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          full ? "Full glass cooking vessel" : windowOnly ? "Viewing window for monitoring" : `${brand} everyday air fryer`,
          row.Capacity ? `${row.Capacity} capacity` : "Confirm capacity on Amazon",
          claim && claim.length > 5 ? claim.slice(0, 50) : "Confirm materials claims on Amazon",
        ],
    cons: cons.length
      ? cons
      : [
          full
            ? "Glass needs careful handling around thermal shock"
            : "Not a full glass cooking vessel",
          "Listing claims and accessories can change",
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
    .sort((a, b) => glassScore(b) - glassScore(a));
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
    LABELS[asin] || (rank === 1 ? "Best overall glass air fryer" : `Pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Glass Air Fryers",
    pageSlug: "best-glass-air-fryer",
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
console.log(`${PAGE_ID}: wired ${rank} glass air fryers. CSV total ${catalog.length}`);
