/**
 * Wire AF-R30 Best Air Fryer Brands:
 * - brand profiles JSON for page layout
 * - flagship products into CSV (AF-R30)
 * - collection catalog of all uploaded evidence products
 *
 * Usage: node scripts/wire-air-fryer-brands.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const sourcePath = path.join(root, "data", "air-fryer-brands.source.json");
const logosPath = path.join(root, "data", "air-fryer-brand-logos.local.json");
const profilesPath = path.join(root, "data", "air-fryer-brand-profiles.generated.json");
const collectionPath = path.join(
  root,
  "data",
  "collections",
  "air-fryer-brands.generated.json",
);
const today = new Date().toISOString().slice(0, 10);
const PAGE_ID = "AF-R30";
const PAGE_TITLE = "Best Air Fryer Brands";
const PAGE_SLUG = "best-air-fryer-brands";
const EXTRA_COLS = [
  "listPrice",
  "amazonRating",
  "ratingCount",
  "vsCompetitor",
  "comparisonChips",
  "comparisonScore",
];

function slug(brand) {
  return String(brand)
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function fixText(value) {
  return String(value || "")
    .replace(/â€“|â€”/g, "–")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
function normalizeRating(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : "";
}
function normalizeReviews(value) {
  return String(value || "")
    .trim()
    .replace(/[^\d,]/g, "");
}
function normalizePrice(value) {
  const text = String(value || "").trim();
  if (!text || /unavailable|high price/i.test(text)) return "";
  if (text.startsWith("$")) return text;
  const num = text.replace(/[^\d.]/g, "");
  return num ? `$${num}` : "";
}
function imageOf(raw) {
  const url = String(raw || "").trim();
  if (
    !/^https:\/\/(m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\//.test(
      url,
    )
  ) {
    return "";
  }
  if (url.includes("._AC_")) return url.replace(/\._AC_[A-Z0-9,]+_\./, "._AC_SL1500_.");
  return url.replace(/\.(jpg|jpeg|png)$/i, "._AC_SL1500_.$1");
}
function toTen(score100) {
  const n = Number(score100) || 0;
  if (!n) return null;
  return Number(Math.min(10, Math.max(0, n / 10)).toFixed(1));
}
function splitList(value) {
  return String(value || "")
    .split(/\s*\|\s*|\n+|;\s*/)
    .map((part) => fixText(part))
    .filter(Boolean);
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const logos = JSON.parse(fs.readFileSync(logosPath, "utf8"));
const bestByBrand = Object.fromEntries(
  source.bestByBrand.map((row) => [row.Brand, row]),
);

const brandsSorted = [...source.brands].sort(
  (a, b) =>
    Number(b["Brand Score"] || 0) - Number(a["Brand Score"] || 0) ||
    Number(a["Editorial Rank"] || 99) - Number(b["Editorial Rank"] || 99),
);

const profiles = brandsSorted.map((row, index) => {
  const brand = fixText(row.Brand);
  const best = bestByBrand[brand] || {};
  const asin = String(row["Amazon ASIN"] || best["Amazon ASIN"] || "")
    .trim()
    .toUpperCase();
  const productImage =
    imageOf(row["Amazon Image URL"] || best["Product Image URL"]) ||
    imageOf(row["Flagship Product Image URL"]);
  const productName =
    fixText(best["Amazon Evidence Product"] || row["Best Amazon Evidence Product"]) ||
    fixText(best["Best Product Offered"] || row["Flagship Product"]) ||
    `${brand} air fryer`;
  return {
    brand,
    brandSlug: slug(brand),
    logoUrl: logos[brand] || "",
    award: fixText(row["Suggested Award"] || best["Suggested Article Award"]),
    brandScore: Number(row["Brand Score"]) || null,
    rank: Number(row["Editorial Rank"]) || index + 1,
    marketPosition: fixText(row["Market Position"]),
    profile: fixText(row["Brand Profile"]),
    summary: fixText(row["Publishable Brand Summary"]),
    bestFor: fixText(row["Best For"] || best["Best For"]),
    strengths: splitList(row["Key Strengths"]),
    weaknesses: splitList(row["Key Weaknesses"]),
    coreTypes: fixText(row["Core Air Fryer Types"]),
    signatureTech: fixText(row["Signature Technology"]),
    warranty: fixText(row["Warranty / Support"]),
    officialWebsite: fixText(row["Official Website"]),
    product: {
      name: productName.split("|")[0].trim(),
      asin,
      imageUrl: productImage,
      listPrice: normalizePrice(
        row["Amazon Price"] || best["Amazon Price"] || best["Official / Listed Price"],
      ),
      amazonRating: normalizeRating(row["Amazon Rating"] || best["Amazon Rating"]),
      ratingCount: normalizeReviews(
        row["Amazon Rating Count"] || best["Amazon Rating Count"],
      ),
      productType: fixText(best["Product Type"] || row["Flagship Product Type"]),
      capacity: fixText(best.Capacity || row["Flagship Capacity"]),
      bestFor: fixText(best["Best For"] || row["Flagship Best For"]),
      why: fixText(row["Why This Product Represents the Brand"] || best["Editorial Take"]),
      features: fixText(best["Key Features"] || row["Flagship Features"]),
    },
  };
});

fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));

// Collection catalog from evidence (+ fill gaps from brand flagships)
const seen = new Set();
const collectionItems = [];
for (const row of source.evidence) {
  const asin = String(row.ASIN || "")
    .trim()
    .toUpperCase();
  if (!asin || seen.has(asin)) continue;
  const image = imageOf(row["Image URL"]);
  if (!image) continue;
  seen.add(asin);
  const brand = fixText(row.Brand);
  const priceNum = Number(String(row.Price || "").replace(/[^\d.]/g, "")) || null;
  const ratingNum = Number(row.Rating) || null;
  collectionItems.push({
    id: asin,
    brand,
    brandSlug: slug(brand),
    logoUrl: logos[brand] || "",
    asin,
    productName: fixText(row["Product Title"]).split("|")[0].trim(),
    imageUrl: image,
    listPrice: normalizePrice(row.Price),
    priceValue: priceNum,
    amazonRating: normalizeRating(row.Rating),
    ratingValue: ratingNum,
    ratingCount: normalizeReviews(row["Rating Count"]),
    ratingCountValue: Number(String(row["Rating Count"] || "").replace(/[^\d]/g, "")) || 0,
    affiliateUrl: `https://www.amazon.com/dp/${asin}/ref=nosim?tag=visitbest07-20`,
    collectionTags: ["all", "by-brand", slug(brand)],
  });
}

// Enrich tags from product titles
for (const item of collectionItems) {
  const t = item.productName.toLowerCase();
  if (/dual.?zone|dual.?basket|2-basket|two basket|doublestack/i.test(t)) {
    item.collectionTags.push("dual-basket");
  }
  if (/toaster oven|oven combo|french door|countertop oven/i.test(t)) {
    item.collectionTags.push("oven-style");
  }
  if (/glass|crispi/i.test(t)) item.collectionTags.push("glass");
  if (/smart|app|wifi|wi-fi|probe/i.test(t)) item.collectionTags.push("smart");
  if (/compact|mini|4 qt|4-qt|5 qt|5-qt/i.test(t)) item.collectionTags.push("compact");
  if (/xl|8 qt|8-qt|10 qt|10-qt|12 qt|family/i.test(t)) item.collectionTags.push("large");
  if (item.priceValue != null && item.priceValue < 100) item.collectionTags.push("under-100");
  if (item.priceValue != null && item.priceValue < 150) item.collectionTags.push("under-150");
  if (item.priceValue != null && item.priceValue >= 200) item.collectionTags.push("premium");
  item.collectionTags = [...new Set(item.collectionTags)];
}

const collections = [
  {
    id: "all",
    title: "All brand evidence products",
    description: "Every uploaded Amazon evidence product across ranked air fryer brands.",
    filter: { tags: ["all"] },
  },
  {
    id: "dual-basket",
    title: "Dual-basket & DualZone",
    description: "Two-basket / DualZone formats for mains + sides.",
    filter: { tags: ["dual-basket"] },
  },
  {
    id: "oven-style",
    title: "Air fryer toaster ovens",
    description: "Oven-style combos for toast, bake, broil, and air fry.",
    filter: { tags: ["oven-style"] },
  },
  {
    id: "smart",
    title: "Smart & connected",
    description: "App, probe, or smart-cooking language in the listing title.",
    filter: { tags: ["smart"] },
  },
  {
    id: "glass",
    title: "Glass air fryers",
    description: "Glass vessel / Crispi-style visibility picks in the sample.",
    filter: { tags: ["glass"] },
  },
  {
    id: "compact",
    title: "Compact & smaller baskets",
    description: "Smaller-capacity titles from the brand evidence set.",
    filter: { tags: ["compact"] },
  },
  {
    id: "large",
    title: "Large & family capacity",
    description: "XL / family-size titles from the brand evidence set.",
    filter: { tags: ["large"] },
  },
  {
    id: "under-100",
    title: "Under $100",
    description: "Snapshot prices under $100 (confirm live on Amazon).",
    filter: { tags: ["under-100"] },
  },
  {
    id: "under-150",
    title: "Under $150",
    description: "Snapshot prices under $150 (confirm live on Amazon).",
    filter: { tags: ["under-150"] },
  },
  {
    id: "premium",
    title: "Premium $200+",
    description: "Snapshot prices at $200 and up (confirm live on Amazon).",
    filter: { tags: ["premium"] },
  },
  ...profiles.map((p) => ({
    id: p.brandSlug,
    title: `${p.brand} collection`,
    description: `Uploaded evidence products for ${p.brand}.`,
    filter: { brandSlug: p.brandSlug },
  })),
];

