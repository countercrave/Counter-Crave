import { AmazonLink } from "@/components/AmazonLink";
import { ProductImage } from "@/components/ProductImage";
import type { ProductLink } from "@/types/content";

type ProductCardsProps = {
  pageId: string;
  products: ProductLink[];
  /** Max full-detail reviews shown (all products by default). */
  detailLimit?: number;
  /** Accepted for older call sites; full cards always render. */
  compact?: boolean;
};

const DETAIL_LIMIT_DEFAULT = 100;

function displayName(product: ProductLink) {
  return product.productName.split("|")[0].trim();
}

/** Turn freeform or "Label: value" specs into clean table rows. */
function parseSpecRow(spec: string): { label: string; value: string } {
  const trimmed = spec.replace(/\s+/g, " ").trim();
  if (!trimmed) return { label: "Detail", value: "—" };

  const labeled = trimmed.match(/^([^:—|]{2,42})\s*[:—]\s*(.+)$/);
  if (labeled) {
    return {
      label: labeled[1].trim(),
      value: labeled[2].trim() || "—",
    };
  }

  if (
    /capacity|\bcups?\b|\bcup\b|\bl\b|\bliter/i.test(trimmed) &&
    /\d/.test(trimmed)
  ) {
    return { label: "Capacity", value: trimmed };
  }
  if (/\d+\s*V|\d[\d,]*\s*W\b|watts?/i.test(trimmed)) {
    return { label: "Power", value: trimmed };
  }
  if (/nonstick|ceramic|coating|inner pan|inner pot|\bmm\b/i.test(trimmed)) {
    return { label: "Cookware", value: trimmed };
  }
  if (
    /heater|heating|induction|micom|fuzzy|neuro|pressure|ih\b/i.test(trimmed)
  ) {
    return { label: "Heating", value: trimmed };
  }
  if (/timer|delay|clock|lcd|control|one-touch|digital/i.test(trimmed)) {
    return { label: "Controls", value: trimmed };
  }
  if (
    /keep-?warm|reheat|modes?|menu|steam|multi-cook|porridge/i.test(trimmed)
  ) {
    return { label: "Features", value: trimmed };
  }
  if (
    /includes?|accessories|spatula|measuring|basket|lid|vent|cord/i.test(
      trimmed,
    )
  ) {
    return { label: "Includes", value: trimmed };
  }
  if (/^\d+(\.\d+)?\s*-\s*cup/i.test(trimmed) || /^\d+(\.\d+)?\s*cup/i.test(trimmed)) {
    return { label: "Capacity", value: trimmed };
  }

  return { label: "Feature", value: trimmed };
}

