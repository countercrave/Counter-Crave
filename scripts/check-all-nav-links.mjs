import fs from "node:fs";
import path from "node:path";
import { categoryHubs } from "../lib/categories.ts";
import { getAllPages } from "../lib/content.ts";

const allPages = getAllPages({ includeDrafts: true });
const existingSlugs = new Set(allPages.map((p) => p.slug));

console.log("Checking all Category Hub slugs:");
for (const hub of categoryHubs) {
  const isLive = existingSlugs.has(hub.slug);
  console.log(`${hub.name} (/${hub.slug}/): ${isLive ? "OK" : "MISSING (404)"}`);
}
