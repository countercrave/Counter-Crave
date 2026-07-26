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
  _clusterName?: string,
): ProductLink[] {
  const all = getAllProductLinks();
  const direct = all
    .filter((product) => product.pageId === pageId)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  if (direct.length > 0) return direct;

  // Hub / buying-guide fallback: use pageId prefix (SM-HUB → SM), never the
  // human cluster name ("Stand Mixers"), which does not match pageIds.
  const prefix = pageId.split("-")[0]?.toUpperCase();
  if (!prefix) return [];

  const clusterProducts = all
    .filter((p) => p.pageId.toUpperCase().startsWith(`${prefix}-`))
    .sort((a, b) => {
      // Prefer pillar pages, then rank
      const aPil = a.pageId.toUpperCase().endsWith("-PIL") ? 0 : 1;
      const bPil = b.pageId.toUpperCase().endsWith("-PIL") ? 0 : 1;
      if (aPil !== bPil) return aPil - bPil;
      return (a.rank ?? 999) - (b.rank ?? 999);
    });

  const seen = new Set<string>();
  const unique: ProductLink[] = [];
  for (const prod of clusterProducts) {
    if (seen.has(prod.asin)) continue;
    seen.add(prod.asin);
    unique.push({
      ...prod,
      pageId, // associate with current hub page for tracking
    });
    if (unique.length >= 20) break;
  }
  return unique;
}
