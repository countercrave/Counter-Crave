import Link from "next/link";
import { AmazonLink } from "@/components/AmazonLink";
import { ProductImage } from "@/components/ProductImage";
import { headingId } from "@/lib/headings";
import type { BrandProfile } from "@/types/content";

type BrandProfilesProps = {
  pageId: string;
  profiles: BrandProfile[];
  collectionPath?: string | null;
};

export function BrandProfiles({
  pageId,
  profiles,
  collectionPath,
}: BrandProfilesProps) {
  if (!profiles.length) return null;

  return (
    <section id="brand-profiles" aria-labelledby="brand-profiles-heading">
      <h2 id="brand-profiles-heading">Brand profiles and flagship models</h2>
      <p className="section-intro">
        Each brand block shows a representative product plus the official brand
        mark. Browse the full evidence set in the{" "}
        {collectionPath ? (
          <Link href={collectionPath}>filterable brand collections</Link>
        ) : (
          "collections grid"
        )}
        .
      </p>

      <div className="brand-profile-list">
        {profiles.map((profile) => {
          const id = headingId(profile.brand);
          const product = profile.product;
          const hasAsin = Boolean(product.asin && /^[A-Z0-9]{10}$/i.test(product.asin));

          return (
            <article className="brand-profile-card" id={id} key={profile.brandSlug}>
              <header className="brand-profile-header">
                <div className="brand-profile-heading-wrap">
                  <span className="brand-profile-rank">#{profile.rank}</span>
                  <div>
                    <h3 className="brand-profile-name">{profile.brand}</h3>
                    {profile.award ? (
                      <p className="brand-profile-award">{profile.award}</p>
                    ) : null}
                  </div>
                </div>
                {profile.brandScore != null ? (
                  <div className="brand-profile-score" aria-label={`Brand score ${profile.brandScore}`}>
                    <span className="brand-profile-score-label">Brand score</span>
                    <strong>{profile.brandScore}</strong>
                  </div>
                ) : null}
              </header>

              <div className="brand-profile-media">
                <div className="brand-profile-product-shot">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    width={900}
                    height={900}
                  />
                  {profile.logoUrl ? (
                    <div className="brand-logo-badge" title={`${profile.brand} logo`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.logoUrl}
                        alt={`${profile.brand} logo`}
                        width={72}
                        height={72}
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="brand-profile-body">
                <h4 className="brand-profile-product-title">{product.name}</h4>
                {product.productType || product.capacity ? (
                  <p className="brand-profile-meta">
                    {[product.productType, product.capacity].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {profile.summary ? <p>{profile.summary}</p> : null}
                {product.why ? (
                  <p className="brand-profile-why">
                    <strong>Why this model:</strong> {product.why}
                  </p>
                ) : null}

                <div className="brand-profile-snapshot">
                  {product.listPrice ? (
                    <div>
                      <span>Price</span>
                      <strong>{product.listPrice}</strong>
                    </div>
                  ) : null}
                  {product.amazonRating ? (
                    <div>
                      <span>Amazon rating</span>
                      <strong>
                        ★ {product.amazonRating}
                        <small>/5</small>
                      </strong>
                    </div>
                  ) : null}
                  {product.ratingCount ? (
                    <div>
                      <span>Reviews</span>
                      <strong>{product.ratingCount}</strong>
                    </div>
                  ) : null}
                </div>

                {(profile.strengths?.length || profile.weaknesses?.length) ? (
                  <div className="brand-profile-lists">
                    {profile.strengths?.length ? (
                      <div>
                        <strong>Strengths</strong>
                        <ul>
                          {profile.strengths.slice(0, 4).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {profile.weaknesses?.length ? (
                      <div>
                        <strong>Watch-outs</strong>
                        <ul>
                          {profile.weaknesses.slice(0, 3).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="brand-profile-actions">
                  {hasAsin ? (
                    <AmazonLink
                      asin={product.asin}
                      pageId={pageId}
                      productName={product.name}
                      placement={`brand-${profile.brandSlug}`}
                      className="button button-primary"
                    >
                      Buy on Amazon
                    </AmazonLink>
                  ) : null}
                  {collectionPath ? (
                    <Link
                      href={`${collectionPath}?brand=${encodeURIComponent(profile.brandSlug)}`}
                      className="brand-profile-collection-link"
                    >
                      See {profile.brand} collection
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
