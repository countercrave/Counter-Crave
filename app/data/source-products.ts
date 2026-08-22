import sourceProductData from "./source-product-listings.json";

export type SourceProduct = {
  position: number;
  asin: string;
  title: string;
  image: string;
  originalImage: string;
  amazonUrl: string;
};

type SourceProductPayload = {
  generatedFrom: string;
  totalArticleProductEntries: number;
  sourceFiles: Record<string, string>;
  listings: Record<string, SourceProduct[]>;
};

const payload = sourceProductData as SourceProductPayload;

export function getSourceProducts(slug: string): SourceProduct[] {
  return payload.listings[slug] ?? [];
}

export function getSourceFileName(slug: string): string | undefined {
  return payload.sourceFiles[slug];
}

export const totalSourceProductEntries = payload.totalArticleProductEntries;
export const uniqueSourceAsinCount = new Set(
  Object.values(payload.listings).flat().map((product) => product.asin),
).size;
