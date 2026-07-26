import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import {
  ProductCollectionExplorer,
  type CollectionBrand,
  type CollectionPreset,
  type CollectionProduct,
} from "@/components/ProductCollectionExplorer";
import { siteConfig } from "@/lib/site";

const COLLECTION_FILE = path.join(
  process.cwd(),
  "data",
  "collections",
  "air-fryer-brands.generated.json",
);

type CollectionData = {
  title: string;
  products: CollectionProduct[];
  collections: CollectionPreset[];
  brands: CollectionBrand[];
};

function loadCollection(): CollectionData {
  return JSON.parse(fs.readFileSync(COLLECTION_FILE, "utf8")) as CollectionData;
}

type PageProps = {
  searchParams: Promise<{ brand?: string; collection?: string }>;
};

export const metadata: Metadata = {
  title: "Air Fryer Brand Product Collections",
  description:
    "Filter and sort air fryer products by brand, price, rating, dual-basket, oven-style, smart features, and more.",
  alternates: { canonical: "/collections/air-fryers/" },
  openGraph: {
    title: "Air Fryer Brand Product Collections",
    description:
      "Browse every uploaded brand evidence product with filters and sorting.",
    url: `${siteConfig.siteUrl}/collections/air-fryers/`,
  },
};

export default async function AirFryerCollectionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = loadCollection();

  return (
    <main className="container-wide main-content collection-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/best-air-fryer-brands/">Best air fryer brands</Link>
          </li>
          <li aria-current="page">Collections</li>
        </ol>
      </nav>

      <header className="collection-page-header">
        <span className="eyebrow">Air Fryers</span>
        <h1>Air fryer brand collections</h1>
        <p className="dek">
          Every uploaded evidence product from the brand workbook — filter by
          brand, curated collection, rating, and sort order.
        </p>
      </header>

      <ProductCollectionExplorer
        products={data.products}
        collections={data.collections}
        brands={data.brands}
        initialBrand={params.brand || ""}
        initialCollection={params.collection || "all"}
        brandsArticleHref="/best-air-fryer-brands/"
      />
    </main>
  );
}
