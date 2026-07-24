import fs from "node:fs";
import path from "node:path";

const contentDirectories = [
  path.join(process.cwd(), "content", "static"),
  path.join(process.cwd(), "content", "pages"),
];

const requiredFields = [
  "pageId",
  "title",
  "slug",
  "canonicalPath",
  "description",
  "pageType",
  "priority",
  "cluster",
  "primaryKeyword",
  "draft",
  "noindex",
];

const pages = [];
const errors = [];

for (const directory of contentDirectories) {
  for (const filename of fs.readdirSync(directory)) {
    if (!filename.endsWith(".json")) continue;

    const fullPath = path.join(directory, filename);
    const page = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    pages.push({ ...page, filename });

    for (const field of requiredFields) {
      if (page[field] === undefined || page[field] === null || page[field] === "") {
        errors.push(`${filename}: missing required field ${field}`);
      }
    }

    if (page.canonicalPath !== `/${page.slug}/`) {
      errors.push(
        `${filename}: canonicalPath must equal /slug/ (${page.canonicalPath})`,
      );
    }

    if (!page.draft) {
      if (!page.summary || page.summary.length < 40) {
        errors.push(`${filename}: published page needs a useful summary`);
      }

      const populatedSections = (page.sections || []).filter(
        (section) =>
          (section.paragraphs || []).length ||
          (section.bullets || []).length,
      );

      if (populatedSections.length === 0) {
        errors.push(`${filename}: published page needs populated sections`);
      }
    }
  }
}

for (const field of ["pageId", "slug", "canonicalPath"]) {
  const groups = new Map();

  for (const page of pages) {
    const value = page[field];
    groups.set(value, [...(groups.get(value) || []), page.filename]);
  }

  for (const [value, filenames] of groups.entries()) {
    if (filenames.length > 1) {
      errors.push(
        `Duplicate ${field} ${value}: ${filenames.join(", ")}`,
      );
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${pages.length} content files.`);