fs.mkdirSync(path.dirname(collectionPath), { recursive: true });
fs.writeFileSync(
  collectionPath,
  JSON.stringify(
    {
      pageId: "AF-COL-BRANDS",
      title: "Air Fryer Brand Product Collections",
      slug: "collections/air-fryers",
      updatedAt: today,
      brands: profiles.map((p) => ({
        brand: p.brand,
        brandSlug: p.brandSlug,
        logoUrl: p.logoUrl,
        award: p.award,
      })),
      collections,
      products: collectionItems,
    },
    null,
    2,
  ),
);

// Wire AF-R30 CSV products = flagships with ASINs
let catalog = parseCsv(fs.readFileSync(csvPath, "utf8"));
for (const row of catalog) {
  for (const col of EXTRA_COLS) {
    if (!Object.prototype.hasOwnProperty.call(row, col)) row[col] = "";
  }
}
catalog = catalog.filter((row) => row.pageId !== PAGE_ID);

let rank = 0;
for (const profile of profiles) {
  const asin = profile.product.asin;
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    console.warn(`skip brand product ${profile.brand}: no ASIN`);
    continue;
  }
  if (!profile.product.imageUrl) {
    console.warn(`skip brand product ${profile.brand}: no image`);
    continue;
  }
  rank += 1;
  const score = toTen(profile.brandScore);
  catalog.push({
    pageId: PAGE_ID,
    pageTitle: PAGE_TITLE,
    pageSlug: PAGE_SLUG,
    pageType: "Roundup",
    slotId: `rank-${rank}`,
    slotLabel: profile.award || `Pick ${rank}`,
    rank: String(rank),
    productName: profile.product.name,
    asin,
    bestFor: profile.product.bestFor || profile.bestFor,
    shortVerdict:
      profile.product.why ||
      profile.summary ||
      `${profile.brand} flagship evidence pick for this brand roundup.`,
    editorialScore: score != null ? String(score) : "",
    comparisonScore: profile.brandScore != null ? String(profile.brandScore) : "",
    keySpecs: [
      profile.product.capacity ? `Capacity: ${profile.product.capacity}` : "",
      profile.product.productType ? `Type: ${profile.product.productType}` : "",
      profile.signatureTech
        ? `Signature tech: ${profile.signatureTech.slice(0, 80)}`
        : "",
      profile.coreTypes ? `Formats: ${profile.coreTypes.slice(0, 80)}` : "",
    ]
      .filter(Boolean)
      .join(" | "),
    aboutThisItem: [
      profile.product.why,
      profile.product.features,
      profile.summary,
    ]
      .filter(Boolean)
      .join(" | "),
    pros: profile.strengths.slice(0, 4).join(" | "),
    cons: profile.weaknesses.slice(0, 3).join(" | "),
    imageUrl: profile.product.imageUrl,
    imageWidth: "1500",
    imageHeight: "1500",
    imageAlt: profile.product.name,
    imageSource: "Amazon CDN",
    checkedAt: today,
    listPrice: profile.product.listPrice,
    amazonRating: profile.product.amazonRating,
    ratingCount: profile.product.ratingCount,
    vsCompetitor: "",
    comparisonChips: [
      profile.brand,
      profile.product.capacity,
      profile.product.productType,
      profile.award,
    ]
      .filter(Boolean)
      .join(" | "),
    notes: `buyIf: ${profile.bestFor || "This brand format fits your kitchen"} || skipIf: Another brand's format fits better`,
  });
}

fs.writeFileSync(csvPath, toCsv(catalog));
console.log(
  `AF-R30: ${rank} flagship products; profiles ${profiles.length}; collection ${collectionItems.length}`,
);
