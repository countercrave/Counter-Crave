import fs from "node:fs";
import path from "node:path";
import type { ProductLink } from "@/types/content";

const PRODUCT_FILE = path.join(
  process.cwd(),
  "data",
  "product-links.generated.json",
);

export function getAllProductLinks(): ProductLink[] {
  if (!fs.existsSync(PRODUCT_FILE)) return [];

  const parsed = JSON.parse(
    fs.readFileSync(PRODUCT_FILE, "utf8"),
  ) as ProductLink[];

  return parsed;
}

export function getProductsForPage(pageId: string): ProductLink[] {
  return getAllProductLinks().filter((product) => product.pageId === pageId);
}
