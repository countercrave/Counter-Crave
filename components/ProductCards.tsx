import { AmazonLink } from "@/components/AmazonLink";
import { ProductImage } from "@/components/ProductImage";
import type { ProductLink } from "@/types/content";

type ProductCardsProps = {
  pageId: string;
  products: ProductLink[];
  compact?: boolean;
};

export function ProductCards({
  pageId,
  products,
  compact = false,
}: ProductCardsProps) {
  if (!products.length) return null;

  return (
    <section
      id={compact ? "top-picks" : "detailed-product-picks"}
      aria-labelledby={compact ? "top-picks-heading" : "detailed-picks-heading"}
    >
      <div className="section-kicker">
        {compact ? "Quick recommendations" : "Full recommendations"}
      </div>
      <h2 id={compact ? "top-picks-heading" : "detailed-picks-heading"}>
        {compact
          ? "Top picks at a glance"
          : "All recommended products — who each one is for"}
      </h2>
      {!compact ? (
        <p className="section-intro">
          Best overall stays near the top. The full list below keeps specialty
          winners too — value, compact, family, cleanup, and more — so you can
          match the right Amazon pick to your kitchen.
        </p>
      ) : null}

      <div className={compact ? "quick-picks-grid" : "product-grid"}>
        {products.map((product, index) => (
          <article
            className={compact ? "quick-pick-card" : "product-card"}
            id={product.slotId}
            key={product.trackingKey}
          >
            <div className="product-card-topline">
              <span className="rank-badge">#{product.rank ?? index + 1}</span>
              <span
                className={`pick-label ${
                  /best overall/i.test(product.slotLabel)
                    ? "pick-label-best-overall"
                    : /best value|best budget/i.test(product.slotLabel)
                    ? "pick-label-best-value"
                    : /best premium/i.test(product.slotLabel)
                    ? "pick-label-best-premium"
                    : ""
                }`}
              >
                {product.slotLabel}
              </span>
              {product.editorialScore !== null &&
              product.editorialScore !== undefined ? (
                <span className="score-badge">
                  {product.editorialScore}/10
                </span>
              ) : null}
            </div>

            <ProductImage
              src={product.imageUrl}
              alt={product.imageAlt || product.productName}
              width={product.imageWidth}
              height={product.imageHeight}
            />

            <div className="product-card-copy">
              <h3>{product.productName}</h3>
              {product.bestFor ? (
                <p className="best-for">
                  <strong>Best for:</strong> {product.bestFor}
                </p>
              ) : null}
              {product.shortVerdict ? <p className="short-verdict">{product.shortVerdict}</p> : null}

              {!compact && product.keySpecs?.length ? (
                <div className="key-specs-pills">
                  <strong>Product specs:</strong>
                  <div className="spec-pills-container">
                    {product.keySpecs.map((spec) => (
                      <span key={spec} className="spec-pill">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {!compact && product.pros?.length ? (
                <div className="mini-list positive-list">
                  <strong>About this item (Key features)</strong>
                  <ul>
                    {product.pros.map((pro) => (
                      <li key={pro}>✓ {pro}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!compact && product.cons?.length ? (
                <div className="mini-list caution-list">
                  <strong>Consider before buying</strong>
                  <ul>
                    {product.cons.map((con) => (
                      <li key={con}>✕ {con}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!compact && (product.buyIf || product.skipIf) ? (
                <div className="who-should-buy">
                  {product.buyIf ? (
                    <p>
                      <strong>Buy if:</strong> {product.buyIf}
                    </p>
                  ) : null}
                  {product.skipIf ? (
                    <p>
                      <strong>Skip if:</strong> {product.skipIf}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <AmazonLink
              asin={product.asin}
              pageId={pageId}
              productName={product.productName}
              placement={`${compact ? "quick" : "detail"}-${product.slotId}`}
            >
              Check today&apos;s price on Amazon
            </AmazonLink>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SingleProductCard({
  pageId,
  product,
  index = 0,
}: {
  pageId: string;
  product: ProductLink;
  index?: number;
}) {
  return (
    <article
      className="product-card product-card-inline"
      id={product.slotId}
      key={product.trackingKey}
    >
      <div className="product-card-topline">
        <span className="rank-badge">#{product.rank ?? index + 1}</span>
        <span
          className={`pick-label ${
            /best overall/i.test(product.slotLabel)
              ? "pick-label-best-overall"
              : /best value|best budget/i.test(product.slotLabel)
              ? "pick-label-best-value"
              : /best premium/i.test(product.slotLabel)
              ? "pick-label-best-premium"
              : ""
          }`}
        >
          {product.slotLabel}
        </span>
        {product.editorialScore !== null &&
        product.editorialScore !== undefined ? (
          <span className="score-badge">{product.editorialScore}/10</span>
        ) : null}
      </div>

      <ProductImage
        src={product.imageUrl}
        alt={product.imageAlt || product.productName}
        width={product.imageWidth}
        height={product.imageHeight}
      />

      <div className="product-card-copy">
        <h3>{product.productName}</h3>
        {product.bestFor ? (
          <p className="best-for">
            <strong>Best for:</strong> {product.bestFor}
          </p>
        ) : null}
        {product.shortVerdict ? <p>{product.shortVerdict}</p> : null}

        {product.keySpecs?.length ? (
          <p className="key-specs">
            <strong>Key details:</strong> {product.keySpecs.slice(0, 4).join(" · ")}
          </p>
        ) : null}

        {product.pros?.length ? (
          <div className="mini-list positive-list">
            <strong>What stands out</strong>
            <ul>
              {product.pros.slice(0, 3).map((pro) => (
                <li key={pro}>✓ {pro}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {product.cons?.length ? (
          <div className="mini-list caution-list">
            <strong>Consider before buying</strong>
            <ul>
              {product.cons.slice(0, 2).map((con) => (
                <li key={con}>✕ {con}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {product.buyIf || product.skipIf ? (
          <div className="who-should-buy">
            {product.buyIf ? (
              <p>
                <strong>Buy if:</strong> {product.buyIf}
              </p>
            ) : null}
            {product.skipIf ? (
              <p>
                <strong>Skip if:</strong> {product.skipIf}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <AmazonLink
        asin={product.asin}
        pageId={pageId}
        productName={product.productName}
        placement={`inline-${product.slotId}`}
      >
        Check today&apos;s price on Amazon
      </AmazonLink>
    </article>
  );
}
