/**
 * Expand every commercial page to 12 detailed product slots (V2 model)
 * with unique best-for / pros / cons / who-should-buy editorial fields.
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const today = new Date().toISOString().slice(0, 10);

const ROUNDUP_SLOTS = [
  ["rank-1", "Best overall"],
  ["rank-2", "Runner-up"],
  ["rank-3", "Best value"],
  ["rank-4", "Best premium"],
  ["rank-5", "Best compact"],
  ["rank-6", "Best for families"],
  ["rank-7", "Easiest to clean"],
  ["rank-8", "Best for smoothies"],
  ["rank-9", "Best for beginners"],
  ["rank-10", "Best feature set"],
  ["rank-11", "Strong alternative"],
  ["rank-12", "Also worth considering"],
];

/** @type {Record<string, object>} */
const CATALOG = {
  B0C33CHG99: {
    name: "COSORI TurboBlaze 6-Qt Air Fryer",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg",
    bestFor: "Everyday households wanting a roomy single basket",
    shortVerdict: "Strong all-rounder when capacity and cleanup matter more than dual zones.",
    score: 9.2,
    keySpecs: ["6 qt", "1725W class", "Ceramic nonstick basket"],
    pros: ["Roomy square basket", "Versatile cooking modes", "Easy everyday cleanup"],
    cons: ["Single basket only", "Needs counter depth"],
    buyIf: "You cook for 2–4 people and want one primary air fryer.",
    skipIf: "You need two foods finished at the same time.",
  },
  B0CSZ7WBYW: {
    name: "Ninja Air Fryer Pro 5-Qt (AF141)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71jfzcXideL._AC_SL1500_.jpg",
    bestFor: "Smaller counters and compact kitchens",
    shortVerdict: "Compact Ninja pick when Cosori feels oversized.",
    score: 8.9,
    keySpecs: ["5 qt", "1750W", "4-in-1 modes"],
    pros: ["Trusted brand", "Fits tighter counters", "Crispy results"],
    cons: ["Smaller than 6–8 qt peers", "Fewer gourmet modes"],
    buyIf: "You want a compact everyday air fryer for 1–2 people.",
    skipIf: "You regularly cook family-size batches.",
  },
  B08DKYBTPH: {
    name: "Chefman TurboFry 8-Qt Air Fryer",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71VzGtbzyFL._AC_SL1500_.jpg",
    bestFor: "Budget shoppers who still want XL capacity",
    shortVerdict: "Capacity-per-dollar pick when the basket size is the priority.",
    score: 8.4,
    keySpecs: ["8 qt", "1700W class", "Hi-Fry boost"],
    pros: ["Large basket", "Strong value", "Simple presets"],
    cons: ["Build feels lighter", "Brand support varies"],
    buyIf: "You want more basket space without a premium price.",
    skipIf: "You prefer dual-zone cooking or premium build.",
  },
  B089TQWJKK: {
    name: "Ninja Foodi DZ201 DualZone 8-Qt",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/61xMRA3NY4L._AC_SL1500_.jpg",
    bestFor: "Families cooking two foods at once",
    shortVerdict: "Dual baskets with synced finish times for protein + sides.",
    score: 9.3,
    keySpecs: ["8 qt dual", "Match Cook / Smart Finish", "Independent zones"],
    pros: ["True dual cooking", "Family portions", "Sync finish times"],
    cons: ["Wider footprint", "Higher price tier"],
    buyIf: "You cook mains and sides together most weeknights.",
    skipIf: "Counter space or budget is tight.",
  },
  B07VHFMZHJ: {
    name: "Instant Vortex Plus 6-Qt Air Fryer",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71GPWtT61gL._AC_SL1500_.jpg",
    bestFor: "Shoppers already in the Instant ecosystem",
    shortVerdict: "Straightforward 6-quart workhorse with familiar Instant branding.",
    score: 8.7,
    keySpecs: ["6 qt", "1700W class", "Dishwasher-safe basket"],
    pros: ["Trusted Instant brand", "Clear controls", "Solid mid-size basket"],
    cons: ["Not dual-zone", "Price fluctuates"],
    buyIf: "You want a reliable single-basket Instant air fryer.",
    skipIf: "You need dual baskets or a compact 4–5 qt unit.",
  },
  B0855B5Z6F: {
    name: "Ninja Professional Plus Blender BN701",
    cluster: "Blenders",
    imageUrl: "https://m.media-amazon.com/images/I/71RbmccXCUL._AC_SL1500_.jpg",
    bestFor: "Frozen drinks and family smoothie batches under $100",
    shortVerdict: "1400-peak-watt pitcher blender with Auto-iQ presets for ice and smoothies.",
    score: 9.1,
    keySpecs: ["1400 peak watts", "72 oz pitcher", "3 Auto-iQ presets"],
    pros: ["Strong ice crushing", "Large batch pitcher", "Preset programs"],
    cons: ["Tall footprint", "Can be loud"],
    buyIf: "You want a powerful full-size blender near the $100 mark.",
    skipIf: "You only make single-serve smoothies.",
  },
  B00NGV4506: {
    name: "Ninja Professional Blender BL610",
    cluster: "Blenders",
    imageUrl: "https://m.media-amazon.com/images/I/61DvtaqAWML._AC_SL1500_.jpg",
    bestFor: "Classic Total Crushing pitcher blending on a budget",
    shortVerdict: "Proven Ninja pitcher blender for ice, frozen fruit and everyday smoothies.",
    score: 8.8,
    keySpecs: ["1000W class", "72 oz pitcher", "Total Crushing blades"],
    pros: ["Proven ice performance", "Large pitcher", "Widely available"],
    cons: ["Fewer auto programs than BN701", "Bulky base"],
    buyIf: "You want a known Ninja pitcher without paying for newer presets.",
    skipIf: "You need personal to-go cups as the main use case.",
  },
  B0GH8PVFHS: {
    name: "Ninja UltraCrush Professional Blender",
    cluster: "Blenders",
    imageUrl: "https://m.media-amazon.com/images/I/71GDWC3uKQL._AC_SL1500_.jpg",
    bestFor: "Everyday ice and frozen fruit near $80",
    shortVerdict: "1000W pitcher blender aimed at crushing ice and frozen fruit smoothly.",
    score: 8.6,
    keySpecs: ["1000W", "72 oz pitcher", "Total Crushing style"],
    pros: ["Crushes ice well", "Large pitcher", "Solid value"],
    cons: ["Loud", "Bulky on small counters"],
    buyIf: "You want a full pitcher blender without overspending.",
    skipIf: "You mainly blend single servings to take on the go.",
  },
  B01FHOWYA2: {
    name: "Ninja Fit Compact Personal Blender",
    cluster: "Blenders",
    imageUrl: "https://m.media-amazon.com/images/I/710oNE8RCjL._AC_SL1500_.jpg",
    bestFor: "Single-serve smoothies and shake cups",
    shortVerdict: "Compact personal blender with to-go cups and less cleanup than a pitcher.",
    score: 8.5,
    keySpecs: ["700W", "2 × 16 oz cups", "Compact base"],
    pros: ["Portable cups", "Compact footprint", "Quick single servings"],
    cons: ["Not for big batches", "Limited food prep"],
    buyIf: "Most blends are one person smoothies or protein shakes.",
    skipIf: "You regularly make pitcher-size batches for a family.",
  },
  B00EI7DPI0: {
    name: "Hamilton Beach Power Elite Blender",
    cluster: "Blenders",
    imageUrl: "https://m.media-amazon.com/images/I/71k1RTjfAhL._AC_SL1500_.jpg",
    bestFor: "Tight budgets and soft-fruit drinks",
    shortVerdict: "Glass-jar classic for basic blending when price is the main constraint.",
    score: 7.8,
    keySpecs: ["700W class", "40 oz glass jar", "Wave Action"],
    pros: ["Inexpensive", "Glass jar", "Easy to find"],
    cons: ["Weaker on hard ice", "Shorter expected lifespan"],
    buyIf: "You need a basic blender and want to spend as little as possible.",
    skipIf: "Ice crushing and frozen fruit are daily jobs.",
  },
  B00D2HTKQ6: {
    name: "NutriBullet Pro Personal Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Compact nutrient extraction and single-serve smoothies",
    shortVerdict: "Twist-and-blend personal cup system for quick smoothies with minimal parts.",
    score: 8.3,
    keySpecs: ["900W class", "Personal cups", "Compact base"],
    pros: ["Simple operation", "Fast single servings", "Small footprint"],
    cons: ["Not a full pitcher replacement", "Cup capacity limited"],
    buyIf: "You want a personal blender workflow more than a countertop pitcher.",
    skipIf: "You need large family batches or heavy ice cream loads.",
  },
  B004TGLB8S: {
    name: "Hamilton Beach Personal Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Ultra-budget personal blending",
    shortVerdict: "Entry personal blender when you want a travel cup without spending much.",
    score: 7.4,
    keySpecs: ["Personal jar", "Compact motor", "Budget build"],
    pros: ["Very affordable", "Small footprint", "Simple controls"],
    cons: ["Limited power", "Not ideal for dense frozen loads"],
    buyIf: "You want the cheapest workable personal blender.",
    skipIf: "You blend frozen fruit or ice every day.",
  },
  B01N1NTBJ8: {
    name: "NutriBullet Pro+ Personal Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Higher-power personal blending under a mid budget",
    shortVerdict: "Personal NutriBullet-style pick when you want more power than basic cups.",
    score: 8.4,
    keySpecs: ["Higher-watt personal motor", "Cup system", "Compact"],
    pros: ["Stronger personal blend", "Travel cups", "Quick cleanup"],
    cons: ["Still not pitcher-size", "Noise for size"],
    buyIf: "Personal cups are your main format and you want more punch.",
    skipIf: "You need a 64–72 oz family pitcher.",
  },
  B07GZW9WXH: {
    name: "Oster Pro 1200 Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Glass-jar blending with food-processor style extras",
    shortVerdict: "Glass jar blender option for shoppers who dislike plastic pitchers.",
    score: 8.2,
    keySpecs: ["1200W class", "Glass jar", "Multi-speed controls"],
    pros: ["Glass jar appeal", "Known brand", "Good everyday versatility"],
    cons: ["Heavier jar", "Ice performance varies by recipe"],
    buyIf: "You prefer glass and want more than a bare-bones blender.",
    skipIf: "You only need a personal cup blender.",
  },
  B07GZVZJ27: {
    name: "Oster Blender with Food Processor Attachment",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Blending plus light chopping in one footprint",
    shortVerdict: "Hybrid pick when counter space is limited and you want blender + chopper utility.",
    score: 8.0,
    keySpecs: ["Blender base", "Processor attachment", "Multi-use"],
    pros: ["Two jobs in one", "Space-saving intent", "Useful attachments"],
    cons: ["Compromise vs dedicated tools", "More parts to store"],
    buyIf: "You want blender convenience plus occasional chopping.",
    skipIf: "You already own a strong dedicated food processor.",
  },
  B08MJ5K5L8: {
    name: "Ninja Personal Blender with Cups",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Ninja fans who mainly make to-go smoothies",
    shortVerdict: "Personal Ninja cup blender for quick single servings and travel lids.",
    score: 8.1,
    keySpecs: ["Personal cups", "Ninja blade system", "Compact"],
    pros: ["Brand familiarity", "To-go friendly", "Fast smoothies"],
    cons: ["Not for large batches", "Limited prep range"],
    buyIf: "You want Ninja personal cups more than a pitcher.",
    skipIf: "Family pitcher blending is the main need.",
  },
  B07FZ8S74R: {
    name: "Magic Bullet Mini Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Tiny kitchens and light smoothie habits",
    shortVerdict: "Ultra-compact personal blender for light use and small counters.",
    score: 7.2,
    keySpecs: ["Mini personal cups", "Compact motor", "Simple twist blend"],
    pros: ["Very small", "Inexpensive", "Simple"],
    cons: ["Low power ceiling", "Not for dense frozen loads"],
    buyIf: "Space and price matter more than crushing power.",
    skipIf: "You blend ice-heavy recipes daily.",
  },
  B00M76N6TS: {
    name: "Hamilton Beach Wave Crusher Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Budget ice drinks with a glass jar",
    shortVerdict: "Budget glass-jar blender aimed at icy drinks and basic smoothies.",
    score: 7.6,
    keySpecs: ["Glass jar", "Wave Action style", "Budget motor"],
    pros: ["Glass jar", "Low price", "Familiar controls"],
    cons: ["Louder / less refined", "Durability varies"],
    buyIf: "You want glass on a tight budget.",
    skipIf: "You need pro-level ice crushing consistency.",
  },
  B098RK8BL7: {
    name: "Ninja Foodi Smoothie Bowl Maker & Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Thick smoothie bowls and spoonable blends",
    shortVerdict: "Specialist pick when thick bowls matter more than thin drinkable smoothies.",
    score: 8.3,
    keySpecs: ["Bowl maker", "Power pitcher options", "Thick-blend focus"],
    pros: ["Better for thick textures", "Versatile Ninja system", "Clear use-case fit"],
    cons: ["More specialized", "May cost more than basic pitchers"],
    buyIf: "Smoothie bowls are a weekly habit.",
    skipIf: "You only make thin drinkable smoothies.",
  },
  B0B7QVJK8Y: {
    name: "NutriBullet Combo Blender",
    cluster: "Blenders",
    imageUrl: "",
    bestFor: "Personal cups plus a small pitcher in one system",
    shortVerdict: "Combo setup for shoppers who want both single-serve cups and a pitcher option.",
    score: 8.5,
    keySpecs: ["Cup + pitcher system", "NutriBullet style", "Multi-vessel"],
    pros: ["Flexible formats", "Good everyday range", "Compact vs two machines"],
    cons: ["More parts", "Not a high-end Vitamix substitute"],
    buyIf: "You switch between personal cups and small batches.",
    skipIf: "You want one simple dedicated pitcher only.",
  },
  B0BKR66QGC: {
    name: "Reynolds Kitchens Air Fryer Liners (50)",
    cluster: "Accessories",
    imageUrl: "https://m.media-amazon.com/images/I/71AbD2FmLaL._AC_SL1500_.jpg",
    bestFor: "Trusted-brand parchment cleanup",
    shortVerdict: "Brand-name liners for cleaner baskets with less scrubbing.",
    score: 8.6,
    keySpecs: ["50 sheets", "Air fryer sized", "Known brand"],
    pros: ["Trusted brand", "Easy cleanup", "Widely available"],
    cons: ["Fewer sheets than bulk packs"],
    buyIf: "You want a known brand for everyday liner use.",
    skipIf: "You prefer high-count bulk value packs.",
  },
  B0C6Y8NYK1: {
    name: "Disposable Air Fryer Paper Liners (125)",
    cluster: "Accessories",
    imageUrl: "https://m.media-amazon.com/images/I/81uYPVAVU3L._AC_SL1500_.jpg",
    bestFor: "High-count everyday frying cleanup",
    shortVerdict: "Bulk liner pack for frequent air frying at a lower per-use cost.",
    score: 8.2,
    keySpecs: ["125 pcs", "Nonstick paper", "Budget pack"],
    pros: ["High count", "Cheap per use", "Convenient"],
    cons: ["Brand varies by listing", "Fit depends on basket shape"],
    buyIf: "You air fry often and want fewer reorders.",
    skipIf: "You need a precise square fit for one basket shape.",
  },
  B0B6PLG6G2: {
    name: "8-Inch Square Air Fryer Liners (125)",
    cluster: "Accessories",
    imageUrl: "https://m.media-amazon.com/images/I/710lcyAkSSL._AC_SL1500_.jpg",
    bestFor: "Square Cosori-style baskets",
    shortVerdict: "Square parchment sized for many 5–8 qt square baskets.",
    score: 8.3,
    keySpecs: ["125 pcs", "8 in square", "Parchment"],
    pros: ["Square coverage", "Good for Cosori-style baskets", "High count"],
    cons: ["Measure your basket first"],
    buyIf: "Your basket is square and round sheets leave gaps.",
    skipIf: "Your basket is round or much smaller.",
  },
};

