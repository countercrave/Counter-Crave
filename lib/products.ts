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

export function getProductsForPage(
  pageId: string,
  clusterPrefix?: string,
): ProductLink[] {
  const all = getAllProductLinks();
  const direct = all.filter((product) => product.pageId === pageId);

  if (direct.length > 0) return direct;

  // Fallback for Hub pages or pages without direct slots: pull top products from the category cluster
  const prefix = clusterPrefix || pageId.split("-")[0];
  if (prefix) {
    const clusterProducts = all.filter((p) =>
      p.pageId.toUpperCase().startsWith(`${prefix.toUpperCase()}-`),
    );
    // Deduplicate by ASIN, taking highest ranked items first
    const seen = new Set<string>();
    const unique: ProductLink[] = [];
    for (const prod of clusterProducts) {
      if (!seen.has(prod.asin)) {
        seen.add(prod.asin);
        unique.push({
          ...prod,
          pageId, // associate with current hub page for tracking
        });
      }
      if (unique.length >= 20) break;
    }
    return unique;
  }

  return [];
}
