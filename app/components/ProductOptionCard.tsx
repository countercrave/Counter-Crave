import type { Product } from "../data/site-data";

export function ProductOptionCard({
  product,
  label = "Also compare",
}: {
  product: Product;
  label?: string;
}) {
  const amazon = product.buyUrl.includes("amazon.com");

  return (
    <article className="option-card">
      <div className="option-card-media">
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <span>{label}</span>
      </div>
      <div className="option-card-copy">
        <h3>{product.name}</h3>
        <div className="option-specs" aria-label={`${product.name} key specifications`}>
          <span>{product.capacity}</span>
          <span>{product.format}</span>
        </div>
        <p><strong>Best fit:</strong> {product.bestFor}</p>
        <div className="pros-cons-grid pros-cons-compact">
          <div className="pros-list">
            <strong>Pros</strong>
            <ul>
              {product.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
          <div className="cons-list">
            <strong>Cons</strong>
            <ul>
              {product.cons.map((con) => <li key={con}>{con}</li>)}
            </ul>
          </div>
        </div>
        <div className="option-actions">
          <a
            className="button button-small"
            href={product.buyUrl}
            target="_blank"
            rel={amazon ? "sponsored nofollow noopener" : "noopener"}
          >
            {amazon ? "Check current offer" : "View product"}
          </a>
          <a className="source-link" href={product.sourceUrl} target="_blank" rel="noopener">
            Specs: {product.sourceName}
          </a>
        </div>
      </div>
    </article>
  );
}
