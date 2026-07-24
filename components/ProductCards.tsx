import { AmazonLink } from "@/components/AmazonLink";
import { ProductImage } from "@/components/ProductImage";
import type { ProductLink } from "@/types/content";

type ProductCardsProps = {
  pageId: string;
  products: ProductLink[];
};

export function ProductCards({ pageId, products }: ProductCardsProps) {
  if (!products.length) return null;

  return (
    <section aria-labelledby="recommended-products">
      <h2 id="recommended-products">Recommended products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.trackingKey}>
            <span className="eyebrow">{product.slotLabel}</span>
            <ProductImage
              src={product.imageUrl}
              alt={product.imageAlt || product.productName}
              width={product.imageWidth}
              height={product.imageHeight}
            />
            <h3>{product.productName}</h3>
            <AmazonLink
              asin={product.asin}
              pageId={pageId}
              productName={product.productName}
              placement={product.slotId}
            />
            {product.checkedAt ? (
              <small>Product details checked {product.checkedAt}</small>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
