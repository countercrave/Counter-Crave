import { getCatalogProduct, getListing, type CatalogProduct } from "./catalog";
import type { Guide, GuidePick } from "./guide-data";
import { getProduct, type Product } from "./site-data";
import type { PickView } from "../components/PickCard";

export type ResolvedPick =
  | { kind: "catalog"; pick: GuidePick; product: CatalogProduct }
  | { kind: "curated"; pick: GuidePick; product: Product };

/** Resolve a guide's picks to Amazon-backed product records. */
export function resolvePicks(guide: Guide): ResolvedPick[] {
  const listing = getListing(guide.slug);
  return guide.picks.flatMap<ResolvedPick>((pick) => {
    if (pick.sourceAsin) {
      const product = listing.find((item) => item.asin === pick.sourceAsin) ?? getCatalogProduct(pick.sourceAsin);
      return product ? [{ kind: "catalog", pick, product }] : [];
    }
    if (pick.productId) {
      const product = getProduct(pick.productId);
      return product ? [{ kind: "curated", pick, product }] : [];
    }
    return [];
  });
}

export function pickView(resolved: ResolvedPick, index: number): PickView {
  const { pick } = resolved;
  if (resolved.kind === "catalog") {
    const product = resolved.product;
    return {
      key: `${product.asin}-${index}`,
      award: pick.award,
      reason: pick.reason,
      watchout: pick.watchout,
      name: product.name,
      brandLine: product.brand ? `${product.brand} · ${product.format}` : product.format,
      image: product.image,
      imageAlt: product.title,
      specs: product.specs,
      pros: product.pros,
      cons: product.cons,
      buyUrl: product.amazonUrl,
    };
  }
  const product = resolved.product;
  const catalog = getCatalogProduct(product.asin);
  return {
    key: `${product.id}-${index}`,
    award: pick.award,
    reason: pick.reason,
    watchout: pick.watchout,
    name: product.name,
    brandLine: product.format,
    image: product.image,
    imageAlt: product.imageAlt,
    specs: catalog?.specs.length ? catalog.specs : [product.capacity, product.power],
    pros: product.features,
    cons: product.cons,
    buyUrl: product.buyUrl,
  };
}

export function pickAsins(guide: Guide): Set<string> {
  return new Set(
    resolvePicks(guide).map((item) => (item.kind === "catalog" ? item.product.asin : item.product.asin)),
  );
}

/** Models compared in a guide, excluding the ones already shown as top picks. */
export function comparisonListing(guide: Guide): CatalogProduct[] {
  const picks = pickAsins(guide);
  return getListing(guide.slug).filter((product) => !picks.has(product.asin));
}

export function guideLeadImage(guide: Guide): { src: string; alt: string; count: number } {
  const first = resolvePicks(guide)[0];
  const count = getListing(guide.slug).length;
  if (!first) return { src: guide.image, alt: guide.imageAlt, count };
  if (first.kind === "catalog") return { src: first.product.image, alt: first.product.title, count };
  return { src: first.product.image, alt: first.product.imageAlt, count };
}

export const categoryNames: Record<Guide["category"], string> = {
  "air-fryers": "Air fryers",
  blenders: "Blenders",
  "rice-cookers": "Rice cookers",
  "coffee-makers": "Coffee makers",
  "vacuum-sealers": "Vacuum sealers",
  "wine-coolers": "Wine coolers",
  "pizza-ovens": "Pizza ovens",
};

export const categorySubjects: Record<Guide["category"], string> = {
  "air-fryers": "air fryer",
  blenders: "blender",
  "rice-cookers": "rice cooker",
  "coffee-makers": "coffee maker",
  "vacuum-sealers": "vacuum sealer",
  "wine-coolers": "wine cooler",
  "pizza-ovens": "pizza oven",
};

export function guideLabel(guide: Guide) {
  if (guide.contentType === "recipe") return "Recipe";
  if (guide.contentType === "cleaning") return "Cleaning guide";
  if (guide.contentType === "ideas") return "Cooking ideas";
  return categoryNames[guide.category];
}

export function readMinutes(guide: Guide, comparedCount: number) {
  const base = Number.parseInt(guide.readTime, 10) || 12;
  return Math.max(base, Math.round(10 + comparedCount * 0.3));
}
