"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AmazonLink } from "@/components/AmazonLink";
import { ProductImage } from "@/components/ProductImage";

export type CollectionProduct = {
  id: string;
  brand: string;
  brandSlug: string;
  logoUrl?: string;
  asin: string;
  productName: string;
  imageUrl?: string;
  listPrice?: string;
  priceValue?: number | null;
  amazonRating?: string;
  ratingValue?: number | null;
  ratingCount?: string;
  ratingCountValue?: number;
  affiliateUrl: string;
  collectionTags: string[];
};

export type CollectionPreset = {
  id: string;
  title: string;
  description: string;
  filter: { tags?: string[]; brandSlug?: string };
};

export type CollectionBrand = {
  brand: string;
  brandSlug: string;
  logoUrl?: string;
  award?: string;
};

type ProductCollectionExplorerProps = {
  products: CollectionProduct[];
  collections: CollectionPreset[];
  brands: CollectionBrand[];
  pageId?: string;
  initialBrand?: string;
  initialCollection?: string;
  brandsArticleHref?: string;
};

type SortKey = "featured" | "price-asc" | "price-desc" | "rating-desc" | "reviews-desc" | "name-asc";

export function ProductCollectionExplorer({
  products,
  collections,
  brands,
  pageId = "AF-COL-BRANDS",
  initialBrand = "",
  initialCollection = "all",
  brandsArticleHref = "/best-air-fryer-brands/",
}: ProductCollectionExplorerProps) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(initialBrand);
  const [collectionId, setCollectionId] = useState(
    initialBrand ? initialBrand : initialCollection || "all",
  );
  const [sort, setSort] = useState<SortKey>("featured");
  const [minRating, setMinRating] = useState(0);

  const activeCollection =
    collections.find((c) => c.id === collectionId) ||
    collections.find((c) => c.id === "all") ||
    collections[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = [...products];

    if (brand) {
      rows = rows.filter((p) => p.brandSlug === brand);
    }

    if (activeCollection?.filter.brandSlug) {
      rows = rows.filter((p) => p.brandSlug === activeCollection.filter.brandSlug);
    } else if (activeCollection?.filter.tags?.length) {
      const tags = activeCollection.filter.tags;
      if (!tags.includes("all")) {
        rows = rows.filter((p) => tags.some((tag) => p.collectionTags.includes(tag)));
      }
    }

    if (minRating > 0) {
      rows = rows.filter((p) => (p.ratingValue || 0) >= minRating);
    }

    if (q) {
      rows = rows.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.asin.toLowerCase().includes(q),
      );
    }

    rows.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (a.priceValue ?? 99999) - (b.priceValue ?? 99999);
        case "price-desc":
          return (b.priceValue ?? 0) - (a.priceValue ?? 0);
        case "rating-desc":
          return (b.ratingValue ?? 0) - (a.ratingValue ?? 0);
        case "reviews-desc":
          return (b.ratingCountValue ?? 0) - (a.ratingCountValue ?? 0);
        case "name-asc":
          return a.productName.localeCompare(b.productName);
        default:
          return (b.ratingCountValue ?? 0) - (a.ratingCountValue ?? 0);
      }
    });

    return rows;
  }, [products, brand, activeCollection, minRating, query, sort]);

  const themeCollections = collections.filter((c) => !brands.some((b) => b.brandSlug === c.id));
  const brandCollections = collections.filter((c) => brands.some((b) => b.brandSlug === c.id));

  return (
    <section className="collection-explorer" aria-label="Product collections">
      <div className="collection-explorer-intro">
        <p>
          Filter and sort every uploaded brand evidence product. Start from a
          curated collection, a brand, or free search.{" "}
          <Link href={brandsArticleHref}>Back to brand guide</Link>
        </p>
      </div>

      <div className="collection-presets" aria-label="Curated collections">
        {themeCollections.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={
              collectionId === preset.id && !brand
                ? "collection-preset active"
                : "collection-preset"
            }
            onClick={() => {
              setCollectionId(preset.id);
              setBrand("");
            }}
          >
            {preset.title}
          </button>
        ))}
      </div>

      <div className="collection-controls">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Brand, product, ASIN…"
          />
        </label>
        <label>
          <span>Brand</span>
          <select
            value={brand}
            onChange={(e) => {
              const next = e.target.value;
              setBrand(next);
              if (next) setCollectionId(next);
              else setCollectionId("all");
            }}
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.brandSlug} value={b.brandSlug}>
                {b.brand}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Min rating</span>
          <select
            value={String(minRating)}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value="0">Any</option>
            <option value="4">4.0+</option>
            <option value="4.3">4.3+</option>
            <option value="4.5">4.5+</option>
            <option value="4.7">4.7+</option>
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="featured">Most reviewed</option>
            <option value="rating-desc">Highest rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="reviews-desc">Most reviews</option>
            <option value="name-asc">Name A–Z</option>
          </select>
        </label>
      </div>

      <div className="collection-active">
        <div>
          <strong>{activeCollection?.title || "All products"}</strong>
          <p>{activeCollection?.description}</p>
        </div>
        <span className="collection-count">{filtered.length} products</span>
      </div>

      <div className="collection-brand-chips" aria-label="Brand collections">
        {brandCollections.map((preset) => {
          const meta = brands.find((b) => b.brandSlug === preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              className={
                collectionId === preset.id || brand === preset.id
                  ? "collection-brand-chip active"
                  : "collection-brand-chip"
              }
              onClick={() => {
                setCollectionId(preset.id);
                setBrand(preset.id);
              }}
            >
              {meta?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.logoUrl} alt="" width={18} height={18} />
              ) : null}
              <span>{meta?.brand || preset.title}</span>
            </button>
          );
        })}
      </div>

      {filtered.length ? (
        <ul className="collection-product-grid">
          {filtered.map((product) => (
            <li key={product.id} className="collection-product-card">
              <div className="collection-product-media">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.productName}
                  width={600}
                  height={600}
                />
                {product.logoUrl ? (
                  <div className="brand-logo-badge brand-logo-badge-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.logoUrl}
                      alt={`${product.brand} logo`}
                      width={48}
                      height={48}
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
              <div className="collection-product-body">
                <span className="collection-product-brand">{product.brand}</span>
                <h3>{product.productName}</h3>
                <div className="collection-product-stats">
                  {product.listPrice ? <strong>{product.listPrice}</strong> : null}
                  {product.amazonRating ? (
                    <span>
                      ★ {product.amazonRating}
                      {product.ratingCount ? ` · ${product.ratingCount}` : ""}
                    </span>
                  ) : null}
                </div>
                <AmazonLink
                  asin={product.asin}
                  pageId={pageId}
                  productName={product.productName}
                  placement={`collection-${product.brandSlug}`}
                  className="button button-primary collection-product-cta"
                >
                  Buy on Amazon
                </AmazonLink>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="collection-empty">No products match these filters.</p>
      )}
    </section>
  );
}
