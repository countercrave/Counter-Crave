import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { AuthorBio } from "@/components/AuthorBio";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCards } from "@/components/ProductCards";
import { ProductComparisonTable } from "@/components/ProductComparisonTable";
import { RelatedContent } from "@/components/RelatedContent";
import { TableOfContents } from "@/components/TableOfContents";
import { TrustPanel } from "@/components/TrustPanel";
import { headingId } from "@/lib/headings";
import { getProductsForPage } from "@/lib/products";
import type { ContentPage } from "@/types/content";

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

export function PageRenderer({
  page,
  relatedPages,
}: PageRendererProps) {
  const products = getProductsForPage(page.pageId, page.cluster);
  const showDisclosure =
    affiliateTypes.has(page.pageType) || products.length > 0;
  const hasFaqs = Boolean(page.faqs?.length);
  const quickPicks = products.slice(0, 4);

  return (
    <main className="container main-content">
      <Breadcrumbs title={page.title} />

      {page.draft ? (
        <aside className="draft-notice">
          <strong>Local editorial draft:</strong> this page is excluded from
          production, indexing and the sitemap until the content, evidence and
          required products pass validation.
        </aside>
      ) : null}

      <article className="article-shell">
        <header className="article-hero">
          <div>
            <span className="eyebrow">
              {page.cluster} · {page.pageType}
            </span>
            <h1>{page.title}</h1>
            <p className="dek">{page.description}</p>

            <div className="article-meta">
              <span>By {page.author || "Navjeet Kamboj"}</span>
              {page.reviewer ? <span>Reviewed by {page.reviewer}</span> : null}
              {page.updatedAt ? <span>Updated {page.updatedAt}</span> : null}
            </div>
          </div>

          <div className="article-hero-panel">
            <span className="panel-label">What you will get</span>
            <ul>
              <li>Direct verdict and clear trade-offs</li>
              <li>Top picks with Amazon images at a glance</li>
              <li>Full specs, pros, cons and buy criteria</li>
              <li>Who should buy—and who should skip</li>
            </ul>
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

        <TrustPanel page={page} />

        {quickPicks.length ? (
          <ProductCards
            pageId={page.pageId}
            products={quickPicks}
            compact
          />
        ) : null}

        {products.length > 1 ? (
          <ProductComparisonTable
            pageId={page.pageId}
            products={products}
          />
        ) : null}

        {/* High-conversion placement: Detailed product cards with images right after table & quick picks */}
        {products.length ? (
          <ProductCards pageId={page.pageId} products={products} />
        ) : null}

        <div className="content-layout">
          <aside className="content-sidebar">
            <TableOfContents
              sections={page.sections || []}
              hasProducts={products.length > 0}
              hasFaqs={hasFaqs}
            />
          </aside>

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
        </div>
      </article>

      <RelatedContent pages={relatedPages} />

      {products.length ? (
        <a className="mobile-sticky-cta" href="#detailed-product-picks">
          Check Amazon picks
        </a>
      ) : null}
    </main>
  );
}
