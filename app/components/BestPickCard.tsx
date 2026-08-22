import type { GuidePick } from "../data/guide-data";
import type { Product } from "../data/site-data";
import type { SourceProduct } from "../data/source-products";
import { getSourceProductPresentation } from "./SourceProductCard";

export function CuratedBestPickCard({
  index,
  pick,
  product,
}: {
  index: number;
  pick: GuidePick;
  product: Product;
}) {
  const amazon = product.buyUrl.includes("amazon.com");
  return (
    <article className="best-pick-card" id={`pick-${index + 1}`}>
      <div className="best-pick-media">
        <span className="best-pick-number" aria-label={`Pick ${index + 1}`}>{index + 1}</span>
        <img src={product.image} alt={product.imageAlt} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
      </div>
      <div className="best-pick-copy">
        <span className="best-pick-award">{pick.award}</span>
        <h3>{product.name}</h3>
        <p>{pick.reason}</p>
        <div className="best-pick-facts">
          <span>{product.capacity}</span><span>{product.format}</span><span>{product.power}</span>
        </div>
        <div className="pros-cons-grid best-pick-pros-cons">
          <div className="pros-list"><strong>Pros</strong><ul>{product.features.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="cons-list"><strong>Cons</strong><ul>{product.cons.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
        <div className="best-pick-watchout"><strong>Main watchout</strong>{pick.watchout}</div>
        <a className="button best-pick-button" href={product.buyUrl} target="_blank" rel={amazon ? "sponsored nofollow noopener" : "noopener"}>
          {amazon ? "Check exact model" : "View official model"}<span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

export function SourceBestPickCard({
  index,
  pick,
  product,
}: {
  index: number;
  pick: GuidePick;
  product: SourceProduct;
}) {
  const presentation = getSourceProductPresentation(product);
  return (
    <article className="best-pick-card best-pick-card-source" id={`pick-${index + 1}`}>
      <div className="best-pick-media">
        <span className="best-pick-number" aria-label={`Pick ${index + 1}`}>{index + 1}</span>
        <img src={product.image} alt={`${product.title} real product image`} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
      </div>
      <div className="best-pick-copy">
        <span className="best-pick-award">{pick.award}</span>
        <h3>{product.title}</h3>
        <p>{pick.reason}</p>
        <div className="best-pick-facts">
          <span>{presentation.label}</span>
          {presentation.facts.slice(0, 2).map((fact) => <span key={fact}>{fact}</span>)}
          <span>ASIN {product.asin}</span>
        </div>
        <div className="pros-cons-grid best-pick-pros-cons">
          <div className="pros-list"><strong>Pros</strong><ul>{presentation.pros.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="cons-list"><strong>Cons</strong><ul>{presentation.cons.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
        <div className="best-pick-watchout"><strong>Main watchout</strong>{pick.watchout}</div>
        <a className="button best-pick-button" href={product.amazonUrl} target="_blank" rel="sponsored nofollow noopener">
          View exact ASIN <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