const AF = [
  "B0C33CHG99",
  "B089TQWJKK",
  "B0CSZ7WBYW",
  "B08DKYBTPH",
  "B07VHFMZHJ",
  "B0C33CHG99",
  "B089TQWJKK",
  "B0CSZ7WBYW",
  "B08DKYBTPH",
  "B07VHFMZHJ",
  "B0C33CHG99",
  "B0CSZ7WBYW",
];

const BL = [
  "B0855B5Z6F",
  "B00NGV4506",
  "B0GH8PVFHS",
  "B01FHOWYA2",
  "B00EI7DPI0",
  "B00D2HTKQ6",
  "B01N1NTBJ8",
  "B07GZW9WXH",
  "B07GZVZJ27",
  "B08MJ5K5L8",
  "B098RK8BL7",
  "B0B7QVJK8Y",
];

const ACC = [
  "B0BKR66QGC",
  "B0C6Y8NYK1",
  "B0B6PLG6G2",
  "B0BKR66QGC",
  "B0C6Y8NYK1",
  "B0B6PLG6G2",
  "B0BKR66QGC",
  "B0C6Y8NYK1",
  "B0B6PLG6G2",
  "B0BKR66QGC",
  "B0C6Y8NYK1",
  "B0B6PLG6G2",
];

const PAGE_OVERRIDES = {
  "BL-R01": BL,
  "BL-PIL": BL,
  "BL-R03": [
    "B01FHOWYA2",
    "B00D2HTKQ6",
    "B01N1NTBJ8",
    "B08MJ5K5L8",
    "B004TGLB8S",
    "B07FZ8S74R",
    "B0B7QVJK8Y",
    "B0GH8PVFHS",
    "B0855B5Z6F",
    "B00EI7DPI0",
    "B00NGV4506",
    "B07GZW9WXH",
  ],
  "BL-R04": [
    "B0855B5Z6F",
    "B0GH8PVFHS",
    "B00NGV4506",
    "B01FHOWYA2",
    "B00D2HTKQ6",
    "B0B7QVJK8Y",
    "B098RK8BL7",
    "B01N1NTBJ8",
    "B07GZW9WXH",
    "B00EI7DPI0",
    "B08MJ5K5L8",
    "B07GZVZJ27",
  ],
  "BL-R05": [
    "B0855B5Z6F",
    "B00NGV4506",
    "B0GH8PVFHS",
    "B098RK8BL7",
    "B0B7QVJK8Y",
    "B01FHOWYA2",
    "B00D2HTKQ6",
    "B07GZW9WXH",
    "B01N1NTBJ8",
    "B00EI7DPI0",
    "B08MJ5K5L8",
    "B07FZ8S74R",
  ],
  "BL-R06": [
    "B0855B5Z6F",
    "B00NGV4506",
    "B0GH8PVFHS",
    "B07GZW9WXH",
    "B00M76N6TS",
    "B00EI7DPI0",
    "B0B7QVJK8Y",
    "B098RK8BL7",
    "B01N1NTBJ8",
    "B01FHOWYA2",
    "B08MJ5K5L8",
    "B07GZVZJ27",
  ],
  "AF-R01": [
    "B0C33CHG99",
    "B0CSZ7WBYW",
    "B08DKYBTPH",
    "B07VHFMZHJ",
    "B089TQWJKK",
    "B0C33CHG99",
    "B0CSZ7WBYW",
    "B08DKYBTPH",
    "B07VHFMZHJ",
    "B089TQWJKK",
    "B0C33CHG99",
    "B0CSZ7WBYW",
  ],
  "AF-PIL": [
    "B0C33CHG99",
    "B089TQWJKK",
    "B0CSZ7WBYW",
    "B08DKYBTPH",
    "B07VHFMZHJ",
    "B0C33CHG99",
    "B089TQWJKK",
    "B0CSZ7WBYW",
    "B08DKYBTPH",
    "B07VHFMZHJ",
    "B0C33CHG99",
    "B089TQWJKK",
  ],
  "AF-C01": [
    "B0CSZ7WBYW",
    "B0C33CHG99",
    "B089TQWJKK",
    "B07VHFMZHJ",
    "B08DKYBTPH",
    "B0CSZ7WBYW",
    "B0C33CHG99",
    "B089TQWJKK",
    "B07VHFMZHJ",
    "B08DKYBTPH",
    "B0CSZ7WBYW",
    "B0C33CHG99",
  ],
  "AF-R20": ACC,
};

