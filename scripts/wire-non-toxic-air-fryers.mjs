/**
 * Wire AF-R23 Best Non-Toxic Air Fryer.
 * Materials-first ranking using sheet non-toxic fields.
 *
 * Usage: node scripts/wire-non-toxic-air-fryers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "non-toxic-air-fryers.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R23";
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const LABELS = {
  B0C33CHG99: "Best overall PFAS-free ceramic",
  B0DJFB6ZKM: "Best glass Crispi",
  B0CVS67GJ5: "Best Nuwave PFAS-free XL",
  B0H2N44S2R: "Best glass PFAS-free value",
  B0DQVP6F8Y: "Best GreenLife ceramic",
  B0DFNFJJFY: "Best GreenPan Clearview",
  B0CYJDVT31: "Best slim ceramic budget",
  B0GVPBSXXF: "Best Cuisinart glass basket",
  B0FLG6D6Z3: "Best premium glass Crispi Pro",
};

const PREFERRED = [
  "B0C33CHG99",
  "B0DJFB6ZKM",
  "B0CVS67GJ5",
  "B0DFKFTJSV",
  "B0FVP7SLRL",
  "B0H2N44S2R",
  "B0DQVP6F8Y",
  "B0DFNFJJFY",
  "B0GVPBSXXF",
  "B0CYJDVT31",
  "B0FLG6D6Z3",
  "B0G1PYDNWJ",
  "B0FNWM8J3B",
  "B0F7R2YTZ1",
  "B0GFSBD6C9",
  "B0FHHBVGQK",
  "B0F67CKD4J",
  "B0GXFXV8B4",
  "B0D5NKX2HF",
  "B0D5NR7JPS",
  "B07VHFMZHJ",
  "B08R6KMBQT",
  "B0CSZ7WBYW",
  "B0BYF8PT3L",
  "B08DKYBTPH",
  "B0FJSDSZJ6",
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

function materialsScore(row) {
  const claim = `${row["Non-Toxic / Coating Claims"] || ""} ${row.Title || ""} ${row["PFAS/PTFE Verification Note"] || ""}`;
  let score = Number(row["Non-Toxic Comparison Score"]) || 0;
  if (/pfas-?free|ptfe-?free|ceramic|glass basket|glass bowl|non-toxic/i.test(claim)) score += 20;
  if (/pfas-?free ceramic|glass/i.test(claim)) score += 10;
  if (/no (clear|explicit).*(pfas|non-toxic)|standard nonstick|not materials/i.test(claim)) score -= 15;
  return score;
}

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
  if (row["Non-Toxic / Coating Claims"]) {
    parts.push(`Materials: ${String(row["Non-Toxic / Coating Claims"]).slice(0, 90)}`);
  }
  if (row["Claim Confidence"]) {
    parts.push(`Claim confidence: ${row["Claim Confidence"]}`);
  }
  if (row["Cooking Functions"]) {
    parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 70)}`);
  }
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const claim = String(row["Non-Toxic / Coating Claims"] || "").trim();
  const note = String(row["PFAS/PTFE Verification Note"] || "").trim();
  const hasStrongMaterials =
    /pfas-?free|ptfe-?free|ceramic|glass|non-toxic/i.test(`${claim} ${row.Title}`);
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    `${brand} shoppers comparing safer-coating air fryers`;
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (hasStrongMaterials
      ? "You want clearer PFAS-free, ceramic, or glass basket language."
      : "You mainly want everyday air frying and will re-check coating claims on Amazon.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    (hasStrongMaterials
      ? "Another ranked pick fits your capacity or budget better."
      : "Materials claims are your top priority — prefer PFAS-free ceramic or glass models above.");
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const nt = materialsScore(row);
  const score = Math.min(9.6, Math.max(7.2, 7.5 + nt / 40)).toFixed(1);

  let shortVerdict = about;
  if (claim && claim.length > 20) {
    shortVerdict = hasStrongMaterials
      ? `${brand} lists ${claim.slice(0, 120)}. ${about ? about.slice(0, 160) : "A practical pick when safer basket materials matter as much as crisp results."}`
      : `${brand}’s ${titleOf(row).replace(new RegExp(`^${brand}\\s*`, "i"), "")} is included for capacity/value comparison. ${note || "Re-check live Amazon coating language if non-toxic materials are your main filter."}`;
  } else if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = `${brand} air fryer${row.Capacity ? ` (${row.Capacity})` : ""} for everyday crisping. Confirm basket coating claims on the live Amazon page before buying.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          hasStrongMaterials ? "Clearer safer-materials language" : `${brand} everyday air fryer`,
          row.Capacity ? `${row.Capacity} capacity` : "Confirm capacity on Amazon",
          claim ? claim.slice(0, 60) : "Re-check coating details on Amazon",
        ],
    cons: cons.length
      ? cons
      : [
          hasStrongMaterials
            ? "Confirm care instructions for ceramic/glass parts"
            : "Weaker explicit PFAS-free / ceramic documentation",
          "Listing materials claims can change",
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
    .sort((a, b) => materialsScore(b) - materialsScore(a));
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
    LABELS[asin] || (rank === 1 ? "Best overall non-toxic pick" : `Pick ${rank}`);

  catalog.push({
    pageId: PAGE_ID,
    pageTitle: "Best Non-Toxic Air Fryers",
    pageSlug: "best-non-toxic-air-fryer",
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
console.log(`${PAGE_ID}: wired ${rank} non-toxic air fryers. CSV total ${catalog.length}`);
