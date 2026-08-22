import catalogData from "./product-catalog.json";

export type CatalogProduct = {
  asin: string;
  title: string;
  name: string;
  brand: string | null;
  image: string;
  amazonUrl: string;
  format: string;
  specs: string[];
  fit: string;
  pros: string[];
  cons: string[];
  variants: number;
};

type CatalogPayload = {
  generatedBy: string;
  totalProducts: number;
  uniqueAsins: number;
  counts: Record<string, { source: number; published: number }>;
  listings: Record<string, CatalogProduct[]>;
  index: Record<string, CatalogProduct>;
};

const catalog = catalogData as CatalogPayload;

/** Every product compared in one guide, already filtered and de-duplicated. */
export function getListing(slug: string): CatalogProduct[] {
  return catalog.listings[slug] ?? [];
}

/** Look a product up by ASIN across every guide. */
export function getCatalogProduct(asin: string): CatalogProduct | undefined {
  return catalog.index[asin];
}

export function getListingCounts(slug: string) {
  return catalog.counts[slug];
}

export const totalCatalogProducts = catalog.totalProducts;
export const uniqueCatalogAsins = catalog.uniqueAsins;
