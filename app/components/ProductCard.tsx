import type { CatalogProduct } from "../data/catalog";
import { BuyButton, ProductPlate, ProsCons, SpecStrip } from "./ProductPlate";

export function ProductCard({ product, index }: { product: CatalogProduct; index: number }) {
  return (
    <article className="product-card" id={`model-${product.asin.toLowerCase()}`}>
      <div className="product-card-media">
        <span className="product-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <ProductPlate src={product.image} alt={product.title} size="lg" />
      </div>
      <div className="product-card-body">
        <span className="brand-line">
          {product.brand ? `${product.brand} · ` : ""}{product.format}
        </span>
        <h3 title={product.title}>{product.name}</h3>
        <SpecStrip items={product.specs} label={`${product.name} specifications`} />
        <p className="product-fit"><strong>Good for</strong> {product.fit}.</p>
        <ProsCons pros={product.pros} cons={product.cons} compact />
        {product.variants > 0 && (
          <p className="variant-note">
            Also sold in {product.variants} other {product.variants === 1 ? "finish" : "finishes"}; the link opens this one.
          </p>
        )}
        <BuyButton href={product.amazonUrl} />
      </div>
    </article>
  );
}