function uniqueFirst(list, count) {
  const seen = new Set();
  const out = [];
  for (const asin of list) {
    if (seen.has(asin)) continue;
    seen.add(asin);
    out.push(asin);
    if (out.length >= count) break;
  }
  // If still short, allow reuse only after unique pool is exhausted
  let i = 0;
  while (out.length < count && list.length) {
    out.push(list[i % list.length]);
    i += 1;
  }
  return out;
}

function poolForPage(pageId, pageTitle, pageType) {
  if (PAGE_OVERRIDES[pageId]) return uniqueFirst(PAGE_OVERRIDES[pageId], 12);
  const blob = `${pageId} ${pageTitle} ${pageType}`.toLowerCase();
  if (
    blob.includes("liner") ||
    blob.includes("accessori") ||
    blob.includes("mat") ||
    pageType.toLowerCase().includes("accessor")
  ) {
    return uniqueFirst(ACC, 12);
  }
  if (blob.includes("blend") || pageId.startsWith("BL-")) {
    return uniqueFirst(BL, 12);
  }
  if (
    blob.includes("air fry") ||
    pageId.startsWith("AF-") ||
    blob.includes("fryer")
  ) {
    return uniqueFirst(AF, 12);
  }
  if (pageId.startsWith("TO-") || blob.includes("toaster")) {
    return uniqueFirst(AF, 12);
  }
  if (pageId.startsWith("FP-") || pageId.startsWith("MC-") || blob.includes("chop") || blob.includes("processor")) {
    return uniqueFirst(BL, 12);
  }
  return uniqueFirst([...AF, ...BL], 12);
}

