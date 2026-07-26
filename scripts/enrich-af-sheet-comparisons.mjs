/**
 * Re-enrich AF-R26..AF-R29 from source sheets:
 * - full comparison keySpecs / chips
 * - vs-competitor beat lines
 * - richer pros/cons from sheet fields
 *
 * Usage: node scripts/enrich-af-sheet-comparisons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const today = new Date().toISOString().slice(0, 10);
const EXTRA_COLS = [
  "listPrice",
  "amazonRating",
  "ratingCount",
  "vsCompetitor",
  "comparisonChips",
  "comparisonScore",
];

const PAGE_SOURCES = {
  "AF-R26": {
    source: "data/glass-air-fryers.source.json",
    scoreKey: "Glass Air Fryer Comparison Score",
    pageTitle: "Best Glass Air Fryers",
    pageSlug: "best-glass-air-fryer",
  },
  "AF-R27": {
    source: "data/large-air-fryers.source.json",
    scoreKey: "Comparison Score",
    pageTitle: "Best Large Air Fryers",
    pageSlug: "best-large-air-fryer",
  },
  "AF-R28": {
    source: "data/air-fryer-microwave-combo.source.json",
    scoreKey: "Comparison Score",
    pageTitle: "Best Air Fryer Microwave Combos",
    pageSlug: "best-air-fryer-microwave-combo",
  },
  "AF-R29": {
    source: "data/ninja-air-fryers.source.json",
    scoreKey: "Comparison Score",
    pageTitle: "Best Ninja Air Fryers",
    pageSlug: "best-ninja-air-fryer",
  },
};

function fixText(value) {
  return String(value || "")
    .replace(/\u00e2\u20ac\u201c|\u00e2\u20ac\u201d|â€“|â€”/g, "–")
    .replace(/\u00e2\u20ac\u2122|â€™/g, "'")
    .replace(/\u00e2\u20ac\u0153|\u00e2\u20ac\u009d|â€œ|â€/g, '"')
    .replace(/\u00c2\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitList(value) {
  return String(value || "")
    .split(/\s*\|\s*|\n+|;\s*/)
    .map((part) => fixText(part))
    .filter(Boolean);
}

function titleOf(row) {
  return fixText(String(row.Title || "").split("|")[0]);
}

function shortName(row) {
  const brand = fixText(row.Brand || "");
  const title = titleOf(row);
  const core = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").slice(0, 42);
  return brand ? `${brand} ${core}`.trim() : core;
}

function normalizePrice(value) {
  const text = fixText(value);
  if (!text || /unavailable|high price/i.test(text)) return "";
  if (text.startsWith("$")) return text;
  const num = text.replace(/[^\d.]/g, "");
  return num ? `$${num}` : "";
}

function normalizeRating(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : "";
}

function normalizeReviews(value) {
  return String(value || "").trim().replace(/[^\d,]/g, "");
}

