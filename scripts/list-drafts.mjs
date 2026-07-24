import fs from "node:fs";
import path from "node:path";

const directory = path.join(process.cwd(), "content", "pages");
const drafts = fs
  .readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .map((file) =>
    JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")),
  )
  .filter((page) => page.draft)
  .sort((a, b) => a.priority.localeCompare(b.priority));

for (const page of drafts) {
  console.log(
    `${page.priority}\t${page.pageId}\t${page.pageType}\t${page.title}`,
  );
}

console.log(`\n${drafts.length} draft pages.`);