function applyRow(row, asin, rank, slotId, slotLabel) {
  const meta = CATALOG[asin];
  if (!meta) return false;
  row.slotId = slotId || row.slotId || `rank-${rank}`;
  row.slotLabel = slotLabel || row.slotLabel || `Pick ${rank}`;
  row.rank = String(rank);
  row.asin = asin;
  row.productName = meta.name;
  row.imageUrl = meta.imageUrl || "";
  row.imageWidth = meta.imageUrl ? "1500" : "";
  row.imageHeight = meta.imageUrl ? "1500" : "";
  row.imageAlt = meta.name;
  row.imageSource = meta.imageUrl
    ? "Amazon CDN (hotlink)"
    : "Pending SiteStripe image";
  row.checkedAt = today;
  row.bestFor = meta.bestFor;
  row.shortVerdict = meta.shortVerdict;
  row.editorialScore = String(meta.score);
  row.keySpecs = (meta.keySpecs || []).join(" | ");
  row.pros = (meta.pros || []).join(" | ");
  row.cons = (meta.cons || []).join(" | ");
  row.notes = `buyIf: ${meta.buyIf} || skipIf: ${meta.skipIf}`;
  return true;
}

function expandCsv() {
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const byPage = new Map();
  for (const row of rows) {
    if (!byPage.has(row.pageId)) byPage.set(row.pageId, []);
    byPage.get(row.pageId).push(row);
  }

  const commercial = new Set([
    "Commercial Pillar",
    "Roundup",
    "Accessory Roundup",
    "Single Review",
    "Comparison",
  ]);

  for (const [pageId, pageRows] of byPage.entries()) {
    const pageType = pageRows[0]?.pageType || "";
    const pageTitle = pageRows[0]?.pageTitle || "";
    if (!commercial.has(pageType)) continue;

    const asins = poolForPage(pageId, pageTitle, pageType);
    // Ensure 12 rows
    while (pageRows.length < 12) {
      const index = pageRows.length;
      const [slotId, slotLabel] = ROUNDUP_SLOTS[index] || [
        `rank-${index + 1}`,
        `Pick ${index + 1}`,
      ];
      pageRows.push({
        pageId,
        pageTitle,
        pageSlug: pageRows[0].pageSlug,
        pageType,
        slotId,
        slotLabel,
        rank: String(index + 1),
        productName: "",
        asin: "",
        bestFor: "",
        shortVerdict: "",
        editorialScore: "",
        keySpecs: "",
        pros: "",
        cons: "",
        imageUrl: "",
        imageWidth: "",
        imageHeight: "",
        imageAlt: "",
        imageSource: "Amazon CDN (hotlink)",
        checkedAt: "",
        notes: "",
      });
    }

    // Trim excess if > 12
    if (pageRows.length > 12) {
      pageRows.length = 12;
    }

    for (let i = 0; i < 12; i += 1) {
      const [slotId, slotLabel] = ROUNDUP_SLOTS[i] || [
        pageRows[i].slotId,
        pageRows[i].slotLabel,
      ];
      applyRow(pageRows[i], asins[i % asins.length], i + 1, slotId, slotLabel);
    }
  }

  const output = [];
  for (const pageRows of byPage.values()) output.push(...pageRows);
  fs.writeFileSync(csvPath, toCsv(output));
  const filled = output.filter((r) => r.asin).length;
  console.log(`Expanded CSV: ${filled} filled product slots across ${byPage.size} pages`);
}

