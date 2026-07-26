/**
 * Wire AF-R12 Best Air Fryer Toaster Oven from air-fryer-toaster-ovens.source.json.
 * Uses sheet editorial fields. Keeps all products with ASINs + images.
 *
 * Usage: node scripts/wire-air-fryer-toaster-ovens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "air-fryer-toaster-ovens.source.json");
const today = new Date().toISOString().slice(0, 10);
const PAGE_IDS = ["TO-R06", "AF-R12"];
const EXTRA_COLS = ["listPrice", "amazonRating", "ratingCount"];

const PAGE_META = {
  "TO-R06": {
    pageTitle: "Best Air Fryer Toaster Ovens",
    pageSlug: "best-air-fryer-toaster-oven",
  },
  "AF-R12": {
    pageTitle: "Best Air Fryer Toaster Oven Combos",
    pageSlug: "best-air-fryer-toaster-oven-combo",
  },
};

const LABELS = {
  B0CKLXZRMC: "Best budget toaster-oven air fryer",
  B0D1CXL52G: "Best overall Ninja flip-away",
  B0B4T992R8: "Best 6-slice value",
  B0C33CHG99: "Basket alternative (not a toaster oven)",
  B0CC6H1957: "Best Ninja XL Pro oven",
  B0GSB2BBV2: "Best slim French-door",
  B08127JM2L: "Best compact Gourmia",
  B09HSWBTN4: "Best Cuisinart everyday",
  B08PL327W4: "Best Instant Omni Plus",
  B01N5UPTZS: "Best premium Breville",
  B0C1LDRFSK: "Best NuWave Bravo smart oven",
};

// Prefer true toaster-oven / countertop oven combos first
const PREFERRED = [
  "B0D1CXL52G",
  "B0CKLXZRMC",
  "B0B4T992R8",
  "B0CC6H1957",
  "B0GSB2BBV2",
  "B08127JM2L",
  "B09HSWBTN4",
  "B08PL327W4",
  "B0C1LDRFSK",
  "B0872DQV7Z",
  "B0CXF9LRQK",
  "B00IXBMS6M",
  "B09B7SB46R",
  "B0D7N8HJRZ",
  "B0DCCY5JCP",
  "B0D4R8G1FX",
  "B0FPP4RCV3",
  "B08BXX69K4",
  "B01N5UPTZS",
  "B0GWFQKG5J",
  "B0D1BGLW25",
  "B0BG34Q495",
  "B0D7D3CZ1S",
  "B0CJMV9RZK",
  "B0F49RLPS4",
  "B092L87CRG",
  "B0FVDS4FJJ",
  "B0FMYGX797",
  "B0C33CHG99",
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

function specsOf(row) {
  const parts = [];
  if (row.Capacity) parts.push(`Capacity: ${row.Capacity}`);
  if (row["Air Fryer Type"]) parts.push(`Type: ${row["Air Fryer Type"]}`);
  if (row["Cooking Functions"]) {
    parts.push(`Functions: ${String(row["Cooking Functions"]).slice(0, 90)}`);
  }
  if (row.Footprint) parts.push(`Footprint: ${row.Footprint}`);
  if (row["Value Tier"]) parts.push(`Value tier: ${row["Value Tier"]}`);
  return parts.slice(0, 6).join(" | ");
}

function editorialFromRow(row) {
  const brand = String(row.Brand || "").trim() || "This";
  const title = titleOf(row);
  const isBasketOnly =
    /turbo.?blaze|basket air fryer/i.test(title) &&
    !/toaster oven|countertop oven|air fryer oven|combo/i.test(title);
  const bestFor =
    String(row["Best For"] || row["Who Should Buy"] || "").trim() ||
    `${brand} shoppers comparing air fryer toaster ovens`;
  const buyIf =
    String(row["Who Should Buy"] || "").trim() ||
    `You want toast, bake, and air fry in one countertop oven.`;
  const skipIf =
    String(row["Who Should Skip"] || "").trim() ||
    (isBasketOnly
      ? "You specifically need a toaster-oven style air fryer, not a basket unit."
      : "Another ranked pick on this page fits your counter and budget better.");
  const pros = splitList(row["Key Pros"]).slice(0, 4);
  const cons = splitList(row["Key Cons"]).slice(0, 3);
  const about = splitList(row["About this item"])[0] || "";
  const scoreRaw = Number(row["Comparison Score"]);
  let score = Number.isFinite(scoreRaw)
    ? Math.min(9.6, Math.max(7.2, scoreRaw / 10)).toFixed(1)
    : "8.2";
  if (isBasketOnly) score = "7.4";

  let shortVerdict = about;
  if (!shortVerdict || shortVerdict.length < 40) {
    shortVerdict = isBasketOnly
      ? `${brand}’s basket air fryer appears on this shortlist for comparison, but it is not a toaster-oven style unit. Prefer Ninja, Cuisinart, Breville, or NuWave oven combos if toast + bake + air fry in one appliance is the goal.`
      : `${brand}’s ${title.replace(new RegExp(`^${brand}\\s*`, "i"), "")} combines air fry with toast/bake-style countertop cooking${row.Capacity ? ` (${row.Capacity})` : ""}. Good fit when you want one appliance for crispy foods and everyday oven tasks.`;
  }
  shortVerdict = shortVerdict.replace(/\s+/g, " ").trim().slice(0, 340);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros: pros.length
      ? pros
      : [
          `${brand} countertop oven`,
          row.Capacity ? `${row.Capacity} capacity` : "Confirm capacity on Amazon",
          "Air fry + toast/bake style versatility",
        ],
    cons: cons.length
      ? cons
      : [
          isBasketOnly
            ? "Not a true toaster-oven air fryer format"
            : "Larger footprint than a basket air fryer",
          "Confirm included trays and racks on Amazon",
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
    .sort(
      (a, b) =>
        Number(b["Comparison Score"] || 0) - Number(a["Comparison Score"] || 0),
    );
  return [...out, ...rest];
}

const rows = JSON.parse(fs.readFileSync(sourcePath, "utf8")).filter(
  (r) => String(r.ASIN || "").trim().length > 0,
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
  .filter((row) => !PAGE_IDS.includes(row.pageId))
  .map((row) => {
    const next = {};
    for (const header of headers) next[header] = row[header] ?? "";
    return next;
  });

for (const pageId of PAGE_IDS) {
  const meta = PAGE_META[pageId];
  let rank = 0;
  for (const source of orderedRows(rows)) {
    const asin = source.ASIN;
    let image = imageOf(source) || existingImageByAsin[asin] || "";
    if (!image) {
      if (pageId === PAGE_IDS[0]) console.warn(`skip ${asin} (no image)`);
      continue;
    }
    rank += 1;
    const editorial = editorialFromRow(source);
    const slotLabel =
      LABELS[asin] || (rank === 1 ? "Best overall" : `Pick ${rank}`);

    catalog.push({
      pageId,
      pageTitle: meta.pageTitle,
      pageSlug: meta.pageSlug,
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
  console.log(`${pageId}: wired ${rank} air fryer toaster ovens`);
}

fs.writeFileSync(csvPath, toCsv(catalog));
console.log(`CSV total ${catalog.length}`);