function SpecTable({ specs }: { specs: string[] }) {
  const rows = specs
    .map((spec) => parseSpecRow(spec))
    .filter((row) => row.value && row.value !== "—");

  if (!rows.length) return null;

  return (
    <div className="product-info-table-wrap">
      <strong>Product information</strong>
      <table className="product-info-table">
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${row.value}-${index}`}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function analysisParagraphs(product: ProductLink): string[] {
  const paragraphs: string[] = [];
  const verdict = product.shortVerdict?.trim();
  if (verdict) paragraphs.push(verdict);

  if (product.keySpecs?.length) {
    const highlight = product.keySpecs
      .slice(0, 3)
      .map((spec) => spec.trim())
      .filter(Boolean)
      .join("; ");
    if (highlight) {
      paragraphs.push(`Worth noting on this model: ${highlight}.`);
    }
  }

  return [...new Set(paragraphs)].slice(0, 5);
}

/** Format "LABEL: detail" with strong uppercase label. */
function formatLabeledText(text: string) {
  const clean = text
    .replace(/â€“|â€”/g, "–")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .trim();
  const match = clean.match(/^([^:]{2,48}):\s*(.+)$/);
  if (match) {
    return (
      <>
        <strong className="about-item-label">{match[1].toUpperCase()}:</strong>{" "}
        {match[2]}
      </>
    );
  }
  return <>{clean}</>;
}

/** Highlight "LABEL:" prefixes in About-this-item bullets. */
function LabeledBullet({ text }: { text: string }) {
  return <li>{formatLabeledText(text)}</li>;
}

function DetailedProductCard({
  pageId,
  product,
  index,
  showEditorsPick,
}: {
  pageId: string;
  product: ProductLink;
  index: number;
  showEditorsPick: boolean;
}) {
  const name = displayName(product);
  const isHub = pageId.endsWith("-HUB") || pageId.endsWith("-pil") || pageId.toLowerCase().includes("hub");
  const rank = isHub ? index + 1 : (product.rank ?? index + 1);
  const analysis = analysisParagraphs(product);
  const about = (product.aboutThisItem || []).filter(Boolean);
  const pros = (product.pros || []).filter(Boolean);
  const cons = (product.cons || []).filter(Boolean);
  const chips = (product.comparisonChips || []).filter(Boolean);
  const vsCompetitor = product.vsCompetitor?.trim() || "";
  const bestForQuote = product.bestFor?.trim().replace(/\.$/, "") || "";
  const comparisonScore =
    product.comparisonScore != null ? Number(product.comparisonScore) : null;
  const editorialScore =
    product.editorialScore != null ? Number(product.editorialScore) : null;
  // Prefer sheet Comparison Score mapped to /10; fall back to editorialScore.
  const score =
    comparisonScore != null && !Number.isNaN(comparisonScore)
      ? Number((comparisonScore / 10).toFixed(1))
      : editorialScore != null && !Number.isNaN(editorialScore)
        ? editorialScore
        : null;
  const listPrice = product.listPrice?.trim() || "";
  const amazonRating = product.amazonRating?.trim() || "";
  const ratingCount = product.ratingCount?.trim() || "";
  const hasMarketplaceSnapshot = Boolean(
    listPrice || amazonRating || ratingCount,
  );

  return (
    <article
      className="listicle-product-card"
      id={product.slotId}
      key={product.trackingKey}
    >
      <h3 className="listicle-product-heading">{name}</h3>

      <div className="product-card-subhead">
        <span className="product-rank-mark" aria-label={`Rank ${rank}`}>
          #{rank}
        </span>
        {showEditorsPick ? (
          <span className="editors-pick-ribbon">Editor&apos;s Pick</span>
        ) : null}
      </div>

      {bestForQuote ? (
        <p className="product-best-for-quote">
          <span className="product-best-for-mark" aria-hidden="true">
            “
          </span>
          {bestForQuote}
          <span className="product-best-for-mark" aria-hidden="true">
            ”
          </span>
        </p>
      ) : null}

      {vsCompetitor ? (
        <p className="product-vs-competitor">
          <strong>Vs closest peer:</strong> {vsCompetitor}
        </p>
      ) : null}

      {chips.length ? (
        <ul className="product-comparison-chips" aria-label="Key comparison points">
          {chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      ) : null}

      <div className="listicle-image-container">
        <ProductImage
          src={product.imageUrl}
          alt={product.imageAlt || name}
          asin={product.asin}
          width={product.imageWidth}
          height={product.imageHeight}
        />
      </div>

      <div className="listicle-cta-row">
        <AmazonLink
          asin={product.asin}
          pageId={pageId}
          productName={name}
          placement={`detail-${product.slotId}`}
          hrefOverride={product.affiliateUrl}
          className="button button-primary listicle-amazon-button"
        >
          Buy Now
        </AmazonLink>
        {score != null ? (
          <div
            className="product-score-meter"
            title={`Comparison score ${score} out of 10`}
            aria-label={`Comparison score ${score} out of 10`}
          >
            <div className="product-score-meter-copy">
              <span className="product-score-meter-label">Our score</span>
              <span className="product-score-meter-value">
                {score}
                <span className="product-score-meter-denom">/10</span>
              </span>
            </div>
            <div className="product-score-meter-track" aria-hidden="true">
              <span
                className="product-score-meter-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, score * 10))}%`,
                }}
              />
            </div>
          </div>
        ) : null}
      </div>



      {product.keySpecs?.length ? <SpecTable specs={product.keySpecs} /> : null}

      {analysis.length ? (
        <div className="product-analysis">
          {analysis.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      <div className="product-card-copy">
        {about.length ? (
          <div className="mini-list about-item-list">
            <strong>About this item</strong>
            <ul>
              {about.map((item) => (
                <LabeledBullet key={item} text={item} />
              ))}
            </ul>
          </div>
        ) : null}

        {pros.length ? (
          <div className="mini-list pros-list">
            <strong>Pros</strong>
            <ul>
              {pros.map((pro) => (
                <li key={pro}>
                  <span className="list-icon list-icon-pro" aria-hidden="true">
                    ✓
                  </span>
                  <span className="pros-text">{formatLabeledText(pro)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {cons.length ? (
          <div className="mini-list cons-list">
            <strong>Cons</strong>
            <ul>
              {cons.map((con) => (
                <li key={con}>
                  <span className="list-icon list-icon-con" aria-hidden="true">
                    ✕
                  </span>
                  <span>{con.replace(/â€“|â€”/g, "–").replace(/â€™/g, "'")}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {product.buyIf ? (
          <p className="buy-if-line">
            <strong>Buy if:</strong>{" "}
            {product.buyIf.replace(/â€“|â€”/g, "–").replace(/â€™/g, "'")}
          </p>
        ) : null}
        {product.skipIf ? (
          <p className="skip-if-line">
            <strong>Skip if:</strong>{" "}
            {product.skipIf.replace(/â€“|â€”/g, "–").replace(/â€™/g, "'")}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Full listicle cards for every product on the page.
 * compact=true renders a 3-card Top picks grid (no duplicate full reviews).
 */
export function ProductCards({
  pageId,
  products,
  detailLimit = DETAIL_LIMIT_DEFAULT,
  compact = false,
}: ProductCardsProps) {
  if (!products.length) return null;

  if (compact) {
    const picks = products.slice(0, Math.min(3, products.length));
    return (
      <section id="top-picks" aria-labelledby="top-picks-heading">
        <h2 id="top-picks-heading">Top picks</h2>
        <p className="section-intro">
          Our three highest Comparison Score picks — jump to the full review
          below or check today&apos;s Amazon offer.
        </p>
        <ol className="top-picks-grid">
          {picks.map((product, index) => {
            const name = displayName(product);
            const isHub = pageId.endsWith("-HUB") || pageId.endsWith("-pil") || pageId.toLowerCase().includes("hub");
            const rank = isHub ? index + 1 : (product.rank ?? index + 1);
            const comparisonScore =
              product.comparisonScore != null
                ? Number(product.comparisonScore)
                : null;
            const editorialScore =
              product.editorialScore != null
                ? Number(product.editorialScore)
                : null;
            const score =
              comparisonScore != null && !Number.isNaN(comparisonScore)
                ? Number((comparisonScore / 10).toFixed(1))
                : editorialScore != null && !Number.isNaN(editorialScore)
                  ? editorialScore
                  : null;
            const bestFor = product.bestFor?.trim().replace(/\.$/, "") || "";
            const listPrice = product.listPrice?.trim() || "";

            return (
              <li
                key={product.trackingKey}
                className={`top-pick-card${index === 0 ? " top-pick-card-lead" : ""}`}
              >
                <div className="top-pick-card-topline">
                  <span className="top-pick-card-rank" aria-label={`Rank ${rank}`}>
                    #{rank}
                  </span>
                  {index === 0 ? (
                    <span className="top-pick-card-badge">Best overall</span>
                  ) : product.slotLabel ? (
                    <span className="top-pick-card-badge top-pick-card-badge-muted">
                      {product.slotLabel}
                    </span>
                  ) : null}
                  {score != null ? (
                    <span className="top-pick-card-score">{score}/10</span>
                  ) : null}
                </div>

                <a href={`#${product.slotId}`} className="top-pick-card-media">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.imageAlt || name}
                    asin={product.asin}
                    width={product.imageWidth}
                    height={product.imageHeight}
                  />
                </a>

                <div className="top-pick-card-body">
                  <h3 className="top-pick-card-title">
                    <a href={`#${product.slotId}`}>{name}</a>
                  </h3>
                  {bestFor ? (
                    <p className="top-pick-card-bestfor">{bestFor}</p>
                  ) : null}
                </div>

                <div className="top-pick-card-actions">
                  <AmazonLink
                    asin={product.asin}
                    pageId={pageId}
                    productName={name}
                    placement={`top-${product.slotId}`}
                    hrefOverride={product.affiliateUrl}
                    className="button button-primary top-pick-card-cta"
                  >
                    Buy Now
                  </AmazonLink>
                  <a href={`#${product.slotId}`} className="top-pick-card-link">
                    Full review
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  const detailed = products.slice(0, detailLimit);

  return (
    <section
      id="recommended-picks"
      aria-labelledby="recommended-picks-heading"
    >
      <h2 id="recommended-picks-heading">Detailed product reviews</h2>
      <p className="section-intro">
        Full reviews for all {detailed.length} picks on this page — specs,
        features, trade-offs, and who each model is for.
      </p>

      <div className="listicle-product-list">
        {detailed.map((product, index) => (
          <DetailedProductCard
            key={product.trackingKey}
            pageId={pageId}
            product={product}
            index={index}
            showEditorsPick={index === 0}
          />
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
    <DetailedProductCard
      pageId={pageId}
      product={product}
      index={index}
      showEditorsPick={index === 0}
    />
  );
}