function imageOf(row) {
  const raw = String(row["Main Image URL"] || "").trim();
  if (!/^https:\/\/(m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\//.test(raw)) {
    return "";
  }
  if (raw.includes("images-na.ssl-images-amazon.com")) return raw;
  if (raw.includes("._AC_")) return raw.replace(/\._AC_[A-Z0-9,]+_\./, "._AC_SL1500_.");
  return raw.replace(/\.(jpg|jpeg|png)$/i, "._AC_SL1500_.$1");
}

function aboutOf(row) {
  return splitList(row["About this item"] || row["About this Item"] || "")
    .slice(0, 8)
    .join(" | ");
}

function scoreOf(row, key) {
  return Number(row[key]) || 0;
}

function parseQt(row) {
  const text = `${row.Capacity || ""} ${row.Title || ""}`;
  const qt = text.match(/(\d+(?:\.\d+)?)\s*(?:qt|quart)/i);
  if (qt) return Number(qt[1]);
  const cu = text.match(/(\d+(?:\.\d+)?)\s*cu\.?\s*ft/i);
  if (cu) return Number(cu[1]) * 30;
  return null;
}

function buildChips(row, pageId) {
  const chips = [];
  if (row.Capacity) chips.push(fixText(row.Capacity));
  if (row["Model Family"]) chips.push(fixText(row["Model Family"]));
  if (row["Air Fryer Type"]) chips.push(fixText(String(row["Air Fryer Type"]).slice(0, 36)));
  if (row["Combo Type"]) chips.push(fixText(String(row["Combo Type"]).slice(0, 40)));
  if (row.Wattage) chips.push(fixText(row.Wattage));
  if (row["Max Listed Temperature"]) chips.push(`Max ${fixText(row["Max Listed Temperature"])}`);
  if (row["Value Tier"]) chips.push(fixText(row["Value Tier"]));
  if (row["Large-Capacity Fit"]) chips.push(`Fit: ${fixText(row["Large-Capacity Fit"])}`);
  if (row["Full Glass Cooking Vessel"] === "Yes") chips.push("Full glass vessel");
  if (/pfas-?free/i.test(row["PFAS/PTFE/PFOA Claim"] || row["Coating / Material Claims"] || "")) {
    chips.push("PFAS-free claim");
  }
  if (/yes/i.test(String(row["Inverter Technology"] || ""))) chips.push("Inverter");
  if (/yes/i.test(String(row.Convection || ""))) chips.push("Convection");
  if (row["Estimated Household Size"]) {
    chips.push(fixText(String(row["Estimated Household Size"]).slice(0, 28)));
  }
  if (row["Estimated Servings"]) {
    chips.push(fixText(String(row["Estimated Servings"]).slice(0, 28)));
  }
  if (pageId === "AF-R29" && row["Basket / Cooking Configuration"]) {
    chips.push(fixText(String(row["Basket / Cooking Configuration"]).slice(0, 36)));
  }
  return [...new Set(chips.filter(Boolean))].slice(0, 8);
}

function buildSpecs(row, pageId) {
  const parts = [];
  const push = (label, value) => {
    const v = fixText(value);
    if (v) parts.push(`${label}: ${v.slice(0, 90)}`);
  };
  push("Capacity", row.Capacity);
  push("Type", row["Air Fryer Type"] || row["Combo Type"]);
  push("Model family", row["Model Family"]);
  push("Basket / config", row["Basket / Cooking Configuration"]);
  push("Household", row["Estimated Household Size"]);
  push("Servings", row["Estimated Servings"]);
  push("Family fit", row["Family Size Fit"]);
  push("Large fit", row["Large-Capacity Fit"]);
  push("Glass", row["Glass Construction Type"]);
  push("Full glass vessel", row["Full Glass Cooking Vessel"]);
  push("Window only", row["Viewing Window Only"]);
  push("Glass material", row["Glass Material"]);
  push("Materials claim", row["PFAS/PTFE/PFOA Claim"] || row["Coating / Material Claims"]);
  push("Wattage", row.Wattage);
  push("Max temp", row["Max Listed Temperature"]);
  push("Inverter", row["Inverter Technology"]);
  push("Sensor cooking", row["Sensor Cooking"]);
  push("Convection", row.Convection);
  push("Broil", row.Broil);
  push("Presets", row["Presets / Function Count"]);
  push("Functions", row["Cooking Functions"]);
  push("Smart features", row["Smart / Special Features"]);
  push("Footprint", row.Footprint || row["Footprint / Installation"]);
  push("Value tier", row["Value Tier"]);
  push("Dimensions", row.Dimensions || row.Measurements);
  push("Care", row["Materials & Care"]);
  if (pageId && parts.length > 10) return parts.slice(0, 10).join(" | ");
  return parts.slice(0, 10).join(" | ");
}

function formatPro(text) {
  const clean = fixText(text);
  const labeled = clean.match(/^([^:]{2,48}):\s*(.+)$/);
  if (labeled) {
    return `${labeled[1].toUpperCase()}: ${labeled[2]}`;
  }
  // Promote first few words as a label when possible
  const words = clean.split(" ");
  if (words.length > 4) {
    const label = words.slice(0, 3).join(" ").replace(/[^a-z0-9\s-]/gi, "").trim();
    if (label.length >= 6) {
      return `${label.toUpperCase()}: ${words.slice(3).join(" ")}`;
    }
  }
  return clean;
}

function beatsLine(row, competitor, scoreKey) {
  if (!competitor) return "";
  const wins = [];
  const aScore = scoreOf(row, scoreKey);
  const bScore = scoreOf(competitor, scoreKey);
  const aRating = Number(row.Rating) || 0;
  const bRating = Number(competitor.Rating) || 0;
  const aQt = parseQt(row);
  const bQt = parseQt(competitor);
  const aPrice = Number(String(row.Price || "").replace(/[^\d.]/g, "")) || 0;
  const bPrice = Number(String(competitor.Price || "").replace(/[^\d.]/g, "")) || 0;

  if (aScore && bScore && aScore > bScore + 0.4) {
    wins.push(`higher comparison score (${aScore.toFixed(1)} vs ${bScore.toFixed(1)})`);
  }
  if (aRating && bRating && aRating > bRating + 0.05) {
    wins.push(`stronger Amazon rating (${aRating} vs ${bRating})`);
  }
  if (aQt != null && bQt != null && aQt > bQt * 1.08) {
    wins.push(`more listed capacity (${row.Capacity} vs ${competitor.Capacity})`);
  }
  if (aPrice && bPrice && aPrice < bPrice * 0.92) {
    wins.push(`lower listed price ($${aPrice} vs $${bPrice})`);
  }

  // Feature wins from sheet language
  const aText = `${row.Title} ${row["Cooking Functions"] || ""} ${row["Smart / Special Features"] || ""} ${row["PFAS/PTFE/PFOA Claim"] || ""} ${row["Coating / Material Claims"] || ""} ${row["Glass Construction Type"] || ""} ${row["Inverter Technology"] || ""}`;
  const bText = `${competitor.Title} ${competitor["Cooking Functions"] || ""} ${competitor["Smart / Special Features"] || ""} ${competitor["PFAS/PTFE/PFOA Claim"] || ""} ${competitor["Coating / Material Claims"] || ""} ${competitor["Glass Construction Type"] || ""} ${competitor["Inverter Technology"] || ""}`;
  const featureChecks = [
    [/dual.?zone|double.?stack|two (basket|drawer)/i, "dual-zone / two-basket cooking"],
    [/glass/i, "glass cooking visibility"],
    [/pfas-?free/i, "clearer PFAS-free materials language"],
    [/inverter/i, "inverter microwave heating"],
    [/maxcrisp|hi-?fry|450/i, "higher-heat / crisp boost modes"],
    [/probe|thermometer|smart cook/i, "probe / smart cook features"],
    [/grill/i, "grill-style browning"],
    [/dehydr/i, "dehydrate function"],
  ];
  for (const [re, label] of featureChecks) {
    if (re.test(aText) && !re.test(bText)) wins.push(label);
  }

  if (!wins.length) {
    const bestFor = fixText(row["Best For"] || "");
    if (bestFor) {
      return `Compared with ${shortName(competitor)}: clearer fit for ${bestFor.slice(0, 90)}.`;
    }
    return `Compared with ${shortName(competitor)}: a close alternative — check capacity and features for your kitchen.`;
  }

  return `Beats ${shortName(competitor)} on ${wins.slice(0, 3).join("; ")}.`;
}

function pickCompetitor(row, peers, scoreKey) {
  const others = peers.filter((p) => p.ASIN !== row.ASIN);
  if (!others.length) return null;
  const qt = parseQt(row);
  const scored = others.map((p) => {
    let closeness = Math.abs(scoreOf(p, scoreKey) - scoreOf(row, scoreKey));
    const pQt = parseQt(p);
    if (qt != null && pQt != null) closeness += Math.abs(qt - pQt) * 0.8;
    if (fixText(p.Brand) === fixText(row.Brand)) closeness += 2;
    return { p, closeness };
  });
  scored.sort((a, b) => a.closeness - b.closeness);
  return scored[0]?.p || null;
}

function editorial(row, competitor, scoreKey) {
  const brand = fixText(row.Brand) || "This";
  const bestFor =
    fixText(row["Best For"] || row["Who Should Buy"]) ||
    `${brand} shoppers comparing sheet-backed picks on this page`;
  const buyIf =
    fixText(row["Who Should Buy"]) ||
    `You want ${bestFor.slice(0, 100)}.`;
  const skipIf =
    fixText(row["Who Should Skip"]) ||
    "Another ranked pick fits your capacity, footprint, or budget better.";
  const prosRaw = splitList(row["Key Pros"]);
  const consRaw = splitList(row["Key Cons"]);
  const about = splitList(row["About this item"] || row["About this Item"])[0] || "";
  const sc = scoreOf(row, scoreKey);
  // Keep sheet Comparison Score fidelity on a /10 meter (91.9 → 9.2).
  const score = sc > 0 ? (Math.min(10, Math.max(0, sc / 10))).toFixed(1) : "8.0";

  let shortVerdict = about;
  const fitBits = [
    row["Model Family"],
    row["Large-Capacity Fit"],
    row["Glass Construction Type"],
    row["Combo Type"],
    row["Air Fryer Type"],
  ]
    .map(fixText)
    .filter(Boolean);
  shortVerdict = `${brand}${row.Capacity ? ` (${fixText(row.Capacity)})` : ""}${
    fitBits[0] ? ` — ${fitBits[0]}` : ""
  }. ${about ? about.slice(0, 150) : fixText(row["Best For"]) || "A practical sheet-backed pick for this category."}`;
  shortVerdict = fixText(shortVerdict).slice(0, 340);

  const pros = (prosRaw.length ? prosRaw : [
    row.Capacity ? `CAPACITY: ${fixText(row.Capacity)} for this use case` : "CAPACITY: Confirm on Amazon",
    fitBits[0] ? `FORMAT: ${fitBits[0]}` : `BRAND: ${brand} everyday performance`,
    row["Value Tier"] ? `VALUE: ${fixText(row["Value Tier"])} tier` : "VALUE: Re-check live Amazon pricing",
  ]).map(formatPro).slice(0, 5);

  const cons = (consRaw.length ? consRaw : [
    "Listing specs and accessories can change",
    "Confirm footprint and care instructions before buying",
  ]).map(fixText).slice(0, 4);

  return {
    bestFor: bestFor.slice(0, 160),
    shortVerdict,
    pros,
    cons,
    buyIf: buyIf.slice(0, 200),
    skipIf: skipIf.slice(0, 200),
    score,
    vsCompetitor: beatsLine(row, competitor, scoreKey).slice(0, 280),
  };
}

let catalog = parseCsv(fs.readFileSync(csvPath, "utf8"));
const priorByPage = {};
for (const row of catalog) {
  if (!PAGE_SOURCES[row.pageId]) continue;
  if (!priorByPage[row.pageId]) priorByPage[row.pageId] = [];
  priorByPage[row.pageId].push({ asin: row.asin, slotLabel: row.slotLabel });
}

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

const enrichIds = new Set(Object.keys(PAGE_SOURCES));
catalog = catalog
  .filter((row) => !enrichIds.has(row.pageId))
  .map((row) => {
    const next = {};
    for (const header of headers) next[header] = row[header] ?? "";
    return next;
  });

for (const [pageId, meta] of Object.entries(PAGE_SOURCES)) {
  const sourcePath = path.join(root, meta.source);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`skip ${pageId}: missing ${meta.source}`);
    continue;
  }
  const rows = JSON.parse(fs.readFileSync(sourcePath, "utf8")).filter((r) => r.ASIN);
  const existingOrder = (priorByPage[pageId] || []).map((r) => r.asin);
  const labelByAsin = Object.fromEntries(
    (priorByPage[pageId] || []).map((r) => [r.asin, r.slotLabel]),
  );
  const byAsin = Object.fromEntries(rows.map((r) => [r.ASIN, r]));
  const ordered = [];
  const seen = new Set();
  for (const asin of existingOrder) {
    if (byAsin[asin] && !seen.has(asin)) {
      seen.add(asin);
      ordered.push(byAsin[asin]);
    }
  }
  for (const row of rows.sort((a, b) => scoreOf(b, meta.scoreKey) - scoreOf(a, meta.scoreKey))) {
    if (!seen.has(row.ASIN)) {
      seen.add(row.ASIN);
      ordered.push(row);
    }
  }

  let rank = 0;
  for (const source of ordered) {
    const asin = source.ASIN;
    const image = imageOf(source) || existingImageByAsin[asin] || "";
    if (!image) {
      console.warn(`${pageId}: skip ${asin} (no image)`);
      continue;
    }
    rank += 1;
    const competitor = pickCompetitor(source, ordered, meta.scoreKey);
    const ed = editorial(source, competitor, meta.scoreKey);
    const chips = buildChips(source, pageId);
    const sheetScore = scoreOf(source, meta.scoreKey);

    catalog.push({
      pageId,
      pageTitle: meta.pageTitle,
      pageSlug: meta.pageSlug,
      pageType: "Roundup",
      slotId: `rank-${rank}`,
      slotLabel: labelByAsin[asin] || (rank === 1 ? "Best overall" : `Pick ${rank}`),
      rank: String(rank),
      productName: titleOf(source),
      asin,
      bestFor: ed.bestFor,
      shortVerdict: ed.shortVerdict,
      editorialScore: ed.score,
      comparisonScore: sheetScore > 0 ? String(sheetScore) : "",
      keySpecs: buildSpecs(source, pageId),
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
      vsCompetitor: ed.vsCompetitor,
      comparisonChips: chips.join(" | "),
      notes: `buyIf: ${ed.buyIf} || skipIf: ${ed.skipIf}`,
    });
  }
  console.log(`${pageId}: enriched ${rank} products with full sheet comparison fields`);
}

fs.writeFileSync(csvPath, toCsv(catalog));
console.log(`CSV total ${catalog.length}`);
