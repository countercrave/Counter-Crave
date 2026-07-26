/**
 * Wire AF-R28 microwave combos + AF-R29 Ninja air fryers.
 * Usage: node scripts/wire-af-microwave-and-ninja.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const today = new Date().toISOString().slice(0, 10);
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const PAGES = [
  {
    pageId: "AF-R28",
    pageTitle: "Best Air Fryer Microwave Combos",
    pageSlug: "best-air-fryer-microwave-combo",
    sourcePath: path.join(root, "data", "air-fryer-microwave-combo.source.json"),
    labels: {
      B0DPQTDXWC: "Best overall Toshiba value combo",
      B0D292ZK9W: "Best GE 4-in-1",
      B0DY11H2PJ: "Best BLACK+DECKER 5-in-1",
      B08FFG5WGP: "Best Frigidaire value",
      B081ZS7VSM: "Best Breville Combi Wave",
      B0FKBXMPRF: "Best Ninja Crispi microwave",
      B0DT7RRFHR: "Best Panasonic HomeChef",
      B0F7XYT78Z: "Best Toshiba OptiChef Pro Max",
    },
    preferred: [
      "B0DPQTDXWC",
      "B0D292ZK9W",
      "B0DY11H2PJ",
      "B08FFG5WGP",
      "B081ZS7VSM",
      "B0FKBXMPRF",
      "B0DT7RRFHR",
      "B0F7XYT78Z",
      "B09HKPSRWW",
      "B089WBK1S8",
      "B0DBZ3V9W3",
      "B0D9WS7LZ3",
      "B0DHX8315K",
      "B09HKM5SVD",
      "B0GXGCQ1KF",
      "B0GXG8BBLK",
      "B0GXFYDC1F",
      "B0BR566XBB",
      "B0CC6XWRKL",
    ],
    scoreKey: "Comparison Score",
    kind: "microwave",
  },
  {
    pageId: "AF-R29",
    pageTitle: "Best Ninja Air Fryers",
    pageSlug: "best-ninja-air-fryer",
    sourcePath: path.join(root, "data", "ninja-air-fryers.source.json"),
    labels: {
      B0DW4KG8VM: "Best overall Ninja Pro",
      B0CS3V8M9H: "Best Pro XL MaxCrisp",
      B0B15Q3HCQ: "Best DualZone family",
      B0DDDD8WD6: "Best Crispi glass",
      B0CZS6SS3Y: "Best DoubleStack XL",
      B07W6JVQNP: "Best Foodi Grill",
      B0FPPP568C: "Best Crispi Pro",
      B0D1CXL52G: "Best Ninja toaster-oven combo",
    },
    preferred: [
      "B0DW4KG8VM",
      "B0CS3V8M9H",
      "B0B15Q3HCQ",
      "B0FB13MRPY",
      "B0DDDD8WD6",
      "B0FPPP568C",
      "B0CZS6SS3Y",
      "B07W6JVQNP",
      "B089TQ82WT",
      "B0D1CXL52G",
      "B08BXX69K4",
      "B0D4R8G1FX",
      "B0H278D54S",
      "B0DB6FG29Z",
    ],
    scoreKey: "Comparison Score",
    kind: "ninja",
  },
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
  if (raw.includes("._AC_")) return raw.replace(/\._AC_[A-Z0-9,]+_\./, "._AC_SL1500_.");
  return raw.replace(/\.(jpg|jpeg|png)$/i, "._AC_SL1500_.$1");
}
function titleOf(row) {
  return String(row.Title || "").split("|")[0].trim();
}
function aboutOf(row) {
  return String(row["About this item"] || row["About this Item"] || "")
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
function scoreOf(row, key) {
  return Number(row[key]) || 0;
}
function specsOf(row, kind) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (kind === "microwave") {
    if (row.Wattage) parts.push(`Wattage: ${row.Wattage}`);
    if (row["Combo Type"]) parts.push(`Type: ${row["Combo Type"]}`);
    if (row["Cooking Functions"]) {
      parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 70)}`);
    }
  } else {
    if (row["Model Family"]) parts.push(`Family: ${row["Model Family"]}`);
    if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
    if (row["Cooking Functions"]) {
      parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 70)}`);
    }
  }
  return parts.slice(0, 6).join(" | ");
}
function editorial(row, kind, key) {
  const brand = String(row.Brand || "").trim() || (kind === "ninja" ? "Ninja" : "This");
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    (kind === "ninja"
      ? `${brand} shoppers comparing Ninja air fryer model families`
      : `${brand} shoppers wanting microwave + air fry in one footprint`);
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    (kind === "ninja"
      ? "You want this Ninja format for your weekly cooking pattern."
      : "You want one appliance for reheating and air-fry crisping.");
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    "Another ranked pick fits your capacity or budget better.";
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"] || row["About this Item"])[0] || "";
  const sc = scoreOf(row, key);
  const score = Math.min(9.6, Math.max(7.2, 7.3 + sc / 40)).toFixed(1);
  let shortVerdict = about;
  if (kind === "ninja") {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""}${row["Model Family"] ? ` — ${row["Model Family"]}` : ""}. ${about ? about.slice(0, 160) : "A practical Ninja pick when this format matches how you cook."}`;
  } else {
    shortVerdict = `${brand}${row.Capacity ? ` (${row.Capacity})` : ""} — microwave + air fry combo. ${about ? about.slice(0, 160) : "Confirm crisp tray and functions on Amazon before buying."}`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);
  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          kind === "ninja" ? row["Model Family"] || "Ninja air fryer" : "Microwave + air fry in one body",
          row.Capacity || "Confirm capacity on Amazon",
          kind === "microwave" ? row.Wattage || "Confirm wattage on Amazon" : "Strong everyday crisping format",
        ],
    cons: cons.length
      ? cons
      : ["Listing specs and accessories can change", "Confirm footprint before buying"],
    buyIf: buyIf.slice(0, 180),
    skipIf: skipIf.slice(0, 180),
    score,
  };
}
function ordered(rows, preferred, key) {
  const byAsin = Object.fromEntries(rows.map((r) => [r.ASIN, r]));
  const seen = new Set();
  const out = [];
  for (const asin of preferred) {
    if (!asin || seen.has(asin) || !byAsin[asin]) continue;
    seen.add(asin);
    out.push(byAsin[asin]);
  }
  const rest = rows
    .filter((r) => r.ASIN && !seen.has(r.ASIN))
    .sort((a, b) => scoreOf(b, key) - scoreOf(a, key));
  return [...out, ...rest];
}

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

const pageIds = new Set(PAGES.map((p) => p.pageId));
catalog = catalog
  .filter((row) => !pageIds.has(row.pageId))
  .map((row) => {
    const next = {};
    for (const header of headers) next[header] = row[header] ?? "";
    return next;
  });

for (const page of PAGES) {
  const rows = JSON.parse(fs.readFileSync(page.sourcePath, "utf8"));
  let rank = 0;
  for (const source of ordered(rows, page.preferred, page.scoreKey)) {
    const asin = source.ASIN;
    const image = imageOf(source) || existingImageByAsin[asin] || "";
    if (!image) {
      console.warn(`${page.pageId}: skip ${asin} (no image)`);
      continue;
    }
    rank += 1;
    const ed = editorial(source, page.kind, page.scoreKey);
    catalog.push({
      pageId: page.pageId,
      pageTitle: page.pageTitle,
      pageSlug: page.pageSlug,
      pageType: "Roundup",
      slotId: `rank-${rank}`,
      slotLabel: page.labels[asin] || (rank === 1 ? "Best overall" : `Pick ${rank}`),
      rank: String(rank),
      productName: titleOf(source),
      asin,
      bestFor: ed.bestFor,
      shortVerdict: ed.shortVerdict,
      editorialScore: ed.score,
      keySpecs: specsOf(source, page.kind),
      aboutThisItem: aboutOf(source),
      pros: ed.pros.join(" | "),
      cons: ed.cons.join(" | "),
      imageUrl: image,
      imageWidth: "1500",
      imageHeight: "1500",
      imageAlt: titleOf(source),
      imageSource: "Amazon CDN",
      checkedAt: today,
      listPrice: normalizePrice(source.Price),
      amazonRating: normalizeRating(source.Rating),
      ratingCount: normalizeReviews(source["Rating Count"]),
      notes: `buyIf: ${ed.buyIf} || skipIf: ${ed.skipIf}`,
    });
  }
  console.log(`${page.pageId}: wired ${rank}`);
}

fs.writeFileSync(csvPath, toCsv(catalog));
console.log(`CSV total ${catalog.length}`);
