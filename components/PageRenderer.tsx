import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { AmazonLink } from "@/components/AmazonLink";
import { AuthorBio } from "@/components/AuthorBio";
import { BrandProfiles } from "@/components/BrandProfiles";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCards } from "@/components/ProductCards";
import { ProductImage } from "@/components/ProductImage";
import { RelatedContent } from "@/components/RelatedContent";
import { TableOfContents } from "@/components/TableOfContents";
import { TrustPanel } from "@/components/TrustPanel";
import { headingId } from "@/lib/headings";
import { getProductsForPage } from "@/lib/products";
import type { ContentPage } from "@/types/content";
import Link from "next/link";

type PageRendererProps = {
  page: ContentPage;
  relatedPages: ContentPage[];
};

const affiliateTypes = new Set([
  "Commercial Pillar",
  "Roundup",
  "Accessory Roundup",
  "Single Review",
  "Comparison",
  "Category Hub",
]);

/**
 * Wide article shell:
 * - left sticky TOC
 * - right main column (verdict → top picks → table → full 20-product listicle → guide copy → FAQ)
 * Amazon customer reviews/ratings are NOT scraped or republished (Associates policy).
 * Each product CTA can open Amazon for live ratings.
 */
export function PageRenderer({
  page,
  relatedPages,
}: PageRendererProps) {
  const products = getProductsForPage(page.pageId, page.cluster);
  const brandProfiles = page.brandProfiles || [];
  const hasBrandProfiles = brandProfiles.length > 0;
  const showDisclosure =
    affiliateTypes.has(page.pageType) || products.length > 0 || hasBrandProfiles;
  const hasFaqs = Boolean(page.faqs?.length);
  const quickPicks = products.slice(0, 3);
  const croMode = Boolean(page.croOptimized || page.funnel === "Ads");
  const topProduct = products[0] || null;
  const topName = topProduct
    ? topProduct.productName.split("|")[0].trim()
    : "";

  return (
    <main className="container-wide main-content">
      <Breadcrumbs title={page.title} />

      {page.draft ? (
        <aside className="draft-notice">
          <strong>Local editorial draft:</strong> this page is excluded from
          production, indexing and the sitemap until the content, evidence and
          required products pass validation.
        </aside>
      ) : null}

      <div className="content-layout content-layout-wide">
        <aside className="content-sidebar">
          <TableOfContents
            sections={page.sections || []}
            hasProducts={!hasBrandProfiles && products.length > 0}
            hasBrandProfiles={hasBrandProfiles}
            brandNames={brandProfiles.map((profile) => profile.brand)}
            hasFaqs={hasFaqs}
            collectionPath={page.collectionPath}
          />
        </aside>

        <article className="article-shell article-main-column">
          <header className="article-hero">
            <div>
              <span className="eyebrow">{page.cluster}</span>
              <h1>{page.title}</h1>
              <p className="dek">{page.description}</p>

              <div className="article-meta">
                <span>By {page.author || "Navjeet Kamboj"}</span>
                {page.reviewer ? (
                  <span>Reviewed by {page.reviewer}</span>
                ) : null}
                {page.updatedAt ? <span>Updated {page.updatedAt}</span> : null}
              </div>
            </div>

          </header>

          {page.heroImage ? (
            <div className="featured-hero-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.heroImage}
                alt={page.heroImageAlt || page.title}
                className="featured-hero-image"
                width={1200}
                height={600}
                loading="eager"
              />
            </div>
          ) : null}

          {showDisclosure ? <AffiliateDisclosure /> : null}

          {page.summary ? (
            <section className="answer-box" aria-label="Quick verdict">
              <span className="answer-label">Quick verdict</span>
              <p>{page.summary}</p>
            </section>
          ) : null}

          {croMode && topProduct ? (
            <section className="cro-deal-strip" aria-label="Top pick Buy Now">
              <div className="cro-deal-strip-media">
                <ProductImage
                  src={topProduct.imageUrl}
                  alt={topProduct.imageAlt || topName}
                  width={topProduct.imageWidth}
                  height={topProduct.imageHeight}
                />
              </div>
              <div className="cro-deal-strip-copy">
                <span className="cro-deal-kicker">Editor&apos;s #1 pick</span>
                <h2 className="cro-deal-title">{topName}</h2>
                {topProduct.bestFor ? (
                  <p className="cro-deal-bestfor">{topProduct.bestFor}</p>
                ) : null}
                <div className="cro-deal-meta">
                  {topProduct.listPrice ? (
                    <strong className="cro-deal-price">
                      {topProduct.listPrice}
                    </strong>
                  ) : null}
                  {topProduct.amazonRating ? (
                    <span>
                      ★ {topProduct.amazonRating}
                      {topProduct.ratingCount
                        ? ` (${topProduct.ratingCount} ratings)`
                        : ""}
                    </span>
                  ) : null}
                </div>
                <div className="cro-deal-actions">
                  <AmazonLink
                    asin={topProduct.asin}
                    pageId={page.pageId}
                    productName={topName}
                    placement="hero-buy-now"
                    hrefOverride={topProduct.affiliateUrl}
                    className="button button-primary cro-buy-now"
                  >
                    Buy Now on Amazon
                  </AmazonLink>
                  <a className="cro-secondary-link" href={`#${topProduct.slotId}`}>
                    See full review
                  </a>
                </div>
                <p className="cro-deal-note">
                  Price and availability can change — confirm on Amazon before
                  checkout.
                </p>
              </div>
            </section>
          ) : null}

          {page.collectionPath ? (
            <p className="collection-jump">
              <Link className="button button-primary" href={page.collectionPath}>
                Open product collections
              </Link>
            </p>
          ) : null}

          {!hasBrandProfiles && quickPicks.length ? (
            <ProductCards
              pageId={page.pageId}
              products={quickPicks}
              compact
            />
          ) : null}

          {hasBrandProfiles ? (
            <BrandProfiles
              pageId={page.pageId}
              profiles={brandProfiles}
              collectionPath={page.collectionPath}
            />
          ) : products.length ? (
            <ProductCards pageId={page.pageId} products={products} />
          ) : null}

          <div className="article">
            {(page.sections || []).map((section, index) => {
              const Heading = section.level === 3 ? "h3" : "h2";
              const hasContent =
                Boolean(section.paragraphs?.length) ||
                Boolean(section.bullets?.length);

              return (
                <section
                  id={headingId(section.heading)}
                  key={`${section.heading}-${index}`}
                  className="article-section"
                >
                  <Heading>{section.heading}</Heading>

                  {hasContent ? (
                    <>
                      {(section.paragraphs || []).map(
                        (paragraph, paragraphIndex) => (
                          <p key={paragraphIndex}>{paragraph}</p>
                        ),
                      )}

                      {section.bullets?.length ? (
                        <ul>
                          {section.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : null}
                </section>
              );
            })}

            <AuthorBio
              author={page.author || "Navjeet Kamboj"}
              reviewer={page.reviewer}
              updatedAt={page.updatedAt}
            />

            {hasFaqs ? (
              <section id="frequently-asked-questions">
                <div className="section-kicker">Common questions</div>
                <h2>Frequently asked questions</h2>
                <div className="faq-list">
                  {page.faqs?.map((faq) => (
                    <details key={faq.question}>
                      <summary>{faq.question}</summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>

      <RelatedContent pages={relatedPages} />

      {hasBrandProfiles ? (
        <a className="mobile-sticky-cta" href="#brand-profiles">
          View brand profiles
        </a>
      ) : croMode && topProduct ? (
        <div className="mobile-sticky-cta mobile-sticky-cta--buy">
          <AmazonLink
            asin={topProduct.asin}
            pageId={page.pageId}
            productName={topName}
            placement="sticky-buy-now"
            hrefOverride={topProduct.affiliateUrl}
            className="button button-primary sticky-buy-now-button"
          >
            Buy Now — {topName.split(" ").slice(0, 3).join(" ")}
          </AmazonLink>
        </div>
      ) : products.length ? (
        <a className="mobile-sticky-cta" href="#recommended-picks">
          View detailed picks
        </a>
      ) : null}
    </main>
  );
}
