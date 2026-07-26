import fs from "node:fs";
import XLSX from "xlsx";

function injectNinja() {
  const wb = XLSX.readFile(
    "c:/Users/PC/Downloads/best_ninja_air_fryers_comparison.xlsx",
  );
  const guide = XLSX.utils.sheet_to_json(wb.Sheets["Ninja Model Guide"], {
    defval: "",
  });
  const picks = XLSX.utils.sheet_to_json(wb.Sheets["Top Picks"], { defval: "" });
  const page = JSON.parse(
    fs.readFileSync("content/pages/af-r29-best-ninja-air-fryer.json", "utf8"),
  );
  const modelSection = {
    heading: "Ninja model families from the comparison sheet",
    level: 2,
    paragraphs: [
      "These model-family notes come from the Ninja comparison workbook — pick a format first, then compare ASINs below.",
    ],
    bullets: guide
      .filter((r) => r["Ninja Type"])
      .map(
        (r) =>
          `${r["Ninja Type"]}: best for ${r["Best Use"]}. Advantage: ${r["Main Advantage"]}. Trade-off: ${r["Main Trade-Off"]}.`,
      ),
  };
  const awardsSection = {
    heading: "Sheet award snapshot",
    level: 2,
    paragraphs: [
      "Award labels from the Top Picks worksheet — confirm live Amazon details before buying.",
    ],
    bullets: picks
      .filter((r) => r.Award)
      .map(
        (r) =>
          `${r.Award}: ${String(r.Product || "").split("|")[0].trim()} (${r["Model Family"] || "Ninja"})`,
      ),
  };
  const rest = page.sections.filter(
    (s) =>
      !/model families from the comparison|sheet award/i.test(s.heading),
  );
  page.sections = [rest[0], modelSection, awardsSection, ...rest.slice(1)];
  page.updatedAt = "2026-07-26";
  fs.writeFileSync(
    "content/pages/af-r29-best-ninja-air-fryer.json",
    JSON.stringify(page, null, 2),
  );
}

function injectGlass() {
  const wb = XLSX.readFile(
    "c:/Users/PC/Downloads/Documents/best_glass_air_fryers_comparison.xlsx",
  );
  const guide = XLSX.utils.sheet_to_json(wb.Sheets["Glass Air Fryer Guide"], {
    defval: "",
  });
  const picks = XLSX.utils.sheet_to_json(wb.Sheets["Top Picks"], { defval: "" });
  const page = JSON.parse(
    fs.readFileSync("content/pages/af-r26-best-glass-air-fryer.json", "utf8"),
  );
  const gSec = {
    heading: "Glass comparison factors from the sheet",
    level: 2,
    paragraphs: [
      "Decision factors pulled from the Glass Air Fryer Guide worksheet.",
    ],
    bullets: guide
      .filter((r) => r["Comparison Factor"])
      .map(
        (r) =>
          `${r["Comparison Factor"]}: look for ${r["What to Look For"]}. Why it matters: ${r["Why It Matters"]}.`,
      ),
  };
  const gAward = {
    heading: "Sheet award snapshot",
    level: 2,
    paragraphs: ["Awards from the Top Picks worksheet."],
    bullets: picks
      .filter((r) => r.Award)
      .map(
        (r) =>
          `${r.Award}: ${String(r.Product || "").split("|")[0].trim()}`,
      ),
  };
  const rest = page.sections.filter(
    (s) =>
      !/glass comparison factors from the sheet|sheet award/i.test(s.heading),
  );
  page.sections = [rest[0], gSec, gAward, ...rest.slice(1)];
  page.updatedAt = "2026-07-26";
  fs.writeFileSync(
    "content/pages/af-r26-best-glass-air-fryer.json",
    JSON.stringify(page, null, 2),
  );
}

injectNinja();
injectGlass();
console.log("Injected sheet guide sections into AF-R26 and AF-R29");
