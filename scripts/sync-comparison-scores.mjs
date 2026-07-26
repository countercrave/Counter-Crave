/**
 * Sync sheet Comparison Score onto product CSV rows for workbook-backed pages.
 * - Ranks products by sheet score (desc)
 * - Sets editorialScore to score/10 (one decimal) for the /10 meter
 * - Stores comparisonScore as the raw sheet value
 *
 * Usage: node scripts/sync-comparison-scores.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");

const PAGE_SOURCES = {
  "AF-R12": {
    source: "data/air-fryer-toaster-ovens.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R16": {
    source: "data/air-fryer-chicken-wings.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R17": {
    source: "data/air-fryer-french-fries.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R22": {
    source: "data/air-fryers-2026.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R23": {
    source: "data/non-toxic-air-fryers.source.json",
    scoreKey: "Non-Toxic Comparison Score",
  },
  "AF-R24": {
    source: "data/small-air-fryers.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R25": {
    source: "data/air-fryer-chicken-breast.source.json",
    scoreKey: "Chicken Breast Comparison Score",
  },
  "AF-R26": {
    source: "data/glass-air-fryers.source.json",
    scoreKey: "Glass Air Fryer Comparison Score",
  },
  "AF-R27": {
    source: "data/large-air-fryers.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R28": {
    source: "data/air-fryer-microwave-combo.source.json",
    scoreKey: "Comparison Score",
  },
  "AF-R29": {
    source: "data/ninja-air-fryers.source.json",
    scoreKey: "Comparison Score",
  },
};

function scoreOf(row, key) {
  const n = Number(String(row?.[key] ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toTen(score100) {
  if (!score100) return "";
  return (Math.min(10, Math.max(0, score100 / 10))).toFixed(1);
}

const catalog = parseCsv(fs.readFileSync(csvPath, "utf8"));
for (const row of catalog) {
  if (!Object.prototype.hasOwnProperty.call(row, "comparisonScore")) {
    row.comparisonScore = "";
  }
}

let updatedPages = 0;
let updatedRows = 0;

for (const [pageId, meta] of Object.entries(PAGE_SOURCES)) {
  const sourcePath = path.join(root, meta.source);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`skip ${pageId}: missing ${meta.source}`);
    continue;
  }
  const sourceRows = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const scoreByAsin = new Map();
  for (const row of sourceRows) {
    const asin = String(row.ASIN || "").trim();
    if (!asin) continue;
    scoreByAsin.set(asin, scoreOf(row, meta.scoreKey));
  }

  const pageRows = catalog.filter((r) => r.pageId === pageId);
  if (!pageRows.length) {
    console.warn(`skip ${pageId}: no CSV rows`);
    continue;
  }

  // Attach scores then sort highest first
  const ranked = pageRows
    .map((row) => ({
      row,
      score: scoreByAsin.get(String(row.asin || "").trim()) || 0,
    }))
    .sort((a, b) => b.score - a.score || String(a.row.asin).localeCompare(String(b.row.asin)));

  ranked.forEach((item, index) => {
    const rank = index + 1;
    item.row.rank = String(rank);
    item.row.slotId = `rank-${rank}`;
    if (item.score > 0) {
      item.row.comparisonScore = String(item.score);
      item.row.editorialScore = toTen(item.score);
      updatedRows += 1;
    }
  });

  updatedPages += 1;
  console.log(
    `${pageId}: ranked ${ranked.length} by ${meta.scoreKey} (top ${ranked[0]?.score || 0})`,
  );
}

fs.writeFileSync(csvPath, toCsv(catalog));
console.log(`Updated ${updatedPages} pages / ${updatedRows} scored rows`);
