import fs from "node:fs";
import path from "node:path";

const pagesDir = path.join(process.cwd(), "content", "pages");
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".json"));

let totalRemovedSections = 0;
let updatedFiles = 0;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.sections || !Array.isArray(data.sections)) continue;

  const originalLength = data.sections.length;

  // Filter out sections that are redundant product writeups matching "1. Best overall...", "2. Runner-up...", etc.
  const cleanedSections = data.sections.filter((section) => {
    const heading = section.heading || "";
    // If heading starts with a number like "1. ", "2. ", "3. ", or "Pick 1:", "Pick 2:"
    const isNumberedProductHeading = /^\d+\.\s+|(?:best|runner-up|pick\s+\d+|also\s+worth)/i.test(heading);
    return !isNumberedProductHeading;
  });

  if (cleanedSections.length < originalLength) {
    totalRemovedSections += originalLength - cleanedSections.length;
    data.sections = cleanedSections;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    updatedFiles++;
  }
}

console.log(
  `Cleaned duplicate product sections: removed ${totalRemovedSections} redundant sections across ${updatedFiles} content files.`,
);