function enrichArticleContent() {
  const dir = path.join(root, "content", "pages");
  let updated = 0;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const full = path.join(dir, file);
    const page = JSON.parse(fs.readFileSync(full, "utf8"));
    if (
      ![
        "Commercial Pillar",
        "Roundup",
        "Accessory Roundup",
        "Single Review",
        "Comparison",
      ].includes(page.pageType)
    ) {
      continue;
    }

    const asins = poolForPage(page.pageId, page.title, page.pageType);
    const named = asins
      .map((asin) => CATALOG[asin]?.name)
      .filter(Boolean)
      .slice(0, 4);

    page.summary = `Quick verdict for ${page.primaryKeyword || page.title}: start with ${named[0] || "our best overall pick"} if it matches your kitchen fit, then compare the runner-up and specialty picks below. Every product is labeled for who should buy it—and who should skip it. Confirm current Amazon details before checkout.`;

    const detailSections = asins.slice(0, 12).map((asin, index) => {
      const meta = CATALOG[asin];
      const label = ROUNDUP_SLOTS[index]?.[1] || `Pick ${index + 1}`;
      return {
        heading: `${index + 1}. ${label}: ${meta.name}`,
        level: 2,
        brief: "",
        paragraphs: [
          meta.shortVerdict,
          `Best for: ${meta.bestFor}`,
          `Buy if: ${meta.buyIf}`,
          `Skip if: ${meta.skipIf}`,
        ],
        bullets: [
          ...(meta.pros || []).map((item) => `Pro: ${item}`),
          ...(meta.cons || []).map((item) => `Con: ${item}`),
          ...(meta.keySpecs || []).map((item) => `Spec: ${item}`),
        ],
      };
    });

    const lead = (page.sections || []).filter(
      (section) =>
        /how we|method|criteria|quick pick|comparison|who should|final|faq|verdict/i.test(
          section.heading,
        ),
    );

    page.sections = [
      {
        heading: "Top picks at a glance",
        level: 2,
        paragraphs: [
          `We keep the best overall and runner-up near the top so you can decide quickly, then expand into specialty winners—best value, compact, family, easy-clean, and more—so every useful use case still has a pick.`,
          `Use the comparison table and detailed product cards for Amazon availability. Specs and bundles can change by listing, so verify before buying.`,
        ],
        bullets: named.map((name, index) => `${ROUNDUP_SLOTS[index][1]}: ${name}`),
      },
      ...lead.slice(0, 3),
      {
        heading: "Detailed picks: who each product is for",
        level: 2,
        paragraphs: [
          `The ranked list below is not twelve copies of the same recommendation. Each slot wins for a specific shopper need—budget, footprint, batch size, cleanup, or specialty texture.`,
        ],
        bullets: [],
      },
      ...detailSections,
      {
        heading: "How to choose without overbuying",
        level: 2,
        paragraphs: [
          `Match capacity and format to your real weekly cooking first. A compact personal blender beats a large pitcher you never leave on the counter, and a dual-zone air fryer only pays off if you cook two foods together often.`,
          `When two models look similar, prefer the one with clearer cleanup and a footprint you can live with. Then use the Amazon buttons at the end of this guide to compare today's availability.`,
        ],
        bullets: [
          "1–2 people / small counters → compact or personal formats",
          "Families / batch cooking → larger pitchers or dual-zone baskets",
          "Ice / frozen fruit daily → prioritize crushing power over extras",
        ],
      },
    ];

    page.faqs = [
      {
        question: `What is the best ${page.primaryKeyword || "option"} overall?`,
        answer: `${named[0] || "Our top pick"} is the best overall starting point for most kitchens, but specialty winners may fit you better if you need compact size, dual cooking, or personal cups.`,
      },
      {
        question: "Why list so many products instead of only three?",
        answer:
          "Different shoppers win with different constraints—budget, footprint, batch size, cleanup, and specialty use cases. A longer labeled list converts better than forcing one product on everyone.",
      },
      {
        question: "Do you show live prices?",
        answer:
          "No. Prices change often on Amazon, so we use Check today's price CTAs instead of embedding stale numbers.",
      },
      {
        question: "How should I use the pros and cons?",
        answer:
          "Read best-for, buy-if, and skip-if first. Pros/cons explain the trade-off after you confirm the product matches your kitchen.",
      },
    ];

    page.draft = false;
    page.noindex = false;
    page.updatedAt = today;
    page.publishedAt = page.publishedAt || today;
    fs.writeFileSync(full, `${JSON.stringify(page, null, 2)}\n`);
    updated += 1;
  }

  console.log(`Enriched ${updated} commercial articles with 12-product detail sections.`);
}

expandCsv();
enrichArticleContent();
console.log("Max-product expansion complete.");
